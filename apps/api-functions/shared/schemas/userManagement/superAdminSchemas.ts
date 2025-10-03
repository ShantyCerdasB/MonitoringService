/**
 * @file superAdminSchemas.ts
 * @summary Validation schemas for super admin operations
 * @description Zod schemas for validating super admin requests and responses.
 */

import { z } from "zod";

/**
 * Schema for creating a super admin.
 */
export const CreateSuperAdminSchema = z.object({
  email: z.string().email("Invalid email format")
});

/**
 * Request interface for creating a super admin.
 */
export interface CreateSuperAdminRequest {
  email: string;
}

/**
 * Response interface for super admin creation.
 */
export interface CreateSuperAdminResult {
  id: string;
  message: string;
  email: string;
  role: string;
  createdAt: Date;
}
