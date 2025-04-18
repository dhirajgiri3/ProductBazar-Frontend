"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useProduct } from "../../../Contexts/Product/ProductContext"; // Adjust path as needed
import { useAuth } from "../../../Contexts/Auth/AuthContext";         // Adjust path as needed
import { useToast } from "../../../Contexts/Toast/ToastContext";     // Adjust path as needed
import { useRecommendation } from "../../../Contexts/Recommendation/RecommendationContext"; // Adjust path as needed
import { addProductToMapping } from "../../../Utils/productMappingUtils"; // Adjust path as needed
import eventBus, { EVENT_TYPES } from "../../../Utils/eventBus";       // Adjust path as needed
import logger from "../../../Utils/logger";                           // Adjust path as needed
import AnimatedUpvoteIcon from "./AnimatedUpvoteIcon";               // Import our custom animated icon

const UpvoteButton = ({
  product, // The full product object is preferred
  slug, // Can be provided as an alternative if product object is minimal
  hasUpvoted: initialHasUpvoted, // Explicit prop to override initial state
  upvoteCount: initialUpvoteCount, // Explicit prop to override initial count
  size = "md", // 'sm', 'md', 'lg'
  source = "unknown", // Context where the button is used (e.g., 'product_card', 'product_page')
  onSuccess, // Callback function on successful toggle: (result: { success: boolean, upvoted: boolean, count: number }) => void
  className = "", // Additional CSS classes for the container div
  showCount = true, // Whether to display the upvote count
  disabled = false, // Explicitly disable the button
}) => {
  // Determine product slug
  const productSlug = slug || product?.slug;
  const productId = product?._id;

  // Hooks
  const { toggleUpvote, productCache } = useProduct();
  const { isAuthenticated, user } = useAuth();
  const { showToast } = useToast();
  const { recordInteraction } = useRecommendation();

  // State
  const [isUpvoted, setIsUpvoted] = useState(false);
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false); // For API call in progress
  const [isProcessing, setIsProcessing] = useState(false); // Debounce rapid clicks

  // Ref to track mounted state
  const isMounted = useRef(true);

  // Check if the current user is the maker/owner of the product
  const isOwner = user && product && (user._id === product.maker || user._id === product?.maker?._id);

  // --- Initial State Calculation ---
  const getInitialUpvoted = useCallback(() => {
    if (!product && initialHasUpvoted === undefined) return false; // No data to determine state
    if (initialHasUpvoted !== undefined) return initialHasUpvoted;
    if (product?.userInteractions?.hasUpvoted !== undefined) return product.userInteractions.hasUpvoted;
    if (product?.upvotes?.userHasUpvoted !== undefined) return product.upvotes.userHasUpvoted;
    if (product?.upvoted !== undefined) return product.upvoted;
    return false;
  }, [product, initialHasUpvoted]); // Dependencies based on props and product structure

  const getInitialCount = useCallback(() => {
    if (!product && initialUpvoteCount === undefined) return 0; // No data
    if (initialUpvoteCount !== undefined) return initialUpvoteCount;
    // Prioritize direct count field (expected from API)
    if (product?.upvoteCount !== undefined && typeof product.upvoteCount === 'number') return product.upvoteCount;
     // Fallback to nested structure (older cache/data)
    if (product?.upvotes?.count !== undefined && typeof product.upvotes.count === 'number') return product.upvotes.count;
    return 0;
  }, [product, initialUpvoteCount]); // Dependencies based on props and product structure

  // Effect to initialize state when component mounts or product changes
  useEffect(() => {
    setIsUpvoted(getInitialUpvoted());
    setCount(getInitialCount());
  }, [getInitialUpvoted, getInitialCount]);

  // Effect to update state if props/product data change *after* initial mount
  useEffect(() => {
    const newUpvoted = getInitialUpvoted();
    const newCount = getInitialCount();

    if (isUpvoted !== newUpvoted) {
      logger.debug(`UpvoteButton: Prop/Product update changed upvoted state for ${productSlug}`, { old: isUpvoted, new: newUpvoted });
      setIsUpvoted(newUpvoted);
    }
    if (count !== newCount) {
      logger.debug(`UpvoteButton: Prop/Product update changed count for ${productSlug}`, { old: count, new: newCount });
      setCount(newCount);
    }

     // Add product to mapping for socket updates if available
     if (productId && productSlug) {
        addProductToMapping({ _id: productId, slug: productSlug });
     }

  }, [
    product?.userInteractions?.hasUpvoted,
    product?.upvotes?.userHasUpvoted,
    product?.upvoted,
    product?.upvoteCount,
    product?.upvotes?.count,
    initialHasUpvoted,
    initialUpvoteCount,
    productSlug, // Re-run if slug changes
    productId,   // Re-run if ID changes
    getInitialCount, // Recalculate if these change
    getInitialUpvoted
  ]);

  // Effect for Mounted Ref
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Effect to listen for global upvote events from EventBus
  useEffect(() => {
    if (!productSlug && !productId) return; // Cannot identify product

    const handleGlobalUpdate = (data) => {
      // Check if the update is for this specific product
      if ((productSlug && data.slug === productSlug) || (productId && data.productId === productId)) {
        if (isMounted.current) {
          logger.debug(`UpvoteButton: Global event received for ${productSlug || productId}`, data);
          // Update count
          if (data.count !== undefined && data.count !== count) {
             setCount(data.count);
          }

          // Update upvoted status based on the event
          let currentUserId = user?._id || localStorage.getItem('userId');
          const isCurrentUserAction = data.userId === currentUserId;

          if (data.upvoted !== undefined && data.upvoted !== isUpvoted) {
             setIsUpvoted(data.upvoted);
          } else if (isCurrentUserAction && data.action) {
             const newUpvotedState = data.action === 'add';
             if (newUpvotedState !== isUpvoted) {
                setIsUpvoted(newUpvotedState);
             }
          }
        }
      }
    };

    const unsubscribe = eventBus.subscribe(EVENT_TYPES.UPVOTE_UPDATED, handleGlobalUpdate);
    return () => unsubscribe();

  }, [productSlug, productId, user?._id, count, isUpvoted]); // Dependencies needed to avoid stale state in handler

  // Effect to check for updates in the global product cache
  useEffect(() => {
    if (!productSlug || !isMounted.current) return;
    const cachedProduct = productCache[productSlug];

    if (cachedProduct) {
      // Determine count from cache
      const cachedCount = cachedProduct.upvoteCount ?? cachedProduct.upvotes?.count ?? count;
      if (cachedCount !== count) {
        logger.debug(`UpvoteButton: Cache update changed count for ${productSlug}`, { old: count, new: cachedCount });
        setCount(cachedCount);
      }

      // Determine upvoted state from cache
      const cachedUpvotedState =
        cachedProduct.upvoted ??
        cachedProduct.upvotes?.userHasUpvoted ??
        cachedProduct.userInteractions?.hasUpvoted ??
        isUpvoted; // Fallback

      if (cachedUpvotedState !== isUpvoted) {
        logger.debug(`UpvoteButton: Cache update changed upvoted state for ${productSlug}`, { old: isUpvoted, new: cachedUpvotedState });
        setIsUpvoted(cachedUpvotedState);
      }
    }
  }, [productSlug, productCache, count, isUpvoted]); // Re-check cache if local state changes


  // Handle upvote action
  const handleUpvote = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!productSlug) {
      logger.error("UpvoteButton: Cannot toggle upvote without product slug.");
      showToast("error", "Cannot perform action: Product identifier missing.");
      return;
    }

    if (!isAuthenticated) { showToast("error", "Please log in to upvote products"); return; }
    if (isOwner) { showToast("info", "You cannot upvote your own product"); return; } // Use info severity
    if (isLoading || isProcessing) return; // Prevent multiple clicks

    setIsLoading(true);
    setIsProcessing(true);

    // Optimistic UI update
    const previousState = isUpvoted;
    const previousCount = count;
    setIsUpvoted(!isUpvoted);
    setCount(prev => isUpvoted ? Math.max(0, prev - 1) : prev + 1);

    try {
      // Call API via context
      const result = await toggleUpvote(productSlug);

      if (!result.success) {
        // Revert optimistic update on failure
        if (isMounted.current) {
            setIsUpvoted(previousState);
            setCount(previousCount);
        }
        showToast("error", result.message || "Failed to update upvote");
        logger.warn(`Upvote failed for ${productSlug}: ${result.message}`);
        return; // Exit early on failure
      }

      // --- Sync with server state ---
      const serverCount = result.upvoteCount ?? result.count ?? count; // Prioritize specific count field
      const serverUpvotedState = result.upvoted ?? !previousState; // Use API result if available

      if (isMounted.current) {
          // Update state only if it differs from the server response (handles race conditions)
          if (serverCount !== count) setCount(serverCount);
          if (serverUpvotedState !== isUpvoted) setIsUpvoted(serverUpvotedState);
      }
      // ---

      // Record interaction for recommendations (fire and forget)
      if (recordInteraction) {
        recordInteraction(productSlug, serverUpvotedState ? "upvote" : "remove_upvote", {
            source,
            previousInteraction: previousState ? "upvoted" : "none",
        }).catch(err => logger.error(`Failed to record upvote interaction for ${productSlug}:`, err));
      }

      // Call success callback if provided
      if (onSuccess) {
        onSuccess({ ...result, count: serverCount, upvoted: serverUpvotedState });
      }

      // Show success toast
      // showToast("success", serverUpvotedState ? "Product upvoted!" : "Upvote removed"); // Can be slightly annoying, maybe remove

    } catch (error) {
      logger.error(`Error toggling upvote for ${productSlug}:`, error);
      // Revert optimistic update on error
      if (isMounted.current) {
          setIsUpvoted(previousState);
          setCount(previousCount);
      }

      // Extract error message from the error object
      let errorMessage = "An unexpected error occurred while upvoting.";

      // Check for specific error messages
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Show the error message in a toast
      showToast("error", errorMessage);
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
        // Short delay before allowing another click
        setTimeout(() => {
          if (isMounted.current) setIsProcessing(false);
        }, 300);
      }
    }
  };

  // Dynamic class generation
  const sizeClasses = {
    sm: "p-1.5 rounded-md text-xs", // Adjusted rounding
    md: "p-2 rounded-lg text-sm",   // Adjusted rounding
    lg: "p-2.5 rounded-lg text-base",// Adjusted rounding
  };
  const iconSizeClasses = {
    sm: "w-3.5 h-3.5", // Slightly larger icons
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };
   const countSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-sm", // Keep count slightly smaller on lg
  };

  const buttonBaseClasses = "transition-all duration-200 flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-1";
  const upvotedClasses = "bg-violet-100 text-violet-700 hover:bg-violet-200";
  const notUpvotedClasses = "bg-gray-100 text-gray-500 hover:bg-violet-50 hover:text-violet-600";
  const disabledClasses = "opacity-60 cursor-not-allowed";
  const processingClasses = "cursor-wait";

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <button
        type="button"
        onClick={handleUpvote}
        disabled={disabled || isLoading || isOwner || isProcessing}
        className={`${buttonBaseClasses} ${sizeClasses[size] || sizeClasses.md} ${
          isUpvoted ? upvotedClasses : notUpvotedClasses
        } ${isOwner || disabled ? disabledClasses : ""} ${
          isProcessing ? processingClasses : ""
        }`}
        title={
          isOwner ? "Cannot upvote your own product"
          : isUpvoted ? "Remove upvote"
          : "Upvote this product"
        }
        aria-pressed={isUpvoted} // Better accessibility
        aria-label={
            isOwner ? "Cannot upvote own product"
            : isUpvoted ? "Remove upvote"
            : `Upvote ${product?.name || 'product'}` // More descriptive label
        }
      >
        <AnimatedUpvoteIcon
          isUpvoted={isUpvoted}
          isLoading={isLoading}
          size={size}
          className={iconSizeClasses[size] || iconSizeClasses.md}
        />
      </button>

      {showCount && (
        <span
          className={`font-medium text-gray-700 tabular-nums ${countSizeClasses[size] || countSizeClasses.md}`}
          aria-live="polite" // Announce count changes
        >
          {count}
        </span>
      )}
    </div>
  );
};

export default UpvoteButton;