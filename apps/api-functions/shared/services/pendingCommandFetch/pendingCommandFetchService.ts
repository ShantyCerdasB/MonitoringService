/**
 * @fileoverview PendingCommandFetchService - Service for pending command fetch operations
 * @summary Core business logic for pending command fetch with validation
 * @description Handles pending command fetch with full validation and TTL logic
 */

import { User, UserRole } from "@prisma/client";
import { PendingCommandFetchValidationRules } from "../../domain/validationRules/pendingCommandFetch";
import { PendingCommandFetchMessages, PendingCommandFetchStatus } from "../../constants/pendingCommandFetchMessages";
import { getPendingCommandsForEmployee } from "../pendingCommandService";
import { PendingCommandFetchRequest, PendingCommandFetchResult, PendingCommandData } from "../../schemas/pendingCommandFetch";

export class PendingCommandFetchService {
  /**
   * Fetches pending commands for an employee with full validation and TTL logic.
   * @param request - Pending command fetch request data
   * @param caller - User fetching the commands
   * @returns Result of the fetch operation
   */
  static async fetchPendingCommands(
    request: PendingCommandFetchRequest,
    caller: User
  ): Promise<PendingCommandFetchResult> {
    const { employeeId } = request;

    // 1. Validate business rules
    PendingCommandFetchValidationRules.validateUserExists(caller);
    PendingCommandFetchValidationRules.validateUserNotDeleted(caller);
    PendingCommandFetchValidationRules.validateEmployeePermissions(caller.role);

    // 2. Validate that the caller is fetching their own commands
    if (caller.id !== employeeId) {
      throw new Error("Employees can only fetch their own pending commands");
    }

    try {
      // 3. Fetch all un-acknowledged commands
      const pendingList = await getPendingCommandsForEmployee(employeeId);

      // 4. Select the most recent command, if exists
      const latest = pendingList.length > 0
        ? pendingList.reduce((prev, curr) =>
            curr.timestamp > prev.timestamp ? curr : prev
          )
        : null;

      if (!latest) {
        return {
          pending: null,
          status: PendingCommandFetchStatus.NO_COMMANDS,
          message: PendingCommandFetchMessages.NO_PENDING_COMMANDS,
          ttlMinutes: this.getTTLMinutes(),
          ageMs: 0
        };
      }

      // 5. Check TTL
      const ttlMinutes = this.getTTLMinutes();
      const ageMs = Date.now() - new Date(latest.timestamp).getTime();

      if (ageMs > ttlMinutes * 60 * 1000) {
        return {
          pending: null,
          status: PendingCommandFetchStatus.EXPIRED,
          message: PendingCommandFetchMessages.COMMAND_EXPIRED,
          ttlMinutes,
          ageMs
        };
      }

      // 6. Return valid command
      return {
        pending: {
          id: latest.id,
          command: latest.command,
          timestamp: latest.timestamp,
          employeeId: latest.employeeId
        },
        status: PendingCommandFetchStatus.SUCCESS,
        message: PendingCommandFetchMessages.COMMANDS_FETCHED,
        ttlMinutes,
        ageMs
      };
    } catch (error: any) {
      throw new Error(`${PendingCommandFetchMessages.FETCH_FAILED}: ${error.message}`);
    }
  }

  /**
   * Gets TTL minutes from environment variable.
   * @returns TTL in minutes
   */
  private static getTTLMinutes(): number {
    return parseInt(process.env.PENDING_COMMAND_TTL_MINUTES || "5", 10);
  }
}
