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
  
  // Check if Vercel Analytics is available
  if (typeof window.va !== 'undefined') {
    window.va?.event(eventName, properties);
  } else {
    // Fallback for debugging when Vercel Analytics is not loaded
    console.log(`[Analytics Event] ${eventName}`, properties);
  }
}

// Declare the Vercel Analytics type for TypeScript
declare global {
  interface Window {
    va?: {
      event: (
        eventName: string,
        properties?: {[key: string]: any}
      ) => void;
    };
  }
} 