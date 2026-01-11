/**
 * @fileoverview useTalkSessionNotifications - Hook for talk session notifications
 * @summary Listens to WebSocket notifications for talk session start/end
 * @description Subscribes to talk session notifications and provides callbacks for session events
 */

import { useState, useEffect, useRef } from 'react';
import { webSocketService } from '@/shared/services/webSocket';
import { logDebug, logError } from '@/shared/utils/logger';
import { playIncomingCallSound, playHangUpSound } from '@/shared/utils/audioPlayer';
import type {
  IUseTalkSessionNotificationsOptions,
  IUseTalkSessionNotificationsReturn,
} from './types/useTalkSessionNotificationsTypes';

/**
 * Handles talk session start message
 * 
 * @param data - Message data
 * @param filterPsoEmail - PSO email to filter by
 * @param onTalkSessionStart - Callback when session starts
 * @param setIsTalkActive - State setter for talk active status
 * @param setIsIncoming - State setter for incoming status
 * @param setJustEnded - State setter for just ended status
 * @param setSupervisorName - State setter for supervisor name
 */
function handleTalkSessionStart(
  data: { psoEmail?: string; supervisorEmail?: string; supervisorName?: string },
  filterPsoEmail: string,
  onTalkSessionStart: ((message: { supervisorEmail?: string; supervisorName?: string }) => void) | undefined,
  setIsTalkActive: (value: boolean) => void,
  setIsIncoming: (value: boolean) => void,
  setJustEnded: (value: boolean) => void,
  setSupervisorName: (value: string | null) => void
): void {
  const messagePsoEmail = data.psoEmail?.toLowerCase();
  
  if (messagePsoEmail !== filterPsoEmail) {
    logDebug('[useTalkSessionNotifications] Message filtered out - email mismatch', {
      messagePsoEmail,
      filterPsoEmail,
    });
    return;
  }
  
  logDebug('[useTalkSessionNotifications] Talk session started', { psoEmail: filterPsoEmail, data });
  playIncomingCallSound();
  
  setIsTalkActive(true);
  setIsIncoming(true);
  setJustEnded(false);
  setSupervisorName((data.supervisorName as string) || null);
  
  // Reset isIncoming after 3 seconds
  setTimeout(() => {
    setIsIncoming(false);
  }, 3000);
  
  if (onTalkSessionStart) {
    onTalkSessionStart({
      supervisorEmail: data.supervisorEmail,
      supervisorName: data.supervisorName,
    });
  }
}

/**
 * State setters configuration for talk session end handler
 */
interface ITalkSessionEndSetters {
  setIsTalkActive: (value: boolean) => void;
  setIsIncoming: (value: boolean) => void;
  setJustEnded: (value: boolean) => void;
  setSupervisorName: (value: string | null) => void;
}

/**
 * Handles talk session end message
 * 
 * @param data - Message data
 * @param filterPsoEmail - PSO email to filter by
 * @param onTalkSessionEnd - Callback when session ends
 * @param setters - State setters configuration
 * @param justEndedTimeoutRef - Ref for timeout cleanup
 */
function handleTalkSessionEnd(
  data: { psoEmail?: string },
  filterPsoEmail: string,
  onTalkSessionEnd: (() => void) | undefined,
  setters: ITalkSessionEndSetters,
  justEndedTimeoutRef: React.MutableRefObject<NodeJS.Timeout | null>
): void {
  const messagePsoEmail = data.psoEmail?.toLowerCase();
  
  if (messagePsoEmail && messagePsoEmail !== filterPsoEmail) {
    logDebug('[useTalkSessionNotifications] Message filtered out - email mismatch', {
      messagePsoEmail,
      filterPsoEmail,
    });
    return;
  }
  
  logDebug('[useTalkSessionNotifications] Talk session ended', { psoEmail: filterPsoEmail });
  const hangUpSoundPromise = playHangUpSound();
  
  const { setIsTalkActive, setIsIncoming, setJustEnded, setSupervisorName } = setters;
  setIsTalkActive(false);
  setIsIncoming(false);
  setJustEnded(true);
  setSupervisorName(null);
  
  // Reset justEnded when the hang up sound finishes playing
  if (justEndedTimeoutRef.current) {
    clearTimeout(justEndedTimeoutRef.current);
    justEndedTimeoutRef.current = null;
  }
  
  const handleSoundSuccess = (): void => {
    setJustEnded(false);
  };
  
  const handleSoundFailure = (): void => {
    // Fallback: hide banner after 2 seconds if sound fails
    justEndedTimeoutRef.current = setTimeout(() => {
      setJustEnded(false);
    }, 2000);
  };
  
  hangUpSoundPromise.then(handleSoundSuccess).catch(handleSoundFailure);
  
  if (onTalkSessionEnd) {
    onTalkSessionEnd();
  }
}

/**
 * Hook for listening to talk session notifications via WebSocket
 * 
 * @param options - Configuration options
 * @returns Object containing talk session state
 */
export function useTalkSessionNotifications(
  options: IUseTalkSessionNotificationsOptions
): IUseTalkSessionNotificationsReturn {
  const { psoEmail, onTalkSessionStart, onTalkSessionEnd } = options;
  
  const [isTalkActive, setIsTalkActive] = useState(false);
  const [isIncoming, setIsIncoming] = useState(false);
  const [justEnded, setJustEnded] = useState(false);
  const [supervisorName, setSupervisorName] = useState<string | null>(null);
  
  const handlerRef = useRef<((message: unknown) => void) | null>(null);
  const justEndedTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    if (!psoEmail) {
      return;
    }
    
    const filterPsoEmail = psoEmail.toLowerCase();
    
    // Handler for WebSocket messages
    const handleMessage = (message: unknown): void => {
      try {
        const msg = message as Record<string, unknown>;
        
        if (msg.type === 'talk_session_start') {
          const data = msg as { psoEmail?: string; supervisorEmail?: string; supervisorName?: string };
          handleTalkSessionStart(
            data,
            filterPsoEmail,
            onTalkSessionStart,
            setIsTalkActive,
            setIsIncoming,
            setJustEnded,
            setSupervisorName
          );
        }
        
        if (msg.type === 'talk_session_stop') {
          const data = msg as { psoEmail?: string };
          handleTalkSessionEnd(
            data,
            filterPsoEmail,
            onTalkSessionEnd,
            {
              setIsTalkActive,
              setIsIncoming,
              setJustEnded,
              setSupervisorName,
            },
            justEndedTimeoutRef
          );
        }
      } catch (error) {
        logError('[useTalkSessionNotifications] Error handling message', { error, psoEmail });
      }
    };
    
    handlerRef.current = handleMessage;
    
    // Subscribe to WebSocket messages
    const unsubscribe = webSocketService.onMessage(handleMessage);
    
    return () => {
      unsubscribe();
      if (justEndedTimeoutRef.current) {
        clearTimeout(justEndedTimeoutRef.current);
      }
    };
  }, [psoEmail, onTalkSessionStart, onTalkSessionEnd]);
  
  return {
    isTalkActive,
    isIncoming,
    justEnded,
    supervisorName,
  };
}
