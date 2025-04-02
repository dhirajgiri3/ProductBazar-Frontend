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
          hover:shadow-md hover:-translate-y-1 bg-white`} // Removed category.color, added white background
      >
        <div className="icon">
          {category.icon ? (
            <Image
              src={category.icon}
              alt={category.name}
              width={48} // Increased size for better visibility
              height={48}
              className="mb-2 rounded-full object-cover" // Ensure consistent icon display
            />
          ) : (
            <div className="w-12 h-12 mb-2 flex items-center justify-center rounded-full bg-gray-100 text-gray-500">
              <span>📁</span> {/* Default icon if category.icon is missing */}
            </div>
          )}
        </div>
        <span className="font-medium text-gray-800 text-sm text-center">
          {category.name}
        </span>{" "}
        {/* Centered text */}
      </Link>
    </motion.div>
  );
};

const CategoryGrid = () => {
  const { categories, loading, error } = useCategories();

  if (loading) {
    return <p>Loading categories...</p>; // Simple loading indicator
  }

  if (error) {
    return <p>Error loading categories: {error}</p>; // Simple error message
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-6 text-gray-900">
        Explore by Category
      </h2>
      {categories && categories.length > 0 ? (
        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4" // Adjusted grid for better responsiveness
          variants={container}
          initial="hidden"
          animate="show"
        >
          {categories.map((category) => (
            <CategoryItem key={category._id} category={category} />
          ))}
        </motion.div>
      ) : (
        <p>No categories found.</p> // Handle empty category list
      )}
    </div>
  );
};

export default CategoryGrid;
