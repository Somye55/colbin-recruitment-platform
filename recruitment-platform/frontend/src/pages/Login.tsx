import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { authService } from '../services/auth';

interface LoginFormData {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, trigger } = useForm<LoginFormData>({
    mode: 'onChange'
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const response = await authService.login(data);
      
      if (response.success && response.token) {
        authService.setToken(response.token);
        toast.success('Login successful!');
        navigate('/profile');
      } else {
        toast.error(response.message || 'Login failed. Please try again.');
      }
    } catch (error: any) {
      console.error('Login error:', error);

      // Handle validation errors from backend
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        const validationErrors = error.response.data.errors;
        validationErrors.forEach((err: any) => {
          toast.error(`${err.field}: ${err.message}`);
        });
      } else {
        toast.error(error.response?.data?.message || 'Login failed. Please try again.');
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
        <div className="max-w-md w-full">
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

          {/* Right side - Login form */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Member Login</h2>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path>
                    </svg>
                  </div>
                  <input
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
                        message: 'Please enter a valid email address'
                      },
                      maxLength: {
                        value: 254,
                        message: 'Email address is too long'
                      },
                      onChange: () => trigger('email')
                    })}
                    type="email"
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    placeholder="Email"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                    </svg>
                  </div>
                  <input
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 1,
                        message: 'Password cannot be empty'
                      },
                      onChange: () => trigger('password')
                    })}
                    type="password"
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    placeholder="Password"
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end">
                <Link
                  to="/forgot-password"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Forgot Username / Password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Signing in...' : 'LOGIN'}
              </button>

              <div className="text-center">
                <Link
                  to="/register"
                  className="text-gray-600 hover:text-gray-900 transition-colors inline-flex items-center"
                >
                  Create your Account
                  <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;