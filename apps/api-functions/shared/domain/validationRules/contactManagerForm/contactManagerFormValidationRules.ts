/**
 * @file contactManagerFormValidationRules.ts
 * @summary Domain validation rules for contact manager form operations
 * @description Business rule validations for contact manager form submissions.
 */

import { UserRole } from "@prisma/client";
import { ExpectedError } from "../../../middleware/errorHandler";
import { ContactManagerFormMessages } from "../../../constants/contactManagerFormMessages";

export class ContactManagerFormValidationRules {
  /**
   * Validates that only PSOs can submit contact manager forms.
   * @param userRole - Role of the user submitting the form
   * @throws ExpectedError if user is not a PSO
   */
  static validatePSOPermissions(userRole: UserRole): void {
    if (userRole !== UserRole.ContactManager) {
      throw new ExpectedError(ContactManagerFormMessages.INSUFFICIENT_PERMISSIONS, 403);
    }
  }

  /**
   * Validates that the user is active and not deleted.
   * @param user - The user submitting the form
   * @throws ExpectedError if user is deleted or inactive
   */
  static validateUserActive(user: any): void {
    if (!user) {
      throw new ExpectedError(ContactManagerFormMessages.USER_NOT_FOUND, 400);
    }
    
    if (user.deletedAt) {
      throw new ExpectedError(ContactManagerFormMessages.USER_NOT_FOUND, 400);
    }
  }

  /**
   * Validates image data if provided.
   * @param imageBase64 - Base64 encoded image data
   * @throws ExpectedError if image data is invalid
   */
  static validateImageData(imageBase64?: string): void {
    if (imageBase64 && imageBase64.length === 0) {
      throw new ExpectedError("Invalid image data provided", 400);
    }
  }

  /**
   * Validates form type specific requirements.
   * @param formType - Type of the form being submitted
   * @param data - Form data
   * @throws ExpectedError if form data is invalid for the type
   */
  static validateFormTypeRequirements(formType: string, data: any): void {
    switch (formType) {
      case "Disconnections":
        if (!data.rnName || !data.patientInitials || !data.timeOfDisconnection) {
          throw new ExpectedError("Missing required fields for Disconnections form", 400);
        }
        break;
      case "Admissions":
        if (!data.facility || !data.unit) {
          throw new ExpectedError("Missing required fields for Admissions form", 400);
        }
        break;
      case "Assistance":
        if (!data.facility || !data.patientInitials) {
          throw new ExpectedError("Missing required fields for Assistance form", 400);
        }
        break;
      default:
        throw new ExpectedError("Invalid form type", 400);
    }
  }
}
