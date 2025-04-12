"use client";

import { useState, useEffect } from "react";
import {
  Upload,
  X,
  Check,
  AlertCircle,
  Info,
  DollarSign,
  Tag,
  Plus,
  Image as ImageIcon,
  Link,
  ExternalLink,
  Hash,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

// FormInput Component - Enhanced with cleaner styling and fixed register handling
export const FormInput = ({
  label,
  name,
  register = null, // Make register optional
  errors = {},
  type = "text",
  placeholder,
  required = false,
  validationRules = {},
  note,
  disabled = false,
  className = "",
  children,
  icon,
  value,
  onChange,
}) => {
  const [focused, setFocused] = useState(false);
  const [internalValue, setInternalValue] = useState(value || "");

  // Handle value updates from parent
  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
    }
  }, [value]);

  // Handle internal changes when no register is provided
  const handleChange = (e) => {
    setInternalValue(e.target.value);
    if (onChange) {
      onChange(e);
    }
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      <label
        htmlFor={name}
        className="text-sm font-medium text-gray-700 flex items-center gap-1"
      >
        {label} {required && <span className="text-red-500">*</span>}
        {note && (
          <div className="relative group ml-1 cursor-help">
            <Info size={14} className="text-gray-400" />
            <div className="absolute left-0 -top-1 transform -translate-y-full bg-gray-800 text-white text-xs p-2 rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all w-48 z-10">
              {note}
            </div>
          </div>
        )}
      </label>
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </span>
        )}
        <input
          id={name}
          name={name}
          type={type}
          disabled={disabled}
          placeholder={placeholder}
          value={register ? undefined : internalValue}
          onChange={register ? undefined : handleChange}
          className={`w-full py-2.5 px-4 ${
            icon ? "pl-10" : ""
          } text-sm border rounded-lg 
            focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all 
            ${errors[name] ? "border-red-300 bg-red-50" : "border-gray-200"} 
            ${disabled ? "bg-gray-50 cursor-not-allowed" : "bg-white"}
            ${focused ? "border-blue-400 shadow-sm" : ""}`}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...(register
            ? register(name, {
                required: required && "This field is required",
                ...validationRules,
              })
            : {})}
        />
      </div>
      <AnimatePresence>
        {errors[name] && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-xs text-red-500 flex items-center gap-1"
          >
            <AlertCircle size={12} /> {errors[name].message}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

// FileUploadArea Component - Enhanced with modern design
export const FileUploadArea = ({
  label,
  onChange,
  image,
  onRemove,
  accept = "image/*",
  required = false,
  error = null,
  note = null,
}) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0])
      onChange(e.dataTransfer.files[0]);
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) onChange(e.target.files[0]);
  };

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
        {label} {required && <span className="text-red-500">*</span>}
        {note && (
          <div className="relative group ml-1 cursor-help">
            <Info size={14} className="text-gray-400" />
            <div className="absolute left-0 -top-1 transform -translate-y-full bg-gray-800 text-white text-xs p-2 rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all w-48 z-10">
              {note}
            </div>
          </div>
        )}
      </label>
      <motion.div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        initial={{ scale: 1 }}
        whileHover={{ scale: 1.01 }}
        className={`border-2 border-dashed rounded-lg p-6 flex items-center justify-center transition-all
          ${dragActive ? "border-blue-400 bg-blue-50/50" : "border-gray-200"} 
          ${error ? "border-red-300" : ""}`}
      >
        {image ? (
          <div className="relative group">
            <img
              src={image instanceof File ? URL.createObjectURL(image) : image}
              alt="Preview"
              className="max-h-40 rounded-md shadow-sm"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-md flex items-center justify-center">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onRemove}
                className="opacity-0 group-hover:opacity-100 bg-white rounded-full p-1.5 text-red-500 hover:bg-red-50 shadow-lg transition-all"
              >
                <X size={16} />
              </motion.button>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-3 py-4">
            <div className="bg-blue-50 rounded-full p-3 w-12 h-12 flex items-center justify-center mx-auto">
              <ImageIcon size={20} className="text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Drop an image or</p>
              <label className="text-sm font-medium text-blue-500 hover:text-blue-600 cursor-pointer transition-colors mt-1 inline-block">
                Browse files
                <input
                  type="file"
                  className="hidden"
                  accept={accept}
                  onChange={handleChange}
                />
              </label>
            </div>
          </div>
        )}
      </motion.div>
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
          <AlertCircle size={12} /> {error}
        </p>
      )}
    </div>
  );
};

