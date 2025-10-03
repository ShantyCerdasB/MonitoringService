import axios from "axios";
import qs from "qs";
import { config } from "../config";

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

/**
 * Acquire an access token for Microsoft Graph using client credentials flow.
 *
 * Requires in config:
 * - config.azureTenantId
 * - config.azureClientId
 * - config.azureClientSecret
 *
 * @returns A Promise resolving to the bearer token string.
 * @throws Error if any config is missing or the token request fails.
 */
export async function getGraphToken(): Promise<string> {
  const tenantId = config.azureTenantId;
  const clientId = config.azureClientId;
  const clientSecret = config.azureClientSecret;
  if (!tenantId || !clientId || !clientSecret) {
    throw new Error(
      "Missing Azure AD config: azureTenantId, azureClientId, or azureClientSecret"
    );
  }
  const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
  const params = {
    client_id: clientId,
    client_secret: clientSecret,
    scope: "https://graph.microsoft.com/.default",
    grant_type: "client_credentials",
  };
  try {
    const resp = await axios.post(tokenUrl, qs.stringify(params), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    const accessToken = resp.data?.access_token;
    if (!accessToken) {
      throw new Error(
        `Token response did not contain access_token. Response: ${JSON.stringify(
          resp.data
        )}`
      );
    }
    return accessToken as string;
  } catch (err: any) {
    if (err.response) {
      throw new Error(
        `Failed to acquire Graph token: HTTP ${err.response.status} - ${JSON.stringify(
          err.response.data
        )}`
      );
    }
    throw new Error(`Failed to acquire Graph token: ${err.message}`);
  }
}


/**
 * Obtain the Object ID of the Service Principal corresponding to this application.
 *
 * @param token - Bearer token with Graph permissions.
 * @param clientId - Application (client) ID of your App Registration.
 * @returns Promise resolving to the Service Principal's object ID.
 * @throws Error if Graph request fails or no SP found.
 */
export async function getServicePrincipalObjectId(
  token: string,
  clientId: string
): Promise<string> {
  const url = `https://graph.microsoft.com/v1.0/servicePrincipals?$filter=appId eq '${clientId}'&$select=id`;
  try {
    const resp = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (resp.status !== 200) {
      throw new Error(
        `Error fetching servicePrincipal: ${resp.status} ${JSON.stringify(
          resp.data
        )}`
      );
    }
    const arr = resp.data.value;
    if (!Array.isArray(arr) || arr.length === 0) {
      throw new Error(`ServicePrincipal for appId ${clientId} not found`);
    }
    return arr[0].id as string;
  } catch (err: any) {
    if (err.response) {
      throw new Error(
        `Error fetching servicePrincipal: HTTP ${err.response.status} - ${JSON.stringify(
          err.response.data
        )}`
      );
    }
    throw new Error(`Error fetching servicePrincipal: ${err.message}`);
  }
}

/**
 * Fetch all principal IDs (user or group object IDs) that have been assigned a given App Role.
 *
 * This calls Microsoft Graph:
 *   GET /servicePrincipals/{servicePrincipalId}/appRoleAssignedTo
 *     ?$filter=appRoleId eq guid'{appRoleId}'
 *     &$top=100
 * and pages through @odata.nextLink.
 *
 * IMPORTANT: The filter uses `appRoleId eq guid'{GUID}'` (with guid'' literal syntax).
 *
 * @param token - Bearer token for Microsoft Graph API.
 * @param servicePrincipalId - Object ID of the Service Principal where the App Role is defined.
 *                             This is the Azure AD object ID of the service principal for your App Registration.
 * @param appRoleId - GUID of the App Role (as shown in “App roles” in Azure Portal). Must be the raw GUID string (no braces).
 * @returns A Promise resolving to a Set of principal IDs (strings) that have that App Role assigned.
 * @throws Error if any Graph request fails.
 */

export async function fetchAppRoleMemberIds(
  token: string,
  servicePrincipalId: string,
  appRoleId: string
): Promise<Set<string>> {
  if (!servicePrincipalId) throw new Error("servicePrincipalId is required");
  if (!appRoleId) throw new Error("appRoleId is required");

  const memberIds = new Set<string>();
  // Start without any filter; we'll filter in code
  let url = `https://graph.microsoft.com/v1.0/servicePrincipals/${servicePrincipalId}/appRoleAssignedTo?$top=100`;

  while (url) {
    const resp = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (resp.status !== 200) {
      throw new Error(`Graph failed: ${resp.status} – ${JSON.stringify(resp.data)}`);
    }
    const data = resp.data as any;

    // Now do the filtering locally
    for (const assignment of data.value || []) {
      if (assignment.appRoleId === appRoleId && assignment.principalId) {
        memberIds.add(assignment.principalId as string);
      }
    }

    url = data["@odata.nextLink"] || "";
  }

  return memberIds;
}

/**
 * Assign an App Role to a principal (user or group).
 *
 * @param token - Bearer token with AppRoleAssignment.ReadWrite.All permission.
 * @param servicePrincipalId - Object ID of the Service Principal of your application.
 * @param principalId - Object ID of the user or group to assign the role to.
 * @param appRoleId - GUID of the App Role.
 * @returns Promise resolving when complete.
 * @throws Error if Graph request fails.
 */
export async function assignAppRoleToPrincipal(
  token: string,
  spObjectId: string,
  principalId: string,
  appRoleId: string
): Promise<void> {
  await axios.post(
    `https://graph.microsoft.com/v1.0/servicePrincipals/${spObjectId}/appRoleAssignedTo`,
    {
      principalId,
      resourceId: spObjectId,
      appRoleId,
    },
    { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
  );
}

/**
 * Remove a specific App Role assignment by its assignment object ID.
 *
 * @param token - Bearer token with AppRoleAssignment.ReadWrite.All permission.
 * @param servicePrincipalId - Object ID of the Service Principal of your application.
 * @param assignmentId - Object ID of the specific assignment (from appRoleAssignedTo).
 * @returns Promise resolving when complete.
 * @throws Error if Graph request fails.
 */
export async function removeAppRoleAssignment(
  token: string,
  servicePrincipalId: string,
  assignmentId: string
): Promise<void> {
  const url = `https://graph.microsoft.com/v1.0/servicePrincipals/${servicePrincipalId}/appRoleAssignedTo/${assignmentId}`;
  try {
    await axios.delete(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (err: any) {
    if (err.response) {
      throw new Error(
        `Failed to remove AppRoleAssignment ${assignmentId}: HTTP ${err.response.status} - ${JSON.stringify(
          err.response.data
        )}`
      );
    }
    throw new Error(`Failed to remove AppRoleAssignment ${assignmentId}: ${err.message}`);
  }
}

/**
 * Removes **all** app role assignments for a given principal (user or group)
 * on your application's Service Principal, using the **Service Principal** endpoint.
 *
 * This avoids intermittent Graph errors when calling the user endpoint:
 * "Links to EntitlementGrant are not supported between specified entities."
 *
 * @param token        Bearer token with AppRoleAssignment.ReadWrite.All
 * @param spObjectId   Object ID of your application's Service Principal
 * @param principalId  Object ID of the user (or group) to clear
 * @returns Number of assignments removed
 * @throws  If any Graph call fails
 */
export async function removeAllAppRolesFromPrincipalOnSp(
  token: string,
  spObjectId: string,
  principalId: string
): Promise<number> {
  const base = `https://graph.microsoft.com/v1.0/servicePrincipals/${spObjectId}/appRoleAssignedTo`;
  // We avoid OData filter surprises by paging through all and filtering in code.
  let url = `${base}?$top=100`;
  let removed = 0;

  while (url) {
    const resp = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (resp.status !== 200) {
      throw new Error(`Failed to list appRoleAssignedTo: ${resp.status} ${JSON.stringify(resp.data)}`);
    }

    const page: Array<{ id: string; principalId?: string }> = resp.data?.value ?? [];
    for (const a of page) {
      if (!a?.id) continue;
      if ((a as any).principalId !== principalId) continue;

      const delUrl = `${base}/${a.id}`;
      try {
        await axios.delete(delUrl, { headers: { Authorization: `Bearer ${token}` } });
        removed++;
      } catch (err: any) {
        const detail =
          err?.response
            ? `HTTP ${err.response.status} - ${JSON.stringify(err.response.data)}`
            : err?.message;
        throw new Error(`Failed to delete appRoleAssignedTo ${a.id}: ${detail}`);
      }
    }

    url = resp.data?.["@odata.nextLink"] || "";
  }

  return removed;
}



