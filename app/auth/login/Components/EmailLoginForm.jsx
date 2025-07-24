'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineSparkles } from 'react-icons/hi';
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

  const inputVariants = {
    focused: {
      scale: 1.01,
      boxShadow: '0 0 0 3px rgba(124, 58, 237, 0.15)',
      borderColor: 'rgba(124, 58, 237, 0.8)',
    },
    error: {
      scale: 1.01,
      boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.15)',
      borderColor: 'rgba(239, 68, 68, 0.8)',
    },
    normal: {
      scale: 1,
      boxShadow: 'none',
      borderColor: 'rgba(229, 231, 235, 1)',
    },
  };

  const formControlVariants = {
    initial: { y: 10, opacity: 0 },
    animate: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 400, damping: 25 } },
  };

  const ErrorMessage = ({ error }) => {
    if (!error) return null;
    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className="mt-2 flex items-start gap-1.5 text-xs text-red-500"
      >
        <span className="w-1 h-1 bg-red-500 rounded-full mt-1.5 flex-shrink-0"></span>
        <span>{error}</span>
      </motion.div>
    );
  };

  return (
    <motion.form
      className="space-y-5 flex flex-col"
      onSubmit={handleSubmit}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="flex-1 space-y-5">
        <motion.div
          variants={formControlVariants}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.1 }}
        >
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <div className="relative group">
            <motion.input
              type="email"
              id="email"
              name="email"
              placeholder="your@email.com"
              className={`w-full px-4 py-3.5 pl-12 border rounded-xl text-sm text-gray-800 transition-all duration-300 ${formErrors.email
                  ? 'border-red-300 ring-red-100 bg-red-50/30'
                  : 'border-gray-200 group-hover:border-violet-300 bg-white/80 backdrop-blur-sm'
                }`}
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
              variants={inputVariants}
              animate={formErrors.email ? 'error' : activeField === 'email' ? 'focused' : 'normal'}
              onFocus={() => setActiveField('email')}
              onBlur={() => setActiveField(null)}
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <HiOutlineMail
                className={`text-lg transition-colors duration-300 ${formErrors.email ? 'text-red-400' : 'text-gray-400 group-hover:text-violet-500'
                  }`}
              />
            </div>
          </div>
          <ErrorMessage error={formErrors.email} />
        </motion.div>

        <motion.div
          variants={formControlVariants}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.2 }}
        >
          <div className="flex justify-between items-center mb-2">
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
          <div className="relative group">
            <motion.input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              placeholder="••••••••"
              className={`w-full px-4 py-3.5 pl-12 pr-12 border rounded-xl text-sm text-gray-800 transition-all duration-300 ${formErrors.password
                  ? 'border-red-300 ring-red-100 bg-red-50/30'
                  : 'border-gray-200 group-hover:border-violet-300 bg-white/80 backdrop-blur-sm'
                }`}
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
              variants={inputVariants}
              animate={
                formErrors.password ? 'error' : activeField === 'password' ? 'focused' : 'normal'
              }
              onFocus={() => setActiveField('password')}
              onBlur={() => setActiveField(null)}
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <HiOutlineLockClosed
                className={`text-lg transition-colors duration-300 ${formErrors.password ? 'text-red-400' : 'text-gray-400 group-hover:text-violet-500'
                  }`}
              />
            </div>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-violet-600 transition-colors"
            >
              {showPassword ? (
                <FaEyeSlash className="text-sm opacity-70 hover:opacity-100" />
              ) : (
                <FaEye className="text-sm opacity-70 hover:opacity-100" />
              )}
            </button>
          </div>
          <ErrorMessage error={formErrors.password} />
        </motion.div>
      </div>

      <motion.button
        type="submit"
        className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-medium rounded-xl hover:from-violet-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-70 disabled:from-violet-400 disabled:to-purple-400 text-sm shadow-lg hover:shadow-xl"
        disabled={isLoading}
        whileHover={{ scale: isLoading ? 1 : 1.02 }}
        whileTap={{ scale: isLoading ? 1 : 0.98 }}
        variants={formControlVariants}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.4 }}
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
