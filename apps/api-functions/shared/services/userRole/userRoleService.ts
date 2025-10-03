/**
 * @file userRoleService.ts
 * @summary User role service
 * @description Handles user role operations and filtering.
 */

import { getGraphToken, getServicePrincipalObjectId, fetchAppRoleMemberIds } from "../graphService";
import { UserSyncService } from "../userSync";
import { GraphUser } from "../graphService";

/**
 * Represents a user plus assigned App Role.
 */
export interface TenantUserWithRole {
  /** Azure AD object ID */
  azureAdObjectId: string;
  /** Email address; prefer `mail`, fallback to `userPrincipalName` */
  email: string;
  /** Full name from Azure AD (displayName) */
  fullName: string;
  /**
   * Role assigned via App Role assignment.
   * E.g. "Supervisor", "Admin", or "Employee".
   */
  role: string;
}

export class UserRoleService {
  /**
   * Fetch all users and return those having one of the given App Roles.
   * @param token - Bearer token for Graph API.
   * @param servicePrincipalId - Object ID of the Service Principal of your application.
   * @param roleMap - Record mapping role name to App Role ID, e.g. { Supervisor: "...", Admin: "...", Employee: "..." }.
   * @returns Promise resolving to array of TenantUserWithRole (only users assigned to one of these roles).
   * @throws Error if Graph requests fail.
   */
  static async fetchUsersWithAppRole(
    token: string,
    servicePrincipalId: string,
    roleMap: Record<string, string>
  ): Promise<TenantUserWithRole[]> {
    // 1. Fetch all App Role assignments for each role
    const roleIds = Object.values(roleMap);
    const roleNames = Object.keys(roleMap);

    // Prepare map from roleId to roleName
    const idToName: Record<string, string> = {};
    for (const name of roleNames) {
      idToName[roleMap[name]] = name;
    }

    // Fetch member IDs per role
    const fetchPromises = roleIds.map((rid) =>
      fetchAppRoleMemberIds(token, servicePrincipalId, rid)
    );
    const sets = await Promise.all(fetchPromises);
    // Combine into a map: roleName -> Set<principalId>
    const roleSets: Record<string, Set<string>> = {};
    roleNames.forEach((name, idx) => {
      roleSets[name] = sets[idx];
    });

    // 2. Fetch all users
    const allUsers = await UserSyncService.fetchAllUsers(token);

    // 3. Filter users who appear in any role set
    const result: TenantUserWithRole[] = [];
    for (const u of allUsers) {
      if (u.accountEnabled === false) continue;
      const id = u.id;
      // Determine role precedence if needed (e.g., Supervisor > Admin > Employee).
      // Here we check in the order of roleNames array.
      let assignedRole: string | undefined;
      for (const roleName of roleNames) {
        if (roleSets[roleName].has(id)) {
          assignedRole = roleName;
          break;
        }
      }
      if (!assignedRole) {
        continue;
      }
      const email = u.mail || u.userPrincipalName || "";
      const fullName = u.displayName || "";
      if (!email) {
        // skip if no usable email/UPN
        continue;
      }
      result.push({
        azureAdObjectId: id,
        email,
        fullName,
        role: assignedRole,
      });
    }
    return result;
  }

  /**
   * Get users with specific role from tenant.
   * @param roleName - Name of the role to filter by
   * @param roleId - App Role ID for the role
   * @returns Promise resolving to array of users with the specified role
   */
  static async getUsersByRole(roleName: string, roleId: string): Promise<TenantUserWithRole[]> {
    const token = await getGraphToken();
    const clientId = process.env.APP_CLIENT_ID || process.env.AZURE_CLIENT_ID;
    const spId = await getServicePrincipalObjectId(token, clientId!);
    
    const roleMap = { [roleName]: roleId };
    return this.fetchUsersWithAppRole(token, spId, roleMap);
  }
}
