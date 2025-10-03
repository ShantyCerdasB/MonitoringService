/**
 * @fileoverview SnapshotDeletionService - Service for snapshot deletion operations
 * @summary Core business logic for snapshot deletion with audit logging
 * @description Handles snapshot deletion with full validation, blob cleanup, and audit logging
 */

import { User } from "@prisma/client";
import { SnapshotDeletionValidationRules } from "../../domain/validationRules/snapshotDeletion";
import { SnapshotDeletionMessages, SnapshotDeletionStatus } from "../../constants/snapshotDeletionMessages";
import { logAudit, AuditAction, AuditEntity } from "../auditService";
import { SnapshotRepository } from "../../repositories/snapshotRepo";
import { blobService } from "../blobStorageService";
import { SnapshotDeletionRequest, SnapshotDeletionResult, SnapshotDeletionAuditData } from "../../schemas/snapshotDeletion";
import { getCostaRicanTimeISO } from "../../utils/timezone";

export class SnapshotDeletionService {
  /**
   * Deletes a snapshot with full validation, blob cleanup, and audit logging.
   * @param request - Snapshot deletion request data
   * @param caller - User deleting the snapshot
   * @returns Result of the deletion operation
   */
  static async deleteSnapshot(
    request: SnapshotDeletionRequest,
    caller: User
  ): Promise<SnapshotDeletionResult> {
    const { snapshotId } = request;

    // 1. Validate business rules
    SnapshotDeletionValidationRules.validateCallerExists(caller);
    SnapshotDeletionValidationRules.validateAdminPermissions(caller.role);

    // 2. Get snapshot
    const snapshot = await SnapshotRepository.findById(snapshotId);
    SnapshotDeletionValidationRules.validateSnapshotExists(snapshot, snapshotId);

    // 3. Prepare audit data before deletion
    const auditData: SnapshotDeletionAuditData = {
      imageUrl: snapshot!.imageUrl,
      createdAt: snapshot!.takenAt,
      updatedAt: undefined
    };

    // 4. Delete blob if URL is available
    let blobDeleted = false;
    let blobMissing = false;

    if (snapshot!.imageUrl) {
      try {
        // Extract blob name from URL for deletion
        const url = new URL(snapshot!.imageUrl);
        const blobName = url.pathname.split('/').slice(2).join('/'); // Remove container name
        blobDeleted = await blobService.deleteSnapshot(blobName);
        blobMissing = !blobDeleted;
      } catch (error) {
        blobMissing = true;
        // Continue with deletion even if blob deletion fails
      }
    } else {
      blobMissing = true;
    }

    // 5. Delete from database
    await SnapshotRepository.deleteById(snapshotId);

    // 6. Log audit
    await logAudit({
      entity: AuditEntity.SNAPSHOT,
      entityId: snapshotId,
      action: AuditAction.DELETE,
      changedById: caller.id,
      dataBefore: auditData,
      dataAfter: null
    });

    return {
      snapshotId,
      message: SnapshotDeletionMessages.SNAPSHOT_DELETED,
      status: SnapshotDeletionStatus.SUCCESS,
      imageUrl: snapshot!.imageUrl,
      blobDeleted,
      blobMissing,
      dbDeleted: true,
      deletedAt: getCostaRicanTimeISO()
    };
  }
}
