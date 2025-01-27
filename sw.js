// 定义缓存名称和要缓存的静态资源
const CACHE_NAME = "cache-v1"; // 缓存版本号
const ASSETS = [
    "/", // 网站根路径
    "/index.html", // 主页面
    "/android-chrome-512x512.png", // Logo
    "/weixin.jpg", // 二维码图片
    "/favicon.ico", // 网站图标
    "/site.manifest", // PWA Manifest
];

// **安装阶段**: 缓存静态资源
self.addEventListener("install", event => {
    console.log("[Service Worker] Installing Service Worker...");
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log("[Service Worker] Caching App Shell...");
            return cache.addAll(ASSETS); // 缓存资源
        })
    );
});

// **激活阶段**: 清理旧缓存
self.addEventListener("activate", event => {
    console.log("[Service Worker] Activating Service Worker...");
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log(
                            "[Service Worker] Removing old cache:",
                            cache
                        );
                        return caches.delete(cache); // 删除旧缓存
                    }
                })
            );
        })
    );
});

// **拦截网络请求**: 优先返回缓存资源
self.addEventListener("fetch", event => {
    console.log("[Service Worker] Fetching resource:", event.request.url);
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            // 如果有缓存，返回缓存；否则发起网络请求
            return (
                cachedResponse ||
                fetch(event.request).then(networkResponse => {
                    // 动态缓存新的资源
                    return caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    });
                })
            );
        })
    );
});
