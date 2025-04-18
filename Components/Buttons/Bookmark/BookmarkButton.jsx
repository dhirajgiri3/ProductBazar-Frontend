"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useProduct } from "../../../Contexts/Product/ProductContext"; // Adjust path as needed
import { useAuth } from "../../../Contexts/Auth/AuthContext";         // Adjust path as needed
import { useToast } from "../../../Contexts/Toast/ToastContext";     // Adjust path as needed
import { useRecommendation } from "../../../Contexts/Recommendation/RecommendationContext"; // Adjust path as needed
import { addProductToMapping } from "../../../Utils/productMappingUtils"; // Adjust path as needed
import eventBus, { EVENT_TYPES } from "../../../Utils/eventBus";       // Adjust path as needed
import logger from "../../../Utils/logger";                           // Adjust path as needed
import AnimatedBookmarkIcon from "./AnimatedBookmarkIcon";           // Import our custom animated icon

const BookmarkButton = ({
  product, // The full product object is preferred
  slug, // Can be provided as an alternative if product object is minimal
  hasBookmarked: initialHasBookmarked, // Explicit prop to override initial state
  bookmarkCount: initialBookmarkCount, // Explicit prop to override initial count
  size = "md", // 'sm', 'md', 'lg'
  source = "unknown", // Context where the button is used
  onSuccess, // Callback function on successful toggle: (result: { success: boolean, bookmarked: boolean, count: number }) => void
  className = "", // Additional CSS classes for the container div
  showCount = true, // Whether to display the bookmark count
  showText = false, // Whether to show "Save" / "Saved" text
  disabled = false, // Explicitly disable the button
}) => {
  // Determine product slug
  const productSlug = slug || product?.slug;
  const productId = product?._id;

  // Hooks
  const { toggleBookmark, productCache } = useProduct();
  const { isAuthenticated, user } = useAuth();
  const { showToast } = useToast();
  const { recordInteraction } = useRecommendation();

  // State
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false); // For API call in progress
  const [isProcessing, setIsProcessing] = useState(false); // Debounce rapid clicks

  // Ref to track mounted state
  const isMounted = useRef(true);

  // Check if the current user is the maker/owner of the product
  const isOwner = user && product && (user._id === product.maker || user._id === product?.maker?._id);


  // --- Initial State Calculation ---
   const getInitialBookmarked = useCallback(() => {
    if (!product && initialHasBookmarked === undefined) return false; // No data
    if (initialHasBookmarked !== undefined) return initialHasBookmarked;
    if (product?.userInteractions?.hasBookmarked !== undefined) return product.userInteractions.hasBookmarked;
    if (product?.bookmarks?.userHasBookmarked !== undefined) return product.bookmarks.userHasBookmarked;
    if (product?.bookmarked !== undefined) return product.bookmarked;
    return false;
  }, [product, initialHasBookmarked]);

  const getInitialCount = useCallback(() => {
    if (!product && initialBookmarkCount === undefined) return 0; // No data
    if (initialBookmarkCount !== undefined) return initialBookmarkCount;
    // Prioritize direct count field (expected from API)
    if (product?.bookmarkCount !== undefined && typeof product.bookmarkCount === 'number') return product.bookmarkCount;
    // Fallback to nested structure (older cache/data)
    if (product?.bookmarks?.count !== undefined && typeof product.bookmarks.count === 'number') return product.bookmarks.count;
    return 0;
  }, [product, initialBookmarkCount]);

  // Effect to initialize state when component mounts or product changes
  useEffect(() => {
    setIsBookmarked(getInitialBookmarked());
    setCount(getInitialCount());
  }, [getInitialBookmarked, getInitialCount]);

  // Effect to update state if props/product data change *after* initial mount
  useEffect(() => {
    const newBookmarked = getInitialBookmarked();
    const newCount = getInitialCount();

    if (isBookmarked !== newBookmarked) {
       logger.debug(`BookmarkButton: Prop/Product update changed bookmarked state for ${productSlug}`, { old: isBookmarked, new: newBookmarked });
       setIsBookmarked(newBookmarked);
    }
    if (count !== newCount) {
       logger.debug(`BookmarkButton: Prop/Product update changed count for ${productSlug}`, { old: count, new: newCount });
       setCount(newCount);
    }

     // Add product to mapping for socket updates if available
     if (productId && productSlug) {
        addProductToMapping({ _id: productId, slug: productSlug });
     }

  }, [
    product?.userInteractions?.hasBookmarked,
    product?.bookmarks?.userHasBookmarked,
    product?.bookmarked,
    product?.bookmarkCount,
    product?.bookmarks?.count,
    initialHasBookmarked,
    initialBookmarkCount,
    productSlug,
    productId,
    getInitialCount,
    getInitialBookmarked
  ]);

  // Effect for Mounted Ref
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Effect to listen for global bookmark events from EventBus
  useEffect(() => {
    if (!productSlug && !productId) return;

    const handleGlobalUpdate = (data) => {
      if ((productSlug && data.slug === productSlug) || (productId && data.productId === productId)) {
        if (isMounted.current) {
          logger.debug(`BookmarkButton: Global event received for ${productSlug || productId}`, data);
          // Update count
          if (data.count !== undefined && data.count !== count) {
             setCount(data.count);
          }

          // Update bookmarked status
          let currentUserId = user?._id || localStorage.getItem('userId');
          const isCurrentUserAction = data.userId === currentUserId;

          if (data.bookmarked !== undefined && data.bookmarked !== isBookmarked) {
             setIsBookmarked(data.bookmarked);
          } else if (isCurrentUserAction && data.action) {
             const newBookmarkedState = data.action === 'add';
             if (newBookmarkedState !== isBookmarked) {
                setIsBookmarked(newBookmarkedState);
             }
          }
        }
      }
    };

    const unsubscribe = eventBus.subscribe(EVENT_TYPES.BOOKMARK_UPDATED, handleGlobalUpdate);
    return () => unsubscribe();

  }, [productSlug, productId, user?._id, count, isBookmarked]);

  // Effect to check for updates in the global product cache
  useEffect(() => {
    if (!productSlug || !isMounted.current) return;
    const cachedProduct = productCache[productSlug];

    if (cachedProduct) {
      // Determine count from cache
      const cachedCount = cachedProduct.bookmarkCount ?? cachedProduct.bookmarks?.count ?? count;
      if (cachedCount !== count) {
         logger.debug(`BookmarkButton: Cache update changed count for ${productSlug}`, { old: count, new: cachedCount });
         setCount(cachedCount);
      }

      // Determine bookmarked state from cache
      const cachedBookmarkedState =
        cachedProduct.bookmarked ??
        cachedProduct.bookmarks?.userHasBookmarked ??
        cachedProduct.userInteractions?.hasBookmarked ??
        isBookmarked;

      if (cachedBookmarkedState !== isBookmarked) {
         logger.debug(`BookmarkButton: Cache update changed bookmarked state for ${productSlug}`, { old: isBookmarked, new: cachedBookmarkedState });
         setIsBookmarked(cachedBookmarkedState);
      }
    }
  }, [productSlug, productCache, count, isBookmarked]);


  // Handle bookmark action
  const handleBookmark = async (e) => {
    e.preventDefault();
    e.stopPropagation();

     if (!productSlug) {
       logger.error("BookmarkButton: Cannot toggle bookmark without product slug.");
       showToast("error", "Cannot perform action: Product identifier missing.");
       return;
     }

    if (!isAuthenticated) { showToast("error", "Please log in to save products"); return; }
    if (isOwner) { showToast("info", "You cannot bookmark your own product"); return; }
    if (isLoading || isProcessing) return;

    setIsLoading(true);
    setIsProcessing(true);

    // Optimistic UI update
    const previousState = isBookmarked;
    const previousCount = count;
    setIsBookmarked(!isBookmarked);
    setCount(prev => isBookmarked ? Math.max(0, prev - 1) : prev + 1);

    try {
      // Call API via context
      const result = await toggleBookmark(productSlug);

      if (!result.success) {
        // Revert optimistic update on failure
         if (isMounted.current) {
             setIsBookmarked(previousState);
             setCount(previousCount);
         }
        showToast("error", result.message || "Failed to update bookmark");
        logger.warn(`Bookmark failed for ${productSlug}: ${result.message}`);
        return; // Exit early
      }

      // --- Sync with server state ---
      const serverCount = result.bookmarkCount ?? result.count ?? count; // Prioritize specific field
      const serverBookmarkedState = result.bookmarked ?? !previousState;

      if (isMounted.current) {
          if(serverCount !== count) setCount(serverCount);
          if(serverBookmarkedState !== isBookmarked) setIsBookmarked(serverBookmarkedState);
      }
       // ---

      // Record interaction for recommendations (fire and forget)
      if (recordInteraction) {
         recordInteraction(productSlug, serverBookmarkedState ? "bookmark" : "remove_bookmark", {
            source,
            previousInteraction: previousState ? "bookmarked" : "none",
         }).catch(err => logger.error(`Failed to record bookmark interaction for ${productSlug}:`, err));
      }

      // Call success callback if provided
      if (onSuccess) {
        onSuccess({ ...result, count: serverCount, bookmarked: serverBookmarkedState });
      }

      // Show success toast (optional)
      // showToast("success", serverBookmarkedState ? "Product saved!" : "Bookmark removed");

    } catch (error) {
      logger.error(`Error toggling bookmark for ${productSlug}:`, error);
      // Revert optimistic update on error
      if (isMounted.current) {
          setIsBookmarked(previousState);
          setCount(previousCount);
      }

      // Extract error message from the error object
      let errorMessage = "An unexpected error occurred while saving.";

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
        setTimeout(() => {
          if (isMounted.current) setIsProcessing(false);
        }, 300);
      }
    }
  };

  // Dynamic class generation
  const sizeClasses = {
    sm: "p-1.5 rounded-md text-xs",
    md: "p-2 rounded-lg text-sm",
    lg: "p-2.5 rounded-lg text-base",
  };
  const iconSizeClasses = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };
   const countSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-sm",
  };
   const textClasses = {
    sm: "text-xs ml-1",
    md: "text-sm ml-1.5",
    lg: "text-sm ml-1.5",
  };

  const buttonBaseClasses = "transition-all duration-200 flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-1";
  const bookmarkedClasses = "bg-violet-100 text-violet-700 hover:bg-violet-200";
  const notBookmarkedClasses = "bg-gray-100 text-gray-500 hover:bg-violet-50 hover:text-violet-600";
  const disabledClasses = "opacity-60 cursor-not-allowed";
  const processingClasses = "cursor-wait";

  return (
    <div className={`flex items-center ${showCount ? 'gap-1.5' : ''} ${className}`}>
      <button
        type="button"
        onClick={handleBookmark}
        disabled={disabled || isLoading || isOwner || isProcessing}
        className={`${buttonBaseClasses} ${sizeClasses[size] || sizeClasses.md} ${
          isBookmarked ? bookmarkedClasses : notBookmarkedClasses
        } ${isOwner || disabled ? disabledClasses : ""} ${
          isProcessing ? processingClasses : ""
        } ${showText ? 'px-3' : ''}`} // Add padding if text is shown
         title={
          isOwner ? "Cannot bookmark your own product"
          : isBookmarked ? "Remove from saved"
          : "Save for later"
        }
        aria-pressed={isBookmarked}
        aria-label={
            isOwner ? "Cannot bookmark own product"
            : isBookmarked ? "Remove bookmark"
            : `Bookmark ${product?.name || 'product'}`
        }
      >
        <AnimatedBookmarkIcon
          isBookmarked={isBookmarked}
          isLoading={isLoading}
          size={size}
          className={iconSizeClasses[size] || iconSizeClasses.md}
        />
        {showText && (
            <span className={textClasses[size] || textClasses.md}>
                {isBookmarked ? 'Saved' : 'Save'}
            </span>
        )}
      </button>

      {showCount && !showText && ( // Only show count if text is not shown
        <span
          className={`font-medium text-gray-700 tabular-nums ${countSizeClasses[size] || countSizeClasses.md}`}
          aria-live="polite"
        >
          {count}
        </span>
      )}
    </div>
  );
};

export default BookmarkButton;