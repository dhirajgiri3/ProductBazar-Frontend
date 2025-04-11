"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { Avatar } from "@mui/material";
import { FormatTimeAgo } from "../../../../../../Utils/FormatTimeAgo";
import CommentActions from "./CommentActions";
import CommentForm from "./CommentForm";
import { FaChevronDown, FaChevronRight, FaReply, FaUser, FaBadgeCheck } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

// Enhanced animation variants
const commentVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.4, type: "spring", stiffness: 100 } 
  },
  exit: { 
    opacity: 0,
    y: -10,
    transition: { duration: 0.2 } 
  }
};

const repliesVariants = {
  hidden: { 
    opacity: 0, 
    height: 0,
    transition: { duration: 0.3, when: "afterChildren" }
  },
  visible: {
    opacity: 1,
    height: "auto",
    transition: { 
      duration: 0.4, 
      when: "beforeChildren",
      staggerChildren: 0.1 
    }
  }
};

// Improved NestedReplies component with better visual hierarchy
const NestedReplies = ({ replies, parentComment, depth, ...handlers }) => {
  if (!replies || replies.length === 0) return null;

  // Better indentation with diminishing returns for deeper nesting
  const getIndentClass = () => {
    if (depth === 0) return "ml-0";
    if (depth === 1) return "ml-4";
    if (depth === 2) return "ml-6";
    if (depth >= 3) return "ml-8";
  };
  
  // Better border styling for depth levels
  const getBorderClass = () => {
    if (depth === 0) return "pl-0";
    if (depth === 1) return "border-l-2 border-violet-200 dark:border-violet-800/40 pl-4";
    if (depth === 2) return "border-l-2 border-violet-100 dark:border-violet-900/30 pl-4";
    if (depth >= 3) return "border-l border-gray-200 dark:border-gray-700 pl-4";
  };

  return (
    <motion.div 
      className={`mt-4 ${getIndentClass()} ${getBorderClass()} space-y-4`}
      variants={repliesVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      {replies.map((reply) => (
        <CommentItem
          key={reply._id}
          comment={reply}
          parentComment={parentComment}
          depth={depth + 1}
          isReply={true}
          {...handlers}
        />
      ))}
    </motion.div>
  );
};

// Enhanced CommentItem with better accessibility and animations
const CommentItem = ({
  comment,
  parentComment = null,
  depth = 0,
  isReply = false,
  user,
  onLike,
  onStartReply,
  onSubmitReply,
  onCancelReply,
  onStartEdit,
  onSubmitEdit,
  onCancelEdit,
  onDelete,
  activeReplyId,
  activeEditId,
  isSubmitting,
}) => {
  const [showReplies, setShowReplies] = useState(depth < 2); // Auto-expand first two levels
  const [isHovered, setIsHovered] = useState(false);
  const commentRef = useRef(null);
  
  // Derive state based on props
  const isReplying = activeReplyId === comment._id;
  const isEditing = activeEditId === comment._id;
  const effectiveParentComment = isReply ? parentComment : comment;

  // Check if the current user is the comment owner or admin
  const isOwnComment = user && comment.user && user._id === comment.user._id;
  const isAdmin = user && user.role === 'admin';
  const isMaker = comment.user?.isMaker || false;

  // Scroll into view when replying or editing
  useEffect(() => {
    if ((isReplying || isEditing) && commentRef.current) {
      // Delay to ensure UI is updated
      setTimeout(() => {
        commentRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [isReplying, isEditing]);

  const handleToggleReplies = useCallback(() => {
    setShowReplies((prev) => !prev);
  }, []);

  const handleLike = useCallback(() => {
    const parentId = isReply ? parentComment?._id : null;
    const isNestedReply = !!parentComment;
    onLike(comment._id, isNestedReply, parentId);
  }, [onLike, comment._id, isReply, parentComment]);

  const handleStartReply = useCallback(() => {
    if (isOwnComment) {
      return;
    }
    onStartReply(comment._id, comment.user?.fullName || "User");
  }, [onStartReply, comment._id, comment.user?.fullName, isOwnComment]);

  const handleStartEdit = useCallback(() => {
    onStartEdit(comment);
  }, [onStartEdit, comment]);

  const handleDelete = useCallback(() => {
    const parentId = isReply ? parentComment?._id : null;
    onDelete(parentId, comment._id);
  }, [onDelete, isReply, parentComment?._id, comment._id]);

  const handleSubmitLocalReply = useCallback(
    (content) => {
      onSubmitReply(effectiveParentComment._id, comment._id, content);
    },
    [onSubmitReply, effectiveParentComment._id, comment._id]
  );

  const handleSubmitLocalEdit = useCallback(
    (content) => {
      const isReply = !!parentComment;
      onSubmitEdit(
        isReply ? parentComment._id : null,
        comment._id,
        content,
        isReply
      );
    },
    [onSubmitEdit, comment._id, parentComment]
  );

  const hasNestedReplies = comment.replies && comment.replies.length > 0;
  const replyTargetName = comment.replyingTo?.fullName || "";

  // Determine avatar size based on depth
  const avatarSize = isReply ? 30 : 36;

  // Enhanced shade for depth
  const getBackgroundClass = () => {
    if (depth === 0) return "bg-white dark:bg-gray-800";
    if (depth === 1) return "bg-white dark:bg-gray-800/95";
    if (depth === 2) return "bg-gray-50/80 dark:bg-gray-800/90";
    return "bg-gray-50/60 dark:bg-gray-800/80";
  };

  return (
    <motion.div
      ref={commentRef}
      layout
      variants={commentVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`${getBackgroundClass()} rounded-lg p-4 shadow-sm transition-all duration-200 ${
        isEditing ? "ring-2 ring-violet-400 dark:ring-violet-500" : ""
      } ${isReplying ? "ring-1 ring-violet-200 dark:ring-violet-800" : ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      id={`comment-${comment._id}`}
    >
      <div className="flex gap-3">
        {/* Enhanced avatar with status indicators */}
        <div className="relative flex-shrink-0">
          <Avatar
            src={comment.user?.profilePicture?.url}
            alt={comment.user?.fullName || "User"}
            sx={{
              width: avatarSize,
              height: avatarSize,
              bgcolor: isMaker ? "primary.main" : "secondary.main",
            }}
            className={`flex-shrink-0 ${isMaker ? "ring-2 ring-violet-300 dark:ring-violet-600" : ""}`}
          >
            {comment.user?.firstName?.charAt(0) || <FaUser />}
          </Avatar>
          
          {/* Verified badge for maker or admin */}
          {(isMaker || isAdmin) && (
            <div className="absolute -bottom-1 -right-1 bg-violet-500 text-white rounded-full p-0.5 border border-white dark:border-gray-800">
              <FaBadgeCheck size={10} />
            </div>
          )}
        </div>
        
        <div className="flex-grow min-w-0">
          <div className="flex justify-between items-start flex-wrap gap-x-2">
            <div>
              <h4 className="font-medium text-sm text-gray-800 dark:text-gray-100 flex items-center group">
                {comment.user?.fullName || "Anonymous User"}
                
                {/* Role badge */}
                {isMaker && (
                  <span className="ml-2 text-xs py-0.5 px-1.5 bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 rounded-full">
                    Maker
                  </span>
                )}
                {isAdmin && !isMaker && (
                  <span className="ml-2 text-xs py-0.5 px-1.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full">
                    Admin
                  </span>
                )}
                
                {isReply && replyTargetName && (
                  <span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-1.5 inline-flex items-center">
                    <FaReply
                      className="inline mr-0.5 transform scale-x-[-1]"
                      size={10}
                    />
                    @{replyTargetName.split(" ")[0]}
                  </span>
                )}
              </h4>
              <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                {FormatTimeAgo(comment.createdAt)}
                {comment.createdAt !== comment.updatedAt && (
                  <span className="italic ml-1.5 opacity-80">
                    (edited)
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Comment Content or Edit Form */}
          {isEditing ? (
            <CommentForm
              user={user}
              onSubmit={handleSubmitLocalEdit}
              initialContent={comment.content}
              onCancel={onCancelEdit}
              isSubmitting={isSubmitting}
              submitLabel="Save"
              placeholder={isReply ? "Edit your reply..." : "Edit your comment..."}
              autoFocus={true}
              maxLength={isReply ? 500 : 1000} // Different limits for comments vs replies
            />
          ) : (
            <motion.p 
              className="text-sm text-gray-700 dark:text-gray-300 mt-2 break-words leading-relaxed whitespace-pre-line"
              initial={{ opacity: 0.8 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {comment.content}
            </motion.p>
          )}

          {/* Actions only shown when not editing */}
          {!isEditing && (
            <CommentActions
              comment={comment}
              user={user}
              onLike={handleLike}
              onReply={handleStartReply}
              onEdit={handleStartEdit}
              onDelete={handleDelete}
              depth={depth}
              canReply={!isOwnComment && depth < 5} // Disable reply if it's own comment or max depth reached
            />
          )}

          {/* Replies toggle with animation */}
          {hasNestedReplies && !isEditing && (
            <motion.button
              onClick={handleToggleReplies}
              className="mt-3 flex items-center gap-1.5 text-xs font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 rounded-md px-2 py-1"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              aria-expanded={showReplies}
              aria-controls={`replies-${comment._id}`}
            >
              <motion.div
                animate={{ rotate: showReplies ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                {showReplies ? <FaChevronDown size={10} /> : <FaChevronRight size={10} />}
              </motion.div>
              <span>
                {showReplies ? "Hide" : "Show"} {comment.replies.length}{" "}
                {comment.replies.length === 1 ? "reply" : "replies"}
              </span>
            </motion.button>
          )}

          {/* Render Nested Replies */}
          <AnimatePresence>
            {showReplies && !isEditing && (
              <div id={`replies-${comment._id}`}>
                <NestedReplies
                  replies={comment.replies}
                  parentComment={effectiveParentComment}
                  depth={depth}
                  user={user}
                  onLike={onLike}
                  onStartReply={onStartReply}
                  onSubmitReply={onSubmitReply}
                  onCancelReply={onCancelReply}
                  onStartEdit={onStartEdit}
                  onSubmitEdit={onSubmitEdit}
                  onCancelEdit={onCancelEdit}
                  onDelete={onDelete}
                  activeReplyId={activeReplyId}
                  activeEditId={activeEditId}
                  isSubmitting={isSubmitting}
                />
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Reply Form */}
      <AnimatePresence>
        {isReplying && (
          <motion.div
            key="reply-form"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700"
          >
            <CommentForm
              user={user}
              onSubmit={handleSubmitLocalReply}
              onCancel={onCancelReply}
              isSubmitting={isSubmitting}
              submitLabel="Reply"
              placeholder={`Replying to ${comment.user?.fullName || "User"}...`}
              autoFocus={true}
              initialContent={
                comment.replyMention
                  ? `@${comment.replyMention.split(" ")[0]} `
                  : ""
              }
              maxLength={500} // Shorter max length for replies
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CommentItem;