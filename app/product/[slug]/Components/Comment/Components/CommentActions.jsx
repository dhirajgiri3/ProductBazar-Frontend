import React, { useState, useRef, useEffect } from 'react';
import { FaHeart, FaRegHeart, FaReply, FaEdit, FaTrash, FaEllipsisH } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

// Simple button animations - reduced complexity
const iconButtonVariants = {
  hover: { scale: 1.05 },
  tap: { scale: 0.95 }
};

// Simple dropdown animation
const dropdownVariants = {
  hidden: { opacity: 0, y: -5, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1 }
};

const ActionButton = ({ 
  icon: Icon, 
  label, 
  count, 
  active = false, 
  colorClass = 'text-gray-500 hover:text-violet-500 dark:text-gray-400 dark:hover:text-violet-400', 
  activeColorClass = 'text-violet-500 dark:text-violet-400', 
  onClick, 
  ariaLabel
}) => {
  return (
    <motion.button
      onClick={onClick}
      className={`flex items-center gap-1.5 text-xs font-medium rounded-full px-3 py-1.5 transition-colors ${active ? activeColorClass : colorClass} hover:bg-violet-100 dark:hover:bg-violet-900/30`}
      variants={iconButtonVariants}
      whileHover="hover"
      whileTap="tap"
      aria-label={ariaLabel}
    >
      <Icon size={14} />
      {label && <span>{label}</span>}
      {count !== undefined && count > 0 && (
        <span className={`font-semibold ${active ? 'text-violet-600 dark:text-violet-500' : 'text-gray-700 dark:text-gray-300'}`}>
          {count}
        </span>
      )}
    </motion.button>
  );
};

const CommentActions = ({ comment, user, onLike, onReply, onEdit, onDelete, depth, canReply }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const isOwner = user && (comment.user?._id === user._id || user.role === 'admin');
  const maxDepthReached = depth >= 4;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <div className="flex items-center flex-wrap gap-1 mt-2">
      {/* Like button */}
      <ActionButton
        icon={comment.likes?.userHasLiked ? FaHeart : FaRegHeart}
        count={comment.likes?.count || 0}
        active={comment.likes?.userHasLiked}
        activeColorClass="text-red-500 dark:text-red-400"
        colorClass="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
        onClick={onLike}
        ariaLabel={comment.likes?.userHasLiked ? 'Unlike comment' : 'Like comment'}
      />
      
      {/* Reply button */}
      {canReply && !maxDepthReached && (
        <ActionButton
          icon={FaReply}
          label="Reply"
          onClick={onReply}
          ariaLabel="Reply to comment"
        />
      )}
      
      {/* Options menu for edit/delete (owner only) */}
      {isOwner && (
        <div className="relative inline-block" ref={menuRef}>
          <motion.button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-full text-gray-500 hover:bg-violet-100 hover:text-violet-700 dark:text-gray-400 dark:hover:bg-violet-800/40 dark:hover:text-violet-300 focus:outline-none"
            variants={iconButtonVariants}
            whileHover="hover"
            whileTap="tap"
            aria-label="Comment options"
          >
            <FaEllipsisH size={14} />
          </motion.button>
          
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={dropdownVariants}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-1 w-36 origin-top-right rounded-lg shadow-md bg-white dark:bg-gray-800 ring-1 ring-black/5 dark:ring-white/10 focus:outline-none z-10"
              >
                <div className="py-1 divide-y divide-gray-100 dark:divide-gray-700">
                  {/* Edit option */}
                  <button 
                    onClick={() => {
                      onEdit();
                      setMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-violet-50 dark:hover:bg-violet-900/30 hover:text-violet-700 dark:hover:text-violet-300 transition-colors"
                  >
                    <FaEdit size={12} className="text-violet-500 dark:text-violet-400" />
                    <span>Edit</span>
                  </button>
                  
                  {/* Delete option */}
                  <button 
                    onClick={() => {
                      onDelete();
                      setMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                  >
                    <FaTrash size={12} />
                    <span>Delete</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default CommentActions;