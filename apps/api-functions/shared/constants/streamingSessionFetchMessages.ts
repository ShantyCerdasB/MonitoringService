/**
 * @fileoverview StreamingSessionFetchMessages - Centralized messages for streaming session fetch operations
 * @summary Messages and status enums for streaming session fetch functionality
 * @description Contains all user-facing messages and status codes for streaming session fetch operations
 */

export enum StreamingSessionFetchMessages {
  SESSIONS_FETCHED = "Streaming sessions fetched successfully",
  NO_ACTIVE_SESSIONS = "No active streaming sessions found",
  INSUFFICIENT_PERMISSIONS = "Insufficient permissions to view streaming sessions",
  FETCH_FAILED = "Failed to fetch streaming sessions",
  USER_NOT_FOUND = "User not found or deleted"
}

export enum StreamingSessionFetchStatus {
  SUCCESS = "success",
  NO_SESSIONS = "no_sessions",
  FAILED = "failed"
}
