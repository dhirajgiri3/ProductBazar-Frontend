/**
 * Simple logger for the frontend
 * - Provides consistent logging format
 * - Includes log level filtering
 * - Disables logs in production unless explicitly enabled
 */

// Log levels with numeric values for filtering
const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// Default minimum log level based on environment
const DEFAULT_MIN_LEVEL = process.env.NODE_ENV === 'production' ? 'warn' : 'debug';

// Get configured min level - can be overridden via localStorage
const getMinLevel = () => {
  try {
    const storedLevel = localStorage.getItem('logLevel');
    return storedLevel || DEFAULT_MIN_LEVEL;
  } catch (e) {
    return DEFAULT_MIN_LEVEL;
  }
};

// Helper to check if we should log at this level
const shouldLog = (level) => {
  const minLevel = getMinLevel();
  return LOG_LEVELS[level] >= LOG_LEVELS[minLevel];
};

// Main logger object with methods for each level
const logger = {
  debug: (...args) => {
    if (shouldLog('debug')) {
      console.debug('[DEBUG]', ...args);
    }
  },
  
  info: (...args) => {
    if (shouldLog('info')) {
      console.info('[INFO]', ...args);
    }
  },
  
  warn: (...args) => {
    if (shouldLog('warn')) {
      console.warn('[WARN]', ...args);
    }
  },
  
  error: (...args) => {
    if (shouldLog('error')) {
      console.error('[ERROR]', ...args);
    }
    
    // Optionally send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      // TODO: Add error reporting service integration
      // Example: Sentry.captureException(args[0]);
    }
  },
  
  // Set log level programmatically
  setLevel: (level) => {
    if (LOG_LEVELS[level] !== undefined) {
      try {
        localStorage.setItem('logLevel', level);
      } catch (e) {
        console.error('Failed to set log level in localStorage');
      }
    }
  },
  
  // Get current log level
  getLevel: () => {
    return getMinLevel();
  }
};

export default logger;
