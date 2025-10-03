/**
 * @file acknowledgeCommand.ts
 * @summary Acknowledge command authorization middleware
 * @description Authorization middleware for acknowledge command operations.
 */

import { withAuthorization } from "../core";
import { RolePermissions } from "../../../constants/rolePermissions";

/**
 * Authorization middleware for acknowledge command operations.
 * Allows Employee role only.
 */
export function withAcknowledgeCommandAuth() {
  return withAuthorization(RolePermissions.EMPLOYEE_ROLE);
}
