/**
 * @file camaraCommandSchemas.ts
 * @summary Validation schemas for camara command operations
 * @description Zod schemas for validating camara command requests and responses.
 */

import { z } from "zod";
import { CommandType } from "@prisma/client";
import { DeliveryMethod } from "../../constants/camaraCommandTypes";

/**
 * Request body interface for camara command.
 */
export interface CamaraCommandRequest {
  /** Type of command to send */
  command: CommandType;
  /** Email of the target employee */
  employeeEmail: string;
}

/**
 * Validation schema for camara command request.
 */
export const camaraCommandRequestSchema = z.object({
  command: z.nativeEnum(CommandType),
  employeeEmail: z.string().email("Invalid email format")
});

/**
 * Response interface for camara command operation.
 */
export interface CamaraCommandResponse {
  message: string;
  sentVia: DeliveryMethod;
  command: CommandType;
  employeeEmail: string;
  timestamp: string;
}

/**
 * Validation schema for camara command response.
 */
export const camaraCommandResponseSchema = z.object({
  message: z.string(),
  sentVia: z.nativeEnum(DeliveryMethod),
  command: z.nativeEnum(CommandType),
  employeeEmail: z.string().email(),
  timestamp: z.string()
});
