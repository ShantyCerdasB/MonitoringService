/**
 * @file changeUserRoleSchemas.ts
 * @summary Validation schemas for change user role operations
 * @description Zod schemas for validating change user role requests and responses.
 */

import { z } from "zod";
import { UserRole } from "@prisma/client";
import { ChangeUserRoleStatus } from "../../constants/changeUserRoleMessages";

/**
 * Request body interface for change user role.
 */
export interface ChangeUserRoleRequest {
  /** Email of the user to change role */
  userEmail: string;
  /** New role to assign (null to remove user) */
  newRole: UserRole | null;
}

/**
 * Validation schema for change user role request.
 */
export const changeUserRoleRequestSchema = z.object({
  userEmail: z.string().email("Invalid email format"),
  newRole: z.nativeEnum(UserRole).nullable()
});

/**
 * Response interface for change user role operation.
 */
export interface ChangeUserRoleResult {
  message: string;
  status: ChangeUserRoleStatus;
  userEmail: string;
  previousRole?: UserRole;
  newRole?: UserRole | null;
  azureADUpdated: boolean;
  rollbackRequired: boolean;
}

/**
 * Validation schema for change user role response.
 */
export const changeUserRoleResponseSchema = z.object({
  message: z.string(),
  status: z.nativeEnum(ChangeUserRoleStatus),
  userEmail: z.string().email(),
  previousRole: z.nativeEnum(UserRole).optional(),
  newRole: z.nativeEnum(UserRole).nullable().optional(),
  azureADUpdated: z.boolean(),
  rollbackRequired: z.boolean()
});
