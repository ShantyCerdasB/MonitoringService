/**
 * @file index.ts
 * @summary User management schemas barrel export
 * @description Exports all user management schemas.
 */

export {
  CreateContactManagerSchema,
  type CreateContactManagerRequest,
  type CreateContactManagerResult
} from "./contactManagerSchemas";

export {
  CreateSuperAdminSchema,
  type CreateSuperAdminRequest,
  type CreateSuperAdminResult
} from "./superAdminSchemas";
