/**
 * @file camaraCommandRepo.ts
 * @summary Repository for camara command data operations
 * @description Handles database operations for camara command validations.
 */

import { User } from "@prisma/client";
import { ExpectedError } from "../../middleware/errorHandler";
import { CamaraCommandMessages } from "../../constants/camaraCommandMessages";
import prisma from "../../services/prismaClienService";

export class CamaraCommandRepository {
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
    
    if (user.role !== "Employee") {
      throw new ExpectedError(CamaraCommandMessages.TARGET_NOT_FOUND, 400);
    }
    
    return user;
  }
}
