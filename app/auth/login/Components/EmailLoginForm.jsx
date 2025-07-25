'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { HiOutlineMail, HiOutlineLockClosed } from 'react-icons/hi';
import Link from 'next/link';

const EmailLoginForm = ({ onSubmit, isLoading, onToggleMethod }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [activeField, setActiveField] = useState(null);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Invalid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    }

    return errors;
  };

  const handleSubmit = e => {
    e.preventDefault();
    const errors = validateForm();

    if (Object.keys(errors).length === 0) {
      onSubmit({
        email: formData.email,
        password: formData.password,
      });
    } else {
      setFormErrors(errors);
    }
  };

  const ErrorMessage = ({ error }) => {
    if (!error) return null;
    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className="mt-2 text-sm text-red-600"
      >
        {error}
      </motion.div>
    );
  };

  return (
    <motion.form
      className="space-y-6"
      onSubmit={handleSubmit}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email Address
          </label>
          <div className="relative">
            <input
              type="email"
              id="email"
              name="email"
              placeholder="your@email.com"
              className={`w-full px-4 py-3 pl-12 border rounded-xl text-sm text-gray-800 transition-all duration-200 ${
                formErrors.email
                  ? 'border-red-300 bg-red-50'
                  : activeField === 'email'
                  ? 'border-violet-500 bg-white'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
              onFocus={() => setActiveField('email')}
              onBlur={() => setActiveField(null)}
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <HiOutlineMail
                className={`text-lg transition-colors duration-200 ${
                  formErrors.email ? 'text-red-400' : activeField === 'email' ? 'text-violet-500' : 'text-gray-400'
                }`}
              />
            </div>
          </div>
          <ErrorMessage error={formErrors.email} />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <Link
              href="/auth/forgot-password"
              className="text-xs text-violet-600 hover:text-violet-700 hover:underline transition-colors"
            >
              Forgot?
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              placeholder="••••••••"
              className={`w-full px-4 py-3 pl-12 pr-12 border rounded-xl text-sm text-gray-800 transition-all duration-200 ${
                formErrors.password
                  ? 'border-red-300 bg-red-50'
                  : activeField === 'password'
                  ? 'border-violet-500 bg-white'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
              onFocus={() => setActiveField('password')}
              onBlur={() => setActiveField(null)}
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <HiOutlineLockClosed
                className={`text-lg transition-colors duration-200 ${
                  formErrors.password ? 'text-red-400' : activeField === 'password' ? 'text-violet-500' : 'text-gray-400'
                }`}
              />
            </div>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-violet-600 transition-colors"
            >
              {showPassword ? (
                <FaEyeSlash className="text-sm" />
              ) : (
                <FaEye className="text-sm" />
              )}
            </button>
          </div>
          <ErrorMessage error={formErrors.password} />
        </div>
      </div>

      <motion.button
        type="submit"
        className="w-full py-3 bg-violet-600 text-white font-medium rounded-xl hover:bg-violet-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        disabled={isLoading}
        whileHover={{ scale: isLoading ? 1 : 1.01 }}
        whileTap={{ scale: isLoading ? 1 : 0.99 }}
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <svg
              className="animate-spin h-4 w-4 mr-2 text-white"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Signing in...
          </span>
        ) : (
          'Sign In'
        )}
      </motion.button>
    </motion.form>
  );
};

export default EmailLoginForm;
