/**
 * @file index.ts
 * @summary Contact manager form endpoint handler
 * @description HTTP POST endpoint for submitting contact manager forms with image processing and chat integration.
 */

import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { withAuth } from "../shared/middleware/auth";
import { withErrorHandler } from "../shared/middleware/errorHandler";
import { withBodyValidation } from "../shared/middleware/validate";
import { withContactManagerFormAuth } from "../shared/middleware/authorization/specific/contactManagerForm";
import { ok } from "../shared/utils/response";
import { ContactManagerFormService } from "../shared/services/contactManagerForm";
import { ContactManagerFormSchema, ContactManagerFormRequest } from "../shared/schemas/contactManagerForm";
import { User } from "@prisma/client";



/**
 * HTTP POST `/api/ContactManagersForm`
 *
 * Allows PSOs to submit contact manager forms with image processing and chat integration.
 * Supports Disconnections, Admissions, and Assistance form types.
 *
 * @param ctx - Azure Functions execution context with logging and bindings.
 * @param req - HTTP request object containing form data and authorization token.
 *
 * @body ContactManagerFormRequest - JSON object with form type and data.
 *
 * @returns
 * - **200 OK** → Form submitted successfully.
 * - **400 Bad Request** → Invalid request data or business rule violation.
 * - **401 Unauthorized** → User not authenticated.
 * - **403 Forbidden** → User lacks PSO permissions.
 * - **500 Internal Server Error** → Database or system errors.
 */
const contactManagersFormFunction: AzureFunction = withErrorHandler(
  async (ctx: Context, req: HttpRequest) => {
    ctx.log.info(`[ContactManagersForm] Processing contact manager form submission`);

    await withAuth(ctx, async () => {
      await withContactManagerFormAuth()(ctx, async (currentUser: User) => {
        await withBodyValidation(ContactManagerFormSchema)(ctx, async () => {
          const formData = ctx.bindings.validatedBody as ContactManagerFormRequest;
          const authToken = (req.headers.authorization || "").split(" ")[1];
          
          ctx.log.info(`[ContactManagersForm] Submitting ${formData.formType} form by ${currentUser.fullName}`);
          
          // Execute business logic
          const result = await ContactManagerFormService.submitForm(
            formData,
            currentUser,
            authToken
          );
          
          ctx.log.info(`[ContactManagersForm] Form submitted successfully with ID: ${result.formId}`);
          
          return ok(ctx, result);
        });
      });
    });
  },
  { genericMessage: "Failed to process contact manager form" }
);

export default contactManagersFormFunction;
