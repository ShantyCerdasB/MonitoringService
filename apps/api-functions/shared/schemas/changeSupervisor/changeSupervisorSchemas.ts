/**
 * @file changeSupervisorSchemas.ts
 * @summary Validation schemas for change supervisor operations
 * @description Zod schemas for validating change supervisor requests and responses.
 */

import { z } from "zod";
import { ChangeSupervisorStatus } from "../../constants/changeSupervisorTypes";

/**
 * Request body interface for change supervisor.
 */
export interface ChangeSupervisorRequest {
  /** Array of user emails to assign supervisor to */
  userEmails: string[];
  /** Email of the new supervisor (null to remove supervisor) */
  newSupervisorEmail: string | null;
}

/**
 * Validation schema for change supervisor request.
 */
export const changeSupervisorRequestSchema = z.object({
  userEmails: z.array(z.string().email()).min(1, "At least one user email required"),
  newSupervisorEmail: z.string().email().nullable()
});

/**
 * Response interface for change supervisor operation.
 */
export interface ChangeSupervisorResult {
  message: string;
  updatedCount: number;
  skippedCount: number;
  status: ChangeSupervisorStatus;
  details: {
    updated: string[];
    skipped: string[];
  };
}

/**
 * Validation schema for change supervisor response.
 */
export const changeSupervisorResponseSchema = z.object({
  message: z.string(),
  updatedCount: z.number(),
  skippedCount: z.number(),
  status: z.nativeEnum(ChangeSupervisorStatus),
  details: z.object({
    updated: z.array(z.string()),
    skipped: z.array(z.string())
  })
});
