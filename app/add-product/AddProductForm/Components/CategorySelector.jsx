"use client";

import { useState, useEffect } from 'react';
import { Check, ChevronDown, AlertCircle, Info, Search, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

const CategorySelector = ({ 
  categories, 
  value, 
  onChange, 
  error,
  label = "Category",
  required = false,
  note
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCategories, setFilteredCategories] = useState(categories || []);
  
  useEffect(() => {
    if (categories) {
      setFilteredCategories(
        categories.filter(cat => 
          cat.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [searchTerm, categories]);

  const selectedCategory = categories?.find(cat => cat._id === value);

  // Animation variants
  const dropdownVariants = {
    hidden: { opacity: 0, y: -5, height: 0 },
    visible: { 
      opacity: 1, 
      y: 0, 
      height: 'auto',
      transition: { 
        duration: 0.2,
        ease: "easeOut"
      }
    },
    exit: { 
      opacity: 0, 
      y: -5, 
      height: 0,
      transition: { 
        duration: 0.2,
        ease: "easeIn"
      }
    }
  };

  // Gradient colors for category pills if no icon
  const gradientColors = [
    'from-violet-500 to-purple-500',
    'from-blue-500 to-cyan-500',
    'from-emerald-500 to-green-500',
    'from-rose-500 to-pink-500',
    'from-amber-500 to-orange-500',
    'from-indigo-500 to-blue-500',
  ];

  return (
    <div className="mb-6 relative">
      <div className="flex justify-between items-center mb-2">
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {note && (
          <span className="text-xs text-gray-500 flex items-center">
            <Info size={12} className="mr-1" /> {note}
          </span>
        )}
      </div>
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-3 bg-white border rounded-lg shadow-sm transition-all duration-200
          ${error ? 'border-red-300' : isOpen ? 'border-violet-400 ring-2 ring-violet-100' : 'border-gray-300 hover:border-violet-300'}
          ${!selectedCategory ? 'text-gray-500' : 'text-gray-800'}`}
      >
        <div className="flex items-center">
          {selectedCategory ? (
            <>
              {selectedCategory.icon ? (
                <div className="w-6 h-6 mr-2 rounded-md overflow-hidden bg-violet-100 flex items-center justify-center">
                  <Image 
                    src={selectedCategory.icon} 
                    alt={selectedCategory.name}
                    width={24}
                    height={24}
                    className="object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              ) : (
                <div className={`w-6 h-6 mr-2 rounded-md bg-gradient-to-br ${gradientColors[Math.floor(Math.random() * gradientColors.length)]}`} />
              )}
              <span>{selectedCategory.name}</span>
            </>
          ) : (
            <span>Select a category</span>
          )}
        </div>
        <ChevronDown
          size={20}
          className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`}
        />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
          >
            <div className="p-2 border-b border-gray-100">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search categories..."
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-md focus:border-violet-300 focus:ring-1 focus:ring-violet-200 focus:outline-none text-sm"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
            
            <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-violet-200 scrollbar-track-gray-50 py-1">
              {filteredCategories.length > 0 ? (
                filteredCategories.map((category) => (
                  <button
                    key={category._id}
                    type="button"
                    onClick={() => {
                      onChange(category._id);
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                    className={`w-full flex items-center px-3 py-2 text-sm hover:bg-violet-50 transition-colors duration-150
                      ${value === category._id ? 'bg-violet-50 text-violet-700' : 'text-gray-700'}`}
                  >
                    <div className="flex-shrink-0 w-6 h-6 mr-2">
                      {category.icon ? (
                        <div className="rounded-md overflow-hidden bg-violet-100 w-full h-full flex items-center justify-center">
                          <Image 
                            src={category.icon} 
                            alt={category.name}
                            width={24}
                            height={24}
                            className="object-contain"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                      ) : (
                        <div className={`w-full h-full rounded-md bg-gradient-to-br ${gradientColors[Math.floor(Math.random() * gradientColors.length)]}`} />
                      )}
                    </div>
                    <span className="flex-grow text-left">{category.name}</span>
                    {value === category._id && (
                      <Check size={16} className="text-violet-600 ml-2" />
                    )}
                  </button>
                ))
              ) : (
                <div className="px-3 py-6 text-center text-gray-500 text-sm">
                  {categories.length === 0 ? (
                    <div className="flex flex-col items-center">
                      <Loader2 size={24} className="text-violet-400 animate-spin mb-2" />
                      <span>Loading categories...</span>
                    </div>
                  ) : (
                    <span>No categories match your search</span>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-start">
          <AlertCircle size={14} className="mr-1 mt-0.5 flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
};

export default CategorySelector;