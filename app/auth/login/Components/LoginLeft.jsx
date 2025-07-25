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

  return (
    <div className="w-full max-w-xl mx-auto max-h-[92vh] px-10 my-12 py-4 bg-white/90 overflow-y-auto overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 backdrop-blur-xl rounded-lg border border-gray-200">
      <div className="space-y-4 max-w-xl mx-auto max-h-[80vh]">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">PB</span>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-gray-900">
              Welcome back
            </h1>
            <p className="text-gray-600 text-sm">
              Sign in to your account
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 text-sm rounded-xl border bg-red-50 text-red-700 border-red-200"
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
        </div>

        {/* Google Auth */}
        <div className="relative overflow-visible">
          <div
            onMouseEnter={() => isWaitlistEnabled && setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className="relative"
          >
            <GoogleAuthButton
              isLogin={true}
              size="compact"
              className="w-full h-12 text-sm border-gray-200 hover:border-gray-300 transition-colors"
            />
          </div>

          {/* Tooltip for Google OAuth Restrictions */}
          <AnimatePresence>
            {isWaitlistEnabled && showTooltip && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                className="absolute top-full left-0 right-0 mt-2 z-50 px-4"
              >
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 shadow-xl relative">
                  <div className="flex items-start gap-3">
                    <AlertCircle size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Google Sign-in Restricted</p>
                      <p className="text-blue-700 text-xs">
                        New Google registrations are temporarily disabled. Existing users can still sign in with Google. For new accounts, please join our waitlist for early access.
                      </p>
                    </div>
                  </div>
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-50 border-l border-t border-blue-200 rotate-45"></div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Divider */}
        <SocialDivider text="or" />

        {/* Auth Method Tabs */}
        <div className="flex bg-gray-50 rounded-xl p-1">
          <button
            type="button"
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all flex-1 ${
              authMethod === "email"
                ? "bg-white text-violet-600 shadow-sm border border-gray-200"
                : "text-gray-600 hover:text-gray-900"
            }`}
            onClick={() => toggleAuthMethod("email")}
          >
            <Mail size={16} />
            <span>Email</span>
          </button>
          <button
            type="button"
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all flex-1 ${
              authMethod === "phone"
                ? "bg-white text-violet-600 shadow-sm border border-gray-200"
                : "text-gray-600 hover:text-gray-900"
            }`}
            onClick={() => toggleAuthMethod("phone")}
          >
            <Phone size={16} />
            <span>Phone</span>
          </button>
        </div>

        {/* Form Section */}
        <div className="min-h-[200px]">
          <AnimatePresence mode="wait">
            {authMethod === "email" ? (
              <motion.div
                key="email"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
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
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
                onSubmit={handleRequestOtp}
              >
                <div className="space-y-2">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    placeholder="+1 (555) 123-4567"
                    className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all ${
                      formErrors.phone
                        ? "border-red-300 bg-red-50"
                        : "border-gray-200"
                    }`}
                    value={phone}
                    onChange={handlePhoneChange}
                    disabled={authLoading}
                  />
                  {formErrors.phone && (
                    <p className="text-sm text-red-600">{formErrors.phone}</p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-violet-600 text-white text-sm font-medium rounded-xl hover:bg-violet-700 focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
                onSubmit={handleVerifyOtp}
              >
                <button
                  type="button"
                  onClick={() => setIsOtpSent(false)}
                  className="flex items-center text-sm text-gray-600 hover:text-violet-600 transition-colors"
                >
                  <ArrowLeft size={16} className="mr-2" />
                  Back
                </button>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                        Verification code
                      </label>
                      <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        {phone}
                      </span>
                    </div>

                    <input
                      type="text"
                      inputMode="numeric"
                      id="otp"
                      placeholder="000000"
                      className={`w-full px-4 py-3 border rounded-xl text-center tracking-widest font-mono text-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all ${
                        formErrors.otp
                          ? "border-red-300 bg-red-50"
                          : "border-gray-200"
                      }`}
                      value={otp}
                      onChange={handleOtpChange}
                      disabled={authLoading}
                      maxLength={6}
                    />

                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>
                        {otpCountdown > 0 ? (
                          `Expires in ${otpCountdown}s`
                        ) : (
                          <span className="text-red-600">Code expired</span>
                        )}
                      </span>

                      <button
                        type="button"
                        className={`underline transition-colors ${
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
                      <p className="text-sm text-red-600">{formErrors.otp}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-violet-600 text-white text-sm font-medium rounded-xl hover:bg-violet-700 focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={authLoading}
                  >
                    {authLoading ? (
                      <LoadingSpinner size="sm" color="white" text="Verifying..." inline />
                    ) : (
                      "Verify & sign in"
                    )}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="text-center space-y-4">
          <div className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              href="/auth/register"
              className="text-violet-600 font-medium hover:text-violet-700 hover:underline transition-colors"
            >
              Sign up
            </Link>
          </div>

          <p className="text-xs text-gray-500 leading-relaxed">
            By signing in, you agree to our{" "}
            <Link href="/terms" className="hover:underline hover:text-violet-600 transition-colors">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="hover:underline hover:text-violet-600 transition-colors">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginLeft;