// LinkInput Component - Enhanced with modern design
export const LinkInput = ({ links = {}, setLinks, error = null }) => {
  const [linkType, setLinkType] = useState("website");
  const [linkUrl, setLinkUrl] = useState("");

  const linkTypes = [
    { id: "website", label: "Website" },
    { id: "github", label: "GitHub" },
    { id: "twitter", label: "Twitter" },
    { id: "discord", label: "Discord" },
    { id: "demo", label: "Demo" },
    { id: "docs", label: "Docs" },
  ];

  const availableLinkTypes = linkTypes.filter((type) => !links[type.id]);

  const handleAddLink = () => {
    if (!linkUrl) return;

    // Add http:// if missing
    let url = linkUrl;
    if (!/^https?:\/\//i.test(url)) {
      url = `https://${url}`;
    }

    try {
      new URL(url);
      setLinks({ ...links, [linkType]: url });
      setLinkUrl("");
      if (typeof toast !== "undefined") {
        toast.success(`${linkType} link added!`);
      }
    } catch {
      if (typeof toast !== "undefined") {
        toast.error("Invalid URL");
      }
    }
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-gray-700">Links</label>
      <div className="space-y-2">
        <AnimatePresence>
          {Object.entries(links).map(([type, url]) => (
            <motion.div
              key={type}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-100"
            >
              <span className="text-sm font-medium capitalize">{type}:</span>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 text-sm truncate flex-1 hover:underline flex items-center gap-1"
              >
                <span className="truncate">{url}</span>
                <ExternalLink size={12} />
              </a>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() =>
                  setLinks((prev) => {
                    const newLinks = { ...prev };
                    delete newLinks[type];
                    return newLinks;
                  })
                }
                className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-gray-100"
              >
                <X size={16} />
              </motion.button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {availableLinkTypes.length > 0 && (
        <div className="flex gap-2">
          <select
            value={linkType}
            onChange={(e) => setLinkType(e.target.value)}
            className="border rounded-lg p-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
          >
            {availableLinkTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.label}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="Enter URL"
            className="flex-1 border rounded-lg p-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
            onKeyDown={(e) => e.key === "Enter" && handleAddLink()}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddLink}
            className="bg-blue-500 text-white rounded-lg px-3 py-2 text-sm hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            <Plus size={16} />
          </motion.button>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <AlertCircle size={12} /> {error}
        </p>
      )}
    </div>
  );
};

// Fixed TagsInput Component
export const TagsInput = ({ tags = [], setTags, error = null }) => {
  const [inputValue, setInputValue] = useState("");

  // Added maximum tag length validation
  const MAX_TAG_LENGTH = 20;
  const MAX_TAGS = 10;

  const addTag = (tag) => {
    tag = tag.trim().toLowerCase();

    // Validation
    if (!tag) return false;
    if (tags.length >= MAX_TAGS) {
      if (typeof toast !== "undefined") {
        toast.error(`Maximum ${MAX_TAGS} tags allowed`);
      }
      return false;
    }
    if (tags.includes(tag)) {
      if (typeof toast !== "undefined") {
        toast.error("Tag already exists");
      }
      return false;
    }
    if (tag.length > MAX_TAG_LENGTH) {
      if (typeof toast !== "undefined") {
        toast.error(`Tag must be ${MAX_TAG_LENGTH} characters or less`);
      }
      return false;
    }

    setTags([...tags, tag]);
    return true;
  };

  const handleKeyDown = (e) => {
    // Add tag on Enter key
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent form submission

      if (addTag(inputValue)) {
        setInputValue("");
      }
    }

    // Add tag on comma or space
    if (e.key === "," || e.key === " ") {
      e.preventDefault();

      const tagToAdd = inputValue.trim();
      if (tagToAdd && addTag(tagToAdd)) {
        setInputValue("");
      }
    }

    // Remove last tag on backspace if input is empty
    if (e.key === "Backspace" && inputValue === "" && tags.length > 0) {
      e.preventDefault();
      setTags(tags.slice(0, -1));
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;

    // Check if value ends with comma or space to automatically add tag
    if (value.endsWith(",") || value.endsWith(" ")) {
      const tagToAdd = value.slice(0, -1).trim();
      if (tagToAdd && addTag(tagToAdd)) {
        setInputValue("");
      } else {
        setInputValue(value.slice(0, -1));
      }
      return;
    }

    setInputValue(value);
  };

  const handleAddTag = () => {
    if (addTag(inputValue)) {
      setInputValue("");
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const tagVariants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: { type: "spring", stiffness: 300, damping: 15 },
    },
    exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } },
    hover: { scale: 1.05, transition: { duration: 0.2 } },
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-gray-700">Tags</label>
        <span
          className={`text-xs ${
            tags.length >= MAX_TAGS ? "text-red-500" : "text-gray-500"
          }`}
        >
          {MAX_TAGS - tags.length} tags remaining
        </span>
      </div>

      <div className="p-3 border rounded-lg focus-within:ring-1 focus-within:ring-blue-300 focus-within:border-blue-300 transition-all bg-white">
        <div className="flex flex-wrap gap-2 mb-2">
          <AnimatePresence>
            {tags.map((tag) => (
              <motion.span
                key={tag}
                variants={tagVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                whileHover="hover"
                className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full flex items-center gap-1.5 group"
              >
                <Hash size={12} className="text-blue-500" />
                {tag}
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.2, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => removeTag(tag)}
                  className="text-blue-400 hover:text-red-500 transition-colors"
                >
                  <X size={12} />
                </motion.button>
              </motion.span>
            ))}
          </AnimatePresence>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Hash
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={
                tags.length >= MAX_TAGS
                  ? "Max tags reached"
                  : "Add tags (press Enter, space or comma)"
              }
              className="w-full border rounded-lg py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-300 transition-all"
              disabled={tags.length >= MAX_TAGS}
            />
          </div>
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddTag}
            disabled={!inputValue.trim() || tags.length >= MAX_TAGS}
            className="bg-blue-500 text-white rounded-lg px-3 py-2 text-sm disabled:bg-blue-300 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            Add
          </motion.button>
        </div>
      </div>

      <p className="text-xs text-gray-500 flex items-center gap-1">
        <Info size={12} />
        Use relevant tags to help users discover your product
      </p>

      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
          <AlertCircle size={12} /> {error}
        </p>
      )}
    </div>
  );
};

