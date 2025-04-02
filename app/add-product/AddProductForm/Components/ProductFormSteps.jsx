"use client";

import React, { useState } from "react";
import { 
  Image, Upload, DollarSign, Info, Rocket, 
  AlertCircle, ExternalLink, MousePointer, 
  HelpCircle, Gift, Hash, TextQuote 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Controller } from "react-hook-form";

import {
  FormInput,
  FileUploadArea,
  PricingTypeSelector,
  LinkInput,
  TagsInput,
} from "./FormComponents";

import RichTextEditor from "./RichTextEditor";
import CategorySelector from "./CategorySelector";

const ProductFormSteps = ({
  formStep,
  setFormStep,
  categories = [],
  thumbnail,
  setThumbnail,
  thumbnailError,
  setThumbnailError,
  pricingType,
  setPricingType,
  pricingTypeError,
  setPricingTypeError,
  price,
  setPrice,
  priceError,
  setPriceError,
  links,
  setLinks,
  tags,
  setTags,
  register,
  control,
  errors,
  watch,
  handleNextStep,
  handleBack,
}) => {
  const watchCategory = watch("category");
  
  // Animation variants
  const stepVariants = {
    hidden: { 
      opacity: 0, 
      x: formStep === 1 ? -20 : 20 
    },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { 
        duration: 0.4, 
        ease: "easeOut",
        when: "beforeChildren",
        staggerChildren: 0.1
      } 
    },
    exit: { 
      opacity: 0, 
      x: formStep === 1 ? 20 : -20,
      transition: { 
        duration: 0.3,
        ease: "easeIn" 
      } 
    }
  };
  
  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.3 }
    }
  };

  return (
    <AnimatePresence mode="wait">
      {formStep === 1 && (
        <motion.div
          key="step1"
          variants={stepVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="space-y-6"
        >
          <div className="relative">
            <div className="absolute -left-10 top-0 hidden md:block">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
                  1
                </div>
                <div className="h-full w-0.5 bg-gradient-to-b from-violet-500 to-transparent mt-2 opacity-30"></div>
              </div>
            </div>
            
            <motion.div variants={itemVariants} className="bg-gradient-to-br from-violet-50 to-purple-50 p-6 rounded-lg border border-violet-100 mb-8">
              <h3 className="text-lg font-semibold text-violet-800 mb-2 flex items-center">
                <Rocket size={20} className="mr-2 text-violet-600" />
                Let's add your amazing product!
              </h3>
              <p className="text-violet-700 text-sm">
                Start by providing some basic information about your product. Make it catchy and appealing to attract potential users.
              </p>
            </motion.div>

            <motion.div variants={itemVariants}>
              <FormInput
                label="Product Name"
                name="name"
                register={register}
                errors={errors}
                placeholder="Enter a catchy product name"
                required={true}
                validationRules={{
                  minLength: {
                    value: 3,
                    message: "Product name must be at least 3 characters",
                  },
                  maxLength: {
                    value: 100,
                    message: "Product name cannot exceed 100 characters",
                  },
                }}
                icon={<TextQuote size={18} className="text-violet-400" />}
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <FormInput
                label="Tagline"
                name="tagline"
                register={register}
                errors={errors}
                placeholder="Enter a short, catchy tagline"
                required={true}
                validationRules={{
                  maxLength: {
                    value: 160,
                    message: "Tagline cannot exceed 160 characters",
                  },
                }}
                note="A brief, catchy description of your product (max 160 chars)"
                icon={<Hash size={18} className="text-violet-400" />}
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <Controller
                name="category"
                control={control}
                rules={{ required: "Please select a category" }}
                render={({ field }) => (
                  <CategorySelector
                    categories={categories}
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.category?.message}
                    required={true}
                    note="Choose the category that best fits your product"
                  />
                )}
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <FileUploadArea
                label="Product Image"
                image={thumbnail}
                onChange={(file) => {
                  setThumbnail(file);
                  setThumbnailError(null);
                }}
                onRemove={() => {
                  setThumbnail(null);
                  setThumbnailError(null);
                }}
                required={true}
                error={thumbnailError}
                note="Upload a clean, high-quality image that represents your product"
              />
            </motion.div>
          </div>

          <div className="flex justify-end mt-8">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handleNextStep}
              className="inline-flex items-center px-6 py-3 border border-transparent rounded-lg text-base font-medium text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-all duration-300"
            >
              Continue
              <svg
                className="ml-2 -mr-1 h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </motion.button>
          </div>
        </motion.div>
      )}

      {formStep === 2 && (
        <motion.div
          key="step2"
          variants={stepVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="space-y-6"
        >
          <div className="relative">
            <div className="absolute -left-10 top-0 hidden md:block">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
                  2
                </div>
                <div className="h-full w-0.5 bg-gradient-to-b from-violet-500 to-transparent mt-2 opacity-30"></div>
              </div>
            </div>
            
            <motion.div variants={itemVariants} className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-lg border border-indigo-100 mb-8">
              <h3 className="text-lg font-semibold text-indigo-800 mb-2 flex items-center">
                <HelpCircle size={20} className="mr-2 text-indigo-600" />
                Tell us more about your product
              </h3>
              <p className="text-indigo-700 text-sm">
                Now, let's add more details that will help users understand what makes your product special.
              </p>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Controller
                name="description"
                control={control}
                rules={{ 
                  required: "Product description is required",
                  validate: value => 
                    value.replace(/<(.|\n)*?>/g, '').trim().length >= 30 || 
                    "Description must be at least 30 characters" 
                }}
                render={({ field: { onChange, value } }) => (
                  <RichTextEditor
                    label="Description"
                    value={value}
                    onChange={onChange}
                    error={errors.description?.message}
                    required={true}
                    note="Describe your product in detail, highlighting its features and benefits"
                  />
                )}
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <PricingTypeSelector
                value={pricingType}
                onChange={(value) => {
                  setPricingType(value);
                  setPricingTypeError(null);
                  if (value !== "one_time" && value !== "subscription") {
                    setPrice("");
                    setPriceError(null);
                  }
                }}
                error={pricingTypeError}
              />
            </motion.div>

            <AnimatePresence>
              {(pricingType === "one_time" || pricingType === "subscription") && (
                <motion.div
                  variants={itemVariants}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="bg-violet-50 p-4 rounded-lg mb-6">
                    <FormInput
                      label={pricingType === "one_time" ? "Price (USD)" : "Subscription Price (USD)"}
                      name="price"
                      register={null}
                      errors={{price: {message: priceError}}}
                      required={true}
                      type="number"
                      placeholder="0.00"
                      icon={<DollarSign size={18} className="text-violet-500" />}
                    >
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <DollarSign size={18} className="text-violet-500" />
                        </div>
                        <input
                          type="number"
                          className={`w-full pl-10 py-3 bg-white border rounded-lg shadow-sm placeholder-gray-400
                            focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 
                            transition-all duration-200 
                            ${priceError ? "border-red-300" : "border-gray-300"}`}
                          placeholder="0.00"
                          step="0.01"
                          min="0"
                          value={price}
                          onChange={(e) => {
                            setPrice(e.target.value);
                            setPriceError(null);
                          }}
                        />
                      </div>
                    </FormInput>
                    <div className="text-sm text-violet-700 flex items-start mt-2">
                      <Info size={14} className="mr-2 mt-0.5 flex-shrink-0" />
                      <span>
                        {pricingType === "one_time"
                          ? "Set a one-time purchase price for your product"
                          : "Set a recurring subscription price for your product"}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div variants={itemVariants}>
              <TagsInput
                tags={tags}
                setTags={setTags}
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <LinkInput
                links={links}
                setLinks={setLinks}
              />
            </motion.div>
          </div>

          <div className="flex justify-between mt-8">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handleBack}
              className="inline-flex items-center px-5 py-3 border border-gray-300 rounded-lg text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 shadow-sm transition-colors duration-200"
            >
              <svg
                className="mr-2 -ml-1 h-5 w-5 text-gray-500"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Back
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handleNextStep}
              className="inline-flex items-center px-6 py-3 border border-transparent rounded-lg text-base font-medium text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-all duration-200"
            >
              Continue to Review
              <svg
                className="ml-2 -mr-1 h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProductFormSteps;
