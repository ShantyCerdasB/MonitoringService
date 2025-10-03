/**
 * @fileoverview PendingCommandFetchMessages - Centralized messages for pending command fetch operations
 * @summary Messages and status enums for pending command fetch functionality
 * @description Contains all user-facing messages and status codes for pending command fetch operations
 */

export enum PendingCommandFetchMessages {
  COMMANDS_FETCHED = "Pending commands fetched successfully",
  NO_PENDING_COMMANDS = "No pending commands found",
  COMMAND_EXPIRED = "Command has expired",
  INSUFFICIENT_PERMISSIONS = "Only employees may fetch pending commands",
  FETCH_FAILED = "Failed to fetch pending commands",
  USER_NOT_FOUND = "User not found or deleted"
}

export enum PendingCommandFetchStatus {
  SUCCESS = "success",
  NO_COMMANDS = "no_commands",
  EXPIRED = "expired",
  FAILED = "failed"
}
