const CACHE_NAME = 'yoga-practice-v1';
const AUDIO_CACHE_NAME = 'yoga-audio-cache-v1';
const PAGES_CACHE_NAME = 'yoga-pages-cache-v1';

// Assets to cache
const urlsToCache = [
  '/',
  '/yoga/bikram-26',
  '/yoga/bikram-26/practice',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/apple-touch-icon.png',
  '/offline.html',
  '/_next/static/chunks/main.js',
  '/_next/static/chunks/webpack.js',
  '/_next/static/chunks/pages/_app.js',
  '/_next/static/chunks/pages/index.js',
  '/_next/static/chunks/pages/yoga/bikram-26/practice.js'
];

// Audio files to cache
const audioUrlsToCache = [
  'https://jsltdgvipylqrgesphet.supabase.co/storage/v1/object/public/audio//gong-79191.mp3',
  'https://ufzfbwxnlcjxwpwdxjar.supabase.co/storage/v1/object/public/audio/bikram-90-english.mp3',
  'https://ufzfbwxnlcjxwpwdxjar.supabase.co/storage/v1/object/public/audio/bikram-45-english.mp3'
];

// Pages to cache for offline access
const pagesToCache = [
  '/',
  '/yoga/bikram-26',
  '/yoga/bikram-26/practice'
];

// Install event - cache all static assets and audio files
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(CACHE_NAME).then((cache) => {
        console.log('Caching static assets');
        return cache.addAll(urlsToCache);
      }),
      // Cache audio files
      caches.open(AUDIO_CACHE_NAME).then((cache) => {
        console.log('Caching audio files');
        return cache.addAll(audioUrlsToCache);
      }),
      // Cache pages
      caches.open(PAGES_CACHE_NAME).then(async (cache) => {
        console.log('Caching pages for offline use');
        // For each page, fetch and cache both HTML and JSON (for Next.js data)
        const cachePromises = pagesToCache.map(async (page) => {
          try {
            // Cache HTML version
            const htmlResponse = await fetch(page);
            if (htmlResponse.ok) {
              await cache.put(page, htmlResponse.clone());
            }
            
            // Cache Next.js data (for client-side navigation)
            const jsonResponse = await fetch(`${page}.json`);
            if (jsonResponse.ok) {
              await cache.put(`${page}.json`, jsonResponse.clone());
            }
          } catch (error) {
            console.error(`Failed to cache page ${page}:`, error);
          }
        });
        
        return Promise.all(cachePromises);
      })
    ])
    .then(() => self.skipWaiting()) // Activate the service worker immediately
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (![CACHE_NAME, AUDIO_CACHE_NAME, PAGES_CACHE_NAME].includes(cacheName)) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => self.clients.claim()) // Take control of all clients immediately
  );
});

// Helper function to determine if a request is for a Next.js page
const isNextJsPage = (url) => {
  // Check if it's a page route (not an API route, static file, etc.)
  const pathname = new URL(url).pathname;
  return !pathname.startsWith('/_next/') && 
         !pathname.startsWith('/api/') &&
         !pathname.includes('.') &&
         pathname !== '/favicon.ico';
};

// Helper function to determine if a request is for a Next.js data fetch
const isNextJsData = (url) => {
  return url.includes('/_next/data/') && url.endsWith('.json');
};

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Skip cross-origin requests except for Supabase
  if (!url.origin.includes(self.location.origin) && 
      !url.origin.includes('supabase.co')) {
    return;
  }
  
  // Special handling for audio files - Cache first, then network
  if (event.request.url.includes('.mp3') || 
      event.request.url.includes('.wav') || 
      event.request.url.includes('posture_audio')) {
    event.respondWith(
      caches.open(AUDIO_CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          // Return cached audio if available
          if (response) {
            console.log('Serving audio from cache:', event.request.url);
            return response;
          }
          
          console.log('Fetching audio from network:', event.request.url);
          // Otherwise fetch from network and cache
          return fetch(event.request)
            .then((networkResponse) => {
              console.log('Caching new audio file:', event.request.url);
              cache.put(event.request, networkResponse.clone());
              return networkResponse;
            })
            .catch(error => {
              console.error('Failed to fetch audio:', error);
              return new Response('Audio file not available offline', { 
                status: 503,
                headers: { 'Content-Type': 'text/plain' }
              });
            });
        });
      })
    );
    return;
  }
  
  // Handle Next.js static files - Cache first, then network
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request).then(networkResponse => {
          // Cache successful responses
          if (networkResponse.ok) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        });
      })
    );
    return;
  }
  
  // Handle Next.js page navigation - Network first, then cache, then offline page
  if (event.request.mode === 'navigate' || isNextJsPage(event.request.url)) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Cache successful responses for future offline use
          if (response.ok) {
            const responseToCache = response.clone();
            caches.open(PAGES_CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // If network fails, try to serve from cache
          return caches.match(event.request)
            .then(cachedResponse => {
              if (cachedResponse) {
                return cachedResponse;
              }
              
              // If both network and cache fail, show offline page
              // But first check if we're requesting the practice page
              if (url.pathname === '/yoga/bikram-26/practice') {
                // For the practice page, we want to make a special effort
                // to serve it from cache since it's our main offline feature
                return caches.open(PAGES_CACHE_NAME)
                  .then(cache => cache.match('/yoga/bikram-26/practice'))
                  .then(practicePageResponse => {
                    return practicePageResponse || caches.match('/offline.html');
                  });
              }
              
              // For other pages, just show the offline page
              return caches.match('/offline.html');
            });
        })
    );
    return;
  }
  
  // Handle Next.js data fetches - Network first, then cache
  if (isNextJsData(event.request.url)) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Cache successful responses
          if (response.ok) {
            const responseToCache = response.clone();
            caches.open(PAGES_CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // If network fails, try to serve from cache
          return caches.match(event.request)
            .then(cachedResponse => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // If no cached data, return empty JSON
              return new Response(JSON.stringify({ 
                pageProps: { __N_SSG: true } 
              }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
              });
            });
        })
    );
    return;
  }
  
  // Standard cache strategy for other assets - Cache first, then network
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return from cache if available
      if (response) {
        return response;
      }
      
      // Otherwise fetch from network
      return fetch(event.request)
        .then((networkResponse) => {
          // Don't cache non-successful responses or non-GET requests
          if (!networkResponse || networkResponse.status !== 200 || 
              event.request.method !== 'GET') {
            return networkResponse;
          }
          
          // Cache successful responses
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          
          return networkResponse;
        })
        .catch(error => {
          console.error('Fetch failed:', error);
          // For API requests, return a JSON error
          if (event.request.url.includes('/api/')) {
            return new Response(JSON.stringify({ error: 'Network error' }), {
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            });
          }
          // For image requests, could return a placeholder
          if (event.request.destination === 'image') {
            return caches.match('/offline-image.png');
          }
          // Default error response
          return new Response('Network error', { 
            status: 503,
            headers: { 'Content-Type': 'text/plain' }
          });
        });
    })
  );
}); 