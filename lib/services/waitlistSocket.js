'use client';

import React from 'react';
import { io } from 'socket.io-client';
import { getAuthToken } from '@/lib/utils/auth/auth-utils.js';
import { toast } from 'react-hot-toast';

class WaitlistSocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
  }

  // Initialize socket connection
  connect(userToken = null) {
    if (this.socket?.connected) {
      return this.socket;
    }

    try {
      const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
      
      this.socket = io(socketUrl, {
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true,
        auth: {
          token: userToken || getAuthToken()
        },
        query: {
          type: 'waitlist'
        }
      });

      this.setupEventHandlers();
      return this.socket;
    } catch (error) {
      console.error('Socket connection failed:', error);
      this.handleConnectionError(error);
      return null;
    }
  }

  // Setup core event handlers
  setupEventHandlers() {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('📡 Waitlist socket connected');
      this.connected = true;
      this.reconnectAttempts = 0;
      this.emit('connected');
      
      // Join waitlist room for updates
      this.joinWaitlistRoom();
    });

    this.socket.on('disconnect', (reason) => {
      console.log('📡 Waitlist socket disconnected:', reason);
      this.connected = false;
      this.emit('disconnected', reason);
      
      if (reason === 'io server disconnect') {
        // Server-side disconnect, try to reconnect
        this.handleReconnection();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('📡 Socket connection error:', error);
      this.handleConnectionError(error);
    });

    // Waitlist-specific events
    this.socket.on('position-updated', (data) => {
      this.handlePositionUpdate(data);
    });

    this.socket.on('status-changed', (data) => {
      this.handleStatusChange(data);
    });

    this.socket.on('referral-success', (data) => {
      this.handleReferralSuccess(data);
    });

    this.socket.on('queue-movement', (data) => {
      this.handleQueueMovement(data);
    });

    this.socket.on('invitation-sent', (data) => {
      this.handleInvitationSent(data);
    });

    this.socket.on('bulk-update', (data) => {
      this.handleBulkUpdate(data);
    });

    // Admin events
    this.socket.on('admin-action', (data) => {
      this.handleAdminAction(data);
    });

    // System events
    this.socket.on('waitlist-enabled', (data) => {
      this.handleWaitlistToggle(data, true);
    });

    this.socket.on('waitlist-disabled', (data) => {
      this.handleWaitlistToggle(data, false);
    });
  }

  // Join waitlist room for real-time updates
  joinWaitlistRoom() {
    if (!this.socket?.connected) return;

    const userEmail = localStorage.getItem('waitlist-email');
    if (userEmail) {
      this.socket.emit('join-waitlist', { email: userEmail });
    }
  }

  // Handle position updates
  handlePositionUpdate(data) {
    console.log('📊 Position update received:', data);
    
    this.emit('positionUpdated', data);
    
    // Show notification if significant change
    if (data.positionChange && Math.abs(data.positionChange) >= 5) {
      const direction = data.positionChange > 0 ? 'up' : 'down';
      const message = `You moved ${Math.abs(data.positionChange)} positions ${direction}!`;
      
      if (direction === 'up') {
        toast.success(message, {
          duration: 4000,
          icon: '🚀'
        });
      } else {
        toast(message, {
          duration: 3000,
          icon: '📉'
        });
      }
    }
  }

  // Handle status changes
  handleStatusChange(data) {
    console.log('🔄 Status change received:', data);
    
    this.emit('statusChanged', data);
    
    // Show appropriate notification
    switch (data.newStatus) {
      case 'invited':
        toast.success('🎉 You\'ve been invited! Check your email for access link.', {
          duration: 8000
        });
        break;
      case 'onboarded':
        toast.success('✅ Welcome to Product Bazar! You now have full access.', {
          duration: 6000
        });
        break;
      case 'rejected':
        toast.error('❌ Your application was not approved at this time.', {
          duration: 5000
        });
        break;
    }
  }

  // Handle successful referrals
  handleReferralSuccess(data) {
    console.log('🎯 Referral success:', data);
    
    this.emit('referralSuccess', data);
    
    toast.success(`🎉 Referral successful! You moved up ${data.positionsGained} positions.`, {
      duration: 5000
    });
  }

  // Handle queue movement notifications
  handleQueueMovement(data) {
    console.log('🚶 Queue movement:', data);
    
    this.emit('queueMovement', data);
    
    // Only show notification for significant movements
    if (data.peopleAhead !== undefined) {
      this.emit('queueStatsUpdated', {
        peopleAhead: data.peopleAhead,
        totalWaiting: data.totalWaiting
      });
    }
  }

  // Handle invitation sent
  handleInvitationSent(data) {
    console.log('📧 Invitation sent:', data);
    
    this.emit('invitationSent', data);
    
    toast.success('📧 Invitation sent! Check your email for access.', {
      duration: 6000
    });
  }

  // Handle bulk updates from admin
  handleBulkUpdate(data) {
    console.log('📦 Bulk update received:', data);
    
    this.emit('bulkUpdate', data);
    
    if (data.affectedUsers && data.affectedUsers > 1) {
      toast.info(`📦 ${data.affectedUsers} users were updated by admin.`, {
        duration: 4000
      });
    }
  }

  // Handle admin actions
  handleAdminAction(data) {
    console.log('👨‍💼 Admin action:', data);
    
    this.emit('adminAction', data);
    
    // Show notification for admin users
    if (data.type === 'settings-changed') {
      toast.info('⚙️ System settings have been updated.', {
        duration: 3000
      });
    }
  }

  // Handle waitlist toggle
  handleWaitlistToggle(data, enabled) {
    console.log('🔧 Waitlist toggled:', enabled);
    
    this.emit('waitlistToggled', { enabled, data });
    
    const message = enabled 
      ? '🔒 Waitlist mode has been enabled.'
      : '🔓 Waitlist mode has been disabled. Platform is now open!';
    
    toast.info(message, {
      duration: 6000
    });
  }

  // Handle connection errors
  handleConnectionError(error) {
    this.emit('connectionError', error);
    
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.handleReconnection();
    } else {
      toast.error('Unable to connect to real-time updates. Some features may be limited.', {
        duration: 5000
      });
    }
  }

  // Handle reconnection logic
  handleReconnection() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`📡 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms`);
    
    setTimeout(() => {
      if (!this.connected) {
        this.socket?.connect();
      }
    }, delay);
  }

  // Subscribe to specific events
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    
    return () => this.off(event, callback);
  }

  // Unsubscribe from events
  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  // Emit events to listeners
  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in socket event listener for ${event}:`, error);
        }
      });
    }
  }

  // Request current position
  requestPositionUpdate(email) {
    if (this.socket?.connected) {
      this.socket.emit('get-position', { email });
    }
  }

  // Request queue statistics
  requestQueueStats() {
    if (this.socket?.connected) {
      this.socket.emit('get-queue-stats');
    }
  }

  // Admin: broadcast message to all waitlist users
  adminBroadcast(message, type = 'info') {
    if (this.socket?.connected) {
      this.socket.emit('admin-broadcast', { message, type });
    }
  }

  // Admin: request real-time analytics
  requestAnalytics() {
    if (this.socket?.connected) {
      this.socket.emit('get-analytics');
    }
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      this.listeners.clear();
    }
  }

  // Get connection status
  isConnected() {
    return this.connected && this.socket?.connected;
  }

  // Get socket instance
  getSocket() {
    return this.socket;
  }
}

// Create singleton instance
const waitlistSocket = new WaitlistSocketService();

export default waitlistSocket;

// React hook for easy socket usage
export const useWaitlistSocket = () => {
  const [connected, setConnected] = React.useState(waitlistSocket.isConnected());
  
  React.useEffect(() => {
    const handleConnect = () => setConnected(true);
    const handleDisconnect = () => setConnected(false);
    
    const unsubConnect = waitlistSocket.on('connected', handleConnect);
    const unsubDisconnect = waitlistSocket.on('disconnected', handleDisconnect);
    
    // Connect if not already connected
    if (!waitlistSocket.isConnected()) {
      waitlistSocket.connect();
    }
    
    return () => {
      unsubConnect();
      unsubDisconnect();
    };
  }, []);
  
  return {
    socket: waitlistSocket,
    connected,
    requestPositionUpdate: waitlistSocket.requestPositionUpdate.bind(waitlistSocket),
    requestQueueStats: waitlistSocket.requestQueueStats.bind(waitlistSocket),
    on: waitlistSocket.on.bind(waitlistSocket),
    off: waitlistSocket.off.bind(waitlistSocket)
  };
}; 