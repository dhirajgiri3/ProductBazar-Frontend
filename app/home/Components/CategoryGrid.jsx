"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useCategories } from "../../../Contexts/Category/CategoryContext";
import { Grid, ArrowUpRight } from "lucide-react";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.1
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1.0] } },
};

const CategoryItem = ({ category }) => {
  // Use category slug if available, otherwise create one from the name
  const href = category.slug
    ? `/category/${category.slug}`
    : `/category/${category.name.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <motion.div variants={item} key={category._id}>
      <Link
        href={href}
        className="group flex flex-col items-center justify-center p-5 rounded-2xl transition-all
          hover:shadow-lg hover:-translate-y-1 bg-white border-0 shadow-sm hover:shadow-violet-100/60 relative overflow-hidden"
      >
        <div className="w-full absolute bottom-0 left-0 h-1 bg-gradient-to-r from-violet-500 to-indigo-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
        
        <div className="icon mb-3 relative transition-transform group-hover:scale-110">
          {category.icon ? (
            <Image
              src={category.icon}
              alt={category.name}
              width={52}
              height={52}
              className="rounded-lg object-cover"
            />
          ) : (
            <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-gradient-to-br from-violet-50 to-indigo-50 text-violet-600 shadow-sm">
              <span className="text-xl">📁</span>
            </div>
          )}
          
          <motion.span 
            className="absolute -right-1 -top-1 w-5 h-5 bg-violet-100 text-violet-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            initial={{ rotate: 0 }}
            whileHover={{ rotate: 45 }}
          >
            <ArrowUpRight className="w-3 h-3" />
          </motion.span>
        </div>
        
        <span className="font-semibold text-gray-800 text-sm group-hover:text-violet-700 transition-colors">
          {category.name}
        </span>
      </Link>
    </motion.div>
  );
};

const CategoryGrid = () => {
  const { categories, loading, error, retryFetchCategories } = useCategories();

  if (loading) {
    return (
      <div className="mt-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <span className="bg-violet-100 text-violet-600 w-8 h-8 flex items-center justify-center rounded-md mr-3 text-sm">
              <Grid className="w-4 h-4" />
            </span>
            Explore by Category
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="flex flex-col items-center justify-center p-5 rounded-2xl border border-gray-100 bg-gray-50/50 animate-pulse h-28"
            >
              <div className="w-14 h-14 rounded-xl bg-gray-200 mb-3"></div>
              <div className="w-20 h-4 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <span className="bg-violet-100 text-violet-600 w-8 h-8 flex items-center justify-center rounded-md mr-3 text-sm">
              <Grid className="w-4 h-4" />
            </span>
            Explore by Category
          </h2>
        </div>
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl flex flex-col items-center shadow-sm border border-red-100">
          <p className="mb-4 font-medium">Error loading categories: {error}</p>
          <button
            onClick={retryFetchCategories}
            className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <span className="bg-violet-100 text-violet-600 w-8 h-8 flex items-center justify-center rounded-md mr-3 text-sm">
            <Grid className="w-4 h-4" />
          </span>
          Explore by Category
        </h2>
      </div>
      
      {categories && categories.length > 0 ? (
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {categories.map((category) => (
            <CategoryItem key={category._id} category={category} />
          ))}
        </motion.div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-gray-500 font-medium">No categories found.</p>
        </div>
      )}
    </div>
  );
};

export default CategoryGrid;