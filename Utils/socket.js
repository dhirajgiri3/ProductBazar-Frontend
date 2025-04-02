// In your frontend socket.js file
import { io } from 'socket.io-client';
import { getAccessToken } from './api';

let socket;

export const initializeSocket = () => {
  const token = getAccessToken();
  
  if (!token) {
    console.warn('Cannot initialize socket: No authentication token');
    return null;
  }
  
  if (socket) {
    socket.disconnect();
  }
  
  socket = io(process.env.REACT_APP_API_URL, {
    auth: { token },
    withCredentials: true,
    transports: ['websocket', 'polling']
  });
  
  socket.on('connect', () => {
    console.log('Connected to socket server');
  });
  
  socket.on('disconnect', () => {
    console.log('Disconnected from socket server');
  });
  
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
  
  // Setup notification handler
  socket.on('notification', (notification) => {
    // You can dispatch to your state management (Redux, Context, etc.)
    console.log('New notification:', notification);
  });
  
  return socket;
};

export const getSocket = () => socket;

export const subscribeToProduct = (productId) => {
  if (socket) {
    socket.emit('subscribe:product', productId);
  }
};

export const unsubscribeFromProduct = (productId) => {
  if (socket) {
    socket.emit('unsubscribe:product', productId);
  }
};