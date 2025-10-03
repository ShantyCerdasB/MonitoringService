/**
 * @file changeUserRole.ts
 * @summary Change user role authorization middleware
 * @description Authorization middleware for change user role operations.
 */

import { withAuthorization } from "../core";
import { RolePermissions } from "../../../constants/rolePermissions";

/**
 * Authorization middleware for change user role operations.
 * Allows Admin and SuperAdmin roles.
 */
export function withChangeUserRoleAuth() {
  return withAuthorization(RolePermissions.ADMIN_OPERATIONS);
}

/**
 * Authorization middleware for supervisor change user role operations.
 * Allows Admin, Supervisor, and SuperAdmin roles.
 */
export function withSupervisorChangeUserRoleAuth() {
  return withAuthorization(RolePermissions.SUPERVISOR_MANAGEMENT_OPERATIONS);
}
