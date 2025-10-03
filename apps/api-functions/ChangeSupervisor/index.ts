/**
 * @file index.ts
 * @summary Change supervisor endpoint handler
 * @description HTTP POST endpoint for changing supervisor assignments for employees.
 * Supports bulk operations and supervisor removal.
 */

import { AzureFunction, Context } from "@azure/functions";
import { withAuth } from "../shared/middleware/auth";
import { withErrorHandler } from "../shared/middleware/errorHandler";
import { withBodyValidation } from "../shared/middleware/validate";
import { withChangeSupervisorAuth } from "../shared/middleware/authorization/specific/changeSupervisor";
import { ok } from "../shared/utils/response";
import { ChangeSupervisorService } from "../shared/services/changeSupervisor";
import { changeSupervisorRequestSchema, ChangeSupervisorRequest } from "../shared/schemas/changeSupervisor/changeSupervisorSchemas";
import { User } from "@prisma/client";

/**
 * HTTP POST `/api/ChangeSupervisor`
 *
 * Allows authorized users to change supervisor assignments for employees.
 * Supports bulk operations and supervisor removal.
 *
 * @param ctx - Azure Functions execution context with logging and bindings.
 * @param req - HTTP request object containing user emails and new supervisor email.
 *
 * @body ChangeSupervisorRequest - JSON object with user emails and new supervisor email.
 *
 * @returns
 * - **200 OK** → Supervisor assignments updated successfully.
 * - **400 Bad Request** → Invalid request data or supervisor not found.
 * - **401 Unauthorized** → User not authenticated.
 * - **403 Forbidden** → User lacks required permissions.
 * - **500 Internal Server Error** → Database or system errors.
 */
const changeSupervisor: AzureFunction = withErrorHandler(
  async (ctx: Context) => {
    ctx.log.info(`[ChangeSupervisor] Processing supervisor assignment changes`);

    await withAuth(ctx, async () => {
      await withChangeSupervisorAuth()(ctx, async (currentUser: User) => {
        await withBodyValidation(changeSupervisorRequestSchema)(ctx, async () => {
          const { userEmails, newSupervisorEmail } = ctx.bindings.validatedBody as ChangeSupervisorRequest;
          
          ctx.log.info(`[ChangeSupervisor] Changing supervisor for ${userEmails.length} users to ${newSupervisorEmail || "none"} by ${currentUser.email}`);
          
          // Execute business logic
          const result = await ChangeSupervisorService.changeSupervisorAssignments(
            { userEmails, newSupervisorEmail },
            currentUser
          );
          
          ctx.log.info(`[ChangeSupervisor] Updated ${result.updatedCount} users, skipped ${result.skippedCount} users`);
          
          return ok(ctx, result);
        });
      });
    });
  },
  { genericMessage: "Failed to change supervisor assignments" }
);

export default changeSupervisor;
