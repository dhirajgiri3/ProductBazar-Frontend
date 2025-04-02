"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import confetti from "canvas-confetti";
import { Check, HelpCircle, Plus, ArrowRight, Rocket, Sparkles } from "lucide-react";

import ProgressIndicator from "./Components/ProgressIndicator";
import ProductFormSteps from "./Components/ProductFormSteps";
import ReviewSection from "./Components/ReviewSection";
import { useProduct } from "../../../Contexts/Product/ProductContext";
import { useCategories } from "../../../Contexts/Category/CategoryContext";
import { useAuth } from "../../../Contexts/Auth/AuthContext";
import { Balloons } from "../../../components/ui/balloons";

// Success confetti animation
const triggerConfetti = () => {
  const duration = 3000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

  const randomInRange = (min, max) => Math.random() * (max - min) + min;

  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now();
    if (timeLeft <= 0) return clearInterval(interval);
    const particleCount = 50 * (timeLeft / duration);
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.9), y: randomInRange(0.1, 0.3) },
      colors: ["#8B5CF6", "#C4B5FD", "#6D28D9", "#F472B6", "#F59E0B"],
    });
  }, 250);
};

const AddProductForm = () => {
  const router = useRouter();
  const { createProduct } = useProduct();
  const { categories, isLoading: categoriesLoading } = useCategories();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const { register, handleSubmit, control, formState: { errors, isSubmitting }, setValue, watch, reset } = useForm({
    defaultValues: { 
      name: "", 
      tagline: "", 
      description: "", 
      category: "" 
    },
  });

  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailError, setThumbnailError] = useState(null);
  const [tags, setTags] = useState([]);
  const [links, setLinks] = useState({});
  const [pricingType, setPricingType] = useState("");
  const [pricingTypeError, setPricingTypeError] = useState(null);
  const [price, setPrice] = useState("");
  const [priceError, setPriceError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [formComplete, setFormComplete] = useState(false);
  const [createdProductId, setCreatedProductId] = useState(null);
  const balloonsRef = useRef(null);

  const watchName = watch("name");
  const watchTagline = watch("tagline");
  const watchDescription = watch("description");
  const watchCategory = watch("category");

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 25, 
        duration: 0.5 
      }
    },
    exit: { 
      opacity: 0, 
      y: -20,
      transition: { duration: 0.3 }
    }
  };

  const handleNextStep = () => {
    if (formStep === 1) {
      let hasErrors = false;
      if (!watchName) hasErrors = true;
      if (!watchTagline) hasErrors = true;
      if (!watchCategory) hasErrors = true;
      if (!thumbnail) {
        setThumbnailError("Product image is required");
        hasErrors = true;
      }
      if (hasErrors) {
        toast.error("Please fill all required fields", {
          duration: 3000,
          icon: '⚠️',
          style: {
            border: '1px solid #EF4444',
            padding: '16px',
            color: '#B91C1C',
          },
        });
        return;
      }
      setFormStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (formStep === 2) {
      let hasErrors = false;
      if (!watchDescription) hasErrors = true;
      if (!pricingType) {
        setPricingTypeError("Please select a pricing type");
        hasErrors = true;
      }
      if ((pricingType === "one_time" || pricingType === "subscription") && !price) {
        setPriceError("Price is required for this pricing type");
        hasErrors = true;
      }
      if (hasErrors) {
        toast.error("Please fill all required fields", {
          duration: 3000,
          icon: '⚠️',
        });
        return;
      }
      setFormStep(3);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    setFormStep(formStep - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onSubmit = async (data) => {
    if (formStep < 3) {
      handleNextStep();
      return;
    }

    setSubmitting(true);
    try {
      let hasErrors = false;
      if (!thumbnail) {
        setThumbnailError("Product image is required");
        hasErrors = true;
      }
      if (!pricingType) {
        setPricingTypeError("Please select a pricing type");
        hasErrors = true;
      }
      if ((pricingType === "one_time" || pricingType === "subscription") && !price) {
        setPriceError("Price is required for this pricing type");
        hasErrors = true;
      }
      if (hasErrors) {
        setSubmitting(false);
        toast.error("Please fix all errors before submitting", {
          duration: 3000,
          icon: '⚠️',
        });
        return;
      }

      const productData = {
        name: data.name,
        tagline: data.tagline,
        description: data.description,
        category: data.category,
        tags: tags.join(","),
        pricingType: pricingType,
        status: "Published",
        categories: [data.category],
        categoryName: "",
      };
      
      // Category name (for easier processing)
      const selectedCategory = categories.find(c => c._id === data.category);
      if (selectedCategory) {
        productData.categoryName = selectedCategory.name;
      }
      
      // Add pricing information if applicable
      if ((pricingType === "one_time" || pricingType === "subscription") && price) {
        productData.pricingAmount = price;
        productData.pricingCurrency = "USD";
      }
      
      // Add links if available
      if (Object.keys(links).length > 0) {
        productData.links = JSON.stringify(links);
      }
      
      // Add thumbnail
      if (thumbnail instanceof File) {
        productData.thumbnail = thumbnail;
      } else if (typeof thumbnail === 'string' && thumbnail.startsWith("http")) {
        productData.thumbnail = thumbnail;
      } else if (thumbnail instanceof Blob) {
        // Convert blob to File if needed
        const thumbnailFile = new File([thumbnail], "product-image.jpg", { type: thumbnail.type });
        productData.thumbnail = thumbnailFile;
      }

      // Submit the product
      const result = await createProduct(productData);
      
      if (result && result._id) {
        triggerConfetti();
        // Launch balloons animation
        if (balloonsRef.current) {
          balloonsRef.current.launchAnimation();
        }
        setCreatedProductId(result.slug);
        setFormComplete(true);
        toast.success("Product created successfully!", {
          duration: 5000,
          icon: '🚀',
          style: {
            border: '1px solid #8B5CF6',
            padding: '16px',
            color: '#4C1D95',
          },
        });
        setTimeout(() => router.push(`/products/${result.slug}`), 3000);
      } else {
        toast.error(result?.message || "Failed to create product", {
          duration: 4000,
          icon: '❌',
        });
      }
    } catch (error) {
      console.error("Error creating product:", error);
      toast.error(error?.response?.data?.message || "An unexpected error occurred", {
        duration: 4000,
        icon: '❌',
      });
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated()) {
      router.push("/auth/login?redirect=/add-product");
      toast.error("Please log in to create a product", {
        duration: 3000,
      });
    }
  }, [isAuthenticated, router, authLoading]);

  if (authLoading || (categoriesLoading && !categories.length)) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4">
        <div className="animate-pulse bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-violet-200 mb-4"></div>
          <div className="h-6 bg-violet-100 rounded w-3/4 mx-auto mb-4"></div>
          <div className="h-4 bg-violet-50 rounded w-1/2 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (formComplete) {
    return (
      <motion.div 
        className="max-w-3xl mx-auto pb-12 px-4 sm:px-0"
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <div className="bg-white rounded-lg shadow-xl border border-violet-100 p-8 text-center">
          <div className="relative mb-6">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <Check size={40} className="text-white" />
            </div>
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                type: "spring",
                stiffness: 500,
                damping: 15,
                delay: 0.2
              }}
              className="absolute top-0 right-0 left-0 -mt-2"
            >
              <Sparkles 
                size={24} 
                className="text-amber-400 inline-block ml-12 transform rotate-12" 
              />
            </motion.div>
          </div>
          
          <motion.h1 
            className="text-3xl font-bold text-gray-900 mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Product Added Successfully!
          </motion.h1>
          
          <motion.p 
            className="text-gray-600 mb-8 text-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Your product has been created and is ready to be discovered.
          </motion.p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push(`/products/${createdProductId}`)}
              className="inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-md text-base font-medium text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-all duration-200"
            >
              <ArrowRight size={18} className="mr-2" />
              View Your Product
            </motion.button>
            
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                reset();
                setThumbnail(null);
                setTags([]);
                setLinks({});
                setPricingType("");
                setPrice("");
                setFormStep(1);
                setFormComplete(false);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-colors duration-200 mt-4 sm:mt-0"
            >
              <Plus size={18} className="mr-2" />
              Add Another Product
            </motion.button>
          </div>
          
          {/* Add Balloons component */}
          <Balloons 
            ref={balloonsRef}
            type="text"
            text="🚀 Success!"
            fontSize={80}
            color="#8B5CF6"
          />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="max-w-3xl mx-auto pb-12 px-4 sm:px-0"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <ProgressIndicator step={formStep - 1} totalSteps={3} />
      </motion.div>
      
      <motion.div 
        className="bg-white rounded-lg shadow-xl border border-gray-100 p-6 sm:p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
          {formStep === 1 ? (
            <>
              <Rocket size={24} className="mr-2 text-violet-500" />
              Add Your Product
            </>
          ) : formStep === 2 ? (
            <>
              <Sparkles size={24} className="mr-2 text-violet-500" />
              Additional Product Details
            </>
          ) : (
            <>
              <Check size={24} className="mr-2 text-emerald-500" />
              Review Your Submission
            </>
          )}
        </h1>
        
        <p className="text-gray-600 mb-8">
          {formStep === 1 
            ? "Share your creation with the Product Bazar community. Let's start with the basics."
            : formStep === 2
            ? "Great start! Now let's add more details about your product."
            : "Almost there! Review your product details before launching."}
        </p>
        
        <form onSubmit={handleSubmit(onSubmit)} className="relative">
          <AnimatePresence mode="wait">
            {formStep <= 2 ? (
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
                pricingTypeError={pricingTypeError}
                setPricingTypeError={setPricingTypeError}
                price={price}
                setPrice={setPrice}
                priceError={priceError}
                setPriceError={setPriceError}
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
                onSubmit={handleSubmit(onSubmit)}
              />
            )}
          </AnimatePresence>
        </form>
        
        <div className="mt-10 border-t border-gray-200 pt-6">
          <div className="flex items-start">
            <HelpCircle size={18} className="text-violet-500 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-gray-900">Tips for a successful product submission:</h3>
              <ul className="mt-2 ml-6 text-sm text-gray-600 space-y-1 list-disc">
                <li>Use a clear, high-quality image that represents your product well</li>
                <li>Write a concise yet compelling tagline that explains your product in one sentence</li>
                <li>Provide a detailed description that highlights key features and benefits</li>
                <li>Add relevant tags to help users discover your product</li>
                <li>Include links to your website, documentation, and other resources</li>
              </ul>
            </div>
          </div>
        </div>
      </motion.div>
      <Balloons 
        ref={balloonsRef}
        type="default"
        className="absolute z-50"
      />
    </motion.div>
  );
};

export default AddProductForm;