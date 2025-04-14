"use client";

import React, { useState, useEffect, useRef } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { useProduct } from "../../../Contexts/Product/ProductContext";
import { useAuth } from "../../../Contexts/Auth/AuthContext";
import { useToast } from "../../../Contexts/Toast/ToastContext";
import { useRecommendation } from "../../../Contexts/Recommendation/RecommendationContext";
import { addProductToMapping } from "../../../Utils/productMappingUtils";
import eventBus, { EVENT_TYPES } from "../../../Utils/eventBus";
import logger from "../../../Utils/logger";

/**
 * Centralized Bookmark Button component
 *
 * @param {Object} props
 * @param {Object} props.product - The product object
 * @param {string} props.slug - The product slug (alternative to product object)
 * @param {boolean} props.hasBookmarked - Initial bookmark state (alternative to product object)
 * @param {number} props.bookmarkCount - Initial bookmark count (alternative to product object)
 * @param {string} props.size - Button size (sm, md, lg)
 * @param {string} props.source - Source of the interaction (for analytics)
 * @param {Function} props.onSuccess - Callback after successful bookmark
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.showCount - Whether to show the bookmark count
 * @param {boolean} props.showText - Whether to show text label
 * @param {boolean} props.disabled - Whether the button is disabled
 */
const BookmarkButton = ({
  product,
  slug,
  hasBookmarked: initialHasBookmarked,
  bookmarkCount: initialBookmarkCount,
  size = "md",
  source = "unknown",
  onSuccess,
  className = "",
  showCount = true,
  showText = false,
  disabled = false,
}) => {
  // Get the product slug from either the slug prop or the product object
  const productSlug = slug || product?.slug;

  // Determine initial state from props
  const getInitialBookmarked = () => {
    if (initialHasBookmarked !== undefined) return initialHasBookmarked;
    if (product?.userInteractions?.hasBookmarked !== undefined) return product.userInteractions.hasBookmarked;
    if (product?.bookmarks?.userHasBookmarked !== undefined) return product.bookmarks.userHasBookmarked;
    // Also check top-level bookmarked property if available
    if (product?.bookmarked !== undefined) return product.bookmarked;
    return false;
  };

  const getInitialCount = () => {
    if (initialBookmarkCount !== undefined) return initialBookmarkCount;
    // Prioritize top-level bookmarkCount (virtual field) if available
    if (product?.bookmarkCount !== undefined) return product.bookmarkCount;
    // Fallback to nested structure count
    if (product?.bookmarks?.count !== undefined) return product.bookmarks.count;
    return 0;
  };

  // State
  const [isBookmarked, setIsBookmarked] = useState(getInitialBookmarked());
  const [count, setCount] = useState(getInitialCount());
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Hooks
  const { toggleBookmark, productCache } = useProduct();
  const { isAuthenticated, user } = useAuth();
  const { showToast } = useToast();
  const { recordInteraction } = useRecommendation();

  // Track component mounted state to prevent updates after unmount
  const isMounted = useRef(true);

  // Listen for global bookmark events
  useEffect(() => {
    // Subscribe to bookmark events
    const unsubscribe = eventBus.subscribe(EVENT_TYPES.BOOKMARK_UPDATED, (data) => {
      // Only update if this component is for the updated product
      if ((productSlug && data.slug === productSlug) ||
          (product?._id && data.productId === product._id)) {

        logger.debug(`BookmarkButton received global update for ${productSlug || product?._id}:`, data);

        // Update count and bookmarked state from the event data
        if (isMounted.current) {
          // Always update the count
          setCount(data.count);

          // Get the current user ID from localStorage
          let currentUserId = localStorage.getItem('userId');

          // If userId is not directly available, try to get it from auth data
          if (!currentUserId) {
            try {
              const authData = localStorage.getItem('auth');
              if (authData) {
                const parsedAuth = JSON.parse(authData);
                currentUserId = parsedAuth?.user?._id;
              }

              // Also check user object from context
              if (!currentUserId && user && user._id) {
                currentUserId = user._id;
              }
            } catch (e) {
              logger.error('Error getting current user ID:', e);
            }
          }

          // Check if this event is for the current user
          const isCurrentUserAction = data.userId === currentUserId;

          // Update bookmarked state if it's included in the event data
          if (data.bookmarked !== undefined) {
            setIsBookmarked(data.bookmarked);
          }
          // Or if it's an action event (add/remove) for the current user
          else if (isCurrentUserAction && data.action) {
            setIsBookmarked(data.action === 'add');
          }

          logger.debug(`BookmarkButton updated state for ${productSlug}:`, {
            count: data.count,
            bookmarked: isCurrentUserAction ? (data.action === 'add') : data.bookmarked,
            isCurrentUserAction,
            userId: data.userId,
            currentUserId
          });
        }
      }
    });

    // Cleanup subscription on unmount
    return () => {
      isMounted.current = false;
      unsubscribe();
    };
  }, [productSlug, product?._id]);

  // Check for updates in the global product cache
  useEffect(() => {
    if (!productSlug || !isMounted.current) return;

    // Get the product from the global cache
    const cachedProduct = productCache[productSlug];

    if (cachedProduct) {
      logger.debug(`BookmarkButton found product in global cache for ${productSlug}:`, {
        bookmarkCount: cachedProduct.bookmarkCount,
        bookmarked: cachedProduct.bookmarked,
        userHasBookmarked: cachedProduct.bookmarks?.userHasBookmarked,
        userInteractions: cachedProduct.userInteractions
      });

      // Update count if it's different
      if (cachedProduct.bookmarkCount !== undefined && cachedProduct.bookmarkCount !== count) {
        setCount(cachedProduct.bookmarkCount);
      }

      // Determine the bookmarked state from all possible sources
      const cachedBookmarkedState =
        cachedProduct.bookmarked ??
        cachedProduct.bookmarks?.userHasBookmarked ??
        cachedProduct.userInteractions?.hasBookmarked ??
        false;

      // Only update if the state is different to avoid unnecessary re-renders
      if (cachedBookmarkedState !== isBookmarked) {
        logger.debug(`BookmarkButton updating bookmarked state for ${productSlug} from ${isBookmarked} to ${cachedBookmarkedState}`);
        setIsBookmarked(cachedBookmarkedState);
      }
    }
  }, [productSlug, productCache]);

  // Update state when props change
  useEffect(() => {
    const newBookmarked = getInitialBookmarked();
    const newCount = getInitialCount();

    // Add product to mapping for socket updates if available
    if (product && product._id && product.slug) {
      addProductToMapping(product);
    }

    // Only update state if there's an actual change to avoid unnecessary re-renders
    if (isBookmarked !== newBookmarked) {
      // Log when there's an actual change in bookmarked state
      logger.debug(`BookmarkButton bookmarked state changed for ${product?.slug || productSlug}:`, {
        oldBookmarked: isBookmarked,
        newBookmarked,
        source: 'props-change'
      });

      // Update the state
      setIsBookmarked(newBookmarked);
    }

    if (count !== newCount) {
      // Log when there's an actual change in count
      logger.debug(`BookmarkButton count changed for ${product?.slug || productSlug}:`, {
        oldCount: count,
        newCount,
        source: 'props-change'
      });

      // Update the state
      setCount(newCount);
    }

    // Set mounted flag
    isMounted.current = true;

    return () => {
      isMounted.current = false;
    };
  }, [
    // Update dependencies to include the checked properties
    product?.userInteractions?.hasBookmarked,
    product?.bookmarks?.userHasBookmarked,
    product?.bookmarkCount,
    product?.bookmarks?.count,
    initialHasBookmarked,
    initialBookmarkCount
  ]);

  // Handle bookmark action
  const handleBookmark = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Prevent action if not authenticated
    if (!isAuthenticated) {
      showToast("error", "Please log in to bookmark products");
      return;
    }

    // Prevent rapid clicks
    if (isLoading || isProcessing) return;

    setIsLoading(true);
    setIsProcessing(true);

    // Optimistic UI update - update state before calling API
    const previousState = isBookmarked;
    const previousCount = count;
    setIsBookmarked(!isBookmarked);

    // Update count based on bookmark action
    if (isBookmarked) {
      // Removing bookmark - ensure count doesn't go below 0
      setCount(prev => Math.max(0, prev - 1));
    } else {
      // Adding bookmark
      setCount(prev => prev + 1);
    }

    try {
      // Call API
      const result = await toggleBookmark(productSlug);

      if (!result.success) {
        // Revert optimistic update on failure - revert to previous state
        setIsBookmarked(previousState);
        setCount(previousCount);
        showToast("error", result.message || "Failed to update bookmark");
        return;
      }

      // Record interaction for recommendations
      if (recordInteraction) {
        try {
          await recordInteraction(
            productSlug,
            result.bookmarked ? "bookmark" : "remove_bookmark",
            {
              source,
              previousInteraction: !result.bookmarked ? "bookmarked" : "none",
            }
          );
        } catch (error) {
          // Only log detailed errors in development mode
          if (process.env.NODE_ENV === 'development') {
            console.error("Failed to record interaction:", error);
          }
        }
      }

      // Call success callback if provided
      if (onSuccess) {
        // Ensure we pass the correct count from the API response
        // The API returns the updated count after the operation
        const resultWithCount = {
          ...result,
          // Standardize where count is accessed from the API response
          count: result.bookmarkCount ?? result.count ?? count, // Prioritize bookmarkCount
        };

        // Update local state with the actual count from the server
        setCount(resultWithCount.count); // Ensure local state matches API result

        // Log only in development and only once per successful interaction
        if (process.env.NODE_ENV === 'development') {
          console.log('BookmarkButton API success:', {
            product: productSlug,
            bookmarked: result.bookmarked,
            count: resultWithCount.count
          });
        }

        // Pass the result to the parent component
        onSuccess(resultWithCount);
      }

      // Show success message
      showToast(
        "success",
        result.bookmarked ? "Product bookmarked successfully" : "Bookmark removed"
      );
    } catch (error) {
      // Only log detailed errors in development mode
      if (process.env.NODE_ENV === 'development') {
        console.error("Error toggling bookmark:", error);
      }
      // Revert optimistic update on error - revert to previous state
      setIsBookmarked(previousState);
      setCount(previousCount);
      showToast("error", "Something went wrong");
    } finally {
      setIsLoading(false);
      // Allow new interactions after a short delay
      setTimeout(() => {
        setIsProcessing(false);
      }, 500);
    }
  };

  // Size classes
  const sizeClasses = {
    sm: "p-1.5 rounded-full",
    md: "p-2 rounded-full",
    lg: "p-2.5 rounded-xl",
  };

  // Count size classes
  const countSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  // Icon size classes
  const iconSizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  // Log when the bookmarked state changes (for debugging)
  useEffect(() => {
    logger.debug(`BookmarkButton UI state for ${productSlug}:`, {
      isBookmarked,
      count,
      productId: product?._id,
      timestamp: Date.now()
    });
  }, [isBookmarked, count, productSlug, product?._id]);

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={handleBookmark}
        disabled={disabled || isLoading}
        className={`transition-all duration-200 ${
          isBookmarked
            ? "bg-violet-100 text-violet-700"
            : "text-gray-500 hover:bg-violet-50 hover:text-violet-600"
        } ${sizeClasses[size] || sizeClasses.md} ${className}`}
        title={isBookmarked ? "Remove bookmark" : "Save for later"}
        aria-label={isBookmarked ? "Remove bookmark" : "Save for later"}
      >
        {isBookmarked ? (
          <BookmarkCheck
            className={`${iconSizeClasses[size] || iconSizeClasses.md} ${
              isLoading ? "animate-pulse" : ""
            }`}
          />
        ) : (
          <Bookmark
            className={`${iconSizeClasses[size] || iconSizeClasses.md} ${
              isLoading ? "animate-pulse" : ""
            }`}
          />
        )}
        {showText && (
          <span className="ml-1.5">
            {isBookmarked ? "Saved" : "Save"}
          </span>
        )}
      </button>

      {showCount && (
        <span className={`font-medium text-gray-700 ${countSizeClasses[size] || countSizeClasses.md}`}>
          {count}
        </span>
      )}
    </div>
  );
};

export default BookmarkButton;