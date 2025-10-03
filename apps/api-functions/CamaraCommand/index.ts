/**
 * @file index.ts
 * @summary Camara command endpoint handler
 * @description HTTP POST endpoint for sending camera commands to employees.
 * Implements WebSocket-first delivery with Service Bus fallback.
 */

import { AzureFunction, Context } from "@azure/functions";
import { withAuth } from "../shared/middleware/auth";
import { withErrorHandler } from "../shared/middleware/errorHandler";
import { withBodyValidation } from "../shared/middleware/validate";
import { withCamaraCommandAuth } from "../shared/middleware/authorization/specific/camaraCommand";
import { ok } from "../shared/utils/response";
import { CamaraCommandService } from "../shared/services/camaraCommand";
import { camaraCommandRequestSchema, CamaraCommandRequest } from "../shared/schemas/camaraCommand/camaraCommandSchemas";
import { User } from "@prisma/client";

/**
 * HTTP POST `/api/CamaraCommand`
 *
 * Allows authorized users to send camera commands to employees.
 * Implements WebSocket-first delivery with Service Bus fallback.
 *
 * @param ctx - Azure Functions execution context with logging and bindings.
 * @param req - HTTP request object containing command and employee email.
 *
 * @body CamaraCommandRequest - JSON object with command type and employee email.
 *
 * @returns
 * - **200 OK** → Command sent successfully (via WebSocket or Service Bus).
 * - **400 Bad Request** → Invalid request data or target user not found.
 * - **401 Unauthorized** → User not authenticated.
 * - **403 Forbidden** → User lacks required permissions.
 * - **500 Internal Server Error** → Database or system errors.
 */
const camaraCommand: AzureFunction = withErrorHandler(
  async (ctx: Context) => {
    ctx.log.info(`[CamaraCommand] Processing camera command request`);

    await withAuth(ctx, async () => {
      await withCamaraCommandAuth()(ctx, async (currentUser: User) => {
        await withBodyValidation(camaraCommandRequestSchema)(ctx, async () => {
          const { command, employeeEmail } = ctx.bindings.validatedBody as CamaraCommandRequest;
          
          ctx.log.info(`[CamaraCommand] Sending ${command} command to ${employeeEmail} by ${currentUser.email}`);
          
          // Execute business logic
          const result = await CamaraCommandService.sendCommand(
            { command, employeeEmail },
            currentUser
          );
          
          ctx.log.info(`[CamaraCommand] Command sent via ${result.sentVia}`);
          
          return ok(ctx, result);
        });
      });
    });
  },
  { genericMessage: "Failed to send camera command" }
);

export default camaraCommand;
