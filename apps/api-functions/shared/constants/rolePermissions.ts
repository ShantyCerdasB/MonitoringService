/**
 * @file rolePermissions.ts
 * @summary Role-based permissions and authorization utilities
 * @description Centralized role permissions and authorization logic.
 */

import { UserRole } from "@prisma/client";

/**
 * Role-based permissions for different operations.
 * Defines which roles can perform specific actions.
 */
export const RolePermissions = {
  /**
   * Super admin operations.
   * Only SuperAdmin role can access.
   */
  SUPER_ADMIN_OPERATIONS: [UserRole.SuperAdmin] as UserRole[],

  /**
   * Admin operations.
   * Includes Admin and SuperAdmin roles.
   */
  ADMIN_OPERATIONS: [UserRole.Admin, UserRole.SuperAdmin] as UserRole[],

  /**
   * Command sender operations.
   * Includes Admin, Supervisor, and SuperAdmin roles.
   */
  COMMAND_SENDER_OPERATIONS: [UserRole.Admin, UserRole.Supervisor, UserRole.SuperAdmin] as UserRole[],
  SUPERVISOR_MANAGEMENT_OPERATIONS: [UserRole.Admin, UserRole.Supervisor, UserRole.SuperAdmin] as UserRole[],
  USER_ROLE_MANAGEMENT_OPERATIONS: [UserRole.Admin, UserRole.Supervisor, UserRole.SuperAdmin] as UserRole[],
  PSO_OPERATIONS: [UserRole.ContactManager] as UserRole[],

  /**
   * Operational access.
   * Includes Admin, Supervisor, Employee, and SuperAdmin roles.
   */
  OPERATIONAL_ACCESS: [UserRole.Admin, UserRole.Supervisor, UserRole.Employee, UserRole.SuperAdmin] as UserRole[],

  /**
   * Contact manager operations.
   * Includes ContactManager, Admin, and SuperAdmin roles.
   */
  CONTACT_MANAGER_OPERATIONS: [UserRole.ContactManager, UserRole.Admin, UserRole.SuperAdmin] as UserRole[],

  /**
   * All authenticated users.
   * Any user with a valid role can access.
   */
  ANY_AUTHENTICATED_USER: [UserRole.SuperAdmin, UserRole.Admin, UserRole.Supervisor, UserRole.Employee, UserRole.ContactManager] as UserRole[],

  /**
   * Employee role only.
   * Only Employee role can access.
   */
  EMPLOYEE_ROLE: [UserRole.Employee] as UserRole[],
};

/**
 * Type-safe role arrays for TypeScript inference.
 */
export type SuperAdminOperationRoles = typeof RolePermissions.SUPER_ADMIN_OPERATIONS[number];
export type AdminOperationRoles = typeof RolePermissions.ADMIN_OPERATIONS[number];
export type CommandSenderRoles = typeof RolePermissions.COMMAND_SENDER_OPERATIONS[number];
export type OperationalAccessRoles = typeof RolePermissions.OPERATIONAL_ACCESS[number];
export type ContactManagerOperationRoles = typeof RolePermissions.CONTACT_MANAGER_OPERATIONS[number];
export type EmployeeRole = typeof RolePermissions.EMPLOYEE_ROLE[number];

/**
 * Utility functions for role checking.
 * Provides type-safe methods for validating user permissions.
 */
export class RoleChecker {
  /**
   * Checks if a role has super admin permissions.
   */
  static isSuperAdmin(role: UserRole): boolean {
    return role === UserRole.SuperAdmin;
  }

  /**
   * Checks if a role has admin permissions.
   */
  static isAdmin(role: UserRole): boolean {
    return role === UserRole.Admin || role === UserRole.SuperAdmin;
  }

  /**
   * Checks if a role can send commands.
   */
  static canSendCommands(role: UserRole): boolean {
    return (RolePermissions.COMMAND_SENDER_OPERATIONS as readonly string[]).includes(role);
  }

  /**
   * Checks if a role has operational access.
   */
  static hasOperationalAccess(role: UserRole): boolean {
    return (RolePermissions.OPERATIONAL_ACCESS as readonly string[]).includes(role);
  }

  /**
   * Checks if a role can manage contact managers.
   */
  static canManageContactManagers(role: UserRole): boolean {
    return (RolePermissions.CONTACT_MANAGER_OPERATIONS as readonly string[]).includes(role);
  }

  /**
   * Checks if a role is employee only.
   */
  static isEmployee(role: UserRole): boolean {
    return role === UserRole.Employee;
  }
}
