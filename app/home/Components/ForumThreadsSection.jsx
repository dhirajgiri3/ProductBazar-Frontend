"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { MessageSquare, ArrowRight } from 'lucide-react';

const ForumThreadsSection = () => {
  const [threads, setThreads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchThreads = async () => {
      setIsLoading(true);
      try {
        // This would be replaced with actual API call
        const response = await fetch('/api/forum/trending-threads');
        const data = await response.json();
        setThreads(data.threads || []);
      } catch (error) {
        console.error("Failed to fetch forum threads:", error);
        // Fallback to sample data
        setThreads([
          {
            id: 1,
            title: "Best tools for startup founders in 2025?",
            commentCount: 24,
            author: "Jessica Chen",
            category: "Tools",
            createdAt: new Date(Date.now() - 3600000).toISOString()
          },
          {
            id: 2,
            title: "How do you validate your product idea?",
            commentCount: 18,
            author: "Mike Johnson",
            category: "Strategy",
            createdAt: new Date(Date.now() - 7200000).toISOString()
          },
          {
            id: 3,
            title: "Looking for feedback on my new AI app",
            commentCount: 12,
            author: "Sarah Smith",
            category: "Feedback",
            createdAt: new Date(Date.now() - 10800000).toISOString()
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchThreads();
  }, []);

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.round(diffMs / 1000);
    const diffMin = Math.round(diffSec / 60);
    const diffHour = Math.round(diffMin / 60);
    const diffDay = Math.round(diffHour / 24);

    if (diffSec < 60) return `${diffSec} seconds ago`;
    if (diffMin < 60) return `${diffMin} minutes ago`;
    if (diffHour < 24) return `${diffHour} hours ago`;
    return `${diffDay} days ago`;
  };

  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <div className="bg-blue-100 p-1.5 rounded-md mr-2">
              <MessageSquare className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Active Discussions</h2>
          </div>
          <Link href="/forum" className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
            View All <ArrowRight className="ml-1 w-4 h-4" />
          </Link>
        </div>
      </div>
      
      {isLoading ? (
        <div className="animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-4 border-b border-gray-100 last:border-0">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="flex items-center justify-between">
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/5"></div>
              </div>
            </div>
          ))}
        </div>
      ) : threads.length === 0 ? (
        <div className="p-5 text-center">
          <p className="text-gray-500">No active discussions yet.</p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {threads.map((thread, index) => (
            <Link 
              href={`/forum/thread/${thread.id}`} 
              key={thread.id}
              className="block p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors duration-200"
            >
              <h3 className="font-medium text-gray-900 mb-1 line-clamp-1">{thread.title}</h3>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center">
                  <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-medium mr-2">
                    {thread.category}
                  </span>
                  <span>{thread.author}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span>{formatTimeAgo(thread.createdAt)}</span>
                  <span className="flex items-center">
                    <MessageSquare className="w-3 h-3 mr-1" />
                    {thread.commentCount}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </motion.div>
      )}
      
      <div className="bg-gray-50 p-3 text-center">
        <Link
          href="/forum/create"
          className="text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          Start a new discussion
        </Link>
      </div>
    </section>
  );
};

export default ForumThreadsSection;