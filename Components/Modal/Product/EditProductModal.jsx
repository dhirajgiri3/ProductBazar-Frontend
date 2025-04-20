"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useProduct } from "../../../Contexts/Product/ProductContext";
import { useAuth } from "../../../Contexts/Auth/AuthContext";
import { useCategories } from "../../../Contexts/Category/CategoryContext";
import { toast } from "react-hot-toast";
// Removed unused import
import { FiX, FiImage, FiLink, FiTag, FiDollarSign, FiEdit, FiInfo, FiCheck, FiUpload, FiTrash2 } from "react-icons/fi";
import { uploadProductGalleryImages, deleteProductGalleryImage } from "../../../services/productService";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Tooltip } from "react-tooltip";

// Dynamically import the rich text editor to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";

const EditProductModal = ({ isOpen, onClose, product }) => {
  const { updateProduct, error, clearError } = useProduct();
  const { } = useAuth(); // Keep the import for future use
  const { categories, loading: categoriesLoading, fetchCategories } = useCategories();
  const [activeTab, setActiveTab] = useState("basic");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const fileInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false); // Used in the UI
  const [validationErrors, setValidationErrors] = useState({});

  // Main form state
  const [formData, setFormData] = useState({
    name: product?.name || "", // Will be read-only
    tagline: "",
    description: "",
    category: "",
    status: "Published",
    thumbnail: null,
    pricingType: "free",
    pricingAmount: 0,
    pricingCurrency: "USD",
    tags: [],
    links: {
      website: "",
      github: "",
      demo: "",
      appStore: "",
      playStore: ""
    },
    gallery: []
  });

  // Removed unused ariaLabels object

  // Reset form when closing modal
  useEffect(() => {
    if (!isOpen) {
      clearError();
      setTimeout(() => {
        setValidationErrors({});
      }, 300);
    }
  }, [isOpen, clearError]);

  // Initialize form data when product changes
  useEffect(() => {
    if (product && isOpen) {
      setFormData({
        name: product.name || "",
        tagline: product.tagline || "",
        description: product.description || "",
        category: product.category || "",
        status: product.status || "Published",
        thumbnail: null, // Keep as null - we'll use the existing URL
        pricingType: product.pricing?.type || "free",
        pricingAmount: product.pricing?.amount || 0,
        pricingCurrency: product.pricing?.currency || "USD",
        tags: product.tags || [],
        links: {
          website: product.links?.website || "",
          github: product.links?.github || "",
          demo: product.links?.demo || "",
          appStore: product.links?.appStore || "",
          playStore: product.links?.playStore || ""
        },
        gallery: []
      });

      setThumbnailPreview(product.thumbnail);

      if (product.gallery && Array.isArray(product.gallery)) {
        setGalleryPreviews(product.gallery.map(item => ({
          id: item._id,
          url: item.url,
          isExisting: true
        })));
      } else {
        setGalleryPreviews([]);
      }

      setHasUnsavedChanges(false);
    }
  }, [product, isOpen]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name.startsWith("links.")) {
      const linkType = name.split(".")[1];
      setFormData(prev => ({
        ...prev,
        links: { ...prev.links, [linkType]: value }
      }));
    } else if (name === "tags") {
      // Handle comma-separated tags input
      const tagsArray = value.split(",").map(tag => tag.trim()).filter(tag => tag);
      setFormData(prev => ({ ...prev, tags: tagsArray }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    setHasUnsavedChanges(true);

    // Clear validation error for this field if it exists
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle rich text editor changes
  const handleDescriptionChange = (content) => {
    setFormData(prev => ({ ...prev, description: content }));
    setHasUnsavedChanges(true);

    if (validationErrors.description) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.description;
        return newErrors;
      });
    }
  };

  // Handle thumbnail upload
  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size and type
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file");
      return;
    }

    setFormData(prev => ({ ...prev, thumbnail: file }));

    // Create a preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setThumbnailPreview(reader.result);
    };
    reader.readAsDataURL(file);

    setHasUnsavedChanges(true);
  };

  // Handle gallery images upload
  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    // Validate total count
    if (galleryPreviews.length + files.length > 10) {
      toast.error("Maximum 10 gallery images allowed");
      return;
    }

    // Process each file
    const newPreviews = [];
    const newGalleryFiles = [];

    files.forEach(file => {
      // Validate file size and type
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 5MB)`);
        return;
      }

      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not a valid image file`);
        return;
      }

      newGalleryFiles.push(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push({
          id: `new-${Date.now()}-${newPreviews.length}`,
          url: reader.result,
          file: file,
          isExisting: false
        });

        if (newPreviews.length === files.length) {
          setGalleryPreviews(prev => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });

    setFormData(prev => ({
      ...prev,
      gallery: [...prev.gallery, ...newGalleryFiles]
    }));

    setHasUnsavedChanges(true);
  };

  // Remove a gallery image
  const removeGalleryImage = async (indexToRemove) => {
    const imageToRemove = galleryPreviews[indexToRemove];

    // If it's an existing image from the server, delete it via API
    if (imageToRemove.isExisting && product?.slug) {
      try {
        await deleteProductGalleryImage(product.slug, imageToRemove.id);
        toast.success("Gallery image removed");
      } catch (error) {
        toast.error("Failed to remove gallery image");
        return;
      }
    }

    // Update the previews
    setGalleryPreviews(prev => prev.filter((_, index) => index !== indexToRemove));

    // Update the form data for new uploads
    if (!imageToRemove.isExisting) {
      setFormData(prev => ({
        ...prev,
        gallery: prev.gallery.filter((_, index) => index !== indexToRemove)
      }));
    }

    setHasUnsavedChanges(true);
  };

  // Form validation
  const validateForm = () => {
    const errors = {};

    // Remove name validation since it's read-only now
    if (!formData.description || formData.description.trim().length < 10) {
      errors.description = "Description must be at least 10 characters";
    }

    if (!formData.category) {
      errors.category = "Please select a category";
    }

    if (formData.pricingType === "paid") {
      if (!formData.pricingAmount || parseFloat(formData.pricingAmount) <= 0) {
        errors.pricingAmount = "Please enter a valid price amount";
      }
    }

    // Validate URLs
    Object.entries(formData.links).forEach(([key, value]) => {
      if (value && !value.match(/^(https?:\/\/)?.+\..+/)) {
        errors[`links.${key}`] = "Please enter a valid URL";
      }
    });

    // Check if we have a thumbnail (either new or existing)
    if (!formData.thumbnail && !thumbnailPreview) {
      errors.thumbnail = "Product thumbnail is required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit the form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the form errors");
      return;
    }

    setSubmitting(true);

    try {
      // Create formatted data for API
      const productData = {
        ...formData,
        // Important: Convert links object to string to avoid JSON parsing issues
        links: JSON.stringify(formData.links),
        pricing: {
          type: formData.pricingType,
          amount: formData.pricingType === 'paid' ? parseFloat(formData.pricingAmount) : 0,
          currency: formData.pricingCurrency
        }
      };

      const result = await updateProduct(product.slug, productData);

      if (result.success) {
        // Get the updated product data
        const updatedProduct = result.data || result.product;

        if (formData.gallery.length > 0 && product.slug) {
          try {
            await uploadProductGalleryImages(product.slug, formData.gallery);
            toast.success("Product and gallery updated successfully");
          } catch (galleryError) {
            console.error("Error uploading gallery:", galleryError);
            toast.error("Product updated but gallery upload failed");
          }
        } else {
          toast.success("Product updated successfully");
        }

        setHasUnsavedChanges(false);

        // Pass the updated product to the parent component for immediate UI update
        // Make sure to include all the necessary fields for the UI update
        const productForUI = {
          ...updatedProduct,
          _id: updatedProduct._id || product._id,
          slug: updatedProduct.slug || product.slug,
          name: updatedProduct.name || product.name,
          tagline: formData.tagline,
          status: formData.status,
          category: formData.category,
          thumbnail: thumbnailPreview || product.thumbnail,
          gallery: galleryPreviews.map(preview => ({ url: preview.url, _id: preview.id })),
          updatedAt: new Date().toISOString()
        };

        onClose(productForUI);
      } else {
        toast.error(result.message || "Failed to update product");
      }
    } catch (err) {
      console.error("Error updating product:", err);
      toast.error("Failed to update product");
    } finally {
      setSubmitting(false);
    }
  };

  // Modal animation variants
  const modalVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        type: "spring",
        damping: 25,
        stiffness: 300
      }
    },
    exit: {
      opacity: 0,
      y: 20,
      scale: 0.95,
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    }
  };

  // Overlay animation variants
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.15 } }
  };

  // Header animation variants
  const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        delay: 0.1,
        ease: "easeOut"
      }
    }
  };

  // Tab content animation variants
  const tabContentVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: 10, transition: { duration: 0.2 } }
  };

  // Content animation variants
  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        delay: 0.2
      }
    }
  };

  // Tab configuration
  const tabs = [
    { id: "basic", label: "Basic Info", icon: FiEdit },
    { id: "media", label: "Media & Gallery", icon: FiImage },
    { id: "pricing", label: "Pricing", icon: FiDollarSign },
    { id: "links", label: "Links", icon: FiLink },
    { id: "tags", label: "Tags", icon: FiTag }
  ];

  // Rich text editor modules and formats
  const editorModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
      ['link', 'code-block'],
      ['clean']
    ],
  };

  const editorFormats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'code-block'
  ];

  // Fetch categories when modal opens
  useEffect(() => {
    if (isOpen && (!categories || categories.length === 0)) {
      fetchCategories();
    }
  }, [isOpen, categories, fetchCategories]);

  const handleCloseModal = useCallback(() => {
    if (hasUnsavedChanges) {
      const confirmClose = window.confirm(
        "You have unsaved changes. Are you sure you want to close the modal?"
      );
      if (confirmClose) {
        setHasUnsavedChanges(false);
        clearError();
        onClose();
      }
    } else {
      onClose();
    }
  }, [hasUnsavedChanges, clearError, onClose]);

  // Add memoization for handlers that don't need frequent updates
  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId);
  }, []);

  // Removed unused handleGalleryUpload function

  if (!isOpen) return null;

  return (
    <div className="h-full fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-[10px] flex items-center justify-center p-4">
      <Tooltip id="tooltip" className="z-[100]" />
      <AnimatePresence mode="wait">
        <motion.div
          key="edit-product-modal-overlay"
          className="absolute inset-0 bg-gradient-to-br from-black/40 to-black/60 backdrop-blur-[12px]"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={overlayVariants}
          onClick={handleCloseModal}
        />

        <motion.div
          key="edit-product-modal"
          className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden z-10 border border-gray-100 fixed top-[5rem]"
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          style={{
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)"
          }}
        >
          {/* Header */}
          <motion.div
            className="p-6 bg-gradient-to-r from-violet-100/50 to-white border-b border-gray-100 flex justify-between items-center"
            variants={headerVariants}
            initial="hidden"
            animate="visible"
          >
            <div>
              <motion.h2
                className="text-2xl font-bold text-gray-800 flex items-center gap-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                <motion.span
                  className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center shadow-sm"
                  initial={{ scale: 0.8, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.3, duration: 0.4, type: "spring" }}
                >
                  <FiEdit className="w-5 h-5 text-violet-600" />
                </motion.span>
                <span className="bg-gradient-to-r from-violet-700 to-indigo-600 text-transparent bg-clip-text">Edit Product</span>
              </motion.h2>
              <motion.p
                className="text-gray-500 mt-1 ml-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.3 }}
              >
                Update your product details and settings
              </motion.p>
            </div>
            <motion.button
              onClick={handleCloseModal}
              className="text-gray-400 hover:text-violet-600 p-2 rounded-full hover:bg-violet-50 transition-all duration-200"
              aria-label="Close modal"
              whileHover={{ scale: 1.05, rotate: 90 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, rotate: 45 }}
              animate={{ opacity: 1, rotate: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
            >
              <FiX className="w-6 h-6" />
            </motion.button>
          </motion.div>

          {/* Tabs */}
          <motion.div
            className="border-b border-gray-100 px-6 flex overflow-x-auto hide-scrollbar bg-white"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <div className="flex space-x-1 py-2 w-full">
              {tabs.map((tab, index) => (
                <motion.button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`relative flex items-center space-x-1.5 py-2.5 px-4 rounded-md text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? "text-violet-700"
                      : "text-gray-500 hover:text-violet-600"
                  }`}
                  data-tooltip-id="tooltip"
                  data-tooltip-content={tab.label}
                  whileHover={{
                    backgroundColor: activeTab === tab.id ? "rgba(237, 233, 254, 0.4)" : "rgba(237, 233, 254, 0.2)",
                    y: -1
                  }}
                  whileTap={{ y: 0, backgroundColor: "rgba(237, 233, 254, 0.5)" }}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    transition: { delay: 0.1 + (index * 0.05), duration: 0.2 }
                  }}
                >
                  {/* Active tab background */}
                  {activeTab === tab.id && (
                    <motion.div
                      className="absolute inset-0 bg-violet-50/80 rounded-md border border-violet-100/50"
                      layoutId="tabBackground"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}

                  <motion.div
                    className="flex items-center space-x-1.5 relative z-10"
                    animate={activeTab === tab.id ? { scale: 1.02 } : { scale: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? "text-violet-600" : "text-gray-400"}`} />
                    <span className="whitespace-nowrap">{tab.label}</span>

                    {/* Count indicator for future use */}
                    {tab.count !== undefined && (
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-violet-100 text-violet-700' : 'bg-gray-100 text-gray-600'}`}>
                        {tab.count}
                      </span>
                    )}
                  </motion.div>
                </motion.button>
              ))}
            </div>

            {/* Bottom indicator line */}
            <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gray-100">
              <motion.div
                className="absolute bottom-0 h-[2px] bg-gradient-to-r from-violet-500 to-indigo-500"
                layoutId="tabIndicator"
                style={{
                  left: `${(100 / tabs.length) * tabs.findIndex(t => t.id === activeTab)}%`,
                  width: `${100 / tabs.length}%`
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            </div>
          </motion.div>

          {/* Form content */}
          <motion.div
            className="flex-1 overflow-y-auto p-6 bg-gray-50/30"
            variants={contentVariants}
            initial="hidden"
            animate="visible"
          >
            <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl mx-auto">

              <AnimatePresence mode="wait">
                {/* Basic Info Tab */}
                {activeTab === "basic" && (
                  <motion.div
                    key="basic-tab"
                    className="space-y-6 bg-white p-6 rounded-xl shadow-sm border border-gray-100"
                    variants={tabContentVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                  <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
                    <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
                      <FiInfo className="w-4 h-4 text-violet-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-800">Basic Information</h3>
                  </div>

                  <div className="bg-violet-50/50 rounded-lg p-4 border border-violet-100">
                    <label htmlFor="name" className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <span>Product Name</span>
                      <span className="ml-2 text-xs text-violet-500 bg-violet-100 px-2 py-0.5 rounded-full">
                        Read Only
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        readOnly
                        className="w-full px-4 py-3 border border-violet-200 rounded-lg bg-white text-gray-700 cursor-not-allowed"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <span className="text-violet-400">
                          <FiInfo className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-violet-500 italic">
                      Product names cannot be modified after creation to maintain consistency
                    </p>
                  </div>

                  <div>
                    <label htmlFor="tagline" className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <span>Tagline</span>
                      <span className="text-xs text-gray-500">(Recommended)</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="tagline"
                        name="tagline"
                        value={formData.tagline}
                        onChange={handleChange}
                        className="w-full pl-4 pr-16 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-200 hover:border-violet-300"
                        placeholder="A short, catchy description for your product"
                        maxLength={160}
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                        {formData.tagline?.length || 0}/160
                      </div>
                    </div>
                    <p className="mt-1.5 text-xs text-gray-500">
                      A concise tagline helps users quickly understand your product's value
                    </p>
                  </div>

                  <div>
                    <label htmlFor="description" className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <span>Description</span>
                      <span className="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded-full">Required</span>
                    </label>
                    <div className="rich-text-editor-container">
                      <style jsx global>{`
                        .rich-text-editor-container .quill {
                          border-radius: 0.5rem;
                          overflow: hidden;
                          transition: all 0.2s ease;
                          background: white;
                          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
                        }

                        .rich-text-editor-container .ql-toolbar {
                          border-top-left-radius: 0.5rem;
                          border-top-right-radius: 0.5rem;
                          border-color: ${validationErrors.description ? '#ef4444' : '#e5e7eb'};
                          border-width: 1px;
                          background: #f9fafb;
                          padding: 0.75rem;
                        }

                        .rich-text-editor-container .ql-container {
                          border-bottom-left-radius: 0.5rem;
                          border-bottom-right-radius: 0.5rem;
                          border-color: ${validationErrors.description ? '#ef4444' : '#e5e7eb'};
                          border-width: 1px;
                          border-top: none;
                          font-family: inherit;
                          font-size: 1rem;
                        }

                        .rich-text-editor-container .ql-editor {
                          min-height: 18rem;
                          max-height: 24rem;
                          font-size: 1rem;
                          line-height: 1.5;
                          padding: 1rem;
                        }

                        .rich-text-editor-container .ql-editor p {
                          margin-bottom: 0.75rem;
                        }

                        .rich-text-editor-container .ql-snow .ql-tooltip {
                          border-radius: 0.375rem;
                          border: none;
                          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                        }

                        .rich-text-editor-container .ql-snow .ql-picker {
                          font-size: 0.875rem;
                        }

                        .rich-text-editor-container .ql-snow .ql-stroke {
                          stroke: #6b7280;
                        }

                        .rich-text-editor-container .ql-snow .ql-fill {
                          fill: #6b7280;
                        }

                        .rich-text-editor-container .ql-snow.ql-toolbar button:hover,
                        .rich-text-editor-container .ql-snow .ql-toolbar button:hover,
                        .rich-text-editor-container .ql-snow.ql-toolbar button.ql-active,
                        .rich-text-editor-container .ql-snow .ql-toolbar button.ql-active,
                        .rich-text-editor-container .ql-snow.ql-toolbar .ql-picker-label:hover,
                        .rich-text-editor-container .ql-snow .ql-toolbar .ql-picker-label:hover,
                        .rich-text-editor-container .ql-snow.ql-toolbar .ql-picker-label.ql-active,
                        .rich-text-editor-container .ql-snow .ql-toolbar .ql-picker-label.ql-active,
                        .rich-text-editor-container .ql-snow.ql-toolbar .ql-picker-item:hover,
                        .rich-text-editor-container .ql-snow .ql-toolbar .ql-picker-item:hover,
                        .rich-text-editor-container .ql-snow.ql-toolbar .ql-picker-item.ql-selected,
                        .rich-text-editor-container .ql-snow .ql-toolbar .ql-picker-item.ql-selected {
                          color: #8b5cf6;
                        }

                        .rich-text-editor-container .ql-snow.ql-toolbar button:hover .ql-stroke,
                        .rich-text-editor-container .ql-snow .ql-toolbar button:hover .ql-stroke,
                        .rich-text-editor-container .ql-snow.ql-toolbar button.ql-active .ql-stroke,
                        .rich-text-editor-container .ql-snow .ql-toolbar button.ql-active .ql-stroke,
                        .rich-text-editor-container .ql-snow.ql-toolbar .ql-picker-label:hover .ql-stroke,
                        .rich-text-editor-container .ql-snow .ql-toolbar .ql-picker-label:hover .ql-stroke,
                        .rich-text-editor-container .ql-snow.ql-toolbar .ql-picker-label.ql-active .ql-stroke,
                        .rich-text-editor-container .ql-snow .ql-toolbar .ql-picker-label.ql-active .ql-stroke,
                        .rich-text-editor-container .ql-snow.ql-toolbar .ql-picker-item:hover .ql-stroke,
                        .rich-text-editor-container .ql-snow .ql-toolbar .ql-picker-item:hover .ql-stroke,
                        .rich-text-editor-container .ql-snow.ql-toolbar .ql-picker-item.ql-selected .ql-stroke,
                        .rich-text-editor-container .ql-snow .ql-toolbar .ql-picker-item.ql-selected .ql-stroke {
                          stroke: #8b5cf6;
                        }

                        .rich-text-editor-container .ql-snow.ql-toolbar button:hover .ql-fill,
                        .rich-text-editor-container .ql-snow .ql-toolbar button:hover .ql-fill,
                        .rich-text-editor-container .ql-snow.ql-toolbar button.ql-active .ql-fill,
                        .rich-text-editor-container .ql-snow .ql-toolbar button.ql-active .ql-fill,
                        .rich-text-editor-container .ql-snow.ql-toolbar .ql-picker-label:hover .ql-fill,
                        .rich-text-editor-container .ql-snow .ql-toolbar .ql-picker-label:hover .ql-fill,
                        .rich-text-editor-container .ql-snow.ql-toolbar .ql-picker-label.ql-active .ql-fill,
                        .rich-text-editor-container .ql-snow .ql-toolbar .ql-picker-label.ql-active .ql-fill,
                        .rich-text-editor-container .ql-snow.ql-toolbar .ql-picker-item:hover .ql-fill,
                        .rich-text-editor-container .ql-snow .ql-toolbar .ql-picker-item:hover .ql-fill,
                        .rich-text-editor-container .ql-snow.ql-toolbar .ql-picker-item.ql-selected .ql-fill,
                        .rich-text-editor-container .ql-snow .ql-toolbar .ql-picker-item.ql-selected .ql-fill {
                          fill: #8b5cf6;
                        }
                      `}</style>
                      <ReactQuill
                        theme="snow"
                        value={formData.description}
                        onChange={handleDescriptionChange}
                        modules={editorModules}
                        formats={editorFormats}
                        placeholder="Describe your product in detail..."
                      />
                    </div>
                    {validationErrors.description ? (
                      <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                        <FiInfo className="w-4 h-4" />
                        {validationErrors.description}
                      </p>
                    ) : (
                      <p className="mt-1.5 text-xs text-gray-500">
                        Provide a comprehensive description of your product's features and benefits
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="category" className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <span>Category</span>
                        <span className="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded-full">Required</span>
                      </label>
                      <div className="relative">
                        <select
                          id="category"
                          name="category"
                          value={formData.category}
                          onChange={handleChange}
                          className={`w-full pl-4 pr-10 py-3 border rounded-lg appearance-none bg-white transition-all duration-200 hover:border-violet-300 ${validationErrors.category ? "border-red-500 ring-1 ring-red-500" : "border-gray-200 focus:ring-2 focus:ring-violet-500 focus:border-violet-500"}`}
                          disabled={categoriesLoading}
                        >
                          <option value="">Select a category</option>
                          {categories && categories.length > 0 ? (
                            categories.map(category => (
                              <option key={category._id} value={category._id}>
                                {category.name}
                              </option>
                            ))
                          ) : (
                            <option value="" disabled>Loading categories...</option>
                          )}
                        </select>
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                          <FiTag className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                      {validationErrors.category ? (
                        <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                          <FiInfo className="w-4 h-4" />
                          {validationErrors.category}
                        </p>
                      ) : (
                        <p className="mt-1.5 text-xs text-gray-500">
                          Choose the most relevant category
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <div className="relative">
                        <select
                          id="status"
                          name="status"
                          value={formData.status}
                          onChange={handleChange}
                          className="w-full pl-4 pr-10 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 appearance-none bg-white transition-all duration-200 hover:border-violet-300"
                        >
                          <option value="Draft">Draft</option>
                          <option value="Published">Published</option>
                          <option value="Archived">Archived</option>
                        </select>
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                          <FiCheck className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                      <div className="mt-1.5">
                        {formData.status === "Draft" && (
                          <p className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded inline-block">
                            Your product will be saved but not visible to others
                          </p>
                        )}
                        {formData.status === "Published" && (
                          <p className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded inline-block">
                            Your product will be visible to everyone
                          </p>
                        )}
                        {formData.status === "Archived" && (
                          <p className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded inline-block">
                            Your product will be hidden but not deleted
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

                {/* Media Tab */}
                {activeTab === "media" && (
                  <motion.div
                    key="media-tab"
                    className="space-y-8"
                    variants={tabContentVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                  {/* Thumbnail Section */}
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
                      <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
                        <FiImage className="w-4 h-4 text-violet-600" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-800">Product Thumbnail</h3>
                      <span className="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded-full ml-2">Required</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <motion.div
                          className={`border-2 border-dashed rounded-xl p-6 h-56 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${validationErrors.thumbnail ? "border-red-500 bg-red-50/30" : "border-violet-200 hover:border-violet-400 hover:bg-violet-50/30"}`}
                          onClick={() => fileInputRef.current?.click()}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="w-16 h-16 rounded-full bg-violet-100 flex items-center justify-center mb-4">
                            <FiUpload className="w-8 h-8 text-violet-500" />
                          </div>
                          <p className="text-sm font-medium text-gray-700">Click to upload thumbnail</p>
                          <p className="text-xs text-gray-500 mt-2">PNG, JPG, GIF up to 5MB</p>
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleThumbnailChange}
                            className="hidden"
                            accept="image/*"
                          />
                        </motion.div>
                        {validationErrors.thumbnail && (
                          <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                            <FiInfo className="w-4 h-4" />
                            {validationErrors.thumbnail}
                          </p>
                        )}
                      </div>

                      {thumbnailPreview && (
                        <motion.div
                          className="relative h-56 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 shadow-sm"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Image
                            src={thumbnailPreview}
                            alt="Thumbnail preview"
                            className="w-full h-full object-cover"
                            width={300}
                            height={200}
                          />
                          <motion.button
                            type="button"
                            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full shadow-md hover:bg-red-600 transition-colors"
                            onClick={() => {
                              setThumbnailPreview(null);
                              setFormData(prev => ({ ...prev, thumbnail: null }));
                              setHasUnsavedChanges(true);
                            }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </motion.button>
                        </motion.div>
                      )}
                    </div>
                  </div>

                  {/* Gallery Section */}
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
                      <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
                        <FiImage className="w-4 h-4 text-violet-600" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-800">Product Gallery</h3>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full ml-2">Optional</span>
                    </div>

                    <p className="text-sm text-gray-600 mb-4">Add up to 10 images to showcase your product features and details</p>

                    <div className="mb-6">
                      <motion.div
                        className="border-2 border-dashed border-violet-200 rounded-xl p-5 h-36 flex flex-col items-center justify-center cursor-pointer hover:border-violet-400 hover:bg-violet-50/30 transition-all duration-200"
                        onClick={() => galleryInputRef.current?.click()}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center mb-3">
                          <FiUpload className="w-6 h-6 text-violet-500" />
                        </div>
                        <p className="text-sm font-medium text-gray-700">Click to upload gallery images</p>
                        <p className="text-xs text-gray-500 mt-1">You can select multiple images</p>
                        <input
                          type="file"
                          ref={galleryInputRef}
                          onChange={handleGalleryChange}
                          className="hidden"
                          accept="image/*"
                          multiple
                        />
                      </motion.div>
                    </div>

                    {galleryPreviews.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {galleryPreviews.map((preview, index) => (
                          <motion.div
                            key={preview.id || index}
                            className="relative bg-gray-50 rounded-lg overflow-hidden aspect-square border border-gray-100 shadow-sm group"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            whileHover={{ y: -2, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                          >
                            <Image
                              src={preview.url}
                              alt={`Gallery image ${index + 1}`}
                              className="w-full h-full object-cover"
                              width={150}
                              height={150}
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                              <motion.button
                                type="button"
                                className="bg-red-500 text-white p-2 rounded-full shadow-md hover:bg-red-600 transition-colors"
                                onClick={() => removeGalleryImage(index)}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </motion.button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-gray-50/50 rounded-lg border border-dashed border-gray-200">
                        <FiImage className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-400">No gallery images yet</p>
                        <p className="text-xs text-gray-400 mt-1">Upload images to showcase your product</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

                {/* Pricing Tab */}
                {activeTab === "pricing" && (
                  <motion.div
                    key="pricing-tab"
                    className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
                    variants={tabContentVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                  <div className="flex items-center gap-2 mb-6 pb-2 border-b border-gray-100">
                    <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
                      <FiDollarSign className="w-4 h-4 text-violet-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-800">Pricing Options</h3>
                  </div>

                  <div className="space-y-8">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-3 block">
                        Pricing Type
                      </label>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {["free", "paid", "contact"].map(type => (
                          <motion.div
                            key={type}
                            className={`border-2 rounded-xl p-5 cursor-pointer transition-all duration-200 ${formData.pricingType === type ? "border-violet-500 bg-violet-50/70" : "border-gray-100 hover:border-violet-200 hover:bg-violet-50/30"}`}
                            onClick={() => {
                              setFormData(prev => ({ ...prev, pricingType: type }));
                              setHasUnsavedChanges(true);
                            }}
                            whileHover={{ y: -2, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
                            whileTap={{ y: 0, boxShadow: "none" }}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <span className="capitalize font-medium text-gray-800">
                                {type}
                              </span>
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${formData.pricingType === type ? "bg-violet-500" : "border-2 border-gray-300"}`}>
                                {formData.pricingType === type && (
                                  <FiCheck className="w-3 h-3 text-white" />
                                )}
                              </div>
                            </div>

                            <div className={`text-sm ${formData.pricingType === type ? "text-violet-700" : "text-gray-500"}`}>
                              {type === "free" && "Your product is available for free"}
                              {type === "paid" && "Your product has a specific price"}
                              {type === "contact" && "Users need to contact you for pricing"}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {formData.pricingType === "paid" && (
                      <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-violet-50/30 p-5 rounded-xl border border-violet-100"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        transition={{ duration: 0.3 }}
                      >
                        <div>
                          <label htmlFor="pricingAmount" className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                            <span>Price Amount</span>
                            <span className="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded-full">Required</span>
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                              <span className="text-gray-500 font-medium">
                                {formData.pricingCurrency === "USD" && "$"}
                                {formData.pricingCurrency === "EUR" && "€"}
                                {formData.pricingCurrency === "GBP" && "£"}
                              </span>
                            </div>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              id="pricingAmount"
                              name="pricingAmount"
                              value={formData.pricingAmount}
                              onChange={handleChange}
                              className={`w-full pl-10 pr-4 py-3 border rounded-lg transition-all duration-200 hover:border-violet-300 ${validationErrors.pricingAmount ? "border-red-500 ring-1 ring-red-500" : "border-gray-200 focus:ring-2 focus:ring-violet-500 focus:border-violet-500"}`}
                              placeholder="0.00"
                            />
                          </div>
                          {validationErrors.pricingAmount ? (
                            <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                              <FiInfo className="w-4 h-4" />
                              {validationErrors.pricingAmount}
                            </p>
                          ) : (
                            <p className="mt-1.5 text-xs text-gray-500">
                              Enter the price for your product
                            </p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="pricingCurrency" className="text-sm font-medium text-gray-700 mb-2 block">
                            Currency
                          </label>
                          <div className="relative">
                            <select
                              id="pricingCurrency"
                              name="pricingCurrency"
                              value={formData.pricingCurrency}
                              onChange={handleChange}
                              className="w-full pl-4 pr-10 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 appearance-none bg-white transition-all duration-200 hover:border-violet-300"
                            >
                              <option value="USD">USD ($)</option>
                              <option value="EUR">EUR (€)</option>
                              <option value="GBP">GBP (£)</option>
                            </select>
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                              <FiDollarSign className="w-4 h-4 text-gray-400" />
                            </div>
                          </div>
                          <p className="mt-1.5 text-xs text-gray-500">
                            Select the currency for your product
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}

                {/* Links Tab */}
                {activeTab === "links" && (
                  <motion.div
                    key="links-tab"
                    className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
                    variants={tabContentVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                  <div className="flex items-center gap-2 mb-6 pb-2 border-b border-gray-100">
                    <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
                      <FiLink className="w-4 h-4 text-violet-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-800">Product Links</h3>
                  </div>

                  <div className="space-y-6">
                    <p className="text-sm text-gray-600 bg-gray-50/70 p-3 rounded-lg border border-gray-100">
                      Add relevant links to your product. These will be displayed on your product page and help users find more information.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                      {Object.entries({
                        website: { label: "Website URL", icon: FiLink },
                        github: { label: "GitHub Repository", icon: FiLink },
                        demo: { label: "Demo / Live Version", icon: FiLink },
                        appStore: { label: "App Store Link", icon: FiLink },
                        playStore: { label: "Play Store Link", icon: FiLink }
                      }).map(([key, { label, icon: Icon }]) => (
                        <div key={key}>
                          <label htmlFor={`links.${key}`} className="text-sm font-medium text-gray-700 mb-1.5 block">
                            {label}
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Icon className="w-4 h-4 text-gray-400" />
                            </div>
                            <input
                              type="url"
                              id={`links.${key}`}
                              name={`links.${key}`}
                              value={formData.links[key]}
                              onChange={handleChange}
                              className={`w-full pl-10 pr-4 py-3 border rounded-lg transition-all duration-200 hover:border-violet-300 ${validationErrors[`links.${key}`] ? "border-red-500 ring-1 ring-red-500" : "border-gray-200 focus:ring-2 focus:ring-violet-500 focus:border-violet-500"}`}
                              placeholder={`Enter ${label.toLowerCase()}`}
                            />
                          </div>
                          {validationErrors[`links.${key}`] ? (
                            <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                              <FiInfo className="w-4 h-4" />
                              {validationErrors[`links.${key}`]}
                            </p>
                          ) : (
                            <p className="mt-1 text-xs text-gray-500">
                              {key === "website" && "Your product's official website"}
                              {key === "github" && "Source code repository"}
                              {key === "demo" && "Live demo or preview"}
                              {key === "appStore" && "iOS App Store link"}
                              {key === "playStore" && "Google Play Store link"}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

                {/* Tags Tab */}
                {activeTab === "tags" && (
                  <motion.div
                    key="tags-tab"
                    className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
                    variants={tabContentVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                  <div className="flex items-center gap-2 mb-6 pb-2 border-b border-gray-100">
                    <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
                      <FiTag className="w-4 h-4 text-violet-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-800">Product Tags</h3>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label htmlFor="tags" className="text-sm font-medium text-gray-700 mb-2 block">
                        Tags (comma separated)
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiTag className="w-4 h-4 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          id="tags"
                          name="tags"
                          value={formData.tags.join(', ')}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-200 hover:border-violet-300"
                          placeholder="e.g. productivity, ai, tool, design"
                        />
                      </div>
                      <p className="mt-3 text-sm text-gray-600 bg-gray-50/70 p-2 rounded-lg border border-gray-100">
                        Add up to 10 tags to categorize your product. Tags help users discover your product when searching or browsing by category.
                      </p>
                    </div>

                    {formData.tags.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Your tags:</h4>
                        <div className="flex flex-wrap gap-2">
                          {formData.tags.map((tag, index) => (
                            <motion.span
                              key={index}
                              className="bg-violet-100 text-violet-800 px-3 py-1.5 rounded-full text-sm flex items-center gap-1 border border-violet-200"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.2, delay: index * 0.05 }}
                              whileHover={{ y: -1, boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}
                            >
                              <FiTag className="w-3 h-3" />
                              {tag}
                            </motion.span>
                          ))}
                        </div>
                      </div>
                    )}

                    {formData.tags.length === 0 && (
                      <div className="text-center py-6 bg-gray-50/50 rounded-lg border border-dashed border-gray-200">
                        <FiTag className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-400">No tags added yet</p>
                        <p className="text-xs text-gray-400 mt-1">Add tags to help users discover your product</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
              </AnimatePresence>
            </form>
          </motion.div>

          {/* Footer */}
          <motion.div
            className="p-6 border-t border-gray-100 bg-gradient-to-r from-white to-violet-50/30 flex justify-between items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <div className="flex text-sm">
              <AnimatePresence mode="wait">
                {hasUnsavedChanges && (
                  <motion.span
                    key="unsaved-changes"
                    className="text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100 flex items-center gap-1 shadow-sm"
                    initial={{ opacity: 0, scale: 0.8, x: -10 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.8, x: -10 }}
                    transition={{ duration: 0.3, type: "spring" }}
                  >
                    <FiInfo className="w-4 h-4" />
                    You have unsaved changes
                  </motion.span>
                )}
                {error && (
                  <motion.span
                    key="error-message"
                    className="text-red-600 bg-red-50 px-3 py-1.5 rounded-full border border-red-100 flex items-center gap-1 shadow-sm"
                    initial={{ opacity: 0, scale: 0.8, x: -10 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.8, x: -10 }}
                    transition={{ duration: 0.3, type: "spring" }}
                  >
                    <FiInfo className="w-4 h-4" />
                    {error}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
            <div className="flex space-x-4">
              <motion.button
                type="button"
                onClick={handleCloseModal}
                className="px-5 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow font-medium"
                disabled={submitting}
                whileHover={{ y: -2, backgroundColor: "#f9fafb" }}
                whileTap={{ y: 0, scale: 0.98 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.2 }}
              >
                Cancel
              </motion.button>
              <motion.button
                type="button"
                onClick={handleSubmit}
                className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-violet-700 text-white rounded-lg hover:from-violet-700 hover:to-violet-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm hover:shadow font-medium"
                disabled={submitting || (!hasUnsavedChanges && !error)}
                whileHover={{ y: -2, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)" }}
                whileTap={{ y: 0, scale: 0.98 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.2 }}
              >
                {submitting ? (
                  <>
                    <motion.svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </motion.svg>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <motion.div
                      initial={{ rotate: -10, scale: 0.9 }}
                      animate={{ rotate: 0, scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <FiCheck className="w-5 h-5" />
                    </motion.div>
                    <span>Save Changes</span>
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default EditProductModal;