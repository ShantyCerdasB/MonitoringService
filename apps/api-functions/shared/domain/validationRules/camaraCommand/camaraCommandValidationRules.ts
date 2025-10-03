/**
 * @file camaraCommandValidationRules.ts
 * @summary Domain validation rules for camara command operations
 * @description Business rule validations for camera command operations.
 */

import { User, UserRole } from "@prisma/client";
import { ExpectedError } from "../../../middleware/errorHandler";
import { CamaraCommandMessages } from "../../../constants/camaraCommandMessages";
import prisma from "../../../services/prismaClienService";

export class CamaraCommandValidationRules {
  /**
   * Finds target user by email and validates they are an Employee.
   * @param email - Email of the target user
   * @returns The validated user
   * @throws ExpectedError if user not found, deleted, or not an Employee
   */
  static async findAndValidateTargetUser(email: string): Promise<User> {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });
    
    if (!user) {
      throw new ExpectedError(CamaraCommandMessages.TARGET_NOT_FOUND, 400);
    }
    
    if (user.deletedAt) {
      throw new ExpectedError(CamaraCommandMessages.TARGET_NOT_FOUND, 400);
    }
    
    if (user.role !== UserRole.Employee) {
      throw new ExpectedError(CamaraCommandMessages.TARGET_NOT_FOUND, 400);
    }
    
    return user;
  }

  /**
   * Validates that the caller has permission to send commands.
   * @param callerRole - Role of the user sending the command
   * @throws ExpectedError if caller lacks permissions
   */
  static validateCallerPermissions(callerRole: UserRole): void {
    const allowedRoles = [UserRole.Admin, UserRole.Supervisor, UserRole.SuperAdmin];
    
    if (!allowedRoles.includes(callerRole as any)) {
      throw new ExpectedError(CamaraCommandMessages.INSUFFICIENT_PERMISSIONS, 403);
    }
  }

  /**
   * Validates that the target user is online and available for commands.
   * @param targetUser - The target user to validate
   * @throws ExpectedError if user is not available
   */
  static validateTargetUserAvailability(targetUser: User): void {
    if (targetUser.deletedAt) {
      throw new ExpectedError(CamaraCommandMessages.TARGET_NOT_FOUND, 400);
    }
    
    if (targetUser.role !== UserRole.Employee) {
      throw new ExpectedError(CamaraCommandMessages.TARGET_NOT_FOUND, 400);
    }
  }

  /**
   * Validates that the command type is valid for the target user.
   * @param command - The command being sent
   * @param targetUser - The target user
   * @throws ExpectedError if command is invalid for user
   */
  static validateCommandForUser(command: string, targetUser: User): void {
    // Only Employees can receive camera commands
    if (targetUser.role !== UserRole.Employee) {
      throw new ExpectedError(CamaraCommandMessages.TARGET_NOT_FOUND, 400);
    }
  }
}
