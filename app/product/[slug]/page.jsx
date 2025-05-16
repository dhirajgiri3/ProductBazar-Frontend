"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
} from "framer-motion";
import { useAuth } from "@/lib/contexts/auth-context.jsx";
import { useSocket } from "@/lib/contexts/socket-context.jsx";
import { useToast } from "@/lib/contexts/toast-context.jsx";
import LoaderComponent from "Components/UI/LoaderComponent.jsx";
import EditProductModal from "Components/Modal/Product/EditProductModal.jsx";
import eventBus, { EVENT_TYPES } from "@/lib/utils/event-bus.js";
import ViewTracker from "Components/View/ViewTracker.js";
import OptimizedGallery from "./Components/OptimizedGallery.jsx";
import {
  ArrowLeft,
  Play,
  Eye,
  MessageSquare,
  Share2,
  Edit,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Globe,
  Rocket,
  Zap,
  Bookmark,
  ThumbsUp,
  Compass,
  PenTool,
  Brain,
  TrendingUp,
  MessageCircle,
  Camera,
  AlertCircle,
  MapPin,
  Plus as PlusIcon,
  Star,
} from "lucide-react";
import UpvoteButton from "Components/Buttons/Upvote/UpvoteButton.jsx";
import BookmarkButton from "Components/Buttons/Bookmark/BookmarkButton.jsx";
import { formatDistanceToNow, format } from "date-fns";
import SimilarProductsSection from "./Components/SimilarProductsSection.jsx";
import CommentSection from "./Components/Comment/CommentSection.jsx"; // Make sure this path is correct
import { FaGithub } from "react-icons/fa";
import { useProduct } from "@/lib/contexts/product-context.jsx";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div>Something went wrong.</div>;
    }

    return this.props.children;
  }
}

// --- Enhanced Storytelling Components with Consistent Theme ---
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

// Section Component - Enhanced for Narrative Flow with Consistent Theme
const StorySection = ({
  title,
  icon: Icon,
  children,
  className = "",
  delay = 0,
  id = "",
  chapterNumber,
}) => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.15 });

  return (
    <motion.section
      id={id}
      ref={sectionRef}
      // Reduced bottom margin slightly for tighter feel, adjust as needed
      className={`mb-24 md:mb-32 relative ${className}`}
      initial={{ opacity: 0, y: 50 }} // Slightly less dramatic entrance
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.8, // Slightly faster duration
        delay: isInView ? delay : 0,
        ease: "easeOut", // Use easeOut for entrance
      }}
    >
      {/* --- Chapter Indicator (Moved into Flow) --- */}
      {chapterNumber && (
        <motion.div
          className="mb-6 flex items-center gap-3 opacity-90" // Added margin-bottom
          initial={{ opacity: 0, x: -20 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ delay: isInView ? delay + 0.1 : 0, duration: 0.6 }}
        >
          <span className="text-xs font-semibold text-violet-700 bg-violet-100 px-3 py-1 rounded-full border border-violet-200/70">
            CHAPTER {chapterNumber}
          </span>
          {/* Simplified Decorative Line */}
          <div className="h-px w-12 bg-violet-300 rounded-full"></div>
        </motion.div>
      )}

      {/* --- Icon and Title Block --- */}
      <div className="flex items-center gap-4 mb-8">
        {" "}
        {/* Reduced gap slightly */}
        {/* Simplified Icon Style */}
        <motion.div
          className="p-3 bg-violet-100 rounded-lg text-violet-600 flex-shrink-0" // Solid, softer background
          whileHover={{
            scale: 1.08, // Simpler hover: slight scale
            // Removed rotation and complex shadow for minimalism
            boxShadow: "0 6px 15px -3px rgba(124, 58, 237, 0.15)",
          }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
        >
          <Icon size={24} /> {/* Slightly smaller icon */}
        </motion.div>
        {/* Adjusted Title Size for Balance */}
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight">
          {title}
        </h2>
      </div>

      {/* --- Content Area --- */}
      {/* Adjusted prose styles slightly if needed, or keep as is */}
      <div className="prose prose-lg lg:prose-xl prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-gray-800 prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-violet-700 prose-a:font-medium hover:prose-a:text-violet-800 prose-a:transition-colors prose-strong:text-gray-800 prose-strong:font-semibold max-w-none">
        {children}
      </div>
    </motion.section>
  );
};

// Narrative Text Component - Supports more intents for storytelling variation
const NarrativeParagraph = ({
  children,
  className = "",
  delay = 0,
  intent = "default",
}) => {
  const textRef = useRef(null);
  const isInView = useInView(textRef, { once: true, amount: 0.3 });

  const intentClasses = {
    default: "mb-6 text-gray-700",
    lead: "mb-8 text-md text-gray-700 font-light tracking-wide",
    quote:
      "mb-8 relative pl-6 before:content-['\"\"'] before:absolute before:left-0 before:top-0 before:text-6xl before:text-violet-200 before:font-serif italic text-gray-600",
    // --- Refined Highlight Style ---
    highlight:
      "mb-8 p-5 bg-slate-50/80 border-l-4 border-slate-200 rounded-r-lg text-gray-700", // Soft gray background, lighter border
    aside:
      "mb-6 text-sm text-gray-500 italic pl-4 border-l-2 border-violet-300",
  };

  return (
    <motion.p
      ref={textRef}
      className={`${intentClasses[intent]} ${className}`}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{
        delay: isInView ? delay : 0,
        duration: 0.9,
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.p>
  );
};

// Narrative Stat - Enhanced with consistent theme colors
const NarrativeStat = ({
  icon: Icon,
  value,
  label,
  delay = 0,
  className = "",
  color = "violet", // Default to a soft color
}) => {
  const statRef = useRef(null);
  const isInView = useInView(statRef, { once: true, margin: "-50px" });
  const [animatedValue, setAnimatedValue] = useState(0);

  // --- New Soft & Aesthetic Color Schemes ---
  const colorSchemes = {
    sky: "bg-sky-50 text-sky-700 border-sky-100 shadow-sky-500/10", // Soft Blue
    emerald:
      "bg-emerald-50 text-emerald-700 border-emerald-100 shadow-emerald-500/10", // Soft Green
    rose: "bg-rose-50 text-rose-700 border-rose-100 shadow-rose-500/10", // Soft Pink/Rose
    amber: "bg-amber-50 text-amber-700 border-amber-100 shadow-amber-500/10", // Soft Amber/Peach
    slate: "bg-slate-100 text-slate-700 border-slate-200 shadow-slate-500/10", // Neutral Gray
    violet:
      "bg-violet-100/90 text-violet-700 border-violet-200 shadow-violet-500/15", // Soft Violet
    lavender:
      "bg-purple-50 text-purple-700 border-purple-100 shadow-purple-500/10", // Soft Lavender
    teal: "bg-teal-50 text-teal-700 border-teal-100 shadow-teal-500/10", // Soft Teal
    coral: "bg-red-50 text-red-700 border-red-100 shadow-red-500/10", // Soft Coral
    mint: "bg-green-50 text-green-700 border-green-100 shadow-green-500/10", // Soft Mint
    peach:
      "bg-orange-50 text-orange-700 border-orange-100 shadow-orange-500/10", // Soft Peach
    indigo:
      "bg-indigo-50 text-indigo-700 border-indigo-100 shadow-indigo-500/10", // Soft Indigo
  };

  useEffect(() => {
    // Animation logic remains the same...
    if (isInView && typeof value === "number") {
      let startValue = 0;
      let animationFrameId;
      const startTime = Date.now();
      const duration = 1800;
      const delayMs = (delay + 0.2) * 1000;

      const timeoutId = setTimeout(() => {
        const animate = () => {
          const elapsed = Date.now() - startTime - delayMs;
          if (elapsed < 0) {
            animationFrameId = requestAnimationFrame(animate);
            return;
          }
          const progress = Math.min(elapsed / duration, 1);
          const easedProgress = 1 - Math.sin(Math.acos(progress));
          const currentValue = Math.round(
            startValue + (value - startValue) * easedProgress
          );
          setAnimatedValue(currentValue);
          if (progress < 1) {
            animationFrameId = requestAnimationFrame(animate);
          }
        };
        animate();
      }, delayMs);

      return () => {
        clearTimeout(timeoutId);
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }
      };
    } else if (isInView) {
      setAnimatedValue(value);
    } else {
      setAnimatedValue(0);
    }
  }, [isInView, value, delay]);

  return (
    <motion.div
      ref={statRef}
      className={`flex flex-col items-center justify-center text-center gap-2.5 p-5 bg-white rounded-xl border ${colorSchemes[color]} transition-all duration-300 hover:-translate-y-1 ${className}`} // Reduced gap, softer hover shadow
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ delay: delay, duration: 0.7, ease: [0.25, 1, 0.5, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.25, ease: "easeOut" } }} // Slightly less lift
    >
      <div
        className={`p-2.5 rounded-full ${
          colorSchemes[color].split(" ")[0] // Icon background matches main bg
        } transition-transform duration-300`}
      >
        <Icon size={22} className={`${colorSchemes[color].split(" ")[1]}`} />{" "}
        {/* Slightly smaller icon */}
      </div>
      <div>
        <div className="text-2xl font-bold text-gray-800">
          {" "}
          {/* Slightly smaller value text */}
          {typeof value === "number" ? animatedValue : value}
        </div>
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mt-1">
          {" "}
          {/* Smaller label */}
          {label}
        </div>
      </div>
    </motion.div>
  );
};

