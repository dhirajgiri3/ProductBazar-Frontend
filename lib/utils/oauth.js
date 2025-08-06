/**
 * OAuth Handler Utility
 * 
 * Manages OAuth authentication flow including:
 * - URL parameter handling
 * - State management
 * - Error handling
 * - Callback processing
 */

export class OAuthHandler {
  constructor() {
    this.isClient = typeof window !== 'undefined';
  }

  /**
   * Check if this is an OAuth callback
   */
  isOAuthCallback() {
    if (!this.isClient) return false;
    
    const urlParams = new URLSearchParams(window.location.search);
    const hasOAuthParams = urlParams.has('oauth_success') || urlParams.has('success') || urlParams.has('token');
    const hasError = urlParams.has('error');
    
    return hasOAuthParams || hasError;
  }

  /**
   * Get OAuth callback parameters
   */
  getCallbackParams() {
    if (!this.isClient) return null;
    
    const urlParams = new URLSearchParams(window.location.search);
    return {
      success: urlParams.get('oauth_success') === 'true' || urlParams.get('success') === 'true',
      error: urlParams.get('error'),
      token: urlParams.get('token'),
      provider: urlParams.get('provider'),
      type: urlParams.get('type'), // 'login' or 'register'
      refresh_token: urlParams.get('refresh_token'),
      new_user: urlParams.get('new_user'),
      message: urlParams.get('message')
    };
  }

  /**
   * Clear OAuth parameters from URL
   */
  clearOAuthParams() {
    if (!this.isClient) return;
    
    const url = new URL(window.location);
    url.searchParams.delete('oauth_success');
    url.searchParams.delete('success');
    url.searchParams.delete('error');
    url.searchParams.delete('token');
    url.searchParams.delete('provider');
    url.searchParams.delete('type');
    url.searchParams.delete('refresh_token');
    url.searchParams.delete('new_user');
    url.searchParams.delete('message');
    
    window.history.replaceState({}, '', url.pathname + url.search);
  }

  /**
   * Store OAuth state in localStorage
   */
  storeOAuthState(provider, type, redirectUrl) {
    if (!this.isClient) return;
    
    const state = {
      provider,
      type,
      redirectUrl,
      timestamp: Date.now(),
      initiated: true
    };
    
    localStorage.setItem('oauth_state', JSON.stringify(state));
  }

  /**
   * Get stored OAuth state
   */
  getOAuthState() {
    if (!this.isClient) return null;
    
    try {
      const state = localStorage.getItem('oauth_state');
      return state ? JSON.parse(state) : null;
    } catch (error) {
      console.error('Error parsing OAuth state:', error);
      return null;
    }
  }

  /**
   * Clear OAuth state
   */
  clearOAuthState() {
    if (!this.isClient) return;
    
    localStorage.removeItem('oauth_state');
    localStorage.removeItem('google_auth_type');
    localStorage.removeItem('google_auth_initiated');
  }

  /**
   * Check if OAuth was recently initiated (within last 10 minutes)
   */
  wasOAuthInitiated() {
    if (!this.isClient) return false;
    
    const state = this.getOAuthState();
    if (!state || !state.initiated) return false;
    
    const tenMinutes = 10 * 60 * 1000;
    return (Date.now() - state.timestamp) < tenMinutes;
  }

  /**
   * Generate OAuth URL
   */
  generateOAuthUrl(provider, type, baseUrl) {
    if (!this.isClient) return null;
    
    const currentUrl = window.location.origin;
    const redirectPath = type === 'login' ? '/auth/login' : '/auth/register';
    const redirectUrl = `${currentUrl}${redirectPath}`;
    
    // Store state
    this.storeOAuthState(provider, type, redirectUrl);
    
    // Construct OAuth URL
    return `${baseUrl}/api/v1/auth/${provider}?type=${type}&redirect=${encodeURIComponent(redirectUrl)}`;
  }

  /**
   * Handle OAuth error messages
   */
  getErrorMessage(error) {
    const errorMessages = {
      'oauth_failed': 'Authentication failed. Please try again.',
      'oauth_cancelled': 'Authentication was cancelled.',
      'oauth_error': 'An error occurred during authentication.',
      'invalid_token': 'Invalid authentication token.',
      'token_expired': 'Authentication token has expired.',
      'user_exists': 'An account with this email already exists.',
      'registration_failed': 'Registration failed. Please try again.',
      'login_failed': 'Login failed. Please try again.',
      'network_error': 'Network error. Please check your connection.',
      'server_error': 'Server error. Please try again later.'
    };
    
    return errorMessages[error] || 'An unexpected error occurred. Please try again.';
  }

  /**
   * Validate OAuth callback
   */
  validateCallback() {
    const params = this.getCallbackParams();
    const state = this.getOAuthState();
    
    console.log('OAuth validation debug:', {
      params,
      state,
      url: window.location.href,
      hasParams: !!params,
      hasState: !!state
    });
    
    if (!params) {
      return { valid: false, error: 'No callback parameters found' };
    }
    
    // Check for error parameters first
    if (params.error) {
      return { valid: false, error: this.getErrorMessage(params.error) };
    }
    
    // Check for successful OAuth callback with token
    if (params.success && params.token) {
      return { valid: true, params, state };
    }
    
    // Additional check for legacy or alternative success indicators
    if (params.token && (params.provider || params.type)) {
      return { valid: true, params, state };
    }
    
    // If no success/token but we have stored state, check initiation
    if (state && this.wasOAuthInitiated()) {
      return { valid: false, error: 'OAuth response incomplete' };
    }
    
    return { valid: false, error: 'Invalid OAuth response' };
  }

  /**
   * Process successful OAuth callback
   */
  processCallback() {
    const validation = this.validateCallback();
    
    if (!validation.valid) {
      console.error('OAuth validation failed:', validation.error);
      console.error('URL params:', window.location.search);
      console.error('Stored state:', this.getOAuthState());
      this.clearOAuthState();
      this.clearOAuthParams();
      return { success: false, error: validation.error };
    }
    
    const { params, state } = validation;
    
    console.log('OAuth callback validation successful:', {
      params,
      state,
      url: window.location.href
    });
    
    // Clear OAuth state and params
    this.clearOAuthState();
    this.clearOAuthParams();
    
    return {
      success: true,
      token: params.token,
      provider: params.provider || 'google',
      type: params.type || state?.type || 'login',
      redirectUrl: state?.redirectUrl,
      refreshToken: params.refresh_token,
      isNewUser: params.new_user === 'true'
    };
  }
}

// Create singleton instance
export const oauthHandler = new OAuthHandler();

// Legacy support for existing code
export const handleGoogleAuth = (isLogin = true) => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5004';
  const type = isLogin ? 'login' : 'register';
  const url = oauthHandler.generateOAuthUrl('google', type, baseUrl);
  
  if (url) {
    window.location.href = url;
  }
};

export default oauthHandler;
