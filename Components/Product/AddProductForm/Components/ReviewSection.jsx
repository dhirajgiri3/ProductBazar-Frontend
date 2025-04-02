"use client";

import { 
  ArrowRight, 
  Send, 
  Tag, 
  Check, 
  ExternalLink, 
  ShieldCheck, 
  Sparkles, 
  DollarSign,
  CheckCircle,
  Star 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import DOMPurify from "isomorphic-dompurify";

const ReviewSection = ({
  thumbnail,
  watchName,
  watchTagline,
  watchCategory,
  categories,
  watchDescription,
  pricingType,
  price,
  tags,
  links,
  submitting,
  handleBack,
  onSubmit,
}) => {
  const selectedCategory = categories.find((c) => c._id === watchCategory);
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  // Get safe HTML for description preview
  const sanitizedHtml = DOMPurify.sanitize(watchDescription || '');
  
  // Helper to format pricing display
  const formatPricing = () => {
    if (!pricingType) return "—";
    
    const typeLabel = {
      "free": "Free",
      "one_time": "One-time Purchase",
      "subscription": "Subscription",
      "freemium": "Freemium",
      "contact": "Contact for Pricing"
    };
    
    let priceDisplay = typeLabel[pricingType] || pricingType.replace('_', ' ');
    
    if ((pricingType === "one_time" || pricingType === "subscription") && price) {
      priceDisplay += ` • $${parseFloat(price).toFixed(2)} USD`;
    }
    
    return priceDisplay;
  };
  
  // Icon for pricing type
  const getPricingIcon = () => {
    switch(pricingType) {
      case "free": return <Tag size={20} className="text-emerald-500" />;
      case "one_time": return <DollarSign size={20} className="text-amber-500" />;
      case "subscription": return <Sparkles size={20} className="text-violet-500" />;
      case "freemium": return <Star size={20} className="text-blue-500" />;
      case "contact": return <ShieldCheck size={20} className="text-gray-500" />;
      default: return <CheckCircle size={20} className="text-gray-400" />;
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      <motion.div 
        variants={itemVariants}
        className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-lg overflow-hidden"
      >
        <div className="p-6 text-white">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-4">
              <CheckCircle size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Ready for takeoff!</h3>
              <p className="text-violet-100">Let's review your product before launch</p>
            </div>
          </div>
        </div>
        <div className="bg-white bg-opacity-10 backdrop-blur-lg p-4 text-white text-sm">
          <div className="flex items-center">
            <ShieldCheck size={16} className="mr-2 text-violet-200" />
            <span>Your product will be reviewed by our team before being published</span>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Preview Column */}
        <motion.div
          variants={itemVariants} 
          className="lg:col-span-2 bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100"
        >
          <div className="p-5 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <Sparkles size={18} className="mr-2 text-violet-500" />
              Product Preview
            </h3>
          </div>
          
          <div className="p-5 flex flex-col items-center">
            {thumbnail && (
              <div className="mb-6 w-full flex justify-center">
                <div className="relative w-full max-w-xs aspect-square rounded-lg overflow-hidden shadow-md">
                  <img
                    src={
                      thumbnail instanceof File
                        ? URL.createObjectURL(thumbnail)
                        : thumbnail
                    }
                    alt={watchName}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </div>
            )}
            
            <div className="w-full text-center mb-3">
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                {watchName || "Product Name"}
              </h2>
              <p className="text-gray-600 text-sm italic">
                {watchTagline || "Your product tagline"}
              </p>
            </div>
            
            {selectedCategory && (
              <div className="mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-violet-100 text-violet-800">
                  {selectedCategory.name}
                </span>
              </div>
            )}
            
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="flex -space-x-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              <span className="text-sm text-gray-500">+42 upvotes</span>
            </div>
            
            <div className="w-full flex flex-wrap justify-center gap-1 mb-4">
              {tags.length > 0 ? (
                tags.slice(0, 5).map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                  >
                    #{tag}
                  </span>
                ))
              ) : (
                <span className="text-gray-400 text-sm">No tags added</span>
              )}
              {tags.length > 5 && (
                <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  +{tags.length - 5} more
                </span>
              )}
            </div>
            
            <div className="w-full flex justify-center space-x-3 mt-2">
              <button className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 transition-colors duration-200 shadow-sm">
                View Details
              </button>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors duration-200">
                Upvote
              </button>
            </div>
          </div>
        </motion.div>

        {/* Details Column */}
        <motion.div 
          variants={itemVariants}
          className="lg:col-span-3 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
        >
          <div className="p-5 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <Check size={18} className="mr-2 text-emerald-500" />
              Product Details
            </h3>
          </div>
          
          <div className="p-5 space-y-6">
            <div>
              <h4 className="text-sm uppercase tracking-wider text-gray-500 mb-2 font-medium">
                Name & Tagline
              </h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-medium text-gray-800 mb-1">{watchName || "—"}</p>
                <p className="text-gray-600 text-sm">{watchTagline || "—"}</p>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm uppercase tracking-wider text-gray-500 mb-2 font-medium">
                Category
              </h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-800">
                  {selectedCategory?.name || "—"}
                </p>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm uppercase tracking-wider text-gray-500 mb-2 font-medium">
                Pricing
              </h4>
              <div className="bg-gray-50 p-4 rounded-lg flex items-center">
                {getPricingIcon()}
                <p className="text-gray-800 ml-2">{formatPricing()}</p>
              </div>
            </div>
            
            {tags.length > 0 && (
              <div>
                <h4 className="text-sm uppercase tracking-wider text-gray-500 mb-2 font-medium">
                  Tags
                </h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-violet-100 to-purple-100 text-violet-800"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {Object.keys(links).length > 0 && (
              <div>
                <h4 className="text-sm uppercase tracking-wider text-gray-500 mb-2 font-medium">
                  Links
                </h4>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  {Object.entries(links).map(([type, url]) => (
                    <div key={type} className="flex items-center group">
                      <span className="capitalize font-medium text-gray-700 mr-2">
                        {type}:
                      </span>
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-violet-600 hover:text-violet-800 truncate transition-colors duration-200 flex items-center group-hover:underline"
                      >
                        {url}
                        <ExternalLink size={12} className="ml-1 flex-shrink-0" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div>
              <h4 className="text-sm uppercase tracking-wider text-gray-500 mb-2 font-medium">
                Description
              </h4>
              <div className="bg-gray-50 p-4 rounded-lg max-h-[200px] overflow-y-auto prose prose-sm">
                {watchDescription ? (
                  <div 
                    className="text-gray-800"
                    dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
                  />
                ) : (
                  <p className="text-gray-500 italic">No description provided</p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="flex justify-between mt-8">
        <motion.button
          variants={itemVariants}
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
          variants={itemVariants}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          disabled={submitting}
          onClick={onSubmit}
          className="inline-flex items-center px-8 py-3 border border-transparent rounded-lg shadow-lg text-base font-medium text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Submitting...
            </>
          ) : (
            <>
              <Send size={18} className="mr-2" />
              Launch Product
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ReviewSection;
