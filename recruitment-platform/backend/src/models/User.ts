import mongoose, { Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUserDocument } from '../types';

interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

type UserModel = Model<IUserDocument, {}, IUserMethods>;

const userSchema = new Schema<IUserDocument, UserModel, IUserMethods>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
        'Please enter a valid email address',
      ],
      maxlength: [254, 'Email address is too long'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters long'],
      maxlength: [128, 'Password cannot exceed 128 characters'],
      select: false, // Don't include password in queries by default
      validate: {
        validator: function(value: string) {
          // Additional password strength validation
          const hasUpperCase = /[A-Z]/.test(value);
          const hasLowerCase = /[a-z]/.test(value);
          const hasNumbers = /\d/.test(value);
          const hasSpecialChar = /[@$!%*?&]/.test(value);

          if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
            return false;
          }

          // Check for common weak passwords
          const commonPasswords = ['password', 'password123', '123456', 'qwerty', 'abc123', 'admin', 'letmein'];
          if (commonPasswords.includes(value.toLowerCase())) {
            return false;
          }

          return true;
        },
        message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)'
      }
    },
    designation: {
      type: String,
      required: [true, 'Designation is required'],
      enum: {
        values: ['Mr', 'Mrs', 'Ms', 'Dr', 'Prof'],
        message: 'Designation must be one of: Mr, Mrs, Ms, Dr, Prof'
      }
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      minlength: [2, 'First name must be at least 2 characters'],
      maxlength: [50, 'First name cannot exceed 50 characters'],
      validate: {
        validator: function(value: string) {
          return /^[a-zA-Z\s'-]+$/.test(value);
        },
        message: 'First name can only contain letters, spaces, hyphens, and apostrophes'
      }
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      minlength: [2, 'Last name must be at least 2 characters'],
      maxlength: [50, 'Last name cannot exceed 50 characters'],
      validate: {
        validator: function(value: string) {
          return /^[a-zA-Z\s'-]+$/.test(value);
        },
        message: 'Last name can only contain letters, spaces, hyphens, and apostrophes'
      }
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true,
      minlength: [2, 'Country must be at least 2 characters'],
      maxlength: [100, 'Country cannot exceed 100 characters']
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      validate: {
        validator: function(value: string) {
          // Remove all non-digit characters for validation
          const cleanPhone = value.replace(/\D/g, '');

          // Check if phone number has valid length
          if (cleanPhone.length < 10 || cleanPhone.length > 15) {
            return false;
          }

          // Check if it matches common phone number patterns
          const phoneRegex = /^\+?[\d\s\-\(\)\.]+$/;
          return phoneRegex.test(value);
        },
        message: 'Please enter a valid phone number (10-15 digits)'
      }
    },
    gender: {
      type: String,
      required: [true, 'Gender is required'],
      enum: {
        values: ['Male', 'Female', 'Non-binary', 'Prefer not to say', 'Other'],
        message: 'Gender must be one of: Male, Female, Non-binary, Prefer not to say, Other'
      }
    },
    dob: {
      type: Date,
      required: [true, 'Date of birth is required'],
      validate: {
        validator: function(value: Date) {
          const today = new Date();
          const birthDate = new Date(value);
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();

          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }

          return age >= 18 && age <= 100;
        },
        message: 'Age must be between 18 and 100 years'
      }
    },
    totalExperience: {
      type: Number,
      required: [true, 'Total experience is required'],
      min: [0, 'Experience cannot be negative'],
      max: [50, 'Experience cannot exceed 50 years'],
      validate: {
        validator: function(value: number) {
          return Number(value.toFixed(1)) === value;
        },
        message: 'Experience must have at most 1 decimal place'
      }
    },
    currentCTC: {
      type: Number,
      required: [true, 'Current CTC is required'],
      min: [0, 'Current CTC cannot be negative'],
      max: [10000000, 'Current CTC cannot exceed 10,000,000']
    },
    expectedCTC: {
      type: Number,
      required: [true, 'Expected CTC is required'],
      min: [0, 'Expected CTC cannot be negative'],
      max: [10000000, 'Expected CTC cannot exceed 10,000,000'],
      validate: {
        validator: function(value: number) {
          return value >= this.currentCTC;
        },
        message: 'Expected CTC must be greater than or equal to current CTC'
      }
    },
    noticePeriod: {
      type: String,
      required: [true, 'Notice period status is required'],
      enum: {
        values: ['Yes', 'No'],
        message: 'Notice period must be either Yes or No'
      }
    },
    noticePeriodDays: {
      type: Number,
      min: [0, 'Notice period days cannot be negative'],
      max: [365, 'Notice period cannot exceed 365 days'],
      required: function() {
        return this.noticePeriod === 'Yes';
      },
      validate: {
        validator: function(value: number) {
          if (this.noticePeriod === 'Yes') {
            return value !== undefined && value !== null && value >= 0;
          }
          return true;
        },
        message: 'Notice period days is required when notice period is Yes'
      }
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
    },
    skills: [{
      type: String,
      trim: true,
    }],
    experience: {
      type: String,
      trim: true,
      maxlength: [1000, 'Experience description cannot exceed 1000 characters'],
    },
    resumeUrl: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
      trim: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for better query performance
userSchema.index({ createdAt: -1 });

// Hash password before saving
userSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Instance method to compare password
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Virtual for full profile URL (if needed)
userSchema.virtual('profileUrl').get(function () {
  return `/api/profile/${this._id}`;
});

// Remove password from JSON output
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

const User = mongoose.model<IUserDocument, UserModel>('User', userSchema);

export default User;