import { useState, useEffect, useCallback, useRef } from 'react';

interface ReadingProgressOptions {
  /**
   * Throttle delay in milliseconds to limit scroll event frequency
   * @default 100
   */
  throttleDelay?: number;
  /**
   * CSS selector for the content container to track
   * @default '.tale-content'
   */
  contentSelector?: string;
}

interface ReadingProgressData {
  /** Reading progress as percentage (0-100) */
  progress: number;
  /** Whether user has finished reading */
  isComplete: boolean;
  /** Estimated reading time remaining in minutes */
  estimatedTimeRemaining: number;
}

/**
 * Custom hook to track reading progress on a page
 * Uses Intersection Observer for performance optimization
 */
export const useReadingProgress = (
  options: ReadingProgressOptions = {}
): ReadingProgressData => {
  const {
    throttleDelay = 100,
    contentSelector = '.tale-content'
  } = options;

  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState(0);
  
  const throttleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const contentElementRef = useRef<Element | null>(null);
  const totalReadingTimeRef = useRef<number>(0);

  // Throttled scroll handler
  const throttledScrollHandler = useCallback(() => {
    if (throttleTimeoutRef.current) {
      clearTimeout(throttleTimeoutRef.current);
    }

    throttleTimeoutRef.current = setTimeout(() => {
      const contentElement = contentElementRef.current;
      if (!contentElement) return;

      const rect = contentElement.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const contentHeight = rect.height;
      const viewportTop = -rect.top;

      // Calculate how much of the content is visible/scrolled past
      let scrollProgress = 0;
      
      if (rect.top >= 0) {
        // Content is below viewport
        scrollProgress = 0;
      } else if (rect.bottom <= windowHeight) {
        // Content is fully above viewport
        scrollProgress = 100;
      } else {
        // Content is partially in viewport
        const scrolledDistance = Math.max(0, viewportTop);
        const totalScrollableDistance = contentHeight - windowHeight;
        scrollProgress = totalScrollableDistance > 0 
          ? Math.min(100, (scrolledDistance / totalScrollableDistance) * 100)
          : 0;
      }

      // Debug logging
      console.log('Reading progress debug:', {
        scrollProgress: Math.round(scrollProgress),
        contentHeight,
        windowHeight,
        rectTop: rect.top,
        rectBottom: rect.bottom,
        scrolledDistance: Math.max(0, viewportTop),
        totalScrollableDistance: contentHeight - windowHeight
      });

      setProgress(Math.round(scrollProgress));
      setIsComplete(scrollProgress >= 95); // Consider 95% as complete
      
      // Calculate estimated time remaining
      const remainingPercent = Math.max(0, 100 - scrollProgress);
      const remainingTime = (totalReadingTimeRef.current * remainingPercent) / 100;
      setEstimatedTimeRemaining(Math.ceil(remainingTime));
    }, throttleDelay);
  }, [throttleDelay]);

  useEffect(() => {
    // Find content element
    const contentElement = document.querySelector(contentSelector);
    if (!contentElement) {
      console.warn(`Reading progress: Content element not found with selector "${contentSelector}"`);
      return;
    }

    console.log('Reading progress: Content element found', {
      selector: contentSelector,
      element: contentElement,
      height: contentElement.getBoundingClientRect().height
    });

    contentElementRef.current = contentElement;

    // Extract reading time from meta or calculate from word count
    const readingTimeElement = document.querySelector('[data-reading-time]');
    if (readingTimeElement) {
      totalReadingTimeRef.current = parseInt(
        readingTimeElement.getAttribute('data-reading-time') || '5',
        10
      );
    } else {
      // Fallback: estimate from word count (average 200 words per minute)
      const wordCount = contentElement.textContent?.split(/\s+/).length || 1000;
      totalReadingTimeRef.current = Math.max(1, Math.ceil(wordCount / 200));
    }

    // Add scroll event listener
    window.addEventListener('scroll', throttledScrollHandler, { passive: true });
    window.addEventListener('resize', throttledScrollHandler, { passive: true });
    
    // Initial calculation
    throttledScrollHandler();

    // Cleanup
    return () => {
      window.removeEventListener('scroll', throttledScrollHandler);
      window.removeEventListener('resize', throttledScrollHandler);
      if (throttleTimeoutRef.current) {
        clearTimeout(throttleTimeoutRef.current);
      }
    };
  }, [contentSelector, throttledScrollHandler]);

  return {
    progress,
    isComplete,
    estimatedTimeRemaining
  };
}; 