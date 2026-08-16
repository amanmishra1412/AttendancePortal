const CACHE_NAME = 'attendancepro-v1';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/maskable-icon-192x192.png',
  '/icons/maskable-icon-512x512.png',
  '/icons/apple-touch-icon.png',
  '/icons/icon.svg',
  '/favicon.ico',
];

// Install Event - Precache core static shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
      .catch((err) => {
        console.warn('[SW] Precache failed:', err);
      })
  );
});

// Activate Event - Clean up outdated caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              return caches.delete(key);
            }
          })
        )
      )
      .then(() => self.clients.claim())
  );
});

// Fetch Event - Strategic Routing
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Non-GET requests (POST, PUT, PATCH, DELETE): STRICTLY NETWORK ONLY.
  // Never cache or spoof punch-in, punch-out, login, or any mutation.
  if (request.method !== 'GET') {
    return;
  }

  // 2. API requests & backend calls: STRICTLY NETWORK ONLY.
  // Ensures fresh attendance status, live GPS calculations, and auth tokens.
  if (
    url.pathname.startsWith('/api') ||
    url.hostname.includes('onrender.com') ||
    url.hostname.includes('localhost') && url.port === '5000'
  ) {
    return;
  }

  // 3. Static Assets (_next/static, icons, fonts, images): Stale-While-Revalidate
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.ico') ||
    url.pathname.endsWith('.woff2')
  ) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(request);
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // 4. HTML Page Navigations: Network-First with Cache Fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          const cache = await caches.open(CACHE_NAME);
          const cachedResponse = await cache.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          // Fallback to cached root shell if specific page is not cached
          const shellFallback = await cache.match('/');
          if (shellFallback) {
            return shellFallback;
          }
          return new Response(
            `<!DOCTYPE html>
            <html lang="en">
              <head>
                <meta charset="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <title>AttendancePro - Offline</title>
                <style>
                  body { font-family: system-ui, -apple-system, sans-serif; background: #f8fafc; color: #0f172a; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; padding: 20px; text-align: center; box-sizing: border-box; }
                  .card { background: white; padding: 32px; border-radius: 24px; border: 1px solid #e2e8f0; max-width: 400px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
                  h1 { font-size: 20px; font-weight: 800; margin-bottom: 8px; color: #1e293b; }
                  p { font-size: 13px; color: #64748b; line-height: 1.5; margin-bottom: 20px; }
                  .badge { display: inline-block; background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; font-weight: 700; font-size: 11px; padding: 4px 12px; border-radius: 9999px; margin-bottom: 16px; }
                  button { background: #4f46e5; color: white; border: none; padding: 10px 20px; border-radius: 12px; font-weight: 600; font-size: 13px; cursor: pointer; }
                </style>
              </head>
              <body>
                <div class="card">
                  <div class="badge">Offline Mode</div>
                  <h1>No Internet Connection</h1>
                  <p>AttendancePro requires an active internet connection to communicate securely with the server and mark attendance.</p>
                  <button onclick="window.location.reload()">Retry Connection</button>
                </div>
              </body>
            </html>`,
            { headers: { 'Content-Type': 'text/html' } }
          );
        })
    );
    return;
  }
});

// Message listener for client coordination
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
