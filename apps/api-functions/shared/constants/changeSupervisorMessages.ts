/**
 * @file changeSupervisorMessages.ts
 * @summary Message constants for change supervisor operations
 * @description Centralized message definitions to eliminate hardcoded strings.
 */

export enum ChangeSupervisorMessages {
  CALLER_NOT_FOUND = "Caller not found",
  INSUFFICIENT_PERMISSIONS = "Caller must be Admin or Supervisor",
  SUPERVISOR_NOT_FOUND = "Supervisor not found",
  TARGET_NOT_SUPERVISOR = "Target is not a Supervisor",
  USER_SKIPPED_NON_EMPLOYEE = "User skipped - not an Employee",
  SUPERVISOR_CANNOT_ASSIGN_SELF = "Supervisor cannot assign employees to themselves",
  ASSIGNMENTS_UPDATED = "Supervisor assignments updated successfully"
}
