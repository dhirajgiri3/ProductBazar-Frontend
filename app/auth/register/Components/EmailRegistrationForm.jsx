"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineUserCircle } from "react-icons/hi";

const EmailRegistrationForm = ({ onSubmit, isLoading, onToggleMethod }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    role: "user",
    roleDetails: {}
  });
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeField, setActiveField] = useState(null);

  const roles = [
    { value: "user", label: "Regular User" },
    { value: "startupOwner", label: "Startup Owner" },
    { value: "investor", label: "Investor" },
    { value: "agency", label: "Agency" },
    { value: "freelancer", label: "Freelancer" },
    { value: "jobseeker", label: "Job Seeker" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.email) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = "Invalid email format";

    if (!formData.password) errors.password = "Password is required";
    else if (formData.password.length < 6) errors.password = "Password must be at least 6 characters";

    if (formData.password !== formData.confirmPassword)
      errors.confirmPassword = "Passwords do not match";

    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length === 0) {
      onSubmit({
        email: formData.email,
        password: formData.password,
        role: formData.role,
        roleDetails: formData.role !== "user" ? formData.roleDetails : undefined
      });
    } else {
      setFormErrors(errors);
    }
  };

  const inputVariants = {
    focused: {
      scale: 1.01,
      boxShadow: "0 0 0 2px rgba(124, 58, 237, 0.25)",
      borderColor: "rgba(124, 58, 237, 0.8)"
    },
    error: {
      scale: 1.01,
      boxShadow: "0 0 0 2px rgba(239, 68, 68, 0.15)",
      borderColor: "rgba(239, 68, 68, 0.8)"
    },
    normal: {
      scale: 1,
      boxShadow: "none",
      borderColor: "rgba(229, 231, 235, 1)"
    }
  };

  const passwordStrength = (password) => {
    if (!password) return { width: "0%", color: "bg-gray-200" };
    
    const hasChar = password.length >= 6;
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*]/.test(password);
    
    if (hasChar && hasNumber && hasSpecial) return { width: "100%", color: "bg-green-500" };
    if (hasChar && (hasNumber || hasSpecial)) return { width: "75%", color: "bg-yellow-400" };
    if (hasChar) return { width: "50%", color: "bg-orange-400" };
    return { width: "25%", color: "bg-red-400" };
  };

  const strength = passwordStrength(formData.password);

  const formControlVariants = {
    initial: { y: 8, opacity: 0 },
    animate: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 400, damping: 25 } },
  };

  const ErrorMessage = ({ error }) => {
    if (!error) return null;
    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        className="mt-1.5 flex items-start gap-1.5 text-xs text-red-500"
      >
        <span className="w-1 h-1 bg-red-500 rounded-full mt-1.5 flex-shrink-0"></span>
        <span>{error}</span>
      </motion.div>
    );
  };

  return (
    <motion.form
      className="space-y-3 h-full flex flex-col"
      onSubmit={handleSubmit}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="flex-1 space-y-3 overflow-y-auto">
        <motion.div
          variants={formControlVariants}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.1 }}
        >
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
            Email Address
          </label>
          <div className="relative group">
            <motion.input
              type="email"
              id="email"
              name="email"
              placeholder="your@email.com"
              className={`w-full px-4 py-2.5 pl-11 border rounded-xl text-sm text-gray-800 transition-all duration-300 ${
                formErrors.email ? "border-red-300 ring-red-100 bg-red-50/30" : "border-gray-200 group-hover:border-violet-300 bg-white"
              }`}
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
              variants={inputVariants}
              animate={formErrors.email ? "error" : activeField === "email" ? "focused" : "normal"}
              onFocus={() => setActiveField("email")}
              onBlur={() => setActiveField(null)}
            />
            <HiOutlineMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg group-hover:text-violet-500 transition-colors duration-300" />
          </div>
          <ErrorMessage error={formErrors.email} />
        </motion.div>

        <motion.div
          variants={formControlVariants}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.2 }}
        >
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1.5">
            I am a...
          </label>
          <div className="relative group">
            <motion.select
              id="role"
              name="role"
              className="w-full px-4 py-2.5 pl-11 border border-gray-200 rounded-xl text-sm text-gray-800 bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all group-hover:border-violet-300"
              value={formData.role}
              onChange={handleChange}
              disabled={isLoading}
              variants={inputVariants}
              animate={activeField === "role" ? "focused" : "normal"}
              onFocus={() => setActiveField("role")}
              onBlur={() => setActiveField(null)}
            >
              {roles.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </motion.select>
            <HiOutlineUserCircle className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg group-hover:text-violet-500 transition-colors duration-300" />
          </div>
        </motion.div>

        <motion.div
          variants={formControlVariants}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.3 }}
        >
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
            Password
          </label>
          <div className="relative group">
            <motion.input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              placeholder="••••••••"
              className={`w-full px-4 py-2.5 pl-11 pr-10 border rounded-xl text-sm text-gray-800 transition-all duration-300 ${
                formErrors.password ? "border-red-300 ring-red-100 bg-red-50/30" : "border-gray-200 group-hover:border-violet-300 bg-white"
              }`}
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
              variants={inputVariants}
              animate={formErrors.password ? "error" : activeField === "password" ? "focused" : "normal"}
              onFocus={() => setActiveField("password")}
              onBlur={() => setActiveField(null)}
            />
            <HiOutlineLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg group-hover:text-violet-500 transition-colors duration-300" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-violet-600 transition-colors"
            >
              {showPassword ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
            </button>
          </div>
          {formData.password && (
            <div className="mt-1.5 w-full bg-gray-100 rounded-full h-1 overflow-hidden">
              <motion.div
                className={`h-full ${strength.color}`}
                initial={{ width: "0%" }}
                animate={{ width: strength.width }}
                transition={{ duration: 0.5 }}
              />
            </div>
          )}
          <ErrorMessage error={formErrors.password} />
          {formData.password && !formErrors.password && (
            <div className="mt-1.5 text-xs text-gray-500">
              Strong password: 6+ chars, number, special character
            </div>
          )}
        </motion.div>

        <motion.div
          variants={formControlVariants}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.4 }}
        >
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
            Confirm Password
          </label>
          <div className="relative group">
            <motion.input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              name="confirmPassword"
              placeholder="••••••••"
              className={`w-full px-4 py-2.5 pl-11 pr-10 border rounded-xl text-sm text-gray-800 transition-all duration-300 ${
                formErrors.confirmPassword ? "border-red-300 ring-red-100 bg-red-50/30" : "border-gray-200 group-hover:border-violet-300 bg-white"
              }`}
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={isLoading}
              variants={inputVariants}
              animate={formErrors.confirmPassword ? "error" : activeField === "confirmPassword" ? "focused" : "normal"}
              onFocus={() => setActiveField("confirmPassword")}
              onBlur={() => setActiveField(null)}
            />
            <HiOutlineLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg group-hover:text-violet-500 transition-colors duration-300" />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-violet-600 transition-colors"
            >
              {showConfirmPassword ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
            </button>
          </div>
          <ErrorMessage error={formErrors.confirmPassword} />
        </motion.div>
      </div>

      <motion.button
        type="submit"
        className="w-full py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-medium rounded-xl hover:from-violet-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-70 disabled:from-violet-400 disabled:to-purple-400 text-sm"
        disabled={isLoading}
        whileHover={{ scale: isLoading ? 1 : 1.02 }}
        whileTap={{ scale: isLoading ? 1 : 0.98 }}
        variants={formControlVariants}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.5 }}
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <svg
              className="animate-spin h-4 w-4 mr-2 text-white"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Creating...
          </span>
        ) : (
          "Create Account"
        )}
      </motion.button>
    </motion.form>
  );
};

export default EmailRegistrationForm;