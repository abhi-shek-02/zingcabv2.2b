// Service Worker for caching images and videos
const CACHE_NAME = 'zingcab-assets-v1';
const CACHE_DURATION = 180 * 24 * 60 * 60 * 1000; // 6 months (180 days)

// Assets to cache immediately
const ASSETS_TO_CACHE = [
  // Cloudinary images - will be cached on first load
  'https://res.cloudinary.com/dglbplg86/image/upload/',
  'https://res.cloudinary.com/dglbplg86/video/upload/',
];

// Install event - cache critical assets
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      );
    })
  );
  return self.clients.claim();
});

// Fetch event - cache images and videos
self.addEventListener('fetch', (event) => {
  const url = event.request.url;
  
  // Only cache Cloudinary assets
  if (url.includes('res.cloudinary.com')) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          // Return cached version if available and not expired
          if (cachedResponse) {
            const cachedDate = cachedResponse.headers.get('sw-cached-date');
            if (cachedDate) {
              const cacheTime = parseInt(cachedDate, 10);
              const now = Date.now();
              if (now - cacheTime < CACHE_DURATION) {
                return cachedResponse;
              }
            }
          }
          
          // Fetch from network
          return fetch(event.request).then((response) => {
            // Clone the response
            const responseToCache = response.clone();
            
            // Add cache date header
            const headers = new Headers(responseToCache.headers);
            headers.set('sw-cached-date', Date.now().toString());
            
            // Cache the response
            if (response.status === 200) {
              const modifiedResponse = new Response(responseToCache.body, {
                status: responseToCache.status,
                statusText: responseToCache.statusText,
                headers: headers,
              });
              cache.put(event.request, modifiedResponse);
            }
            
            return response;
          }).catch(() => {
            // If network fails and we have a cached version, return it
            if (cachedResponse) {
              return cachedResponse;
            }
          });
        });
      })
    );
  }
});


