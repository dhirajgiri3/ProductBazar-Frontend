"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { initializeSocket, getSocket, subscribeToProduct, unsubscribeFromProduct } from "../../Utils/socket";
import { useAuth } from "../Auth/AuthContext";
import { useProduct } from "../Product/ProductContext";
import logger from "../../Utils/logger";
import { getSlugFromId, hasProductId } from "../../Utils/productMappingUtils";
import eventBus, { EVENT_TYPES } from "../../Utils/eventBus";

// Create context
const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { updateProductInCache } = useProduct();
  const [isConnected, setIsConnected] = useState(false);
  const [socketId, setSocketId] = useState(null);
  const subscribedProducts = useRef(new Set());
  const socket = useRef(null);
  const updateTimestamps = useRef({});  // Track last update times to prevent duplicate updates

  // Initialize socket connection
  useEffect(() => {
    if (isAuthenticated) {
      // Initialize socket connection
      socket.current = initializeSocket();

      if (socket.current) {
        // Set up connection event handlers
        socket.current.on('connect', () => {
          setIsConnected(true);
          setSocketId(socket.current.id);
          logger.debug(`Socket connected with ID: ${socket.current.id}`);

          // Broadcast socket connection event
          eventBus.publish(EVENT_TYPES.SOCKET_CONNECTED, { socketId: socket.current.id });

          // Resubscribe to all products after reconnection
          if (subscribedProducts.current.size > 0) {
            logger.debug(`Resubscribing to ${subscribedProducts.current.size} products`);
            subscribedProducts.current.forEach(productId => {
              subscribeToProduct(productId);
            });
          }
        });

        socket.current.on('disconnect', () => {
          setIsConnected(false);
          setSocketId(null);
          logger.debug('Socket disconnected');

          // Broadcast socket disconnection event
          eventBus.publish(EVENT_TYPES.SOCKET_DISCONNECTED, { timestamp: Date.now() });
        });

        // Set up product event handlers
        setupProductEventHandlers();
      }
    } else {
      // Disconnect socket if user is not authenticated
      if (socket.current) {
        socket.current.disconnect();
        socket.current = null;
        setIsConnected(false);
        setSocketId(null);
      }
    }

    // Cleanup on unmount
    return () => {
      if (socket.current) {
        socket.current.disconnect();
        socket.current = null;
      }
    };
  }, [isAuthenticated]);

  // Set up product event handlers
  const setupProductEventHandlers = useCallback(() => {
    if (!socket.current) return;

    // Handle upvote events
    socket.current.on('product:upvote', (data) => {
      logger.debug(`Received upvote event for product ${data.productId}`, data);

      // Update product in cache
      if (data.productId && data.count !== undefined) {
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
          } catch (e) {
            logger.error('Error getting current user ID:', e);
          }
        }

        // Check if the event includes user information
        const isCurrentUserAction = data.userId === currentUserId;

        // Find product by ID in cache and update it
        updateProductBySocketEvent(data.productId, {
          upvoteCount: data.count,
          upvotes: {
            count: data.count,
            // Only update userHasUpvoted if this is the current user's action
            ...(isCurrentUserAction && { userHasUpvoted: data.action === 'add' })
          },
          // Also update top-level upvoted property if this is the current user's action
          ...(isCurrentUserAction && { upvoted: data.action === 'add' }),
          // Update userInteractions if this is the current user's action
          ...(isCurrentUserAction && {
            userInteractions: {
              hasUpvoted: data.action === 'add'
            }
          })
        });

        // Broadcast upvote update event to all components
        const slug = getSlugFromId(data.productId);
        eventBus.publish(EVENT_TYPES.UPVOTE_UPDATED, {
          productId: data.productId,
          slug: slug,
          count: data.count,
          // Include user interaction state in the event
          ...(isCurrentUserAction && { upvoted: data.action === 'add' }),
          userId: data.userId,
          action: data.action,
          timestamp: Date.now()
        });
      }
    });

    // Handle bookmark events
    socket.current.on('product:bookmark', (data) => {
      logger.debug(`Received bookmark event for product ${data.productId}`, data);

      // Update product in cache
      if (data.productId && data.count !== undefined) {
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
          } catch (e) {
            logger.error('Error getting current user ID:', e);
          }
        }

        // Check if the event includes user information
        const isCurrentUserAction = data.userId === currentUserId;

        // Find product by ID in cache and update it
        updateProductBySocketEvent(data.productId, {
          bookmarkCount: data.count,
          bookmarks: {
            count: data.count,
            // Only update userHasBookmarked if this is the current user's action
            ...(isCurrentUserAction && { userHasBookmarked: data.action === 'add' })
          },
          // Also update top-level bookmarked property if this is the current user's action
          ...(isCurrentUserAction && { bookmarked: data.action === 'add' }),
          // Update userInteractions if this is the current user's action
          ...(isCurrentUserAction && {
            userInteractions: {
              hasBookmarked: data.action === 'add'
            }
          })
        });

        // Broadcast bookmark update event to all components
        const slug = getSlugFromId(data.productId);
        eventBus.publish(EVENT_TYPES.BOOKMARK_UPDATED, {
          productId: data.productId,
          slug: slug,
          count: data.count,
          // Include user interaction state in the event
          ...(isCurrentUserAction && { bookmarked: data.action === 'add' }),
          userId: data.userId,
          action: data.action,
          timestamp: Date.now()
        });
      }
    });
  }, []);

  // Update product in cache based on socket event - with debouncing
  const updateProductBySocketEvent = useCallback((productId, updates) => {
    // Create a unique key for this update to prevent duplicate updates
    const updateKey = `${productId}_${JSON.stringify(updates)}`;

    // Check if we've processed this exact update recently
    const lastUpdateTime = updateTimestamps.current[updateKey] || 0;
    const now = Date.now();

    // If we've processed this exact update in the last 500ms, skip it
    if (now - lastUpdateTime < 500) {
      logger.debug(`Skipping duplicate socket update for product ${productId} (processed ${now - lastUpdateTime}ms ago)`);
      return;
    }

    // Record this update timestamp
    updateTimestamps.current[updateKey] = now;

    // Clean up old timestamps periodically
    setTimeout(() => {
      delete updateTimestamps.current[updateKey];
    }, 5000);

    // Log the update with more details
    logger.info(`Updating product ${productId} with socket data:`, {
      ...updates,
      upvoted: updates.upvoted,
      bookmarked: updates.bookmarked,
      userHasUpvoted: updates.upvotes?.userHasUpvoted,
      userHasBookmarked: updates.bookmarks?.userHasBookmarked,
      hasUpvoted: updates.userInteractions?.hasUpvoted,
      hasBookmarked: updates.userInteractions?.hasBookmarked
    });

    // Use the ProductContext to update the product in cache
    if (updateProductInCache) {
      // Check if we have this product ID in our mapping
      if (hasProductId(productId)) {
        // Get the slug from the ID
        const slug = getSlugFromId(productId);
        if (slug) {
          // Update the product in cache using the slug
          logger.debug(`Using slug ${slug} to update product ${productId}`);
          updateProductInCache(slug, updates);
        } else {
          // Fallback to using the ID directly
          logger.debug(`No slug found for ${productId}, using ID directly`);
          updateProductInCache(productId, updates);
        }
      } else {
        // If we don't have the ID in our mapping, try to update by ID directly
        logger.debug(`Product ID ${productId} not in mapping, using ID directly`);
        updateProductInCache(productId, updates);
      }
    } else {
      logger.warn(`Cannot update product ${productId}: updateProductInCache is not available`);
    }
  }, [updateProductInCache]);

  // Subscribe to product updates with deduplication
  const subscribeToProductUpdates = useCallback((productId) => {
    if (!productId || !isConnected) return;

    // Check if already subscribed to avoid duplicate subscriptions
    if (subscribedProducts.current.has(productId)) {
      logger.debug(`Already subscribed to product ${productId}, skipping duplicate subscription`);

      // Still return an unsubscribe function for consistency
      return () => {
        // Only actually unsubscribe if this is the last subscriber
        // This prevents premature unsubscription when multiple components
        // are interested in the same product
        if (subscribedProducts.current.has(productId)) {
          unsubscribeFromProduct(productId);
          subscribedProducts.current.delete(productId);
          logger.info(`Unsubscribed from updates for product ${productId}`);
        }
      };
    }

    // Add to our tracking set
    subscribedProducts.current.add(productId);

    // Subscribe to product updates
    subscribeToProduct(productId);

    logger.info(`Subscribed to updates for product ${productId}`);

    // Return unsubscribe function
    return () => {
      unsubscribeFromProduct(productId);
      subscribedProducts.current.delete(productId);
      logger.info(`Unsubscribed from updates for product ${productId}`);
    };
  }, [isConnected]);

  // Context value
  const value = {
    isConnected,
    socketId,
    subscribeToProductUpdates,
    socket: socket.current,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

// Custom hook to use the socket context
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export default SocketContext;
