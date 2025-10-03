/**
 * @file index.ts
 * @summary Delete contact manager endpoint handler
 * @description HTTP DELETE endpoint for deleting contact managers with full validation and audit logging.
 */

import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { withAuth } from "../shared/middleware/auth";
import { withErrorHandler } from "../shared/middleware/errorHandler";
import { withContactManagerDeletionAuth } from "../shared/middleware/authorization/specific/userManagement";
import { ok } from "../shared/utils/response";
import { ContactManagerManagementService } from "../shared/services/contactManagerManagement";
import { User } from "@prisma/client";

/**
 * HTTP DELETE `/api/contactManagers/{id}`
 *
 * Deletes a Contact Manager with full validation, Azure AD integration, and audit logging.
 * Only Admin and SuperAdmin roles can delete Contact Managers.
 *
 * @param ctx - Azure Functions execution context with logging and bindings.
 * @param req - HTTP request object containing authorization token.
 *
 * @pathParam id - UUID of the Contact Manager profile to delete.
 *
 * @returns
 * - **200 OK** → Contact Manager deleted successfully.
 * - **400 Bad Request** → Invalid request data or business rule violation.
 * - **401 Unauthorized** → User not authenticated.
 * - **403 Forbidden** → User lacks Admin/SuperAdmin permissions.
 * - **404 Not Found** → Contact Manager not found.
 * - **500 Internal Server Error** → Database or system errors.
 */
const removeHandler: AzureFunction = withErrorHandler(
  async (ctx: Context, req: HttpRequest) => {
    ctx.log.info(`[DeleteContactManager] Processing contact manager deletion request`);

    await withAuth(ctx, async () => {
      await withContactManagerDeletionAuth()(ctx, async (currentUser: User) => {
        const profileId = ctx.bindingData.id as string;
        
        ctx.log.info(`[DeleteContactManager] Deleting contact manager ${profileId} by ${currentUser.email}`);
        
        // Execute business logic
        const result = await ContactManagerManagementService.deleteContactManager(
          profileId,
          currentUser
        );
        
        ctx.log.info(`[DeleteContactManager] Contact manager deleted successfully: ${result.profileId}`);
        
        return ok(ctx, result);
      });
    });
  },
  { genericMessage: "Failed to delete Contact Manager" }
);

export default removeHandler;
