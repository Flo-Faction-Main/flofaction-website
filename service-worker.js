// Flo Faction LLC - Service Worker for PWA Functionality
// Version 1.0.0 - Autonomous Sales System
// Provides offline capabilities, background sync, and push notifications

const CACHE_NAME = 'flofaction-v1.0.0';
const RUNTIME_CACHE = 'flofaction-runtime';
const OFFLINE_URL = '/offline.html';

// Assets to cache immediately on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/services.html',
  '/insurance-tools.html',
  '/quote.html',
  '/client-intake-form.html',
  '/adaptive-intake.html',
  '/index-voice-agent.html',
  '/hitl-dashboard.html',
  '/offline.html',
  '/styles.css',
  '/responsive.css',
  '/script.js',
  '/FloFactionCore.js',
  '/FloInsuranceModule.js',
  '/ai-chat-widget.js',
  '/manifest.json',
  '/images/logo.svg',
  '/images/icon-192.png',
  '/images/icon-512.png'
];

// Install event - cache critical assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      console.log('[Service Worker] Caching app shell');
      try {
        await cache.addAll(PRECACHE_ASSETS);
      } catch (error) {
        console.error('[Service Worker] Precaching failed:', error);
      }
    })()
  );
  
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  
  event.waitUntil(
    (async () => {
      // Enable navigation preload if supported
      if ('navigationPreload' in self.registration) {
        await self.registration.navigationPreload.enable();
      }
      
      // Clean up old caches
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter(cacheName => cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE)
          .map(cacheName => {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    })()
  );
  
  // Take control of all pages immediately
  self.clients.claim();
});

// Fetch event - Network-first strategy with cache fallback
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  event.respondWith(
    (async () => {
      try {
        // Try network first
        const networkResponse = await fetch(event.request);
        
        // Cache successful responses
        if (networkResponse && networkResponse.status === 200) {
          const cache = await caches.open(RUNTIME_CACHE);
          cache.put(event.request, networkResponse.clone());
        }
        
        return networkResponse;
      } catch (error) {
        // Network failed, try cache
        const cachedResponse = await caches.match(event.request);
        
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // If HTML page and not cached, return offline page
        if (event.request.mode === 'navigate') {
          const offlineResponse = await caches.match(OFFLINE_URL);
          if (offlineResponse) {
            return offlineResponse;
          }
        }
        
        // Return error response
        return new Response('Network error occurred', {
          status: 408,
          headers: { 'Content-Type': 'text/plain' }
        });
      }
    })()
  );
});

// Background Sync - for form submissions when offline
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Syncing:', event.tag);
  
  if (event.tag === 'sync-form-submissions') {
    event.waitUntil(syncFormSubmissions());
  }
  
  if (event.tag === 'sync-lead-data') {
    event.waitUntil(syncLeadData());
  }
});

// Push Notification Handler
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push received:', event);
  
  let data = { title: 'Flo Faction', body: 'New notification' };
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }
  
  const options = {
    body: data.body,
    icon: '/images/icon-192.png',
    badge: '/images/badge.png',
    vibrate: [200, 100, 200],
    tag: data.tag || 'default',
    requireInteraction: data.requireInteraction || false,
    data: data.data || {},
    actions: data.actions || [
      { action: 'open', title: 'Open', icon: '/images/check.png' },
      { action: 'close', title: 'Close', icon: '/images/close.png' }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification Click Handler
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/')
    );
  }
});

// Message Handler - for communication with the main app
self.addEventListener('message', (event) => {
  console.log('[Service Worker] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(RUNTIME_CACHE).then(cache => {
        return cache.addAll(event.data.urls);
      })
    );
  }
});

// Helper Functions

async function syncFormSubmissions() {
  try {
    const db = await openIndexedDB();
    const formSubmissions = await getFormSubmissions(db);
    
    for (const submission of formSubmissions) {
      try {
        const response = await fetch(submission.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(submission.data)
        });
        
        if (response.ok) {
          await deleteFormSubmission(db, submission.id);
          console.log('[Service Worker] Form synced:', submission.id);
        }
      } catch (error) {
        console.error('[Service Worker] Form sync failed:', error);
      }
    }
  } catch (error) {
    console.error('[Service Worker] Sync failed:', error);
  }
}

async function syncLeadData() {
  try {
    const db = await openIndexedDB();
    const leads = await getPendingLeads(db);
    
    for (const lead of leads) {
      try {
        const response = await fetch('/api/leads', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(lead.data)
        });
        
        if (response.ok) {
          await deleteLead(db, lead.id);
          console.log('[Service Worker] Lead synced:', lead.id);
        }
      } catch (error) {
        console.error('[Service Worker] Lead sync failed:', error);
      }
    }
  } catch (error) {
    console.error('[Service Worker] Lead sync failed:', error);
  }
}

function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('FloFactionDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains('formSubmissions')) {
        db.createObjectStore('formSubmissions', { keyPath: 'id', autoIncrement: true });
      }
      
      if (!db.objectStoreNames.contains('leads')) {
        db.createObjectStore('leads', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

function getFormSubmissions(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['formSubmissions'], 'readonly');
    const store = transaction.objectStore('formSubmissions');
    const request = store.getAll();
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function deleteFormSubmission(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['formSubmissions'], 'readwrite');
    const store = transaction.objectStore('formSubmissions');
    const request = store.delete(id);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

function getPendingLeads(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['leads'], 'readonly');
    const store = transaction.objectStore('leads');
    const request = store.getAll();
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function deleteLead(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['leads'], 'readwrite');
    const store = transaction.objectStore('leads');
    const request = store.delete(id);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

console.log('[Service Worker] Loaded successfully');
