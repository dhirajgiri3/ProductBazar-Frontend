"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "../../../../../Contexts/Auth/AuthContext";
import { useProduct } from "../../../../../Contexts/Product/ProductContext";
import { useToast } from "../../../../../Contexts/Toast/ToastContext";
import LoaderComponent from "../../../../../Components/UI/LoaderComponent";
import DeleteCommentModal from "../../../../../Components/Modal/Comment/DeleteCommentModal";
import LoginPrompt from "../../../../../Components/common/Auth/LoginPrompt";
import CommentForm from "./Components/CommentForm";
import CommentItem from "./Components/CommentItem";
import { motion, AnimatePresence } from "framer-motion";
import { FaComments, FaLightbulb } from "react-icons/fa";
import { useRecommendation } from "../../../../../Contexts/Recommendation/RecommendationContext";

// Comment counter component with minimal animation
const CommentCounter = ({ count = 0 }) => {
  return (
    <div className="flex items-center justify-center bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 py-1 px-2.5 rounded-full text-sm font-medium">
      {count}
    </div>
  );
};

// Simple section header component
const SectionHeader = ({ title, count }) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-violet-500 rounded-lg text-white">
          <FaComments size={24} />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
          {title}
        </h2>
        <CommentCounter count={count} />
      </div>
    </div>
  );
};

// Empty state component with minimal design
const EmptyState = () => {
  return (
    <div className="text-center py-12 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
      <div className="mx-auto mb-4 w-16 h-16 flex items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-500 dark:text-violet-400">
        <FaLightbulb size={24} />
      </div>
      <h3 className="font-semibold text-lg mb-2">Be the first to comment</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto">
        Share your thoughts and start the conversation. Your insights are
        valuable to our community.
      </p>
    </div>
  );
};

// Enhanced skeleton loader
const SkeletonLoader = ({ count = 3 }) => {
  return (
    <div className="space-y-5">
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm animate-pulse"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0"></div>
            <div className="flex-grow space-y-3">
              <div className="flex justify-between">
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-1/4"></div>
                  <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full w-1/6"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded-full w-full"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded-full w-full"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded-full w-3/4"></div>
              </div>
              <div className="pt-2 flex gap-2">
                <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Clean sign-in prompt component
const SignInPrompt = ({ onClick }) => {
  return (
    <div
      onClick={onClick}
      className="mb-8 p-5 bg-white dark:bg-gray-800 rounded-xl text-center text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-violet-400 dark:hover:border-violet-500 cursor-pointer transition-colors shadow-sm"
    >
      <div className="flex flex-col items-center py-6">
        <div className="text-violet-500 dark:text-violet-400 mb-4 p-3 bg-violet-100 dark:bg-violet-900/30 rounded-full">
          <FaComments size={24} />
        </div>

        <p className="font-medium text-lg text-gray-800 dark:text-gray-200 mb-2">
          Sign in to join the conversation
        </p>

        <p className="text-sm mb-5 max-w-xs mx-auto">
          Share your thoughts, ask questions, and connect with our community
        </p>

        <button className="mt-2 bg-violet-500 hover:bg-violet-600 text-white px-6 py-2.5 rounded-lg font-medium shadow-sm flex items-center gap-2">
          Join the conversation
        </button>
      </div>
    </div>
  );
};

// Load More button component
const LoadMoreButton = ({ onClick, isLoading }) => {
  return (
    <button
      onClick={onClick}
      className="px-6 py-2.5 bg-white dark:bg-gray-800 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-xl text-sm font-medium text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-800 transition-colors disabled:opacity-50 shadow-sm"
      disabled={isLoading}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <LoaderComponent size="small" />
          <span>Loading more comments...</span>
        </span>
      ) : (
        <span className="flex items-center gap-2">
          <span>Load More Comments</span>
          <span>↓</span>
        </span>
      )}
    </button>
  );
};

