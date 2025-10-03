/**
 * @file index.ts
 * @summary Acknowledge command endpoint handler
 * @description HTTP POST endpoint for acknowledging camera commands.
 * Implements role-based authorization for employees.
 */

import { AzureFunction, Context } from "@azure/functions";
import { withAuth } from "../shared/middleware/auth";
import { withErrorHandler } from "../shared/middleware/errorHandler";
import { withBodyValidation } from "../shared/middleware/validate";
import { withAcknowledgeCommandAuth } from "../shared/middleware/authorization/specific/acknowledgeCommand";
import { ok } from "../shared/utils/response";
import { AcknowledgeCommandService } from "../shared/services/acknowledgeCommand";
import { acknowledgeCommandRequestSchema, AcknowledgeCommandRequest } from "../shared/schemas/acknowledgeCommand/acknowledgeCommandSchemas";
import { User } from "@prisma/client";

/**
 * HTTP POST `/api/AcknowledgeCommand`
 *
 * Allows authenticated employees to acknowledge receipt and processing
 * of one or more pending camera commands. Marks each specified PendingCommand
 * record as acknowledged in the database.
 *
 * @param ctx - Azure Functions execution context with logging and bindings.
 * @param req - HTTP request object containing command IDs to acknowledge.
 *
 * @body AcknowledgeCommandRequest - JSON object with array of command IDs.
 *
 * @returns
 * - **200 OK** → Commands acknowledged successfully.
 * - **400 Bad Request** → Invalid request data.
 * - **401 Unauthorized** → User not authenticated.
 * - **403 Forbidden** → User lacks required permissions.
 * - **500 Internal Server Error** → Database or system errors.
 */
const acknowledgeCommand: AzureFunction = withErrorHandler(
  async (ctx: Context) => {
    ctx.log.info(`[AcknowledgeCommand] Processing command acknowledgment request`);

    await withAuth(ctx, async () => {
      await withAcknowledgeCommandAuth()(ctx, async (currentUser: User) => {
        await withBodyValidation(acknowledgeCommandRequestSchema)(ctx, async () => {
          const { ids } = ctx.bindings.validatedBody as AcknowledgeCommandRequest;
          
          ctx.log.info(`[AcknowledgeCommand] Acknowledging ${ids.length} commands for employee: ${currentUser.email}`);
          
          // Execute business logic
          const result = await AcknowledgeCommandService.acknowledgeCommands(
            { ids },
            currentUser
          );
          
          ctx.log.info(`[AcknowledgeCommand] Successfully acknowledged ${result.updatedCount} commands`);
          
          return ok(ctx, result);
        });
      });
    });
  },
  { genericMessage: "Failed to acknowledge commands" }
);

export default acknowledgeCommand;
