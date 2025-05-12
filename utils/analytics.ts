/**
 * Utility functions for tracking analytics events with Vercel Analytics
 */

// Define event types for better type safety
export type AnalyticsEventName = 
  | 'calendar_download'
  | 'class_joined'
  | 'audio_play'
  | 'class_scheduled';

// Define properties interface for event tracking
export interface AnalyticsEventProperties {
  classId?: string;
  className?: string;
  classType?: string;
  scheduledTime?: string;
  source?: string;
  duration?: number;
  audioTitle?: string;
  audioUrl?: string;
  [key: string]: any; // Allow additional custom properties
}

/**
 * Track an event with Vercel Analytics
 */
export function trackEvent(
  eventName: AnalyticsEventName, 
  properties?: AnalyticsEventProperties
): void {
  // Check if running in browser
  if (typeof window === 'undefined') return;
  
  // Track with Vercel Analytics if available
  if (typeof window.va === 'function') {
    try {
      // @ts-ignore - Ignoring type issues with Vercel Analytics
      window.va('event', eventName, properties);
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  } else {
    // Fallback for debugging when Vercel Analytics is not loaded
    console.log(`[Analytics Event] ${eventName}`, properties);
  }
}

// Declare the Vercel Analytics type for TypeScript
declare global {
  interface Window {
    va?: (
      event: 'event' | 'beforeSend' | 'pageview',
      eventName?: string,
      properties?: {[key: string]: any}
    ) => void;
  }
} 