"use client";

import React, { useEffect, useState } from "react";

import NumberedProductList from "./NumberedProductList";
import { useRecommendation } from "../../../Contexts/Recommendation/RecommendationContext";
import { globalRecommendationTracker } from "../../../Utils/recommendationUtils";
import logger from "../../../Utils/logger";
import { makePriorityRequest } from "../../../Utils/api";



const NewProductsSection = () => {
  const { getNewRecommendations } = useRecommendation();
  const [newProducts, setNewProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    let abortController = new AbortController();

    const fetchNewProducts = async () => {
      // Only show loading state if we don't have any data yet
      if (newProducts.length === 0) {
        if (isMounted) setIsLoading(true);
      }

      try {
        // Check if we've fetched recently to avoid excessive API calls
        const lastFetchKey = 'new_products_last_fetch';
        const lastFetch = parseInt(sessionStorage.getItem(lastFetchKey) || '0');
        const now = Date.now();
        const refreshInterval = 2 * 60 * 1000; // 2 minutes

        // If we have data and fetched recently, skip the fetch
        if (newProducts.length > 0 && now - lastFetch < refreshInterval) {
          if (isMounted) setIsLoading(false);
          return;
        }

        // The context now handles caching, in-flight requests, and rate limiting
        // Request more recommendations to ensure we have enough distinct ones
        const options = {
          signal: abortController.signal // Add abort signal for cleanup
        };

        const results = await getNewRecommendations(12, 0, 14, false, options);

        // Only update state if component is still mounted and we got valid results
        if (isMounted) {
          if (Array.isArray(results) && results.length > 0) {
            // Get distinct recommendations that haven't been seen in other sections
            const distinctResults = globalRecommendationTracker.getDistinct(results, 6);
            globalRecommendationTracker.markAsSeen(distinctResults);

            setNewProducts(distinctResults);

            // Store the fetch time
            try {
              sessionStorage.setItem(lastFetchKey, now.toString());
            } catch (e) {
              // Ignore storage errors
            }

            // Only log in development and with rate limiting
            if (process.env.NODE_ENV === 'development') {
              const logKey = 'new_products_log';
              const lastLog = parseInt(sessionStorage.getItem(logKey) || '0');

              // Only log once every 30 seconds
              if (now - lastLog > 30000) {
                logger.debug(`Loaded ${distinctResults.length} new product recommendations`);

                try {
                  sessionStorage.setItem(logKey, now.toString());
                } catch (e) {
                  // Ignore storage errors
                }
              }
            }

            // Clear any previous errors
            if (error) setError(null);
          } else if (newProducts.length === 0) {
            // Only show warning if we don't have existing data
            logger.warn("No new products found or invalid response format");

            // Try to fetch new products directly from the products API as fallback
            try {
              // Use the API utility for better error handling and consistency
              const response = await makePriorityRequest('GET', '/recommendations/new', {
                params: {
                  limit: 6,
                  days: 30,
                  _t: Date.now() // Cache busting
                },
                signal: abortController.signal
              });

              if (response.data.success && Array.isArray(response.data.data) && response.data.data.length > 0) {
                // The data is already in the correct format for recommendations API
                const transformedData = response.data.data;
                // Mark these recommendations as seen to prevent duplicates
                globalRecommendationTracker.markAsSeen(transformedData);
                setNewProducts(transformedData);

                // Store the fetch time for the fallback as well
                try {
                  sessionStorage.setItem(lastFetchKey, now.toString());
                } catch (e) {
                  // Ignore storage errors
                }

                // Only log in development
                if (process.env.NODE_ENV === 'development') {
                  logger.info(`Loaded ${transformedData.length} new products from fallback API`);
                }

                if (error) setError(null);
              }
            } catch (fallbackError) {
              if (!abortController.signal.aborted) {
                logger.error("Fallback new products fetch failed:", fallbackError);

                // Try one more fallback to the direct products API
                try {
                  // Use the API utility for better error handling and consistency
                  const response = await makePriorityRequest('GET', '/products/trending', {
                    params: {
                      limit: 6,
                      timeRange: '30d',
                      _t: Date.now() // Cache busting
                    },
                    signal: abortController.signal
                  });

                  if (response.data.success && Array.isArray(response.data.data) && response.data.data.length > 0) {
                    // Transform the data to match the expected format
                    const transformedData = response.data.data.map(product => ({
                      productData: product,
                      product: product._id,
                      score: 1.0,
                      reason: 'new',
                      explanationText: 'Recently added product'
                    }));
                    setNewProducts(transformedData);

                    // Store the fetch time for the second fallback as well
                    try {
                      sessionStorage.setItem(lastFetchKey, now.toString());
                    } catch (e) {
                      // Ignore storage errors
                    }

                    // Only log in development
                    if (process.env.NODE_ENV === 'development') {
                      logger.info(`Loaded ${transformedData.length} new products from second fallback API`);
                    }

                    if (error) setError(null);
                  }
                } catch (secondFallbackError) {
                  if (!abortController.signal.aborted) {
                    logger.error("Second fallback new products fetch failed:", secondFallbackError);
                  }
                }
              }
            }
          }
          if (isMounted) setIsLoading(false);
        }
      } catch (error) {
        if (error.name !== 'CanceledError' &&
            error.code !== 'ERR_CANCELED' &&
            !abortController.signal.aborted &&
            isMounted) {
          logger.error("Failed to fetch new products:", error);
          // Only set error if we don't have existing data and component is mounted
          if (isMounted && newProducts.length === 0) {
            setError("Failed to load new products");
          }
        }
        // Set loading to false if component is still mounted
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchNewProducts();

    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [getNewRecommendations, error, newProducts.length]);

  return (
    <div>
      {error ? (
        <div className="text-center py-4">
          <p className="text-red-500">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-violet-600 hover:text-violet-700 text-sm font-medium px-4 py-2 bg-violet-50 rounded-lg"
          >
            Try again
          </button>
        </div>
      ) : (
        <NumberedProductList
          products={newProducts}
          isLoading={isLoading}
          emptyMessage="No new products available at the moment. Check back soon!"
          viewAllLink="/new"
          recommendationType="new"
        />
      )}
    </div>
  );
};

export default NewProductsSection;
