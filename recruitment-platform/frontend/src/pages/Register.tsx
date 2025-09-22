import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { authService } from "../services/auth";
import FormField from "../components/FormField";
import { validateUrl } from "../utils/validation";

interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
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
}

const Register: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: [] as string[],
  });
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    trigger,
  } = useForm<RegisterFormData>({
    mode: "onChange",
  });

  const password = watch("password");

  // Password strength checker
  const checkPasswordStrength = (password: string) => {
    let score = 0;
    const feedback: string[] = [];

    if (password.length >= 8) score += 1;
    else feedback.push("At least 8 characters");

    if (password.length >= 12) score += 1;
    else if (password.length >= 8) feedback.push("12+ characters recommended");

    if (/[a-z]/.test(password)) score += 1;
    else feedback.push("One lowercase letter");

    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push("One uppercase letter");

    if (/\d/.test(password)) score += 1;
    else feedback.push("One number");

    if (/[@$!%*?&]/.test(password)) score += 1;
    else feedback.push("One special character (@$!%*?&)");

    if (score >= 5) feedback.length = 0; // Clear feedback if strong

    return { score, feedback };
  };

  // Update password strength when password changes
  useEffect(() => {
    if (password) {
      setPasswordStrength(checkPasswordStrength(password));
    } else {
      setPasswordStrength({ score: 0, feedback: [] });
    }
  }, [password]);

  // Get password strength color
  const getPasswordStrengthColor = () => {
    if (passwordStrength.score <= 2) return "bg-red-500";
    if (passwordStrength.score <= 4) return "bg-yellow-500";
    return "bg-green-500";
  };

  // Get password strength text
  const getPasswordStrengthText = () => {
    if (passwordStrength.score <= 2) return "Weak";
    if (passwordStrength.score <= 4) return "Medium";
    return "Strong";
  };

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      // Remove confirmPassword from the data sent to API
      const { confirmPassword, ...registerData } = data;

      const response = await authService.register(registerData);

      if (response.success && response.token) {
        authService.setToken(response.token);
        toast.success("Registration successful!");
        navigate("/profile");
      } else {
        toast.error(
          response.message || "Registration failed. Please try again."
        );
      }
    } catch (error: any) {
      console.error("Registration error:", error);

      // Handle validation errors from backend
      if (
        error.response?.data?.errors &&
        Array.isArray(error.response.data.errors)
      ) {
        const validationErrors = error.response.data.errors;
        validationErrors.forEach((err: any) => {
          toast.error(`${err.field}: ${err.message}`);
        });
      } else {
        toast.error(
          error.response?.data?.message ||
            "Registration failed. Please try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-20 h-20 bg-blue-400 rounded-full opacity-20"></div>
        <div className="absolute top-32 right-20 w-16 h-16 bg-purple-400 rounded-full opacity-20"></div>
        <div className="absolute bottom-20 left-20 w-12 h-12 bg-green-400 rounded-full opacity-20"></div>
        <div className="absolute top-20 left-1/3 w-8 h-8 bg-yellow-400 rounded-full opacity-20"></div>
        <div className="absolute bottom-32 right-10 w-10 h-10 bg-pink-400 rounded-full opacity-20"></div>

        {/* Triangle decorations */}
        <div className="absolute top-16 left-16 w-0 h-0 border-l-4 border-r-4 border-b-8 border-transparent border-b-green-400 opacity-30 transform rotate-45"></div>
        <div className="absolute bottom-16 right-16 w-0 h-0 border-l-4 border-r-4 border-b-8 border-transparent border-b-blue-400 opacity-30 transform -rotate-12"></div>
        <div className="absolute top-1/2 left-8 w-0 h-0 border-l-3 border-r-3 border-b-6 border-transparent border-b-purple-400 opacity-30 transform rotate-12"></div>
      </div>

      <div className="relative flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl w-full">
          {/* Left side - Laptop icon */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-32 h-32 bg-white rounded-full shadow-lg flex items-center justify-center">
                <div className="w-24 h-16 bg-gray-800 rounded-md relative">
                  <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-6 h-4 bg-gray-700 rounded-sm"></div>
                  <div className="absolute inset-2 bg-gray-900 rounded-sm flex items-center justify-center">
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                      <div className="w-6 h-6 bg-gray-500 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Register form */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="px-6 py-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Create Account
              </h2>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-4">

                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Designation *
                    </label>
                    <select
                      {...register("designation", {
                        required: "Designation is required",
                      })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    >
                      <option value="">Select Designation</option>
                      <option value="Mr">Mr</option>
                      <option value="Mrs">Mrs</option>
                      <option value="Ms">Ms</option>
                      <option value="Dr">Dr</option>
                      <option value="Prof">Prof</option>
                    </select>
                    {errors.designation && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.designation.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gender *
                    </label>
                    <select
                      {...register("gender", {
                        required: "Gender is required",
                      })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Non-binary">Non-binary</option>
                      <option value="Prefer not to say">
                        Prefer not to say
                      </option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.gender && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.gender.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      {...register("firstName", {
                        required: "First name is required",
                        minLength: {
                          value: 2,
                          message: "First name must be at least 2 characters",
                        },
                        maxLength: {
                          value: 50,
                          message: "First name cannot exceed 50 characters",
                        },
                        pattern: {
                          value: /^[a-zA-Z\s'-]+$/,
                          message:
                            "First name can only contain letters, spaces, hyphens, and apostrophes",
                        },
                      })}
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      placeholder="Enter your first name"
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.firstName.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      {...register("lastName", {
                        required: "Last name is required",
                        minLength: {
                          value: 2,
                          message: "Last name must be at least 2 characters",
                        },
                        maxLength: {
                          value: 50,
                          message: "Last name cannot exceed 50 characters",
                        },
                        pattern: {
                          value: /^[a-zA-Z\s'-]+$/,
                          message:
                            "Last name can only contain letters, spaces, hyphens, and apostrophes",
                        },
                      })}
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      placeholder="Enter your last name"
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country *
                    </label>
                    <input
                      {...register("country", {
                        required: "Country is required",
                        minLength: {
                          value: 2,
                          message: "Country must be at least 2 characters",
                        },
                        maxLength: {
                          value: 100,
                          message: "Country cannot exceed 100 characters",
                        },
                      })}
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      placeholder="Enter your country"
                    />
                    {errors.country && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.country.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Birth *
                    </label>
                    <input
                      {...register("dob", {
                        required: "Date of birth is required",
                        validate: {
                          age: (value) => {
                            const today = new Date();
                            const birthDate = new Date(value);
                            let age =
                              today.getFullYear() - birthDate.getFullYear();
                            const monthDiff =
                              today.getMonth() - birthDate.getMonth();

                            if (
                              monthDiff < 0 ||
                              (monthDiff === 0 &&
                                today.getDate() < birthDate.getDate())
                            ) {
                              age--;
                            }

                            return (
                              (age >= 18 && age <= 100) ||
                              "Age must be between 18 and 100 years"
                            );
                          },
                        },
                      })}
                      type="date"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    />
                    {errors.dob && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.dob.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Professional Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Experience (Years) *
                    </label>
                    <input
                      {...register("totalExperience", {
                        required: "Total experience is required",
                        min: {
                          value: 0,
                          message: "Experience cannot be negative",
                        },
                        max: {
                          value: 50,
                          message: "Experience cannot exceed 50 years",
                        },
                        validate: {
                          decimal: (value) => {
                            if (value === undefined || value === null || value === 0) return true;
                            const numValue = Number(value);
                            if (isNaN(numValue)) return true;
                            return (
                              Number(numValue.toFixed(1)) === numValue ||
                              "Experience must have at most 1 decimal place"
                            );
                          },
                        },
                      })}
                      type="number"
                      step="0.1"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      placeholder="e.g., 5.5"
                    />
                    {errors.totalExperience && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.totalExperience.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notice Period *
                    </label>
                    <select
                      {...register("noticePeriod", {
                        required: "Notice period status is required",
                      })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    >
                      <option value="">Select Notice Period</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                    {errors.noticePeriod && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.noticePeriod.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current CTC *
                    </label>
                    <input
                      {...register("currentCTC", {
                        required: "Current CTC is required",
                        min: {
                          value: 0,
                          message: "Current CTC cannot be negative",
                        },
                        max: {
                          value: 10000000,
                          message: "Current CTC cannot exceed 10,000,000",
                        },
                      })}
                      type="number"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      placeholder="Enter current CTC"
                    />
                    {errors.currentCTC && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.currentCTC.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expected CTC *
                    </label>
                    <input
                      {...register("expectedCTC", {
                        required: "Expected CTC is required",
                        min: {
                          value: 0,
                          message: "Expected CTC cannot be negative",
                        },
                        max: {
                          value: 10000000,
                          message: "Expected CTC cannot exceed 10,000,000",
                        },
                        validate: {
                          greaterThanCurrent: (value) => {
                            const currentCTC = watch("currentCTC");
                            return (
                              !currentCTC ||
                              value >= currentCTC ||
                              "Expected CTC must be greater than or equal to current CTC"
                            );
                          },
                        },
                      })}
                      type="number"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      placeholder="Enter expected CTC"
                    />
                    {errors.expectedCTC && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.expectedCTC.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Conditional Notice Period Days */}
                {watch("noticePeriod") === "Yes" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notice Period Days *
                    </label>
                    <input
                      {...register("noticePeriodDays", {
                        required:
                          "Notice period days is required when notice period is Yes",
                        min: {
                          value: 0,
                          message: "Notice period days cannot be negative",
                        },
                        max: {
                          value: 365,
                          message: "Notice period cannot exceed 365 days",
                        },
                      })}
                      type="number"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      placeholder="Enter notice period days"
                    />
                    {errors.noticePeriodDays && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.noticePeriodDays.message}
                      </p>
                    )}
                  </div>
                )}

                {/* Optional Fields */}
                <FormField label="Bio" error={errors.bio?.message}>
                  <textarea
                    {...register("bio", {
                      maxLength: {
                        value: 500,
                        message: "Bio cannot exceed 500 characters",
                      },
                    })}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    placeholder="Tell us about yourself..."
                  />
                </FormField>

                <FormField label="Experience Description" error={errors.experience?.message}>
                  <textarea
                    {...register("experience", {
                      maxLength: {
                        value: 1000,
                        message:
                          "Experience description cannot exceed 1000 characters",
                      },
                    })}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    placeholder="Describe your work experience..."
                  />
                </FormField>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Resume URL" error={errors.resumeUrl?.message}>
                    <input
                      {...register("resumeUrl", {
                        validate: (value) => {
                          if (!value || value.trim() === '') return true;
                          return validateUrl(value) === '' || 'Please enter a valid URL (must start with http:// or https://)';
                        }
                      })}
                      type="url"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      placeholder="https://example.com/resume.pdf"
                    />
                  </FormField>

                  <FormField label="Avatar URL">
                    <input
                      {...register("avatar")}
                      type="url"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      placeholder="https://example.com/avatar.jpg"
                    />
                  </FormField>
                </div>

                <FormField label="Email" required error={errors.email?.message}>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                        ></path>
                      </svg>
                    </div>
                    <input
                      {...register("email", {
                        required: "Email is required",
                        pattern: {
                          value:
                            /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
                          message: "Please enter a valid email address",
                        },
                        maxLength: {
                          value: 254,
                          message: "Email address is too long",
                        },
                        onChange: () => trigger("email"),
                      })}
                      type="email"
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      placeholder="Email"
                    />
                  </div>
                </FormField>

                <FormField label="Phone Number" error={errors.phone?.message}>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        ></path>
                      </svg>
                    </div>
                    <input
                      {...register("phone", {
                        pattern: {
                          value: /^\+?[\d\s\-\(\)\.]+$/,
                          message: "Please enter a valid phone number",
                        },
                        validate: {
                          length: (value) => {
                            if (!value) return true; // Optional field
                            const cleanPhone = value.replace(/\D/g, "");
                            return (
                              (cleanPhone.length >= 10 &&
                                cleanPhone.length <= 15) ||
                              "Phone number must be between 10 and 15 digits"
                            );
                          },
                        },
                        onChange: () => trigger("phone"),
                      })}
                      type="tel"
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      placeholder="Phone Number (Optional)"
                    />
                  </div>
                </FormField>

                <FormField label="Password" required error={errors.password?.message}>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        ></path>
                      </svg>
                    </div>
                    <input
                      {...register("password", {
                        required: "Password is required",
                        minLength: {
                          value: 8,
                          message: "Password must be at least 8 characters",
                        },
                        maxLength: {
                          value: 128,
                          message: "Password cannot exceed 128 characters",
                        },
                        pattern: {
                          value:
                            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                          message:
                            "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)",
                        },
                        validate: {
                          notCommon: (value) => {
                            const commonPasswords = [
                              "password",
                              "password123",
                              "123456",
                              "qwerty",
                              "abc123",
                              "admin",
                              "letmein",
                            ];
                            return (
                              !commonPasswords.includes(value?.toLowerCase()) ||
                              "This password is too common. Please choose a more secure password"
                            );
                          },
                        },
                        onChange: () => trigger("password"),
                      })}
                      type="password"
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      placeholder="Password"
                    />
                  </div>
                </FormField>

                {/* Password Strength Indicator */}
                {password && (
                  <div className="w-full">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">
                        Password strength:
                      </span>
                      <span
                        className={`text-sm font-medium ${
                          passwordStrength.score <= 2
                            ? "text-red-600"
                            : passwordStrength.score <= 4
                            ? "text-yellow-600"
                            : "text-green-600"
                        }`}
                      >
                        {getPasswordStrengthText()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                        style={{
                          width: `${Math.min(
                            (passwordStrength.score / 5) * 100,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                    {passwordStrength.feedback.length > 0 && (
                      <ul className="mt-1 text-xs text-gray-500">
                        {passwordStrength.feedback.map((item, index) => (
                          <li key={index}>• {item}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                <FormField label="Confirm Password" required error={errors.confirmPassword?.message}>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        ></path>
                      </svg>
                    </div>
                    <input
                      {...register("confirmPassword", {
                        required: "Please confirm your password",
                        validate: (value) =>
                          value === password || "Passwords do not match",
                      })}
                      type="password"
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      placeholder="Confirm Password"
                    />
                  </div>
                </FormField>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Creating account..." : "CREATE ACCOUNT"}
              </button>

              <div className="text-center">
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-gray-900 transition-colors inline-flex items-center"
                >
                  Already have an account? Sign in
                  <svg
                    className="ml-1 w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    ></path>
                  </svg>
                </Link>
              </div>
            </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
