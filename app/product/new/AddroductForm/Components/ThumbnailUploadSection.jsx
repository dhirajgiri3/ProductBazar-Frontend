// file: frontend/app/product/new/ExperimentalProductForm/Components/ThumbnailUploadSection.jsx

"use client";

import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Image as ImageIcon,
  Upload,
  X,
  ArrowLeft,
  ArrowRight,
  Link as LinkIcon,
  AlertCircle,
  Loader,
  Maximize2,
  X as CloseIcon
} from "lucide-react";
import { useDropzone } from "react-dropzone";
import { validateImageFile, optimizeImage } from "../../../../../Utils/Image/imageUtils";
import { toast } from "react-hot-toast";

const ThumbnailUploadSection = ({
  thumbnail,
  setThumbnail,
  onBack,
  onNext,
  error,
}) => {
  const [activeTab, setActiveTab] = useState("upload");
  const [linkInput, setLinkInput] = useState("");
  const [processing, setProcessing] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [previewImage, setPreviewImage] = useState(null);

  // Process and optimize images before setting them
  const processImage = async (file) => {
    setProcessing(true);
    try {
      // Validate image first
      const validation = validateImageFile(file);
      if (!validation.valid) {
        setValidationError(validation.error);
        toast.error(validation.error);
        setProcessing(false);
        return null;
      }

      // Clear any previous errors
      setValidationError("");

      // Optimize the image
      const optimized = await optimizeImage(file, {
        maxWidth: 1200,
        maxSizeMB: 2,
        format: 'webp'
      });

      return optimized;
    } catch (error) {
      console.error("Image processing error:", error);
      toast.error("Failed to process image. Please try again.");
      return null;
    } finally {
      setProcessing(false);
    }
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    // Take only the first file if multiple files are dropped
    const file = acceptedFiles[0];

    // Validate file type
    const isValid = /^image\/(jpeg|jpg|png|webp|gif)$/i.test(file.type);
    if (!isValid) {
      toast.error(`File "${file.name}" is not a supported image format`);
      return;
    }

    setProcessing(true);
    toast.loading('Processing image...');

    try {
      // Process the thumbnail image
      const optimizedThumbnail = await processImage(file);

      if (optimizedThumbnail) {
        // If we already had a thumbnail, replace it
        if (thumbnail) {
          toast.success('Thumbnail image replaced');
        } else {
          toast.success('Thumbnail image added');
        }

        setThumbnail(optimizedThumbnail);
        console.log('Set thumbnail from dropped file');
      } else {
        toast.error('Failed to process image');
      }

      // If multiple files were dropped, inform the user we only used the first one
      if (acceptedFiles.length > 1) {
        toast.info(`Note: Only the first image was used as thumbnail. ${acceptedFiles.length - 1} additional image(s) were ignored.`);
      }
    } catch (error) {
      console.error("Image drop processing error:", error);
      toast.dismiss();
      toast.error("Failed to process uploaded image");
    } finally {
      toast.dismiss();
      setProcessing(false);
    }
  }, [thumbnail, setThumbnail]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [] },
    multiple: true,
    onDrop,
    maxSize: 10 * 1024 * 1024, // 10MB max size
  });

  const handleRemoveImage = () => {
    setThumbnail(null);
    toast.success("Thumbnail removed");
  };

  const handleAddImageFromUrl = async () => {
    if (!linkInput) return;

    try {
      setProcessing(true);

      // Attempt to fetch the image to verify it exists
      const response = await fetch(linkInput, { method: 'HEAD' });

      if (!response.ok) {
        toast.error("Invalid image URL. Please check and try again.");
        setProcessing(false);
        return;
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.startsWith('image/')) {
        toast.error("The URL does not point to an image. Please use a direct image URL.");
        setProcessing(false);
        return;
      }

      // Set or replace the thumbnail image
      if (thumbnail) {
        toast.success("Thumbnail image replaced");
      } else {
        toast.success("Thumbnail image added");
      }

      setThumbnail(linkInput);
      setLinkInput("");
    } catch (error) {
      toast.error("Failed to add image from URL");
      console.error("URL image error:", error);
    } finally {
      setProcessing(false);
    }
  };

  // Handle ESC key press to close preview
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === 'Escape' && previewImage) {
        setPreviewImage(null);
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, [previewImage]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-lg w-fit">
        {[
          { id: "upload", icon: Upload, label: "Upload" },
          { id: "link", icon: LinkIcon, label: "URL" },
          { id: "gallery", icon: ImageIcon, label: "Preview" },
        ].map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              activeTab === id
                ? "bg-white text-violet-600 shadow-sm"
                : "text-gray-600 hover:text-violet-600"
            }`}
          >
            <Icon size={18} />
            <span className="font-medium">{label}</span>
          </button>
        ))}
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black/95 flex items-center justify-center z-50"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative w-full max-w-5xl p-4"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
          >
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 p-3 rounded-full transition-colors z-10"
              title="Close preview"
            >
              <CloseIcon size={20} className="text-white" />
            </button>

            <div className="bg-black/30 backdrop-blur-md p-2 rounded-xl overflow-hidden shadow-2xl">
              <img
                src={typeof previewImage === "string" ? previewImage : URL.createObjectURL(previewImage)}
                alt="Product Thumbnail Preview"
                className="max-h-[85vh] max-w-full mx-auto object-contain rounded-lg"
                onError={(e) => {
                  e.target.src = '/images/placeholder-image.png';
                  toast.error("Failed to load preview image");
                }}
              />
            </div>

            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-black/70 backdrop-blur-md text-white px-5 py-2 rounded-full text-sm shadow-lg">
              Click anywhere or press ESC to close
            </div>
          </div>
        </div>
      )}

      {/* Processing Overlay */}
      {processing && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
            <Loader size={40} className="text-violet-600 animate-spin mb-4" />
            <p className="text-gray-700 font-medium">Processing image...</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="relative min-h-[400px]">
        <AnimatePresence mode="wait">
          {activeTab === "upload" && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="absolute inset-0"
            >
              <div
                {...getRootProps()}
                className={`relative h-full border-2 border-dashed rounded-xl transition-all shadow-sm ${
                  isDragActive
                    ? "border-violet-400 bg-violet-50"
                    : "border-gray-200 hover:border-violet-300 hover:bg-gray-50"
                }`}
              >
                <input {...getInputProps()} />
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className="w-20 h-20 mb-4 rounded-full bg-violet-100 flex items-center justify-center text-violet-500 shadow-md"
                  >
                    <Upload size={32} />
                  </motion.div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {isDragActive ? "Drop your thumbnail here" : "Upload product thumbnail"}
                  </h3>
                  <p className="text-gray-500 mb-6 max-w-md">
                    Drag and drop your product thumbnail image here, or click to select a file.
                    We recommend a high-quality square image (max 10MB) that showcases your product well.
                  </p>
                  <div className="space-y-2">
                    <button className="px-8 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors shadow-sm flex items-center gap-2">
                      <ImageIcon size={18} />
                      Choose Thumbnail
                    </button>
                    <p className="text-xs text-gray-400">
                      Only the first selected image will be used as thumbnail
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "link" && (
            <motion.div
              key="link"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="absolute inset-0 flex flex-col"
            >
              <div className="flex-1 flex flex-col items-center justify-center p-6">
                <div className="w-full max-w-md space-y-6">
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      className="w-16 h-16 mb-4 mx-auto rounded-full bg-violet-100 flex items-center justify-center text-violet-500 shadow-sm"
                    >
                      <LinkIcon size={24} />
                    </motion.div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      Add thumbnail from URL
                    </h3>
                    <p className="text-gray-500 text-sm mb-6">
                      Enter a direct link to your product thumbnail image (must end with .jpg, .png, .webp, etc.)
                    </p>
                  </div>

                  <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">Image URL</label>
                      <input
                        type="url"
                        value={linkInput}
                        onChange={(e) => setLinkInput(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 shadow-sm"
                      />
                    </div>
                    <button
                      onClick={handleAddImageFromUrl}
                      disabled={!linkInput || processing}
                      className="w-full px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors disabled:bg-violet-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
                    >
                      {processing ? (
                        <>
                          <Loader size={18} className="animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <LinkIcon size={18} />
                          Set as Thumbnail
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "gallery" && (
            <motion.div
              key="gallery"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="absolute inset-0"
            >
              <div className="h-full p-6 border-2 border-gray-200 rounded-xl overflow-y-auto">
                {!thumbnail ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                      <ImageIcon size={24} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      No thumbnail yet
                    </h3>
                    <p className="text-gray-500">
                      Switch to Upload or URL tab to add a thumbnail image
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Thumbnail Section */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-700 flex items-center gap-2">
                        <ImageIcon size={16} className="text-violet-500" />
                        Product Thumbnail
                      </h4>
                      <div className="relative w-full h-64 md:h-80 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="absolute top-2 left-2 z-10 bg-violet-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                          Thumbnail
                        </div>
                        <img
                          src={
                            typeof thumbnail === "string"
                              ? thumbnail
                              : URL.createObjectURL(thumbnail)
                          }
                          alt="Thumbnail"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = '/images/placeholder-image.png';
                            toast.error("Failed to load thumbnail image");
                          }}
                        />
                        <div className="absolute top-2 right-2 flex space-x-2">
                          <button
                            onClick={() => setPreviewImage(thumbnail)}
                            className="p-2 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors"
                            title="Preview image"
                          >
                            <Maximize2 size={16} />
                          </button>
                          <button
                            onClick={() => handleRemoveImage()}
                            className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                            title="Remove thumbnail"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        This image will be displayed as the main image for your product.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error Message */}
      {(error || validationError) && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-500 text-sm flex items-center gap-1"
        >
          <AlertCircle size={14} /> {error || validationError}
        </motion.p>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <button
          onClick={onBack}
          className="px-6 py-3 flex items-center gap-2 text-gray-600 hover:text-violet-600 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>
        <button
          onClick={onNext}
          disabled={!thumbnail || processing}
          className="px-8 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <span>Continue</span>
          <ArrowRight size={20} />
        </button>
      </div>

      {/* Extra CSS for hiding scrollbars */}
      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </motion.div>
  );
};

export default ThumbnailUploadSection;
