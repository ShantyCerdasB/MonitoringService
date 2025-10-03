/**
 * @file index.ts
 * @summary Create contact manager endpoint handler
 * @description HTTP POST endpoint for creating contact managers with full validation and audit logging.
 */

import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { withAuth } from "../shared/middleware/auth";
import { withErrorHandler } from "../shared/middleware/errorHandler";
import { withBodyValidation } from "../shared/middleware/validate";
import { withContactManagerCreationAuth } from "../shared/middleware/authorization/specific/userManagement";
import { ok } from "../shared/utils/response";
import { ContactManagerManagementService } from "../shared/services/contactManagerManagement";
import { CreateContactManagerSchema, CreateContactManagerRequest } from "../shared/schemas/userManagement";
import { User } from "@prisma/client";


/**
 * HTTP POST `/api/contactManagers`
 *
 * Creates a new Contact Manager with full validation, Azure AD integration, and audit logging.
 * Only Admin and SuperAdmin roles can create Contact Managers.
 *
 * @param ctx - Azure Functions execution context with logging and bindings.
 * @param req - HTTP request object containing contact manager data and authorization token.
 *
 * @body CreateContactManagerRequest - JSON object with email and initial status.
 *
 * @returns
 * - **200 OK** → Contact Manager created successfully.
 * - **400 Bad Request** → Invalid request data or business rule violation.
 * - **401 Unauthorized** → User not authenticated.
 * - **403 Forbidden** → User lacks Admin/SuperAdmin permissions.
 * - **500 Internal Server Error** → Database or system errors.
 */
const create: AzureFunction = withErrorHandler(
  async (ctx: Context, req: HttpRequest) => {
    ctx.log.info(`[CreateContactManager] Processing contact manager creation request`);

    await withAuth(ctx, async () => {
      await withContactManagerCreationAuth()(ctx, async (currentUser: User) => {
        await withBodyValidation(CreateContactManagerSchema)(ctx, async () => {
          const request = ctx.bindings.validatedBody as CreateContactManagerRequest;
          
          ctx.log.info(`[CreateContactManager] Creating contact manager for ${request.email} by ${currentUser.email}`);
          
          // Execute business logic
          const result = await ContactManagerManagementService.createContactManager(
            request,
            currentUser
          );
          
          ctx.log.info(`[CreateContactManager] Contact manager created successfully with ID: ${result.id}`);
          
          return ok(ctx, result);
        });
      });
    });
  },
  { genericMessage: "Failed to create Contact Manager" }
);

export default create;
