/**
 * @file core.ts
 * @summary Core authorization middleware
 * @description Core authorization middleware functions for role-based access control.
 */

import { Context } from "@azure/functions";
import { User, UserRole } from "@prisma/client";
import { ExpectedError } from "../errorHandler";
import { AuthService } from "../../services/authService";

/**
 * Generic authorization middleware that checks if user has required roles.
 * @param requiredRoles - Array of roles that can access the resource
 * @returns Middleware function
 */
export function withAuthorization(requiredRoles: UserRole[]) {
  return (ctx: Context, next: (currentUser: User) => Promise<any>) => {
    return async () => {
      const claims = ctx.bindings.user;
      const azureAdId = (claims.oid ?? claims.sub) as string | undefined;
      
      if (!azureAdId) {
        throw new ExpectedError("Cannot determine user identity", 401);
      }

      const user = await AuthService.getUserByAzureAdId(azureAdId);
      if (!user || user.deletedAt) {
        throw new ExpectedError("User not found or deleted", 401);
      }

      if (!requiredRoles.includes(user.role)) {
        throw new ExpectedError("Insufficient permissions", 403);
      }

      return next(user);
    };
  };
}

/**
 * Authorization middleware for a single specific role.
 * @param requiredRole - The specific role required
 * @returns Middleware function
 */
export function withSingleRoleAuth(requiredRole: UserRole) {
  return withAuthorization([requiredRole]);
}

/**
 * Authorization middleware that allows any authenticated user.
 * @returns Middleware function
 */
export function withAnyUserAuth() {
  return (ctx: Context, next: (currentUser: User) => Promise<any>) => {
    return async () => {
      const claims = ctx.bindings.user;
      const azureAdId = (claims.oid ?? claims.sub) as string | undefined;
      
      if (!azureAdId) {
        throw new ExpectedError("Cannot determine user identity", 401);
      }

      const user = await AuthService.getUserByAzureAdId(azureAdId);
      if (!user || user.deletedAt) {
        throw new ExpectedError("User not found or deleted", 401);
      }

      return next(user);
    };
  };
}
