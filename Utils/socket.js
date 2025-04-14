/**
 * Socket.js - Socket.io client implementation
 * Optimized version with reduced logging and improved performance
 */
import { io } from 'socket.io-client';
import { getAccessToken } from './api';

let socket;

// Track subscriptions to prevent duplicates
const productSubscriptions = new Set();

/**
 * Initialize socket connection
 * @returns {Object|null} - Socket instance or null if initialization failed
 */
export const initializeSocket = () => {
  const token = getAccessToken();

  if (!token) {
    // Only log warning in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('Cannot initialize socket: No authentication token');
    }
    return null;
  }

  // Disconnect existing socket if any
  if (socket) {
    socket.disconnect();
  }

  // Use the correct environment variable for Next.js
  const socketUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5004';
  // Remove /api/v1 from the URL if it exists
  const baseUrl = socketUrl.replace(/\/api\/v1$/, '');

  // Clear subscriptions when creating a new socket
  productSubscriptions.clear();

  // Initialize socket connection
  socket = io(baseUrl, {
    auth: { token },
    withCredentials: true,
    transports: ['websocket', 'polling']
  });

  // Set up basic event handlers
  socket.on('connect_error', (error) => {
    if (process.env.NODE_ENV === 'development') {
      console.error('Socket connection error:', error?.message || 'Unknown error');
    }
  });

  socket.on('error', (error) => {
    if (process.env.NODE_ENV === 'development') {
      console.error('Socket error:', error?.message || 'Unknown error');
    }
  });

  // Make socket available globally only in development mode
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    window.socket = socket;
  }

  return socket;
};

/**
 * Get the current socket instance
 * @returns {Object|undefined} - Socket instance or undefined if not initialized
 */
export const getSocket = () => socket;

/**
 * Subscribe to product updates
 * @param {string} productId - Product ID to subscribe to
 * @returns {boolean} - Whether the subscription was successful
 */
export const subscribeToProduct = (productId) => {
  if (!socket) return false;

  // Skip if already subscribed
  if (productSubscriptions.has(productId)) {
    return true;
  }

  socket.emit('subscribe:product', productId);
  productSubscriptions.add(productId);
  return true;
};

/**
 * Unsubscribe from product updates
 * @param {string} productId - Product ID to unsubscribe from
 * @returns {boolean} - Whether the unsubscription was successful
 */
export const unsubscribeFromProduct = (productId) => {
  if (!socket) return false;

  socket.emit('unsubscribe:product', productId);
  productSubscriptions.delete(productId);
  return true;
};

/**
 * Get the socket connection status
 * @returns {Object} - Socket connection status
 */
export const getSocketStatus = () => {
  if (!socket) {
    return { connected: false, id: null };
  }

  return {
    connected: socket.connected,
    id: socket.id,
    transport: socket.io?.engine?.transport?.name || 'unknown'
  };
};

/**
 * Force a reconnection to the socket server
 * @returns {boolean} - Whether the reconnection was initiated
 */
export const forceReconnect = () => {
  if (!socket) {
    return false;
  }

  // Clear subscriptions on reconnect
  productSubscriptions.clear();

  socket.disconnect();
  socket.connect();
  return true;
};