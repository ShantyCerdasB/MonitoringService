/**
 * @fileoverview SnapshotDeletionMessages - Centralized messages for snapshot deletion operations
 * @summary Messages and status enums for snapshot deletion functionality
 * @description Contains all user-facing messages and status codes for snapshot deletion operations
 */

export enum SnapshotDeletionMessages {
  SNAPSHOT_DELETED = "Snapshot deleted successfully",
  SNAPSHOT_NOT_FOUND = "Snapshot not found",
  INSUFFICIENT_PERMISSIONS = "Only Admin and SuperAdmin may delete snapshots",
  SNAPSHOT_DELETION_FAILED = "Failed to delete snapshot",
  BLOB_DELETION_FAILED = "Failed to delete snapshot file",
  DATABASE_DELETION_FAILED = "Failed to delete snapshot from database"
}

export enum SnapshotDeletionStatus {
  SUCCESS = "success",
  FAILED = "failed",
  PARTIAL_SUCCESS = "partial_success"
}

export enum BlobDeletionStatus {
  DELETED = "deleted",
  MISSING = "missing",
  FAILED = "failed"
}
