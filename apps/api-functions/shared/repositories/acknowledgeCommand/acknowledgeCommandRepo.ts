/**
 * @file acknowledgeCommandRepo.ts
 * @summary Repository for acknowledge command data operations
 * @description Handles database operations for command acknowledgments.
 */

import prisma from "../../services/prismaClienService";

export class AcknowledgeCommandRepository {
  /**
   * Marks a batch of commands as acknowledged.
   * @param ids - Array of command IDs to acknowledge
   * @returns Number of records successfully updated
   */
  static async markCommandsAcknowledged(ids: string[]): Promise<number> {
    const result = await prisma.pendingCommand.updateMany({
      where: { id: { in: ids } },
      data: {
        acknowledged: true,
        acknowledgedAt: new Date(),
      },
    });
    return result.count;
  }
}
