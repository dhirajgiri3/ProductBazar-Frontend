"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useCategories } from "../../../Contexts/Category/CategoryContext";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
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
        className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all
          hover:shadow-md hover:-translate-y-1 bg-white border-gray-100`}
      >
        <div className="icon mb-2">
          {category.icon ? (
            <Image
              src={category.icon}
              alt={category.name}
              width={48}
              height={48}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-br from-violet-100 to-indigo-100 text-violet-600">
              <span className="text-xl">📁</span>
            </div>
          )}
        </div>
        <span className="font-medium text-gray-800 text-sm text-center">
          {category.name}
        </span>
      </Link>
    </motion.div>
  );
};

const CategoryGrid = () => {
  const { categories, loading, error } = useCategories();

  if (loading) {
    return (
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-6 text-gray-900">
          Explore by Category
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="flex flex-col items-center justify-center p-4 rounded-xl border bg-gray-50 animate-pulse h-24"
            >
              <div className="w-12 h-12 rounded-full bg-gray-200 mb-2"></div>
              <div className="w-16 h-4 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-6 text-gray-900">
          Explore by Category
        </h2>
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          Error loading categories. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-6 text-gray-900 flex items-center">
        <span className="bg-violet-100 text-violet-600 w-7 h-7 flex items-center justify-center rounded-md mr-2 text-sm">
          📂
        </span>
        Explore by Category
      </h2>
      {categories && categories.length > 0 ? (
        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {categories.map((category) => (
            <CategoryItem key={category._id} category={category} />
          ))}
        </motion.div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p>No categories found.</p>
        </div>
      )}
    </div>
  );
};

export default CategoryGrid;
