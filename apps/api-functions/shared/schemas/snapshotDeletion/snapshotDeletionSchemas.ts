/**
 * @fileoverview SnapshotDeletionSchemas - Zod schemas and interfaces for snapshot deletion
 * @summary Type definitions and validation schemas for snapshot deletion operations
 * @description Contains request/response interfaces and Zod validation schemas for snapshot deletion
 */

export interface SnapshotDeletionRequest {
  snapshotId: string;
}

export interface SnapshotDeletionResult {
  snapshotId: string;
  message: string;
  status: string;
  imageUrl?: string | null;
  blobDeleted: boolean;
  blobMissing: boolean;
  dbDeleted: boolean;
  deletedAt: string;
}

export interface SnapshotDeletionAuditData {
  imageUrl?: string | null;
  createdAt: Date;
  updatedAt?: Date | null;
}
