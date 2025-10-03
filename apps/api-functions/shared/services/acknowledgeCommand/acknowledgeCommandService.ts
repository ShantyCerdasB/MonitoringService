/**
 * @file acknowledgeCommandService.ts
 * @summary Business logic service for command acknowledgments
 * @description Handles command acknowledgment logic and validation.
 */

import { User } from "@prisma/client";
import { AcknowledgeCommandMessages } from "../../constants/acknowledgeCommandMessages";
import { AcknowledgeCommandRepository } from "../../repositories/acknowledgeCommand";

export interface AcknowledgeCommandRequest {
  ids: string[];
}

export interface AcknowledgeCommandResult {
  message: string;
  updatedCount: number;
  acknowledgedBy: string;
  timestamp: string;
}

export class AcknowledgeCommandService {
  /**
   * Acknowledges a batch of commands for an employee.
   * @param request - Acknowledge command request data
   * @param currentUser - User making the request
   * @returns Result of the operation
   */
  static async acknowledgeCommands(
    request: AcknowledgeCommandRequest,
    currentUser: User
  ): Promise<AcknowledgeCommandResult> {
    const { ids } = request;
    
    // Mark commands as acknowledged
    const updatedCount = await AcknowledgeCommandRepository.markCommandsAcknowledged(ids);
    
    return {
      message: AcknowledgeCommandMessages.COMMANDS_ACKNOWLEDGED,
      updatedCount,
      acknowledgedBy: currentUser.email,
      timestamp: new Date().toISOString()
    };
  }
}
