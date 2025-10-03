/**
 * @file index.ts
 * @summary Create super admin endpoint handler
 * @description HTTP POST endpoint for creating super admins with full validation and audit logging.
 */

import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { withAuth } from "../shared/middleware/auth";
import { withErrorHandler } from "../shared/middleware/errorHandler";
import { withBodyValidation } from "../shared/middleware/validate";
import { withSuperAdminCreationAuth } from "../shared/middleware/authorization/specific/userManagement";
import { ok } from "../shared/utils/response";
import { SuperAdminManagementService } from "../shared/services/superAdminManagement";
import { CreateSuperAdminSchema, CreateSuperAdminRequest } from "../shared/schemas/userManagement";
import { User } from "@prisma/client";


/**
 * HTTP POST `/api/superAdmins`
 *
 * Creates a new Super Admin with full validation, Azure AD integration, and audit logging.
 * Only SuperAdmin role can create other SuperAdmins.
 *
 * @param ctx - Azure Functions execution context with logging and bindings.
 * @param req - HTTP request object containing super admin data and authorization token.
 *
 * @body CreateSuperAdminRequest - JSON object with email.
 *
 * @returns
 * - **200 OK** → Super Admin created successfully.
 * - **400 Bad Request** → Invalid request data or business rule violation.
 * - **401 Unauthorized** → User not authenticated.
 * - **403 Forbidden** → User lacks SuperAdmin permissions.
 * - **500 Internal Server Error** → Database or system errors.
 */
const create: AzureFunction = withErrorHandler(
  async (ctx: Context, req: HttpRequest) => {
    ctx.log.info(`[CreateSuperAdmin] Processing super admin creation request`);

    await withAuth(ctx, async () => {
      await withSuperAdminCreationAuth()(ctx, async (currentUser: User) => {
        await withBodyValidation(CreateSuperAdminSchema)(ctx, async () => {
          const request = ctx.bindings.validatedBody as CreateSuperAdminRequest;
          
          ctx.log.info(`[CreateSuperAdmin] Creating super admin for ${request.email} by ${currentUser.email}`);
          
          // Execute business logic
          const result = await SuperAdminManagementService.createSuperAdmin(
            request,
            currentUser
          );
          
          ctx.log.info(`[CreateSuperAdmin] Super admin created successfully with ID: ${result.id}`);
          
          return ok(ctx, result);
        });
      });
    });
  },
  { genericMessage: "Failed to create Super Admin" }
);

export default create;
