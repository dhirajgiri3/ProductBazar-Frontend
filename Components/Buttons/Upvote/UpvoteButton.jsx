"use client";

import React, { useState, useEffect, useRef } from "react";
import { ArrowUp } from "lucide-react";
import { useProduct } from "../../../Contexts/Product/ProductContext";
import { useAuth } from "../../../Contexts/Auth/AuthContext";
import { useToast } from "../../../Contexts/Toast/ToastContext";
import { useRecommendation } from "../../../Contexts/Recommendation/RecommendationContext";
import { addProductToMapping } from "../../../Utils/productMappingUtils";
import eventBus, { EVENT_TYPES } from "../../../Utils/eventBus";
import logger from "../../../Utils/logger";

/**
 * Centralized Upvote Button component
 *
 * @param {Object} props
 * @param {Object} props.product - The product object
 * @param {string} props.slug - The product slug (alternative to product object)
 * @param {boolean} props.hasUpvoted - Initial upvote state (alternative to product object)
 * @param {number} props.upvoteCount - Initial upvote count (alternative to product object)
 * @param {string} props.size - Button size (sm, md, lg)
 * @param {string} props.source - Source of the interaction (for analytics)
 * @param {Function} props.onSuccess - Callback after successful upvote
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.showCount - Whether to show the upvote count
 * @param {boolean} props.disabled - Whether the button is disabled
 */
