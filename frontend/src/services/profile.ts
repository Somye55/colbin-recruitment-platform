import api from './api';

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  designation: string;
  firstName: string;
  lastName: string;
  country: string;
  phone: string;
  gender: string;
  dob: string;
  totalExperience: number;
  currentCTC: number;
  expectedCTC: number;
  noticePeriod: string;
  noticePeriodDays?: number;
  bio?: string;
  experience?: string;
  resumeUrl?: string;
  avatar?: string;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileData {
  name?: string;
  designation?: string;
  firstName?: string;
  lastName?: string;
  country?: string;
  phone?: string;
  gender?: string;
  dob?: string;
  totalExperience?: number;
  currentCTC?: number;
  expectedCTC?: number;
  noticePeriod?: string;
  noticePeriodDays?: number;
  bio?: string;
  experience?: string;
  resumeUrl?: string;
  avatar?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
}

export const profileService = {
  async getProfile(): Promise<ApiResponse<UserProfile>> {
    const response = await api.get<ApiResponse<UserProfile>>('/profile');
    return response.data;
  },

  async updateProfile(data: UpdateProfileData): Promise<ApiResponse<UserProfile>> {
    const response = await api.put<ApiResponse<UserProfile>>('/profile', data);
    return response.data;
  },

  async deleteProfile(): Promise<ApiResponse<null>> {
    const response = await api.delete<ApiResponse<null>>('/profile');
    return response.data;
  }
};