// Main CommentSection component
const CommentSection = ({ productSlug, productId }) => {
  const { user } = useAuth();
  const {
    getComments,
    addComment,
    editComment,
    deleteComment,
    toggleCommentLike,
    addReply,
    editReply,
    deleteReply,
  } = useProduct();
  const { showToast } = useToast();
  const { recordInteraction } = useRecommendation();

  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [activeEditId, setActiveEditId] = useState(null);
  const [currentLocation, setCurrentLocation] = useState("");
  const commentSectionRef = useRef(null);

  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    itemType: null,
    parentId: null,
    itemId: null,
    content: null,
    isLoading: false,
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentLocation(window.location.pathname);
    }
  }, []);

  // Fetch initial comments
  useEffect(() => {
    const loadInitialComments = async () => {
      if (!productSlug) return;
      setLoading(true);
      try {
        const result = await getComments(productSlug, { page: 1 });
        if (result.success) {
          setComments(result.comments || []);
          setPagination(result.pagination || null);
          setPage(1);
        } else {
          showToast("error", result.message || "Failed to load comments");
          setComments([]);
        }
      } catch (error) {
        console.error("Error fetching comments:", error);
        showToast("error", "An error occurred while loading comments");
        setComments([]);
      } finally {
        setLoading(false);
      }
    };
    loadInitialComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productSlug, getComments, showToast]);

  // Load More Comments
  const loadMoreComments = useCallback(async () => {
    if (!pagination || !pagination.hasNextPage || loadingMore) return;

    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const result = await getComments(productSlug, { page: nextPage });
      if (result.success) {
        setComments((prev) => [...prev, ...(result.comments || [])]);
        setPagination(result.pagination || null);
        setPage(nextPage);
      } else {
        showToast("error", result.message || "Failed to load more comments");
      }
    } catch (error) {
      console.error("Error fetching more comments:", error);
      showToast("error", "An error occurred while loading more comments");
    } finally {
      setLoadingMore(false);
    }
  }, [productSlug, page, pagination, loadingMore, getComments, showToast]);

  // Authentication Check
  const requireAuth = useCallback(
    (action) => {
      if (!user) {
        setShowLoginPrompt(true);
        return false;
      }
      setShowLoginPrompt(false);
      action();
      return true;
    },
    [user]
  );

  // CRUD Helpers for State Updates
  const findAndUpdate = (items, targetId, updateFn) => {
    return items.map((item) => {
      if (item._id === targetId) {
        return updateFn(item);
      }
      if (item.replies && item.replies.length > 0) {
        return {
          ...item,
          replies: findAndUpdate(item.replies, targetId, updateFn),
        };
      }
      return item;
    });
  };

  const findAndAddReply = (items, parentId, newReply) => {
    return items.map((item) => {
      if (item._id === parentId) {
        return { ...item, replies: [...(item.replies || []), newReply] };
      }
      if (item.replies && item.replies.length > 0) {
        return {
          ...item,
          replies: findAndAddReply(item.replies, parentId, newReply),
        };
      }
      return item;
    });
  };

  const findAndRemove = (items, targetId) => {
    let found = false;
    const filtered = items.filter((item) => {
      if (item._id === targetId) {
        found = true;
        return false;
      }
      return true;
    });

    if (found) return filtered;

    return items.map((item) => {
      if (item.replies && item.replies.length > 0) {
        const updatedReplies = findAndRemove(item.replies, targetId);
        if (updatedReplies.length !== item.replies.length) {
          return { ...item, replies: updatedReplies };
        }
      }
      return item;
    });
  };

  // Helper function to check if user is the owner of a comment
  const isUserCommentOwner = (commentOrReply) => {
    return user && commentOrReply.user && commentOrReply.user._id === user._id;
  };

  // Comment Actions
  const handleAddComment = useCallback(
    async (content) => {
      if (!user) {
        setShowLoginPrompt(true);
        return;
      }

      if (!content.trim()) {
        showToast("error", "Comment cannot be empty");
        return;
      }
      setSubmitting(true);
      try {
        const result = await addComment(productSlug, content.trim());
        if (result.success && result.data) {
          // Add to top of the list
          setComments((prev) => [result.data, ...prev]);
          showToast("success", "Comment added!");
          // Update total count in pagination if available
          setPagination((prev) =>
            prev ? { ...prev, total: (prev.total || 0) + 1 } : null
          );
        } else {
          showToast("error", result.message || "Failed to add comment");
        }
      } catch (error) {
        console.error("Error adding comment:", error);
        showToast("error", "Failed to add comment");
      } finally {
        setSubmitting(false);
      }
    },
    [productSlug, user, addComment, showToast]
  );

  const handleStartEdit = useCallback((item) => {
    setActiveEditId(item._id);
    setActiveReplyId(null); // Close reply form if editing
  }, []);

  const handleCancelEdit = useCallback(() => {
    setActiveEditId(null);
  }, []);

  const handleEditSubmit = useCallback(
    async (parentId, itemId, content, isReply = false) => {
      requireAuth(async () => {
        if (!content.trim()) {
          showToast("error", "Content cannot be empty");
          return;
        }

        setSubmitting(true);
        try {
          let result;
          if (isReply) {
            // Handle reply edit
            result = await editReply(productSlug, parentId, itemId, content);
          } else {
            // Handle comment edit
            result = await editComment(productSlug, itemId, content);
          }

          if (result.success && result.data) {
            setComments((prev) =>
              findAndUpdate(prev, itemId, (item) => ({
                ...result.data,
                replies: result.data.replies || item.replies,
              }))
            );
            showToast("success", "Update successful!");
            handleCancelEdit();
          } else {
            showToast("error", result.message || "Failed to update");
          }
        } catch (error) {
          console.error("Error updating item:", error);
          showToast("error", "Failed to update");
        } finally {
          setSubmitting(false);
        }
      });
    },
    [
      productSlug,
      requireAuth,
      editComment,
      editReply,
      showToast,
      handleCancelEdit,
    ]
  );

  const handleDeleteClick = useCallback(
    (parentId, itemId, content, isReply) => {
      setDeleteModalState({
        isOpen: true,
        itemType: isReply ? "reply" : "comment",
        parentId,
        itemId,
        content,
        isLoading: false,
      });
    },
    []
  );

  const handleDeleteConfirm = useCallback(async () => {
    const { itemType, parentId, itemId } = deleteModalState;
    requireAuth(async () => {
      setDeleteModalState((prev) => ({ ...prev, isLoading: true }));
      try {
        const apiCall = itemType === "reply" ? deleteReply : deleteComment;
        const args =
          itemType === "reply"
            ? [productSlug, parentId, itemId]
            : [productSlug, itemId];

        const result = await apiCall(...args);

        if (result.success) {
          // Remove the item from state immutably
          setComments((prev) => findAndRemove(prev, itemId));
          showToast(
            "success",
            `${itemType === "reply" ? "Reply" : "Comment"} deleted.`
          );
          // Optionally update total count
          setPagination((prev) =>
            prev ? { ...prev, total: Math.max(0, (prev.total || 0) - 1) } : null
          );
          setDeleteModalState({
            isOpen: false,
            itemId: null,
            isLoading: false,
          });
        } else {
          showToast("error", result.message || "Failed to delete");
          setDeleteModalState((prev) => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error("Error deleting item:", error);
        showToast("error", "Failed to delete item");
        setDeleteModalState((prev) => ({ ...prev, isLoading: false }));
      }
    });
  }, [
    productSlug,
    deleteModalState,
    requireAuth,
    deleteComment,
    deleteReply,
    showToast,
  ]);

  const handleLike = useCallback(
    async (itemId, isNestedReply, parentId) => {
      requireAuth(async () => {
        // Optimistic update
        setComments((prev) =>
          findAndUpdate(prev, itemId, (item) => ({
            ...item,
            likes: {
              count:
                (item.likes?.count || 0) + (item.likes?.userHasLiked ? -1 : 1),
              userHasLiked: !item.likes?.userHasLiked,
            },
          }))
        );

        try {
          const result = await toggleCommentLike(
            productSlug,
            itemId,
            isNestedReply,
            parentId
          );

          if (result.success && result.data) {
            // Update with server data
            setComments((prev) =>
              findAndUpdate(prev, itemId, (item) => ({
                ...item,
                likes: {
                  count: result.data.likeCount,
                  userHasLiked: result.data.isLiked,
                },
              }))
            );

            // Track interaction for recommendations
            await recordInteraction(
              productSlug,
              isNestedReply ? "reply_like" : "comment_like",
              {
                commentId: itemId,
                parentId: parentId,
              }
            );
          } else {
            // Revert optimistic update on failure
            setComments((prev) =>
              findAndUpdate(prev, itemId, (item) => ({
                ...item,
                likes: {
                  count:
                    (item.likes?.count || 0) +
                    (item.likes?.userHasLiked ? -1 : 1),
                  userHasLiked: !item.likes?.userHasLiked,
                },
              }))
            );
            showToast("error", result.message || "Failed to toggle like");
          }
        } catch (error) {
          // Revert optimistic update on error
          setComments((prev) =>
            findAndUpdate(prev, itemId, (item) => ({
              ...item,
              likes: {
                count:
                  (item.likes?.count || 0) +
                  (item.likes?.userHasLiked ? -1 : 1),
                userHasLiked: !item.likes?.userHasLiked,
              },
            }))
          );
          console.error("Error toggling like:", error);
          showToast("error", "Failed to toggle like");
        }
      });
    },
    [productSlug, requireAuth, toggleCommentLike, showToast, recordInteraction]
  );

  // Reply Actions
  const handleStartReply = useCallback(
    (targetId, targetUsername) => {
      if (!user) {
        setShowLoginPrompt(true);
        return;
      }

      // Find the comment or reply with targetId
      let targetComment = null;
      for (const comment of comments) {
        if (comment._id === targetId) {
          targetComment = comment;
          break;
        }
        // Check in replies
        if (comment.replies) {
          const foundReply = comment.replies.find(
            (reply) => reply._id === targetId
          );
          if (foundReply) {
            targetComment = foundReply;
            break;
          }
        }
      }

      // Don't allow replying to own comments/replies
      if (targetComment && isUserCommentOwner(targetComment)) {
        showToast("error", "You cannot reply to your own comment");
        return;
      }

      setActiveReplyId(targetId);
      setActiveEditId(null);
    },
    [user, comments, showToast, isUserCommentOwner]
  );

  const handleCancelReply = useCallback(() => {
    setActiveReplyId(null);
  }, []);

  const handleSubmitReply = useCallback(
    async (rootCommentId, parentReplyId, content) => {
      requireAuth(async () => {
        if (!content.trim()) {
          showToast("error", "Reply cannot be empty");
          return;
        }

        // Find target comment or reply
        let targetItem = null;
        comments.forEach((comment) => {
          if (comment._id === parentReplyId) {
            targetItem = comment;
          } else if (comment.replies) {
            const foundReply = comment.replies.find(
              (reply) => reply._id === parentReplyId
            );
            if (foundReply) {
              targetItem = foundReply;
            }
          }
        });

        // Don't allow replying to own comments/replies
        if (targetItem && isUserCommentOwner(targetItem)) {
          showToast("error", "You cannot reply to your own comment");
          setActiveReplyId(null);
          return;
        }

        setSubmitting(true);
        try {
          const result = await addReply(
            productSlug,
            rootCommentId, // Top-level comment ID
            content.trim(),
            { replyToId: parentReplyId } // Direct parent (could be a reply or top-level comment)
          );

          if (result.success && result.data) {
            setComments((prev) =>
              findAndAddReply(prev, parentReplyId, result.data)
            );
            showToast("success", "Reply added!");
            handleCancelReply();
            setPagination((prev) =>
              prev ? { ...prev, total: (prev.total || 0) + 1 } : null
            );
          } else {
            showToast("error", result.message || "Failed to add reply");
          }
        } catch (error) {
          console.error("Error adding reply:", error);
          let errorMessage = "Failed to add reply";

          // Handle specific error cases
          if (error.response?.data?.message) {
            errorMessage = error.response.data.message;

            // Special handling for "cannot reply to own comment" error
            if (errorMessage.includes("cannot reply to your own")) {
              handleCancelReply(); // Close reply form
            }
          }

          showToast("error", errorMessage);
        } finally {
          setSubmitting(false);
        }
      });
    },
    [
      productSlug,
      requireAuth,
      addReply,
      showToast,
      handleCancelReply,
      comments,
      isUserCommentOwner,
    ]
  );

  return (
    <div
      ref={commentSectionRef}
      className="mt-12 pt-10 border-t border-gray-200 dark:border-gray-700"
    >
      {/* Section header with comment count */}
      <SectionHeader
        title="Discussion"
        count={pagination?.total ?? comments.length ?? 0}
      />

      {/* New Comment Form */}
      {user ? (
        <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <CommentForm
            user={user}
            onSubmit={handleAddComment}
            placeholder="Share your thoughts on this product..."
            submitLabel="Post Comment"
            isSubmitting={submitting}
          />
        </div>
      ) : (
        <SignInPrompt onClick={() => setShowLoginPrompt(true)} />
      )}

      {/* Comments List */}
      <div className="space-y-6">
        {loading && comments.length === 0 ? (
          <SkeletonLoader count={3} />
        ) : !loading && comments.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-6">
            <AnimatePresence initial={false}>
              {comments.map((comment) => (
                <CommentItem
                  key={comment._id}
                  comment={comment}
                  depth={0}
                  user={user}
                  onLike={handleLike}
                  onStartReply={handleStartReply}
                  onSubmitReply={handleSubmitReply}
                  onCancelReply={handleCancelReply}
                  onStartEdit={handleStartEdit}
                  onSubmitEdit={handleEditSubmit}
                  onCancelEdit={handleCancelEdit}
                  onDelete={(parentId, itemId) =>
                    handleDeleteClick(parentId, itemId, comment.content, false)
                  }
                  activeReplyId={activeReplyId}
                  activeEditId={activeEditId}
                  isSubmitting={submitting}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Load More Button */}
      {pagination && pagination.hasNextPage && (
        <div className="mt-10 flex justify-center">
          <LoadMoreButton onClick={loadMoreComments} isLoading={loadingMore} />
        </div>
      )}

      {/* Modals */}
      <LoginPrompt
        isOpen={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        message="Join the conversation and interact with this product's community."
        title="Sign in to comment"
        redirectUrl={currentLocation}
      />

      <DeleteCommentModal
        isOpen={deleteModalState.isOpen}
        onClose={() =>
          setDeleteModalState({ isOpen: false, itemId: null, isLoading: false })
        }
        onConfirm={handleDeleteConfirm}
        title={`Delete ${deleteModalState.itemType || "Item"}?`}
        message={`Are you sure you want to permanently delete this ${deleteModalState.itemType}? This action cannot be undone.`}
        content={deleteModalState.content}
        isLoading={deleteModalState.isLoading}
      />
    </div>
  );
};

export default CommentSection;
