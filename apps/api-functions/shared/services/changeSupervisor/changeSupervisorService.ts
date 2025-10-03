/**
 * @file changeSupervisorService.ts
 * @summary Business logic service for change supervisor operations
 * @description Handles supervisor assignment logic with validation and audit logging.
 */

import { User, UserRole } from "@prisma/client";
import { ChangeSupervisorRepository } from "../../repositories/changeSupervisor";
import { ChangeSupervisorMessages } from "../../constants/changeSupervisorMessages";
import { ChangeSupervisorStatus } from "../../constants/changeSupervisorTypes";
import { logAudit, AuditAction, AuditEntity } from "../auditService";
import { upsertUserRole } from "../userService";
import { UserRepository } from "../../repositories/userRepo";
import { getCostaRicanTimeISO } from "../../utils/timezone";

export interface ChangeSupervisorRequest {
  userEmails: string[];
  newSupervisorEmail: string | null;
}

export interface ChangeSupervisorResult {
  message: string;
  updatedCount: number;
  skippedCount: number;
  status: ChangeSupervisorStatus;
  details: {
    updated: string[];
    skipped: string[];
  };
}

export class ChangeSupervisorService {
  /**
   * Changes supervisor assignments for multiple employees.
   * @param request - Change supervisor request data
   * @param currentUser - User making the request
   * @returns Result of the operation
   */
  static async changeSupervisorAssignments(
    request: ChangeSupervisorRequest,
    currentUser: User
  ): Promise<ChangeSupervisorResult> {
    const { userEmails, newSupervisorEmail } = request;
    
    // Validate supervisor
    const supervisor = await ChangeSupervisorRepository.validateSupervisor(newSupervisorEmail);
    
    // Validate supervisor is not assigning to themselves
    ChangeSupervisorRepository.validateSupervisorSelfAssignment(supervisor, currentUser);
    
    const updated: string[] = [];
    const skipped: string[] = [];
    let updatedCount = 0;
    let skippedCount = 0;
    
    // Process each employee
    for (const email of userEmails) {
      try {
        const existing = await UserRepository.findByEmail(email);
        
        // Skip if user exists with non-Employee role
        if (existing && existing.role && existing.role !== UserRole.Employee) {
          skipped.push(`${email} (role: ${existing.role})`);
          skippedCount++;
          continue;
        }
        
        // Get current supervisor for audit
        const currentSupervisor = existing 
          ? await ChangeSupervisorRepository.getCurrentSupervisor(existing.id)
          : null;
        
        // Upsert user as Employee with new supervisor
        const oidForCreate = existing?.azureAdObjectId ?? crypto.randomUUID();
        await upsertUserRole(
          email,
          oidForCreate,
          existing?.fullName ?? email,
          UserRole.Employee,
          supervisor?.id || null
        );
        
        // Log audit
        await logAudit({
          entity: AuditEntity.USER,
          entityId: existing?.id || email,
          action: AuditAction.SUPERVISOR_CHANGE,
          changedById: currentUser.id,
          dataAfter: {
            supervisor: supervisor?.email || null,
            previousSupervisor: currentSupervisor?.email || null,
            employee: email
          }
        });
        
        updated.push(email);
        updatedCount++;
        
      } catch (error: any) {
        skipped.push(`${email} (error: ${error.message})`);
        skippedCount++;
      }
    }
    
    // Determine status
    const status = skippedCount === 0 
      ? ChangeSupervisorStatus.SUCCESS 
      : updatedCount > 0 
        ? ChangeSupervisorStatus.PARTIAL_SUCCESS 
        : ChangeSupervisorStatus.FAILED;
    
    return {
      message: ChangeSupervisorMessages.ASSIGNMENTS_UPDATED,
      updatedCount,
      skippedCount,
      status,
      details: { updated, skipped }
    };
  }
}
