import api from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  phone: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: {
    _id: string;
    email: string;
    phone?: string;
    bio?: string;
    experience?: string;
    resumeUrl?: string;
    avatar?: string;
    isEmailVerified: boolean;
    createdAt: Date;
  };
  token?: string;
}

export interface SessionData {
  user: AuthResponse['user'];
  token: string;
  expiresAt: number;
  createdAt: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: AuthResponse['user'] | null;
  isLoading: boolean;
  error: string | null;
}

const SESSION_KEY = 'authSession';
const TOKEN_KEY = 'authToken';
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

let isValidatingSession = false;
let lastValidationTime = 0;
const VALIDATION_COOLDOWN = 5000; // 5 seconds cooldown between validations

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);

    if (response.data.success && response.data.token && response.data.user) {
      this.setSession(response.data.token, response.data.user);
    }

    return response.data;
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);

    if (response.data.success && response.data.token && response.data.user) {
      this.setSession(response.data.token, response.data.user);
    }

    return response.data;
  },

  async getCurrentUser(): Promise<AuthResponse> {
    const response = await api.get<AuthResponse>('/auth/me');
    return response.data;
  },

  logout(): void {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(TOKEN_KEY);
  },

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  setSession(token: string, user: AuthResponse['user']): void {
    const sessionData: SessionData = {
      user,
      token,
      expiresAt: Date.now() + SESSION_TIMEOUT,
      createdAt: Date.now()
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    localStorage.setItem(TOKEN_KEY, token);
  },

  getSession(): SessionData | null {
    try {
      const sessionData = localStorage.getItem(SESSION_KEY);
      if (!sessionData) return null;

      const session: SessionData = JSON.parse(sessionData);

      if (Date.now() > session.expiresAt) {
        this.clearSession();
        return null;
      }

      return session;
    } catch (error) {
      console.error('Error parsing session data:', error);
      this.clearSession();
      return null;
    }
  },

  clearSession(): void {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(TOKEN_KEY);
  },

  isSessionExpired(): boolean {
    const session = this.getSession();
    return !session || Date.now() > session.expiresAt;
  },

  refreshSession(): void {
    const session = this.getSession();
    if (session) {
      const refreshedSession: SessionData = {
        ...session,
        expiresAt: Date.now() + SESSION_TIMEOUT
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(refreshedSession));
    }
  },

  getStoredUser(): AuthResponse['user'] | null {
    const session = this.getSession();
    return session ? session.user : null;
  },

  async validateStoredSession(): Promise<boolean> {
    const session = this.getSession();
    if (!session) return false;

    if (this.isSessionExpired()) {
      console.log('Session is expired, clearing...');
      this.clearSession();
      return false;
    }

    if (isValidatingSession) {
      console.log('Session validation already in progress, skipping...');
      return true; // Return true since validation is in progress
    }

    const now = Date.now();
    if (now - lastValidationTime < VALIDATION_COOLDOWN) {
      console.log('Session validation called too frequently, skipping...');
      return true; // Return true since we have a valid stored session
    }

    isValidatingSession = true;
    lastValidationTime = now;

    try {
      const response = await this.getCurrentUser();
      if (response.success && response.user) {
        this.updateStoredUser(response.user);
        this.refreshSession();
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Session validation failed:', error);

      if (error.response?.status === 401) {
        console.log('Token is invalid (401), clearing session...');
        this.clearSession();
        return false;
      }

      if (error.response?.status === 404) {
        console.log('User not found (404), clearing session...');
        this.clearSession();
        return false;
      }

      if (error.response?.status >= 500) {
        console.error('Server error during session validation, keeping session for retry');
        return true; // Keep session for retry on server errors
      }

      if (!error.response) {
        console.error('Network error during session validation, keeping session for retry');
        return true; // Keep session for retry on network errors
      }

      console.log('Unexpected error during session validation, clearing session...');
      this.clearSession();
      return false;
    } finally {
      isValidatingSession = false;
    }
  },

  updateStoredUser(user: AuthResponse['user']): void {
    const session = this.getSession();
    if (session) {
      const updatedSession: SessionData = {
        ...session,
        user
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(updatedSession));
    }
  }
};