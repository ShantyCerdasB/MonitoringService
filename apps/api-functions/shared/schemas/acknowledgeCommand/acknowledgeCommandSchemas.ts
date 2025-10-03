/**
 * @file acknowledgeCommandSchemas.ts
 * @summary Validation schemas for acknowledge command operations
 * @description Zod schemas for validating acknowledge command requests and responses.
 */

import { z } from "zod";

/**
 * Request body interface for acknowledge command.
 */
export interface AcknowledgeCommandRequest {
  /** Array of command IDs to acknowledge */
  ids: string[];
}

/**
 * Validation schema for acknowledge command request.
 */
export const acknowledgeCommandRequestSchema = z.object({
  ids: z.array(z.string().uuid()).min(1, "At least one command ID required")
});

/**
 * Response interface for acknowledge command operation.
 */
export interface AcknowledgeCommandResponse {
  message: string;
  updatedCount: number;
  acknowledgedBy: string;
  timestamp: string;
}

/**
 * Validation schema for acknowledge command response.
 */
export const acknowledgeCommandResponseSchema = z.object({
  message: z.string(),
  updatedCount: z.number(),
  acknowledgedBy: z.string(),
  timestamp: z.string()
});
