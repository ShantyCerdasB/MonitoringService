/**
 * @file contactManagerManagementService.ts
 * @summary Business logic service for contact manager management operations
 * @description Handles contact manager creation with audit logging and Azure AD integration.
 */

import { User, ContactManagerStatus, UserRole } from "@prisma/client";
import { UserManagementRepository } from "../../repositories/userManagementRepo";
import { UserManagementValidationRules } from "../../domain/validationRules/userManagement";
import { UserManagementMessages } from "../../constants/userManagementMessages";
import { CreateContactManagerRequest, CreateContactManagerResult } from "../../schemas/userManagement";
import { logAudit, AuditAction, AuditEntity } from "../auditService";
import { getCostaRicanTimeISO } from "../../utils/timezone";

export class ContactManagerManagementService {
  /**
   * Creates a new contact manager with full validation and audit logging.
   * @param request - Contact manager creation request
   * @param caller - User creating the contact manager
   * @returns Result of the contact manager creation
   */
  static async createContactManager(
    request: CreateContactManagerRequest,
    caller: User
  ): Promise<CreateContactManagerResult> {
    const { email, status } = request;

    // 1. Validate business rules
    UserManagementValidationRules.validateCallerExists(caller);
    UserManagementValidationRules.validateContactManagerCreationPermissions(caller.role);
    UserManagementValidationRules.validateEmail(email);
    UserManagementValidationRules.validateNotSelfCreation(caller.email, email);

    // 2. Check if user already exists
    const existingUser = await UserManagementRepository.getUserByEmail(email);
    UserManagementValidationRules.validateUserNotAlreadyHasRole(existingUser, "ContactManager" as any);

    // 3. Find or create user from Azure AD
    const user = await UserManagementRepository.findOrCreateUserFromGraph(email, "ContactManager" as any);

    // 4. Assign Azure AD app role
    await UserManagementRepository.assignAzureADRole(user, "ContactManager" as any);

    // 5. Update user role in database
    const updatedUser = await UserManagementRepository.updateUserRole(user, "ContactManager" as any);

    // 6. Create contact manager profile
    const profile = await UserManagementRepository.createContactManagerProfile(updatedUser, status);

    // 7. Create audit log
    await logAudit({
      entity: AuditEntity.USER,
      entityId: updatedUser.id,
      action: AuditAction.CREATE,
      changedById: caller.id,
      dataBefore: existingUser ? {
        role: existingUser.role,
        email: existingUser.email,
        fullName: existingUser.fullName
      } : null,
      dataAfter: {
        role: UserRole.ContactManager,
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        status: status,
        timestamp: getCostaRicanTimeISO()
      }
    });

    return {
      id: profile.id,
      message: UserManagementMessages.CONTACT_MANAGER_CREATED,
      email: updatedUser.email,
      status: profile.status,
      createdAt: profile.createdAt
    };
  }

  /**
   * Deletes a contact manager with full validation and audit logging.
   * @param profileId - Contact manager profile ID
   * @param caller - User deleting the contact manager
   * @returns Result of the deletion
   */
  static async deleteContactManager(
    profileId: string,
    caller: User
  ): Promise<{ message: string; profileId: string }> {
    // 1. Validate business rules
    UserManagementValidationRules.validateCallerExists(caller);
    UserManagementValidationRules.validateContactManagerDeletionPermissions(caller.role);

    // 2. Get contact manager profile with user data
    const profileWithUser = await UserManagementRepository.getContactManagerProfile(profileId);
    UserManagementValidationRules.validateContactManagerExists(profileWithUser, profileId);

    const user = profileWithUser!.user;
    UserManagementValidationRules.validateNotSelfDeletion(caller.id, user.id);

    // 3. Revoke Azure AD app role
    await UserManagementRepository.assignAzureADRole(user, "ContactManager" as any);

    // 4. Delete profile and user
    await UserManagementRepository.deleteContactManager(profileId, user.id);

    // 5. Create audit log
    await logAudit({
      entity: AuditEntity.USER,
      entityId: user.id,
      action: AuditAction.DELETE,
      changedById: caller.id,
      dataBefore: {
        role: user.role,
        email: user.email,
        fullName: user.fullName,
        profileId: profileId,
        status: profileWithUser!.status
      },
      dataAfter: null
    });

    return {
      message: UserManagementMessages.CONTACT_MANAGER_DELETED,
      profileId: profileId
    };
  }
}
