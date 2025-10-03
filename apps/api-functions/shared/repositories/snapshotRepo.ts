/**
 * @fileoverview SnapshotRepository - Repository for snapshot operations
 * @summary Data access layer for snapshot operations
 * @description Handles all database operations related to snapshots
 */

import prisma from "../services/prismaClienService";

export class SnapshotRepository {
  /**
   * Finds a snapshot by ID.
   * @param id - Snapshot ID
   * @returns Snapshot or null
   */
  static async findById(id: string) {
    return prisma.snapshot.findUnique({ where: { id } });
  }

  /**
   * Deletes a snapshot by ID.
   * @param id - Snapshot ID
   * @returns The deleted snapshot
   */
  static async deleteById(id: string) {
    return prisma.snapshot.delete({ where: { id } });
  }
}
