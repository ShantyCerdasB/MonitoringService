/**
 * @file changeUserRoleMessages.ts
 * @summary Message constants for change user role operations
 * @description Centralized message definitions to eliminate hardcoded strings.
 */

export enum ChangeUserRoleMessages {
  CALLER_NOT_FOUND = "Caller not found",
  INSUFFICIENT_PERMISSIONS = "Only Admin or Supervisor may change roles",
  SUPERVISOR_LIMITED_ACCESS = "Supervisors may only assign Employee role",
  CANNOT_CHANGE_OWN_ROLE = "Cannot change own role",
  CANNOT_CHANGE_SUPERADMIN = "Cannot change SuperAdmin role",
  USER_NOT_FOUND_AZURE = "User not found in Azure AD",
  AZURE_AD_UPDATE_FAILED = "Failed to update Azure AD roles",
  ROLE_CHANGED_SUCCESSFULLY = "User role changed successfully",
  USER_DELETED_SUCCESSFULLY = "User deleted successfully"
}

export enum ChangeUserRoleStatus {
  SUCCESS = "success",
  FAILED = "failed",
  ROLLBACK_REQUIRED = "rollback_required"
}

export enum AzureADRetryStatus {
  SUCCESS = "success",
  FAILED = "failed",
  MAX_RETRIES_EXCEEDED = "max_retries_exceeded"
}
