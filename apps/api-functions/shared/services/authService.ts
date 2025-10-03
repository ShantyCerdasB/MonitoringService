/**
 * @file authService.ts
 * @summary Centralized authentication and authorization service
 * @description Provides methods for extracting JWT claims, validating users, and checking permissions.
 * Handles Azure AD token processing and user role validation for the monitoring service API.
 */

import { Context } from "@azure/functions";
import { User, UserRole } from "@prisma/client";
import { ExpectedError } from "../middleware/errorHandler";
import { UserRepository } from "../repositories/userRepo";

/**
 * Authentication service for handling user identity and authorization.
 * Centralizes JWT token processing and user validation logic.
 */
export class AuthService {
  /**
   * Extracts user claims from the Azure Functions context.
   * Expects JWT claims to be attached by the withAuth middleware.
   *
   * @param ctx - Azure Functions execution context.
   * @returns Parsed user claims from JWT token.
   * @throws {ExpectedError} When claims are missing or invalid.
   */
  static extractUserClaims(ctx: Context) {
    const claims = ctx.bindings.user;
    if (!claims) {
      throw new ExpectedError("Authentication required", 401);
    }
    const oid = claims.oid || claims.sub;
    if (!oid) {
      throw new ExpectedError("Cannot determine caller identity", 401);
    }
    return { ...claims, oid };
  }

  /**
   * Retrieves the current authenticated user from the database.
   *
   * @param ctx - Azure Functions execution context.
   * @returns The authenticated user record.
   * @throws {ExpectedError} When user claims are invalid or user not found.
   */
  static async getCurrentUser(ctx: Context): Promise<User> {
    const { oid } = this.extractUserClaims(ctx);
    return UserRepository.findByAzureAdOidWithValidation(oid);
  }

  /**
   * Retrieves the current user and validates they have one of the required roles.
   *
   * @param ctx - Azure Functions execution context.
   * @param allowedRoles - Array of roles that are permitted to access the resource.
   * @returns The authenticated and authorized user record.
   * @throws {ExpectedError} When user is not found or lacks required permissions.
   */
  static async getCurrentUserWithRole(ctx: Context, allowedRoles: UserRole[]): Promise<User> {
    const user = await this.getCurrentUser(ctx);
    UserRepository.validateUserRole(user, allowedRoles);
    return user;
  }

  /**
   * Checks if a user has any of the specified roles.
   *
   * @param user - The user to check.
   * @param roles - Array of roles to check against.
   * @returns True if user has at least one of the specified roles.
   */
  static hasAnyRole(user: User, roles: UserRole[]): boolean {
    return roles.includes(user.role);
  }

  /**
   * Checks if a user has a specific role.
   *
   * @param user - The user to check.
   * @param role - The role to check for.
   * @returns True if user has the specified role.
   */
  static hasRole(user: User, role: UserRole): boolean {
    return user.role === role;
  }

  /**
   * Gets user by Azure AD object ID.
   *
   * @param azureAdId - Azure AD object ID.
   * @returns The user record.
   * @throws {ExpectedError} When user is not found or deleted.
   */
  static async getUserByAzureAdId(azureAdId: string): Promise<User> {
    return UserRepository.findByAzureAdOidWithValidation(azureAdId);
  }
}
