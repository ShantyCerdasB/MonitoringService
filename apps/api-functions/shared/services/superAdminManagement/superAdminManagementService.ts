/**
 * @file superAdminManagementService.ts
 * @summary Business logic service for super admin management operations
 * @description Handles super admin creation with audit logging and Azure AD integration.
 */

import { User, UserRole } from "@prisma/client";
import { UserManagementRepository } from "../../repositories/userManagementRepo";
import { UserManagementValidationRules } from "../../domain/validationRules/userManagement";
import { UserManagementMessages } from "../../constants/userManagementMessages";
import { CreateSuperAdminRequest, CreateSuperAdminResult } from "../../schemas/userManagement";
import { logAudit, AuditAction, AuditEntity } from "../auditService";
import { getCostaRicanTimeISO } from "../../utils/timezone";

export class SuperAdminManagementService {
  /**
   * Creates a new super admin with full validation and audit logging.
   * @param request - Super admin creation request
   * @param caller - User creating the super admin
   * @returns Result of the super admin creation
   */
  static async createSuperAdmin(
    request: CreateSuperAdminRequest,
    caller: User
  ): Promise<CreateSuperAdminResult> {
    const { email } = request;

    // 1. Validate business rules
    UserManagementValidationRules.validateCallerExists(caller);
    UserManagementValidationRules.validateSuperAdminCreationPermissions(caller.role);
    UserManagementValidationRules.validateEmail(email);
    UserManagementValidationRules.validateNotSelfCreation(caller.email, email);

    // 2. Check if user already exists
    const existingUser = await UserManagementRepository.getUserByEmail(email);
    UserManagementValidationRules.validateUserNotAlreadyHasRole(existingUser, UserRole.SuperAdmin);

    // 3. Find or create user from Azure AD
    const user = await UserManagementRepository.findOrCreateUserFromGraph(email, UserRole.SuperAdmin);

    // 4. Assign Azure AD app role
    await UserManagementRepository.assignAzureADRole(user, UserRole.SuperAdmin);

    // 5. Update user role in database
    const updatedUser = await UserManagementRepository.updateUserRole(user, UserRole.SuperAdmin);

    // 6. Create audit log
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
        role: "SuperAdmin",
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        timestamp: getCostaRicanTimeISO()
      }
    });

    return {
      id: updatedUser.id,
      message: UserManagementMessages.SUPER_ADMIN_CREATED,
      email: updatedUser.email,
      role: updatedUser.role,
      createdAt: updatedUser.createdAt
    };
  }

  /**
   * Deletes a super admin with full validation and audit logging.
   * @param userId - Super admin user ID
   * @param caller - User deleting the super admin
   * @returns Result of the deletion
   */
  static async deleteSuperAdmin(
    userId: string,
    caller: User
  ): Promise<{ message: string; userId: string }> {
    // 1. Validate business rules
    UserManagementValidationRules.validateCallerExists(caller);
    UserManagementValidationRules.validateSuperAdminDeletionPermissions(caller.role);
    UserManagementValidationRules.validateNotSelfDeletion(caller.id, userId);

    // 2. Get super admin user
    const user = await UserManagementRepository.getUserByAzureAdObjectId(userId);
    UserManagementValidationRules.validateSuperAdminExists(user, userId);

    // 3. Check if this would be the last SuperAdmin
    const remainingCount = await UserManagementRepository.countSuperAdmins();
    UserManagementValidationRules.validateNotLastSuperAdmin(remainingCount);

    // 4. Revoke Azure AD app role
    await UserManagementRepository.assignAzureADRole(user!, UserRole.SuperAdmin);

    // 5. Delete super admin user
    await UserManagementRepository.deleteSuperAdmin(user!.id);

    // 6. Create audit log
    await logAudit({
      entity: AuditEntity.USER,
      entityId: user!.id,
      action: AuditAction.DELETE,
      changedById: caller.id,
      dataBefore: {
        role: user!.role,
        email: user!.email,
        fullName: user!.fullName
      },
      dataAfter: null
    });

    return {
      message: UserManagementMessages.SUPER_ADMIN_DELETED,
      userId: user!.id
    };
  }
}
