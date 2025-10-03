import { Prisma, AuditLog } from "@prisma/client";
import prisma from "./prismaClienService";

export enum AuditAction {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
  ROLE_CHANGE = "ROLE_CHANGE",
  SUPERVISOR_CHANGE = "SUPERVISOR_CHANGE",
  STREAM_START = "STREAM_START",
  STREAM_STOP = "STREAM_STOP"
}

export enum AuditEntity {
  USER = "USER",
  COMMAND = "COMMAND",
  RECORDING = "RECORDING",
  SNAPSHOT = "SNAPSHOT",
  CHAT = "CHAT",
  CONTACT_MANAGER = "CONTACT_MANAGER"
}

export interface AuditEntry<T = any> {
  entity: AuditEntity;
  entityId: string;
  action: AuditAction;
  changedById: string;
  dataBefore?: T | null;
  dataAfter?: T | null;
}

export async function logAudit<T = any>(entry: AuditEntry<T>): Promise<void> {
  // build the `data` object and only include JSON fields if not null
  const data: Prisma.AuditLogCreateInput = {
    entity:      entry.entity,
    entityId:    entry.entityId,
    action:      entry.action,
    changedBy: { connect: { id: entry.changedById } },
    ...(entry.dataBefore !== undefined
      ? { dataBefore: entry.dataBefore === null ? Prisma.JsonNull : entry.dataBefore }
      : {}),
    ...(entry.dataAfter !== undefined
      ? { dataAfter: entry.dataAfter === null ? Prisma.JsonNull : entry.dataAfter }
      : {}),
  };

  await prisma.auditLog.create({ data });
}
