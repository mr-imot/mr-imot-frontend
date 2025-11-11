// Service Worker for Mr. Imot PWA
const CACHE_NAME = 'mr-imot-v1.0.0'
const STATIC_CACHE = 'mr-imot-static-v1.0.0'
const DYNAMIC_CACHE = 'mr-imot-dynamic-v1.0.0'

// Files to cache immediately
const STATIC_FILES = [
  '/',
  '/listings',
  '/about-us',
  '/contact',
  '/login',
  '/register?type=developer',
  '/manifest.json',
  '/offline.html'
]

// Install event - cache static files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Caching static files')
        return cache.addAll(STATIC_FILES)
      })
      .then(() => {
        console.log('Static files cached successfully')
        return self.skipWaiting()
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('Service Worker activated')
        return self.clients.claim()
      })
  )
})

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }

  // Skip external requests (Google Maps, etc.)
  if (url.origin !== self.location.origin) {
    return
  }

  // Handle different types of requests
  if (request.destination === 'document') {
    // HTML pages - try cache first, then network
    event.respondWith(handleDocumentRequest(request))
  } else if (request.destination === 'image') {
    // Images - cache first, then network
    event.respondWith(handleImageRequest(request))
  } else if (request.destination === 'script' || request.destination === 'style') {
    // CSS/JS - network first, then cache
    event.respondWith(handleAssetRequest(request))
  } else {
    // Other requests - network first
    event.respondWith(fetch(request))
  }
})

// Handle document requests (HTML pages)
async function handleDocumentRequest(request) {
  try {
    // Try cache first
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    // Try network
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      // Cache the response
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, networkResponse.clone())
      return networkResponse
    }

    // If network fails, return offline page
    return caches.match('/offline.html')
  } catch (error) {
    console.log('Document request failed, serving offline page:', error)
    return caches.match('/offline.html')
  }
}

// Handle image requests
async function handleImageRequest(request) {
  try {
    // Try cache first
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    // Try network
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      // Cache the response
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, networkResponse.clone())
      return networkResponse
    }

    // Return a placeholder image if available
    return new Response('Image not available', { status: 404 })
  } catch (error) {
    console.log('Image request failed:', error)
    return new Response('Image not available', { status: 404 })
  }
}

// Handle asset requests (CSS, JS)
async function handleAssetRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      // Cache the response
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, networkResponse.clone())
      return networkResponse
    }

    // If network fails, try cache
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    throw new Error('Asset not available')
  } catch (error) {
    console.log('Asset request failed:', error)
    return new Response('Asset not available', { status: 404 })
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync())
  }
})

// Handle background sync
async function doBackgroundSync() {
  try {
    // Get any pending actions from IndexedDB
    // This would be implemented based on your specific offline actions
    console.log('Performing background sync')
    
    // Example: sync offline form submissions
    // await syncOfflineForms()
    
  } catch (error) {
    console.error('Background sync failed:', error)
  }
}

// Push notification handling
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json()
    const options = {
      body: data.body,
                     icon: 'https://ik.imagekit.io/ts59gf2ul/Logo/mr-imot-logo-no-background.png?tr=w-192,h-192,fo-auto',
        badge: 'https://ik.imagekit.io/ts59gf2ul/Logo/mr-imot-logo-no-background.png?tr=w-192,h-192,fo-auto',
      vibrate: [100, 50, 100],
      data: data.data || {},
      actions: data.actions || []
    }

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    )
  }
})

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action) {
    // Handle specific action clicks
    handleNotificationAction(event.action, event.notification.data)
  } else {
    // Default click behavior
    event.waitUntil(
      clients.openWindow('/')
    )
  }
})

// Handle notification actions
function handleNotificationAction(action, data) {
  switch (action) {
    case 'view_property':
      if (data.propertyId) {
        clients.openWindow(`/listing/${data.propertyId}`)
      }
      break
    case 'search':
      clients.openWindow('/listings')
      break
    default:
      clients.openWindow('/')
  }
}

// Message handling from main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
