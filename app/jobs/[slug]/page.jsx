"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  Calendar,
  Users,
  Building,
  ExternalLink,
  Mail,
  Share2,
  ChevronLeft,
  CheckCircle,
  XCircle,
  Upload,
  FileText,
  Paperclip
} from "lucide-react";
import { useAuth } from "../../../Contexts/Auth/AuthContext";
import { makePriorityRequest } from "../../../Utils/api";
import logger from "../../../Utils/logger";
import LoaderComponent from "../../../Components/UI/LoaderComponent";
import { toast } from "react-hot-toast";

export default function JobDetailPage() {
  const { slug } = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applying, setApplying] = useState(false);
  const [resume, setResume] = useState(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        setError(null); // Clear any previous errors

        // Use makePriorityRequest to avoid request cancellation
        const response = await makePriorityRequest('get', `/jobs/${slug}`);

        if (response.data.status === "success") {
          setJob(response.data.data.job);
        } else {
          setError("Failed to fetch job details");
        }
      } catch (error) {
        // Don't set error for canceled requests
        if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
          logger.warn(`Request for job ${slug} was canceled, retrying...`);
          // Retry the request after a short delay
          setTimeout(() => {
            fetchJob();
          }, 500);
          return;
        }

        logger.error(`Error fetching job ${slug}:`, error);
        setError("Failed to fetch job details");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchJob();
    }
  }, [slug]);

  const formatSalary = (salary) => {
    if (!salary || (!salary.min && !salary.max)) return "Not specified";

    const formatNumber = (num) =>
      new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: salary.currency || 'USD',
        maximumFractionDigits: 0
      }).format(num);

    if (salary.min && salary.max) {
      return `${formatNumber(salary.min)} - ${formatNumber(salary.max)} ${salary.period || 'Yearly'}`;
    } else if (salary.min) {
      return `From ${formatNumber(salary.min)} ${salary.period || 'Yearly'}`;
    } else if (salary.max) {
      return `Up to ${formatNumber(salary.max)} ${salary.period || 'Yearly'}`;
    }

    return "Not specified";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";

    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const handleApply = async (e) => {
    e.preventDefault();

    if (!isAuthenticated()) {
      toast.error("Please log in to apply for this job");
      router.push(`/auth/login?redirect=/jobs/${slug}`);
      return;
    }

    if (!user.roleCapabilities?.canApplyToJobs) {
      toast.error("Your account type doesn't have permission to apply for jobs");
      return;
    }

    if (!resume) {
      toast.error("Please upload your resume");
      return;
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(resume.type)) {
      toast.error("Please upload a valid resume file (PDF, DOC, or DOCX)");
      logger.warn(`Invalid resume file type: ${resume.type}`);
      return;
    }

    logger.info(`Resume file type: ${resume.type}, size: ${resume.size} bytes`);

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (resume.size > maxSize) {
      toast.error("Resume file size must be less than 5MB");
      logger.warn(`Resume file size exceeds maximum allowed (${maxSize/1024/1024}MB)`);
      return;
    }

    try {
      setApplying(true);
      toast.loading("Submitting your application...");

      const formData = new FormData();

      // Add resume file - this is the most important part
      formData.append("resume", resume);

      // Log resume details for debugging
      logger.info(`Appending resume to FormData: ${resume.name} (${resume.type}, ${resume.size} bytes)`);

      // Add data field with JSON string for additional fields (optional)
      const jsonData = {
        coverLetter: coverLetter.trim(),
        resumeInfo: {
          name: resume.name,
          type: resume.type,
          size: resume.size
        }
        // You can add more fields here if needed
      };

      // Add the JSON data
      formData.append("data", JSON.stringify(jsonData));
      logger.info('FormData prepared successfully');

      // Use makePriorityRequest to avoid request cancellation
      logger.info(`Sending job application to: /jobs/${job._id}/apply`);
      const response = await makePriorityRequest('post', `/jobs/${job._id}/apply`, {
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
          "Accept": "application/json"
        },
        isFormData: true,
        timeout: 30000 // Increase timeout for file uploads
      });

      logger.info('Job application API response received');

      if (response.data.status === "success") {
        toast.dismiss();
        toast.success("Application submitted successfully!");
        setApplicationSubmitted(true);
        setShowApplyForm(false);
        setCoverLetter("");
        setResume(null);
      } else {
        toast.dismiss();
        toast.error(response.data.message || "Failed to submit application");
      }
    } catch (error) {
      toast.dismiss();
      logger.error("Error applying for job:", error);

      // Handle different error types
      if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
        logger.warn(`Application request for job ${job._id} was canceled, retrying...`);
        // Retry the request after a short delay
        setTimeout(() => {
          handleApply(e);
        }, 500);
        return;
      }

      const errorMessage = error.response?.data?.message || "Failed to submit application";
      toast.error(errorMessage);
    } finally {
      setApplying(false);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: job.title,
          text: `Check out this job: ${job.title} at ${job.company?.name}`,
          url: window.location.href,
        });
        logger.info(`Shared job ${job._id} using Web Share API`);
      } else {
        // Fallback to copying to clipboard
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!");
        logger.info(`Copied job ${job._id} link to clipboard`);
      }
    } catch (error) {
      // Ignore user cancellation errors
      if (error.name === 'AbortError') {
        logger.info('User canceled sharing');
        return;
      }

      logger.error("Error sharing job:", error);
      // Don't show error toast for sharing issues as they're often user-initiated cancellations
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoaderComponent size="large" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Job Not Found</h2>
          <p className="text-gray-600 mb-6">
            The job you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => router.push("/jobs")}
            className="bg-violet-600 text-white px-6 py-3 rounded-lg hover:bg-violet-700 transition-colors"
          >
            Browse All Jobs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <motion.button
          onClick={() => router.push("/jobs")}
          className="mb-6 flex items-center text-gray-600 hover:text-violet-700 transition-colors"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <ChevronLeft size={20} className="mr-1" />
          Back to Jobs
        </motion.button>

        {/* Job Header */}
        <motion.div
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col md:flex-row gap-6">
            {/* Company Logo */}
            <div className="flex-shrink-0">
              <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                {job.company?.logo ? (
                  <img
                    src={job.company.logo}
                    alt={`${job.company.name} logo`}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Building size={32} className="text-gray-400" />
                )}
              </div>
            </div>

            {/* Job Title and Company */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
              <div className="flex flex-col md:flex-row md:items-center text-gray-600 gap-y-2 md:gap-x-6 mb-4">
                <div className="flex items-center">
                  <Building size={18} className="mr-1 text-gray-400" />
                  {job.company?.name || "Company"}
                </div>
                <div className="flex items-center">
                  <MapPin size={18} className="mr-1 text-gray-400" />
                  {job.location || job.locationType || "Location not specified"}
                </div>
                <div className="flex items-center">
                  <Clock size={18} className="mr-1 text-gray-400" />
                  Posted {formatDate(job.createdAt)}
                </div>
              </div>

              {/* Apply and Share Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                {applicationSubmitted ? (
                  <button
                    className="bg-green-100 text-green-800 border border-green-200 px-6 py-3 rounded-lg flex items-center justify-center gap-2 cursor-default"
                    disabled
                  >
                    <CheckCircle size={18} />
                    Application Submitted
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (showApplyForm) {
                        setShowApplyForm(false);
                      } else {
                        setShowApplyForm(true);
                        // Scroll to the form
                        setTimeout(() => {
                          document.getElementById('application-form')?.scrollIntoView({
                            behavior: 'smooth',
                            block: 'center'
                          });
                        }, 100);
                      }
                    }}
                    className={`px-6 py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${showApplyForm
                      ? 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                      : 'bg-violet-600 text-white hover:bg-violet-700 shadow-md hover:shadow-lg'}`}
                  >
                    {showApplyForm ? (
                      <>
                        <XCircle size={18} />
                        Cancel Application
                      </>
                    ) : (
                      <>
                        <Briefcase size={18} />
                        Apply Now
                      </>
                    )}
                  </button>
                )}
                <button
                  onClick={handleShare}
                  className="bg-white text-gray-700 border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Share2 size={18} />
                  Share
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Success Message */}
        {applicationSubmitted && (
          <motion.div
            className="bg-green-50 border border-green-100 rounded-xl p-8 mb-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Application Submitted!</h2>
            <p className="text-gray-600 mb-6">
              Your application for <span className="font-semibold">{job.title}</span> at <span className="font-semibold">{job.company?.name}</span> has been successfully submitted.
            </p>
            <p className="text-gray-500 text-sm mb-6">
              The employer will review your application and contact you if they're interested. You can check the status of your applications in your profile.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push('/jobs')}
                className="px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Browse More Jobs
              </button>
              <button
                onClick={() => router.push('/profile/applications')}
                className="px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
              >
                View My Applications
              </button>
            </div>
          </motion.div>
        )}

        {/* Application Form */}
        {showApplyForm && (
          <motion.div
            id="application-form"
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-8"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Apply for this position</h2>
            <form onSubmit={handleApply} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Resume/CV*
                </label>
                <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${resume ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-violet-300 hover:bg-violet-50'}`}>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setResume(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                    id="resume-upload"
                  />
                  <label
                    htmlFor="resume-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    {resume ? (
                      <>
                        <CheckCircle size={24} className="mb-2 text-green-500" />
                        <div className="flex items-center">
                          <span className="text-green-700 font-medium mr-2">{resume.name}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setResume(null);
                            }}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            (Remove)
                          </button>
                        </div>
                        <span className="text-xs text-gray-500 mt-1">
                          {(resume.size / (1024 * 1024)).toFixed(2)} MB
                        </span>
                      </>
                    ) : (
                      <>
                        <Upload size={24} className="mb-2 text-violet-500" />
                        <span className="text-gray-700">
                          Click to upload your resume (PDF, DOC, DOCX)
                        </span>
                        <span className="text-xs text-gray-500 mt-1">
                          Max file size: 5MB
                        </span>
                      </>
                    )}
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cover Letter (Optional)
                </label>
                <div className="relative">
                  <textarea
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all"
                    rows={6}
                    placeholder="Tell us why you're a good fit for this position..."
                  />
                  <div className="absolute bottom-2 right-2 text-xs text-gray-500">
                    {coverLetter.length} characters
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  A good cover letter can significantly increase your chances of getting an interview.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-4 mt-8">
                <button
                  type="button"
                  onClick={() => setShowApplyForm(false)}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors order-2 sm:order-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={applying || !resume}
                  className="bg-violet-600 text-white px-6 py-3 rounded-lg hover:bg-violet-700 disabled:bg-gray-400 transition-colors flex items-center justify-center gap-2 order-1 sm:order-2"
                >
                  {applying ? (
                    <>
                      <div className="w-5 h-5 border-t-2 border-r-2 border-white rounded-full animate-spin mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Application
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Job Details */}
          <motion.div
            className="md:col-span-2 space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            {/* Job Description */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Job Description</h2>
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: job.description }}
              />
            </div>

            {/* Requirements */}
            {job.requirements && job.requirements.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Requirements</h2>
                <ul className="space-y-3">
                  {job.requirements.map((requirement, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle size={18} className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                      <span>{requirement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Responsibilities */}
            {job.responsibilities && job.responsibilities.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Responsibilities</h2>
                <ul className="space-y-3">
                  {job.responsibilities.map((responsibility, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle size={18} className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                      <span>{responsibility}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Benefits */}
            {job.benefits && job.benefits.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Benefits</h2>
                <ul className="space-y-3">
                  {job.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle size={18} className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Skills */}
            {job.skills && job.skills.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-violet-50 text-violet-700 px-4 py-2 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Application Instructions */}
            {job.applicationInstructions && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Application Instructions</h2>
                <p className="text-gray-700">{job.applicationInstructions}</p>
              </div>
            )}
          </motion.div>

          {/* Sidebar */}
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            {/* Job Overview */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Job Overview</h2>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <Briefcase size={18} className="text-violet-600 mr-3 mt-0.5" />
                  <div>
                    <span className="block text-sm text-gray-500">Job Type</span>
                    <span className="font-medium">{job.jobType || "Not specified"}</span>
                  </div>
                </li>
                <li className="flex items-start">
                  <MapPin size={18} className="text-violet-600 mr-3 mt-0.5" />
                  <div>
                    <span className="block text-sm text-gray-500">Location Type</span>
                    <span className="font-medium">{job.locationType || "Not specified"}</span>
                  </div>
                </li>
                <li className="flex items-start">
                  <Users size={18} className="text-violet-600 mr-3 mt-0.5" />
                  <div>
                    <span className="block text-sm text-gray-500">Experience Level</span>
                    <span className="font-medium">{job.experienceLevel || "Not specified"}</span>
                  </div>
                </li>
                {job.salary?.isVisible && (
                  <li className="flex items-start">
                    <DollarSign size={18} className="text-violet-600 mr-3 mt-0.5" />
                    <div>
                      <span className="block text-sm text-gray-500">Salary</span>
                      <span className="font-medium">{formatSalary(job.salary)}</span>
                    </div>
                  </li>
                )}
                {job.deadline && (
                  <li className="flex items-start">
                    <Calendar size={18} className="text-violet-600 mr-3 mt-0.5" />
                    <div>
                      <span className="block text-sm text-gray-500">Application Deadline</span>
                      <span className="font-medium">{formatDate(job.deadline)}</span>
                    </div>
                  </li>
                )}
              </ul>
            </div>

            {/* Company Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Company Information</h2>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <Building size={18} className="text-violet-600 mr-3 mt-0.5" />
                  <div>
                    <span className="block text-sm text-gray-500">Company Name</span>
                    <span className="font-medium">{job.company?.name || "Not specified"}</span>
                  </div>
                </li>
                {job.company?.industry && (
                  <li className="flex items-start">
                    <Briefcase size={18} className="text-violet-600 mr-3 mt-0.5" />
                    <div>
                      <span className="block text-sm text-gray-500">Industry</span>
                      <span className="font-medium">{job.company.industry}</span>
                    </div>
                  </li>
                )}
                {job.company?.size && (
                  <li className="flex items-start">
                    <Users size={18} className="text-violet-600 mr-3 mt-0.5" />
                    <div>
                      <span className="block text-sm text-gray-500">Company Size</span>
                      <span className="font-medium">{job.company.size}</span>
                    </div>
                  </li>
                )}
                {job.company?.website && (
                  <li className="flex items-start">
                    <ExternalLink size={18} className="text-violet-600 mr-3 mt-0.5" />
                    <div>
                      <span className="block text-sm text-gray-500">Website</span>
                      <a
                        href={job.company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-violet-600 hover:underline"
                      >
                        Visit Website
                      </a>
                    </div>
                  </li>
                )}
              </ul>
            </div>

            {/* Application Methods */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">How to Apply</h2>
              <div className="space-y-4">
                <button
                  onClick={() => setShowApplyForm(!showApplyForm)}
                  className="w-full bg-violet-600 text-white px-4 py-3 rounded-lg hover:bg-violet-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Briefcase size={18} />
                  Apply on ProductBazar
                </button>

                {job.applicationUrl && (
                  <a
                    href={job.applicationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-white text-gray-700 border border-gray-300 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <ExternalLink size={18} />
                    Apply on Company Website
                  </a>
                )}

                {job.applicationEmail && (
                  <a
                    href={`mailto:${job.applicationEmail}?subject=Application for ${job.title}`}
                    className="w-full bg-white text-gray-700 border border-gray-300 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <Mail size={18} />
                    Apply via Email
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
