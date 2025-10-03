/**
 * @fileoverview RecordingDeletionAuth - Authorization middleware for recording deletion
 * @summary Specific authorization middleware for recording deletion operations
 * @description Handles authorization for recording deletion with SuperAdmin-only access
 */

import { withAuthorization } from "../core";
import { RolePermissions } from "../../../constants/rolePermissions";

/**
 * Authorization middleware for recording deletion.
 * Allows SuperAdmin role only.
 */
export function withRecordingDeletionAuth() {
  return withAuthorization([RolePermissions.ADMIN_OPERATIONS[1]]); // Only SuperAdmin
}
