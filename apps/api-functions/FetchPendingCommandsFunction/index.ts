/**
 * @file index.ts
 * @summary Fetch pending commands endpoint handler
 * @description HTTP GET endpoint for fetching pending commands with full validation and TTL logic.
 */

import { Context, HttpRequest } from "@azure/functions";
import { withAuth } from "../shared/middleware/auth";
import { withErrorHandler } from "../shared/middleware/errorHandler";
import { withPendingCommandFetchAuth } from "../shared/middleware/authorization/specific/pendingCommandFetch";
import { ok, noContent } from "../shared/utils/response";
import { PendingCommandFetchService } from "../shared/services/pendingCommandFetch";
import { User } from "@prisma/client";

/**
 * HTTP GET `/api/FetchPendingCommands`
 *
 * Fetches pending commands for the authenticated employee with TTL validation.
 * Only Employee role can fetch their own pending commands.
 *
 * @param ctx - Azure Functions execution context with logging and bindings.
 * @param req - HTTP request object containing authorization token.
 *
 * @returns
 * - **200 OK** → Pending commands fetched successfully.
 * - **204 No Content** → Command has expired.
 * - **400 Bad Request** → Invalid request data or business rule violation.
 * - **401 Unauthorized** → User not authenticated.
 * - **403 Forbidden** → User lacks Employee permissions.
 * - **404 Not Found** → User not found or deleted.
 * - **500 Internal Server Error** → Database or system errors.
 */
export default withErrorHandler(async (ctx: Context) => {
  const req: HttpRequest = ctx.req!;

  await withAuth(ctx, async () => {
    await withPendingCommandFetchAuth()(ctx, async (currentUser: User) => {
      ctx.log.info(`[FetchPendingCommands] Fetching pending commands for ${currentUser.email}`);
      
      // Execute business logic
      const result = await PendingCommandFetchService.fetchPendingCommands(
        { employeeId: currentUser.id },
        currentUser
      );
      
      ctx.log.info(`[FetchPendingCommands] Commands fetched with status: ${result.status}`);
      
      // Handle different statuses
      if (result.status === "expired") {
        return noContent(ctx);
      }
      
      return ok(ctx, { pending: result.pending });
    });
  });
});
