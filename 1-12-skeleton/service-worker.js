var cacheName = 'weatherWPA';
var dataCacheName = 'weatherData';
var weatherAPIUrlBase = 'https://publicdata-weather.firebaseio.com/';

var filesToCache = [
  './',
  './index.html',
  './scripts/app.js',
  './styles/main.css',
  './images/clear.png',
  './images/cloudy-scattered-showers.png',
  './images/cloudy.png',
  './images/fog.png',
  './images/ic_add_white_24px.svg',
  './images/ic_refresh_white_24px.svg',
  './images/partly-cloudy.png',
  './images/rain.png',
  './images/scattered-showers.png',
  './images/sleet.png',
  './images/snow.png',
  './images/thunderstorm.png',
  './images/wind.png',
  '../node_modules/localforage/dist/localforage.js'
];

//Listen to event install on Service Work first register
self.addEventListener('install', function (e) {
  console.log('[ServiceWorker] Install');
  e.waitUntil(
    caches.open(cacheName)
    .then(function (cache) {
      console.log('[ServiceWorker] Caching app shell');
      return cache.addAll(filesToCache);
    })
    .catch(function (error) {
      console.log('[ServiceWorker] Install ERROR', error);
    })
  );
});

//Clean unused files from cache
self.addEventListener('activate', function (e) {
  console.log('[ServiceWorker] Activate');
  e.waitUntil(
    caches.keys().then(function (keyList) {
      return Promise.all(keyList.map(function (key) {
        if (key !== cacheName && key !== dataCacheName) {
          console.log('[ServiceWorker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
    .catch(function (error) {
      console.log('[ServiceWorker] Activate ERROR', error);
    })
  );
});

//Fetch
self.addEventListener('fetch', function (e) {
  console.log('[Service Worker] Fetch', e.request.url);
  if (e.request.url.startsWith(weatherAPIUrlBase)) {
    e.respondWith(
      e.fetch(e.request)
      .then(function(response) {
        return caches.open(dataCacheName).then(function(cache) {
          cache.put(e.request.url, response.clone());
          console.log('[Service worker] Fetch & Saved data');
          return response;
        });
      })
    );
  } else {
    e.respondWith(
      caches.match(e.request).then(function (response) {
        return response || fetch(e.request);
      })
      .catch(function (error) {
        console.log('[ServiceWorker] Fetch ERROR', error);
      })
    );
  }
});