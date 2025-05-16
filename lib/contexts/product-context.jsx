// file: frontend/Contexts/Product/ProductContext.js

"use client";

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import api, { makePriorityRequest } from "../api/api.js";
import logger from "../utils/logger.js";
import { useRouter } from "next/navigation";
import { normalizeProducts } from "../utils/product/product-utils.js";
import mongoose from "mongoose";
import { getSocket } from "../utils/socket.js";
import { addProductToMapping, getSlugFromId, getIdFromSlug, addProductsToMapping } from "../utils/product/product-mapping-utils.js";
import eventBus, { EVENT_TYPES } from "../utils/event-bus.js";
import { useAuth } from "./auth-context.jsx";
import { optimizeImage } from "../utils/image/file-upload.js";

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentProduct, setCurrentProduct] = useState(null);
  // Global product cache to store all products that have been loaded
  const [productCache, setProductCache] = useState({});
  const router = useRouter();

  // Setup socket event listeners for real-time updates
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    // Listen for product upvote events
    const handleUpvoteEvent = (data) => {
      if (!data.productId || data.count === undefined) return;

      // Find the product slug from the ID using the global mapping utility
      const slug = getSlugFromId(data.productId);
      if (slug) {
        logger.info(`Updating product ${slug} from socket upvote event:`, data);

        // Update the product in cache
        updateProductInCache(slug, {
          upvoteCount: data.count,
          upvotes: {
            count: data.count
          }
        });
      } else {
        logger.info(`Received upvote event for product ${data.productId}`, data);
        logger.info(`Updating product ${data.productId} with socket data:`, {
          upvoteCount: data.count,
          upvotes: {
            count: data.count
          }
        });
      }
    };

    // Listen for product bookmark events
    const handleBookmarkEvent = (data) => {
      if (!data.productId || data.count === undefined) return;

      // Find the product slug from the ID using the global mapping utility
      const slug = getSlugFromId(data.productId);
      if (slug) {
        logger.info(`Updating product ${slug} from socket bookmark event:`, data);

        // Update the product in cache
        updateProductInCache(slug, {
          bookmarkCount: data.count,
          bookmarks: {
            count: data.count
          }
        });
      } else {
        logger.info(`Received bookmark event for product ${data.productId}`, data);
        logger.info(`Updating product ${data.productId} with socket data:`, {
          bookmarkCount: data.count,
          bookmarks: {
            count: data.count
          }
        });
      }
    };

    // Register event listeners
    socket.on('product:upvote', handleUpvoteEvent);
    socket.on('product:bookmark', handleBookmarkEvent);

    // Cleanup on unmount
    return () => {
      socket.off('product:upvote', handleUpvoteEvent);
      socket.off('product:bookmark', handleBookmarkEvent);
    };
  }, []);

  // Clear error state
  const clearError = () => setError(null);

  // Fetch product by slug
  const getProductBySlug = useCallback(async (slug, bypassCache = false) => {
    if (!slug) return null;
    setLoading(true);

    // Check if we have the product in memory cache already
    if (!bypassCache && currentProduct && currentProduct.slug === slug) {
      logger.info(`Using in-memory cached product for ${slug}`);
      setLoading(false);
      return currentProduct;
    }

    // Track retry attempts
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount <= maxRetries) {
      try {
        // Use makePriorityRequest instead of direct api call
        // Add cache busting parameter if bypassing cache
        const response = await makePriorityRequest('GET', `/products/${slug}`, {
          params: bypassCache ? { _bypass_cache: Date.now() } : undefined,
          retryCount // Pass retry count for exponential backoff
        });

        if (!response.data.success) {
          throw new Error(response.data.message || "Failed to fetch product");
        }

        const productData = response.data.data;
        // Get userInteractions from response if available (might be at response.data.userInteractions)
        const userInteractionsFromResponse = response.data.userInteractions || {};

        // Reliably determine the interaction states by prioritizing nested fields from API response
        // This is the key fix - we prioritize the fields we know are in the API response
        const hasUpvoted = userInteractionsFromResponse.hasUpvoted ?? productData.upvotes?.userHasUpvoted ?? false;
        const hasBookmarked = userInteractionsFromResponse.hasBookmarked ?? productData.bookmarks?.userHasBookmarked ?? false;

        // Get counts from the API response
        const upvoteCount = productData.upvoteCount ?? productData.upvotes?.count ?? 0;
        const bookmarkCount = productData.bookmarkCount ?? productData.bookmarks?.count ?? 0;

        // Log interaction data for debugging
        logger.info(`Product ${slug} interaction data:`, {
          apiResponse: {
            upvotes: productData.upvotes,
            bookmarks: productData.bookmarks,
            userInteractions: userInteractionsFromResponse
          },
          determinedValues: {
            hasUpvoted,
            hasBookmarked,
            upvoteCount,
            bookmarkCount
          }
        });

        // Create a fully normalized product object with consistent structure
        // Ensure all related fields are synchronized based on the reliably determined values
        const normalizedProduct = {
          ...productData,
          // Top-level interaction flags
          upvoted: hasUpvoted,
          bookmarked: hasBookmarked,

          // Top-level counts
          upvoteCount: upvoteCount,
          bookmarkCount: bookmarkCount,

          // Nested upvotes object
          upvotes: {
            ...productData.upvotes,
            count: upvoteCount,
            userHasUpvoted: hasUpvoted
          },

          // Nested bookmarks object
          bookmarks: {
            ...productData.bookmarks,
            count: bookmarkCount,
            userHasBookmarked: hasBookmarked
          },

          // Unified userInteractions object
          userInteractions: {
            ...userInteractionsFromResponse,
            hasUpvoted: hasUpvoted,
            hasBookmarked: hasBookmarked
          }
        };

        // Add the product to the global mapping for socket updates
        if (normalizedProduct._id && normalizedProduct.slug) {
          addProductToMapping(normalizedProduct);
        }

        // Add to global product cache
        setProductCache(prevCache => ({
          ...prevCache,
          [normalizedProduct.slug]: normalizedProduct
        }));

        // Update the current product state
        setCurrentProduct(normalizedProduct);
        setLoading(false);
        return normalizedProduct;

      } catch (err) {
        // Check if this is a rate limit error
        if (err.response?.status === 429) {
          retryCount++;

          if (retryCount <= maxRetries) {
            // Calculate backoff time with jitter
            const baseDelay = Math.min(Math.pow(2, retryCount) * 1000, 10000);
            const jitter = Math.random() * 1000;
            const delay = baseDelay + jitter;

            logger.warn(`Rate limited when fetching product ${slug}. Retrying in ${Math.round(delay/1000)}s (attempt ${retryCount}/${maxRetries})`);

            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, delay));
            continue; // Try again
          }
        }

        // For other errors or if we've exhausted retries
        setError(err.message);
        logger.error(`Error fetching product ${slug}:`, err);
        setLoading(false);
        return null;
      }
    }

    // If we get here, we've exhausted retries
    setError("Failed to fetch product after multiple attempts");
    setLoading(false);
    return null;
  }, [currentProduct]);

  // Fetch all products with pagination and filters
  const getAllProducts = useCallback(
    async ({
      page = 1,
      limit = 10,
      sort = "newest",
      category,
      status,
      bypassCache = false,
    } = {}) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page,
          limit,
          sort,
          ...(category && { category }),
          ...(status && { status }),
          ...(bypassCache && { _t: Date.now() }), // Cache buster
        });

        const response = await api.get(`/products?${params}`, {
          headers: bypassCache ? {
            'Cache-Control': 'no-cache, no-store',
            'Pragma': 'no-cache'
          } : {}
        });

        if (!response.data.success)
          throw new Error(response.data.message || "Failed to fetch products");

        // Validate products to make sure they still exist
        const products = normalizeProducts(response.data.data).filter(product => product && product._id);

        // Add all products to the global mapping for socket updates
        addProductsToMapping(products);

        return {
          products,
          pagination: response.data.pagination,
        };
      } catch (err) {
        setError(err.message);
        logger.error("Error fetching products:", err);
        return { products: [], pagination: null };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const validateProductUrl = useCallback(async (url) => {
    try {
      const response = await api.post("/products/validate-url", { url });
      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to validate URL");
      }
      return response.data.data;
    } catch (err) {
      setError(err.message);
      logger.error("Error validating URL:", err);
      return null;
    }
  }, []);

  // Create a new product with thumbnail and gallery
  const createProduct = async (productData) => {
    setLoading(true);
    try {
      // Create FormData for the product data and thumbnail
      const formData = new FormData();

      // Handle regular fields
      Object.entries(productData).forEach(([key, value]) => {
        if (value && key !== "thumbnail" && key !== "galleryImages") {
          // Handle pricing object - stringify it
          if (key === "pricing" && typeof value === "object") {
            formData.append(key, JSON.stringify(value));
          }
          // Handle arrays - join with commas
          else if (Array.isArray(value)) {
            formData.append(key, value.join(","));
          }
          // Handle objects - stringify them
          else if (typeof value === "object" && value !== null && !(value instanceof File)) {
            formData.append(key, JSON.stringify(value));
          }
          // Handle primitive values
          else {
            formData.append(key, value);
          }
        }
      });

      // Handle thumbnail
      if (productData.thumbnail instanceof File) {
        formData.append("thumbnail", productData.thumbnail);
      } else if (typeof productData.thumbnail === "string" && productData.thumbnail) {
        // Handle base64 images by converting to blob
        if (productData.thumbnail.startsWith("data:")) {
          try {
            const blob = dataURLtoBlob(productData.thumbnail);
            formData.append("thumbnail", blob, "thumbnail.jpg");
            logger.info("Added base64 thumbnail to form data");
          } catch (e) {
            logger.error("Failed to convert base64 thumbnail:", e);
            formData.append("thumbnail", productData.thumbnail);
          }
        } else {
          // For URL or other string values
          formData.append("thumbnail", productData.thumbnail);
        }
      }

      // Log the form data for debugging
      logger.info("Creating product with form data:", {
        fields: [...formData.entries()].map(([key]) => key)
      });

      // Create the product
      const response = await api.post("/products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to create product");
      }

      const createdProduct = response.data.data;

      // Handle gallery images if present
      if (productData.galleryImages && productData.galleryImages.length > 0 && createdProduct.slug) {
        try {
          logger.info(`Uploading ${productData.galleryImages.length} gallery images for new product ${createdProduct.slug}`);

          // Upload gallery images
          const galleryResult = await uploadGalleryImages(createdProduct.slug, productData.galleryImages);

          if (galleryResult.success) {
            logger.info(`Successfully uploaded gallery images for ${createdProduct.slug}`);
            // Update the created product with gallery data
            createdProduct.gallery = galleryResult.data;
          } else {
            logger.error(`Failed to upload gallery images for ${createdProduct.slug}: ${galleryResult.message}`);
          }
        } catch (galleryError) {
          logger.error(`Error uploading gallery images for new product ${createdProduct.slug}:`, galleryError);
          // Don't fail the whole operation if gallery upload fails
        }
      }

      return createdProduct;
    } catch (err) {
      setError(err.message);
      logger.error("Error creating product:", err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Helper function to convert data URL to Blob
  const dataURLtoBlob = (dataURL) => {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new Blob([u8arr], { type: mime });
  };

  // Update a product
  const updateProduct = useCallback(
    async (slug, productData) => {
      setLoading(true);
      try {
        let formData = new FormData();
        Object.entries(productData).forEach(([key, value]) => {
          if (value !== undefined && key !== "gallery" && key !== "thumbnail") {
            // Don't stringify an already stringified object
            if (key === "links" && typeof value === "string") {
              formData.append(key, value);
            } else if (Array.isArray(value)) {
              formData.append(key, value.join(","));
            } else if (typeof value === "object" && value !== null) {
              formData.append(key, JSON.stringify(value));
            } else {
              formData.append(key, value);
            }
          }
        });

        if (productData.thumbnail instanceof File) {
          formData.append("thumbnail", productData.thumbnail);
        }

        // Handle gallery images separately to avoid including them in the main update request
        const hasGalleryImages = productData.gallery && Array.isArray(productData.gallery) && productData.gallery.length > 0;

        // Store gallery images for later use after the main update request
        const galleryImagesToUpload = hasGalleryImages ? [...productData.gallery] : [];

        // Use makePriorityRequest instead of direct api call to prevent cancellations
        const response = await makePriorityRequest(
          'put',
          `/products/${slug}`,
          {
            data: formData,
            isFormData: true,
            headers: {
              "Content-Type": "multipart/form-data",
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'X-Cache-Invalidate': 'true' // Custom header for cache invalidation
            },
            params: { timestamp: Date.now() } // Add timestamp to ensure fresh request
          }
        );

        if (!response.data.success)
          throw new Error(response.data.message || "Failed to update product");

        // Get the updated product data
        const updatedProduct = response.data.data;
        const productId = updatedProduct._id || getIdFromSlug(slug);
        const newSlug = response.data.newSlug || updatedProduct.slug || slug;
        const slugChanged = response.data.slugChanged || false;

        // Handle gallery images upload if present
        if (galleryImagesToUpload.length > 0) {
          try {
            logger.info(`Uploading ${galleryImagesToUpload.length} gallery images for product ${newSlug}`);

            // Upload gallery images
            const galleryResult = await uploadGalleryImages(newSlug, galleryImagesToUpload);

            if (galleryResult.success) {
              logger.info(`Successfully uploaded gallery images for ${newSlug}`);
              // Update the product with gallery data
              updatedProduct.gallery = galleryResult.data;
            } else {
              logger.error(`Failed to upload gallery images for ${newSlug}: ${galleryResult.message}`);
            }
          } catch (galleryError) {
            logger.error(`Error uploading gallery images for product ${newSlug}:`, galleryError);
            // Don't fail the whole operation if gallery upload fails
          }
        }

        // Clear local cache for the old slug if it changed
        if (slugChanged && newSlug !== slug) {
          clearProductFromLocalCache(slug);
        }

        // Always clear cache for the new slug
        clearProductFromLocalCache(newSlug);

        // Update the global product cache with the updated product
        if (updatedProduct) {
          // If slug changed, remove the old entry
          if (slugChanged && newSlug !== slug) {
            setProductCache(prevCache => {
              const newCache = { ...prevCache };
              if (newCache[slug]) {
                delete newCache[slug];
                logger.info(`Removed old slug ${slug} from global cache due to slug change`);
              }
              return newCache;
            });
          }

          // Add the updated product to the cache with the new slug
          updateProductInCache(newSlug, updatedProduct);

          // If this is the current product, update it
          if (currentProduct && (currentProduct.slug === slug || currentProduct._id === productId)) {
            setCurrentProduct(updatedProduct);
          }

          // Broadcast a product updated event
          eventBus.publish(EVENT_TYPES.PRODUCT_UPDATED, {
            oldSlug: slug,
            newSlug: newSlug,
            slugChanged: slugChanged,
            productId: productId,
            product: updatedProduct,
            timestamp: Date.now()
          });
        }

        return response.data;
      } catch (err) {
        setError(err.message);
        logger.error("Error updating product:", err);
        return { success: false, message: err.message };
      } finally {
        setLoading(false);
      }
    },
    [currentProduct]
  );

  // Delete a product
  const deleteProduct = useCallback(
    async (slug) => {
      setLoading(true);
      try {
        // Use makePriorityRequest instead of direct api call to prevent cancellations
        const response = await makePriorityRequest(
          'delete',
          `/products/${slug}`,
          {
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'X-Cache-Invalidate': 'true' // Custom header for cache invalidation
            },
            params: { timestamp: Date.now() } // Add timestamp to ensure fresh request
          }
        );

        if (!response.data.success)
          throw new Error(response.data.message || "Failed to delete product");

        // Get the product ID from the response or from the global mapping
        const productId = response.data.productId || getIdFromSlug(slug);

        // Process successful deletion
        return processProductDeletion(slug, productId);
      } catch (err) {
        // Special handling for 404 errors - the product is already deleted
        if (err.response && err.response.status === 404) {
          logger.warn(`Product ${slug} not found (404). It may have been already deleted.`);

          // Get the product ID from the global mapping
          const productId = getIdFromSlug(slug);

          // Process the deletion anyway to clean up the UI
          return processProductDeletion(slug, productId, true);
        }

        // Handle other errors
        setError(err.message);
        logger.error("Error deleting product:", err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [router, currentProduct]
  );

  // Helper function to process product deletion (used by deleteProduct)
  const processProductDeletion = useCallback((slug, productId, wasAlreadyDeleted = false) => {
    // Clear local product data from any in-memory caches
    clearProductFromLocalCache(slug);

    // Remove the product from the global product cache
    setProductCache(prevCache => {
      const newCache = { ...prevCache };
      if (newCache[slug]) {
        delete newCache[slug];
        logger.info(`Removed product ${slug} from global cache`);
      }
      return newCache;
    });

    // If this is the current product, clear it
    if (currentProduct && (currentProduct.slug === slug || currentProduct._id === productId)) {
      setCurrentProduct(null);
    }

    // Broadcast a product deleted event
    eventBus.publish(EVENT_TYPES.PRODUCT_DELETED, {
      slug,
      productId,
      wasAlreadyDeleted,
      timestamp: Date.now()
    });

    // Navigate to products page
    router.push("/products");
    return true;
  }, [currentProduct, router]);

  // Add a function to clear product from local cache sources
  const clearProductFromLocalCache = (slug) => {
    // Clear any React Query caches if you're using it
    // queryClient.invalidateQueries(['product', slug]);
    // queryClient.invalidateQueries('products');

    // Remove from localStorage if you're caching there
    try {
      const cachedProductsKey = 'cached_products';
      const cachedProducts = JSON.parse(localStorage.getItem(cachedProductsKey) || '{}');
      if (cachedProducts[slug]) {
        delete cachedProducts[slug];
        localStorage.setItem(cachedProductsKey, JSON.stringify(cachedProducts));
      }

      // Clear any other product listings from localStorage
      localStorage.removeItem('product_list_cache');
      localStorage.removeItem('trending_products');
      localStorage.removeItem('featured_products');
    } catch (error) {
      logger.error('Error clearing local product cache:', error);
    }

    // Force refresh of browser cache for this product
    if (typeof window !== 'undefined') {
      const productUrl = `/products/${slug}`;
      const cachedUrls = [productUrl, '/products', '/'];

      // If the Cache API is available, use it to delete cached responses
      if ('caches' in window) {
        caches.keys().then(cacheNames => {
          cacheNames.forEach(cacheName => {
            caches.open(cacheName).then(cache => {
              cachedUrls.forEach(url => {
                cache.delete(url).then(() => {
                  logger.debug(`Cleared cache for ${url}`);
                });
              });
            });
          });
        });
      }
    }
  };

  // Track active requests to prevent duplicate submissions
  const activeRequests = {};

  const setActiveRequest = (key) => {
    activeRequests[key] = true;
  };

  const clearActiveRequest = (key) => {
    delete activeRequests[key];
  };

  // Removed unused getActiveRequests function

  // Update product in cache
  const updateProductInCache = (slugOrId, updates) => {
    if (!slugOrId || !updates) return;

    // Determine if we're using a slug or an ID
    let slug = slugOrId;

    // Check if this is a MongoDB ObjectId (string format)
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(slugOrId);

    if (isObjectId) {
      // This is an ID, look up the slug using the global mapping utility
      slug = getSlugFromId(slugOrId);
      if (!slug) {
        logger.warn(`Cannot update product cache: No slug found for ID ${slugOrId}`);
        return;
      }
    }

    // Function to synchronize all related fields for consistency
    const synchronizeProductFields = (prev, updates) => {
      // First, apply the direct updates
      const updated = {
        ...prev,
        ...updates
      };

      // Extract the key interaction values that might have been updated
      // Use nullish coalescing to prioritize the most recently updated values
      const hasUpvoted = updates.upvoted ??
                        updates.upvotes?.userHasUpvoted ??
                        updates.userInteractions?.hasUpvoted ??
                        prev.upvoted ??
                        prev.upvotes?.userHasUpvoted ??
                        prev.userInteractions?.hasUpvoted ??
                        false;

      const hasBookmarked = updates.bookmarked ??
                           updates.bookmarks?.userHasBookmarked ??
                           updates.userInteractions?.hasBookmarked ??
                           prev.bookmarked ??
                           prev.bookmarks?.userHasBookmarked ??
                           prev.userInteractions?.hasBookmarked ??
                           false;

      const upvoteCount = updates.upvoteCount ??
                        updates.upvotes?.count ??
                        prev.upvoteCount ??
                        prev.upvotes?.count ??
                        0;

      const bookmarkCount = updates.bookmarkCount ??
                           updates.bookmarks?.count ??
                           prev.bookmarkCount ??
                           prev.bookmarks?.count ??
                           0;

      // Now ensure all related fields are synchronized with these values
      // This is the key improvement - we ensure complete consistency across all fields

      // Top-level flags
      updated.upvoted = hasUpvoted;
      updated.bookmarked = hasBookmarked;

      // Top-level counts
      updated.upvoteCount = upvoteCount;
      updated.bookmarkCount = bookmarkCount;

      // Nested upvotes object
      if (!updated.upvotes) updated.upvotes = {};
      updated.upvotes.count = upvoteCount;
      updated.upvotes.userHasUpvoted = hasUpvoted;

      // Nested bookmarks object
      if (!updated.bookmarks) updated.bookmarks = {};
      updated.bookmarks.count = bookmarkCount;
      updated.bookmarks.userHasBookmarked = hasBookmarked;

      // Unified userInteractions object
      if (!updated.userInteractions) updated.userInteractions = {};
      updated.userInteractions.hasUpvoted = hasUpvoted;
      updated.userInteractions.hasBookmarked = hasBookmarked;

      // Log the synchronized fields for debugging
      logger.debug(`Synchronized product fields for ${updated.slug || updated._id}:`, {
        upvoted: hasUpvoted,
        bookmarked: hasBookmarked,
        upvoteCount: upvoteCount,
        bookmarkCount: bookmarkCount
      });

      return updated;
    };

    // Update the global product cache
    setProductCache(prevCache => {
      // Check if we have this product in the cache
      const existingProduct = prevCache[slug];

      if (existingProduct) {
        // Log the cache update for debugging
        logger.info(`Updating global product cache for ${slug}:`, updates);

        // Create a new product object with synchronized fields
        const updatedProduct = synchronizeProductFields(existingProduct, updates);

        // Return a new cache object with the updated product
        return {
          ...prevCache,
          [slug]: updatedProduct
        };
      } else if (currentProduct && (currentProduct.slug === slug || currentProduct._id === slugOrId)) {
        // If not in cache but matches current product, add it to cache
        logger.info(`Adding current product to global cache for ${slug}:`, updates);

        // Create a new product object with synchronized fields
        const updatedProduct = synchronizeProductFields(currentProduct, updates);

        // Return a new cache object with the updated product
        return {
          ...prevCache,
          [slug]: updatedProduct
        };
      }

      // If the product isn't in the cache yet, just return the current cache
      return prevCache;
    });

    // If we have this product in state, update it
    if (currentProduct && (currentProduct.slug === slug || currentProduct._id === slugOrId)) {
      // Log the cache update for debugging
      logger.info(`Updating current product for ${slug}:`, updates);

      // Use the setter from useState
      setCurrentProduct(prev => {
        // Create a new product object with synchronized fields
        const updated = synchronizeProductFields(prev, updates);

        // Log the final synchronized state for debugging
        logger.debug(`Synchronized current product for ${slug}:`, {
          upvoted: updated.upvoted,
          bookmarked: updated.bookmarked,
          upvoteCount: updated.upvoteCount,
          bookmarkCount: updated.bookmarkCount
        });

        return updated;
      });
    }
  };

  // Toggle upvote
  const toggleUpvote = useCallback(async (slug) => {
    try {
      // Prevent duplicate requests
      const requestKey = `upvote-${slug}`;
      if (activeRequests[requestKey]) {
        return {
          success: false,
          message: "Please wait before trying again",
        };
      }

      // Track this request
      setActiveRequest(requestKey);

      // Use makePriorityRequest instead of direct api call
      const response = await makePriorityRequest('POST', `/products/${slug}/upvote`);

      // Clear the active request
      clearActiveRequest(requestKey);

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to toggle upvote");
      }

      const { data } = response.data;

      // Update product in cache if needed
      // Log the cache update for debugging
      logger.info(`Updating product cache for ${slug}:`, {
        upvoted: data.upvoted,
        upvoteCount: data.upvoteCount
      });

      // Check if productData is available in the response
      if (data.productData) {
        logger.debug(`Product data received in upvote response for ${slug}`);
      }

      // Update the product in cache with all relevant fields
      // Log the update for debugging
      logger.debug(`Updating product cache for ${slug} after upvote:`, {
        upvoted: data.upvoted,
        upvoteCount: data.upvoteCount,
        currentUserInteractions: currentProduct?.userInteractions
      });

      // Create a comprehensive update object that ensures all related fields are updated
      const updateObject = {
        // Top-level properties
        upvoted: data.upvoted,
        upvoteCount: data.upvoteCount,
        // Nested properties
        upvotes: {
          count: data.upvoteCount,
          userHasUpvoted: data.upvoted
        },
        // User interactions
        userInteractions: {
          ...currentProduct?.userInteractions,
          hasUpvoted: data.upvoted
        }
      };

      // Apply the update to the cache
      // The updateProductInCache function will ensure all fields are synchronized
      updateProductInCache(slug, updateObject);

      // Get the current user ID
      const currentUserId = localStorage.getItem('userId') || user?._id;

      // Broadcast the update to all components
      eventBus.publish(EVENT_TYPES.UPVOTE_UPDATED, {
        productId: getIdFromSlug(slug) || data.productId,
        slug: slug,
        count: data.upvoteCount,
        upvoted: data.upvoted,
        action: data.upvoted ? 'add' : 'remove',
        userId: currentUserId,
        timestamp: Date.now()
      });

      // Log the event for debugging
      logger.debug(`Broadcasting upvote event for ${slug}:`, {
        upvoted: data.upvoted,
        count: data.upvoteCount,
        userId: currentUserId,
        action: data.upvoted ? 'add' : 'remove'
      });

      return {
        success: true,
        upvoted: data.upvoted,
        count: data.upvoteCount,
        upvoteCount: data.upvoteCount,
        recommendations: data.recommendations,
        message: response.data.message,
      };
    } catch (err) {
      logger.error(`Error toggling upvote for ${slug}:`, err);
      // Clear the active request on error
      clearActiveRequest(`upvote-${slug}`);
      return {
        success: false,
        message: err.message || "Failed to toggle upvote",
      };
    }
  }, [currentProduct, user]);

  const toggleBookmark = useCallback(async (slug) => {
    try {
      // Prevent duplicate requests
      const requestKey = `bookmark-${slug}`;
      if (activeRequests[requestKey]) {
        return {
          success: false,
          message: "Please wait before trying again",
        };
      }

      // Track this request
      setActiveRequest(requestKey);

      // Use makePriorityRequest instead of direct api call
      const response = await makePriorityRequest('POST', `/products/${slug}/bookmark`);

      // Clear the active request
      clearActiveRequest(requestKey);

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to toggle bookmark");
      }

      const { data } = response.data;

      // Update product in cache if needed
      // Ensure we're using the correct count from the API response
      const bookmarkCount = typeof data.bookmarkCount === 'number' ? data.bookmarkCount :
                           typeof data.count === 'number' ? data.count : 0;

      // Log the bookmark count for debugging
      logger.info(`Bookmark toggle for ${slug}: bookmarked=${data.bookmarked}, count=${bookmarkCount}`);

      // Check if productData is available in the response
      if (data.productData) {
        logger.debug(`Product data received in bookmark response for ${slug}`);
      }

      // Update the product in cache with all relevant fields
      // Log the update for debugging
      logger.debug(`Updating product cache for ${slug} after bookmark:`, {
        bookmarked: data.bookmarked,
        bookmarkCount: bookmarkCount,
        currentUserInteractions: currentProduct?.userInteractions
      });

      // Create a comprehensive update object that ensures all related fields are updated
      const updateObject = {
        // Top-level properties
        bookmarked: data.bookmarked,
        bookmarkCount: bookmarkCount,
        // Nested properties
        bookmarks: {
          count: bookmarkCount,
          userHasBookmarked: data.bookmarked
        },
        // User interactions
        userInteractions: {
          ...currentProduct?.userInteractions,
          hasBookmarked: data.bookmarked
        }
      };

      // Apply the update to the cache
      // The updateProductInCache function will ensure all fields are synchronized
      updateProductInCache(slug, updateObject);

      // Get the current user ID
      const currentUserId = localStorage.getItem('userId') || user?._id;

      // Broadcast the update to all components
      eventBus.publish(EVENT_TYPES.BOOKMARK_UPDATED, {
        productId: getIdFromSlug(slug) || data.productId,
        slug: slug,
        count: bookmarkCount,
        bookmarked: data.bookmarked,
        action: data.bookmarked ? 'add' : 'remove',
        userId: currentUserId,
        timestamp: Date.now()
      });

      // Log the event for debugging
      logger.debug(`Broadcasting bookmark event for ${slug}:`, {
        bookmarked: data.bookmarked,
        count: bookmarkCount,
        userId: currentUserId,
        action: data.bookmarked ? 'add' : 'remove'
      });

      return {
        success: true,
        bookmarked: data.bookmarked,
        count: bookmarkCount,
        bookmarkCount: bookmarkCount,
        message: response.data.message,
      };
    } catch (err) {
      logger.error(`Error toggling bookmark for ${slug}:`, err);
      // Clear the active request on error
      clearActiveRequest(`bookmark-${slug}`);
      return {
        success: false,
        message: err.message || "Failed to toggle bookmark",
      };
    }
  }, [currentProduct, user]);

  // Fetch trending products
  const getTrendingProducts = useCallback(
    async (limit = 10, timeRange = "7d") => {
      setLoading(true);
      try {
        const response = await api.get(`/products/trending`, {
          params: {
            limit,
            timeRange,
          },
        });

        if (!response.data.success)
          throw new Error(
            response.data.message || "Failed to fetch trending products"
          );

        return normalizeProducts(response.data.data);
      } catch (err) {
        setError(err.message);
        logger.error("Error fetching trending products:", err);
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Fetch featured products
  const getFeaturedProducts = useCallback(async (limit = 6) => {
    setLoading(true);
    try {
      const response = await api.get(`/products/featured?limit=${limit}`);
      if (!response.data.success)
        throw new Error(
          response.data.message || "Failed to fetch featured products"
        );
      return normalizeProducts(response.data.data);
    } catch (err) {
      setError(err.message);
      logger.error("Error fetching featured products:", err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Search products
  const searchProducts = useCallback(
    async (query, { page = 1, limit = 20, sort = "relevance" } = {}) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ query, page, limit, sort });
        const response = await api.get(`/products/search?${params}`);
        if (!response.data.success)
          throw new Error(response.data.message || "Search failed");
        return {
          products: normalizeProducts(response.data.data),
          pagination: response.data.pagination,
        };
      } catch (err) {
        setError(err.message);
        logger.error("Error searching products:", err);
        return { products: [], pagination: null };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Fetch products by category
  const getProductsByCategory = useCallback(
    async (categorySlug, { page = 1, limit = 10 } = {}) => {
      setLoading(true);
      try {
        const response = await api.get(
          `/products/category/${categorySlug}?page=${page}&limit=${limit}`
        );
        if (!response.data.success)
          throw new Error(
            response.data.message || "Failed to fetch products by category"
          );
        return {
          products: normalizeProducts(response.data.data),
          category: response.data.category,
          pagination: response.data.pagination,
        };
      } catch (err) {
        setError(err.message);
        logger.error(
          `Error fetching products for category ${categorySlug}:`,
          err
        );
        return { products: [], category: null, pagination: null };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Fetch user's products
  const getUserProducts = useCallback(async (userId, options = {}) => {
    setLoading(true);
    try {
      // Create query parameters for pagination and filtering
      const { page = 1, limit = 10, filter = 'all', bypassCache = false } = options;

      // Create abort controller to handle request cancellation
      const controller = new AbortController();
      const signal = controller.signal;

      // Build query string
      const queryParams = new URLSearchParams();
      queryParams.append('page', page);
      queryParams.append('limit', limit);
      if (filter !== 'all') {
        queryParams.append('status', filter);
      }

      // Add cache busting parameter if needed
      if (bypassCache) {
        queryParams.append('_t', Date.now());
      }

      // Make the request with the abort signal and cache control headers if needed
      const config = { signal };
      if (bypassCache) {
        config.headers = {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'X-Cache-Invalidate': 'true'
        };
      }

      // Make the request with the abort signal
      const response = await api.get(
        `/products/user/${userId}?${queryParams.toString()}`,
        config
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to fetch user products");
      }

      // Return normalized data with pagination and status counts
      return {
        data: normalizeProducts(response.data.data || []),
        user: response.data.user,
        totalCount: response.data.totalCount || response.data.data?.length || 0,
        statusCounts: response.data.statusCounts || {
          published: response.data.data?.filter(p => p.status === 'Published').length || 0,
          draft: response.data.data?.filter(p => p.status === 'Draft').length || 0,
          archived: response.data.data?.filter(p => p.status === 'Archived').length || 0
        },
        currentPage: page,
        totalPages: response.data.totalPages || Math.ceil((response.data.totalCount || response.data.data?.length || 0) / limit),
        controller // Return controller so it can be aborted if needed
      };
    } catch (err) {
      // Don't log canceled errors as they're expected during navigation
      if (err.name !== 'CanceledError' && err.code !== 'ERR_CANCELED') {
        setError(err.message);
        logger.error(`Error fetching products for user ${userId}:`, err);
      }
      return {
        data: [],
        user: null,
        totalCount: 0,
        statusCounts: { published: 0, draft: 0, archived: 0 },
        currentPage: options.page || 1,
        totalPages: 0
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch comments for a product
  const getComments = useCallback(
    async (productSlug, { page = 1, limit = 10, signal } = {}) => {
      if (!productSlug) {
        logger.error("Missing productSlug in getComments call");
        return {
          comments: [],
          pagination: null,
          success: false,
          message: "Product slug is required",
        };
      }

      try {
        // Create request config with the abort signal if provided
        const config = {};
        if (signal) {
          config.signal = signal;
        }

        const response = await api.get(
          `/products/${productSlug}/comments?page=${page}&limit=${limit}`,
          config
        );

        // Check both response.data.success and if data exists
        if (response.data && response.data.success && response.data.data) {
          // Make sure each comment has the replies property as an array
          const commentsWithValidReplies = response.data.data.map(
            (comment) => ({
              ...comment,
              replies: Array.isArray(comment.replies) ? comment.replies : [],
            })
          );

          return {
            comments: commentsWithValidReplies,
            pagination: response.data.pagination || {},
            success: true,
          };
        } else {
          // Still return a valid structure even if there's an error
          logger.error(
            `Error in comments response for product ${productSlug}:`,
            response.data?.message || "Unknown error"
          );
          return {
            comments: [],
            pagination: null,
            success: false,
            message: response.data?.message || "Failed to load comments",
          };
        }
      } catch (err) {
        // Don't log canceled errors as they're expected during navigation or unmounting
        if (err.name !== 'CanceledError' && err.code !== 'ERR_CANCELED') {
          logger.error(
            `Error fetching comments for product ${productSlug}:`,
            err
          );
        }

        // Rethrow canceled errors so they can be handled by the component
        if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
          throw err;
        }

        return {
          comments: [],
          pagination: null,
          success: false,
          message: err.message || "Failed to load comments",
        };
      }
    },
    []
  );

  // Add a comment
  const addComment = useCallback(async (productSlug, content) => {
    if (!productSlug) {
      logger.error("Missing productSlug in addComment call");
      return {
        success: false,
        message: "Product slug is required",
      };
    }

    try {
      const response = await api.post(`/products/${productSlug}/comments`, {
        content,
      });
      if (!response.data.success)
        throw new Error(response.data.message || "Failed to add comment");

      return {
        success: true,
        data: response.data.data,
      };
    } catch (err) {
      logger.error(`Error adding comment to ${productSlug}:`, err);
      return {
        success: false,
        message: err.message || "Failed to add comment",
      };
    }
  }, []);

  // Edit a comment
  const editComment = useCallback(async (productSlug, commentId, content) => {
    if (!productSlug || !commentId) {
      logger.error("Missing required parameters in editComment call");
      return {
        success: false,
        message: "Product slug and comment ID are required",
      };
    }

    try {
      // Use the correct endpoint for comments (not replies)
      const response = await api.put(
        `/products/${productSlug}/comments/${commentId}`,
        { content }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to update comment");
      }

      return {
        success: true,
        data: response.data.data,
      };
    } catch (err) {
      logger.error(`Error updating comment on ${productSlug}:`, err);
      return {
        success: false,
        message: err.message || "Failed to update comment",
      };
    }
  }, []);

  // Delete a comment
  const deleteComment = useCallback(async (productSlug, commentId) => {
    if (!productSlug) {
      logger.error("Missing productSlug in deleteComment call");
      return {
        success: false,
        message: "Product slug is required",
      };
    }

    try {
      const response = await api.delete(
        `/products/${productSlug}/comments/${commentId}`
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to delete comment");
      }

      return {
        success: true,
      };
    } catch (err) {
      logger.error(`Error deleting comment on ${productSlug}:`, err);
      return {
        success: false,
        message: err.message || "Failed to delete comment",
      };
    }
  }, []);

  // Toggle comment like
  const toggleCommentLike = useCallback(
    async (productSlug, commentId, isReply = false, parentId = null) => {
      if (!productSlug) {
        logger.error("Missing productSlug in toggleCommentLike call");
        return {
          success: false,
          message: "Product slug is required",
        };
      }

      try {
        let endpoint;
        if (isReply && parentId) {
          // If this is a reply, use the correct endpoint structure with parent comment ID
          endpoint = `/products/${productSlug}/comments/${parentId}/replies/${commentId}/like`;
        } else {
          // Regular comment like
          endpoint = `/products/${productSlug}/comments/${commentId}/like`;
        }

        const response = await api.post(endpoint);

        if (!response.data.success) {
          throw new Error(response.data.message || "Failed to toggle like");
        }

        return {
          success: true,
          data: response.data.data,
        };
      } catch (err) {
        logger.error(
          `Error toggling ${
            isReply ? "reply" : "comment"
          } like for ${productSlug}:`,
          err
        );
        return {
          success: false,
          message: err.message || "Failed to toggle like",
        };
      }
    },
    []
  );

  // Add reply to comment
  const addReply = useCallback(
    async (productSlug, parentCommentId, content, options = {}) => {
      if (!productSlug) {
        logger.error("Missing productSlug in addReply call");
        return {
          success: false,
          message: "Product slug is required",
        };
      }

      if (!parentCommentId) {
        logger.error("Missing parentCommentId in addReply call");
        return {
          success: false,
          message: "Parent comment ID is required",
        };
      }

      if (
        !content ||
        typeof content !== "string" ||
        content.trim().length < 2
      ) {
        logger.error("Invalid content in addReply call");
        return {
          success: false,
          message: "Content must be a string with at least 2 characters",
        };
      }

      try {
        // Construct payload with replyToId only if provided and valid
        const payload = { content: content.trim() };
        if (
          options.replyToId &&
          mongoose.Types.ObjectId.isValid(options.replyToId)
        ) {
          payload.replyToId = options.replyToId;
        } else if (options.replyToId) {
          logger.warn(`Invalid replyToId provided: ${options.replyToId}`);
        }

        const response = await api.post(
          `/products/${productSlug}/comments/${parentCommentId}/reply`,
          payload
        );

        if (!response.data.success) {
          throw new Error(response.data.message || "Failed to add reply");
        }

        return {
          success: true,
          data: response.data.data,
        };
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || err.message || "Failed to add reply";
        logger.error(
          `Error adding reply for ${productSlug}/${parentCommentId}: ${errorMessage}`,
          err
        );
        return {
          success: false,
          message: errorMessage,
        };
      }
    },
    []
  );

  // Edit reply
  const editReply = useCallback(async (productSlug, parentId, replyId, content) => {
    if (!productSlug || !parentId || !replyId) {
      logger.error("Missing required parameters in editReply call");
      return {
        success: false,
        message: "Product slug, parent ID, and reply ID are required",
      };
    }

    try {
      const response = await api.put(
        `/products/${productSlug}/comments/${parentId}/replies/${replyId}`,
        { content }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to update reply");
      }

      return {
        success: true,
        data: response.data.data,
      };
    } catch (err) {
      logger.error(`Error updating reply for ${productSlug}:`, err);
      return {
        success: false,
        message: err.message || "Failed to update reply",
      };
    }
  }, []);

  // Delete reply
  const deleteReply = useCallback(async (productSlug, commentId, replyId) => {
    if (!productSlug) {
      logger.error("Missing productSlug in deleteReply call");
      return {
        success: false,
        message: "Product slug is required",
      };
    }

    try {
      const response = await api.delete(
        `/products/${productSlug}/comments/${commentId}/replies/${replyId}`
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to delete reply");
      }

      return {
        success: true,
      };
    } catch (err) {
      logger.error(`Error deleting reply for ${productSlug}:`, err);
      return {
        success: false,
        message: err.message || "Failed to delete reply",
      };
    }
  }, []);

  // Upload gallery images for a product
  const uploadGalleryImages = useCallback(async (slug, images) => {
    if (!slug || !images || images.length === 0) {
      logger.error("Missing required parameters for gallery upload");
      return { success: false, message: "Missing required parameters" };
    }

    setLoading(true);
    try {
      // Create FormData for the gallery images
      const formData = new FormData();

      // Process images in batches to avoid memory issues
      const BATCH_SIZE = 3;
      let processedCount = 0;

      // Process and optimize images before upload
      for (let i = 0; i < images.length; i += BATCH_SIZE) {
        const batch = images.slice(i, i + BATCH_SIZE);

        // Optimize each image in the batch
        for (const file of batch) {
          try {
            // Only process if it's a File object
            if (file instanceof File) {
              const optimizedImage = await optimizeImage(file, {
                maxWidth: 1200,
                quality: 0.8,
                format: 'webp'
              });

              // Use the optimized image or fall back to original
              formData.append('images', optimizedImage || file);
              processedCount++;
            }
          } catch (err) {
            logger.error(`Error optimizing gallery image: ${err.message}`);
            // If optimization fails, use the original file
            formData.append('images', file);
            processedCount++;
          }
        }
      }

      logger.info(`Uploading ${processedCount} gallery images for product ${slug}`);

      // Make the API request
      const response = await api.post(`/products/${slug}/gallery`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to upload gallery images");
      }

      // Update the current product if this is the active product
      if (currentProduct && currentProduct.slug === slug) {
        setCurrentProduct(prev => ({
          ...prev,
          gallery: response.data.data
        }));
      }

      // Update the product in cache
      updateProductInCache(slug, { gallery: response.data.data });

      // Broadcast gallery updated event
      eventBus.publish(EVENT_TYPES.PRODUCT_UPDATED, {
        slug,
        productId: getIdFromSlug(slug),
        galleryUpdated: true,
        timestamp: Date.now()
      });

      return {
        success: true,
        data: response.data.data,
        message: response.data.message || "Gallery images uploaded successfully"
      };
    } catch (err) {
      logger.error(`Error uploading gallery images for ${slug}:`, err);
      setError(err.message);
      return {
        success: false,
        message: err.message || "Failed to upload gallery images"
      };
    } finally {
      setLoading(false);
    }
  }, [currentProduct]);

  // Remove a gallery image
  const removeGalleryImage = useCallback(async (slug, imageId) => {
    if (!slug || !imageId) {
      logger.error("Missing required parameters for gallery image removal");
      return { success: false, message: "Missing required parameters" };
    }

    setLoading(true);
    try {
      const response = await api.delete(`/products/${slug}/gallery/${imageId}`);

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to remove gallery image");
      }

      // Update the current product if this is the active product
      if (currentProduct && currentProduct.slug === slug) {
        setCurrentProduct(prev => ({
          ...prev,
          gallery: response.data.data
        }));
      }

      // Update the product in cache
      updateProductInCache(slug, { gallery: response.data.data });

      // Broadcast gallery updated event
      eventBus.publish(EVENT_TYPES.PRODUCT_UPDATED, {
        slug,
        productId: getIdFromSlug(slug),
        galleryUpdated: true,
        timestamp: Date.now()
      });

      return {
        success: true,
        data: response.data.data,
        message: response.data.message || "Gallery image removed successfully"
      };
    } catch (err) {
      logger.error(`Error removing gallery image for ${slug}:`, err);
      setError(err.message);
      return {
        success: false,
        message: err.message || "Failed to remove gallery image"
      };
    } finally {
      setLoading(false);
    }
  }, [currentProduct]);

  // Reorder gallery images
  const reorderGalleryImages = useCallback(async (slug, imageIds) => {
    if (!slug || !imageIds || !Array.isArray(imageIds) || imageIds.length === 0) {
      logger.error("Missing required parameters for gallery reordering");
      return { success: false, message: "Missing required parameters" };
    }

    setLoading(true);
    try {
      const response = await api.put(`/products/${slug}/gallery/reorder`, { imageIds });

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to reorder gallery images");
      }

      // Update the current product if this is the active product
      if (currentProduct && currentProduct.slug === slug) {
        setCurrentProduct(prev => ({
          ...prev,
          gallery: response.data.data
        }));
      }

      // Update the product in cache
      updateProductInCache(slug, { gallery: response.data.data });

      // Broadcast gallery updated event
      eventBus.publish(EVENT_TYPES.PRODUCT_UPDATED, {
        slug,
        productId: getIdFromSlug(slug),
        galleryUpdated: true,
        timestamp: Date.now()
      });

      return {
        success: true,
        data: response.data.data,
        message: response.data.message || "Gallery order updated successfully"
      };
    } catch (err) {
      logger.error(`Error reordering gallery images for ${slug}:`, err);
      setError(err.message);
      return {
        success: false,
        message: err.message || "Failed to reorder gallery images"
      };
    } finally {
      setLoading(false);
    }
  }, [currentProduct]);

  const value = {
    loading,
    error,
    clearError,
    currentProduct,
    setCurrentProduct,
    productCache, // Expose the global product cache
    getProductBySlug,
    getAllProducts,
    validateProductUrl,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleUpvote,
    toggleBookmark,
    getTrendingProducts,
    getFeaturedProducts,
    searchProducts,
    getProductsByCategory,
    getUserProducts,
    getComments,
    addComment,
    editComment,
    deleteComment,
    toggleCommentLike,
    addReply,
    editReply,
    deleteReply,
    updateProductInCache, // Expose this function for socket updates
    // Gallery management functions
    uploadGalleryImages,
    removeGalleryImage,
    reorderGalleryImages,
  };

  return (
    <ProductContext.Provider value={value}>{children}</ProductContext.Provider>
  );
};

export const useProduct = () => {
  const context = useContext(ProductContext);
  if (!context)
    throw new Error("useProduct must be used within a ProductProvider");
  return context;
};

export default ProductContext;
