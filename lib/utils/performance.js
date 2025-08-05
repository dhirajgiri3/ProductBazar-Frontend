// Performance monitoring utility
class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.observers = new Map();
    this.isEnabled = process.env.NODE_ENV === 'development';
  }

  // Start timing an operation
  startTimer(operation, context = {}) {
    if (!this.isEnabled) return null;
    
    const timerId = `${operation}-${Date.now()}-${Math.random()}`;
    const startTime = performance.now();
    
    this.metrics.set(timerId, {
      operation,
      startTime,
      context,
      status: 'running'
    });

    return timerId;
  }

  // End timing an operation
  endTimer(timerId, additionalData = {}) {
    if (!this.isEnabled || !timerId) return;

    const metric = this.metrics.get(timerId);
    if (!metric) return;

    const endTime = performance.now();
    const duration = endTime - metric.startTime;

    metric.endTime = endTime;
    metric.duration = duration;
    metric.status = 'completed';
    metric.additionalData = additionalData;

    // Log performance data
    this.logPerformance(metric);

    // Notify observers
    this.notifyObservers(metric);

    return metric;
  }

  // Mark an operation as failed
  markFailed(timerId, error) {
    if (!this.isEnabled || !timerId) return;

    const metric = this.metrics.get(timerId);
    if (!metric) return;

    metric.status = 'failed';
    metric.error = error;
    metric.endTime = performance.now();
    metric.duration = metric.endTime - metric.startTime;

    this.logPerformance(metric);
  }

  // Log performance data
  logPerformance(metric) {
    const { operation, duration, context, status, error } = metric;
    
    if (status === 'failed') {
      console.warn(`Performance: ${operation} failed after ${duration.toFixed(2)}ms`, {
        context,
        error: error?.message || error
      });
    } else if (duration > 1000) {
      console.warn(`Performance: ${operation} took ${duration.toFixed(2)}ms (slow)`, context);
    } else if (duration > 500) {
      console.info(`Performance: ${operation} took ${duration.toFixed(2)}ms (moderate)`, context);
    } else {
      console.debug(`Performance: ${operation} took ${duration.toFixed(2)}ms`, context);
    }
  }

  // Add observer for performance events
  addObserver(callback) {
    const observerId = Date.now() + Math.random();
    this.observers.set(observerId, callback);
    return observerId;
  }

  // Remove observer
  removeObserver(observerId) {
    this.observers.delete(observerId);
  }

  // Notify observers
  notifyObservers(metric) {
    this.observers.forEach(callback => {
      try {
        callback(metric);
      } catch (error) {
        console.error('Error in performance observer:', error);
      }
    });
  }

  // Get performance summary
  getSummary() {
    const summary = {
      totalOperations: this.metrics.size,
      averageDuration: 0,
      slowOperations: [],
      failedOperations: [],
      byOperation: {}
    };

    let totalDuration = 0;
    let completedCount = 0;

    this.metrics.forEach(metric => {
      if (metric.status === 'completed') {
        totalDuration += metric.duration;
        completedCount++;

        // Group by operation
        if (!summary.byOperation[metric.operation]) {
          summary.byOperation[metric.operation] = {
            count: 0,
            totalDuration: 0,
            averageDuration: 0
          };
        }

        summary.byOperation[metric.operation].count++;
        summary.byOperation[metric.operation].totalDuration += metric.duration;

        // Track slow operations (>1s)
        if (metric.duration > 1000) {
          summary.slowOperations.push(metric);
        }
      } else if (metric.status === 'failed') {
        summary.failedOperations.push(metric);
      }
    });

    if (completedCount > 0) {
      summary.averageDuration = totalDuration / completedCount;
    }

    // Calculate averages for each operation
    Object.keys(summary.byOperation).forEach(operation => {
      const op = summary.byOperation[operation];
      op.averageDuration = op.totalDuration / op.count;
    });

    return summary;
  }

  // Clear metrics
  clear() {
    this.metrics.clear();
  }

  // Measure async operation
  async measureAsync(operation, asyncFn, context = {}) {
    const timerId = this.startTimer(operation, context);
    
    try {
      const result = await asyncFn();
      this.endTimer(timerId, { success: true });
      return result;
    } catch (error) {
      this.markFailed(timerId, error);
      throw error;
    }
  }

  // Measure sync operation
  measureSync(operation, syncFn, context = {}) {
    const timerId = this.startTimer(operation, context);
    
    try {
      const result = syncFn();
      this.endTimer(timerId, { success: true });
      return result;
    } catch (error) {
      this.markFailed(timerId, error);
      throw error;
    }
  }
}

// Create global instance
const performanceMonitor = new PerformanceMonitor();

// Export utility functions
export const measureAsync = (operation, asyncFn, context = {}) => 
  performanceMonitor.measureAsync(operation, asyncFn, context);

export const measureSync = (operation, syncFn, context = {}) => 
  performanceMonitor.measureSync(operation, syncFn, context);

export const startTimer = (operation, context = {}) => 
  performanceMonitor.startTimer(operation, context);

export const endTimer = (timerId, additionalData = {}) => 
  performanceMonitor.endTimer(timerId, additionalData);

export const markFailed = (timerId, error) => 
  performanceMonitor.markFailed(timerId, error);

export const getPerformanceSummary = () => 
  performanceMonitor.getSummary();

export const addPerformanceObserver = (callback) => 
  performanceMonitor.addObserver(callback);

export const removePerformanceObserver = (observerId) => 
  performanceMonitor.removeObserver(observerId);

export default performanceMonitor; 