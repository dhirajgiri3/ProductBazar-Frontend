import { useEffect, useRef, useState } from 'react';

export default function useIntersectionObserver(options = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const elementRef = useRef(null);

  const defaultOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1,
    freezeOnceVisible: false,
  };

  const mergedOptions = { ...defaultOptions, ...options };
  
  useEffect(() => {
    const element = elementRef.current;
    
    if (!element || (mergedOptions.freezeOnceVisible && hasIntersected)) return;

    const observer = new IntersectionObserver(([entry]) => {
      const isElementIntersecting = entry.isIntersecting;
      setIsIntersecting(isElementIntersecting);
      
      if (isElementIntersecting && !hasIntersected) {
        setHasIntersected(true);
      }
    }, mergedOptions);

    observer.observe(element);

    return () => observer.disconnect();
  }, [elementRef, mergedOptions.threshold, mergedOptions.root, mergedOptions.rootMargin, 
      mergedOptions.freezeOnceVisible, hasIntersected]);

  return { elementRef, isIntersecting, hasIntersected };
}
