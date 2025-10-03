/**
 * @file changeUserRoleService.ts
 * @summary Business logic service for change user role operations
 * @description Handles user role change logic with Azure AD synchronization and rollback support.
 */

import { User, UserRole } from "@prisma/client";
import { ChangeUserRoleValidationRules } from "../../domain/validationRules";
import { ChangeUserRoleMessages, ChangeUserRoleStatus, AzureADRetryStatus } from "../../constants/changeUserRoleMessages";
import { logAudit, AuditAction, AuditEntity } from "../auditService";
import { upsertUserRole, deleteUserByEmail, getUserByEmail } from "../userService";
import { setUserOffline } from "../presenceService";
import { getGraphToken, getServicePrincipalObjectId, removeAllAppRolesFromPrincipalOnSp, assignAppRoleToPrincipal } from "../graphService";
import { UserSyncService } from "../userSync";
import axios from "axios";

export interface ChangeUserRoleRequest {
  userEmail: string;
  newRole: UserRole | null;
}

export interface ChangeUserRoleResult {
  message: string;
  status: ChangeUserRoleStatus;
  userEmail: string;
  previousRole?: UserRole;
  newRole?: UserRole | null;
  azureADUpdated: boolean;
  rollbackRequired: boolean;
}

export class ChangeUserRoleService {
  /**
   * Changes user role with Azure AD synchronization and rollback support.
   * @param request - Change user role request data
   * @param currentUser - User making the request
   * @returns Result of the operation
   */
  static async changeUserRole(
    request: ChangeUserRoleRequest,
    currentUser: User
  ): Promise<ChangeUserRoleResult> {
    const { userEmail, newRole } = request;
    
    // 1. Validate business rules
    ChangeUserRoleValidationRules.validateNotSelfChange(currentUser, userEmail);
    ChangeUserRoleValidationRules.validateSupervisorRoleAssignment(currentUser.role, newRole);
    
    // 2. Get target user and validate
    const targetUser = await getUserByEmail(userEmail);
    if (targetUser) {
      ChangeUserRoleValidationRules.validateNotSuperAdminChange(targetUser);
      ChangeUserRoleValidationRules.validateCallerPermissions(currentUser.role, targetUser.role, newRole);
      ChangeUserRoleValidationRules.validateRoleChange(targetUser.role, newRole);
    }
    
    // 3. Validate user exists in Azure AD
    const targetAdId = await UserSyncService.validateUserExists(userEmail);
    
    // 4. Get Azure AD token and service principal
    const graphToken = await getGraphToken();
    const clientId = process.env.APP_CLIENT_ID || process.env.AZURE_CLIENT_ID;
    const spId = await getServicePrincipalObjectId(graphToken, clientId!);
    
    // 5. Remove existing app roles from Azure AD
    await removeAllAppRolesFromPrincipalOnSp(graphToken, spId, targetAdId);
    
    // 6. Handle user deletion
    if (newRole === null) {
      if (targetUser) {
        await deleteUserByEmail(userEmail);
        await logAudit({
          entity: AuditEntity.USER,
          entityId: targetUser.id,
          action: AuditAction.DELETE,
          changedById: currentUser.id,
          dataBefore: targetUser,
        });
      }
      return {
        message: ChangeUserRoleMessages.USER_DELETED_SUCCESSFULLY,
        status: ChangeUserRoleStatus.SUCCESS,
        userEmail,
        previousRole: targetUser?.role,
        newRole: null,
        azureADUpdated: true,
        rollbackRequired: false
      };
    }
    
    // 7. Update database first (source of truth)
    const displayName = await UserSyncService.getUserDisplayName(targetAdId, graphToken);
    const updatedUser = await upsertUserRole(userEmail, targetAdId, displayName, newRole);
    
    // 8. Update Azure AD with retry logic
    const azureADResult = await this.updateAzureADWithRetry(
      graphToken, spId, targetAdId, newRole, 2
    );
    
    // 9. Handle rollback if Azure AD update failed
    if (azureADResult === AzureADRetryStatus.MAX_RETRIES_EXCEEDED) {
      // Rollback database changes
      if (targetUser) {
        await upsertUserRole(userEmail, targetAdId, displayName, targetUser.role);
      } else {
        await deleteUserByEmail(userEmail);
      }
      
      return {
        message: ChangeUserRoleMessages.AZURE_AD_UPDATE_FAILED,
        status: ChangeUserRoleStatus.ROLLBACK_REQUIRED,
        userEmail,
        previousRole: targetUser?.role,
        newRole,
        azureADUpdated: false,
        rollbackRequired: true
      };
    }
    
    // 10. Log audit
    await logAudit({
      entity: AuditEntity.USER,
      entityId: updatedUser.id,
      action: AuditAction.ROLE_CHANGE,
      changedById: currentUser.id,
      dataBefore: targetUser,
      dataAfter: updatedUser,
    });
    
    // 11. Mark user offline (all users)
    await setUserOffline(userEmail);
    
    return {
      message: ChangeUserRoleMessages.ROLE_CHANGED_SUCCESSFULLY,
      status: ChangeUserRoleStatus.SUCCESS,
      userEmail,
      previousRole: targetUser?.role,
      newRole,
      azureADUpdated: true,
      rollbackRequired: false
    };
  }
  
  /**
   * Updates Azure AD with retry logic.
   * @param graphToken - Azure AD Graph API token
   * @param spId - Service principal ID
   * @param targetAdId - Target user Azure AD ID
   * @param newRole - New role to assign
   * @param maxRetries - Maximum number of retry attempts
   * @returns Result of the Azure AD update operation
   */
  private static async updateAzureADWithRetry(
    graphToken: string,
    spId: string,
    targetAdId: string,
    newRole: UserRole,
    maxRetries: number
  ): Promise<AzureADRetryStatus> {
    const roleIdMap: Record<string, string> = {
      [UserRole.Supervisor]: process.env.SUPERVISORS_GROUP_ID!,
      [UserRole.Admin]: process.env.ADMINS_GROUP_ID!,
      [UserRole.Employee]: process.env.EMPLOYEES_GROUP_ID!,
      [UserRole.ContactManager]: process.env.CONTACT_MANAGER_GROUP_ID!,
    };
    
    const roleId = roleIdMap[newRole];
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await assignAppRoleToPrincipal(graphToken, spId, targetAdId, roleId);
        return AzureADRetryStatus.SUCCESS;
      } catch (error) {
        if (attempt === maxRetries) {
          return AzureADRetryStatus.MAX_RETRIES_EXCEEDED;
        }
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
    
    return AzureADRetryStatus.MAX_RETRIES_EXCEEDED;
  }
}