// Helper function for witty stat interpretation

// Helper function for witty stat interpretation (Moved outside component)
const interpretStats = (views, upvotes, bookmarks, comments, name) => {
  name = name || "this marvel"; // Fallback name

  if (views === 0)
    return `Shh! It's brand new! You might be the very first explorer to lay eyes on ${name}. Go on, make your mark!`;
  if (views > 0 && upvotes === 0 && bookmarks === 0 && comments === 0)
    return `Intriguing... ${views} souls have peered at ${name}, but the crowd remains silent. Waiting for a hero? Or maybe just shy? Your move!`;
  if (upvotes > views / 3 && upvotes >= bookmarks)
    return `Whoa! Seems like ${name} is hitting the right chords! ${upvotes} thumbs are enthusiastically up – a real crowd-pleaser brewing here!`;
  if (bookmarks > views / 4 && bookmarks > upvotes)
    return `Clever adventurers! ${bookmarks} explorers have wisely stashed ${name} away for later. Planning a deeper dive, perhaps? Smart move!`;
  if (comments > 0)
    return `The conversation has begun! ${comments} brave souls have shared their thoughts on ${name}. What secrets or insights will you add?`;
  if (upvotes > 0 || bookmarks > 0)
    return `${upvotes} appreciations and ${bookmarks} saved treasures... ${name} is definitely making waves. The plot thickens!`;

  return `With ${views} explorers checking it out, the story of ${name} continues to unfold. Every interaction adds a new verse!`;
};

// --- Main Product Detail Page ---

