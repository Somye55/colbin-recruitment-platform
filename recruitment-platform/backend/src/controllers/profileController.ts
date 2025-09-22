import { Response } from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User';
import { IAuthenticatedRequest, IApiResponse } from '../types';

// Validation rules for profile update
export const updateProfileValidation = [
  body('designation')
    .optional()
    .isIn(['Mr', 'Mrs', 'Ms', 'Dr', 'Prof'])
    .withMessage('Designation must be one of: Mr, Mrs, Ms, Dr, Prof'),
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('First name can only contain letters, spaces, hyphens, and apostrophes'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Last name can only contain letters, spaces, hyphens, and apostrophes'),
  body('country')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Country must be between 2 and 100 characters'),
  body('phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),
  body('gender')
    .optional()
    .isIn(['Male', 'Female', 'Non-binary', 'Prefer not to say', 'Other'])
    .withMessage('Gender must be one of: Male, Female, Non-binary, Prefer not to say, Other'),
  body('dob')
    .optional()
    .isISO8601()
    .withMessage('Date of birth must be a valid date')
    .custom((value) => {
      const today = new Date();
      const birthDate = new Date(value);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      if (age < 18 || age > 100) {
        throw new Error('Age must be between 18 and 100 years');
      }

      return true;
    }),
  body('totalExperience')
    .optional()
    .isFloat({ min: 0, max: 50 })
    .withMessage('Total experience must be between 0 and 50 years')
    .custom((value) => {
      if (Number(value.toFixed(1)) !== value) {
        throw new Error('Experience must have at most 1 decimal place');
      }
      return true;
    }),
  body('currentCTC')
    .optional()
    .isFloat({ min: 0, max: 10000000 })
    .withMessage('Current CTC must be between 0 and 10,000,000'),
  body('expectedCTC')
    .optional()
    .isFloat({ min: 0, max: 10000000 })
    .withMessage('Expected CTC must be between 0 and 10,000,000')
    .custom((value, { req }) => {
      if (req.body.currentCTC !== undefined && value < req.body.currentCTC) {
        throw new Error('Expected CTC must be greater than or equal to current CTC');
      }
      return true;
    }),
  body('noticePeriod')
    .optional()
    .isIn(['Yes', 'No'])
    .withMessage('Notice period must be either Yes or No'),
  body('noticePeriodDays')
    .optional()
    .isInt({ min: 0, max: 365 })
    .withMessage('Notice period days must be between 0 and 365')
    .custom((value, { req }) => {
      if (req.body.noticePeriod === 'Yes' && (value === undefined || value === null)) {
        throw new Error('Notice period days is required when notice period is Yes');
      }
      return true;
    }),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters'),
  body('skills')
    .optional()
    .isArray()
    .withMessage('Skills must be an array'),
  body('skills.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Each skill must be between 1 and 30 characters'),
  body('experience')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Experience description cannot exceed 1000 characters'),
];

// Get user profile
export const getProfile = async (req: IAuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?._id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      } as IApiResponse);
      return;
    }

    res.json({
      success: true,
      message: 'Profile retrieved successfully',
      data: {
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
        updatedAt: user.updatedAt,
      },
    } as IApiResponse);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving profile',
    } as IApiResponse);
  }
};

// Update user profile
export const updateProfile = async (req: IAuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      } as IApiResponse);
      return;
    }

    const user = await User.findById(req.user?._id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      } as IApiResponse);
      return;
    }

    // Update allowed fields
    const allowedFields = [
      'name', 'designation', 'firstName', 'lastName', 'country', 'phone',
      'gender', 'dob', 'totalExperience', 'currentCTC', 'expectedCTC',
      'noticePeriod', 'noticePeriodDays', 'bio', 'skills', 'experience',
      'resumeUrl', 'avatar'
    ];
    const updates: any = {};

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      req.user?._id,
      updates,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      res.status(404).json({
        success: false,
        message: 'User not found after update',
      } as IApiResponse);
      return;
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        designation: updatedUser.designation,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        country: updatedUser.country,
        phone: updatedUser.phone,
        gender: updatedUser.gender,
        dob: updatedUser.dob,
        totalExperience: updatedUser.totalExperience,
        currentCTC: updatedUser.currentCTC,
        expectedCTC: updatedUser.expectedCTC,
        noticePeriod: updatedUser.noticePeriod,
        noticePeriodDays: updatedUser.noticePeriodDays,
        bio: updatedUser.bio,
        skills: updatedUser.skills,
        experience: updatedUser.experience,
        resumeUrl: updatedUser.resumeUrl,
        avatar: updatedUser.avatar,
        isEmailVerified: updatedUser.isEmailVerified,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      },
    } as IApiResponse);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating profile',
    } as IApiResponse);
  }
};

// Delete user profile (soft delete or account deactivation)
export const deleteProfile = async (req: IAuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?._id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      } as IApiResponse);
      return;
    }

    // Soft delete - you can implement this based on your requirements
    // For now, we'll just return a success message
    res.json({
      success: true,
      message: 'Profile deletion request received. This feature can be implemented based on business requirements.',
    } as IApiResponse);
  } catch (error) {
    console.error('Delete profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error processing profile deletion',
    } as IApiResponse);
  }
};