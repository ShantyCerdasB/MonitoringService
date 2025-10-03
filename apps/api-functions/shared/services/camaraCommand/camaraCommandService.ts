/**
 * @file camaraCommandService.ts
 * @summary Business logic service for camara commands
 * @description Handles camara command sending logic with WebSocket and Service Bus fallback.
 */

import { User, CommandType } from "@prisma/client";
import { sendAdminCommand } from "../busService";
import { sendToGroup } from "../webPubSubService";
import { CamaraCommandRepository } from "../../repositories/camaraCommand";
import { CamaraCommandMessages } from "../../constants/camaraCommandMessages";
import { DeliveryMethod } from "../../constants/camaraCommandTypes";
import { getCostaRicanTimeISO } from "../../utils/timezone";

export interface CamaraCommandRequest {
  command: CommandType;
  employeeEmail: string;
}

export interface CamaraCommandResult {
  message: string;
  sentVia: DeliveryMethod;
  command: CommandType;
  employeeEmail: string;
  timestamp: string;
}

export class CamaraCommandService {
  /**
   * Sends a camera command to an employee.
   * Tries WebSocket first, falls back to Service Bus.
   * @param request - Camara command request data
   * @param caller - User making the request
   * @returns Result of the operation
   */
  static async sendCommand(
    request: CamaraCommandRequest,
    caller: User
  ): Promise<CamaraCommandResult> {
    const { command, employeeEmail } = request;
    
    // Validate target user
    await CamaraCommandRepository.findAndValidateTargetUser(employeeEmail);
    
    const timestamp = getCostaRicanTimeISO();
    
    // Try immediate WebSocket delivery
    try {
      await sendToGroup(
        employeeEmail.toLowerCase(),
        { command, employeeEmail, timestamp }
      );
      
      return {
        message: CamaraCommandMessages.COMMAND_SENT_WS,
        sentVia: DeliveryMethod.WEBSOCKET,
        command,
        employeeEmail,
        timestamp
      };
    } catch (wsErr) {
      // Fallback to Service Bus
      try {
        await sendAdminCommand(command, employeeEmail);
        
        return {
          message: CamaraCommandMessages.COMMAND_SENT_BUS,
          sentVia: DeliveryMethod.SERVICE_BUS,
          command,
          employeeEmail,
          timestamp
        };
      } catch (busErr) {
        throw new Error(CamaraCommandMessages.FAILED_TO_SEND);
      }
    }
  }
}
