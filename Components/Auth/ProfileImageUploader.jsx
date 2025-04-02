"use client";

import React, { useState, useRef } from 'react';
import { useAuth } from '../../Contexts/Auth/AuthContext';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { uploadProfileImage, validateProfileImage } from '../../Utils/authFileUpload';
import { FiCamera, FiUpload, FiX, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

const ProfileImageUploader = ({ 
  type = 'profile', 
  onSuccess, 
  onError,
  className,
  showPreview = true,
  previewSize = 'md',
}) => {
  const { user, refreshUserData } = useAuth();
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [optimizing, setOptimizing] = useState(false);
  
  // Get current image URL from user data
  const currentImageUrl = type === 'profile' 
    ? user?.profilePicture?.url 
    : user?.bannerImage?.url;
  
  // Determine preview image size classes
  const sizeClasses = {
    sm: 'h-20 w-20',
    md: 'h-32 w-32',
    lg: 'h-40 w-40',
    xl: 'h-48 w-48',
    banner: 'h-32 w-full'
  };
  
  const previewSizeClass = type === 'banner' ? sizeClasses.banner : sizeClasses[previewSize] || sizeClasses.md;
  
  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    if (!file) {
      return;
    }
    
    // Validate file
    const validation = validateProfileImage(file, type);
    
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }
    
    // If valid, show recommendation if any
    if (validation.recommendation) {
      toast.success(validation.recommendation, { 
        icon: '💡',
        duration: 5000
      });
    }
    
    // Set file for upload
    setSelectedFile(file);
    
    // Create preview URL
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };
  
  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  
  // Upload selected file
  const uploadFile = async () => {
    if (!selectedFile) {
      toast.error('Please select a file first');
      return;
    }
    
    setUploading(true);
    setUploadProgress(0);
    
    try {
      // Upload file with progress tracking
      const response = await uploadProfileImage(
        selectedFile, 
        type,
        {
          onOptimizationStart: () => setOptimizing(true),
          onOptimizationComplete: () => setOptimizing(false),
          onProgress: (percent) => setUploadProgress(percent)
        }
      );
      
      // Show success message
      toast.success(response.message || 'Image uploaded successfully');
      
      // Refresh user data to get updated image URL
      await refreshUserData();
      
      // Clean up
      URL.revokeObjectURL(previewUrl);
      setSelectedFile(null);
      setPreviewUrl(null);
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess(response);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Upload failed';
      toast.error(errorMessage);
      
      // Call error callback if provided
      if (onError) {
        onError(error);
      }
    } finally {
      setUploading(false);
      setOptimizing(false);
    }
  };
  
  // Cancel upload
  const cancelUpload = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
  };
  
  return (
    <div className={className}>
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
      />
      
      {/* Image preview or upload button */}
      {showPreview && (previewUrl || currentImageUrl) ? (
        <div className="flex flex-col items-center space-y-3">
          {/* Preview container */}
          <div 
            className={`${previewSizeClass} relative rounded-${type === 'profile' ? 'full' : 'lg'} overflow-hidden bg-gray-100 flex items-center justify-center`}
          >
            <img 
              src={previewUrl || currentImageUrl} 
              alt={type === 'profile' ? 'Profile Image' : 'Banner Image'} 
              className={`${type === 'profile' ? 'object-cover' : 'object-cover'} w-full h-full`}
            />
            
            {/* Overlay with edit button */}
            <div 
              className="absolute inset-0 bg-black/0 hover:bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-all cursor-pointer"
              onClick={triggerFileInput}
            >
              <FiCamera className="text-white h-8 w-8" />
            </div>
          </div>
          
          {/* Actions for preview mode */}
          {previewUrl && (
            <div className="flex space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={uploadFile}
                disabled={uploading || optimizing}
                className={`px-3 py-1.5 rounded-lg flex items-center ${
                  uploading || optimizing 
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                    : 'bg-violet-100 text-violet-700 hover:bg-violet-200'
                }`}
              >
                {uploading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {uploadProgress < 100 
                      ? `Uploading ${uploadProgress}%` 
                      : 'Processing...'
                    }
                  </>
                ) : optimizing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Optimizing...
                  </>
                ) : (
                  <>
                    <FiUpload className="mr-1.5" />
                    Save
                  </>
                )}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={cancelUpload}
                disabled={uploading || optimizing}
                className={`px-3 py-1.5 rounded-lg flex items-center ${
                  uploading || optimizing 
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                }`}
              >
                <FiX className="mr-1.5" />
                Cancel
              </motion.button>
            </div>
          )}
        </div>
      ) : (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={triggerFileInput}
          className={`flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 ${type === 'profile' ? 'rounded-full h-32 w-32' : 'rounded-lg h-32 w-full'} hover:border-violet-400 hover:bg-violet-50 transition-colors`}
        >
          <FiCamera className="h-8 w-8 text-gray-400 mb-2" />
          <span className="text-sm text-gray-500 text-center">
            {type === 'profile' ? 'Upload Profile Image' : 'Upload Banner Image'}
          </span>
        </motion.button>
      )}
    </div>
  );
};

export default ProfileImageUploader;
