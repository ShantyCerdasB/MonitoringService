/**
 * @fileoverview PendingCommandFetchAuth - Authorization middleware for pending command fetch
 * @summary Specific authorization middleware for pending command fetch operations
 * @description Handles authorization for pending command fetch with Employee-only access
 */

import { withAuthorization } from "../core";
import { RolePermissions } from "../../../constants/rolePermissions";

/**
 * Authorization middleware for pending command fetch.
 * Allows Employee role only.
 */
export function withPendingCommandFetchAuth() {
  return withAuthorization(RolePermissions.EMPLOYEE_ROLE);
}
