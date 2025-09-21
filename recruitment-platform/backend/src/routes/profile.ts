import { Router } from "express";
import {
  getProfile,
  updateProfile,
  deleteProfile,
} from "../controllers/profileController";
import { authenticate } from "../middleware/auth";
import { updateProfileValidation } from "../controllers/profileController";

const router = Router();

// All profile routes require authentication
router.use(authenticate);

// @route   GET /api/profile
// @desc    Get user profile
// @access  Private
router.get("/", getProfile);

// @route   PUT /api/profile
// @desc    Update user profile
// @access  Private
router.put("/", updateProfileValidation, updateProfile);

// @route   DELETE /api/profile
// @desc    Delete user profile
// @access  Private
router.delete("/", deleteProfile);

export default router;
