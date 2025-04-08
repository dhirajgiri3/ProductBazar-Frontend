// src/Components/Comments/CommentItem.jsx
import React, { useState, useCallback } from "react";
import { Avatar } from "@mui/material";
import { FormatTimeAgo } from "../../../../../../Utils/FormatTimeAgo";
import CommentActions from "./CommentActions";
import CommentForm from "./CommentForm";
import { FaChevronDown, FaChevronRight, FaReply, FaUser } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

// Simplified animation variants
const commentVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.3 } 
  },
  exit: { 
    opacity: 0, 
    transition: { duration: 0.2 } 
  }
};

const repliesVariants = {
  hidden: { 
    opacity: 0, 
    height: 0
  },
  visible: {
    opacity: 1,
    height: "auto"
  }
};

// Recursive component to render nested replies with simpler design
const NestedReplies = ({ replies, parentComment, depth, ...handlers }) => {
  if (!replies || replies.length === 0) return null;

  // Simple indentation based on depth
  const indentClass = `ml-${Math.min((depth + 1) * 3, 12)}`; 
  
  // Simplified border 
  const borderClass = depth > 0 
    ? "border-l-2 border-gray-200 dark:border-gray-700 pl-4" 
    : "pl-0";

  return (
    <motion.div 
      className={`mt-4 ${indentClass} ${borderClass} space-y-4`}
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

// Simplified comment item with clean design
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
  const [showReplies, setShowReplies] = useState(false);
  
  // Derive state based on props
  const isReplying = activeReplyId === comment._id;
  const isEditing = activeEditId === comment._id;
  const effectiveParentComment = isReply ? parentComment : comment;

  // Check if the current user is the comment owner (to prevent self-replying)
  const isOwnComment = user && comment.user && user._id === comment.user._id;

  const handleToggleReplies = useCallback(() => {
    setShowReplies((prev) => !prev);
  }, []);

  const handleLike = useCallback(() => {
    const parentId = isReply ? parentComment?._id : null;
    const isNestedReply = !!parentComment;
    onLike(comment._id, isNestedReply, parentId);
  }, [onLike, comment._id, isReply, parentComment]);

  const handleStartReply = useCallback(() => {
    // If this is user's own comment, this shouldn't be called
    // but we add extra protection here
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

  // Simpler avatar size based on depth
  const avatarSize = isReply ? 32 : 36;

  return (
    <motion.div
      layout
      variants={commentVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm transition-all duration-200 ${
        isEditing ? "ring-1 ring-violet-400 dark:ring-violet-500" : ""
      }`}
    >
      <div className="flex gap-3">
        {/* Simpler avatar */}
        <Avatar
          src={comment.user?.profilePicture?.url}
          alt={comment.user?.fullName || "User"}
          sx={{
            width: avatarSize,
            height: avatarSize,
            bgcolor: "secondary.main",
          }}
          className="flex-shrink-0"
        >
          {comment.user?.firstName?.charAt(0) || <FaUser />}
        </Avatar>
        
        <div className="flex-grow min-w-0">
          <div className="flex justify-between items-start flex-wrap gap-x-2">
            <div>
              <h4 className="font-medium text-sm text-gray-800 dark:text-gray-100 flex items-center">
                {comment.user?.fullName || "Anonymous User"}
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
              <span className="text-xs text-gray-500 dark:text-gray-400">
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
              placeholder={comment.parent ? "Edit your reply..." : "Edit your comment..."}
              autoFocus={true}
              maxLength={comment.parent ? 500 : 1000} // Different limits for comments vs replies
            />
          ) : (
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 break-words leading-relaxed">
              {comment.content}
            </p>
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

          {/* Simplified Show/Hide Replies Button */}
          {hasNestedReplies && !isEditing && (
            <button
              onClick={handleToggleReplies}
              className="mt-3 flex items-center gap-1.5 text-xs font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors"
            >
              {showReplies ? <FaChevronDown size={10} /> : <FaChevronRight size={10} />}
              <span>
                {showReplies ? "Hide" : "Show"} {comment.replies.length}{" "}
                {comment.replies.length === 1 ? "reply" : "replies"}
              </span>
            </button>
          )}

          {/* Render Nested Replies */}
          <AnimatePresence>
            {showReplies && !isEditing && (
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
            transition={{ duration: 0.2 }}
            className="mt-4"
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
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CommentItem;