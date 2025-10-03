/**
 * @fileoverview SnapshotDeletionValidationRules - Business validation rules for snapshot deletion
 * @summary Domain-specific validation rules for snapshot deletion operations
 * @description Contains all business rule validations for snapshot deletion functionality
 */

import { User, UserRole } from "@prisma/client";
import { ExpectedError } from "../../../middleware/errorHandler";
import { SnapshotDeletionMessages } from "../../../constants/snapshotDeletionMessages";

export class SnapshotDeletionValidationRules {
  /**
   * Validates that only Admin and SuperAdmin can delete snapshots.
   * @param callerRole - Role of the user deleting the snapshot
   * @throws ExpectedError if caller lacks permissions
   */
  static validateAdminPermissions(callerRole: UserRole): void {
    const allowedRoles = [UserRole.Admin, UserRole.SuperAdmin];
    
    if (!allowedRoles.includes(callerRole as any)) {
      throw new ExpectedError(SnapshotDeletionMessages.INSUFFICIENT_PERMISSIONS, 403);
    }
  }

  /**
   * Validates that the snapshot exists.
   * @param snapshot - Snapshot data
   * @param snapshotId - ID of the snapshot being deleted
   * @throws ExpectedError if snapshot not found
   */
  static validateSnapshotExists(snapshot: any, snapshotId: string): void {
    if (!snapshot) {
      throw new ExpectedError(SnapshotDeletionMessages.SNAPSHOT_NOT_FOUND, 404);
    }
  }

  /**
   * Validates that the caller exists.
   * @param caller - The user making the request
   * @throws ExpectedError if caller is null or undefined
   */
  static validateCallerExists(caller: User | null | undefined): void {
    if (!caller) {
      throw new ExpectedError("Caller not found", 400);
    }
  }
}
