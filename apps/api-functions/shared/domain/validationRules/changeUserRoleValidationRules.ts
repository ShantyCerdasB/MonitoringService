/**
 * @file changeUserRoleValidationRules.ts
 * @summary Domain validation rules for change user role operations
 * @description Business rule validations for user role changes.
 */

import { User, UserRole } from "@prisma/client";
import { ExpectedError } from "../../middleware/errorHandler";
import { ChangeUserRoleMessages } from "../../constants/changeUserRoleMessages";

export class ChangeUserRoleValidationRules {
  /**
   * Validates that a user cannot change their own role.
   * @param currentUser - The user making the request
   * @param targetEmail - Email of the target user
   * @throws ExpectedError if user tries to change their own role
   */
  static validateNotSelfChange(currentUser: User, targetEmail: string): void {
    if (currentUser.email === targetEmail) {
      throw new ExpectedError(ChangeUserRoleMessages.CANNOT_CHANGE_OWN_ROLE, 400);
    }
  }

  /**
   * Validates that SuperAdmin role cannot be changed.
   * @param targetUser - The target user to validate
   * @throws ExpectedError if trying to change SuperAdmin role
   */
  static validateNotSuperAdminChange(targetUser: User): void {
    if (targetUser.role === UserRole.SuperAdmin) {
      throw new ExpectedError(ChangeUserRoleMessages.CANNOT_CHANGE_SUPERADMIN, 400);
    }
  }

  /**
   * Validates supervisor can only assign Employee role.
   * @param callerRole - Role of the user making the request
   * @param newRole - New role being assigned
   * @throws ExpectedError if supervisor tries to assign non-Employee role
   */
  static validateSupervisorRoleAssignment(callerRole: UserRole, newRole: UserRole | null): void {
    if (callerRole === UserRole.Supervisor && newRole !== UserRole.Employee) {
      throw new ExpectedError(ChangeUserRoleMessages.SUPERVISOR_LIMITED_ACCESS, 403);
    }
  }

  /**
   * Validates that the caller has sufficient permissions for the operation.
   * @param callerRole - Role of the user making the request
   * @param targetRole - Role of the target user
   * @param newRole - New role being assigned
   * @throws ExpectedError if caller lacks permissions
   */
  static validateCallerPermissions(
    callerRole: UserRole, 
    targetRole: UserRole, 
    newRole: UserRole | null
  ): void {
    // SuperAdmin can change any role
    if (callerRole === UserRole.SuperAdmin) {
      return;
    }

    // Admin can change any role except SuperAdmin
    if (callerRole === UserRole.Admin) {
      if (targetRole === UserRole.SuperAdmin) {
        throw new ExpectedError(ChangeUserRoleMessages.CANNOT_CHANGE_SUPERADMIN, 403);
      }
      return;
    }

    // Supervisor can only assign Employee role
    if (callerRole === UserRole.Supervisor) {
      if (newRole !== UserRole.Employee) {
        throw new ExpectedError(ChangeUserRoleMessages.SUPERVISOR_LIMITED_ACCESS, 403);
      }
      return;
    }

    // Employee cannot change roles
    throw new ExpectedError(ChangeUserRoleMessages.INSUFFICIENT_PERMISSIONS, 403);
  }

  /**
   * Validates that the role change is valid.
   * @param currentRole - Current role of the user
   * @param newRole - New role being assigned
   * @throws ExpectedError if role change is invalid
   */
  static validateRoleChange(currentRole: UserRole, newRole: UserRole | null): void {
    // Cannot change to the same role
    if (currentRole === newRole) {
      throw new ExpectedError("User already has this role", 400);
    }

    // Cannot change SuperAdmin role
    if (currentRole === UserRole.SuperAdmin) {
      throw new ExpectedError(ChangeUserRoleMessages.CANNOT_CHANGE_SUPERADMIN, 400);
    }
  }
}
