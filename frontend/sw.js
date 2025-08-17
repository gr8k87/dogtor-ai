const CACHE_NAME = 'dogtor-ai-v1'
const STATIC_RESOURCES = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/feather-icons'
]

// Install service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching static resources')
        return cache.addAll(STATIC_RESOURCES)
      })
      .catch((error) => {
        console.error('Cache install failed:', error)
      })
  )
})

// Activate service worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})

// Fetch handler for offline support
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version if available
        if (response) {
          return response
        }

        // Otherwise fetch from network
        return fetch(event.request)
          .then((response) => {
            // Don't cache API requests or non-GET requests
            if (!response || response.status !== 200 || response.type !== 'basic' ||
                event.request.method !== 'GET' || event.request.url.includes('/api/')) {
              return response
            }

            // Clone response for caching
            const responseToCache = response.clone()
            
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache)
              })

            return response
          })
          .catch(() => {
            // Return offline fallback for HTML requests
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('/index.html')
            }
          })
      })
  )
})

// Background sync for offline case uploads (future enhancement)
self.addEventListener('sync', (event) => {
  if (event.tag === 'case-sync') {
    console.log('Background sync triggered for cases')
    // Implementation would sync offline cases when connection restored
  }
})
