/**
 * @fileoverview RecordingDeletionValidationRules - Business validation rules for recording deletion
 * @summary Domain-specific validation rules for recording deletion operations
 * @description Contains all business rule validations for recording deletion functionality
 */

import { User, UserRole } from "@prisma/client";
import { ExpectedError } from "../../../middleware/errorHandler";
import { RecordingDeletionMessages } from "../../../constants/recordingDeletionMessages";

export class RecordingDeletionValidationRules {
  /**
   * Validates that only SuperAdmin can delete recordings.
   * @param callerRole - Role of the user deleting the recording
   * @throws ExpectedError if caller lacks permissions
   */
  static validateSuperAdminPermissions(callerRole: UserRole): void {
    if (callerRole !== UserRole.SuperAdmin) {
      throw new ExpectedError(RecordingDeletionMessages.INSUFFICIENT_PERMISSIONS, 403);
    }
  }

  /**
   * Validates that the recording session exists.
   * @param session - Recording session data
   * @param sessionId - ID of the session being deleted
   * @throws ExpectedError if session not found
   */
  static validateSessionExists(session: any, sessionId: string): void {
    if (!session) {
      throw new ExpectedError(RecordingDeletionMessages.RECORDING_NOT_FOUND, 404);
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
