/**
 * @fileoverview PendingCommandFetchSchemas - Zod schemas and interfaces for pending command fetch
 * @summary Type definitions and validation schemas for pending command fetch operations
 * @description Contains request/response interfaces and Zod validation schemas for pending command fetch
 */

import { CommandType } from "@prisma/client";

export interface PendingCommandFetchRequest {
  employeeId: string;
}

export interface PendingCommandFetchResult {
  pending: {
    id: string;
    command: CommandType;
    timestamp: Date;
    employeeId: string;
  } | null;
  status: string;
  message: string;
  ttlMinutes: number;
  ageMs: number;
}

export interface PendingCommandData {
  id: string;
  command: CommandType;
  timestamp: Date;
  employeeId: string;
  createdAt: Date;
  acknowledged: boolean;
  published: boolean;
}
