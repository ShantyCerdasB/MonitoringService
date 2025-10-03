/**
 * @file changeSupervisorTypes.ts
 * @summary Type constants for change supervisor operations
 * @description Local enums and types for change supervisor functionality.
 */

/**
 * Status of supervisor assignment operations.
 */
export enum ChangeSupervisorStatus {
  SUCCESS = "success",
  PARTIAL_SUCCESS = "partial_success",
  FAILED = "failed"
}

/**
 * Types of supervisor assignment operations.
 */
export enum SupervisorAssignmentType {
  ASSIGN = "assign",
  REMOVE = "remove",
  CHANGE = "change"
}
