"use client";

import React, { forwardRef } from "react";
import { motion } from "framer-motion";
import LoaderComponent from "../../../Components/UI/LoaderComponent"; // Adjust path if needed

const ProfileImageUpload = forwardRef(
  ({ profileImagePreview, imageLoading, handleProfileImageChange, disabled }, ref) => {
    const handleClick = () => {
      if (!disabled && ref.current) {
        ref.current.click();
      }
    };

    return (
      <motion.div
        className="flex flex-col items-center mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative w-32 h-32 cursor-pointer" onClick={handleClick}>
          <div className="w-full h-full rounded-full overflow-hidden border-2 border-gray-200 shadow-sm transition-all duration-300 group">
            {imageLoading ? (
              <div className="w-full h-full flex items-center justify-center bg-gray-50">
                <LoaderComponent size="small" color="violet" text="" />
              </div>
            ) : profileImagePreview ? (
              <img
                src={profileImagePreview}
                alt="Profile Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </div>
            )}
            {!imageLoading && (
              <div className="absolute inset-0 rounded-full bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none">
                <div className="text-white text-center">
                  <svg className="w-8 h-8 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <span className="text-xs font-medium">{profileImagePreview ? "Change" : "Add Photo"}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <input
          type="file"
          ref={ref}
          onChange={handleProfileImageChange}
          className="hidden"
          accept="image/jpeg,image/png,image/gif,image/webp"
          disabled={disabled || imageLoading}
        />

        <button
          type="button"
          onClick={handleClick}
          disabled={disabled || imageLoading}
          className={`mt-3 text-xs ${disabled || imageLoading ? 'text-gray-400 bg-gray-100 cursor-not-allowed' : 'text-gray-600 bg-gray-50 hover:bg-gray-100'} px-3 py-1.5 rounded-full transition-colors duration-200 flex items-center space-x-1 border border-gray-200`}
        >
          {imageLoading ? (
            <>
                <div className="h-3.5 w-3.5 mr-1"><LoaderComponent size="small" color="gray" text="" /></div>
                <span>Processing...</span>
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" /></svg>
              <span>{profileImagePreview ? "Update photo" : "Upload photo"}</span>
            </>
          )}
        </button>
      </motion.div>
    );
  }
);

ProfileImageUpload.displayName = "ProfileImageUpload"; // Add display name

export default ProfileImageUpload;