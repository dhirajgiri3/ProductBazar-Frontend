"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Avatar } from '@mui/material';
import { motion } from 'framer-motion';
import { FaUser, FaPaperPlane, FaTimes, FaMarkdown } from 'react-icons/fa';

// Enhanced character count animation and styling
const getCharCountColor = (count, max = 1000) => {
  const ratio = count / max;
  if (ratio < 0.7) return 'text-green-500 dark:text-green-400';
  if (ratio < 0.9) return 'text-yellow-500 dark:text-yellow-400';
  return 'text-red-500 dark:text-red-400';
};

// Improved text area auto-resize
const useAutosizeTextArea = (textAreaRef, value) => {
  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "0px";
      const scrollHeight = textAreaRef.current.scrollHeight;
      textAreaRef.current.style.height = scrollHeight + "px";
    }
  }, [textAreaRef, value]);
};

const CommentForm = ({
  user,
  onSubmit,
  initialContent = '',
  placeholder = "Add a comment...",
  submitLabel = "Post",
  onCancel,
  isSubmitting = false,
  autoFocus = false,
  maxLength = 1000
}) => {
  const [content, setContent] = useState(initialContent);
  const [isFocused, setIsFocused] = useState(autoFocus);
  const textareaRef = useRef(null);
  
  // Auto-resize textarea as user types
  useAutosizeTextArea(textareaRef, content);

  // Update content when initial content changes (e.g., for editing)
  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  // Focus management for better UX
  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
      // Place cursor at the end of text when editing
      textareaRef.current.setSelectionRange(content.length, content.length);
      setIsFocused(true);
    }
  }, [autoFocus, content.length]);

  // Submit handler with validation
  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedContent = content.trim();
    if (!trimmedContent || trimmedContent.length > maxLength) return;
    onSubmit(trimmedContent);
    setContent('');
  };

  // Keyboard shortcuts for submission and cancellation
  const handleKeyDown = useCallback((e) => {
    // Submit on Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      if (content.trim() && content.length <= maxLength) {
        e.preventDefault();
        onSubmit(content.trim());
        setContent('');
      }
    }
    // Cancel on Escape
    if (e.key === 'Escape' && onCancel) {
      e.preventDefault();
      onCancel();
    }
  }, [content, maxLength, onSubmit, onCancel]);

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-start gap-3"
    >
      <Avatar
        src={user?.profilePicture?.url}
        alt={user?.firstName || 'User'}
        sx={{ width: 36, height: 36, bgcolor: 'secondary.main' }}
        className="mt-1 flex-shrink-0"
      >
        {user?.firstName?.charAt(0) || <FaUser />}
      </Avatar>

      <div className="flex-grow space-y-2">
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            maxLength={maxLength + 50} // Allow some buffer but show warning
            className={`w-full p-3 text-sm border rounded-lg focus:outline-none transition duration-200 min-h-[80px] resize-y bg-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400
              ${isFocused 
                ? "border-violet-400 dark:border-violet-500 shadow-sm ring-1 ring-violet-300 dark:ring-violet-700" 
                : "border-gray-200 dark:border-gray-700"}
              ${isSubmitting ? "opacity-70 cursor-not-allowed" : ""}
              ${content.length > maxLength ? "border-red-400 dark:border-red-600" : ""}
            `}
            placeholder={placeholder}
            disabled={isSubmitting}
            rows={2}
            required
            aria-label="Comment text"
          />
          
          {/* Enhanced character count indicator with animation */}
          {content.length > 0 && (
            <motion.div 
              className={`absolute bottom-2 right-2 text-xs font-mono rounded-full px-1.5 py-0.5 ${
                content.length > maxLength 
                  ? "bg-red-100 dark:bg-red-900/30" 
                  : content.length > maxLength * 0.8 
                    ? "bg-yellow-100 dark:bg-yellow-900/30"
                    : "bg-gray-100 dark:bg-gray-800"
              } ${getCharCountColor(content.length, maxLength)}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              {content.length}/{maxLength}
            </motion.div>
          )}
        </div>
        
        <div className="flex justify-between items-center">
          {/* Markdown hint */}
          <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
            <FaMarkdown className="mr-1" size={12} />
            <span>Markdown supported</span>
          </div>
          
          <div className="flex items-center gap-2">
            {onCancel && (
              <motion.button
                type="button"
                onClick={onCancel}
                className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600"
                disabled={isSubmitting}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <FaTimes className="inline-block mr-1" size={10} />
                Cancel
              </motion.button>
            )}
            
            {/* Enhanced submit button with better feedback */}
            <motion.button
              type="submit"
              className={`px-4 py-1.5 text-xs font-medium text-white rounded-lg transition-all ${
                !content.trim() || content.length > maxLength || isSubmitting 
                  ? 'bg-violet-400 dark:bg-violet-600 cursor-not-allowed opacity-70' 
                  : 'bg-violet-500 hover:bg-violet-600 dark:bg-violet-600 dark:hover:bg-violet-700 shadow-sm hover:shadow-md'
              } focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800`}
              disabled={isSubmitting || !content.trim() || content.length > maxLength}
              whileHover={content.trim() && content.length <= maxLength && !isSubmitting ? { scale: 1.03 } : {}}
              whileTap={content.trim() && content.length <= maxLength && !isSubmitting ? { scale: 0.97 } : {}}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Processing...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <span>{submitLabel}</span>
                  <FaPaperPlane className="ml-1.5" size={10} />
                </span>
              )}
            </motion.button>
          </div>
        </div>
        
        {/* Keyboard shortcuts hint */}
        {isFocused && (
          <motion.div 
            className="text-xs text-gray-500 dark:text-gray-400 text-right"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.3 }}
          >
            {onCancel ? "Press Esc to cancel • Ctrl+Enter to submit" : "Press Ctrl+Enter to submit"}
          </motion.div>
        )}
      </div>
    </form>
  );
};

export default CommentForm;