// PricingTypeSelector Component - Enhanced with fixed validation and improved UI
export const PricingTypeSelector = ({
  value = "free",
  onChange,
  price = 0,
  onPriceChange,
  error = null,
}) => {
  const [localPrice, setLocalPrice] = useState(price || 0);
  const [priceError, setPriceError] = useState(null);

  // Update local price when external price changes
  useEffect(() => {
    setLocalPrice(price || 0);
  }, [price]);

  // Handle price input changes
  const handlePriceChange = (e) => {
    const newPrice = parseFloat(e.target.value) || 0;
    setLocalPrice(newPrice);
    if (value === "paid" && newPrice <= 0) {
      setPriceError("Price amount is required for paid products");
    } else {
      setPriceError(null);
    }
    onPriceChange(newPrice);
  };
  // Handle pricing type selection
  const handleTypeChange = (newType) => {
    onChange(newType);

    // Reset price error for free and contact options
    if (newType === "free" || newType === "contact") {
      setPriceError(null);
    }
    // Validate price if selecting paid option
    else if (newType === "paid" && (!localPrice || localPrice <= 0)) {
      setPriceError("Price amount is required for paid products");
    }
  };

  const options = [
    {
      id: "free",
      title: "Free",
      description: "Your product is available for free",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"
          />
        </svg>
      ),
    },
    {
      id: "paid",
      title: "Paid",
      description: "One-time payment",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      id: "contact",
      title: "Contact",
      description: "Price available upon request",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-gray-700">
          Pricing <span className="text-red-500">*</span>
        </label>
        <div className="relative group">
          <Info size={14} className="text-gray-400 cursor-help" />
          <div className="absolute right-0 -top-1 transform -translate-y-full bg-gray-800 text-white text-xs p-2 rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all w-48 z-10">
            Choose how you want to price your product
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {options.map((option) => (
          <motion.div
            key={option.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleTypeChange(option.id)}
            className={`
              relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
              ${
                value === option.id
                  ? "border-violet-500 bg-violet-50"
                  : "border-gray-200 hover:border-violet-300 hover:bg-violet-50/30"
              }
            `}
          >
            <div className="flex items-start gap-3">
              <div
                className={`
                  flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
                  ${
                    value === option.id
                      ? "bg-violet-500 text-white"
                      : "bg-gray-100 text-gray-500"
                  }
                `}
              >
                {option.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-900">
                  {option.title}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {option.description}
                </p>
              </div>
              {value === option.id && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-violet-500 rounded-full flex items-center justify-center">
                  <Check size={12} className="text-white" />
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Price input field - only shown for paid option */}
      <AnimatePresence>
        {value === "paid" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4">
              <label
                htmlFor="price"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Price (USD) <span className="text-red-500">*</span>
              </label>
              <div className="relative rounded-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign size={16} className="text-gray-400" />
                </div>
                <input
                  type="number"
                  name="price"
                  id="price"
                  min="0.01"
                  step="0.01"
                  value={localPrice || ""}
                  onChange={handlePriceChange}
                  placeholder="0.00"
                  className={`block w-full pl-10 pr-12 py-2 sm:text-sm border rounded-md 
                    shadow-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 
                    transition-all duration-200
                    ${
                      priceError
                        ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                        : "border-gray-300"
                    }`}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">USD</span>
                </div>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Set a one-time purchase price for your product
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(error || priceError) && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-xs text-red-500 flex items-center gap-1 mt-1"
          >
            <AlertCircle size={12} /> {error || priceError}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};
