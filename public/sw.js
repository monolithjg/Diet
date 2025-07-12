const CACHE_NAME = 'diet-calculator-v1';
const STATIC_CACHE = 'diet-calculator-static-v1';
const DYNAMIC_CACHE = 'diet-calculator-dynamic-v1';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/vite.svg',
  // Will be populated with build assets dynamically
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
      console.log('Service Worker: Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => {
      console.log('Service Worker: Installation complete');
      return self.skipWaiting();
    }).catch(error => {
      console.error('Service Worker: Installation failed', error);
    })
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Activation complete');
      return self.clients.claim();
    })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  event.respondWith(
    handleFetch(request)
  );
});

async function handleFetch(request) {
  const url = new URL(request.url);
  
  try {
    // Strategy 1: Network first for HTML (for fresh content)
    if (request.destination === 'document' || request.headers.get('accept')?.includes('text/html')) {
      return await networkFirstStrategy(request);
    }
    
    // Strategy 2: Cache first for static assets (JS, CSS, images)
    if (request.destination === 'script' || 
        request.destination === 'style' || 
        request.destination === 'image' ||
        url.pathname.includes('/assets/')) {
      return await cacheFirstStrategy(request);
    }
    
    // Strategy 3: Network first with fallback for API calls
    if (url.pathname.startsWith('/api/')) {
      return await networkFirstStrategy(request);
    }
    
    // Default: Cache first strategy
    return await cacheFirstStrategy(request);
    
  } catch (error) {
    console.error('Service Worker: Fetch failed for', request.url, error);
    
    // Return offline page for document requests
    if (request.destination === 'document') {
      const offlineResponse = await caches.match('/offline.html');
      return offlineResponse || new Response('Offline', { status: 503 });
    }
    
    // Return empty response for other failed requests
    return new Response('', { status: 503 });
  }
}

async function networkFirstStrategy(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Fallback to cache
    console.log('Service Worker: Network failed, trying cache for:', request.url);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

async function cacheFirstStrategy(request) {
  // Try cache first
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    // Update cache in background if possible
    updateCacheInBackground(request);
    return cachedResponse;
  }
  
  // Fallback to network
  const networkResponse = await fetch(request);
  
  // Cache the response
  if (networkResponse.ok) {
    const cache = await caches.open(DYNAMIC_CACHE);
    cache.put(request, networkResponse.clone());
  }
  
  return networkResponse;
}

async function updateCacheInBackground(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse);
    }
  } catch (error) {
    // Silent fail for background updates
    console.log('Service Worker: Background cache update failed for:', request.url);
  }
}

// Background sync for performance metrics
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered:', event.tag);
  
  if (event.tag === 'performance-metrics') {
    event.waitUntil(sendPerformanceMetrics());
  }
});

// Send performance metrics when network is available
async function sendPerformanceMetrics() {
  try {
    // Get stored performance metrics
    const metrics = await getStoredMetrics();
    
    if (metrics.length > 0) {
      // In a real app, send to analytics endpoint
      console.log('Service Worker: Sending performance metrics:', metrics);
      
      // Clear sent metrics
      await clearStoredMetrics();
    }
  } catch (error) {
    console.error('Service Worker: Failed to send performance metrics:', error);
  }
}

async function getStoredMetrics() {
  // In a real implementation, retrieve from IndexedDB
  return [];
}

async function clearStoredMetrics() {
  // In a real implementation, clear from IndexedDB
}

// Handle messages from main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_PERFORMANCE_METRIC') {
    cachePerformanceMetric(event.data.metric);
  }
});

async function cachePerformanceMetric(metric) {
  try {
    // In a real implementation, store in IndexedDB
    console.log('Service Worker: Caching performance metric:', metric);
  } catch (error) {
    console.error('Service Worker: Failed to cache performance metric:', error);
  }
}

// Log service worker registration status
console.log('Service Worker: Script loaded and ready');
