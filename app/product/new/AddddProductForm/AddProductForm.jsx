"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import confetti from "canvas-confetti";
import { ArrowLeft, ArrowRight, Check, Rocket, Sparkles } from "lucide-react";
import { useProduct } from "../../../../Contexts/Product/ProductContext";
import { useCategories } from "../../../../Contexts/Category/CategoryContext";
import { useAuth } from "../../../../Contexts/Auth/AuthContext";
import { Balloons } from "../../../../Components/UI/balloons";
import ProgressIndicator from "./Components/ProgressIndicator";
import ProductFormSteps from "./Components/ProductFormSteps";
import ReviewSection from "./Components/ReviewSection";

// Confetti animation helper
const triggerConfetti = () => {
  const duration = 3000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

  const randomInRange = (min, max) => Math.random() * (max - min) + min;

  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now();
    if (timeLeft <= 0) {
      clearInterval(interval);
      return;
    }
    const particleCount = 50 * (timeLeft / duration);
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.9), y: randomInRange(0.1, 0.3) },
      colors: ["#8B5CF6", "#C4B5FD", "#6D28D9", "#DDD6FE", "#A78BFA"],
    });
  }, 250);
};

const AddProductForm = () => {
  const router = useRouter();
  const balloonsRef = useRef(null);
  const { createProduct, validateProductUrl } = useProduct();
  const { categories, isLoading: categoriesLoading } = useCategories();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  // Form state
  const [formStep, setFormStep] = useState(1);
  const [formComplete, setFormComplete] = useState(false);
  const [createdProductSlug, setCreatedProductSlug] = useState(null);
  const [validationTriggered, setValidationTriggered] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Product data state
  const [urlStatus, setUrlStatus] = useState(null); // null, 'validating', 'valid', 'invalid'
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailError, setThumbnailError] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [tags, setTags] = useState([]);
  const [links, setLinks] = useState({});
  const [pricingType, setPricingType] = useState("free");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [discounted, setDiscounted] = useState(false);
  const [originalAmount, setOriginalAmount] = useState("");

  // Form setup with react-hook-form
  const {
    register,
    handleSubmit,
    control,
    watch,
    trigger,
    formState: { errors, isValid },
    setValue,
    getValues,
  } = useForm({
    defaultValues: {
      name: "",
      tagline: "",
      description: "",
      category: "",
      productUrl: "",
    },
    mode: "onChange",
  });

  // Watch values for preview
  const watchName = watch("name");
  const watchTagline = watch("tagline");
  const watchCategory = watch("category");
  const watchDescription = watch("description");

  // Handle URL validation
  const handleUrlValidation = async (url) => {
    if (!url) return;
    
    setUrlStatus("validating");
    const result = await validateProductUrl(url);
    
    if (result) {
      setUrlStatus("valid");
      setValue("name", result.title || "");
      setValue("tagline", result.description?.substring(0, 100) || "");
      setValue("description", result.description || "");
      
      if (result.images?.length > 0 && !thumbnail) {
        setThumbnail(result.images[0]);
      }
      
      setLinks((prev) => ({ ...prev, website: result.url }));
      toast.success("URL validated successfully! Form fields have been pre-filled.");
    } else {
      setUrlStatus("invalid");
      toast.error("We couldn't validate this URL. Please check it and try again.");
    }
  };

  // Handle next step navigation
  const handleNextStep = async () => {
    // Validate current step fields
    let isStepValid = true;
    
    if (formStep === 1) {
      setValidationTriggered(true);
      isStepValid = await trigger(["name", "tagline", "category"]);
      
      if (!thumbnail) {
        setThumbnailError("Product image is required");
        isStepValid = false;
      }
    }
    
    if (!isStepValid) {
      toast.error("Please complete all required fields", {
        icon: '⚠️',
      });
      return;
    }
    
    // Proceed to next step
    setFormStep((prev) => Math.min(prev + 1, 3));
    
    // Scroll to top when changing steps
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle step back navigation
  const handleBack = () => {
    setFormStep((prev) => Math.max(prev - 1, 1));
    // Scroll to top when changing steps
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Form submission handler
  const handleFormSubmit = async () => {
    if (submitting) return;
    
    setSubmitting(true);
    
    const formData = getValues();
    
    const productData = {
      productUrl: formData.productUrl,
      name: formData.name,
      tagline: formData.tagline,
      description: formData.description,
      category: formData.category,
      thumbnail,
      galleryImages,
      tags,
      links,
      pricing: {
        type: pricingType,
        amount: price ? parseFloat(price) : 0,
        currency,
        discounted,
        originalAmount: discounted ? parseFloat(originalAmount) : undefined
      }
    };

    try {
      const result = await createProduct(productData);
      
      if (result && result._id) {
        // Trigger success animations
        triggerConfetti();
        if (balloonsRef.current) {
          balloonsRef.current.launchAnimation();
        }
        
        setCreatedProductSlug(result.slug);
        setFormComplete(true);
        toast.success("Your product has been launched successfully! 🚀");
      }
    } catch (error) {
      console.error("Error submitting product:", error);
      toast.error("There was a problem launching your product. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated()) {
      router.push("/auth/login?redirect=/product/new");
      toast.error("Please log in to submit a product");
    }
  }, [isAuthenticated, router, authLoading]);

  // Loading state
  if (authLoading || categoriesLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mb-4"></div>
          <p className="text-violet-700">Loading your product creation experience...</p>
        </div>
      </div>
    );
  }

  // Success state
  if (formComplete) {
    return (
      <motion.div
        className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-gradient-to-r from-violet-600 to-purple-600 h-3"></div>
        
        <div className="px-8 py-16 text-center max-w-2xl mx-auto">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="w-28 h-28 mx-auto bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center mb-8 shadow-lg"
          >
            <Check size={52} className="text-white" />
          </motion.div>
          
          <motion.h2
            className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            Product Successfully Launched!
          </motion.h2>
          
          <motion.p
            className="text-lg text-gray-600 mb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            Your product has been submitted and is now live on Product Bazar. 
            Share it with your network to get valuable feedback and upvotes!
          </motion.p>
          
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
          >
            <motion.button
              onClick={() => router.push(`/product/${createdProductSlug}`)}
              className="px-8 py-3 rounded-lg font-medium text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              View Your Product
            </motion.button>
            
            <motion.button
              onClick={() => router.push('/')}
              className="px-8 py-3 rounded-lg font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Return to Home
            </motion.button>
          </motion.div>
        </div>
        
        {balloonsRef && (
          <Balloons
            ref={balloonsRef}
            type="confetti"
            color="#8B5CF6"
          />
        )}
      </motion.div>
    );
  }

  // Main form UI
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 h-2"></div>

      <div className="p-8 pt-10">
        {/* Progress Bar */}
        <ProgressIndicator step={formStep - 1} totalSteps={3} />

        <AnimatePresence mode="wait">
          {formStep < 3 ? (
            // Step 1 & 2: Form Steps
            <ProductFormSteps
              key="form-steps"
              formStep={formStep}
              setFormStep={setFormStep}
              categories={categories}
              thumbnail={thumbnail}
              setThumbnail={setThumbnail}
              thumbnailError={thumbnailError}
              setThumbnailError={setThumbnailError}
              pricingType={pricingType}
              setPricingType={setPricingType}
              price={price}
              setPrice={setPrice}
              currency={currency}
              setCurrency={setCurrency}
              discounted={discounted}
              setDiscounted={setDiscounted}
              originalAmount={originalAmount}
              setOriginalAmount={setOriginalAmount}
              links={links}
              setLinks={setLinks}
              tags={tags}
              setTags={setTags}
              register={register}
              control={control}
              errors={errors}
              watch={watch}
              handleNextStep={handleNextStep}
              handleBack={handleBack}
            />
          ) : (
            // Step 3: Review & Submit
            <ReviewSection
              key="review-section"
              thumbnail={thumbnail}
              watchName={watchName}
              watchTagline={watchTagline}
              watchCategory={watchCategory}
              categories={categories}
              watchDescription={watchDescription}
              pricingType={pricingType}
              price={price}
              tags={tags}
              links={links}
              submitting={submitting}
              handleBack={handleBack}
              onSubmit={handleFormSubmit}
            />
          )}
        </AnimatePresence>

        {/* URL Validation Section */}
        {formStep === 1 && (
          <motion.div 
            className="mt-8 p-6 bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl border border-violet-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <h3 className="text-lg font-semibold text-violet-800 mb-3 flex items-center">
              <Rocket size={20} className="mr-2 text-violet-600" /> 
              Quick Start with Your Product URL
            </h3>
            
            <p className="text-violet-700 text-sm mb-4">
              Have a product website? Let us extract information automatically to speed up your submission.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                {...register("productUrl")}
                placeholder="https://yourproduct.com"
                className="flex-1 px-4 py-3 rounded-lg border border-violet-200 focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
              />
              
              <button
                type="button"
                onClick={() => handleUrlValidation(watch("productUrl"))}
                disabled={urlStatus === "validating"}
                className="px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors disabled:bg-violet-300 flex items-center justify-center whitespace-nowrap"
              >
                {urlStatus === "validating" ? 
                  <><span className="animate-spin mr-2">⟳</span> Checking...</> : 
                  <>Validate URL <ArrowRight size={16} className="ml-2" /></>
                }
              </button>
            </div>
            
            {urlStatus === "valid" && (
              <motion.p 
                className="mt-3 text-emerald-600 flex items-center text-sm"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Check size={16} className="mr-1" /> URL validated! We've pre-filled some fields for you.
              </motion.p>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AddProductForm;