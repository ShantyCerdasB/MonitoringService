/**
 * @file userManagementMessages.ts
 * @summary Message constants for user management operations
 * @description Centralized message definitions to eliminate hardcoded strings.
 */

export enum UserManagementMessages {
  // Contact Manager messages
  CONTACT_MANAGER_CREATED = "Contact Manager created successfully",
  CONTACT_MANAGER_ALREADY_EXISTS = "Contact Manager already exists",
  CONTACT_MANAGER_CREATION_FAILED = "Failed to create Contact Manager",
  
  // Super Admin messages
  SUPER_ADMIN_CREATED = "Super Admin created successfully",
  SUPER_ADMIN_ALREADY_EXISTS = "Super Admin already exists",
  SUPER_ADMIN_CREATION_FAILED = "Failed to create Super Admin",
  
  // Delete messages
  CONTACT_MANAGER_DELETED = "Contact Manager deleted successfully",
  SUPER_ADMIN_DELETED = "Super Admin deleted successfully",
  CONTACT_MANAGER_NOT_FOUND = "Contact Manager not found",
  SUPER_ADMIN_NOT_FOUND = "Super Admin not found",
  CANNOT_DELETE_LAST_SUPER_ADMIN = "Cannot delete the last Super Admin",
  CONTACT_MANAGER_DELETION_FAILED = "Failed to delete Contact Manager",
  SUPER_ADMIN_DELETION_FAILED = "Failed to delete Super Admin",
  
  // Common messages
  USER_NOT_FOUND = "User not found",
  USER_NOT_FOUND_IN_AZURE = "User not found in Azure AD",
  INSUFFICIENT_PERMISSIONS = "Insufficient permissions",
  CALLER_NOT_FOUND = "Caller not found",
  CANNOT_DETERMINE_IDENTITY = "Cannot determine caller identity",
  
  // Validation messages
  INVALID_EMAIL_FORMAT = "Invalid email format",
  INVALID_STATUS = "Invalid status",
  MISSING_REQUIRED_FIELDS = "Missing required fields",
  
  // Azure AD messages
  AZURE_AD_ROLE_ASSIGNMENT_FAILED = "Failed to assign Azure AD role",
  AZURE_AD_ROLE_REMOVAL_FAILED = "Failed to remove Azure AD role",
  
  // Database messages
  DATABASE_UPDATE_FAILED = "Database update failed",
  PROFILE_CREATION_FAILED = "Profile creation failed",
  AUDIT_LOG_FAILED = "Audit log creation failed"
}
