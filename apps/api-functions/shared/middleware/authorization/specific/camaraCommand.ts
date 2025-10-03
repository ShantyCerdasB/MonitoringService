/**
 * @file camaraCommand.ts
 * @summary Camara command authorization middleware
 * @description Authorization middleware for camara command operations.
 */

import { withAuthorization } from "../core";
import { RolePermissions } from "../../../constants/rolePermissions";

/**
 * Authorization middleware for camara command operations.
 * Allows Admin, Supervisor, and SuperAdmin roles.
 */
export function withCamaraCommandAuth() {
  return withAuthorization(RolePermissions.COMMAND_SENDER_OPERATIONS);
}
