import prisma from "../services/prismaClienService";
import { User, UserRole } from "@prisma/client";
import { ExpectedError } from "../middleware/errorHandler";

/**
 * Repository for user lookups.
 */
export class UserRepository {
  /**
   * Finds a user by Azure AD object id (OID).
   *
   * @param oid - Azure AD object id.
   * @returns The user or null.
   */
  static async findByAzureAdOid(oid: string) {
    return prisma.user.findUnique({ where: { azureAdObjectId: oid } });
  }

  /**
   * Finds a user by id or by Azure AD object id (OID).
   *
   * @param idOrOid - Either the internal user id or the Azure AD object id.
   * @returns The user or null.
   */
  static async findByIdOrOid(idOrOid: string) {
    return prisma.user.findFirst({
      where: {
        OR: [{ id: idOrOid }, { azureAdObjectId: idOrOid }],
      },
    });
  }

  /**
   * Finds a user by Azure AD object id with validation.
   *
   * @param oid - Azure AD object id.
   * @returns The user record.
   * @throws {ExpectedError} When user is not found or deleted.
   */
  static async findByAzureAdOidWithValidation(oid: string): Promise<User> {
    const user = await this.findByAzureAdOid(oid);
    if (!user) {
      throw new ExpectedError("User not found", 401);
    }
    if (user.deletedAt) {
      throw new ExpectedError("User has been deleted", 401);
    }
    return user;
  }

  /**
   * Validates that a user has one of the required roles.
   *
   * @param user - The user to validate.
   * @param allowedRoles - Array of roles that are permitted.
   * @throws {ExpectedError} When user lacks required permissions.
   */
  static validateUserRole(user: User, allowedRoles: UserRole[]): void {
    if (!allowedRoles.includes(user.role)) {
      throw new ExpectedError("Insufficient permissions", 403);
    }
  }

  /**
   * Finds a user by email address.
   *
   * @param email - Email address to search for.
   * @returns The user or null.
   */
  static async findByEmail(email: string) {
    return prisma.user.findUnique({ 
      where: { email: email.toLowerCase() } 
    });
  }
}
