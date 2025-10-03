/**
 * @file userRoleManagementService.ts
 * @summary User role management service
 * @description Handles specific user role management operations with business logic.
 */

import axios from "axios";
import { getGraphToken, getServicePrincipalObjectId } from "../graphService";

export class UserRoleManagementService {
  /**
   * Remove **all** App Role assignments for a given **user** on your application's Service Principal.
   * @param token - A valid Microsoft Graph bearer token.
   * @param servicePrincipalObjectId - The object ID of your application's Service Principal.
   * @param userObjectId - The object ID of the user whose roles you wish to clear.
   * @throws When any Graph call fails (list or delete).
   * @remarks
   *   - Uses the user-side endpoint `/users/{id}/appRoleAssignments`.
   *   - Filters assignments to only those granted to *this* Service Principal.
   *   - Logs every GET and DELETE request, as well as success/failure.
   */
  static async removeAllAppRolesFromUser(
    token: string,
    servicePrincipalObjectId: string,
    userObjectId: string
  ): Promise<void> {
    const baseUrl = `https://graph.microsoft.com/v1.0`;
    const listUrl = `${baseUrl}/users/${userObjectId}/appRoleAssignments` +
      `?$filter=resourceId eq ${servicePrincipalObjectId}`;

    console.info(`[removeAllAppRolesFromUser] Listing assignments for user ${userObjectId}`);
    console.debug(`[removeAllAppRolesFromUser] GET ${listUrl}`);

    let assignments: Array<{ id: string }> = [];
    try {
      const resp = await axios.get(listUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      assignments = resp.data?.value || [];
      console.info(
        `[removeAllAppRolesFromUser] Found ${assignments.length} assignment(s) for SP ${servicePrincipalObjectId}`
      );
    } catch (err: any) {
      console.error(
        `[removeAllAppRolesFromUser] Failed to list user's appRoleAssignments: ${
          err.response?.status
        } - ${JSON.stringify(err.response?.data) || err.message}`
      );
      throw err;
    }

    for (const { id: assignmentId } of assignments) {
      const deleteUrl = `${baseUrl}/users/${userObjectId}/appRoleAssignments/${assignmentId}`;
      console.debug(
        `[removeAllAppRolesFromUser] Deleting assignment ${assignmentId} -> DELETE ${deleteUrl}`
      );
      try {
        await axios.delete(deleteUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.info(
          `[removeAllAppRolesFromUser] Successfully deleted assignment ${assignmentId}`
        );
      } catch (err: any) {
        console.error(
          `[removeAllAppRolesFromUser] Failed to delete assignment ${assignmentId}: ${
            err.response?.status
          } - ${JSON.stringify(err.response?.data) || err.message}`
        );
        throw err;
      }
    }

    console.info(
      `[removeAllAppRolesFromUser] Completed clearing App Roles for user ${userObjectId}`
    );
  }

  /**
   * Bulk role assignment for multiple users.
   * @param userEmails - Array of user emails
   * @param roleId - App Role ID to assign
   * @returns Promise resolving to number of successful assignments
   */
  static async bulkAssignRole(userEmails: string[], roleId: string): Promise<number> {
    const token = await getGraphToken();
    const clientId = process.env.APP_CLIENT_ID || process.env.AZURE_CLIENT_ID;
    const spId = await getServicePrincipalObjectId(token, clientId!);
    
    let successCount = 0;
    
    for (const email of userEmails) {
      try {
        // Get user Azure AD ID
        const userAdId = await this.getUserAzureAdId(email, token);
        
        // Assign role
        await this.assignRoleToUser(token, spId, userAdId, roleId);
        successCount++;
      } catch (error) {
        console.error(`Failed to assign role to ${email}:`, error);
      }
    }
    
    return successCount;
  }

  /**
   * Get user Azure AD ID by email.
   * @param email - User email
   * @param token - Graph API token
   * @returns Azure AD object ID
   */
  private static async getUserAzureAdId(email: string, token: string): Promise<string> {
    try {
      const resp = await axios.get(
        `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(email)}?$select=id`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return resp.data.id;
    } catch {
      const fallback = await axios.get(
        `https://graph.microsoft.com/v1.0/users?$filter=mail eq '${email}'&$select=id`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!fallback.data.value?.length) {
        throw new Error(`User ${email} not found`);
      }
      return fallback.data.value[0].id;
    }
  }

  /**
   * Assign role to user.
   * @param token - Graph API token
   * @param spId - Service principal ID
   * @param userAdId - User Azure AD ID
   * @param roleId - Role ID to assign
   */
  private static async assignRoleToUser(
    token: string,
    spId: string,
    userAdId: string,
    roleId: string
  ): Promise<void> {
    await axios.post(
      `https://graph.microsoft.com/v1.0/servicePrincipals/${spId}/appRoleAssignedTo`,
      {
        principalId: userAdId,
        resourceId: spId,
        appRoleId: roleId,
      },
      { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
    );
  }
}
