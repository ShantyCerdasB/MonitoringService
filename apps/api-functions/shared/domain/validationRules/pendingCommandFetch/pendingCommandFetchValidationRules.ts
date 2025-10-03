/**
 * @fileoverview PendingCommandFetchValidationRules - Business validation rules for pending command fetch
 * @summary Domain-specific validation rules for pending command fetch operations
 * @description Contains all business rule validations for pending command fetch functionality
 */

import { User, UserRole } from "@prisma/client";
import { ExpectedError } from "../../../middleware/errorHandler";
import { PendingCommandFetchMessages } from "../../../constants/pendingCommandFetchMessages";

export class PendingCommandFetchValidationRules {
  /**
   * Validates that only employees can fetch pending commands.
   * @param callerRole - Role of the user fetching commands
   * @throws ExpectedError if caller lacks permissions
   */
  static validateEmployeePermissions(callerRole: UserRole): void {
    if (callerRole !== UserRole.Employee) {
      throw new ExpectedError(PendingCommandFetchMessages.INSUFFICIENT_PERMISSIONS, 403);
    }
  }

  /**
   * Validates that the user exists and is not deleted.
   * @param user - The user making the request
   * @throws ExpectedError if user not found or deleted
   */
  static validateUserExists(user: User | null): void {
    if (!user) {
      throw new ExpectedError(PendingCommandFetchMessages.USER_NOT_FOUND, 404);
    }
  }

  /**
   * Validates that the user is not deleted.
   * @param user - The user making the request
   * @throws ExpectedError if user is deleted
   */
  static validateUserNotDeleted(user: User): void {
    if (user.deletedAt) {
      throw new ExpectedError(PendingCommandFetchMessages.USER_NOT_FOUND, 404);
    }
  }
}
