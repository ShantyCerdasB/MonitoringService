/**
 * @fileoverview Types for useTalkSessionNotifications hook
 * @summary Type definitions for talk session notifications hook
 */

/**
 * Talk session start message from WebSocket
 */
export interface ITalkSessionStartMessage {
  /**
   * Supervisor email who started the session
   */
  supervisorEmail?: string;

  /**
   * Supervisor name
   */
  supervisorName?: string;
}

/**
 * Options for useTalkSessionNotifications hook
 */
export interface IUseTalkSessionNotificationsOptions {
  /**
   * PSO email address
   */
  psoEmail: string;

  /**
   * Callback when talk session starts
   */
  onTalkSessionStart?: (message: ITalkSessionStartMessage) => void;

  /**
   * Callback when talk session ends
   */
  onTalkSessionEnd?: () => void;
}

/**
 * Return type for useTalkSessionNotifications hook
 */
export interface IUseTalkSessionNotificationsReturn {
  /**
   * Whether a talk session is currently active
   */
  isTalkActive: boolean;

  /**
   * Whether the session is incoming (supervisor initiated)
   */
  isIncoming: boolean;

  /**
   * Whether the session just ended (for UI feedback)
   */
  justEnded: boolean;

  /**
   * Name of the supervisor in the active/ended session
   */
  supervisorName: string | null;
}

/**
 * State setters configuration for talk session end handler
 * 
 * Groups React state setter functions used by the talk session end handler
 * to update multiple state values when a session ends.
 */
export interface ITalkSessionEndSetters {
  /**
   * Sets whether a talk session is currently active
   */
  setIsTalkActive: (value: boolean) => void;

  /**
   * Sets whether the session is incoming (supervisor initiated)
   */
  setIsIncoming: (value: boolean) => void;

  /**
   * Sets whether the session just ended (for UI feedback)
   */
  setJustEnded: (value: boolean) => void;

  /**
   * Sets the supervisor name for the session
   */
  setSupervisorName: (value: string | null) => void;
}

