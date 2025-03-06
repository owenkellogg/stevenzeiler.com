const CACHE_NAME = 'yoga-practice-v1';
const AUDIO_CACHE_NAME = 'yoga-audio-cache-v1';

// Assets to cache
const urlsToCache = [
  '/',
  '/yoga/bikram-26/practice',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/apple-touch-icon.png'
];

// Audio files to cache
const audioUrlsToCache = [
  'https://jsltdgvipylqrgesphet.supabase.co/storage/v1/object/public/audio//gong-79191.mp3'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(urlsToCache);
      }),
      // Cache audio files
      caches.open(AUDIO_CACHE_NAME).then((cache) => {
        return cache.addAll(audioUrlsToCache);
      })
    ])
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== AUDIO_CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Special handling for audio files
  if (event.request.url.includes('.mp3')) {
    event.respondWith(
      caches.open(AUDIO_CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          // Return cached audio if available
          if (response) {
            return response;
          }
          
          // Otherwise fetch from network and cache
          return fetch(event.request).then((networkResponse) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        });
      })
    );
    return;
  }
  
  // Standard cache strategy for other assets
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      
      return fetch(event.request).then((response) => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        
        return response;
      });
    })
  );
}); 