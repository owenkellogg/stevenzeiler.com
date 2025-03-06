// Register service worker for PWA functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Wait for Next.js to finish hydration
    if (window.next && window.next.isHydrated) {
      registerSW();
    } else {
      // If Next.js hydration hasn't completed, wait for it
      window.addEventListener('next:hydrated', registerSW);
    }
  });
}

function registerSW() {
  navigator.serviceWorker.register('/sw.js')
    .then(registration => {
      console.log('Service Worker registered with scope:', registration.scope);
      
      // Check for updates on page load
      registration.update();
      
      // Handle updates
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) {
          return;
        }
        
        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // New content is available; notify the user
              console.log('New content is available and will be used when all tabs for this page are closed.');
              
              // Show update notification if desired
              if (window.confirm('New version available! Reload to update?')) {
                window.location.reload();
              }
            } else {
              // Content is cached for offline use
              console.log('Content is cached for offline use.');
            }
          }
        };
      };
    })
    .catch(error => {
      console.error('Service Worker registration failed:', error);
    });
}

// Add event listener for online/offline status
window.addEventListener('online', () => {
  console.log('App is online. Syncing data...');
  // You could trigger a sync here if needed
});

window.addEventListener('offline', () => {
  console.log('App is offline. Using cached data...');
  // You could show a notification here if needed
});

// Add custom event for Next.js hydration
document.addEventListener('DOMContentLoaded', () => {
  // Create a MutationObserver to detect when Next.js has hydrated the page
  const observer = new MutationObserver((mutations) => {
    if (document.querySelector('#__next[data-reactroot]')) {
      // Next.js has hydrated the page
      window.dispatchEvent(new Event('next:hydrated'));
      observer.disconnect();
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['data-reactroot']
  });
}); 