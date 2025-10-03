/**
 * @file changeSupervisorRepo.ts
 * @summary Repository for change supervisor data operations
 * @description Handles database operations for change supervisor validations.
 */

import { User, UserRole } from "@prisma/client";
import { ExpectedError } from "../../middleware/errorHandler";
import { ChangeSupervisorMessages } from "../../constants/changeSupervisorMessages";
import { UserRepository } from "../userRepo";
import prisma from "../../services/prismaClienService";

export class ChangeSupervisorRepository {
  /**
   * Validates that a supervisor exists and is valid.
   * @param supervisorEmail - Email of the supervisor to validate
   * @returns The validated supervisor or null if no supervisor specified
   * @throws ExpectedError if supervisor not found or not a Supervisor
   */
  static async validateSupervisor(supervisorEmail: string | null): Promise<User | null> {
    if (!supervisorEmail) return null;
    
    const supervisor = await UserRepository.findByEmail(supervisorEmail);
    if (!supervisor || supervisor.deletedAt) {
      throw new ExpectedError(ChangeSupervisorMessages.SUPERVISOR_NOT_FOUND, 400);
    }
    
    if (supervisor.role !== UserRole.Supervisor) {
      throw new ExpectedError(ChangeSupervisorMessages.TARGET_NOT_SUPERVISOR, 400);
    }
    
    return supervisor;
  }

  /**
   * Validates that a supervisor is not assigning employees to themselves.
   * @param supervisor - The supervisor being assigned
   * @param currentUser - The user making the request
   * @throws ExpectedError if supervisor is assigning to themselves
   */
  static validateSupervisorSelfAssignment(
    supervisor: User | null, 
    currentUser: User
  ): void {
    if (supervisor && supervisor.id === currentUser.id) {
      throw new ExpectedError(ChangeSupervisorMessages.SUPERVISOR_CANNOT_ASSIGN_SELF, 400);
    }
  }

  /**
   * Gets the current supervisor of an employee.
   * @param employeeId - ID of the employee
   * @returns The current supervisor or null if none assigned
   */
  static async getCurrentSupervisor(employeeId: string): Promise<User | null> {
    const employee = await prisma.user.findUnique({
      where: { id: employeeId },
      include: { supervisor: true }
    });
    
    return employee?.supervisor || null;
  }
}
