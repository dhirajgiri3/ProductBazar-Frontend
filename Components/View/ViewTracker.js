import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import viewService from "../../services/viewService";
import { useAuth } from "../../Contexts/Auth/AuthContext";
import { useRecommendation } from "../../Contexts/Recommendation/RecommendationContext";

const ViewTracker = ({
  productId,
  source = "direct",
  position = null,
  recommendationType = null,
  minimumViewTime = 2000, // 2 seconds
  visibilityThreshold = 0.5, // 50% visible
}) => {
  const { user } = useAuth();
  const { recordInteraction } = useRecommendation();
  const router = useRouter();
  const timerRef = useRef(null);
  const viewStartTimeRef = useRef(null);
  const hasTrackedRef = useRef(false);
  const observerRef = useRef(null);

  // Generate a unique session ID if not exists
  const getSessionId = () => {
    if (typeof window === "undefined") return null;

    let sessionId = sessionStorage.getItem("viewSessionId");
    if (!sessionId) {
      sessionId = `sess-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      sessionStorage.setItem("viewSessionId", sessionId);
    }
    return sessionId;
  };

  // Check if view was already tracked in this session
  const isViewTracked = () => {
    if (typeof window === "undefined") return true;

    const viewKey = `view-${productId}-${source}`;
    const lastView = sessionStorage.getItem(viewKey);
    const SESSION_TTL = 30 * 60 * 1000; // 30 minutes

    return lastView && Date.now() - parseInt(lastView) < SESSION_TTL;
  };

  // Record the view interaction
  const recordView = async () => {
    if (!productId || hasTrackedRef.current) return;

    try {
      const viewData = {
        productId, // Ensure productId is included
        type: 'view', // Explicitly set interaction type
        source,
        position,
        recommendationType,
        userId: user?._id,
        sessionId: getSessionId(),
        referrer: document.referrer || router.asPath,
        url: window.location.href,
        userAgent: navigator.userAgent,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        metadata: {
          source,
          position,
          recommendationType,
          sessionId: getSessionId(),
          url: window.location.href
        }
      };

      // Record via both services
      await Promise.all([
        viewService.recordProductView(productId, viewData),
        recordInteraction(productId, 'view', viewData.metadata)
      ]);

      // Mark as tracked
      sessionStorage.setItem(`view-${productId}-${source}`, Date.now().toString());
      hasTrackedRef.current = true;
    } catch (error) {
      console.error("View tracking error:", error);
      // Silently fail - don't disrupt UX
    }
  };

  // Cleanup resources
  const cleanup = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (observerRef.current) observerRef.current.disconnect();
  };

  useEffect(() => {
    if (!productId || typeof window === "undefined" || isViewTracked()) {
      return cleanup;
    }

    const element = document.querySelector(`[data-product-id="${productId}"]`);
    if (!element) return cleanup;

    const handleVisibilityChange = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !hasTrackedRef.current) {
          viewStartTimeRef.current = Date.now();

          // Start timer only if element remains visible
          timerRef.current = setTimeout(() => {
            recordView();
          }, minimumViewTime);
        } else {
          // Clear timer if element becomes not visible
          if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
          }
        }
      });
    };

    // Setup Intersection Observer
    observerRef.current = new IntersectionObserver(handleVisibilityChange, {
      threshold: visibilityThreshold,
      rootMargin: "0px 0px -100px 0px", // Ignore bottom 100px (footer)
    });

    observerRef.current.observe(element);

    // Record view duration on unmount
    return () => {
      cleanup();

      if (viewStartTimeRef.current) {
        const viewDuration = Date.now() - viewStartTimeRef.current;
        if (viewDuration >= minimumViewTime) {
          viewService.updateViewDuration(
            productId,
            Math.round(viewDuration / 1000),
            router.asPath
          );
        }
      }
    };
  }, [productId, source, position, recommendationType]);

  return null;
};

export default ViewTracker;
