/**
 * @file contactManagerFormService.ts
 * @summary Business logic service for contact manager form operations
 * @description Handles contact manager form submission logic with image processing and chat integration.
 */

import { User } from "@prisma/client";
import { ContactManagerFormValidationRules } from "../../domain/validationRules/contactManagerForm";
import { ContactManagerFormMessages } from "../../constants/contactManagerFormMessages";
import { logAudit, AuditAction, AuditEntity } from "../auditService";
import { blobService } from "../blobStorageService";
import { contactManagersGroupService } from "../contactManagersGroupService";
import { ContactManagerFormRequest, ContactManagerFormResult } from "../../schemas/contactManagerForm";
import { getCostaRicanTimeISO } from "../../utils/timezone";
import prisma from "../prismaClienService";

export class ContactManagerFormService {
  /**
   * Submits a contact manager form with image processing and chat integration.
   * @param request - Contact manager form request data
   * @param currentUser - User submitting the form
   * @param authToken - Authorization token for chat operations
   * @returns Result of the form submission
   */
  static async submitForm(
    request: ContactManagerFormRequest,
    currentUser: User,
    authToken: string
  ): Promise<ContactManagerFormResult> {
    // 1. Validate business rules
    ContactManagerFormValidationRules.validatePSOPermissions(currentUser.role);
    ContactManagerFormValidationRules.validateUserActive(currentUser);
    ContactManagerFormValidationRules.validateImageData(request.imageBase64);
    ContactManagerFormValidationRules.validateFormTypeRequirements(request.formType, request);

    // 2. Process image if provided
    let imageUrl: string | null = null;
    if (request.imageBase64) {
      try {
        const buffer = Buffer.from(request.imageBase64, "base64");
        const path = `${new Date().toISOString().slice(0, 10)}/${currentUser.id}-${Date.now()}.jpg`;
        imageUrl = await blobService.uploadSnapshot(buffer, path);
      } catch (error) {
        throw new Error(ContactManagerFormMessages.IMAGE_UPLOAD_FAILED);
      }
    }

    // 3. Prepare form data for storage
    const formData = { ...request };
    delete (formData as any).imageBase64;
    delete (formData as any).formType;

    // 4. Persist form record
    const record = await prisma.contactManagerForm.create({
      data: {
        formType: request.formType,
        senderId: currentUser.id,
        imageUrl: imageUrl ?? undefined,
        data: formData,
      },
    });

    // 5. Sync contact managers group chat
    let chatId: string;
    try {
      chatId = await contactManagersGroupService.getOrSyncChat(authToken);
    } catch (error) {
      throw new Error(ContactManagerFormMessages.CHAT_SYNC_FAILED);
    }

    // 6. Build dynamic subject based on form type
    const subjectMap: Record<string, string> = {
      Disconnections: "🚨 Disconnections Report",
      Admissions: "🏥 Admissions Report",
      Assistance: "⚕️ Acute Assessment Report",
    };
    const subject = subjectMap[request.formType];

    // 7. Send message to contact managers chat
    try {
      await contactManagersGroupService.sendMessage(authToken, chatId, {
        subject,
        senderName: currentUser.fullName,
        formType: request.formType,
        data: formData,
        imageUrl: imageUrl ?? undefined,
      });
    } catch (error) {
      throw new Error(ContactManagerFormMessages.MESSAGE_SEND_FAILED);
    }

    // 8. Log audit action
    await logAudit({
      entity: AuditEntity.CONTACT_MANAGER,
      entityId: record.id,
      action: AuditAction.CREATE,
      changedById: currentUser.id,
      dataAfter: {
        formType: request.formType,
        senderId: currentUser.id,
        hasImage: !!imageUrl,
        timestamp: getCostaRicanTimeISO()
      }
    });

    return {
      formId: record.id,
      message: ContactManagerFormMessages.FORM_SUBMITTED_SUCCESSFULLY,
      submittedBy: currentUser.fullName,
      formType: request.formType,
      timestamp: getCostaRicanTimeISO()
    };
  }
}
