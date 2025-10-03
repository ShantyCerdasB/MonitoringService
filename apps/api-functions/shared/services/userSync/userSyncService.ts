/**
 * @file userSyncService.ts
 * @summary User synchronization service
 * @description Handles bulk user operations and tenant synchronization.
 */

import axios from "axios";
import { getGraphToken } from "../graphService";

/**
 * Minimal user data from Microsoft Graph.
 */
export interface GraphUser {
  /** Azure AD object ID */
  id: string;
  /** Display name */
  displayName?: string;
  /** Email address (mail) */
  mail?: string;
  /** UPN (fallback if mail is missing) */
  userPrincipalName?: string;
  /** Whether account is enabled */
  accountEnabled?: boolean;
}

export class UserSyncService {
  /**
   * Fetch all users in the tenant from Microsoft Graph, paging until no nextLink.
   * @param token - Bearer token for Graph API.
   * @returns Promise resolving to an array of GraphUser.
   * @throws Error if any Graph request fails.
   */
  static async fetchAllUsers(token: string): Promise<GraphUser[]> {
    const users: GraphUser[] = [];
    let url =
      "https://graph.microsoft.com/v1.0/users?$select=id,displayName,mail,userPrincipalName,accountEnabled&$top=100";
    while (url) {
      try {
        const resp = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (resp.status !== 200) {
          throw new Error(
            `Graph /users returned status ${resp.status}: ${JSON.stringify(
              resp.data
            )}`
          );
        }
        const data = resp.data as any;
        if (Array.isArray(data.value)) {
          users.push(...data.value);
        }
        url = data["@odata.nextLink"] || "";
      } catch (err: any) {
        if (err.response) {
          throw new Error(
            `Error fetching users: HTTP ${err.response.status} - ${JSON.stringify(
              err.response.data
            )}`
          );
        }
        throw new Error(`Error fetching users: ${err.message}`);
      }
    }
    return users;
  }

  /**
   * Validate that a user exists in Azure AD.
   * @param userEmail - Email of the user to validate
   * @returns The Azure AD object ID of the user
   * @throws Error if user not found in Azure AD
   */
  static async validateUserExists(userEmail: string): Promise<string> {
    try {
      const graphToken = await getGraphToken();
      
      // Try direct user lookup first
      try {
        const resp = await axios.get(
          `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(userEmail)}?$select=id`,
          { headers: { Authorization: `Bearer ${graphToken}` } }
        );
        return resp.data.id;
      } catch {
        // Fallback to search by email
        const fallback = await axios.get(
          `https://graph.microsoft.com/v1.0/users?$filter=mail eq '${userEmail}'&$select=id`,
          { headers: { Authorization: `Bearer ${graphToken}` } }
        );
        if (!fallback.data.value?.length) {
          throw new Error("User not found");
        }
        return fallback.data.value[0].id;
      }
    } catch (error) {
      throw new Error(`User ${userEmail} not found in Azure AD`);
    }
  }

  /**
   * Get user display name from Azure AD.
   * @param userAdId - Azure AD object ID of the user
   * @param graphToken - Bearer token for Graph API
   * @returns Display name or empty string if not found
   */
  static async getUserDisplayName(userAdId: string, graphToken: string): Promise<string> {
    try {
      const resp = await axios.get(
        `https://graph.microsoft.com/v1.0/users/${userAdId}?$select=displayName`,
        { headers: { Authorization: `Bearer ${graphToken}` } }
      );
      return resp.data.displayName || "";
    } catch {
      return "";
    }
  }
}
