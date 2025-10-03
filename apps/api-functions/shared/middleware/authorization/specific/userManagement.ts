/**
 * @file userManagement.ts
 * @summary User management authorization middleware
 * @description Authorization middleware for user management operations.
 */

import { withAuthorization } from "../core";
import { RolePermissions } from "../../../constants/rolePermissions";

/**
 * Authorization middleware for contact manager creation.
 * Allows Admin and SuperAdmin roles only.
 */
export function withContactManagerCreationAuth() {
  return withAuthorization(RolePermissions.ADMIN_OPERATIONS);
}

/**
 * Authorization middleware for super admin creation.
 * Allows SuperAdmin role only.
 */
export function withSuperAdminCreationAuth() {
  return withAuthorization([RolePermissions.ADMIN_OPERATIONS[1]]); // Only SuperAdmin
}

/**
 * Authorization middleware for contact manager deletion.
 * Allows Admin and SuperAdmin roles only.
 */
export function withContactManagerDeletionAuth() {
  return withAuthorization(RolePermissions.ADMIN_OPERATIONS);
}

/**
 * Authorization middleware for super admin deletion.
 * Allows SuperAdmin role only.
 */
export function withSuperAdminDeletionAuth() {
  return withAuthorization([RolePermissions.ADMIN_OPERATIONS[1]]); // Only SuperAdmin
}
