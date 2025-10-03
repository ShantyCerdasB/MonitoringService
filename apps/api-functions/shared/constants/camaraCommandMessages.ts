/**
 * @file camaraCommandMessages.ts
 * @summary Message constants for camara command operations
 * @description Centralized message definitions to eliminate hardcoded strings.
 */

export enum CamaraCommandMessages {
  CALLER_NOT_FOUND = "Caller not found",
  INSUFFICIENT_PERMISSIONS = "Insufficient privileges",
  TARGET_NOT_FOUND = "Target user not found or not an Employee",
  COMMAND_SENT_WS = "Command sent via WebSocket",
  COMMAND_SENT_BUS = "Command sent via Service Bus",
  FAILED_TO_SEND = "Unable to publish command"
}
