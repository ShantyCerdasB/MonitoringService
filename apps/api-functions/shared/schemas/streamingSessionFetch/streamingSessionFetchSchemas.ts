/**
 * @fileoverview StreamingSessionFetchSchemas - Zod schemas and interfaces for streaming session fetch
 * @summary Type definitions and validation schemas for streaming session fetch operations
 * @description Contains request/response interfaces and Zod validation schemas for streaming session fetch
 */

export interface StreamingSessionFetchRequest {
  filters?: StreamingSessionFilters;
}

export interface StreamingSessionFilters {
  userId?: string;
  supervisorId?: string;
}

export interface StreamingSessionFetchResult {
  sessions: StreamingSessionDto[];
  status: string;
  message: string;
  totalCount: number;
}

export interface StreamingSessionDto {
  email: string;
  startedAt: string;
  userId: string;
}
