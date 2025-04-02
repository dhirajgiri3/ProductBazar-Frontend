import React, { useState, useEffect, useRef } from 'react';
import { Avatar } from '@mui/material';
import { motion } from 'framer-motion';
import { FaUser, FaPaperPlane, FaTimes } from 'react-icons/fa';

// Character count indicator styles
const getCharCountColor = (count, max = 1000) => {
  const ratio = count / max;
  if (ratio < 0.7) return 'text-green-500 dark:text-green-400';
  if (ratio < 0.9) return 'text-yellow-500 dark:text-yellow-400';
  return 'text-red-500 dark:text-red-400';
};

const CommentForm = ({
  user,
  onSubmit,
  initialContent = '',
  placeholder = "Add a comment...",
  submitLabel = "Post",
  onCancel,
  isSubmitting = false,
  autoFocus = false
}) => {
  const [content, setContent] = useState(initialContent);
  const [isFocused, setIsFocused] = useState(autoFocus);
  const textareaRef = useRef(null);
  const characterLimit = 1000;

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(content.length, content.length);
      setIsFocused(true);
    }
  }, [autoFocus, content]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim() || content.length > characterLimit) return;
    onSubmit(content);
    setContent('');
  };

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
            maxLength={characterLimit}
            className={`w-full p-3 text-sm border rounded-lg focus:outline-none transition duration-200 min-h-[80px] resize-y bg-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400
              ${isFocused 
                ? "border-violet-400 dark:border-violet-500 shadow-sm" 
                : "border-gray-200 dark:border-gray-700"}
              ${isSubmitting ? "opacity-70" : ""}
            `}
            placeholder={placeholder}
            disabled={isSubmitting}
            rows={2}
            required
          />
          
          {/* Character count indicator */}
          {content.length > 0 && (
            <div 
              className={`absolute bottom-2 right-2 text-xs font-mono ${getCharCountColor(content.length, characterLimit)}`}
            >
              {content.length}/{characterLimit}
            </div>
          )}
        </div>
        
        <div className="flex justify-end items-center gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              disabled={isSubmitting}
            >
              <FaTimes className="inline-block mr-1" size={10} />
              Cancel
            </button>
          )}
          
          {/* Submit button with simpler hover effect */}
          <button
            type="submit"
            className={`px-4 py-1.5 text-xs font-medium text-white rounded-lg transition-colors ${
              !content.trim() || isSubmitting 
                ? 'bg-violet-400 dark:bg-violet-600 cursor-not-allowed opacity-70' 
                : 'bg-violet-500 hover:bg-violet-600 dark:bg-violet-600 dark:hover:bg-violet-700'
            }`}
            disabled={isSubmitting || !content.trim()}
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
          </button>
        </div>
      </div>
    </form>
  );
};

export default CommentForm;