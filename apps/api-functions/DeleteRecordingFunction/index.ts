/**
 * @file index.ts
 * @summary Delete recording endpoint handler
 * @description HTTP DELETE endpoint for deleting recordings with full validation and audit logging.
 */

import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { withAuth } from "../shared/middleware/auth";
import { withErrorHandler } from "../shared/middleware/errorHandler";
import { withRecordingDeletionAuth } from "../shared/middleware/authorization/specific/recordingDeletion";
import { ok } from "../shared/utils/response";
import { RecordingDeletionService } from "../shared/services/recordingDeletion";
import { User } from "@prisma/client";

/**
 * HTTP DELETE `/api/recordings/{id}`
 *
 * Deletes a recording with full validation, blob cleanup, and audit logging.
 * Only SuperAdmin role can delete recordings. Any recording state can be deleted.
 *
 * @param ctx - Azure Functions execution context with logging and bindings.
 * @param req - HTTP request object containing authorization token.
 *
 * @pathParam id - UUID of the recording session to delete.
 *
 * @returns
 * - **200 OK** → Recording deleted successfully.
 * - **400 Bad Request** → Invalid request data or business rule violation.
 * - **401 Unauthorized** → User not authenticated.
 * - **403 Forbidden** → User lacks SuperAdmin permissions.
 * - **404 Not Found** → Recording not found.
 * - **500 Internal Server Error** → Database or system errors.
 */
const deleteRecordingFunction: AzureFunction = withErrorHandler(
  async (ctx: Context, req: HttpRequest) => {
    ctx.log.info(`[DeleteRecordingFunction] Processing recording deletion request`);

    await withAuth(ctx, async () => {
      await withRecordingDeletionAuth()(ctx, async (currentUser: User) => {
        const sessionId = req.params?.id;
        
        ctx.log.info(`[DeleteRecordingFunction] Deleting recording ${sessionId} by ${currentUser.email}`);
        
        // Execute business logic
        const result = await RecordingDeletionService.deleteRecording(
          { sessionId },
          currentUser
        );
        
        ctx.log.info(`[DeleteRecordingFunction] Recording deleted successfully: ${result.sessionId}`);
        
        return ok(ctx, result);
      });
    });
  },
  { genericMessage: "Failed to delete recording" }
);

export default deleteRecordingFunction;
