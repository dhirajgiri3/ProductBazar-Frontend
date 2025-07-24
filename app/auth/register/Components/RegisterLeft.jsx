"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Phone,
  ArrowLeft,
  Zap,
  User,
  Building2,
  Wallet,
  Briefcase,
} from "lucide-react";
import { useAuth } from "@/lib/contexts/auth-context";
import EmailRegistrationForm from "./EmailRegistrationForm";
import GoogleAuthButton from 'Components/common/Auth/GoogleAuthButton';
import SocialDivider from 'Components/common/Auth/SocialDivider';
import { debounce } from "lodash";
import LoadingSpinner from "../../../../Components/common/LoadingSpinner";

const RegisterLeft = () => {
  const {
    registerWithPhone,
    verifyOtpForRegister,
    registerWithEmail,
    authLoading,
    error,
    clearError,
  } = useAuth();

  // State for phone registration
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [role, setRole] = useState("user");
  const [roleDetails, setRoleDetails] = useState({});
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(120);
  const [formErrors, setFormErrors] = useState({});
  const [authMethod, setAuthMethod] = useState("email");

  // Role options consistent with backend
  const roles = [
    { value: "user", label: "Regular User" },
    { value: "startupOwner", label: "Startup Owner" },
    { value: "investor", label: "Investor" },
    { value: "agency", label: "Agency" },
    { value: "freelancer", label: "Freelancer" },
    { value: "jobseeker", label: "Job Seeker" },
  ];

  // Role-specific fields configuration (simplified for compact view)
  const roleFields = {
    startupOwner: [
      {
        name: "companyName",
        label: "Company Name",
        type: "text",
        icon: Building2,
        required: true,
      },
    ],
    investor: [
      {
        name: "investorType",
        label: "Investor Type",
        type: "text",
        icon: Wallet,
        required: true,
      },
    ],
    agency: [
      {
        name: "companyName",
        label: "Company Name",
        type: "text",
        icon: Building2,
        required: true,
      },
    ],
    freelancer: [
      {
        name: "skills",
        label: "Skills",
        type: "text",
        icon: Briefcase,
        required: true,
      },
    ],
    jobseeker: [
      {
        name: "jobTitle",
        label: "Desired Job Title",
        type: "text",
        icon: Briefcase,
        required: true,
      },
    ],
  };

  // Cleanup error state on unmount or auth method change
  useEffect(() => {
    return () => clearError?.();
  }, [clearError, authMethod]);

  // OTP countdown timer
  useEffect(() => {
    if (!isOtpSent || otpCountdown <= 0) return;

    const timer = setInterval(() => {
      setOtpCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isOtpSent, otpCountdown]);

  // Handle OTP request
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setFormErrors({});
    if (clearError) clearError();

    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phone)) {
      setFormErrors({ phone: "Invalid phone number (e.g., +1234567890)" });
      return;
    }

    if (role !== "user" && roleFields[role]) {
      const requiredFields = roleFields[role].filter((field) => field.required);
      for (const field of requiredFields) {
        if (!roleDetails[field.name] || roleDetails[field.name].trim() === "") {
          setFormErrors({ [field.name]: `${field.label} is required` });
          return;
        }
      }
    }

    try {
      const result = await registerWithPhone(phone, role, roleDetails);
      if (result.success) {
        setIsOtpSent(true);
        setOtpCountdown(120);
      } else {
        setFormErrors({ phone: result.message || "Failed to send OTP" });
      }
    } catch (error) {
      setFormErrors({ phone: "Failed to request OTP. Please try again." });
      console.error("OTP request failed:", error);
    }
  };

  // Handle OTP verification
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setFormErrors({});

    if (!/^\d{4,6}$/.test(otp)) {
      setFormErrors({ otp: "OTP must be 4-6 digits" });
      return;
    }

    try {
      const result = await verifyOtpForRegister(phone, otp, role, roleDetails);
      if (!result.success) {
        setFormErrors({ otp: result.message || "OTP verification failed" });
      }
    } catch (error) {
      setFormErrors({ otp: "OTP verification failed. Please try again." });
      console.error("OTP verification failed:", error);
    }
  };

  // Resend OTP
  const resendOtp = async () => {
    try {
      const result = await registerWithPhone(phone, role, roleDetails);
      if (result.success) {
        setOtpCountdown(120);
        setFormErrors({});
      } else {
        setFormErrors({ otp: result.message || "Failed to resend OTP" });
      }
    } catch (error) {
      setFormErrors({ otp: "Failed to resend OTP. Please try again." });
      console.error("Resend OTP failed:", error);
    }
  };

  const debouncedResendOtp = debounce(resendOtp, 300);

  // Toggle between email and phone methods
  const toggleAuthMethod = (method) => {
    if (method === authMethod) return;
    setAuthMethod(method);
    setIsOtpSent(false);
    setPhone("");
    setOtp("");
    setRole("user");
    setRoleDetails({});
    setFormErrors({});
    setOtpCountdown(120);
    clearError?.();
  };

  // Handle phone input change
  const handlePhoneChange = (e) => {
    const value = e.target.value;
    if (value === "" || /^\+?\d*$/.test(value)) {
      setPhone(value);
      if (formErrors.phone) {
        setFormErrors((prev) => ({ ...prev, phone: undefined }));
      }
    }
  };

  // Handle OTP input change
  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 6);
    setOtp(value);
    if (formErrors.otp) {
      setFormErrors((prev) => ({ ...prev, otp: undefined }));
    }
  };

  // Handle roleDetails input change
  const handleRoleDetailsChange = (e) => {
    const { name, value } = e.target;
    setRoleDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.4, staggerChildren: 0.08 },
    },
    exit: { opacity: 0, transition: { duration: 0.3 } },
  };

  const itemVariants = {
    hidden: { y: 15, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 400, damping: 25 },
    },
  };

  const tabVariants = {
    inactive: {
      backgroundColor: "rgb(243 244 246)",
      color: "rgb(75 85 99)",
      boxShadow: "none",
    },
    active: {
      backgroundColor: "rgb(124 58 237)",
      color: "white",
      boxShadow: "0 2px 8px rgba(124, 58, 237, 0.25)",
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="relative w-full h-[70vh] rounded-2xl bg-white border border-gray-200 p-4 sm:p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        <div className="relative z-10 h-full flex flex-col">
          {/* Compact Header */}
          <motion.div
            className="text-center mb-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h2
              variants={itemVariants}
              className="text-xl sm:text-2xl font-bold bg-gradient-to-br from-violet-600 to-purple-600 bg-clip-text text-transparent tracking-tight"
            >
              Create Account
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="text-gray-600 text-sm mt-1"
            >
              Join our community
            </motion.p>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 mt-3 text-xs text-red-700 bg-red-50 rounded-xl border border-red-200 flex items-start"
              >
                <span className="font-medium flex-1">{error}</span>
              </motion.div>
            )}
          </motion.div>

          {/* Compact Tabs */}
          <motion.div variants={itemVariants} className="mb-4">
            <div className="flex p-1 bg-gray-100 rounded-xl w-full">
              <motion.button
                type="button"
                variants={tabVariants}
                initial={authMethod === "email" ? "active" : "inactive"}
                animate={authMethod === "email" ? "active" : "inactive"}
                whileHover={{ scale: authMethod !== "email" ? 1.02 : 1 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 flex-1"
                onClick={() => toggleAuthMethod("email")}
              >
                <Mail className="text-base" /> Email
              </motion.button>
              <motion.button
                type="button"
                variants={tabVariants}
                initial={authMethod === "phone" ? "active" : "inactive"}
                animate={authMethod === "phone" ? "active" : "inactive"}
                whileHover={{ scale: authMethod !== "phone" ? 1.02 : 1 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 flex-1"
                onClick={() => toggleAuthMethod("phone")}
              >
                <Phone className="text-base" /> Phone
              </motion.button>
            </div>
          </motion.div>

          {/* Google OAuth - Compact */}
          <motion.div 
            variants={itemVariants} 
            className="mb-4"
          >
            <GoogleAuthButton 
              isLogin={false} 
              size="compact"
              className="h-10"
            />
          </motion.div>

          {/* Compact Divider */}
          <motion.div 
            variants={itemVariants}
            className="mb-4"
          >
            <SocialDivider text="Or continue with" />
          </motion.div>

          {/* Form Section - Flexible Height */}
          <div className="flex-1 min-h-0">
            <AnimatePresence mode="wait">
              {authMethod === "email" ? (
                <motion.div
                  key="email"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="h-full"
                >
                  <EmailRegistrationForm
                    onSubmit={registerWithEmail}
                    isLoading={authLoading}
                    onToggleMethod={() => toggleAuthMethod("phone")}
                  />
                </motion.div>
              ) : !isOtpSent ? (
                <motion.form
                  key="phoneInput"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="space-y-3 h-full flex flex-col"
                  onSubmit={handleRequestOtp}
                >
                  <div className="flex-1 space-y-3 overflow-y-auto">
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-gray-700 mb-1.5"
                    >
                      Phone Number
                    </label>
                    <div className="relative group">
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        placeholder="+1234567890"
                          className={`w-full px-4 py-2.5 pl-11 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all duration-300 ${
                          formErrors.phone
                            ? "border-red-300 ring-red-100 bg-red-50/30"
                              : "border-gray-200 group-hover:border-violet-300 bg-white"
                        }`}
                        value={phone}
                        onChange={handlePhoneChange}
                        disabled={authLoading}
                        aria-invalid={!!formErrors.phone}
                        aria-describedby={
                          formErrors.phone ? "phone-error" : undefined
                        }
                      />
                      <Phone
                          className={`absolute left-3.5 top-1/2 -translate-y-1/2 text-lg transition-colors duration-300 ${
                          formErrors.phone
                              ? "text-red-500"
                            : "text-gray-400 group-hover:text-violet-500"
                        }`}
                      />
                    </div>
                    {formErrors.phone && (
                      <motion.p
                        id="phone-error"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                          className="mt-1.5 text-xs text-red-600 flex items-center gap-1.5"
                      >
                          <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                        {formErrors.phone}
                      </motion.p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="role"
                      className="block text-sm font-medium text-gray-700 mb-1.5"
                    >
                        I am a...
                    </label>
                    <div className="relative group">
                      <select
                        id="role"
                        name="role"
                          className="w-full px-4 py-2.5 pl-11 border rounded-xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all group-hover:border-violet-300 bg-white"
                        value={role}
                        onChange={(e) => {
                          setRole(e.target.value);
                            setRoleDetails({});
                        }}
                        disabled={authLoading}
                      >
                        {roles.map((r) => (
                          <option key={r.value} value={r.value}>
                            {r.label}
                          </option>
                        ))}
                      </select>
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg group-hover:text-violet-500 transition-colors" />
                    </div>
                  </div>

                    {/* Role-specific fields - Simplified */}
                  {role !== "user" && roleFields[role] && (
                      <div className="space-y-3">
                      {roleFields[role].map((field) => (
                        <div key={field.name}>
                          <label
                            htmlFor={field.name}
                            className="block text-sm font-medium text-gray-700 mb-1.5"
                          >
                            {field.label}{" "}
                            {field.required && (
                              <span className="text-red-500">*</span>
                            )}
                          </label>
                          <div className="relative group">
                            <input
                              type={field.type}
                              id={field.name}
                              name={field.name}
                              placeholder={`Enter ${field.label.toLowerCase()}`}
                                className={`w-full px-4 py-2.5 pl-11 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all duration-300 ${
                                formErrors[field.name]
                                  ? "border-red-300 ring-red-100 bg-red-50/30"
                                    : "border-gray-200 group-hover:border-violet-300 bg-white"
                              }`}
                              value={roleDetails[field.name] || ""}
                              onChange={handleRoleDetailsChange}
                              disabled={authLoading}
                              aria-invalid={!!formErrors[field.name]}
                              aria-describedby={
                                formErrors[field.name]
                                  ? `${field.name}-error`
                                  : undefined
                              }
                            />
                            <field.icon
                                className={`absolute left-3.5 top-1/2 -translate-y-1/2 text-lg transition-colors duration-300 ${
                                formErrors[field.name]
                                    ? "text-red-500"
                                  : "text-gray-400 group-hover:text-violet-500"
                              }`}
                            />
                          </div>
                          {formErrors[field.name] && (
                            <motion.p
                              id={`${field.name}-error`}
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                                className="mt-1.5 text-xs text-red-600 flex items-center gap-1.5"
                            >
                                <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                              {formErrors[field.name]}
                            </motion.p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                    {/* Compact Help Text */}
                    <div className="flex items-center gap-2 p-2.5 bg-violet-50 rounded-lg border border-violet-100">
                      <Zap className="text-violet-600 flex-shrink-0 text-sm" />
                      <span className="text-xs text-violet-700">
                        Include country code (e.g., +1)
                    </span>
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-medium rounded-xl hover:from-violet-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-70 disabled:from-violet-400 disabled:to-purple-400 text-sm"
                    disabled={authLoading}
                    whileHover={{ scale: authLoading ? 1 : 1.02 }}
                    whileTap={{ scale: authLoading ? 1 : 0.98 }}
                  >
                    {authLoading ? (
                      <LoadingSpinner size="sm" color="white" text="Requesting..." inline />
                    ) : (
                      "Request Code"
                    )}
                  </motion.button>
                </motion.form>
              ) : (
                <motion.form
                  key="otpInput"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="space-y-4 h-full flex flex-col"
                  onSubmit={handleVerifyOtp}
                >
                  <motion.button
                    type="button"
                    onClick={() => setIsOtpSent(false)}
                    className="flex items-center text-sm text-violet-600 hover:text-violet-800 transition-colors font-medium self-start"
                    whileHover={{ x: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <ArrowLeft className="mr-1.5" /> Back
                  </motion.button>

                  <div className="flex-1 space-y-4">
                  <div>
                      <div className="flex justify-between items-center mb-3">
                      <label
                        htmlFor="otp"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Verification Code
                      </label>
                        <span className="text-xs text-gray-500">
                        Sent to {phone}
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="numeric"
                        id="otp"
                        name="otp"
                        placeholder="••••••"
                          className={`w-full px-4 py-3 border rounded-xl text-center tracking-widest font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all duration-300 ${
                          formErrors.otp
                            ? "border-red-300 ring-red-100 bg-red-50/30"
                              : "border-gray-200 bg-white"
                        }`}
                        value={otp}
                        onChange={handleOtpChange}
                        disabled={authLoading}
                        maxLength={6}
                        aria-invalid={!!formErrors.otp}
                        aria-describedby={
                          formErrors.otp ? "otp-error" : undefined
                        }
                      />
                      <motion.div
                          className="absolute -bottom-0.5 left-0 h-0.5 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
                        initial={{ width: "100%" }}
                        animate={{
                          width: `${Math.max((otpCountdown / 120) * 100, 0)}%`,
                        }}
                        transition={{ duration: 1, ease: "linear" }}
                      />
                    </div>
                      <div className="flex justify-between items-center mt-2" aria-live="polite">
                      <div className="text-xs text-gray-500">
                          {otpCountdown > 0 ? (
                            <span>Expires in {otpCountdown}s</span>
                          ) : (
                            <span className="text-red-500">Expired</span>
                        )}
                      </div>
                      <motion.button
                        type="button"
                          className={`text-xs text-violet-600 font-medium hover:text-violet-800 transition-all ${
                          otpCountdown > 0 || authLoading
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                        onClick={debouncedResendOtp}
                        disabled={otpCountdown > 0 || authLoading}
                        whileHover={{
                          scale: otpCountdown > 0 || authLoading ? 1 : 1.05,
                        }}
                      >
                          {authLoading && otpCountdown <= 0 ? (
                            <LoadingSpinner size="xs" />
                          ) : otpCountdown > 0 ? (
                            "Resend soon"
                          ) : (
                            "Resend"
                          )}
                      </motion.button>
                    </div>
                    {formErrors.otp && (
                      <motion.p
                        id="otp-error"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                          className="mt-2 text-xs text-red-600 flex items-center gap-1.5"
                      >
                          <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                        {formErrors.otp}
                      </motion.p>
                    )}
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-medium rounded-xl hover:from-violet-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-70 disabled:from-violet-400 disabled:to-purple-400 text-sm"
                    disabled={authLoading}
                    whileHover={{ scale: authLoading ? 1 : 1.02 }}
                    whileTap={{ scale: authLoading ? 1 : 0.98 }}
                  >
                    {authLoading ? (
                      <LoadingSpinner size="sm" color="white" text="Creating..." inline />
                    ) : (
                      "Create Account"
                    )}
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {/* Compact Footer */}
          <motion.div
            className="mt-4 text-center space-y-3"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              variants={itemVariants}
              className="text-sm text-gray-600 flex justify-center items-center gap-1"
            >
              <span>Have an account?</span>
              <Link
                href="/auth/login"
                className="text-violet-600 hover:text-violet-700 font-medium transition-colors hover:underline"
              >
                Sign In
              </Link>
            </motion.div>
            <motion.p
              variants={itemVariants}
              className="text-xs text-gray-400 leading-relaxed"
            >
              By signing up, you agree to our{" "}
              <Link
                href="/terms"
                className="text-gray-500 hover:text-violet-600 transition-colors hover:underline"
              >
                Terms
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="text-gray-500 hover:text-violet-600 transition-colors hover:underline"
              >
                Privacy
              </Link>
            </motion.p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default RegisterLeft;
