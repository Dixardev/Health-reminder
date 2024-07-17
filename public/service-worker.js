const CACHE_NAME = 'softcoin-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/script.js',
    '/nav.html',
    '/navigation.js',
    '/dark-mode.js',
    '/login.js',
    '/login.html',
    '/register.js',
    '/register.html',
    '/friends.html',
    '/market.html',
    '/upgrades.html',
    '/tasks.html',
    '/more.html',
    '/softie.html',
    '/iconns/home.svg',
    '/iconns/tasks.svg',
    '/iconns/friends.svg',
    '/iconns/softie.svg',
    '/iconns/market.svg',
    '/iconns/more.svg'
];

// Install the service worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
    );
});

// Activate the service worker
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Fetch and cache the files
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request).then(
                    response => {
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });
                        return response;
                    }
                );
            })
    );
});
