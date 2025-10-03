/**
 * @file index.ts
 * @summary Delete super admin endpoint handler
 * @description HTTP DELETE endpoint for deleting super admins with full validation and audit logging.
 */

import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { withAuth } from "../shared/middleware/auth";
import { withErrorHandler } from "../shared/middleware/errorHandler";
import { withSuperAdminDeletionAuth } from "../shared/middleware/authorization/specific/userManagement";
import { ok } from "../shared/utils/response";
import { SuperAdminManagementService } from "../shared/services/superAdminManagement";
import { User } from "@prisma/client";

/**
 * HTTP DELETE `/api/superAdmins/{id}`
 *
 * Deletes a Super Admin with full validation, Azure AD integration, and audit logging.
 * Only SuperAdmin role can delete other SuperAdmins. Cannot delete the last SuperAdmin.
 *
 * @param ctx - Azure Functions execution context with logging and bindings.
 * @param req - HTTP request object containing authorization token.
 *
 * @pathParam id - UUID of the Super Admin user to delete.
 *
 * @returns
 * - **200 OK** → Super Admin deleted successfully.
 * - **400 Bad Request** → Invalid request data or business rule violation.
 * - **401 Unauthorized** → User not authenticated.
 * - **403 Forbidden** → User lacks SuperAdmin permissions.
 * - **404 Not Found** → Super Admin not found.
 * - **500 Internal Server Error** → Database or system errors.
 */
const removeHandler: AzureFunction = withErrorHandler(
  async (ctx: Context, req: HttpRequest) => {
    ctx.log.info(`[DeleteSuperAdmin] Processing super admin deletion request`);

    await withAuth(ctx, async () => {
      await withSuperAdminDeletionAuth()(ctx, async (currentUser: User) => {
        const userId = ctx.bindingData.id as string;
        
        ctx.log.info(`[DeleteSuperAdmin] Deleting super admin ${userId} by ${currentUser.email}`);
        
        // Execute business logic
        const result = await SuperAdminManagementService.deleteSuperAdmin(
          userId,
          currentUser
        );
        
        ctx.log.info(`[DeleteSuperAdmin] Super admin deleted successfully: ${result.userId}`);
        
        return ok(ctx, result);
      });
    });
  },
  { genericMessage: "Failed to delete Super Admin" }
);

export default removeHandler;
