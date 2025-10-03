/**
 * @file contactManagerFormSchemas.ts
 * @summary Validation schemas for contact manager form operations
 * @description Zod schemas for validating contact manager form requests and responses.
 */

import { z } from "zod";

/**
 * Disconnections form schema.
 */
export const DisconnectionsSchema = z.object({
  formType: z.literal("Disconnections"),
  rnName: z.string().min(1, "RN name is required"),
  patientInitials: z.string().min(1, "Patient initials are required"),
  timeOfDisconnection: z.string().min(1, "Time of disconnection is required"),
  reason: z.string().min(1, "Reason is required"),
  hospital: z.string().min(1, "Hospital is required"),
  totalPatients: z.number().int().nonnegative("Total patients must be non-negative"),
  imageBase64: z.string().optional(),
});

/**
 * Admissions form schema.
 */
export const AdmissionsSchema = z.object({
  formType: z.literal("Admissions"),
  facility: z.string().min(1, "Facility is required"),
  unit: z.string().min(1, "Unit is required"),
  imageBase64: z.string().optional(),
});

/**
 * Assistance form schema.
 */
export const AssistanceSchema = z.object({
  formType: z.literal("Assistance"),
  facility: z.string().min(1, "Facility is required"),
  patientInitials: z.string().min(1, "Patient initials are required"),
  totalPatientsInPod: z.number().int().nonnegative("Total patients in pod must be non-negative"),
  imageBase64: z.string().optional(),
});

/**
 * Main form schema using discriminated union.
 */
export const ContactManagerFormSchema = z.discriminatedUnion("formType", [
  DisconnectionsSchema,
  AdmissionsSchema,
  AssistanceSchema,
]);

/**
 * Request interface for contact manager form.
 */
export type ContactManagerFormRequest = z.infer<typeof ContactManagerFormSchema>;

/**
 * Response interface for contact manager form submission.
 */
export interface ContactManagerFormResult {
  formId: string;
  message: string;
  submittedBy: string;
  formType: string;
  timestamp: string;
}
