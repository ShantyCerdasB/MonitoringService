/**
 * @file userManagementRepo.ts
 * @summary Repository for user management operations
 * @description Shared repository for contact manager and super admin operations.
 */

import prisma from "../services/prismaClienService";
import { User, UserRole, ContactManagerStatus } from "@prisma/client";
import { getGraphToken, assignAppRoleToPrincipal, removeAllAppRolesFromPrincipalOnSp } from "../services/graphService";
import { UserSyncService } from "../services/userSync";
import { GraphUser } from "../services/graphService";
import { config } from "../config";
import { getCostaRicanTimeISO } from "../utils/timezone";

/**
 * Repository for user management operations.
 * Handles shared logic for contact manager and super admin creation.
 */
export class UserManagementRepository {
  /**
   * Finds or creates a user from Azure AD Graph API.
   * @param email - User's email address
   * @param role - Role to assign to the user
   * @returns The user record
   * @throws Error if user not found in Azure AD
   */
  static async findOrCreateUserFromGraph(email: string, role: UserRole): Promise<User> {
    const normalizedEmail = email.toLowerCase();

    // 1. Try to find existing user in database
    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (user) {
      return user;
    }

    // 2. Fetch from Azure AD Graph API
    const token = await getGraphToken();
    const allGraphUsers = await UserSyncService.fetchAllUsers(token);
    const graphUser = allGraphUsers.find((u: GraphUser) => {
      const userEmail = (u.mail ?? u.userPrincipalName ?? "").toLowerCase();
      return userEmail === normalizedEmail;
    });

    if (!graphUser) {
      throw new Error(`User with email "${email}" not found in Azure AD`);
    }

    // 3. Create user in database
    user = await prisma.user.create({
      data: {
        azureAdObjectId: graphUser.id,
        email: normalizedEmail,
        fullName: graphUser.displayName ?? normalizedEmail,
        role: role,
        roleChangedAt: new Date(),
      },
    });

    return user;
  }

  /**
   * Assigns Azure AD app role to a user.
   * @param user - User to assign role to
   * @param role - Role to assign
   * @throws Error if role assignment fails
   */
  static async assignAzureADRole(user: User, role: UserRole): Promise<void> {
    const token = await getGraphToken();
    const spId = config.servicePrincipalObjectId!;
    
    // Get role ID based on role type
    const roleIdMap: Record<string, string> = {
      [UserRole.ContactManager]: config.contactManagerAppRoleId!,
      [UserRole.SuperAdmin]: config.superAdminAppRoleId!,
    };

    const roleId = roleIdMap[role];
    if (!roleId) {
      throw new Error(`No app role ID configured for role: ${role}`);
    }

    // Remove existing app roles
    await removeAllAppRolesFromPrincipalOnSp(token, spId, user.azureAdObjectId);
    
    // Assign new app role
    await assignAppRoleToPrincipal(token, spId, user.azureAdObjectId, roleId);
  }

  /**
   * Updates user role in database.
   * @param user - User to update
   * @param role - New role to assign
   * @returns Updated user
   */
  static async updateUserRole(user: User, role: UserRole): Promise<User> {
    return await prisma.user.update({
      where: { id: user.id },
      data: {
        role: role,
        roleChangedAt: new Date(),
      },
    });
  }

  /**
   * Creates a contact manager profile.
   * @param user - User to create profile for
   * @param status - Initial status for the contact manager
   * @returns Created profile
   */
  static async createContactManagerProfile(user: User, status: ContactManagerStatus) {
    // 1. Create or update contact manager profile
    const profile = await prisma.contactManagerProfile.upsert({
      where: { userId: user.id },
      update: { status },
      create: { userId: user.id, status },
    });

    // 2. Log initial status in history
    await prisma.contactManagerStatusHistory.create({
      data: {
        profileId: profile.id,
        previousStatus: status,
        newStatus: status,
        changedById: user.id,
      },
    });

    return profile;
  }


  /**
   * Gets user by Azure AD object ID.
   * @param azureAdObjectId - Azure AD object ID
   * @returns User or null
   */
  static async getUserByAzureAdObjectId(azureAdObjectId: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { azureAdObjectId }
    });
  }

  /**
   * Gets user by email.
   * @param email - User's email
   * @returns User or null
   */
  static async getUserByEmail(email: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });
  }

  /**
   * Gets contact manager profile with user data.
   * @param profileId - Contact manager profile ID
   * @returns Profile with user data or null
   */
  static async getContactManagerProfile(profileId: string) {
    return await prisma.contactManagerProfile.findUnique({
      where: { id: profileId },
      include: { user: true }
    });
  }

  /**
   * Deletes contact manager profile and user.
   * @param profileId - Contact manager profile ID
   * @param userId - User ID
   * @returns Promise that resolves when deletion is complete
   */
  static async deleteContactManager(profileId: string, userId: string): Promise<void> {
    await prisma.$transaction([
      prisma.contactManagerProfile.delete({
        where: { id: profileId },
      }),
      prisma.user.delete({
        where: { id: userId },
      }),
    ]);
  }

  /**
   * Deletes super admin user.
   * @param userId - User ID
   * @returns Promise that resolves when deletion is complete
   */
  static async deleteSuperAdmin(userId: string): Promise<void> {
    await prisma.user.delete({
      where: { id: userId },
    });
  }

  /**
   * Counts remaining SuperAdmins.
   * @returns Number of SuperAdmins in the system
   */
  static async countSuperAdmins(): Promise<number> {
    return await prisma.user.count({
      where: { role: UserRole.SuperAdmin }
    });
  }
}
