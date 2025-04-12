// file: frontend/Contexts/Product/ProductContext.js

"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import api from "../../Utils/api";
import logger from "../../Utils/logger";
import { useRouter } from "next/navigation";
import { normalizeProducts } from "../../Utils/Product/productUtils";
import mongoose from "mongoose";

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Clear error state
  const clearError = () => setError(null);

  // Fetch product by slug
  const getProductBySlug = useCallback(async (slug) => {
    if (!slug) return null;
    setLoading(true);
    try {
      const response = await api.get(`/products/${slug}`);
      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to fetch product");
      }
      const productData = response.data.data;
      return {
        ...productData,
        upvotes: {
          count: productData.upvotes?.count || 0,
          userHasUpvoted: response.data.userInteractions?.hasUpvoted || false,
        },
        bookmarks: {
          userHasBookmarked:
            response.data.userInteractions?.hasBookmarked || false,
        },
      };
    } catch (err) {
      setError(err.message);
      logger.error(`Error fetching product ${slug}:`, err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

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

  // Create a new product with thumbnail
  const createProduct = async (productData) => {
    setLoading(true);
    try {
      // Create FormData for the product data and thumbnail
      const formData = new FormData();

      // Handle regular fields
      Object.entries(productData).forEach(([key, value]) => {
        if (value && key !== "thumbnail") {
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

        const response = await api.put(`/products/${slug}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (!response.data.success)
          throw new Error(response.data.message || "Failed to update product");

        return response.data;
      } catch (err) {
        setError(err.message);
        logger.error("Error updating product:", err);
        return { success: false, message: err.message };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Delete a product
  const deleteProduct = useCallback(
    async (slug) => {
      setLoading(true);
      try {
        const response = await api.post(`/products/${slug}`, {
          _method: 'DELETE', // Some APIs use this pattern for DELETE with payload
          timestamp: Date.now() // Add timestamp to prevent caching
        }, {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'X-Cache-Invalidate': 'true' // Custom header for cache invalidation
          }
        });

        if (!response.data.success)
          throw new Error(response.data.message || "Failed to delete product");

        // Clear local product data from any in-memory caches
        clearProductFromLocalCache(slug);

        router.push("/products");
        return true;
      } catch (err) {
        setError(err.message);
        logger.error("Error deleting product:", err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

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

  // Toggle upvote
  const toggleUpvote = useCallback(async (slug) => {
    try {
      const response = await api.post(`/products/${slug}/upvote`);
      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to toggle upvote");
      }
      const { data } = response.data;
      return {
        success: true,
        upvoted: data.upvoted,
        count: data.upvoteCount,
        recommendations: data.recommendations,
        message: response.data.message,
      };
    } catch (err) {
      logger.error(`Error toggling upvote for ${slug}:`, err);
      return {
        success: false,
        message: err.message || "Failed to toggle upvote",
      };
    }
  }, []);

  const toggleBookmark = useCallback(async (slug) => {
    try {
      const response = await api.post(`/products/${slug}/bookmark`);
      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to toggle bookmark");
      }
      return {
        success: true,
        bookmarked: response.data.data.bookmarked,
        message: response.data.message,
      };
    } catch (err) {
      logger.error(`Error toggling bookmark for ${slug}:`, err);
      return {
        success: false,
        message: err.message || "Failed to toggle bookmark",
      };
    }
  }, []);

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
  const getUserProducts = useCallback(async (userId) => {
    setLoading(true);
    try {
      const response = await api.get(`/products/user/${userId}`);
      if (!response.data.success)
        throw new Error(
          response.data.message || "Failed to fetch user products"
        );
      return {
        products: normalizeProducts(response.data.data),
        user: response.data.user,
        meta: response.data.meta,
      };
    } catch (err) {
      setError(err.message);
      logger.error(`Error fetching products for user ${userId}:`, err);
      return { products: [], user: null, meta: null };
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch comments for a product
  const getComments = useCallback(
    async (productSlug, { page = 1, limit = 10 } = {}) => {
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
        const response = await api.get(
          `/products/${productSlug}/comments?page=${page}&limit=${limit}`
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
        logger.error(
          `Error fetching comments for product ${productSlug}:`,
          err
        );
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

  const value = {
    loading,
    error,
    clearError,
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
