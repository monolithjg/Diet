import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom';
import { router } from './routes'; 
import { onCLS, onFCP, onLCP, onTTFB, onINP } from 'web-vitals'
import './index.css'

// Register service worker for caching and performance
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      })
      
      console.log('Service Worker registered successfully:', registration)
      
      // Listen for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // New content available, show update notification
                console.log('New content available, please refresh!')
              } else {
                // Content cached for first time
                console.log('Content cached for offline use')
              }
            }
          })
        }
      })
    } catch (error) {
      console.error('Service Worker registration failed:', error)
    }
  })
}

// Initialize performance monitoring
function initializePerformanceMonitoring() {
  // Web Vitals monitoring with reporting
  const reportWebVital = (metric: any) => {
    console.log('Web Vital:', metric)
    
    // Send to service worker for batching
    if (navigator.serviceWorker?.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CACHE_PERFORMANCE_METRIC',
        metric: {
          name: metric.name,
          value: metric.value,
          rating: metric.rating,
          timestamp: Date.now(),
          url: window.location.href
        }
      })
    }
    
    // Optional: Send to analytics service
    // In production, you would send this to your analytics endpoint
    if (import.meta.env.PROD) {
      // Example: gtag('event', metric.name, { value: metric.value })
    }
  }

  // Monitor all Core Web Vitals
  onCLS(reportWebVital)
  onINP(reportWebVital)
  onFCP(reportWebVital)
  onLCP(reportWebVital)
  onTTFB(reportWebVital)
  
  // Performance monitoring is now active
  console.log('Web Vitals monitoring initialized')
}

// Performance mark for initial load
performance.mark('app-start')

// Initialize performance monitoring
initializePerformanceMonitoring()

// Render the application
const root = createRoot(document.getElementById('root')!)

root.render(
  <RouterProvider router={router} />
)

// Performance mark for app rendered
performance.mark('app-rendered')
performance.measure('app-initialization', 'app-start', 'app-rendered')

// Log initialization performance
const initMeasure = performance.getEntriesByName('app-initialization', 'measure')[0]
if (initMeasure) {
  console.log(`App initialization took ${initMeasure.duration.toFixed(2)}ms`)
}
