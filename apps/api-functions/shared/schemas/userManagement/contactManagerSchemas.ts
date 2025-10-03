/**
 * @file contactManagerSchemas.ts
 * @summary Validation schemas for contact manager operations
 * @description Zod schemas for validating contact manager requests and responses.
 */

import { z } from "zod";
import { ContactManagerStatus } from "@prisma/client";

/**
 * Schema for creating a contact manager.
 */
export const CreateContactManagerSchema = z.object({
  email: z.string().email("Invalid email format"),
  status: z.nativeEnum(ContactManagerStatus, {
    errorMap: () => ({ message: "Invalid status" })
  })
});

/**
 * Request interface for creating a contact manager.
 */
export interface CreateContactManagerRequest {
  email: string;
  status: ContactManagerStatus;
}

/**
 * Response interface for contact manager creation.
 */
export interface CreateContactManagerResult {
  id: string;
  message: string;
  email: string;
  status: ContactManagerStatus;
  createdAt: Date;
}
