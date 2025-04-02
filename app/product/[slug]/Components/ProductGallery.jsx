"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { FiPlus, FiTrash2, FiX } from "react-icons/fi";

/**
 * Product Gallery Component with preview modal and optional editing capabilities
 *
 * @param {Object} props
 * @param {Array} props.images - Array of image objects with url property
 * @param {Function} props.onAddImages - Callback for adding images
 * @param {Function} props.onRemoveImage - Callback for removing an image
 * @param {Function} props.onReorderImages - Callback for reordering images
 * @param {Number} props.maxImages - Maximum number of images allowed
 * @param {Boolean} props.readOnly - Whether the gallery is read-only (no editing)
 */
const ProductGallery = ({
  images = [],
  onAddImages,
  onRemoveImage,
  onReorderImages,
  maxImages = 10,
  readOnly = true,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showPreview, setShowPreview] = useState(false);

  // Handle thumbnail click
  const handleThumbnailClick = (index) => {
    setCurrentImageIndex(index);
    setShowPreview(true);
  };

  // Close preview modal
  const closePreview = () => {
    setShowPreview(false);
  };

  // Navigate to next image in preview
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  // Navigate to previous image in preview
  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Handle keyboard navigation in preview
  const handleKeyDown = (e) => {
    if (!showPreview) return;

    switch (e.key) {
      case "ArrowRight":
        nextImage();
        break;
      case "ArrowLeft":
        prevImage();
        break;
      case "Escape":
        closePreview();
        break;
      default:
        break;
    }
  };

  // Set up keyboard event listeners
  useState(() => {
    if (showPreview) {
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [showPreview]);

  // No images case
  if (!images.length) {
    return (
      <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center">
        {readOnly ? (
          <p className="text-gray-500">No images available</p>
        ) : (
          <button
            onClick={onAddImages}
            className="w-full py-6 flex flex-col items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
          >
            <FiPlus size={24} className="mb-2" />
            <span>Add Images</span>
            <span className="text-xs mt-1">(max {maxImages})</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
        {images.map((image, index) => (
          <div
            key={index}
            className="aspect-square relative group overflow-hidden rounded-lg border border-gray-200 cursor-pointer"
            onClick={() => handleThumbnailClick(index)}
          >
            <Image
              src={image.url || image}
              alt={`Gallery image ${index + 1}`}
              fill
              sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 20vw"
              className="object-cover transition-transform group-hover:scale-110"
            />
            {index === 0 && (
              <div className="absolute top-1 left-1 z-10 bg-violet-500 text-white text-xs px-2 py-0.5 rounded">
                Main
              </div>
            )}

            {!readOnly && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveImage && onRemoveImage(index);
                }}
                className="absolute top-1 right-1 z-10 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Remove image"
              >
                <FiTrash2 size={12} />
              </button>
            )}
          </div>
        ))}

        {/* Add image button (shown if not read-only and under limit) */}
        {!readOnly && images.length < maxImages && (
          <div
            onClick={onAddImages}
            className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <FiPlus size={24} className="text-gray-400 mb-2" />
            <span className="text-xs text-gray-500">Add Image</span>
          </div>
        )}
      </div>

      {/* Full-screen preview modal */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closePreview}
          >
            <button
              className="absolute top-4 right-4 text-white bg-black/40 rounded-full p-2 hover:bg-black/60 transition-colors"
              onClick={closePreview}
            >
              <FiX size={24} />
            </button>

            {/* Navigation buttons */}
            {images.length > 1 && (
              <>
                <button
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 transition-colors text-white p-3 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>

                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 transition-colors text-white p-3 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </>
            )}

            {/* Main image */}
            <motion.div
              className="relative max-w-[90%] max-h-[90%] select-none"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={
                  images[currentImageIndex]?.url || images[currentImageIndex]
                }
                alt={`Gallery preview image ${currentImageIndex + 1}`}
                width={1200}
                height={800}
                className="max-w-full max-h-[90vh] rounded-lg object-contain"
                priority
              />

              {/* Image counter */}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                <div className="bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                  {currentImageIndex + 1} / {images.length}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProductGallery;
