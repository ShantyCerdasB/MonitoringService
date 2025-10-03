/**
 * @fileoverview RecordingDeletionSchemas - Zod schemas and interfaces for recording deletion
 * @summary Type definitions and validation schemas for recording deletion operations
 * @description Contains request/response interfaces and Zod validation schemas for recording deletion
 */

export interface RecordingDeletionRequest {
  sessionId: string;
}

export interface RecordingDeletionResult {
  sessionId: string;
  message: string;
  status: string;
  blobPath?: string | null;
  blobDeleted: boolean;
  blobMissing: boolean;
  dbDeleted: boolean;
  deletedAt: string;
}

export interface RecordingDeletionAuditData {
  roomName: string;
  egressId: string;
  userId: string;
  subjectUserId?: string;
  subjectLabel?: string;
  status: string;
  blobPath?: string | null;
  blobUrl?: string | null;
  startedAt?: string;
  stoppedAt?: string | null;
  createdAt: Date;
}
