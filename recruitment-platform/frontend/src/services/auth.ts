import api from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    bio?: string;
    skills?: string[];
    experience?: string;
    resumeUrl?: string;
    avatar?: string;
    isEmailVerified: boolean;
    createdAt: Date;
  };
  token?: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  async getCurrentUser(): Promise<AuthResponse> {
    const response = await api.get<AuthResponse>('/auth/me');
    return response.data;
  },

  logout(): void {
    localStorage.removeItem('authToken');
  },

  getToken(): string | null {
    return localStorage.getItem('authToken');
  },

  setToken(token: string): void {
    localStorage.setItem('authToken', token);
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
};