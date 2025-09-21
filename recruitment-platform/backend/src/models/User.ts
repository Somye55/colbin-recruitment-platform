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
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false, // Don't include password in queries by default
    },
    phone: {
      type: String,
      trim: true,
      match: [/^\+?[\d\s-()]+$/, 'Please enter a valid phone number'],
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
userSchema.index({ email: 1 });
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