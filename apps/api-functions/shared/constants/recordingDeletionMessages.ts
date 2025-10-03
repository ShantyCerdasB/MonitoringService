/**
 * @fileoverview RecordingDeletionMessages - Centralized messages for recording deletion operations
 * @summary Messages and status enums for recording deletion functionality
 * @description Contains all user-facing messages and status codes for recording deletion operations
 */

export enum RecordingDeletionMessages {
  RECORDING_DELETED = "Recording deleted successfully",
  RECORDING_NOT_FOUND = "Recording session not found",
  INSUFFICIENT_PERMISSIONS = "Only SuperAdmin may delete recordings",
  RECORDING_DELETION_FAILED = "Failed to delete recording",
  BLOB_DELETION_FAILED = "Failed to delete recording file",
  DATABASE_DELETION_FAILED = "Failed to delete recording from database"
}

export enum RecordingDeletionStatus {
  SUCCESS = "success",
  FAILED = "failed",
  PARTIAL_SUCCESS = "partial_success"
}

export enum BlobDeletionStatus {
  DELETED = "deleted",
  MISSING = "missing",
  FAILED = "failed"
}
