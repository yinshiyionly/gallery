// Service Worker for Gallery PWA
const CACHE_NAME = 'gallery-v1';
const STATIC_CACHE = 'gallery-static-v1';
const DYNAMIC_CACHE = 'gallery-dynamic-v1';
const IMAGE_CACHE = 'gallery-images-v1';

// 需要缓存的静态资源
const STATIC_ASSETS = [
  '/',
  '/gallery',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// 图片缓存策略配置
const IMAGE_CACHE_CONFIG = {
  maxEntries: 100,
  maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
  purgeOnQuotaError: true
};

// 安装事件
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Installed successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Installation failed', error);
      })
  );
});

// 激活事件
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // 删除旧版本的缓存
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== IMAGE_CACHE) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated successfully');
        return self.clients.claim();
      })
  );
});

// 获取请求事件
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // 跳过非 GET 请求
  if (request.method !== 'GET') {
    return;
  }
  
  // 跳过 Chrome 扩展请求
  if (url.protocol === 'chrome-extension:') {
    return;
  }
  
  // 图片请求处理
  if (isImageRequest(request)) {
    event.respondWith(handleImageRequest(request));
    return;
  }
  
  // API 请求处理
  if (isApiRequest(request)) {
    event.respondWith(handleApiRequest(request));
    return;
  }
  
  // 静态资源请求处理
  if (isStaticAsset(request)) {
    event.respondWith(handleStaticRequest(request));
    return;
  }
  
  // 页面请求处理
  event.respondWith(handlePageRequest(request));
});

// 判断是否为图片请求
function isImageRequest(request) {
  return request.destination === 'image' || 
         /\.(jpg|jpeg|png|gif|webp|avif|svg)$/i.test(request.url);
}

// 判断是否为 API 请求
function isApiRequest(request) {
  return request.url.includes('/api/');
}

// 判断是否为静态资源
function isStaticAsset(request) {
  return request.url.includes('/_next/static/') ||
         request.url.includes('/static/') ||
         request.url.includes('/icons/') ||
         request.url.includes('/manifest.json');
}

// 处理图片请求 - 缓存优先策略
async function handleImageRequest(request) {
  try {
    const cache = await caches.open(IMAGE_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('Service Worker: Serving image from cache', request.url);
      return cachedResponse;
    }
    
    console.log('Service Worker: Fetching image from network', request.url);
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // 克隆响应用于缓存
      const responseClone = networkResponse.clone();
      
      // 异步缓存，不阻塞响应
      cache.put(request, responseClone).then(() => {
        // 检查缓存大小并清理
        cleanImageCache();
      });
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Service Worker: Image request failed', error);
    
    // 返回占位符图片
    return new Response(
      '<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f3f4f6"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9ca3af">图片加载失败</text></svg>',
      {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'no-cache'
        }
      }
    );
  }
}

// 处理 API 请求 - 网络优先策略
async function handleApiRequest(request) {
  try {
    console.log('Service Worker: Fetching API from network', request.url);
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // 缓存成功的 API 响应
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Service Worker: API request failed, trying cache', error);
    
    // 网络失败时尝试从缓存获取
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('Service Worker: Serving API from cache', request.url);
      return cachedResponse;
    }
    
    // 返回离线响应
    return new Response(
      JSON.stringify({
        error: '网络连接失败，请检查网络设置',
        offline: true
      }),
      {
        status: 503,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}

// 处理静态资源请求 - 缓存优先策略
async function handleStaticRequest(request) {
  try {
    const cache = await caches.open(STATIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('Service Worker: Serving static asset from cache', request.url);
      return cachedResponse;
    }
    
    console.log('Service Worker: Fetching static asset from network', request.url);
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Service Worker: Static asset request failed', error);
    throw error;
  }
}

// 处理页面请求 - 网络优先，缓存回退
async function handlePageRequest(request) {
  try {
    console.log('Service Worker: Fetching page from network', request.url);
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // 缓存页面响应
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Service Worker: Page request failed, trying cache', error);
    
    // 尝试从缓存获取
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('Service Worker: Serving page from cache', request.url);
      return cachedResponse;
    }
    
    // 返回离线页面
    return caches.match('/') || new Response(
      `<!DOCTYPE html>
      <html>
        <head>
          <title>离线模式</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; text-align: center; padding: 50px; }
            .offline { color: #666; }
          </style>
        </head>
        <body>
          <div class="offline">
            <h1>🔌 离线模式</h1>
            <p>当前网络不可用，请检查网络连接后重试。</p>
            <button onclick="window.location.reload()">重新加载</button>
          </div>
        </body>
      </html>`,
      {
        headers: {
          'Content-Type': 'text/html'
        }
      }
    );
  }
}

// 清理图片缓存
async function cleanImageCache() {
  try {
    const cache = await caches.open(IMAGE_CACHE);
    const requests = await cache.keys();
    
    if (requests.length > IMAGE_CACHE_CONFIG.maxEntries) {
      // 删除最旧的缓存项
      const excessCount = requests.length - IMAGE_CACHE_CONFIG.maxEntries;
      const requestsToDelete = requests.slice(0, excessCount);
      
      await Promise.all(
        requestsToDelete.map(request => cache.delete(request))
      );
      
      console.log(`Service Worker: Cleaned ${excessCount} old image cache entries`);
    }
  } catch (error) {
    console.error('Service Worker: Failed to clean image cache', error);
  }
}

// 消息处理
self.addEventListener('message', (event) => {
  const { type, payload } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'CACHE_IMAGES':
      if (payload && payload.urls) {
        cacheImages(payload.urls);
      }
      break;
      
    case 'CLEAR_CACHE':
      clearAllCaches();
      break;
      
    default:
      console.log('Service Worker: Unknown message type', type);
  }
});

// 预缓存图片
async function cacheImages(urls) {
  try {
    const cache = await caches.open(IMAGE_CACHE);
    await Promise.all(
      urls.map(async (url) => {
        try {
          const response = await fetch(url);
          if (response.ok) {
            await cache.put(url, response);
          }
        } catch (error) {
          console.warn('Service Worker: Failed to cache image', url, error);
        }
      })
    );
    console.log('Service Worker: Cached images successfully');
  } catch (error) {
    console.error('Service Worker: Failed to cache images', error);
  }
}

// 清除所有缓存
async function clearAllCaches() {
  try {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(cacheName => caches.delete(cacheName))
    );
    console.log('Service Worker: All caches cleared');
  } catch (error) {
    console.error('Service Worker: Failed to clear caches', error);
  }
}

// 后台同步
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  console.log('Service Worker: Performing background sync');
  // 这里可以添加后台同步逻辑，比如上传离线时的操作
}

// 推送通知
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      vibrate: [100, 50, 100],
      data: data.data,
      actions: data.actions
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// 通知点击处理
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action) {
    // 处理操作按钮点击
    console.log('Service Worker: Notification action clicked', event.action);
  } else {
    // 处理通知本身的点击
    event.waitUntil(
      clients.openWindow(event.notification.data?.url || '/')
    );
  }
});