import React, { createContext, useContext, useReducer, useEffect, useRef, useCallback, ReactNode } from 'react';
import { authService, AuthState, AuthResponse } from '../services/auth';

// Session timeout configuration
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours
const PROMPT_BEFORE = 60 * 60 * 1000; // 1 hour before

interface AuthContextType extends AuthState {
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (data: { email: string; password: string; phone: string }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  extendSession: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_AUTHENTICATED'; payload: { user: AuthResponse['user'] } }
  | { type: 'SET_UNAUTHENTICATED' }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'UPDATE_USER'; payload: AuthResponse['user'] };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_AUTHENTICATED':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        isLoading: false,
        error: null
      };
    case 'SET_UNAUTHENTICATED':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: null
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'UPDATE_USER':
      return { ...state, user: action.payload };
    default:
      return state;
  }
};

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  isLoading: true,
  error: null
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const promptRef = useRef<ReturnType<typeof setTimeout>>();
  const lastActivityRef = useRef<number>(Date.now());

  const handleSessionPrompt = useCallback(() => {
    console.warn('Session will expire in 1 hour');
  }, []);

  const handleSessionTimeout = useCallback(() => {
    if (!state.isAuthenticated) return;

    authService.clearSession();
    dispatch({ type: 'SET_UNAUTHENTICATED' });
  }, [state.isAuthenticated]);

  const resetTimer = useCallback(() => {
    lastActivityRef.current = Date.now();

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (promptRef.current) {
      clearTimeout(promptRef.current);
    }

    if (state.isAuthenticated) {
      if (!state.isLoading) {
        promptRef.current = setTimeout(() => {
          handleSessionPrompt();
        }, SESSION_TIMEOUT - PROMPT_BEFORE);

        timeoutRef.current = setTimeout(() => {
          handleSessionTimeout();
        }, SESSION_TIMEOUT);
      }
    }
  }, [state.isAuthenticated, state.isLoading, handleSessionPrompt, handleSessionTimeout]);

  const extendSession = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  const handleActivity = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  useEffect(() => {
    const initializeAuth = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });

      try {
        const hasStoredSession = authService.getSession() !== null;

        if (hasStoredSession) {
          if (authService.isSessionExpired()) {
            console.log('Stored session is expired, clearing...');
            authService.clearSession();
            dispatch({ type: 'SET_UNAUTHENTICATED' });
            return;
          }

          const isValidSession = await authService.validateStoredSession();

          if (isValidSession) {
            const user = authService.getStoredUser();
            if (user) {
              dispatch({ type: 'SET_AUTHENTICATED', payload: { user } });
              resetTimer();
              return;
            }
          }

          console.log('Session validation failed, clearing session...');
          authService.clearSession();
        }

        dispatch({ type: 'SET_UNAUTHENTICATED' });
      } catch (error) {
        console.error('Auth initialization error:', error);
        authService.clearSession();
        dispatch({ type: 'SET_UNAUTHENTICATED' });
      }
    };

    initializeAuth();
  }, []); 


  const login = async (credentials: { email: string; password: string }) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });

    try {
      const response = await authService.login(credentials);

      if (response.success && response.user) {
        dispatch({ type: 'SET_AUTHENTICATED', payload: { user: response.user } });
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.message || 'Login failed' });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    }
  };

  const register = async (data: { email: string; password: string; phone: string }) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });

    try {
      const response = await authService.register(data);

      if (response.success && response.user) {
        dispatch({ type: 'SET_AUTHENTICATED', payload: { user: response.user } });
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.message || 'Registration failed' });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    }
  };

  const logout = () => {
    authService.logout();
    dispatch({ type: 'SET_UNAUTHENTICATED' });
    dispatch({ type: 'CLEAR_ERROR' }); 
  };

  const refreshUser = async () => {
    try {
      const response = await authService.getCurrentUser();
      if (response.success && response.user) {
        dispatch({ type: 'UPDATE_USER', payload: response.user });
        authService.updateStoredUser(response.user);
      } else {
        console.log('User refresh failed, clearing session...');
        authService.clearSession();
        dispatch({ type: 'SET_UNAUTHENTICATED' });
      }
    } catch (error: any) {
      console.error('Failed to refresh user data:', error);
      if (error.response?.status === 401) {
        console.log('User refresh failed due to auth error, clearing session...');
        authService.clearSession();
        dispatch({ type: 'SET_UNAUTHENTICATED' });
      }
      dispatch({ type: 'SET_ERROR', payload: 'Failed to refresh user data' });
    }
  };

  useEffect(() => {
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ];

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
  }, [handleActivity, resetTimer]);

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    refreshUser,
    extendSession
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};