// User types
import { Document } from 'mongoose';
import { Request } from 'express';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  designation: string;
  firstName: string;
  lastName: string;
  country: string;
  phone: string;
  gender: string;
  dob: Date;
  totalExperience: number;
  currentCTC: number;
  expectedCTC: number;
  noticePeriod: string;
  noticePeriodDays?: number;
  bio?: string;
  skills?: string[];
  experience?: string;
  resumeUrl?: string;
  avatar?: string;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserDocument extends Document {
  name: string;
  email: string;
  password: string;
  designation: string;
  firstName: string;
  lastName: string;
  country: string;
  phone: string;
  gender: string;
  dob: Date;
  totalExperience: number;
  currentCTC: number;
  expectedCTC: number;
  noticePeriod: string;
  noticePeriodDays?: number;
  bio?: string;
  skills?: string[];
  experience?: string;
  resumeUrl?: string;
  avatar?: string;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Auth types
export interface ILoginRequest {
  email: string;
  password: string;
}

export interface IRegisterRequest {
  name: string;
  email: string;
  password: string;
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
  skills?: string[];
  experience?: string;
  resumeUrl?: string;
  avatar?: string;
}

export interface IAuthResponse {
  success: boolean;
  message: string;
  user?: {
    _id: string;
    name: string;
    email: string;
    designation: string;
    firstName: string;
    lastName: string;
    country: string;
    phone: string;
    gender: string;
    dob: Date;
    totalExperience: number;
    currentCTC: number;
    expectedCTC: number;
    noticePeriod: string;
    noticePeriodDays?: number;
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

// JWT Payload
export interface IJwtPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

// Request extensions
export interface IAuthenticatedRequest extends Request {
  user?: IUserDocument;
}

// API Response types
export interface IApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
}

// Error types
export interface IValidationError {
  field: string;
  message: string;
}