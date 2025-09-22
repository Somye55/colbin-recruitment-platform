import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from './useAuth';
import { authService } from '../services/auth';

interface UseSessionTimeoutOptions {
  timeout?: number; 
  promptBefore?: number; 
  onPrompt?: () => void;
  onTimeout?: () => void;
}

export const useSessionTimeout = (options: UseSessionTimeoutOptions = {}) => {
  const {
    timeout = 24 * 60 * 60 * 1000,
    promptBefore = 60 * 60 * 1000,
    onPrompt,
    onTimeout
  } = options;

  const { logout, isAuthenticated } = useAuth();
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const promptRef = useRef<ReturnType<typeof setTimeout>>();
  const lastActivityRef = useRef<number>(Date.now());

  useEffect(() => {
    const session = authService.getSession();
    if (session && !authService.isSessionExpired()) {
      const remainingTime = session.expiresAt - Date.now();
      if (remainingTime > 0) {
        lastActivityRef.current = Date.now();

        if (remainingTime > promptBefore) {
          promptRef.current = setTimeout(() => {
            onPrompt?.();
          }, remainingTime - promptBefore);
        }

        timeoutRef.current = setTimeout(() => {
          onTimeout?.();
          logout();
        }, remainingTime);
      }
    }
  }, []);

  const resetTimer = useCallback(() => {
    lastActivityRef.current = Date.now();

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (promptRef.current) {
      clearTimeout(promptRef.current);
    }

    if (isAuthenticated) {
      promptRef.current = setTimeout(() => {
        onPrompt?.();
      }, timeout - promptBefore);

      timeoutRef.current = setTimeout(() => {
        onTimeout?.();
        logout();
      }, timeout);
    }
  }, [timeout, promptBefore, onPrompt, onTimeout, logout, isAuthenticated]);

  const extendSession = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  const logoutNow = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (promptRef.current) {
      clearTimeout(promptRef.current);
    }
    logout();
  }, [logout]);

  useEffect(() => {
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ];

    const handleActivity = () => {
      resetTimer();
    };

    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    resetTimer();

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      if (promptRef.current) {
        clearTimeout(promptRef.current);
      }
    };
  }, [resetTimer]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        resetTimer();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [resetTimer]);

  return {
    extendSession,
    logoutNow,
    getLastActivity: () => lastActivityRef.current,
    getTimeUntilTimeout: () => Math.max(0, timeout - (Date.now() - lastActivityRef.current))
  };
};