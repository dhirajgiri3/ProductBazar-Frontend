/**
 * Test utility for auth improvements
 * This can be used to verify the new auth system works correctly
 */

import { 
  getAuthToken, 
  setAuthToken, 
  removeAuthToken, 
  shouldRefreshToken,
  getTokenExpiry,
  getTimeUntilExpiry
} from './auth-utils.js';

/**
 * Test the auth utilities
 * This function can be called in development to verify everything works
 */
export const testAuthUtilities = () => {
  if (typeof window === 'undefined') {
    console.log('Auth test: Running on server side, skipping tests');
    return;
  }

  console.log('🧪 Testing auth utilities...');

  // Test 1: Token storage and retrieval
  const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMzQ1Njc4OTAiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJpYXQiOjE2MzQ1Njc4OTAsImV4cCI6MTYzNDU3MTQ5MH0.test-signature';
  
  console.log('Test 1: Token storage and retrieval');
  const stored = setAuthToken(testToken);
  console.log('✅ Token stored:', stored);
  
  const retrieved = getAuthToken();
  console.log('✅ Token retrieved:', retrieved === testToken);
  
  // Test 2: Token validation
  console.log('Test 2: Token validation');
  const invalidToken = 'invalid-token';
  const storedInvalid = setAuthToken(invalidToken);
  console.log('✅ Invalid token rejected:', !storedInvalid);
  
  // Test 3: Token expiry
  console.log('Test 3: Token expiry');
  const expiry = getTokenExpiry();
  const timeUntilExpiry = getTimeUntilExpiry();
  console.log('✅ Token expiry:', expiry);
  console.log('✅ Time until expiry:', timeUntilExpiry);
  
  // Test 4: Token refresh check
  console.log('Test 4: Token refresh check');
  const needsRefresh = shouldRefreshToken();
  console.log('✅ Needs refresh:', needsRefresh);
  
  // Test 5: Token cleanup
  console.log('Test 5: Token cleanup');
  removeAuthToken();
  const afterCleanup = getAuthToken();
  console.log('✅ Token cleaned up:', !afterCleanup);
  
  console.log('🎉 All auth utility tests completed!');
};

/**
 * Test sessionStorage vs localStorage
 */
export const testStorageTypes = () => {
  if (typeof window === 'undefined') return;

  console.log('🧪 Testing storage types...');

  // Test localStorage persistence
  localStorage.setItem('test_local', 'local_value');
  const localValue = localStorage.getItem('test_local');
  console.log('✅ localStorage persistence:', localValue === 'local_value');

  // Test sessionStorage (cleared on tab close)
  sessionStorage.setItem('test_session', 'session_value');
  const sessionValue = sessionStorage.getItem('test_session');
  console.log('✅ sessionStorage persistence:', sessionValue === 'session_value');

  // Cleanup
  localStorage.removeItem('test_local');
  sessionStorage.removeItem('test_session');

  console.log('🎉 Storage type tests completed!');
};

/**
 * Run all auth tests
 */
export const runAuthTests = () => {
  console.log('🚀 Running comprehensive auth tests...');
  
  testAuthUtilities();
  testStorageTypes();
  
  console.log('🎉 All auth tests completed!');
};

// Auto-run tests in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Uncomment the line below to run tests automatically in development
  // runAuthTests();
}

export default {
  testAuthUtilities,
  testStorageTypes,
  runAuthTests,
}; 