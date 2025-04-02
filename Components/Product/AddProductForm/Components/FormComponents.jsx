"use client";

import { useState } from "react";
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
} from "lucide-react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

// FormInput Component
export const FormInput = ({
  label,
  name,
  register,
  errors,
  type = "text",
  placeholder,
  required = false,
  validationRules = {},
  note,
  disabled = false,
  className = "",
  children,
  icon,
}) => {
  const [focused, setFocused] = useState(false);

  return (
    <div className={`space-y-1 ${className}`}>
      <label
        htmlFor={name}
        className="text-sm font-medium text-gray-800 flex items-center gap-1"
      >
        {label} {required && <span className="text-red-500">*</span>}
        {note && (
          <span className="text-xs text-gray-500 flex items-center ml-2">
            <Info size={12} /> {note}
          </span>
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
          type={type}
          disabled={disabled}
          placeholder={placeholder}
          className={`w-full py-2.5 px-4 ${
            icon ? "pl-10" : ""
          } text-sm border rounded-md 
            focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all 
            ${errors[name] ? "border-red-300" : "border-gray-200"} 
            ${disabled ? "bg-gray-50 cursor-not-allowed" : "bg-white"}`}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...register(name, {
            required: required && "This field is required",
            ...validationRules,
          })}
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

// FileUploadArea Component
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
    <div className="space-y-1">
      <label className="text-sm font-medium text-gray-800 flex items-center gap-1">
        {label} {required && <span className="text-red-500">*</span>}
        {note && (
          <span className="text-xs text-gray-500 flex items-center ml-2">
            <Info size={12} /> {note}
          </span>
        )}
      </label>
      <motion.div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        initial={{ scale: 1 }}
        whileHover={{ scale: 1.02 }}
        className={`border-2 border-dashed rounded-lg p-6 flex items-center justify-center 
          ${dragActive ? "border-blue-400 bg-blue-50" : "border-gray-200"} 
          ${error ? "border-red-300" : ""}`}
      >
        {image ? (
          <div className="relative">
            <img
              src={image instanceof File ? URL.createObjectURL(image) : image}
              alt="Preview"
              className="max-h-40 rounded-md"
            />
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onRemove}
              className="absolute top-2 right-2 bg-white rounded-full p-1 text-red-500 hover:bg-red-50"
            >
              <X size={16} />
            </motion.button>
          </div>
        ) : (
          <div className="text-center space-y-2">
            <ImageIcon size={24} className="mx-auto text-gray-400" />
            <p className="text-sm text-gray-600">Drop an image or</p>
            <label className="text-sm text-blue-500 hover:underline cursor-pointer">
              Browse
              <input
                type="file"
                className="hidden"
                accept={accept}
                onChange={handleChange}
              />
            </label>
          </div>
        )}
      </motion.div>
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <AlertCircle size={12} /> {error}
        </p>
      )}
    </div>
  );
};

// PricingTypeSelector Component
export const PricingTypeSelector = ({
  value = "free",
  onChange,
  amount = 0,
  setAmount,
  currency = "USD",
  setCurrency,
  discounted = false,
  setDiscounted,
  originalAmount = 0,
  setOriginalAmount,
  error = null,
}) => {
  const options = [
    { id: "free", label: "Free", icon: <Tag size={16} /> },
    { id: "paid", label: "Paid", icon: <DollarSign size={16} /> },
    { id: "contact", label: "Contact Us", icon: <Link size={16} /> },
  ];

  const currencies = [
    { id: "USD", label: "$" },
    { id: "EUR", label: "€" },
    { id: "GBP", label: "£" },
  ];

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-800">
        Pricing Type <span className="text-red-500">*</span>
      </label>
      <div className="grid grid-cols-3 gap-2">
        {options.map((option) => (
          <motion.button
            key={option.id}
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onChange(option.id)}
            className={`p-3 rounded-md text-sm flex items-center gap-2 
              ${
                value === option.id
                  ? "bg-blue-50 border-blue-500"
                  : "bg-white border-gray-200"
              } 
              border transition-colors`}
          >
            {option.icon}
            {option.label}
            {value === option.id && (
              <Check size={16} className="ml-auto text-blue-500" />
            )}
          </motion.button>
        ))}
      </div>
      {value === "paid" && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="space-y-3 p-4 bg-gray-50 rounded-md"
        >
          <div className="flex gap-2">
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="border rounded-md p-2 text-sm bg-white"
            >
              {currencies.map((curr) => (
                <option key={curr.id} value={curr.id}>
                  {curr.label}
                </option>
              ))}
            </select>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value))}
              className="flex-1 border rounded-md p-2 text-sm"
              placeholder="0.00"
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={discounted}
              onChange={(e) => setDiscounted(e.target.checked)}
              className="rounded text-blue-500"
            />
            Show original price
          </label>
          {discounted && (
            <input
              type="number"
              min={amount + 0.01}
              step="0.01"
              value={originalAmount}
              onChange={(e) => setOriginalAmount(parseFloat(e.target.value))}
              className="w-full border rounded-md p-2 text-sm"
              placeholder="Original price"
            />
          )}
        </motion.div>
      )}
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <AlertCircle size={12} /> {error}
        </p>
      )}
    </div>
  );
};

