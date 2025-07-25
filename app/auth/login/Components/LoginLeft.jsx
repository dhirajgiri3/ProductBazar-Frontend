"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Phone,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/lib/contexts/auth-context";
import { useWaitlist } from "@/lib/contexts/waitlist-context";
import EmailLoginForm from './EmailLoginForm';
import GoogleAuthButton from 'Components/common/Auth/GoogleAuthButton';
import SocialDivider from 'Components/common/Auth/SocialDivider';
import { debounce } from "lodash";
import LoadingSpinner from '../../../../Components/common/LoadingSpinner';

const LoginLeft = () => {
  // Auth context for login methods and state
  const {
    loginWithEmail,
    loginWithPhone,
    verifyOtpForLogin,
    sendOtp,
    authLoading,
    error,
    clearError,
  } = useAuth();

  // Waitlist context to check if waitlist is enabled
  const { isWaitlistEnabled } = useWaitlist();

  // Component state
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(120);
  const [formErrors, setFormErrors] = useState({});
  const [authMethod, setAuthMethod] = useState('email');
  const [showTooltip, setShowTooltip] = useState(false);

  // Clear context errors when component unmounts or method changes
  useEffect(() => {
    return () => {
      if (clearError) clearError();
    }
  }, [clearError, authMethod]);

  // Clear errors when changing auth method
  useEffect(() => {
    if (clearError) clearError();
    setFormErrors({});
  }, [authMethod, clearError]);

  // OTP countdown timer
  useEffect(() => {
    if (!isOtpSent || otpCountdown <= 0) return;

    const timer = setInterval(() => {
      setOtpCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isOtpSent, otpCountdown]);

  // Function to handle requesting OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setFormErrors({});
    if (clearError) clearError();

    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phone)) {
      setFormErrors({ phone: "Invalid phone number (e.g., +1234567890)" });
      return;
    }

    try {
      const success = await sendOtp(phone, 'login');
      if (success && success.success) {
        setIsOtpSent(true);
        setOtpCountdown(120);
      }
    } catch (error) {
      console.error("OTP request failed:", error);
    }
  };

  // Function to handle verifying OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setFormErrors({ phone: "", otp: "" });
    if (clearError) clearError();

    if (!/^\d{4,6}$/.test(otp)) {
      setFormErrors({ otp: "OTP must be 4-6 digits" });
      return;
    }

    await verifyOtpForLogin(phone, otp);
  };

  // Function to handle resending OTP
  const resendOtp = async () => {
    try {
      if (clearError) clearError();
      const success = await sendOtp(phone, 'login');
      if (success && success.success) setOtpCountdown(120);
    } catch (error) {
      console.error("Resend OTP failed:", error);
    }
  };

  // Debounced resend OTP to prevent spam
  const debouncedResendOtp = debounce(resendOtp, 300);

  // Handle email login
  const handleEmailLogin = async (credentials) => {
    await loginWithEmail(credentials);
  };

  // Toggle between auth methods
  const toggleAuthMethod = (method) => {
    if (method === authMethod) return;

    setAuthMethod(method);
    if (isOtpSent) setIsOtpSent(false);
    setFormErrors({});
    if (clearError) clearError();
  };

  // Phone number input change handler with validation
  const handlePhoneChange = (e) => {
    const value = e.target.value;
    if (value === "" || /^\+?\d*$/.test(value)) {
      setPhone(value);

      if (formErrors.phone) {
        setFormErrors((prev) => ({ ...prev, phone: undefined }));
      }
    }
  };

  // OTP input change handler with validation
  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 6);
    setOtp(value);

    if (formErrors.otp) {
      setFormErrors((prev) => ({ ...prev, otp: undefined }));
    }
  };

  // Minimal animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.3, staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full max-h-[92vh] max-w-xl mx-auto px-4 py-7 sm:px-6 lg:px-8"
    >
      <div className="bg-white/90 max-h-[85vh] backdrop-blur-xl w-full rounded-lg border border-gray-200 p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <motion.div
          className="text-center mb-6 sm:mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div 
            variants={itemVariants}
            className="flex justify-center mb-4 sm:mb-6"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-white font-semibold text-xs sm:text-sm">PB</span>
            </div>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-xl sm:text-2xl lg:text-3xl font-medium text-gray-900 mb-2"
          >
            Welcome back
          </motion.h1>
          <motion.p
            variants={itemVariants}
            className="text-gray-600 text-sm sm:text-base"
          >
            Sign in to your account
          </motion.p>

          {/* Error Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="p-3 mt-4 text-sm rounded border bg-red-50 text-red-700 border-red-200"
            >
              {error}
              {error.includes("no password") && (
                <button
                  type="button"
                  className="ml-2 underline font-medium hover:text-red-800 transition-colors"
                  onClick={() => toggleAuthMethod("phone")}
                >
                  Try phone login
                </button>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* Google Auth with Tooltip - Fixed to show tooltip on Google button hover */}
        <motion.div variants={itemVariants} className="mb-4 sm:mb-6 relative">
          <div className="relative">
            <div
              onMouseEnter={() => isWaitlistEnabled && setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              className="relative z-10"
            >
              <GoogleAuthButton 
                isLogin={true} 
                size="compact"
                className="h-10 sm:h-12 text-sm sm:text-base border-gray-300 w-full"
              />
            </div>
            
            {/* Tooltip for Google OAuth Restrictions */}
            <AnimatePresence>
              {isWaitlistEnabled && showTooltip && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-full max-w-sm z-[9999] pointer-events-none"
                >
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 shadow-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">Google Sign-in Restricted</p>
                        <p className="text-blue-700">
                          New Google registrations are temporarily disabled. Existing users can still sign in with Google. For new accounts, please join our waitlist for early access.
                        </p>
                      </div>
                    </div>
                    {/* Tooltip arrow */}
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-50 border-l border-t border-blue-200 rotate-45"></div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Divider */}
        <motion.div variants={itemVariants} className="mb-4 sm:mb-6">
          <SocialDivider text="or" />
        </motion.div>

        {/* Auth Method Tabs */}
        <motion.div variants={itemVariants} className="mb-4 sm:mb-6">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              type="button"
              className={`flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-3 rounded-md text-xs sm:text-sm font-medium transition-all flex-1 ${
                authMethod === "email"
                  ? "bg-gradient-to-r from-violet-500 to-violet-600 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
              onClick={() => toggleAuthMethod("email")}
            >
              <Mail size={14} className="sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Email</span>
            </button>
            <button
              type="button"
              className={`flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all flex-1 ${
                authMethod === "phone"
                  ? "bg-gradient-to-r from-violet-500 to-violet-600 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
              onClick={() => toggleAuthMethod("phone")}
            >
              <Phone size={14} className="sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Phone</span>
            </button>
          </div>
        </motion.div>

        {/* Form Section - Added overflow visible to prevent clipping */}
        <div className="min-h-[140px] sm:min-h-[160px] overflow-visible">
          <AnimatePresence mode="wait">
            {authMethod === "email" ? (
              <motion.div
                key="email"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <EmailLoginForm
                  onSubmit={handleEmailLogin}
                  isLoading={authLoading}
                  onToggleMethod={() => toggleAuthMethod("phone")}
                />
              </motion.div>
            ) : !isOtpSent ? (
              <motion.form
                key="phoneInput"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-3 sm:space-y-4"
                onSubmit={handleRequestOtp}
              >
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    placeholder="+1 (555) 123-4567"
                    className={`w-full px-3 py-2.5 sm:py-3 border rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all ${
                      formErrors.phone
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300"
                    }`}
                    value={phone}
                    onChange={handlePhoneChange}
                    disabled={authLoading}
                  />
                  {formErrors.phone && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.phone}</p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-violet-500 to-violet-600 text-white text-sm sm:text-base font-medium rounded-lg hover:from-violet-600 hover:to-violet-700 focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 transform transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-sm"
                  disabled={authLoading}
                >
                  {authLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <LoadingSpinner size="sm" color="white" />
                      Sending...
                    </span>
                  ) : (
                    "Send code"
                  )}
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="otpInput"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-3 sm:space-y-4"
                onSubmit={handleVerifyOtp}
              >
                <button
                  type="button"
                  onClick={() => setIsOtpSent(false)}
                  className="flex items-center text-sm text-gray-600 hover:text-violet-600 transition-colors"
                >
                  <ArrowLeft size={16} className="mr-1" />
                  Back
                </button>

                <div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 gap-1 sm:gap-0">
                    <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                      Verification code
                    </label>
                    <span className="text-xs text-gray-500 bg-violet-50 border border-violet-200 px-2 py-1 rounded w-fit">
                      {phone}
                    </span>
                  </div>

                  <input
                    type="text"
                    inputMode="numeric"
                    id="otp"
                    placeholder="000000"
                    className={`w-full px-3 py-2.5 sm:py-3 border rounded-lg text-center tracking-widest font-mono text-lg sm:text-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all ${
                      formErrors.otp
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300"
                    }`}
                    value={otp}
                    onChange={handleOtpChange}
                    disabled={authLoading}
                    maxLength={6}
                  />

                  <div className="flex flex-col xs:flex-row xs:justify-between xs:items-center mt-2 gap-1 xs:gap-0">
                    <div className="text-xs text-gray-500">
                      {otpCountdown > 0 ? (
                        `Expires in ${otpCountdown}s`
                      ) : (
                        <span className="text-red-600">Code expired</span>
                      )}
                    </div>

                    <button
                      type="button"
                      className={`text-xs underline w-fit transition-colors ${
                        otpCountdown > 0 || authLoading
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-violet-600 hover:text-violet-700"
                      }`}
                      onClick={debouncedResendOtp}
                      disabled={otpCountdown > 0 || authLoading}
                    >
                      {authLoading && otpCountdown <= 0 ? "Sending..." : "Resend"}
                    </button>
                  </div>

                  {formErrors.otp && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.otp}</p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-violet-500 to-violet-600 text-white text-sm sm:text-base font-medium rounded-lg hover:from-violet-600 hover:to-violet-700 focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 transform transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-sm"
                  disabled={authLoading}
                >
                  {authLoading ? (
                    <LoadingSpinner size="sm" color="white" text="Verifying..." inline />
                  ) : (
                    "Verify & sign in"
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <motion.div
          className="mt-6 sm:mt-8 text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              href="/auth/register"
              className="text-violet-600 font-medium hover:text-violet-700 hover:underline transition-colors"
            >
              Sign up
            </Link>
          </motion.div>

          <motion.p
            variants={itemVariants}
            className="text-xs sm:text-sm text-gray-500 mt-3 sm:mt-4 leading-relaxed px-2"
          >
            By signing in, you agree to our{" "}
            <Link href="/terms" className="hover:underline hover:text-violet-600 transition-colors">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="hover:underline hover:text-violet-600 transition-colors">
              Privacy Policy
            </Link>
          </motion.p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default LoginLeft;
