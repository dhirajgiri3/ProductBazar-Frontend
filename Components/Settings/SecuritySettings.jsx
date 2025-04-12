"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FiSave,
  FiCheck,
  FiKey,
  FiShield,
  FiAlertTriangle,
  FiLock,
} from "react-icons/fi";
import api from "../../Utils/api";
import { toast } from "react-hot-toast";

const SecuritySettings = ({ user }) => {
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(
    user?.securitySettings?.twoFactorEnabled || false
  );
  const [loginAlerts, setLoginAlerts] = useState(
    user?.securitySettings?.loginAlerts || false
  );

  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  const [isSubmittingSecurity, setIsSubmittingSecurity] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [securitySuccess, setSecuritySuccess] = useState("");
  const [passwordErrors, setPasswordErrors] = useState({});

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validatePasswordForm = () => {
    const errors = {};

    if (!passwordData.currentPassword) {
      errors.currentPassword = "Current password is required";
    }

    if (!passwordData.newPassword) {
      errors.newPassword = "New password is required";
    } else if (passwordData.newPassword.length < 8) {
      errors.newPassword = "Password must be at least 8 characters long";
    } else if (
      !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/.test(
        passwordData.newPassword
      )
    ) {
      errors.newPassword =
        "Password must include uppercase, lowercase, number, and special character";
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!validatePasswordForm()) return;

    setIsSubmittingPassword(true);
    setPasswordSuccess("");

    try {
      await api.put("/auth/change-password", passwordData);

      setPasswordSuccess("Password changed successfully");
      toast.success("Password changed successfully");

      // Reset form
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      // Clear success message after 3 seconds
      setTimeout(() => {
        setPasswordSuccess("");
      }, 3000);
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error(error.response?.data?.message || "Failed to change password");

      if (error.response?.data?.field) {
        setPasswordErrors({
          [error.response.data.field]: error.response.data.message,
        });
      }
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  const handleSecuritySubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingSecurity(true);
    setSecuritySuccess("");

    try {
      await api.put("/auth/security-settings", {
        securitySettings: {
          twoFactorEnabled,
          loginAlerts,
        },
      });

      setSecuritySuccess("Security settings updated successfully");
      toast.success("Security settings updated");

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSecuritySuccess("");
      }, 3000);
    } catch (error) {
      console.error("Error updating security settings:", error);
      toast.error(
        error.response?.data?.message || "Failed to update security settings"
      );
    } finally {
      setIsSubmittingSecurity(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        Security Settings
      </h2>

      {/* Password Change Section */}
      <div className="mb-10">
        <div className="flex items-center mb-4">
          <FiKey className="text-violet-600 mr-2" />
          <h3 className="text-md font-medium text-gray-700">Change Password</h3>
        </div>

        {passwordSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg flex items-center"
          >
            <FiCheck className="mr-2" />
            {passwordSuccess}
          </motion.div>
        )}

        <form
          onSubmit={handlePasswordSubmit}
          className="bg-gray-50 rounded-lg p-6"
        >
          <div className="space-y-4">
            <div>
              <label
                htmlFor="currentPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Current Password
              </label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                className={`w-full px-3 py-2 border ${
                  passwordErrors.currentPassword
                    ? "border-red-300"
                    : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500`}
              />
              {passwordErrors.currentPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {passwordErrors.currentPassword}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                className={`w-full px-3 py-2 border ${
                  passwordErrors.newPassword
                    ? "border-red-300"
                    : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500`}
              />
              {passwordErrors.newPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {passwordErrors.newPassword}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                className={`w-full px-3 py-2 border ${
                  passwordErrors.confirmPassword
                    ? "border-red-300"
                    : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500`}
              />
              {passwordErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {passwordErrors.confirmPassword}
                </p>
              )}
            </div>
          </div>

          <div className="mt-6">
            <motion.button
              type="submit"
              disabled={isSubmittingPassword}
              className="px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700 transition-colors flex items-center"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSubmittingPassword ? (
                <span>Changing...</span>
              ) : (
                <>
                  <FiKey className="mr-2" />
                  Change Password
                </>
              )}
            </motion.button>
          </div>
        </form>
      </div>

      {/* Additional Security Settings */}
      <div>
        <div className="flex items-center mb-4">
          <FiShield className="text-violet-600 mr-2" />
          <h3 className="text-md font-medium text-gray-700">
            Security Options
          </h3>
        </div>

        {securitySuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg flex items-center"
          >
            <FiCheck className="mr-2" />
            {securitySuccess}
          </motion.div>
        )}

        <form
          onSubmit={handleSecuritySubmit}
          className="bg-gray-50 rounded-lg p-6"
        >
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center">
                    <h4 className="text-sm font-medium text-gray-700">
                      Two-Factor Authentication
                    </h4>
                    <span className="ml-2 px-2 py-0.5 bg-violet-100 text-violet-800 text-xs font-medium rounded-full">
                      Coming Soon
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={twoFactorEnabled}
                    onChange={() => setTwoFactorEnabled(!twoFactorEnabled)}
                    disabled={true}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-violet-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600 opacity-70"></div>
                </label>
              </div>

              {twoFactorEnabled && (
                <div className="mt-4 p-3 bg-amber-50 rounded-md flex items-start">
                  <FiAlertTriangle className="text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
                  <p className="text-xs text-amber-700">
                    Note: Two-factor authentication setup requires additional
                    steps. After saving, you'll be guided through the setup
                    process.
                  </p>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center">
                    <h4 className="text-sm font-medium text-gray-700">
                      Login Alerts
                    </h4>
                    <span className="ml-2 px-2 py-0.5 bg-violet-100 text-violet-800 text-xs font-medium rounded-full">
                      Coming Soon
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Receive email notifications for new login attempts
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={loginAlerts}
                    onChange={() => setLoginAlerts(!loginAlerts)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-violet-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Active Sessions
              </h4>

              <div className="bg-white p-3 rounded-md border border-gray-200 mb-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Current Session
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date().toLocaleString()} • {navigator.platform}
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                    Active
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="text-sm text-red-600 hover:text-red-700 flex items-center"
              >
                <FiLock className="mr-1" />
                Sign out of all other sessions
              </button>
            </div>
          </div>

          <div className="mt-6">
            <motion.button
              type="submit"
              disabled={isSubmittingSecurity}
              className="px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700 transition-colors flex items-center"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSubmittingSecurity ? (
                <span>Saving...</span>
              ) : (
                <>
                  <FiSave className="mr-2" />
                  Save Security Settings
                </>
              )}
            </motion.button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SecuritySettings;
