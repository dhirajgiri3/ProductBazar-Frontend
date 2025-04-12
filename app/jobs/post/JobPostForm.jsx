"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  Calendar,
  Users,
  CheckCircle,
  Upload,
  X,
  Image as ImageIcon
} from "lucide-react";
import { useDropzone } from "react-dropzone";
import { useAuth } from "../../../Contexts/Auth/AuthContext";
import api from "../../../Utils/api";
import logger from "../../../Utils/logger";
import RichTextEditor from "../../product/new/AddddProductForm/Components/RichTextEditor";
import SkillsInput from "./components/SkillsInput";

const JobPostForm = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [companyLogo, setCompanyLogo] = useState(null);
  const [formComplete, setFormComplete] = useState(false);
  const [createdJobSlug, setCreatedJobSlug] = useState(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: "",
      company: {
        name: user?.companyName || "",
        size: user?.companySize || "",
        industry: user?.industry || "",
        website: user?.companyWebsite || "",
      },
      location: "",
      locationType: "Remote",
      jobType: "Full-time",
      description: "",
      requirements: "",
      responsibilities: "",
      skills: "",
      experienceLevel: "Mid-Level",
      salary: {
        min: "",
        max: "",
        currency: "USD",
        period: "Yearly",
        isVisible: true,
      },
      applicationUrl: "",
      applicationEmail: user?.email || "",
      applicationInstructions: "",
      benefits: "",
      deadline: "",
      status: "Published",
    },
  });

  const { getRootProps, getInputProps } = useDropzone({
    accept: "image/*",
    multiple: false,
    onDrop: (files) => {
      if (files[0]) {
        setCompanyLogo(files[0]);
      }
    },
  });

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);

      // Format arrays from comma-separated strings
      const formattedData = {
        ...data,
        requirements: data.requirements.split("\\n").filter(item => item.trim()),
        responsibilities: data.responsibilities.split("\\n").filter(item => item.trim()),
        skills: data.skills.split(",").map(skill => skill.trim()).filter(Boolean),
        benefits: data.benefits.split("\\n").filter(item => item.trim()),
      };

      // Create FormData for file upload
      const formData = new FormData();

      // Add JSON data
      formData.append("data", JSON.stringify(formattedData));

      // Add company logo if exists
      if (companyLogo) {
        formData.append("logo", companyLogo);
      }

      const response = await api.post("/jobs", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.status === "success") {
        setCreatedJobSlug(response.data.data.job.slug);
        setFormComplete(true);
        toast.success("Job posted successfully!");
      } else {
        toast.error(response.data.message || "Failed to post job");
      }
    } catch (error) {
      logger.error("Error posting job:", error);
      toast.error(error.response?.data?.message || "Failed to post job");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (formComplete) {
    return (
      <motion.div
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-md mx-auto text-center"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6"
        >
          <CheckCircle size={40} className="text-green-600" />
        </motion.div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Job Posted!</h1>
        <p className="text-gray-600 mb-8">
          Your job has been posted successfully and is now live.
        </p>
        <div className="flex flex-col space-y-4">
          <button
            onClick={() => router.push(`/jobs/${createdJobSlug}`)}
            className="bg-violet-600 text-white px-6 py-3 rounded-lg hover:bg-violet-700 transition-colors"
          >
            View Job Posting
          </button>
          <button
            onClick={() => router.push("/jobs")}
            className="text-violet-600 px-6 py-3 rounded-lg hover:bg-violet-50 transition-colors"
          >
            Browse All Jobs
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Job Basics Section */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <Briefcase className="mr-2 text-violet-600" size={20} />
            Job Basics
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Title*
              </label>
              <input
                {...register("title", { required: "Job title is required" })}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500 ${
                  errors.title ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="e.g. Senior Frontend Developer"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Experience Level
              </label>
              <select
                {...register("experienceLevel")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
              >
                <option value="Entry Level">Entry Level</option>
                <option value="Junior">Junior</option>
                <option value="Mid-Level">Mid-Level</option>
                <option value="Senior">Senior</option>
                <option value="Executive">Executive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Type
              </label>
              <select
                {...register("jobType")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Freelance">Freelance</option>
                <option value="Internship">Internship</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location Type
              </label>
              <select
                {...register("locationType")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
              >
                <option value="Remote">Remote</option>
                <option value="On-site">On-site</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Flexible">Flexible</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 text-gray-400" size={16} />
                <input
                  {...register("location")}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
                  placeholder="e.g. San Francisco, CA (or Remote)"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Application Deadline
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 text-gray-400" size={16} />
                <input
                  type="date"
                  {...register("deadline")}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Company Information */}
        <div className="space-y-6 pt-4 border-t border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center pt-2">
            <Users className="mr-2 text-violet-600" size={20} />
            Company Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Name*
              </label>
              <input
                {...register("company.name", { required: "Company name is required" })}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500 ${
                  errors.company?.name ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="e.g. Acme Inc."
              />
              {errors.company?.name && (
                <p className="mt-1 text-sm text-red-600">{errors.company.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Industry
              </label>
              <input
                {...register("company.industry")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
                placeholder="e.g. Technology, Healthcare, Finance"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Size
              </label>
              <select
                {...register("company.size")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
              >
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="201-500">201-500 employees</option>
                <option value="501-1000">501-1000 employees</option>
                <option value="1000+">1000+ employees</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Website
              </label>
              <input
                {...register("company.website")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
                placeholder="e.g. https://example.com"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Logo
              </label>
              <div
                {...getRootProps()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-violet-500"
              >
                <input {...getInputProps()} />
                {companyLogo ? (
                  <div className="flex items-center justify-center">
                    <img
                      src={URL.createObjectURL(companyLogo)}
                      alt="Company logo preview"
                      className="h-16 object-contain"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCompanyLogo(null);
                      }}
                      className="ml-2 p-1 bg-red-100 rounded-full text-red-500 hover:bg-red-200"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div>
                    <ImageIcon size={24} className="mx-auto mb-2 text-gray-400" />
                    <p className="text-gray-600">
                      Drop logo here or click to upload
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Job Details */}
        <div className="space-y-6 pt-4 border-t border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center pt-2">
            <Briefcase className="mr-2 text-violet-600" size={20} />
            Job Details
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Description*
              </label>
              <Controller
                name="description"
                control={control}
                rules={{ required: "Job description is required" }}
                render={({ field }) => (
                  <RichTextEditor
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Describe the job role, responsibilities, and your company..."
                  />
                )}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Requirements (one per line)
              </label>
              <textarea
                {...register("requirements")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
                rows={4}
                placeholder="e.g.&#10;Bachelor's degree in Computer Science or related field&#10;5+ years of experience in frontend development&#10;Proficiency in React.js and TypeScript"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Responsibilities (one per line)
              </label>
              <textarea
                {...register("responsibilities")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
                rows={4}
                placeholder="e.g.&#10;Design and implement user interfaces&#10;Collaborate with backend developers&#10;Optimize applications for maximum performance"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Skills
              </label>
              <Controller
                name="skills"
                control={control}
                render={({ field }) => (
                  <SkillsInput
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="e.g. React, JavaScript, TypeScript, CSS, HTML"
                  />
                )}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Benefits (one per line)
              </label>
              <textarea
                {...register("benefits")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
                rows={4}
                placeholder="e.g.&#10;Competitive salary&#10;Health insurance&#10;Flexible working hours&#10;Remote work options"
              />
            </div>
          </div>
        </div>

        {/* Salary Information */}
        <div className="space-y-6 pt-4 border-t border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center pt-2">
            <DollarSign className="mr-2 text-violet-600" size={20} />
            Salary Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Salary
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 text-gray-400" size={16} />
                <input
                  type="number"
                  {...register("salary.min")}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
                  placeholder="e.g. 50000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Salary
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 text-gray-400" size={16} />
                <input
                  type="number"
                  {...register("salary.max")}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
                  placeholder="e.g. 80000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Currency
              </label>
              <select
                {...register("salary.currency")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
              >
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="CAD">CAD - Canadian Dollar</option>
                <option value="AUD">AUD - Australian Dollar</option>
                <option value="INR">INR - Indian Rupee</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Period
              </label>
              <select
                {...register("salary.period")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
              >
                <option value="Hourly">Hourly</option>
                <option value="Monthly">Monthly</option>
                <option value="Yearly">Yearly</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  {...register("salary.isVisible")}
                  className="h-4 w-4 text-violet-600 focus:ring-violet-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Display salary information publicly
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Application Information */}
        <div className="space-y-6 pt-4 border-t border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center pt-2">
            <Clock className="mr-2 text-violet-600" size={20} />
            Application Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Application Email
              </label>
              <input
                type="email"
                {...register("applicationEmail")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
                placeholder="e.g. careers@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Application URL
              </label>
              <input
                {...register("applicationUrl")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
                placeholder="e.g. https://example.com/careers"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Application Instructions
              </label>
              <textarea
                {...register("applicationInstructions")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
                rows={3}
                placeholder="Any specific instructions for applicants..."
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-6 border-t border-gray-100">
          <motion.button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-violet-600 text-white py-3 rounded-lg hover:bg-violet-700 disabled:bg-gray-400 transition-colors flex items-center justify-center gap-2 shadow-md"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Upload size={20} />
            {isSubmitting ? "Posting Job..." : "Post Job"}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
};

export default JobPostForm;
