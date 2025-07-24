'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  AlertCircle, 
  Shield,
  Info
} from 'lucide-react';
import { FormStep } from './FormStep';

const PasswordSetup = ({ 
  passwordData, 
  setPasswordData, 
  formErrors, 
  onSubmit, 
  isSubmitting,
  isActive,
  currentStep 
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });

  const validatePassword = (password) => {
    const strength = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[@$!%*?&]/.test(password)
    };
    
    setPasswordStrength(strength);
    
    // Return the count of met requirements for validation
    return Object.values(strength).filter(Boolean).length;
  };

  const handlePasswordChange = (e) => {
    const password = e.target.value;
    setPasswordData(prev => ({ ...prev, password }));
    validatePassword(password);
  };

  const handleConfirmPasswordChange = (e) => {
    setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }));
  };

  // Check if password meets requirements (at least 3 out of 4 + length)
  const strengthCount = Object.values(passwordStrength).filter(Boolean).length;
  const isPasswordValid = passwordStrength.length && strengthCount >= 4; // length + at least 3 others
  const doPasswordsMatch = passwordData.password === passwordData.confirmPassword && passwordData.confirmPassword.length > 0;
  const canSubmit = isPasswordValid && doPasswordsMatch;

  return (
    <FormStep title="Set Your Password" isActive={isActive && (currentStep === 0 || currentStep === 4)}>
      <div className="space-y-6">
        {/* Info Section */}
        <div className="bg-violet-50 rounded-lg p-4 border border-violet-100">
          <p className="text-sm text-violet-700 flex items-center">
            <Info className="h-4 w-4 mr-2 flex-shrink-0" />
            Create a secure password for your account so you can login with email and password in the future.
          </p>
        </div>

        {/* Password Fields Section */}
        <div className="bg-white rounded-lg p-5 border border-gray-100 shadow-sm">
          <h4 className="text-sm font-medium text-gray-800 mb-4 flex items-center">
            <Lock className="h-4 w-4 mr-2 text-violet-600" />
            Password Setup
          </h4>

          <div className="space-y-4">
            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={passwordData.password}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {passwordData.confirmPassword && !doPasswordsMatch && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  Passwords do not match
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Password Requirements Section */}
        <div className="bg-white rounded-lg p-5 border border-gray-100 shadow-sm">
          <h4 className="text-sm font-medium text-gray-800 mb-4 flex items-center">
            <Shield className="h-4 w-4 mr-2 text-violet-600" />
            Password Requirements
          </h4>
          
          {/* Required */}
          <div className="mb-4">
            <p className="text-xs text-gray-600 mb-2 font-medium">Required:</p>
            <div className={`flex items-center text-sm ${passwordStrength.length ? 'text-green-600' : 'text-gray-500'}`}>
              {passwordStrength.length ? <CheckCircle className="w-4 h-4 mr-2" /> : <div className="w-4 h-4 mr-2 border border-gray-300 rounded-full" />}
              At least 8 characters long
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-600 mb-2 font-medium">
              Choose at least 3 of the following:
              <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                (strengthCount - (passwordStrength.length ? 1 : 0)) >= 3 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {strengthCount - (passwordStrength.length ? 1 : 0)}/4 selected
              </span>
            </p>
            <div className="space-y-2">
              <div className={`flex items-center text-sm ${passwordStrength.uppercase ? 'text-green-600' : 'text-gray-500'}`}>
                {passwordStrength.uppercase ? <CheckCircle className="w-4 h-4 mr-2" /> : <div className="w-4 h-4 mr-2 border border-gray-300 rounded-full" />}
                One uppercase letter (A-Z)
              </div>
              <div className={`flex items-center text-sm ${passwordStrength.lowercase ? 'text-green-600' : 'text-gray-500'}`}>
                {passwordStrength.lowercase ? <CheckCircle className="w-4 h-4 mr-2" /> : <div className="w-4 h-4 mr-2 border border-gray-300 rounded-full" />}
                One lowercase letter (a-z)
              </div>
              <div className={`flex items-center text-sm ${passwordStrength.number ? 'text-green-600' : 'text-gray-500'}`}>
                {passwordStrength.number ? <CheckCircle className="w-4 h-4 mr-2" /> : <div className="w-4 h-4 mr-2 border border-gray-300 rounded-full" />}
                One number (0-9)
              </div>
              <div className={`flex items-center text-sm ${passwordStrength.special ? 'text-green-600' : 'text-gray-500'}`}>
                {passwordStrength.special ? <CheckCircle className="w-4 h-4 mr-2" /> : <div className="w-4 h-4 mr-2 border border-gray-300 rounded-full" />}
                One special character (@$!%*?&)
              </div>
            </div>
          </div>
        </div>

        {/* Error Messages */}
        {formErrors.password && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-sm flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" />
              {formErrors.password}
            </p>
          </div>
        )}

       {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={!canSubmit || isSubmitting}
          onClick={onSubmit}
          className="w-full bg-violet-600 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Setting Password...
            </div>
          ) : (
            'Set Password & Continue'
          )}
        </motion.button>

        {/* Security Note */}
        <div className="text-center">
          <p className="text-xs text-gray-500 flex items-center justify-center">
            <Shield className="w-3 h-3 mr-1" />
            Your password will be securely hashed and stored. You can change it anytime in your account settings.
          </p>
        </div>
      </div>
    </FormStep>
  );
};

export default PasswordSetup; 