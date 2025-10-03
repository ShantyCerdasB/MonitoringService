/**
 * @file index.ts
 * @summary Change user role endpoint handler
 * @description HTTP POST endpoint for changing user roles with Azure AD synchronization.
 * Supports rollback on Azure AD failures and enforces business rules.
 */

import { AzureFunction, Context } from "@azure/functions";
import { withAuth } from "../shared/middleware/auth";
import { withErrorHandler } from "../shared/middleware/errorHandler";
import { withBodyValidation } from "../shared/middleware/validate";
import { withChangeUserRoleAuth } from "../shared/middleware/authorization/specific/changeUserRole";
import { ok } from "../shared/utils/response";
import { ChangeUserRoleService } from "../shared/services/changeUserRole";
import { changeUserRoleRequestSchema, ChangeUserRoleRequest } from "../shared/schemas/changeUserRole/changeUserRoleSchemas";
import { User } from "@prisma/client";

/**
 * HTTP POST `/api/ChangeUserRole`
 *
 * Allows authorized users to change user roles with Azure AD synchronization.
 * Supports rollback on Azure AD failures and enforces business rules.
 *
 * @param ctx - Azure Functions execution context with logging and bindings.
 * @param req - HTTP request object containing user email and new role.
 *
 * @body ChangeUserRoleRequest - JSON object with user email and new role.
 *
 * @returns
 * - **200 OK** → User role changed successfully.
 * - **400 Bad Request** → Invalid request data or business rule violation.
 * - **401 Unauthorized** → User not authenticated.
 * - **403 Forbidden** → User lacks required permissions.
 * - **500 Internal Server Error** → Database or system errors.
 */
const changeUserRole: AzureFunction = withErrorHandler(
  async (ctx: Context) => {
    ctx.log.info(`[ChangeUserRole] Processing user role change request`);

    await withAuth(ctx, async () => {
      await withChangeUserRoleAuth()(ctx, async (currentUser: User) => {
        await withBodyValidation(changeUserRoleRequestSchema)(ctx, async () => {
          const { userEmail, newRole } = ctx.bindings.validatedBody as ChangeUserRoleRequest;
          
          ctx.log.info(`[ChangeUserRole] Changing role for ${userEmail} to ${newRole || "null"} by ${currentUser.email}`);
          
          // Execute business logic
          const result = await ChangeUserRoleService.changeUserRole(
            { userEmail, newRole },
            currentUser
          );
          
          ctx.log.info(`[ChangeUserRole] Role change completed with status: ${result.status}`);
          
          return ok(ctx, result);
        });
      });
    });
  },
  { genericMessage: "Failed to change user role" }
);

export default changeUserRole;
