/**
 * @file acknowledgeCommandMessages.ts
 * @summary Message constants for acknowledge command operations
 * @description Centralized message definitions to eliminate hardcoded strings.
 */

export enum AcknowledgeCommandMessages {
  USER_NOT_FOUND = "User not found",
  USER_DELETED = "User has been deleted",
  INSUFFICIENT_PERMISSIONS = "Only employees may acknowledge commands",
  COMMANDS_ACKNOWLEDGED = "Commands acknowledged successfully",
  FAILED_TO_ACKNOWLEDGE = "Failed to acknowledge commands"
}