const ProductDetailPage = () => {
  const { slug } = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const { getProductBySlug, loading, error, clearError, updateProductInCache } =
    useProduct();
  // We still need the context hooks for other components
  const { showToast } = useToast();
  const { socket } = useSocket(); // Removed subscribeToProductUpdates as it's not used

  const pageRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: pageRef }); // Use target or container
  const scaleX = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]); // Progress bar

  // States (keep the state logic robust as from previous version)
  const [product, setProduct] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  // Source is now a constant since we don't need to change it
  const source = "direct";
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  // Add local error state to handle errors in loadProduct
  const [localError, setLocalError] = useState(null);
  // Dynamic Counts State
  const [currentUpvoteCount, setCurrentUpvoteCount] = useState(0);
  const [currentBookmarkCount, setCurrentBookmarkCount] = useState(0);
  const [currentCommentCount, setCurrentCommentCount] = useState(0);
  const [currentViewCount, setCurrentViewCount] = useState(0);

  // We don't need these state variables anymore since we're using OptimizedGallery

  const loadProduct = useCallback(
    async (bypassCache = false) => {
      // Skip if no slug
      if (!slug) return;

      // Generate a unique load ID for debugging
      const loadId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      console.log(`Starting product load (${loadId}) for slug: ${slug}`);

      // Check if we've already loaded this product recently
      const loadKey = `product_load_${slug}`;
      const lastLoad = sessionStorage.getItem(loadKey);
      const now = Date.now();
      const LOAD_TTL = 60000; // Increased to 60 seconds to reduce API calls

      // If we've loaded this product very recently and we're not bypassing cache,
      // skip the load to prevent excessive API calls
      if (!bypassCache && lastLoad && now - parseInt(lastLoad) < LOAD_TTL) {
        console.log(
          `Product ${slug} loaded recently (${loadId}), using cached data`
        );
        return;
      }

      console.log(`Attempting to load product story (${loadId}): ${slug}`);

      // Mark as loaded before the API call to prevent duplicate requests
      try {
        sessionStorage.setItem(loadKey, now.toString());
      } catch (e) {
        // Ignore storage errors
      }

      let retryCount = 0;
      const maxRetries = 2; // Reduced from 3 to 2 to prevent excessive retries

      // Use a more robust approach with AbortController for timeouts
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort('Request timeout');
      }, 10000); // 10 second timeout

      while (retryCount <= maxRetries) {
        try {
          if (retryCount > 0) {
            console.log(
              `Retrying story fetch (${loadId})... attempt ${retryCount}`
            );
          }

          // Use the signal from AbortController
          const data = await getProductBySlug(slug, bypassCache, { signal: controller.signal });

          // Clear the timeout since we got a response
          clearTimeout(timeoutId);

          if (!data || data.success === false) {
            // Handle 'not found' explicitly based on common patterns
            if (data?.error?.includes("not found") || data?.status === 404) {
              console.warn(`Product story not found (${loadId}): ${slug}`);
              setProduct(null); // Set to null for 404
              setLocalError("Product not found"); // Set a generic error state if needed
              setIsLoaded(true); // Mark as loaded (even if not found)
              return; // Exit function, product is not found
            }
            throw new Error(data?.error || "API returned unsuccessful status.");
          }

          // Success! Update state with the product data
          console.log(`Product story data received (${loadId})`);

          // Validate data before updating state
          if (!data._id || !data.slug) {
            console.error(`Invalid product data received (${loadId}):`, data);
            throw new Error('Invalid product data received');
          }

          // Update all state in a batch to reduce re-renders
          setProduct(data);
          setCurrentUpvoteCount(data.upvoteCount ?? data.upvotes?.count ?? 0);
          setCurrentBookmarkCount(
            data.bookmarkCount ?? data.bookmarks?.count ?? 0
          );
          setCurrentCommentCount(
            data.commentCount ?? data.comments?.count ?? 0
          );
          setCurrentViewCount(
            data.viewCount ?? data.views?.count ?? 0
          );
          setLocalError(null); // Clear previous errors on success
          setIsLoaded(true);

          // Don't track views here - let the ViewTracker component handle it
          // This prevents duplicate view tracking
          break; // Success!
        } catch (err) {
          // Clean up the timeout to prevent memory leaks
          clearTimeout(timeoutId);

          console.error(
            `Error loading product story (${loadId}) (Attempt ${
              retryCount + 1
            }/${maxRetries + 1}):`,
            err
          );
          retryCount++;

          // Check if the request was aborted due to timeout
          if (err.name === 'AbortError') {
            console.warn(`Request timed out (${loadId})`);
            // Don't retry on timeout, just set error state
            setLocalError("Request timed out. Please try again.");
            setProduct(null);
            setIsLoaded(true);

            showToast(
              "error",
              "Loading took too long. Please check your connection and try again.",
              5000
            );
            break;
          } else if (err.response?.status === 429 && retryCount <= maxRetries) {
            // Rate limited - use exponential backoff with jitter
            const baseDelay = Math.min(Math.pow(2, retryCount) * 1000, 8000);
            const jitter = Math.random() * 1000;
            const delay = baseDelay + jitter;

            console.warn(
              `Rate limited. Retrying story fetch in ${Math.round(
                delay / 1000
              )}s`
            );

            // Only show toast on first rate limit to avoid spamming the user
            if (retryCount === 1) {
              showToast(
                "warning",
                "Easy there! Fetching again shortly...",
                3000
              );
            }

            await new Promise((resolve) => setTimeout(resolve, delay));
          } else if (retryCount > maxRetries) {
            // Max retries reached - give up
            console.error(
              `Max retries reached. Failed to load product story (${loadId}).`
            );
            setLocalError(
              err.message || "Failed to load after multiple attempts"
            );
            setProduct(null); // Ensure product is null on final failure
            setIsLoaded(true);

            showToast(
              "error",
              "Crikey! Couldn't fetch the story. Try again later?",
              5000
            );
            break;
          } else {
            // Generic retry delay with progressive backoff
            const delay = 1500 * retryCount;
            await new Promise((resolve) => setTimeout(resolve, delay));
          }
        }
      }
    },
    [slug, getProductBySlug, showToast]
    // Removed recordInteraction, source, trackProductView from dependencies
    // to prevent unnecessary re-renders and duplicate API calls
  );

  // Initial load effect
  useEffect(() => {
    loadProduct();
    return () => clearError();
  }, [slug, loadProduct, clearError]); // Dependencies are correct

  // Socket update effect with improved stability and reduced re-renders
  useEffect(() => {
    // Skip if product or socket is not available
    if (!product?._id || !socket) {
      return;
    }

    // Skip if socket is not connected
    if (!socket.connected) {
      console.log("Socket not connected, skipping event setup");
      return;
    }

    // Create a unique ID for this subscription to track in logs
    const subscriptionId = `sub-${product._id}-${Date.now()}`;

    // Subscribe to the product for real-time updates
    socket.emit('subscribe:product', product._id);
    console.log(`SOCKET (${subscriptionId}): Subscribed to product ${product._id}`);

    // Create a stable reference to the handler function for general product updates
    const handleProductUpdate = (updatedData) => {
      if (!updatedData) return;

      console.log(
        `SOCKET (${subscriptionId}): Received update for ${product.name}`,
        updatedData
      );

      let changesDetected = false;
      const updatedFields = {};

      // Update counts with a single batch update to reduce re-renders
      const countUpdates = {};

      // Check upvote count
      if (
        updatedData.upvoteCount !== undefined &&
        updatedData.upvoteCount !== currentUpvoteCount
      ) {
        countUpdates.upvoteCount = updatedData.upvoteCount;
        changesDetected = true;
      }

      // Check bookmark count
      if (
        updatedData.bookmarkCount !== undefined &&
        updatedData.bookmarkCount !== currentBookmarkCount
      ) {
        countUpdates.bookmarkCount = updatedData.bookmarkCount;
        changesDetected = true;
      }

      // Check comment count
      if (
        updatedData.commentCount !== undefined &&
        updatedData.commentCount !== currentCommentCount
      ) {
        // Ensure commentCount isn't negative
        countUpdates.commentCount = Math.max(0, updatedData.commentCount);
        changesDetected = true;
      }

      // Check view count
      if (
        updatedData.viewCount !== undefined &&
        updatedData.viewCount !== currentViewCount
      ) {
        countUpdates.viewCount = updatedData.viewCount;
        // Views often update silently, don't flag as a major change
      }

      // Update product fields if they changed
      if (
        updatedData.featured !== undefined &&
        updatedData.featured !== product.featured
      ) {
        updatedFields.featured = updatedData.featured;
        changesDetected = true;
      }

      if (updatedData.name !== undefined && updatedData.name !== product.name) {
        updatedFields.name = updatedData.name;
        changesDetected = true;
      }

      // Batch update all counts at once to reduce re-renders
      if (countUpdates.upvoteCount !== undefined) {
        setCurrentUpvoteCount(countUpdates.upvoteCount);
      }

      if (countUpdates.bookmarkCount !== undefined) {
        setCurrentBookmarkCount(countUpdates.bookmarkCount);
      }

      if (countUpdates.commentCount !== undefined) {
        setCurrentCommentCount(countUpdates.commentCount);
      }

      if (countUpdates.viewCount !== undefined) {
        setCurrentViewCount(countUpdates.viewCount);
      }

      // Apply changes to the product object if any direct fields were updated
      if (Object.keys(updatedFields).length > 0) {
        setProduct((prev) => (prev ? { ...prev, ...updatedFields } : null));
      }

      if (changesDetected) {
        console.log(
          `SOCKET (${subscriptionId}): State updated for ${product.name}`
        );
      }
    };

    // Handle upvote events specifically
    const handleUpvoteEvent = (data) => {
      // Check if this event is for our product
      if (data.productId !== product._id) return;

      console.log(`SOCKET (${subscriptionId}): Received upvote event for ${product.name}`, data);

      if (data.count !== undefined && data.count !== currentUpvoteCount) {
        console.log(`SOCKET (${subscriptionId}): Updating upvote count from ${currentUpvoteCount} to ${data.count}`);
        setCurrentUpvoteCount(data.count);
      }
    };

    // Handle bookmark events specifically
    const handleBookmarkEvent = (data) => {
      // Check if this event is for our product
      if (data.productId !== product._id) return;

      console.log(`SOCKET (${subscriptionId}): Received bookmark event for ${product.name}`, data);

      if (data.count !== undefined && data.count !== currentBookmarkCount) {
        console.log(`SOCKET (${subscriptionId}): Updating bookmark count from ${currentBookmarkCount} to ${data.count}`);
        setCurrentBookmarkCount(data.count);
      }
    };

    // Handle view events specifically
    const handleViewEvent = (data) => {
      // Check if this event is for our product
      if (data.productId !== product._id) return;

      console.log(`SOCKET (${subscriptionId}): Received view event for ${product.name}`, data);

      if (data.count !== undefined && data.count !== currentViewCount) {
        console.log(`SOCKET (${subscriptionId}): Updating view count from ${currentViewCount} to ${data.count}`);
        setCurrentViewCount(data.count);
      }
    };

    // Also listen for EventBus events
    const handleEventBusUpvote = (data) => {
      // Check if this event is for our product
      if ((data.productId && data.productId === product._id) || (data.slug && data.slug === product.slug)) {
        console.log(`EventBus: Received upvote event for ${product.name}`, data);

        if (data.count !== undefined && data.count !== currentUpvoteCount) {
          console.log(`EventBus: Updating upvote count from ${currentUpvoteCount} to ${data.count}`);
          setCurrentUpvoteCount(data.count);
        }
      }
    };

    const handleEventBusBookmark = (data) => {
      // Check if this event is for our product
      if ((data.productId && data.productId === product._id) || (data.slug && data.slug === product.slug)) {
        console.log(`EventBus: Received bookmark event for ${product.name}`, data);

        if (data.count !== undefined && data.count !== currentBookmarkCount) {
          console.log(`EventBus: Updating bookmark count from ${currentBookmarkCount} to ${data.count}`);
          setCurrentBookmarkCount(data.count);
        }
      }
    };

    const handleEventBusProductUpdate = (data) => {
      // Check if this event is for our product
      if ((data.productId && data.productId === product._id) || (data.slug && data.slug === product.slug)) {
        console.log(`EventBus: Received product update for ${product.name}`, data);

        if (data.updates) {
          const updates = data.updates;

          if (updates.upvoteCount !== undefined && updates.upvoteCount !== currentUpvoteCount) {
            console.log(`EventBus: Updating upvote count from ${currentUpvoteCount} to ${updates.upvoteCount}`);
            setCurrentUpvoteCount(updates.upvoteCount);
          }

          if (updates.bookmarkCount !== undefined && updates.bookmarkCount !== currentBookmarkCount) {
            console.log(`EventBus: Updating bookmark count from ${currentBookmarkCount} to ${updates.bookmarkCount}`);
            setCurrentBookmarkCount(updates.bookmarkCount);
          }

          if (updates.viewCount !== undefined && updates.viewCount !== currentViewCount) {
            console.log(`EventBus: Updating view count from ${currentViewCount} to ${updates.viewCount}`);
            setCurrentViewCount(updates.viewCount);
          }
        }
      }
    };

    // Attach all event listeners
    socket.on('product:*:update', handleProductUpdate);
    socket.on('product:upvote', handleUpvoteEvent);
    socket.on('product:bookmark', handleBookmarkEvent);
    socket.on('product:view:update', handleViewEvent);

    // Subscribe to EventBus events
    const unsubscribeUpvote = eventBus.subscribe(EVENT_TYPES.UPVOTE_UPDATED, handleEventBusUpvote);
    const unsubscribeBookmark = eventBus.subscribe(EVENT_TYPES.BOOKMARK_UPDATED, handleEventBusBookmark);
    const unsubscribeProduct = eventBus.subscribe(EVENT_TYPES.PRODUCT_UPDATED, handleEventBusProductUpdate);

    // Clean up listeners
    return () => {
      console.log(`SOCKET (${subscriptionId}): Cleaning up listeners for ${product._id}`);

      // Unsubscribe from the product
      socket.emit('unsubscribe:product', product._id);

      // Remove socket event listeners
      socket.off('product:*:update', handleProductUpdate);
      socket.off('product:upvote', handleUpvoteEvent);
      socket.off('product:bookmark', handleBookmarkEvent);
      socket.off('product:view:update', handleViewEvent);

      // Unsubscribe from EventBus events
      unsubscribeUpvote();
      unsubscribeBookmark();
      unsubscribeProduct();
    };
    // Only re-run if product ID or socket connection changes
    // Removed other dependencies that were causing unnecessary re-subscriptions
  }, [product?._id, product?.slug, socket, socket?.connected, currentUpvoteCount, currentBookmarkCount, currentViewCount]);

  // --- Event Handlers (Keep polished versions) ---
  const handleBackClick = useCallback(() => router.back(), [router]);

  // We don't need these functions anymore since we're using OptimizedGallery
  // We don't need the fullscreen escape key handler anymore since we're using OptimizedGallery
  const handleEditSuccess = useCallback(
    (updatedProductData) => {
      setEditModalOpen(false);
      if (updatedProductData) {
        // Update primary state
        setProduct((prev) => ({ ...prev, ...updatedProductData }));
        // Ensure counts are also synced if provided
        if (updatedProductData.upvoteCount !== undefined)
          setCurrentUpvoteCount(updatedProductData.upvoteCount);
        if (updatedProductData.bookmarkCount !== undefined)
          setCurrentBookmarkCount(updatedProductData.bookmarkCount);
        if (updatedProductData.commentCount !== undefined)
          setCurrentCommentCount(updatedProductData.commentCount);
        if (updatedProductData.views?.count !== undefined)
          setCurrentViewCount(updatedProductData.views.count);

        updateProductInCache(slug, updatedProductData);
        showToast(
          "success",
          `"${updatedProductData.name || "Story"}" updated!`,
          3000
        );
      }
    },
    [slug, updateProductInCache, showToast]
  );

  // --- Derived Data (Keep robust versions) ---
  const formattedDate = product?.createdAt
    ? formatDistanceToNow(new Date(product.createdAt), { addSuffix: true })
    : "in the mists of time";
  const launchedDateFormatted = product?.launchedAt
    ? format(new Date(product.launchedAt), "MMMM do, yyyy")
    : null;
  const isOwner =
    isAuthenticated && user && product && user._id === product.maker?._id; // Added optional chaining for maker
  const getThumbnailUrl = useCallback(() => {
    if (!product) return "/images/placeholder-story-loading.png";
    const sources = [
      product.thumbnail?.url,
      typeof product.thumbnail === "string" ? product.thumbnail : null,
      product.gallery?.[0]?.url,
      typeof product.gallery?.[0] === "string" ? product.gallery[0] : null,
    ];
    const validSource = sources.find(
      (s) => s && typeof s === "string" && s.trim() !== ""
    );
    return validSource || "/images/placeholder-story-default.png";
  }, [product]);
  const thumbnailUrl = getThumbnailUrl();
  const makerName = product?.maker?.firstName
    ? `${product.maker.firstName} ${product.maker.lastName || ""}`.trim()
    : product?.makerProfile?.name || "A Mysterious & Brilliant Maker";

  // Use dynamic counts for display
  const displayViewCount = currentViewCount;
  const displayUpvoteCount = currentUpvoteCount;
  const displayBookmarkCount = currentBookmarkCount;
  const displayCommentCount = currentCommentCount;

  // --- Render Logic: Loading, Error, Not Found States (Enhanced with consistent theme) ---
  if (!isLoaded && loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-violet-50 via-white to-violet-50/50 p-4">
        <LoaderComponent message="Unfurling the scroll..." />
        <p className="text-sm text-violet-500 mt-2">
          Brewing coffee, gathering notes...
        </p>
        <div className="mt-8 w-full max-w-sm bg-violet-100/70 h-2.5 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-violet-500 to-violet-600 rounded-full"
            initial={{ x: "-100%" }}
            animate={{ x: "0%" }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "easeInOut",
            }}
          />
        </div>
      </div>
    );
  }

  if ((error || localError) && !product && isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50/80 via-violet-50/30 to-white p-6">
        <motion.div
          className="bg-white p-8 md:p-12 rounded-2xl shadow-xl max-w-lg text-center border border-violet-100/50"
          initial={{ opacity: 0, scale: 0.9, rotate: 1 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          <div className="text-violet-500 mb-5 flex justify-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                delay: 0.2,
                type: "spring",
                stiffness: 180,
                damping: 10,
              }}
            >
              <AlertCircle className="w-16 h-16 animate-pulse" />
            </motion.div>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
            Plot Twist: Glitch Encountered!
          </h1>
          <p className="text-gray-600 mb-6">
            Ach! Our storytellers hit a bump trying to retrieve this tale. Might
            be a cosmic ray, or maybe just a server hiccup.
            <span className="text-xs text-violet-500 block mt-2 font-mono">
              (Whispered error:{" "}
              {typeof (error || localError) === "string"
                ? error || localError
                : "Unknown Error"}
              )
            </span>
          </p>
          <div className="flex justify-center gap-4">
            <motion.button
              onClick={handleBackClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2.5 bg-gray-600 text-white rounded-xl font-medium hover:bg-gray-700 transition-colors shadow-sm"
            >
              Retreat! (Go Back)
            </motion.button>
            <motion.button
              onClick={() => loadProduct(true)} // Force refresh
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2.5 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700 transition-colors shadow-md"
            >
              Retry Quest!
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!product && !loading && isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-violet-50/30 to-violet-50/20 p-6">
        <motion.div
          className="bg-white p-8 md:p-12 rounded-2xl shadow-xl max-w-lg text-center border border-violet-100"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
        >
          <div className="text-violet-500 mb-5 flex justify-center">
            <motion.div
              initial={{ rotateY: -90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <MapPin className="w-16 h-16" />
            </motion.div>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
            Lost Page in the Archives!
          </h1>
          <p className="text-gray-600 mb-8">
            Our librarians searched high and low, but the manuscript for this
            product seems to have wandered off. Did it achieve sentience? Or is
            the link simply... dusty?
          </p>
          <motion.button
            onClick={handleBackClick}
            whileHover={{
              scale: 1.05,
              boxShadow: "0 5px 15px rgba(124, 58, 237, 0.3)",
            }}
            whileTap={{ scale: 0.95 }}
            className="px-7 py-3 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700 transition-colors shadow-md"
          >
            Explore Other Isles
          </motion.button>
        </motion.div>
      </div>
    );
  }

  if (!product) return <div className="min-h-screen bg-violet-50/20"></div>; // Consistent theme

  // --- THE GRAND NARRATIVE STRUCTURE ---
  return (
    <div className="bg-white min-h-screen overflow-x-hidden" ref={pageRef}>
      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-violet-500 via-violet-600 to-violet-500 z-50 origin-left"
        style={{ scaleX }}
      />
      {/* Edit Modal */}
      {isOwner && (
        <EditProductModal
          isOpen={editModalOpen}
          onClose={handleEditSuccess}
          product={product}
        />
      )}
      {/* View Tracker - Enhanced with better props and error handling */}
      {product?._id && (
        <ErrorBoundary fallback={<div className="hidden">View tracking failed</div>}>
          <ViewTracker
            productId={product._id}
            source={source}
            minimumViewTime={3000} // Increased to 3 seconds for better accuracy
            visibilityThreshold={0.6} // Increased threshold for better tracking
            elementSelector="#product-content" // Target specific element
          />
        </ErrorBoundary>
      )}
      {/* We don't need the fullscreen image modal anymore since we're using OptimizedGallery */}
      {/* --- The Article / Story --- */}
      <div id="product-content" className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 relative z-10">
        {/* Intro Navigation & Controls */}
        <motion.div
          className="mb-14 md:mb-18 flex justify-between items-center"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <button
            onClick={handleBackClick}
            className="flex items-center text-sm font-medium text-gray-500 hover:text-violet-700 group transition-colors"
          >
            <ArrowLeft
              size={18}
              className="mr-1.5 transition-transform group-hover:-translate-x-1"
            />
            Back to the Bazaar
          </button>
          {isOwner && (
            <motion.button
              className="flex items-center gap-1.5 px-4 py-3 bg-white border border-violet-200 text-violet-700 rounded-lg hover:bg-violet-50 hover:border-violet-300 transition-colors text-xs font-medium shadow-sm"
              onClick={() => setEditModalOpen(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Edit size={14} /> Edit Product
            </motion.button>
          )}
        </motion.div>

        {/* Main Content - Max width adjusted for readability */}
        <motion.article
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="max-w-3xl mx-auto"
        >
          {/* === THE PROLOGUE / HEADER === */}
          <motion.header
            variants={fadeInUp}
            className="mb-20 md:mb-28 text-center border-b-2 border-dashed border-violet-200 pb-12"
          >
            <motion.span
              className="inline-block px-5 py-1.5 bg-gradient-to-r from-violet-100 to-violet-100 text-violet-800 rounded-full text-sm font-normal mb-7 border border-violet-200/70 tracking-wide"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {product.categoryName || "Mystery Item"}
            </motion.span>

            {/* Product Name - The Title */}
            <h1 className="text-3xl sm:text-4xl md:text-[3rem] font-extrabold text-gray-900 leading-tight mb-6 tracking-tighter pb-1">
              {product.name}
            </h1>

            {/* Tagline - The Subtitle */}
            <p className="text-md text-gray-700 font-normal leading-relaxed max-w-2xl mx-auto">
              {product.tagline ||
                `Come closer, adventurer, and behold this intriguing find!`}
            </p>

            {/* Featured Badge */}
            {product.featured && (
              <motion.div
                initial={{ opacity: 0, scale: 0.7, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{
                  delay: 0.4,
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                }}
                className="mt-7 inline-flex items-center gap-2 px-5 py-2 rounded-full text-base font-medium bg-gradient-to-r from-violet-500 to-violet-600 text-white shadow-lg shadow-violet-500/30"
              >
                <Star className="w-5 h-5 animate-pulse" /> Chosen by the Crowd!
              </motion.div>
            )}
          </motion.header>

          {/* === CHAPTER 1: THE GRAND REVEAL (Visual & Core Actions) === */}
          <StorySection
            title="First Impressions"
            icon={Camera}
            delay={0.1}
            chapterNumber={1}
            id="reveal"
          >
            <NarrativeParagraph delay={0.15} intent="lead">
              Every epic journey starts with a single step, or in this case, a
              single glance! Feast your eyes on <strong>{product.name}</strong>{" "}
              in its natural habitat (or, you know, a nicely rendered image).
            </NarrativeParagraph>

            {/* Hero Visual with Enhanced Container - FIXED HEIGHT ISSUE */}
            <motion.div
              variants={fadeInUp}
              className="my-10 md:my-12 relative group"
            >
              <div className="relative overflow-hidden rounded-2xl shadow-2xl shadow-violet-200/60 border-2 border-white bg-gradient-to-br from-violet-50 to-violet-50 p-1.5">
                {/* Fixed thumbnail aspect ratio and height */}
                <div className="relative w-full aspect-[16/9] md:aspect-[16/10] h-auto min-h-[300px]">
                  <Image
                    src={thumbnailUrl}
                    alt={`Hero shot for the story of ${product.name}`}
                    fill
                    className="object-cover rounded-xl" // Rounded inside padding
                    priority
                    quality={90}
                    onError={(e) => {
                      e.target.src = "/images/placeholder-story-error.png";
                    }}
                    sizes="(max-width: 640px) 100vw, 800px"
                  />
                </div>

                {/* Pricing Overlay - Minimalist with theme */}
                {product.pricing?.type && product.pricing.type !== "tbd" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="absolute top-3 right-3 z-10 bg-white/85 backdrop-blur-sm text-violet-800 px-3.5 py-1.5 rounded-full font-medium shadow-md border border-violet-100/50 text-xs"
                  >
                    {product.pricing.type === "free"
                      ? "Absolutely Free!"
                      : product.pricing.type === "paid"
                      ? `${product.pricing.currency || "$"}${
                          product.pricing.amount
                        }`
                      : product.pricing.type === "subscription"
                      ? "Subscription"
                      : product.pricing.type === "freemium"
                      ? "Freemium Option"
                      : "Check Site"}
                  </motion.div>
                )}
              </div>

              {/* Enhanced Core Actions Bar Below Image - Improved CTAs with better hierarchy */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4 md:gap-5"
              >
                {/* Primary CTA Button - Enhanced for higher conversion */}
                {product.links?.website && (
                  <motion.a
                    href={product.links.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{
                      y: -4,
                      scale: 1.05,
                      boxShadow: "0 8px 20px rgba(124, 58, 237, 0.35)",
                    }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center justify-center w-full sm:w-auto gap-2 px-8 py-4 bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800 text-white rounded-xl transition-all shadow-lg text-base font-bold order-1 sm:order-1 z-10"
                  >
                    <Globe size={20} className="animate-pulse" /> Visit Website
                  </motion.a>
                )}

                {/* Secondary CTAs */}
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto order-3 sm:order-2">
                  {product.links?.demo && (
                    <motion.a
                      href={product.links.demo}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{
                        y: -3,
                        boxShadow: "0 6px 15px rgba(124, 58, 237, 0.15)",
                      }}
                      whileTap={{ scale: 0.97 }}
                      className="flex items-center justify-center w-full sm:w-auto gap-2 px-6 py-3 bg-violet-50 hover:bg-violet-100 text-violet-800 border border-violet-200 rounded-xl transition-all shadow-sm hover:shadow-md text-base font-medium"
                    >
                      <Play size={18} className="text-violet-500" /> Try Demo
                    </motion.a>
                  )}

                  {product.links?.github && (
                    <motion.a
                      href={product.links.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{
                        y: -3,
                        boxShadow: "0 6px 15px rgba(124, 58, 237, 0.15)",
                      }}
                      whileTap={{ scale: 0.97 }}
                      className="flex items-center justify-center w-full sm:w-auto gap-2 px-6 py-3 bg-violet-50 hover:bg-violet-100 text-violet-800 border border-violet-200 rounded-xl transition-all shadow-sm hover:shadow-md text-base font-medium"
                    >
                      <FaGithub size={18} className="text-violet-700" /> View Code
                    </motion.a>
                  )}
                </div>

                {/* View Statistics Button - Only for product owners */}
                {isOwner && (
                  <motion.a
                    href={`/product/viewanalytics/${product._id}`}
                    whileHover={{
                      y: -3,
                      boxShadow: "0 6px 15px rgba(124, 58, 237, 0.2)",
                    }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center justify-center w-full sm:w-auto gap-2 px-6 py-3 bg-violet-200 hover:bg-violet-300 text-violet-900 border border-violet-300 rounded-xl transition-all shadow-sm hover:shadow-md text-base font-medium order-2 sm:order-3"
                  >
                    <Eye size={18} /> View Statistics
                  </motion.a>
                )}
              </motion.div>
            </motion.div>

            {/* Initial Quick Interactions */}
            <NarrativeParagraph delay={0.25} intent="highlight">
              Impressed? Curious? Show some love or bookmark it for later!
              <span className="mt-4 flex justify-center gap-4">
                <UpvoteButton
                  product={product}
                  source="product_story_chapter1"
                  showText={true}
                />
                <BookmarkButton
                  product={product}
                  source="product_story_chapter1"
                  showText={true}
                />
              </span>
            </NarrativeParagraph>
          </StorySection>

          {/* === CHAPTER 2: THE ORIGIN SPARK === */}
          <StorySection
            title="Genesis: The Big Idea"
            icon={Brain}
            delay={0.1}
            chapterNumber={2}
            id="origin-story"
          >
            <NarrativeParagraph delay={0.15} intent="lead">
              So, how did{" "}
              <strong className="text-violet-800">{product.name}</strong> leap
              from a twinkle in someone's eye to... well, <em>this</em>? Every
              invention has a backstory, often involving late nights, caffeine,
              and possibly a rubber duck.
            </NarrativeParagraph>

            <NarrativeParagraph delay={0.2}>
              Our tale begins approximately{" "}
              <strong className="text-violet-700">{formattedDate}</strong>, when{" "}
              <strong className="text-violet-700">{makerName}</strong> (our
              protagonist!) decided the world needed this creation.{" "}
              {launchedDateFormatted && (
                <>
                  It officially saw the light of day on{" "}
                  <strong className="text-violet-700">
                    {launchedDateFormatted}
                  </strong>
                  .
                </>
              )}{" "}
              What problem was itching to be solved? What dream fueled its
              creation? Let's hear the maker's words (or our best guess):
            </NarrativeParagraph>

            {/* Description Area - Enhanced with theme colors */}
            <motion.div
              className={`relative mt-8 text-gray-700 leading-relaxed whitespace-pre-line transition-all duration-700 ease-in-out overflow-hidden rounded-lg border border-violet-100 bg-white/70 p-6 shadow-sm ${
                isDescriptionExpanded ? "max-h-[9999px]" : "max-h-72"
              }`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
            >
              {product.description ||
                "The scrolls detailing the full origin story are currently sealed... perhaps guarded by a dragon? Or maybe the maker's just shy. Either way, the essence is clear: it's something awesome!"}
            </motion.div>

            {/* Expand/Collapse - Enhanced with theme */}
            {product.description && product.description.length > 350 && (
              <div className="relative mt-[-2rem] pt-10 flex justify-center">
                {!isDescriptionExpanded && (
                  <div className="absolute bottom-10 left-0 right-0 h-24 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none"></div>
                )}
                <motion.button
                  onClick={() =>
                    setIsDescriptionExpanded(!isDescriptionExpanded)
                  }
                  className="flex items-center gap-2 px-4 py-2 bg-violet-50 hover:bg-violet-100 rounded-full text-violet-700 hover:text-violet-800 transition-colors font-semibold text-base group relative z-10"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isDescriptionExpanded
                    ? "Condense the Tale"
                    : "Unfurl the Full Scroll"}
                  <motion.div
                    animate={{ rotate: isDescriptionExpanded ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {isDescriptionExpanded ? (
                      <ChevronUp size={18} />
                    ) : (
                      <ChevronDown size={18} />
                    )}
                  </motion.div>
                </motion.button>
              </div>
            )}
          </StorySection>

          {/* === CHAPTER 3: ECHOES FROM THE EXPLORERS (Stats) === */}
          <StorySection
            title="Community Chatter"
            icon={TrendingUp}
            delay={0.1}
            chapterNumber={3}
            id="community-buzz"
          >
            <NarrativeParagraph delay={0.15} intent="lead">
              A product launched is like a message in a bottle tossed into the
              vast ocean of the internet. Has anyone found it? What are the
              whispers saying? Let's tune into the frequency of the Bazaar...
            </NarrativeParagraph>

            {/* Updated Stats Grid with Soft Colors */}
            <motion.div
              variants={staggerContainer}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5 my-12" // Adjusted gap and margin
            >
              <NarrativeStat
                icon={Eye}
                value={displayViewCount}
                label={
                  displayViewCount === 1 ? "Lone Explorer" : "Curious Eyes"
                }
                delay={0.2}
                color="peach" // Soft Violet
              />
              <NarrativeStat
                icon={ThumbsUp}
                value={displayUpvoteCount}
                label={
                  displayUpvoteCount === 1 ? "First Applause" : "Appreciations"
                }
                delay={0.25}
                color="slate" // Soft Green
              />
              <NarrativeStat
                icon={Bookmark}
                value={displayBookmarkCount}
                label={
                  displayBookmarkCount === 1
                    ? "Treasure Marked"
                    : "Saved Quests"
                }
                delay={0.3}
                color="rose" // Soft Rose
              />
              <NarrativeStat
                icon={MessageCircle}
                value={displayCommentCount}
                label={
                  displayCommentCount === 1 ? "First Word" : "Conversations"
                }
                delay={0.35}
                color="amber" // Soft Amber
              />
            </motion.div>

            {/* Narrative interpretation using updated highlight style */}
            <NarrativeParagraph delay={0.4} intent="highlight">
              {interpretStats(
                displayViewCount,
                displayUpvoteCount,
                displayBookmarkCount,
                displayCommentCount,
                product.name
              )}
            </NarrativeParagraph>

            <NarrativeParagraph delay={0.45}>
              Remember, every view, upvote, comment, and bookmark shapes the
              ongoing saga of <strong>{product.name}</strong>! Don't be shy, add
              your voice to the chorus.
            </NarrativeParagraph>
          </StorySection>

          {/* === CHAPTER 4: THE ALCHEMIST'S FORMULA (Features/Tags) === */}
          {(product.tags && product.tags.length > 0) ||
          product.features?.length > 0 ? (
            <StorySection
              title="Secret Sauce & Special Powers"
              icon={Rocket}
              delay={0.1}
              chapterNumber={4}
              id="features"
            >
              <NarrativeParagraph delay={0.15} intent="lead">
                What magical ingredients give <strong>{product.name}</strong>{" "}
                its unique flair? What powers does it wield? Let's peek into the
                alchemist's notes...
              </NarrativeParagraph>

              {/* Tags/Features Display - Theme enhanced */}
              <motion.div
                variants={staggerContainer}
                className="mt-8 space-y-4"
              >
                {product.tags &&
                  product.tags.map((tag, index) => (
                    <motion.div
                      key={`tag-${index}`}
                      className="group flex items-center gap-3 p-4 bg-white border border-dashed border-violet-200 rounded-lg hover:border-solid hover:border-violet-300 hover:bg-violet-50/50 transition-all cursor-default"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + index * 0.07 }}
                      whileHover={{ scale: 1.02, x: 0 }}
                    >
                      <Zap
                        size={18}
                        className="text-violet-500 group-hover:text-violet-600 transition-colors flex-shrink-0"
                      />
                      <span className="text-base font-medium text-gray-700 group-hover:text-gray-800">
                        {tag}
                      </span>
                    </motion.div>
                  ))}
              </motion.div>

              <NarrativeParagraph
                delay={0.2 + (product.tags?.length || 0) * 0.07}
                intent="aside"
                className="mt-6"
              >
                These are just some highlights – the real magic often lies in
                how they combine!
              </NarrativeParagraph>
            </StorySection>
          ) : null}

          {/* === CHAPTER 5: VISUAL EVIDENCE (Gallery) === */}
          {product.gallery && product.gallery.length > 0 ? (
            <StorySection
              title="A Gallery of Wonders"
              icon={Camera}
              delay={0.1}
              chapterNumber={5}
              id="gallery"
            >
              <NarrativeParagraph delay={0.15} intent="lead">
                Talk is cheap, pixels are priceless! Embark on a visual tour
                through the world of <strong>{product.name}</strong>. Prepare
                for potential awe.
              </NarrativeParagraph>

              <OptimizedGallery
                images={product.gallery}
                productName={product.name}
                isOwner={isOwner}
                onManageClick={() => {
                  setEditModalOpen(true);
                  setTimeout(() => {
                    eventBus.publish(EVENT_TYPES.SWITCH_MODAL_TAB, {
                      tab: "gallery",
                    });
                  }, 150);
                }}
              />
            </StorySection>
          ) : (
            // If no gallery, mention it playfully
            <StorySection
              title="Visuals Pending..."
              icon={Camera}
              delay={0.1}
              chapterNumber={5}
              id="gallery-missing"
            >
              <NarrativeParagraph delay={0.15} intent="aside">
                Hmm, it seems the camera crew hasn't arrived yet, or the photos
                are still developing. We're eager to see the visuals for{" "}
                <strong>{product.name}</strong> when they're ready!
              </NarrativeParagraph>

              {isOwner && (
                <motion.div
                  className="mt-8 flex flex-col items-center rounded-xl bg-gradient-to-br from-violet-50 to-indigo-50 p-8 text-center shadow-sm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="p-4 rounded-full bg-violet-100">
                    <CameraIcon className="h-12 w-12 text-violet-500" />
                  </div>
                  <p className="mt-4 text-lg font-semibold text-violet-800">
                    Time to showcase your creation!
                  </p>
                  <p className="mt-2 text-gray-600 max-w-md">
                    Add images to bring <strong>{product.name}</strong> to life.
                    High-quality visuals can significantly increase engagement.
                  </p>
                  <motion.button
                    onClick={() => {
                      setEditModalOpen(true);
                      setTimeout(() => {
                        eventBus.publish(EVENT_TYPES.SWITCH_MODAL_TAB, {
                          tab: "gallery",
                        });
                      }, 150);
                    }}
                    className="mt-6 flex items-center gap-2 rounded-lg bg-violet-600 px-6 py-3 font-medium text-white transition-all hover:bg-violet-700"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <PlusIcon className="h-5 w-5" />
                    Add Images
                  </motion.button>
                </motion.div>
              )}
            </StorySection>
          )}

          {/* === CHAPTER 6: MEET THE ARCHITECT === */}
          {product.maker && (
            <StorySection
              title="The Mastermind"
              icon={PenTool}
              delay={0.1}
              chapterNumber={6}
              id="maker"
            >
              <NarrativeParagraph delay={0.15} intent="lead">
                Who's the brilliant (and possibly slightly eccentric) architect
                behind <strong>{product.name}</strong>? Give it up for{" "}
                <strong>{makerName}</strong>!
              </NarrativeParagraph>
              <motion.div
                variants={fadeInUp}
                transition={{ delay: 0.2 }}
                className="mt-8 bg-gradient-to-br from-violet-50/40 via-white to-violet-50/30 rounded-2xl border border-violet-100/50 shadow-lg p-6 md:p-8 flex flex-col sm:flex-row items-center text-center sm:text-left gap-6 hover:shadow-xl transition-shadow duration-300"
              >
                <motion.div
                  className="flex-shrink-0 relative"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-xl relative bg-gradient-to-br from-violet-400 to-violet-500 flex items-center justify-center">
                    {product.maker.profilePicture?.url ? (
                      <Image
                        src={product.maker.profilePicture.url}
                        alt={`Profile picture of ${makerName}`}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          e.target.style.display = "none"; // Hide broken image icon
                        }}
                      />
                    ) : (
                      <span className="text-white text-4xl font-semibold">
                        {makerName
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase() || "?"}
                      </span>
                    )}
                  </div>
                </motion.div>
                <div className="flex-grow">
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">
                    {makerName}
                  </h3>
                  <p className="text-violet-700 font-semibold text-base mb-2">
                    {product.maker.bio ||
                      product.makerProfile?.title ||
                      "Wizard of Wires / Artisan Coder"}
                  </p>
                  {product.maker.tagline && (
                    <NarrativeParagraph
                      intent="quote"
                      className="!mb-0 !pl-0 !border-l-0 before:!content-none"
                    >
                      "{product.maker.tagline}"
                    </NarrativeParagraph>
                  )}
                </div>
              </motion.div>
            </StorySection>
          )}

          {/* === CHAPTER 7: THE TOWN SQUARE (Comments) === */}
          <StorySection
            title="Your Turn to Speak!"
            icon={MessageSquare}
            delay={0.1}
            chapterNumber={7}
            id="comments"
          >
            <NarrativeParagraph delay={0.15} intent="lead">
              The story isn't complete without *your* voice! What did you think?
              Questions? Epiphanies? Funny anecdotes? Drop them below and join
              the conversation around <strong>{product.name}</strong>.
            </NarrativeParagraph>
            <motion.div variants={fadeInUp} className="mt-8">
              <CommentSection
                productSlug={product.slug}
                productId={product._id}
                isAuthenticated={isAuthenticated}
                onCommentCountChange={setCurrentCommentCount}
              />
            </motion.div>
          </StorySection>

          {/* === EPILOGUE: FURTHER ADVENTURES === */}
          {product?._id && (
            <StorySection
              title="Where To Next, Explorer?"
              icon={Compass}
              delay={0.1}
              chapterNumber={8}
              id="similar"
            >
              <NarrativeParagraph delay={0.15}>
                Did the tale of <strong>{product.name}</strong> spark your
                curiosity? Perhaps these related legends and artifacts will
                catch your eye...
              </NarrativeParagraph>
              <motion.div variants={fadeInUp} className="mt-8">
                <SimilarProductsSection
                  productId={product._id}
                  limit={3}
                  tags={product.tags || []}
                  category={product.category?.slug}
                />
              </motion.div>
              {/* Category Link */}
              <div className="mt-14 text-center border-t border-dashed border-violet-200 pt-10">
                <NarrativeParagraph delay={0.2} className="mb-6">
                  Or continue exploring the{" "}
                  <strong className="text-violet-700">
                    {product.categoryName || "Uncharted Territories"}
                  </strong>{" "}
                  category!
                </NarrativeParagraph>
                <motion.button
                  onClick={() =>
                    router.push(
                      `/category/${product.category?.slug || "general"}`
                    )
                  }
                  whileHover={{
                    scale: 1.03,
                    y: -2,
                    boxShadow: "0 6px 15px rgba(124, 58, 237, 0.2)",
                  }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700 transition-colors shadow-md"
                >
                  Venture Forth into {product.categoryName || "Category"}
                  <ArrowRight size={18} />
                </motion.button>
              </div>
            </StorySection>
          )}

          {/* --- POST-CREDITS / FOOTER CONTROLS --- */}
          <motion.div
            variants={fadeInUp}
            className="mt-20 pt-10 border-t border-violet-100 flex flex-wrap justify-center items-center gap-4 text-sm"
          >
            {/* Share Button (themed) */}
            <motion.button
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-50 to-violet-100/80 text-violet-700 border border-violet-200/80 rounded-lg hover:shadow-md hover:border-violet-300 transition-all font-medium"
              onClick={() => {
                // Basic share functionality (can be enhanced)
                if (navigator.share) {
                  navigator
                    .share({
                      title: product.name,
                      text:
                        product.tagline ||
                        `Check out ${product.name} on Product Bazar!`,
                      url: window.location.href,
                    })
                    .catch(console.error);
                } else {
                  // Fallback for browsers that don't support navigator.share
                  navigator.clipboard.writeText(window.location.href);
                  showToast("info", "Link copied to clipboard!", 2000);
                }
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Share2 size={16} /> Spread the Legend
            </motion.button>
          </motion.div>

          {/* Enhanced Footer with CTA Reminder */}
          <motion.div
            variants={fadeInUp}
            transition={{ delay: 0.2 }}
            className="text-center text-xs text-violet-500 mt-24"
          >
            {/* Final CTA Reminder */}
            {product.links?.website && (
              <motion.div
                className="mb-12 flex flex-col items-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <p className="text-gray-700 mb-4 text-base">
                  Ready to experience <strong className="text-violet-700">{product.name}</strong> for yourself?
                </p>
                <motion.a
                  href={product.links.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{
                    y: -3,
                    scale: 1.03,
                    boxShadow: "0 8px 20px rgba(124, 58, 237, 0.3)",
                  }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800 text-white rounded-xl transition-all shadow-md text-base font-semibold"
                >
                  <Globe size={18} /> Visit Website Now
                </motion.a>
              </motion.div>
            )}

            <p className="font-medium text-base text-violet-600 mb-1">
              ~ Fin ~
            </p>
            <p>This tale was brought to you by Product Bazar.</p>
            <p>
              Enjoying the stories?{" "}
              <a href="/feedback" className="text-violet-500 hover:underline">
                Share your thoughts!
              </a>
            </p>
          </motion.div>
        </motion.article>
      </div>
    </div>
  );
};

export default ProductDetailPage;
