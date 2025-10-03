/**
 * @fileoverview RecordingDeletionService - Service for recording deletion operations
 * @summary Core business logic for recording deletion with audit logging
 * @description Handles recording deletion with full validation, blob cleanup, and audit logging
 */

import { User } from "@prisma/client";
import { RecordingDeletionValidationRules } from "../../domain/validationRules/recordingDeletion";
import { RecordingDeletionMessages, RecordingDeletionStatus } from "../../constants/recordingDeletionMessages";
import { logAudit, AuditAction, AuditEntity } from "../auditService";
import { RecordingSessionRepository } from "../../repositories/recordingSessionRepo";
import { blobService } from "../blobStorageService";
import { RecordingDeletionRequest, RecordingDeletionResult, RecordingDeletionAuditData } from "../../schemas/recordingDeletion";
import { getCostaRicanTimeISO } from "../../utils/timezone";

export class RecordingDeletionService {
  /**
   * Deletes a recording with full validation, blob cleanup, and audit logging.
   * @param request - Recording deletion request data
   * @param caller - User deleting the recording
   * @returns Result of the deletion operation
   */
  static async deleteRecording(
    request: RecordingDeletionRequest,
    caller: User
  ): Promise<RecordingDeletionResult> {
    const { sessionId } = request;

    // 1. Validate business rules
    RecordingDeletionValidationRules.validateCallerExists(caller);
    RecordingDeletionValidationRules.validateSuperAdminPermissions(caller.role);

    // 2. Get recording session
    const session = await RecordingSessionRepository.findById(sessionId);
    RecordingDeletionValidationRules.validateSessionExists(session, sessionId);

    // 3. Prepare audit data before deletion
    const auditData: RecordingDeletionAuditData = {
      roomName: session!.roomName,
      egressId: session!.egressId,
      userId: session!.userId,
      subjectUserId: (session as any).subjectUserId,
      subjectLabel: (session as any).subjectLabel,
      status: session!.status,
      blobPath: (session as any).blobPath,
      blobUrl: session!.blobUrl,
      startedAt: (session as any).startedAt,
      stoppedAt: (session as any).stoppedAt,
      createdAt: session!.createdAt
    };

    // 4. Delete blob if path is available
    let blobDeleted = false;
    let blobMissing = false;
    const blobPath = (session as any).blobPath ?? this.tryParseBlobPathFromUrl(session!.blobUrl) ?? null;

    if (blobPath) {
      try {
        blobDeleted = await blobService.deleteRecordingByPath(blobPath);
        blobMissing = !blobDeleted;
      } catch (error) {
        blobMissing = true;
        // Continue with deletion even if blob deletion fails
      }
    } else {
      blobMissing = true;
    }

    // 5. Delete from database
    await RecordingSessionRepository.deleteById(sessionId);

    // 6. Log audit
    await logAudit({
      entity: AuditEntity.RECORDING,
      entityId: sessionId,
      action: AuditAction.DELETE,
      changedById: caller.id,
      dataBefore: auditData,
      dataAfter: null
    });

    return {
      sessionId,
      message: RecordingDeletionMessages.RECORDING_DELETED,
      status: RecordingDeletionStatus.SUCCESS,
      blobPath,
      blobDeleted,
      blobMissing,
      dbDeleted: true,
      deletedAt: getCostaRicanTimeISO()
    };
  }

  /**
   * Attempts to derive the relative blob path from a full Azure Blob URL
   * when it targets the configured account and container.
   * @param url - Absolute blob URL
   * @returns Relative blob path or null if it cannot be parsed safely
   */
  private static tryParseBlobPathFromUrl(url?: string | null): string | null {
    if (!url) return null;
    try {
      const u = new URL(url);
      const expectedHost = `${process.env.AZURE_STORAGE_ACCOUNT}.blob.core.windows.net`;
      if (u.hostname !== expectedHost) return null;

      const container = process.env.RECORDINGS_CONTAINER_NAME || "recordings";
      const parts = u.pathname.replace(/^\/+/, "").split("/");
      if (parts.shift() !== container) return null;

      return decodeURI(parts.join("/"));
    } catch {
      return null;
    }
  }
}
