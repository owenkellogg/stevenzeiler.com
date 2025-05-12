// This optional code is used to register a service worker.
// register() is not called by default.

export function register(audioUrl: string, scheduledTime: Date): void {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    const swUrl = '/sw.js';

    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register(swUrl)
        .then(registration => {
          console.log('SW registered: ', registration);
          
          // Calculate time until scheduled start
          const now = new Date().getTime();
          const scheduledTimeMs = scheduledTime.getTime();
          const timeUntilStart = scheduledTimeMs - now;
          
          if (timeUntilStart <= 0) {
            // It's already time to play
            if (registration.active) {
              registration.active.postMessage({
                type: 'PLAY_AUDIO',
                url: audioUrl
              });
            }
          } else {
            // Set timeout to notify service worker when it's time
            setTimeout(() => {
              if (registration.active) {
                registration.active.postMessage({
                  type: 'PLAY_AUDIO',
                  url: audioUrl
                });
              }
            }, timeUntilStart);
          }
        })
        .catch(error => {
          console.error('Error during service worker registration:', error);
        });
    });
    
    // Set up message listener for audio start notifications
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.addEventListener('message', event => {
        if (event.data && event.data.type === 'AUDIO_START') {
          // Create and play audio
          const audio = new Audio(event.data.url);
          
          // Attempt to configure audio for auto-play
          audio.autoplay = true;
          audio.muted = false;
          audio.controls = true;
          
          // Try to play
          const playPromise = audio.play();
          if (playPromise !== undefined) {
            playPromise.catch(error => {
              console.warn('Service worker audio autoplay was prevented:', error);
              
              // Unmute and try again with user notification
              const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
              if (audioContext.state === 'suspended') {
                audioContext.resume().then(() => {
                  // Try again after resume
                  audio.play().catch(e => console.error('Still cannot play audio:', e));
                });
              }
            });
          }
          
          // Dispatch a custom event that the page can listen for
          window.dispatchEvent(new CustomEvent('yogaAudioStart', {
            detail: { url: event.data.url }
          }));
        }
      });
    }
  }
}

export function unregister(): void {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then(registration => {
        registration.unregister();
      })
      .catch(error => {
        console.error(error.message);
      });
  }
} 