/**
 * @file index.ts
 * @summary Delete snapshot endpoint handler
 * @description HTTP DELETE endpoint for deleting snapshots with full validation and audit logging.
 */

import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { withAuth } from "../shared/middleware/auth";
import { withErrorHandler } from "../shared/middleware/errorHandler";
import { withSnapshotDeletionAuth } from "../shared/middleware/authorization/specific/snapshotDeletion";
import { ok } from "../shared/utils/response";
import { SnapshotDeletionService } from "../shared/services/snapshotDeletion";
import { User } from "@prisma/client";

/**
 * HTTP DELETE `/api/snapshots/{id}`
 *
 * Deletes a snapshot with full validation, blob cleanup, and audit logging.
 * Only Admin and SuperAdmin roles can delete snapshots.
 *
 * @param ctx - Azure Functions execution context with logging and bindings.
 * @param req - HTTP request object containing authorization token.
 *
 * @pathParam id - UUID of the snapshot to delete.
 *
 * @returns
 * - **200 OK** → Snapshot deleted successfully.
 * - **400 Bad Request** → Invalid request data or business rule violation.
 * - **401 Unauthorized** → User not authenticated.
 * - **403 Forbidden** → User lacks Admin/SuperAdmin permissions.
 * - **404 Not Found** → Snapshot not found.
 * - **500 Internal Server Error** → Database or system errors.
 */
const deleteSnapshotFunction: AzureFunction = withErrorHandler(
  async (ctx: Context, req: HttpRequest) => {
    ctx.log.info(`[DeleteSnapshotFunction] Processing snapshot deletion request`);

    await withAuth(ctx, async () => {
      await withSnapshotDeletionAuth()(ctx, async (currentUser: User) => {
        const snapshotId = req.params?.id;
        
        ctx.log.info(`[DeleteSnapshotFunction] Deleting snapshot ${snapshotId} by ${currentUser.email}`);
        
        // Execute business logic
        const result = await SnapshotDeletionService.deleteSnapshot(
          { snapshotId },
          currentUser
        );
        
        ctx.log.info(`[DeleteSnapshotFunction] Snapshot deleted successfully: ${result.snapshotId}`);
        
        return ok(ctx, result);
      });
    });
  },
  { genericMessage: "Failed to delete snapshot" }
);

export default deleteSnapshotFunction;
