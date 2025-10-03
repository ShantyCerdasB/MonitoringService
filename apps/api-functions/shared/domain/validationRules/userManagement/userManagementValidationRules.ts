/**
 * @file userManagementValidationRules.ts
 * @summary Domain validation rules for user management operations
 * @description Business rule validations for user management operations.
 */

import { User, UserRole } from "@prisma/client";
import { ExpectedError } from "../../../middleware/errorHandler";
import { UserManagementMessages } from "../../../constants/userManagementMessages";

export class UserManagementValidationRules {
  /**
   * Validates that only Admin or SuperAdmin can create Contact Managers.
   * @param callerRole - Role of the user creating the contact manager
   * @throws ExpectedError if caller lacks permissions
   */
  static validateContactManagerCreationPermissions(callerRole: UserRole): void {
    const allowedRoles = [UserRole.Admin, UserRole.SuperAdmin];
    
    if (!allowedRoles.includes(callerRole as any)) {
      throw new ExpectedError(UserManagementMessages.INSUFFICIENT_PERMISSIONS, 403);
    }
  }

  /**
   * Validates that only SuperAdmin can create other SuperAdmins.
   * @param callerRole - Role of the user creating the super admin
   * @throws ExpectedError if caller lacks permissions
   */
  static validateSuperAdminCreationPermissions(callerRole: UserRole): void {
    if (callerRole !== UserRole.SuperAdmin) {
      throw new ExpectedError(UserManagementMessages.INSUFFICIENT_PERMISSIONS, 403);
    }
  }

  /**
   * Validates that the caller exists and is active.
   * @param caller - The user making the request
   * @throws ExpectedError if caller is not found or inactive
   */
  static validateCallerExists(caller: User | null): void {
    if (!caller) {
      throw new ExpectedError(UserManagementMessages.CALLER_NOT_FOUND, 400);
    }
    
    if (caller.deletedAt) {
      throw new ExpectedError(UserManagementMessages.CALLER_NOT_FOUND, 400);
    }
  }

  /**
   * Validates that the target user exists in Azure AD.
   * @param graphUser - User from Azure AD
   * @param email - Email being searched
   * @throws ExpectedError if user not found in Azure AD
   */
  static validateUserExistsInAzureAD(graphUser: any, email: string): void {
    if (!graphUser) {
      throw new ExpectedError(UserManagementMessages.USER_NOT_FOUND_IN_AZURE, 400);
    }
  }

  /**
   * Validates that the target user is not already a Contact Manager.
   * @param existingUser - Existing user from database
   * @param targetRole - Role being assigned
   * @throws ExpectedError if user already has the role
   */
  static validateUserNotAlreadyHasRole(existingUser: User | null, targetRole: UserRole): void {
    if (existingUser && existingUser.role === targetRole) {
      const message = targetRole === UserRole.ContactManager 
        ? UserManagementMessages.CONTACT_MANAGER_ALREADY_EXISTS
        : UserManagementMessages.SUPER_ADMIN_ALREADY_EXISTS;
      throw new ExpectedError(message, 400);
    }
  }

  /**
   * Validates email format and business rules.
   * @param email - Email to validate
   * @throws ExpectedError if email is invalid
   */
  static validateEmail(email: string): void {
    if (!email || !email.includes('@')) {
      throw new ExpectedError(UserManagementMessages.INVALID_EMAIL_FORMAT, 400);
    }
  }

  /**
   * Validates that the caller is not trying to create themselves.
   * @param callerEmail - Email of the caller
   * @param targetEmail - Email of the target user
   * @throws ExpectedError if caller is trying to create themselves
   */
  static validateNotSelfCreation(callerEmail: string, targetEmail: string): void {
    if (callerEmail.toLowerCase() === targetEmail.toLowerCase()) {
      throw new ExpectedError("Cannot create yourself", 400);
    }
  }

  /**
   * Validates that only Admin or SuperAdmin can delete Contact Managers.
   * @param callerRole - Role of the user deleting the contact manager
   * @throws ExpectedError if caller lacks permissions
   */
  static validateContactManagerDeletionPermissions(callerRole: UserRole): void {
    const allowedRoles = [UserRole.Admin, UserRole.SuperAdmin];
    
    if (!allowedRoles.includes(callerRole as any)) {
      throw new ExpectedError(UserManagementMessages.INSUFFICIENT_PERMISSIONS, 403);
    }
  }

  /**
   * Validates that only SuperAdmin can delete other SuperAdmins.
   * @param callerRole - Role of the user deleting the super admin
   * @throws ExpectedError if caller lacks permissions
   */
  static validateSuperAdminDeletionPermissions(callerRole: UserRole): void {
    if (callerRole !== UserRole.SuperAdmin) {
      throw new ExpectedError(UserManagementMessages.INSUFFICIENT_PERMISSIONS, 403);
    }
  }

  /**
   * Validates that the contact manager profile exists.
   * @param profile - Contact manager profile
   * @param profileId - ID of the profile being deleted
   * @throws ExpectedError if profile not found
   */
  static validateContactManagerExists(profile: any, profileId: string): void {
    if (!profile) {
      throw new ExpectedError(UserManagementMessages.CONTACT_MANAGER_NOT_FOUND, 404);
    }
  }

  /**
   * Validates that the super admin exists.
   * @param user - Super admin user
   * @param userId - ID of the user being deleted
   * @throws ExpectedError if user not found
   */
  static validateSuperAdminExists(user: any, userId: string): void {
    if (!user) {
      throw new ExpectedError(UserManagementMessages.SUPER_ADMIN_NOT_FOUND, 404);
    }
  }

  /**
   * Validates that the user is not trying to delete themselves.
   * @param callerId - ID of the caller
   * @param targetId - ID of the target user
   * @throws ExpectedError if caller is trying to delete themselves
   */
  static validateNotSelfDeletion(callerId: string, targetId: string): void {
    if (callerId === targetId) {
      throw new ExpectedError("Cannot delete yourself", 400);
    }
  }

  /**
   * Validates that there are other SuperAdmins before deleting.
   * @param remainingCount - Number of remaining SuperAdmins
   * @throws ExpectedError if this would be the last SuperAdmin
   */
  static validateNotLastSuperAdmin(remainingCount: number): void {
    if (remainingCount <= 1) {
      throw new ExpectedError(UserManagementMessages.CANNOT_DELETE_LAST_SUPER_ADMIN, 400);
    }
  }
}
