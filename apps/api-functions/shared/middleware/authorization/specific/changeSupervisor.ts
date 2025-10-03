/**
 * @file changeSupervisor.ts
 * @summary Change supervisor authorization middleware
 * @description Authorization middleware for change supervisor operations.
 */

import { withAuthorization } from "../core";
import { RolePermissions } from "../../../constants/rolePermissions";

/**
 * Authorization middleware for change supervisor operations.
 * Allows Admin, Supervisor, and SuperAdmin roles.
 */
export function withChangeSupervisorAuth() {
  return withAuthorization(RolePermissions.SUPERVISOR_MANAGEMENT_OPERATIONS);
}
