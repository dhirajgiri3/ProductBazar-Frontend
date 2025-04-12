"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { useAuth } from "../../../Contexts/Auth/AuthContext";
import JobPostForm from "./JobPostForm";
import LoaderComponent from "../../../Components/UI/LoaderComponent";

export default function PostJobPage() {
  const { user, authLoading, isInitialized } = useAuth();
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (authLoading || !isInitialized) {
      return;
    }
    setLoading(false);

    if (!user) {
      toast.error("Please log in to post a job", { icon: '🔑' });
      router.push("/auth/login?redirect=/jobs/post");
      return;
    }

    // Check if user has permission to post jobs
    if (user.roleCapabilities && !user.roleCapabilities.canPostJobs) {
      toast.error("Your account type doesn't have permission to post jobs", { icon: '🚫' });
      router.push("/jobs");
      return;
    }

    // Check if user has completed profile
    if (!user.isProfileCompleted) {
      toast.error("Please complete your profile before posting a job", { icon: '📝' });
      router.push("/complete-profile");
      return;
    }
  }, [user, router, authLoading, isInitialized]);

  if (loading || authLoading || !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoaderComponent size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 py-12 px-4">
      <motion.div
        className="max-w-5xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-12">
          <motion.h1
            className="text-4xl md:text-5xl font-bold text-gray-900"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Post a Job
          </motion.h1>
          <motion.p
            className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Find the perfect talent for your team by posting a job on ProductBazar
          </motion.p>
        </div>

        <JobPostForm />
      </motion.div>
    </div>
  );
}
