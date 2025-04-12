"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  FolderKanban,
  User,
  Calendar,
  Tag,
  ExternalLink,
  GitHub,
  ThumbsUp,
  Eye,
  ChevronLeft,
  Share2,
  MessageSquare,
  Briefcase,
  Building
} from "lucide-react";
import { useAuth } from "../../../Contexts/Auth/AuthContext";
import { makePriorityRequest } from "../../../Utils/api";
import logger from "../../../Utils/logger";
import LoaderComponent from "../../../Components/UI/LoaderComponent";
import { toast } from "react-hot-toast";

export default function ProjectDetailPage() {
  const { slug } = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(null);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        setError(null); // Clear any previous errors

        // Use makePriorityRequest to avoid request cancellation
        const response = await makePriorityRequest('get', `/projects/${slug}`);

        if (response.data.status === "success") {
          const projectData = response.data.data.project;
          setProject(projectData);
          setActiveImage(projectData.thumbnail || (projectData.gallery?.length > 0 ? projectData.gallery[0].url : null));
        } else {
          setError("Failed to fetch project details");
        }
      } catch (error) {
        // Don't set error for canceled requests
        if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
          logger.warn(`Request for project ${slug} was canceled, retrying...`);
          // Retry the request after a short delay
          setTimeout(() => {
            fetchProject();
          }, 500);
          return;
        }

        logger.error(`Error fetching project ${slug}:`, error);
        setError("Failed to fetch project details");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchProject();
    }
  }, [slug]);

  const formatDate = (dateString) => {
    if (!dateString) return null;

    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const handleLike = async () => {
    try {
      // Use makePriorityRequest to avoid request cancellation
      const response = await makePriorityRequest('post', `/projects/${project._id}/like`);

      if (response.data.status === "success") {
        setLiked(true);
        setProject(prev => ({
          ...prev,
          likes: response.data.data.likes
        }));
        toast.success("Thanks for liking this project!");
      }
    } catch (error) {
      // Don't show error for canceled requests
      if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
        logger.warn(`Like request for project ${project._id} was canceled, retrying...`);
        // Retry the request after a short delay
        setTimeout(() => {
          handleLike();
        }, 500);
        return;
      }

      logger.error("Error liking project:", error);
      toast.error("Failed to like project");
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: project.title,
          text: `Check out this project: ${project.title}`,
          url: window.location.href,
        });
        logger.info(`Shared project ${project._id} using Web Share API`);
      } else {
        // Fallback to copying to clipboard
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!");
        logger.info(`Copied project ${project._id} link to clipboard`);
      }
    } catch (error) {
      // Ignore user cancellation errors
      if (error.name === 'AbortError') {
        logger.info('User canceled sharing');
        return;
      }

      logger.error("Error sharing project:", error);
      // Don't show error toast for sharing issues as they're often user-initiated cancellations
    }
  };

  const getOwnerTypeLabel = (ownerType) => {
    switch (ownerType) {
      case "freelancer":
        return "Freelancer";
      case "agency":
        return "Agency";
      case "jobseeker":
        return "Job Seeker";
      case "startupOwner":
        return "Startup Owner";
      default:
        return "Creator";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoaderComponent size="large" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Project Not Found</h2>
          <p className="text-gray-600 mb-6">
            The project you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => router.push("/projects")}
            className="bg-violet-600 text-white px-6 py-3 rounded-lg hover:bg-violet-700 transition-colors"
          >
            Browse All Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <motion.button
          onClick={() => router.push("/projects")}
          className="mb-6 flex items-center text-gray-600 hover:text-violet-700 transition-colors"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <ChevronLeft size={20} className="mr-1" />
          Back to Projects
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <motion.div
            className="lg:col-span-2 space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Project Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-violet-600 bg-violet-50 px-3 py-1 rounded-full">
                      {project.category || getOwnerTypeLabel(project.ownerType)}
                    </span>
                    {project.featured && (
                      <span className="text-sm font-medium text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                        Featured
                      </span>
                    )}
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.title}</h1>
                  <div className="flex items-center text-gray-600 gap-4">
                    <div className="flex items-center">
                      <Calendar size={16} className="mr-1 text-gray-400" />
                      {formatDate(project.createdAt)}
                    </div>
                    <div className="flex items-center">
                      <Eye size={16} className="mr-1 text-gray-400" />
                      {project.views || 0} views
                    </div>
                    <div className="flex items-center">
                      <ThumbsUp size={16} className="mr-1 text-gray-400" />
                      {project.likes || 0} likes
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleLike}
                    disabled={liked}
                    className={`p-2 rounded-full ${
                      liked ? "bg-violet-100 text-violet-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    <ThumbsUp size={20} />
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                  >
                    <Share2 size={20} />
                  </button>
                </div>
              </div>

              {/* Project Gallery */}
              <div className="mb-8">
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-2">
                  {activeImage ? (
                    <img
                      src={activeImage}
                      alt={project.title}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FolderKanban size={64} className="text-gray-300" />
                    </div>
                  )}
                </div>
                {project.gallery && project.gallery.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {project.thumbnail && (
                      <button
                        onClick={() => setActiveImage(project.thumbnail)}
                        className={`w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 ${
                          activeImage === project.thumbnail ? "ring-2 ring-violet-500" : ""
                        }`}
                      >
                        <img
                          src={project.thumbnail}
                          alt="Thumbnail"
                          className="w-full h-full object-cover"
                        />
                      </button>
                    )}
                    {project.gallery.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveImage(image.url)}
                        className={`w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 ${
                          activeImage === image.url ? "ring-2 ring-violet-500" : ""
                        }`}
                      >
                        <img
                          src={image.url}
                          alt={image.caption || `Gallery image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Project Description */}
              <div className="prose max-w-none">
                <p className="text-gray-700">{project.description}</p>
              </div>
            </div>

            {/* Project Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Project Details</h2>

              <div className="space-y-6">
                {/* Challenge */}
                {project.challenge && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">The Challenge</h3>
                    <p className="text-gray-700">{project.challenge}</p>
                  </div>
                )}

                {/* Solution */}
                {project.solution && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">The Solution</h3>
                    <p className="text-gray-700">{project.solution}</p>
                  </div>
                )}

                {/* Results */}
                {project.results && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">The Results</h3>
                    <p className="text-gray-700">{project.results}</p>
                  </div>
                )}

                {/* Achievements */}
                {project.achievements && project.achievements.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">Key Achievements</h3>
                    <ul className="list-disc pl-5 space-y-1 text-gray-700">
                      {project.achievements.map((achievement, index) => (
                        <li key={index}>{achievement}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Technologies */}
                {project.technologies && project.technologies.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">Technologies Used</h3>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech, index) => (
                        <span
                          key={index}
                          className="bg-violet-50 text-violet-700 px-3 py-1 rounded-full text-sm"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills */}
                {project.skills && project.skills.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">Skills Demonstrated</h3>
                    <div className="flex flex-wrap gap-2">
                      {project.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Timeline */}
                {(project.startDate || project.endDate) && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">Project Timeline</h3>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Calendar size={18} className="text-gray-400" />
                      {formatDate(project.startDate) || "Start date not specified"}
                      {project.endDate && !project.current ? (
                        <>
                          <span className="mx-2">to</span>
                          {formatDate(project.endDate)}
                        </>
                      ) : project.current ? (
                        <span className="ml-2 text-green-600 font-medium">
                          (Ongoing)
                        </span>
                      ) : null}
                    </div>
                  </div>
                )}

                {/* Links */}
                <div className="flex flex-wrap gap-4">
                  {project.projectUrl && (
                    <a
                      href={project.projectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-violet-600 hover:text-violet-700 transition-colors"
                    >
                      <ExternalLink size={18} />
                      View Live Project
                    </a>
                  )}
                  {project.repositoryUrl && (
                    <a
                      href={project.repositoryUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-violet-600 hover:text-violet-700 transition-colors"
                    >
                      <GitHub size={18} />
                      View Repository
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Client Testimonial */}
            {project.client?.testimonial?.content && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Client Testimonial</h2>
                <blockquote className="border-l-4 border-violet-300 pl-4 italic text-gray-700">
                  "{project.client.testimonial.content}"
                </blockquote>
                {(project.client.testimonial.author || project.client.testimonial.position) && (
                  <div className="mt-4 text-right">
                    <p className="font-medium text-gray-800">
                      {project.client.testimonial.author}
                      {project.client.testimonial.position && (
                        <span className="font-normal text-gray-600">
                          , {project.client.testimonial.position}
                        </span>
                      )}
                    </p>
                  </div>
                )}
              </div>
            )}
          </motion.div>

          {/* Sidebar */}
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            {/* Owner Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">About the Creator</h2>
              <div className="flex items-center mb-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full overflow-hidden mr-4">
                  {project.ownerData?.profilePicture ? (
                    <img
                      src={project.ownerData.profilePicture}
                      alt={`${project.ownerData.firstName} ${project.ownerData.lastName}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={32} className="w-full h-full p-4 text-gray-400" />
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    {project.ownerData ?
                      `${project.ownerData.firstName} ${project.ownerData.lastName}` :
                      "Anonymous"}
                  </h3>
                  <p className="text-sm text-violet-600">
                    {getOwnerTypeLabel(project.ownerType)}
                  </p>
                </div>
              </div>

              {project.ownerData?.bio && (
                <p className="text-gray-700 text-sm mb-4">
                  {project.ownerData.bio}
                </p>
              )}

              {project.role && (
                <div className="flex items-start mb-3">
                  <Briefcase size={16} className="text-gray-400 mr-2 mt-0.5" />
                  <div>
                    <span className="block text-xs text-gray-500">Role in Project</span>
                    <span className="text-sm text-gray-700">{project.role}</span>
                  </div>
                </div>
              )}

              <button
                onClick={() => router.push(`/profile/${project.owner}`)}
                className="w-full mt-2 bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors"
              >
                View Profile
              </button>
            </div>

            {/* Client Information */}
            {project.client && (project.client.name || project.client.industry || project.client.website) && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Client Information</h2>

                {project.client.logo && (
                  <div className="flex justify-center mb-4">
                    <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                      <img
                        src={project.client.logo}
                        alt={`${project.client.name} logo`}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  </div>
                )}

                {project.client.name && (
                  <div className="flex items-start mb-3">
                    <Building size={16} className="text-gray-400 mr-2 mt-0.5" />
                    <div>
                      <span className="block text-xs text-gray-500">Client</span>
                      <span className="text-sm text-gray-700">{project.client.name}</span>
                    </div>
                  </div>
                )}

                {project.client.industry && (
                  <div className="flex items-start mb-3">
                    <Briefcase size={16} className="text-gray-400 mr-2 mt-0.5" />
                    <div>
                      <span className="block text-xs text-gray-500">Industry</span>
                      <span className="text-sm text-gray-700">{project.client.industry}</span>
                    </div>
                  </div>
                )}

                {project.client.website && (
                  <div className="flex items-start mb-3">
                    <ExternalLink size={16} className="text-gray-400 mr-2 mt-0.5" />
                    <div>
                      <span className="block text-xs text-gray-500">Website</span>
                      <a
                        href={project.client.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-violet-600 hover:underline"
                      >
                        {project.client.website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Contact Creator */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Interested in this work?</h2>
              <p className="text-gray-700 text-sm mb-4">
                Contact the creator to discuss similar projects or opportunities.
              </p>
              <button
                onClick={() => router.push(`/messages/new?recipient=${project.owner}`)}
                className="w-full bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors flex items-center justify-center gap-2"
              >
                <MessageSquare size={18} />
                Message Creator
              </button>
            </div>

            {/* Similar Projects */}
            {/* This would require backend support for recommendations */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">More from this Creator</h2>
              <button
                onClick={() => router.push(`/projects?ownerType=${project.ownerType}`)}
                className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                View Similar Projects
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
