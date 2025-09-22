import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { ILoginRequest, IRegisterRequest, IAuthResponse } from '../types';

// Validation rules
export const registerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Name can only contain letters, spaces, hyphens, and apostrophes')
    .customSanitizer((value: string) => {
      // Remove extra spaces and capitalize first letter of each word
      return value.replace(/\s+/g, ' ').trim().replace(/\b\w/g, (char: string) => char.toUpperCase());
    }),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address')
    .isLength({ max: 254 })
    .withMessage('Email address is too long')
    .custom((value) => {
      // Additional email validation for common typos and formats
      const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
      if (!emailRegex.test(value)) {
        throw new Error('Please provide a valid email address');
      }
      return true;
    }),
  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be between 8 and 128 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)')
    .custom((value) => {
      // Check for common weak passwords
      const commonPasswords = ['password', 'password123', '123456', 'qwerty', 'abc123', 'admin', 'letmein'];
      if (commonPasswords.includes(value.toLowerCase())) {
        throw new Error('This password is too common. Please choose a more secure password');
      }
      return true;
    }),
  body('phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number')
    .custom((value) => {
      // Remove all non-digit characters for validation
      const cleanPhone = value.replace(/\D/g, '');
      if (cleanPhone.length < 10 || cleanPhone.length > 15) {
        throw new Error('Phone number must be between 10 and 15 digits');
      }
      return true;
    })
    .customSanitizer(value => {
      // Keep only digits, spaces, hyphens, parentheses, and plus signs
      return value.replace(/[^\d\s\-()+\.]/g, '').trim();
    }),
];

export const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address')
    .isLength({ max: 254 })
    .withMessage('Email address is too long')
    .custom((value) => {
      const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
      if (!emailRegex.test(value)) {
        throw new Error('Please provide a valid email address');
      }
      return true;
    }),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 1 })
    .withMessage('Password cannot be empty')
    .trim(),
];

// Register controller
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      } as IAuthResponse);
      return;
    }

    const {
      name,
      email,
      password,
      designation,
      firstName,
      lastName,
      country,
      phone,
      gender,
      dob,
      totalExperience,
      currentCTC,
      expectedCTC,
      noticePeriod,
      noticePeriodDays,
      bio,
      skills,
      experience,
      resumeUrl,
      avatar
    }: IRegisterRequest = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      } as IAuthResponse);
      return;
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      designation,
      firstName,
      lastName,
      country,
      phone,
      gender,
      dob,
      totalExperience,
      currentCTC,
      expectedCTC,
      noticePeriod,
      noticePeriodDays,
      bio,
      skills,
      experience,
      resumeUrl,
      avatar,
    });

    await user.save();

    // Generate JWT token
    // @ts-ignore - JWT library has complex type definitions
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        designation: user.designation,
        firstName: user.firstName,
        lastName: user.lastName,
        country: user.country,
        phone: user.phone,
        gender: user.gender,
        dob: user.dob,
        totalExperience: user.totalExperience,
        currentCTC: user.currentCTC,
        expectedCTC: user.expectedCTC,
        noticePeriod: user.noticePeriod,
        noticePeriodDays: user.noticePeriodDays,
        bio: user.bio,
        skills: user.skills,
        experience: user.experience,
        resumeUrl: user.resumeUrl,
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt,
      },
      token,
    } as IAuthResponse);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
    } as IAuthResponse);
  }
};

// Login controller
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      } as IAuthResponse);
      return;
    }

    const { email, password }: ILoginRequest = req.body;

    // Find user by email and include password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      } as IAuthResponse);
      return;
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      } as IAuthResponse);
      return;
    }

    // Generate JWT token
    // @ts-ignore - JWT library has complex type definitions
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        designation: user.designation,
        firstName: user.firstName,
        lastName: user.lastName,
        country: user.country,
        phone: user.phone,
        gender: user.gender,
        dob: user.dob,
        totalExperience: user.totalExperience,
        currentCTC: user.currentCTC,
        expectedCTC: user.expectedCTC,
        noticePeriod: user.noticePeriod,
        noticePeriodDays: user.noticePeriodDays,
        bio: user.bio,
        skills: user.skills,
        experience: user.experience,
        resumeUrl: user.resumeUrl,
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt,
      },
      token,
    } as IAuthResponse);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
    } as IAuthResponse);
  }
};

// Get current user
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById((req as any).user._id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      } as IAuthResponse);
      return;
    }

    res.json({
      success: true,
      message: 'User retrieved successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        bio: user.bio,
        skills: user.skills,
        experience: user.experience,
        resumeUrl: user.resumeUrl,
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt,
      },
    } as IAuthResponse);
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving user',
    } as IAuthResponse);
  }
};