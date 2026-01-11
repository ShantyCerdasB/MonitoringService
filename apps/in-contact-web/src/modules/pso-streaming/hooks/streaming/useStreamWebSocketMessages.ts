/**
 * @fileoverview useStreamWebSocketMessages hook
 * @description Handles WebSocket messages for stream status updates (pending, started, failed, stopped)
 */

import { useEffect } from 'react';
import { webSocketService } from '@/shared/services/webSocket';
import { logDebug, logError } from '@/shared/utils/logger';
import { parseWebSocketMessage } from './utils';
import { PENDING_TIMEOUT_MS, START_CONNECTION_TIMEOUT_MS } from '../../constants';
import type { CredsMap } from '../../types';
import type { IUseStreamWebSocketMessagesOptions } from './types/useStreamWebSocketMessagesTypes';

/**
 * Handles WebSocket messages for stream status updates
 * @param options - Configuration options for WebSocket message handling
 */
export function useStreamWebSocketMessages(options: IUseStreamWebSocketMessagesOptions): void {
  const {
    emailsRef,
    credsMapRef,
    setCredsMap,
    pendingTimersRef,
    stopStatusTimersRef,
    startConnectionTimersRef,
    fetchingTokensRef,
    canceledUsersRef,
    clearPendingTimer,
    clearRetryTimer,
    clearStartConnectionTimer,
    clearStopStatusTimer,
    clearOne,
    createAttemptFetchWithRetry,
    handlePendingTimeout,
    handleStartConnectionTimeout,
    handleStopStatusTimeout,
    refreshTokenForEmail,
    handleRefreshTokenError,
    wsHandlerRegisteredRef,
  } = options;

  useEffect(() => {
    if (wsHandlerRegisteredRef.current) {
      return;
    }

    const handleMessage = (msg: unknown): void => {
      logDebug('WebSocket message received', { msg });
      
      const parsed = parseWebSocketMessage(msg);
      const currentEmails = emailsRef.current;
      
      if (!parsed.targetEmail || !currentEmails.includes(parsed.targetEmail)) {
        return;
      }

      if (parsed.pending) {
        const key = parsed.targetEmail;
        clearPendingTimer(key);
        clearRetryTimer(key);
        clearStartConnectionTimer(key);
        
        logDebug('[useStreamWebSocketMessages] Received pending status, starting optimistic connection', {
          email: key,
        });
        
        setCredsMap((prev: CredsMap) => {
          const existing = prev[key];
          return {
            ...prev,
            [key]: existing ? { ...existing, loading: true } : { loading: true }
          };
        });

        const attemptFetchWithRetry = createAttemptFetchWithRetry(key);
        attemptFetchWithRetry().catch((err: unknown) => {
          logError('[useStreamWebSocketMessages] Error in attemptFetchWithRetry', { error: err, email: key });
        });

        pendingTimersRef.current[key] = setTimeout(() => {
          handlePendingTimeout(key);
        }, PENDING_TIMEOUT_MS);

        const startConnectionTimersRef = options.startConnectionTimersRef;
        startConnectionTimersRef.current[key] = setTimeout(() => {
          delete startConnectionTimersRef.current[key];
          handleStartConnectionTimeout(key);
        }, START_CONNECTION_TIMEOUT_MS);
        return;
      }

      if (parsed.failed) {
        const key = parsed.targetEmail;
        clearPendingTimer(key);
        clearStartConnectionTimer(key);
        setCredsMap((prev: CredsMap) => {
          const current = prev[key] ?? {};
          return {
            ...prev,
            [key]: { ...current, loading: false }
          };
        });
        return;
      }

      if (parsed.started === true) {
        clearPendingTimer(parsed.targetEmail);
        clearRetryTimer(parsed.targetEmail);
        clearStartConnectionTimer(parsed.targetEmail);
        if (canceledUsersRef.current.has(parsed.targetEmail)) {
          const ns = new Set(canceledUsersRef.current);
          ns.delete(parsed.targetEmail);
          canceledUsersRef.current = ns;
        }
        
        const emailKey = parsed.targetEmail;
        clearStopStatusTimer(emailKey);
        
        if (fetchingTokensRef.current.has(emailKey)) {
          logDebug('[useStreamWebSocketMessages] Token fetch already in progress for started status, ensuring loading state is correct', {
            email: emailKey,
          });
          
          setCredsMap((prev: CredsMap) => {
            const current = prev[emailKey];
            if (!current) {
              return {
                ...prev,
                [emailKey]: { loading: true }
              };
            }
            if (current.loading || current.accessToken) {
              return prev;
            }
            return {
              ...prev,
              [emailKey]: { ...current, loading: true }
            };
          });
          
          return;
        }
        
        const currentCreds = credsMapRef.current[emailKey];
        if (currentCreds?.accessToken) {
          logDebug('[useStreamWebSocketMessages] Token already available, updating loading state', {
            email: emailKey,
          });
          setCredsMap((prev: CredsMap) => {
            const current = prev[emailKey];
            if (!current || current.loading === false) {
              return prev;
            }
            return {
              ...prev,
              [emailKey]: { ...current, loading: false }
            };
          });
        } else {
          setCredsMap((prev: CredsMap) => {
            const existing = prev[emailKey];
            return {
              ...prev,
              [emailKey]: existing ? { ...existing, loading: true } : { loading: true }
            };
          });
          
          refreshTokenForEmail(emailKey).catch((error: unknown) => {
            logError('[useStreamWebSocketMessages] Failed to fetch token after started status', { error, email: emailKey });
            handleRefreshTokenError(emailKey);
          });
        }
      } else if (parsed.started === false) {
        clearPendingTimer(parsed.targetEmail);
        clearStopStatusTimer(parsed.targetEmail);
        clearStartConnectionTimer(parsed.targetEmail);
        
        const ns = new Set(canceledUsersRef.current);
        ns.add(parsed.targetEmail);
        canceledUsersRef.current = ns;
        clearOne(parsed.targetEmail);
        
        const emailKey = parsed.targetEmail;
        
        if (!stopStatusTimersRef.current[emailKey]) {
          stopStatusTimersRef.current[emailKey] = setTimeout(() => {
            handleStopStatusTimeout(emailKey).catch((err: unknown) => {
              logError('[useStreamWebSocketMessages] Error in handleStopStatusTimeout', { error: err, email: emailKey });
            });
          }, 1000);
        }
      }
    };

    const unsubscribe = webSocketService.onMessage(handleMessage);
    wsHandlerRegisteredRef.current = true;
    
    return () => {
      unsubscribe();
      wsHandlerRegisteredRef.current = false;
    };
  }, [
    emailsRef,
    credsMapRef,
    setCredsMap,
    pendingTimersRef,
    stopStatusTimersRef,
    startConnectionTimersRef,
    fetchingTokensRef,
    canceledUsersRef,
    clearPendingTimer,
    clearRetryTimer,
    clearStartConnectionTimer,
    clearStopStatusTimer,
    clearOne,
    createAttemptFetchWithRetry,
    handlePendingTimeout,
    handleStartConnectionTimeout,
    handleStopStatusTimeout,
    refreshTokenForEmail,
    handleRefreshTokenError,
    wsHandlerRegisteredRef,
  ]);
}

