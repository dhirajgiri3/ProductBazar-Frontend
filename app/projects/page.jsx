"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  FolderKanban, 
  Search, 
  Filter, 
  Plus,
  User,
  Tag,
  Calendar,
  ThumbsUp,
  Eye
} from "lucide-react";
import { useAuth } from "../../Contexts/Auth/AuthContext";
import api from "../../Utils/api";
import logger from "../../Utils/logger";
import LoaderComponent from "../../Components/UI/LoaderComponent";

export default function ProjectsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    ownerType: "",
    category: "",
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
  });

  const fetchProjects = async (page = 1) => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams({
        page,
        limit: 12,
        sort: "-createdAt",
        visibility: "public",
      });
      
      // Add search term if exists
      if (searchTerm) {
        params.append("search", searchTerm);
      }
      
      // Add filters if selected
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.append(key, value);
        }
      });
      
      const response = await api.get(`/projects?${params}`);
      
      if (response.data.status === "success") {
        setProjects(response.data.data.projects);
        setPagination({
          currentPage: response.data.currentPage,
          totalPages: response.data.totalPages,
          total: response.data.total,
        });
      } else {
        setError("Failed to fetch projects");
      }
    } catch (error) {
      logger.error("Error fetching projects:", error);
      setError("Failed to fetch projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [searchTerm, filters]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProjects(1);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
  };

  const handlePageChange = (page) => {
    fetchProjects(page);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }).format(date);
  };

  const calculateDaysAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    return `${diffDays} days ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1
            className="text-4xl md:text-5xl font-bold text-gray-900"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Project Showcase
          </motion.h1>
          <motion.p
            className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Discover amazing projects from freelancers, agencies, and job seekers
          </motion.p>
        </div>

        {/* Search and Filters */}
        <motion.div
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search projects by title, skills, or technologies"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <select
                value={filters.ownerType}
                onChange={(e) => handleFilterChange("ownerType", e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
              >
                <option value="">All Project Types</option>
                <option value="freelancer">Freelancer</option>
                <option value="agency">Agency</option>
                <option value="jobseeker">Job Seeker</option>
                <option value="startupOwner">Startup Owner</option>
              </select>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange("category", e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
              >
                <option value="">All Categories</option>
                <option value="Web Development">Web Development</option>
                <option value="Mobile App">Mobile App</option>
                <option value="UI/UX Design">UI/UX Design</option>
                <option value="Branding">Branding</option>
                <option value="E-commerce">E-commerce</option>
                <option value="Marketing">Marketing</option>
                <option value="Other">Other</option>
              </select>
              <button
                type="submit"
                className="bg-violet-600 text-white px-6 py-2 rounded-lg hover:bg-violet-700 transition-colors flex items-center justify-center gap-2"
              >
                <Filter size={18} />
                Filter
              </button>
            </div>
          </form>
        </motion.div>

        {/* Add Project Button (for authenticated users) */}
        {isAuthenticated() && user?.roleCapabilities?.canShowcaseProjects && (
          <motion.div
            className="mb-8 flex justify-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <button
              onClick={() => router.push("/projects/add")}
              className="bg-violet-600 text-white px-6 py-3 rounded-lg hover:bg-violet-700 transition-colors flex items-center gap-2"
            >
              <Plus size={18} />
              Add Project
            </button>
          </motion.div>
        )}

        {/* Project Grid */}
        <div className="space-y-8">
          {loading ? (
            <div className="flex justify-center py-12">
              <LoaderComponent size="large" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500">{error}</p>
              <button
                onClick={() => fetchProjects()}
                className="mt-4 bg-violet-600 text-white px-6 py-2 rounded-lg hover:bg-violet-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <FolderKanban size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Projects Found</h3>
              <p className="text-gray-600 mb-6">
                We couldn't find any projects matching your criteria. Try adjusting your filters or search terms.
              </p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilters({
                    ownerType: "",
                    category: "",
                  });
                }}
                className="bg-violet-600 text-white px-6 py-2 rounded-lg hover:bg-violet-700 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <p className="text-gray-600 mb-4">
                Showing {projects.length} of {pagination.total} projects
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <motion.div
                    key={project._id}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    whileHover={{ y: -5 }}
                    onClick={() => router.push(`/projects/${project.slug}`)}
                  >
                    {/* Project Thumbnail */}
                    <div className="aspect-video bg-gray-100 relative overflow-hidden">
                      {project.thumbnail ? (
                        <img
                          src={project.thumbnail}
                          alt={project.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FolderKanban size={48} className="text-gray-300" />
                        </div>
                      )}
                      {project.featured && (
                        <div className="absolute top-2 right-2 bg-violet-600 text-white text-xs px-2 py-1 rounded-full">
                          Featured
                        </div>
                      )}
                    </div>
                    
                    {/* Project Details */}
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-violet-600 bg-violet-50 px-2 py-1 rounded-full">
                          {project.category || project.ownerType}
                        </span>
                        <span className="text-xs text-gray-500">
                          {calculateDaysAgo(project.createdAt)}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                        {project.title}
                      </h3>
                      
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {project.description}
                      </p>
                      
                      {/* Owner Info */}
                      <div className="flex items-center mb-4">
                        <div className="w-8 h-8 bg-gray-100 rounded-full overflow-hidden mr-2">
                          {project.ownerData?.profilePicture ? (
                            <img
                              src={project.ownerData.profilePicture}
                              alt={`${project.ownerData.firstName} ${project.ownerData.lastName}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User size={16} className="w-full h-full p-2 text-gray-400" />
                          )}
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {project.ownerData ? 
                            `${project.ownerData.firstName} ${project.ownerData.lastName}` : 
                            "Anonymous"}
                        </span>
                      </div>
                      
                      {/* Technologies/Skills */}
                      {project.technologies && project.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {project.technologies.slice(0, 3).map((tech, index) => (
                            <span
                              key={index}
                              className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs"
                            >
                              {tech}
                            </span>
                          ))}
                          {project.technologies.length > 3 && (
                            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                              +{project.technologies.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                      
                      {/* Stats */}
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center">
                          <Eye size={14} className="mr-1" />
                          {project.views || 0}
                        </div>
                        <div className="flex items-center">
                          <ThumbsUp size={14} className="mr-1" />
                          {project.likes || 0}
                        </div>
                        {project.startDate && project.endDate && (
                          <div className="flex items-center">
                            <Calendar size={14} className="mr-1" />
                            {formatDate(project.startDate).split(',')[0]} - {formatDate(project.endDate).split(',')[0]}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center mt-12">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={pagination.currentPage === 1}
                      className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-4 py-2 rounded-lg ${
                          pagination.currentPage === page
                            ? "bg-violet-600 text-white"
                            : "border border-gray-300"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={pagination.currentPage === pagination.totalPages}
                      className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