// LinkInput Component
export const LinkInput = ({ links, setLinks, error = null }) => {
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
    const url = linkUrl.startsWith("http") ? linkUrl : `https://${linkUrl}`;
    try {
      new URL(url);
      setLinks({ ...links, [linkType]: url });
      setLinkUrl("");
      toast.success(`${linkType} link added!`);
    } catch {
      toast.error("Invalid URL");
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-800">Links</label>
      <AnimatePresence>
        {Object.entries(links).map(([type, url]) => (
          <motion.div
            key={type}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 p-2 bg-gray-50 rounded-md"
          >
            <span className="text-sm capitalize">{type}:</span>
            <a
              href={url}
              target="_blank"
              className="text-blue-500 text-sm truncate flex-1"
            >
              {url}
            </a>
            <motion.button
              whileHover={{ scale: 1.1 }}
              onClick={() =>
                setLinks((prev) => {
                  const newLinks = { ...prev };
                  delete newLinks[type];
                  return newLinks;
                })
              }
              className="text-gray-400 hover:text-red-500"
            >
              <X size={16} />
            </motion.button>
          </motion.div>
        ))}
      </AnimatePresence>
      {availableLinkTypes.length > 0 && (
        <div className="flex gap-2">
          <select
            value={linkType}
            onChange={(e) => setLinkType(e.target.value)}
            className="border rounded-md p-2 text-sm bg-white"
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
            className="flex-1 border rounded-md p-2 text-sm"
            onKeyDown={(e) => e.key === "Enter" && handleAddLink()}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddLink}
            className="bg-blue-500 text-white rounded-md px-3 py-2 text-sm"
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

// TagsInput Component
export const TagsInput = ({ tags, setTags, error = null }) => {
  const [inputValue, setInputValue] = useState("");

  const handleAddTag = () => {
    const tag = inputValue.trim();
    if (!tag || tags.length >= 10 || tags.includes(tag)) return;
    setTags([...tags, tag]);
    setInputValue("");
    toast.success(`Tag "${tag}" added!`);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-800">Tags</label>
      <div className="flex flex-wrap gap-2">
        <AnimatePresence>
          {tags.map((tag) => (
            <motion.span
              key={tag}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-md flex items-center gap-1"
            >
              #{tag}
              <motion.button
                whileHover={{ scale: 1.1 }}
                onClick={() => setTags(tags.filter((t) => t !== tag))}
                className="text-blue-600 hover:text-blue-800"
              >
                <X size={12} />
              </motion.button>
            </motion.span>
          ))}
        </AnimatePresence>
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Add a tag"
          className="flex-1 border rounded-md p-2 text-sm"
          onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleAddTag}
          className="bg-blue-500 text-white rounded-md px-3 py-2 text-sm"
        >
          Add
        </motion.button>
      </div>
      <p className="text-xs text-gray-500">{10 - tags.length} tags remaining</p>
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <AlertCircle size={12} /> {error}
        </p>
      )}
    </div>
  );
};
