/**
 * @fileoverview SnapshotDeletionAuth - Authorization middleware for snapshot deletion
 * @summary Specific authorization middleware for snapshot deletion operations
 * @description Handles authorization for snapshot deletion with Admin and SuperAdmin access
 */

import { withAuthorization } from "../core";
import { RolePermissions } from "../../../constants/rolePermissions";

/**
 * Authorization middleware for snapshot deletion.
 * Allows Admin and SuperAdmin roles.
 */
export function withSnapshotDeletionAuth() {
  return withAuthorization(RolePermissions.ADMIN_OPERATIONS);
}
