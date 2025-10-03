/**
 * @file contactManagerForm.ts
 * @summary Contact manager form authorization middleware
 * @description Authorization middleware for contact manager form operations.
 */

import { withAuthorization } from "../core";
import { RolePermissions } from "../../../constants/rolePermissions";

/**
 * Authorization middleware for contact manager form operations.
 * Allows PSO role only.
 */
export function withContactManagerFormAuth() {
  return withAuthorization(RolePermissions.PSO_OPERATIONS);
}
