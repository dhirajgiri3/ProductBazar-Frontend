"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../../../Contexts/Auth/AuthContext";
import { FiBriefcase, FiDollarSign, FiUsers, FiTrendingUp, FiMapPin } from "react-icons/fi";

const RoleSpecificSection = ({ formData, setFormData, setHasUnsavedChanges }) => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState("main");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setHasUnsavedChanges(true);
  };

  const handleArrayChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value.split(",").map(item => item.trim()) }));
    setHasUnsavedChanges(true);
  };

  const renderStartupFields = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Company Name</label>
        <div className="relative flex items-center">
          <FiBriefcase className="absolute left-3 text-gray-400 w-5 h-5" />
          <input
            type="text"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            placeholder="Your company name"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Company Website</label>
        <div className="relative flex items-center">
          <FiTrendingUp className="absolute left-3 text-gray-400 w-5 h-5" />
          <input
            type="url"
            name="companyWebsite"
            value={formData.companyWebsite}
            onChange={handleChange}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            placeholder="https://example.com"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Funding Stage</label>
        <select
          name="fundingStage"
          value={formData.fundingStage}
          onChange={handleChange}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
        >
          {["Pre-seed", "Seed", "Series A", "Series B", "Series C+", "Bootstrapped", "Other"].map((stage) => (
            <option key={stage} value={stage}>{stage}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Company Size</label>
        <select
          name="companySize"
          value={formData.companySize}
          onChange={handleChange}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
        >
          {["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"].map((size) => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>
      </div>

      <div className="md:col-span-2 space-y-2">
        <label className="text-sm font-medium text-gray-700">Company Description</label>
        <textarea
          name="companyDescription"
          value={formData.companyDescription}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          rows="4"
          placeholder="Brief description of your company..."
        />
      </div>
    </div>
  );

  const renderFreelancerFields = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Skills (comma-separated)</label>
        <input
          type="text"
          value={formData.skills?.join(", ")}
          onChange={(e) => handleArrayChange("skills", e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          placeholder="e.g., Web Design, UI/UX, React"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Role Title</label>
        <div className="relative flex items-center">
          <FiBriefcase className="absolute left-3 text-gray-400 w-5 h-5" />
          <input
            type="text"
            name="companyRole"
            value={formData.companyRole}
            onChange={handleChange}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            placeholder="e.g., Frontend Developer"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Open to Work</label>
        <select
          name="openToWork"
          value={formData.openToWork}
          onChange={handleChange}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
        >
          <option value={true}>Yes</option>
          <option value={false}>No</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Experience</label>
        <select
          name="experience"
          value={formData.experience}
          onChange={handleChange}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
        >
          {["Entry Level", "Junior", "Mid-Level", "Senior", "Expert"].map((level) => (
            <option key={level} value={level}>{level}</option>
          ))}
        </select>
      </div>

      <div className="md:col-span-2 space-y-2">
        <label className="text-sm font-medium text-gray-700">About Your Services</label>
        <textarea
          name="about"
          value={formData.about}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          rows="4"
          placeholder="Describe your services and expertise..."
        />
      </div>
    </div>
  );

  const renderInvestorFields = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Investor Type</label>
        <select
          name="investorType"
          value={formData.investorType}
          onChange={handleChange}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
        >
          {["Angel Investor", "Venture Capital", "Private Equity", "Corporate Investor", "Individual"].map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Investment Focus</label>
        <div className="relative flex items-center">
          <FiDollarSign className="absolute left-3 text-gray-400 w-5 h-5" />
          <input
            type="text"
            name="industry"
            value={formData.industry}
            onChange={handleChange}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            placeholder="e.g., SaaS, FinTech"
          />
        </div>
      </div>

      <div className="md:col-span-2 space-y-2">
        <label className="text-sm font-medium text-gray-700">About Your Investment Strategy</label>
        <textarea
          name="about"
          value={formData.about}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          rows="4"
          placeholder="Describe your investment strategy and interests..."
        />
      </div>
    </div>
  );

  const renderFields = () => {
    switch (user?.role) {
      case "startupOwner":
        return renderStartupFields();
      case "freelancer":
      case "jobseeker":
        return renderFreelancerFields();
      case "investor":
        return renderInvestorFields();
      default:
        return (
          <div className="text-center text-gray-500 py-8">
            <FiBriefcase className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium">No additional fields required</p>
            <p className="text-sm mt-2">You can update your basic information in the other sections.</p>
          </div>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
    >
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-violet-50 rounded-xl">
            <FiBriefcase className="w-5 h-5 text-violet-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            {user?.role ? `${user.role.charAt(0).toUpperCase() + user.role.slice(1)} Details` : "Role Details"}
          </h3>
        </div>

        {(user?.role === "freelancer" || user?.role === "jobseeker" || user?.role === "investor" || user?.role === "startupOwner") && (
          <div className="text-sm p-4 bg-amber-50 border border-amber-100 rounded-lg text-amber-700 mb-4">
            <p>
              <strong>Note:</strong> Changing your email or phone number will require re-verification of that contact method.
            </p>
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderFields()}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default RoleSpecificSection;