const UpvoteButton = ({
  product,
  slug,
  hasUpvoted: initialHasUpvoted,
  upvoteCount: initialUpvoteCount,
  size = "md",
  source = "unknown",
  onSuccess,
  className = "",
  showCount = true,
  disabled = false,
}) => {
  // Get the product slug from either the slug prop or the product object
  const productSlug = slug || product?.slug;

  // Determine initial state from props
  const getInitialUpvoted = () => {
    // No logging here to avoid excessive console output
    if (initialHasUpvoted !== undefined) return initialHasUpvoted;
    if (product?.userInteractions?.hasUpvoted !== undefined) return product.userInteractions.hasUpvoted;
    if (product?.upvotes?.userHasUpvoted !== undefined) return product.upvotes.userHasUpvoted;
    // Also check top-level upvoted property if available
    if (product?.upvoted !== undefined) return product.upvoted;
    return false;
  };

  const getInitialCount = () => {
    if (initialUpvoteCount !== undefined) return initialUpvoteCount;
    if (product?.upvoteCount !== undefined) return product.upvoteCount;
    if (product?.upvotes?.count !== undefined) return product.upvotes.count;
    return 0;
  };

  // State
  const [isUpvoted, setIsUpvoted] = useState(getInitialUpvoted());
  const [count, setCount] = useState(getInitialCount());
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Hooks
  const { toggleUpvote, productCache } = useProduct();
  const { isAuthenticated, user } = useAuth();
  const { showToast } = useToast();
  const { recordInteraction } = useRecommendation();

  // Track component mounted state to prevent updates after unmount
  const isMounted = useRef(true);

  // Listen for global upvote events
  useEffect(() => {
    // Subscribe to upvote events
    const unsubscribe = eventBus.subscribe(EVENT_TYPES.UPVOTE_UPDATED, (data) => {
      // Only update if this component is for the updated product
      if ((productSlug && data.slug === productSlug) ||
          (product?._id && data.productId === product._id)) {

        logger.debug(`UpvoteButton received global update for ${productSlug || product?._id}:`, data);

        // Update count and upvoted state from the event data
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

          // Update upvoted state if it's included in the event data
          if (data.upvoted !== undefined) {
            setIsUpvoted(data.upvoted);
          }
          // Or if it's an action event (add/remove) for the current user
          else if (isCurrentUserAction && data.action) {
            setIsUpvoted(data.action === 'add');
          }

          logger.debug(`UpvoteButton updated state for ${productSlug}:`, {
            count: data.count,
            upvoted: isCurrentUserAction ? (data.action === 'add') : data.upvoted,
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
      logger.debug(`UpvoteButton found product in global cache for ${productSlug}:`, {
        upvoteCount: cachedProduct.upvoteCount,
        upvoted: cachedProduct.upvoted,
        userHasUpvoted: cachedProduct.upvotes?.userHasUpvoted,
        userInteractions: cachedProduct.userInteractions
      });

      // Update count if it's different
      if (cachedProduct.upvoteCount !== undefined && cachedProduct.upvoteCount !== count) {
        setCount(cachedProduct.upvoteCount);
      }

      // Determine the upvoted state from all possible sources
      const cachedUpvotedState =
        cachedProduct.upvoted ??
        cachedProduct.upvotes?.userHasUpvoted ??
        cachedProduct.userInteractions?.hasUpvoted ??
        false;

      // Only update if the state is different to avoid unnecessary re-renders
      if (cachedUpvotedState !== isUpvoted) {
        logger.debug(`UpvoteButton updating upvoted state for ${productSlug} from ${isUpvoted} to ${cachedUpvotedState}`);
        setIsUpvoted(cachedUpvotedState);
      }
    }
  }, [productSlug, productCache]);

  // Update state when props change
  useEffect(() => {
    const newUpvoted = getInitialUpvoted();
    const newCount = getInitialCount();

    // Add product to mapping for socket updates if available
    if (product && product._id && product.slug) {
      addProductToMapping(product);
    }

    // Only update state if there's an actual change to avoid unnecessary re-renders
    if (isUpvoted !== newUpvoted) {
      // Log when there's an actual change in upvoted state
      logger.debug(`UpvoteButton upvoted state changed for ${product?.slug || productSlug}:`, {
        oldUpvoted: isUpvoted,
        newUpvoted,
        source: 'props-change'
      });

      // Update the state
      setIsUpvoted(newUpvoted);
    }

    if (count !== newCount) {
      // Log when there's an actual change in count
      logger.debug(`UpvoteButton count changed for ${product?.slug || productSlug}:`, {
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
    product?.userInteractions?.hasUpvoted,
    product?.upvotes?.userHasUpvoted,
    product?.upvoteCount,
    product?.upvotes?.count,
    initialHasUpvoted,
    initialUpvoteCount
  ]);

  // Check if user is the product owner
  const isOwner = product?.maker?._id === user?._id || product?.maker === user?._id;

  // Handle upvote action
  const handleUpvote = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Prevent action if not authenticated
    if (!isAuthenticated) {
      showToast("error", "Please log in to upvote products");
      return;
    }

    // Prevent upvoting own product
    if (isOwner) {
      showToast("error", "You cannot upvote your own product");
      return;
    }

    // Prevent rapid clicks
    if (isLoading || isProcessing) return;

    setIsLoading(true);
    setIsProcessing(true);

    // Optimistic UI update
    const previousState = isUpvoted;
    const previousCount = count;
    setIsUpvoted(!isUpvoted);
    setCount(prev => isUpvoted ? prev - 1 : prev + 1);

    try {
      // Call API
      const result = await toggleUpvote(productSlug);

      if (!result.success) {
        // Revert optimistic update on failure
        setIsUpvoted(previousState);
        setCount(previousCount);
        showToast("error", result.message || "Failed to update upvote");
        return;
      }

      // Record interaction for recommendations
      if (recordInteraction) {
        try {
          await recordInteraction(
            productSlug,
            result.upvoted ? "upvote" : "remove_upvote",
            {
              source,
              previousInteraction: !result.upvoted ? "upvoted" : "none",
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
        const resultWithCount = {
          ...result,
          count: result.count || result.upvoteCount || count
        };

        // Log only in development and only once per successful interaction
        if (process.env.NODE_ENV === 'development') {
          console.log('UpvoteButton API success:', {
            product: productSlug,
            upvoted: result.upvoted,
            count: resultWithCount.count
          });
        }

        onSuccess(resultWithCount);
      }

      // Show success message
      showToast(
        "success",
        result.upvoted ? "Product upvoted successfully" : "Upvote removed"
      );
    } catch (error) {
      // Only log detailed errors in development mode
      if (process.env.NODE_ENV === 'development') {
        console.error("Error toggling upvote:", error);
      }
      // Revert optimistic update on error
      setIsUpvoted(previousState);
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

  // Log when the upvoted state changes (for debugging)
  useEffect(() => {
    logger.debug(`UpvoteButton UI state for ${productSlug}:`, {
      isUpvoted,
      count,
      productId: product?._id,
      timestamp: Date.now()
    });
  }, [isUpvoted, count, productSlug, product?._id]);

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={handleUpvote}
        disabled={disabled || isLoading || isOwner}
        className={`transition-all duration-200 ${
          isUpvoted
            ? "bg-violet-100 text-violet-700"
            : "text-gray-500 hover:bg-violet-50 hover:text-violet-600"
        } ${sizeClasses[size] || sizeClasses.md} ${className} ${
          isOwner ? "opacity-50 cursor-not-allowed" : ""
        }`}
        title={
          isOwner
            ? "Cannot upvote your own product"
            : isUpvoted
            ? "Remove upvote"
            : "Upvote product"
        }
        aria-label={
          isOwner
            ? "Cannot upvote your own product"
            : isUpvoted
            ? "Remove upvote"
            : "Upvote product"
        }
      >
        <ArrowUp
          className={`${
            size === "sm" ? "w-3 h-3" : size === "lg" ? "w-5 h-5" : "w-4 h-4"
          } ${isLoading ? "animate-pulse" : ""}`}
        />
      </button>

      {showCount && (
        <span className={`font-medium text-gray-700 ${countSizeClasses[size] || countSizeClasses.md}`}>
          {count}
        </span>
      )}
    </div>
  );
};

export default UpvoteButton;