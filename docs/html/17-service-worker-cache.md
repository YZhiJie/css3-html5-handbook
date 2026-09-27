# Service Worker 缓存策略

> 面向前端开发人员的 HTML5 高级特性参考资料 —— Service Worker 是浏览器在后台运行的脚本，拦截网络请求、管理缓存、实现离线可用。本章聚焦「缓存策略」：Cache First、Network First、Stale While Revalidate 三件套，以及资源预缓存与运行时缓存的边界。

## 目录

- [1. 概念解释 —— 是什么、解决什么问题、底层原理](#1-概念解释)
- [2. 语法说明 —— 完整语法、属性/参数表、代码片段](#2-语法说明)
- [3. 浏览器兼容性](#3-浏览器兼容性)
- [4. 使用场景示例](#4-使用场景示例)
- [5. 实际应用案例分析](#5-实际应用案例分析)
- [6. 最佳实践与常见坑](#6-最佳实践与常见坑)
- [7. 参考资料](#7-参考资料)

配套可运行示例（单文件 HTML，双击即开）：

| 示例文件 | 演示内容 |
| --- | --- |
| [index-01-service-worker-cache.html](../../examples/html/17-service-worker-cache/index-01-service-worker-cache.html) | 注册 SW + 三大缓存策略对比 + 离线演示 + 缓存版本管理 |

---

## 1. 概念解释

### 1.1 Service Worker 是什么

Service Worker（SW）是浏览器在独立线程运行的脚本，充当「网络代理」：

- 拦截页面发出的所有网络请求（fetch 事件）
- 读写 Cache Storage（caches API）
- 可离线返回缓存内容，实现 PWA 离线可用

生命周期：install → activate → fetch（运行中）→ 新版 install → waiting → 旧版卸载。

### 1.2 解决什么问题

- **离线可用**：地铁、电梯、弱网环境也能打开应用
- **加速加载**：静态资源走缓存，秒开
- **减少服务器压力**：重复资源不重复请求
- **精细控制**：比 HTTP Cache-Control 更灵活，可按 URL、请求方法、资源类型定制策略

### 1.3 三大缓存策略

| 策略 | 行为 | 适用场景 |
| --- | --- | --- |
| Cache First | 有缓存用缓存，无缓存走网络 | 静态资源（CSS/JS/图片） |
| Network First | 先走网络，失败用缓存 | API 数据、实时性要求高的内容 |
| Stale While Revalidate | 先返回缓存，同时后台更新缓存 | 新闻列表、商品列表 |

---

## 2. 语法说明

### 2.1 注册 Service Worker

```js
// 主线程（页面）
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js', { scope: '/' })
    .then(reg => console.log('SW 注册成功', reg))
    .catch(err => console.error('SW 注册失败', err));
}
```

### 2.2 install 事件：预缓存静态资源

```js
// sw.js
const CACHE_NAME = 'app-v1';
const PRECACHE = [
  '/',
  '/styles/main.css',
  '/scripts/app.js',
  '/images/logo.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()) // 立即激活
  );
});
```

### 2.3 activate 事件：清理旧缓存

```js
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(names =>
      Promise.all(
        names.filter(n => n !== CACHE_NAME)
          .map(n => caches.delete(n))
      )
    ).then(() => self.clients.claim()) // 接管所有客户端
  );
});
```

### 2.4 fetch 事件：三大缓存策略

```js
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // 静态资源：Cache First
  if (url.pathname.match(/\.(css|js|png|jpg|svg)$/)) {
    e.respondWith(
      caches.match(e.request)
        .then(cached => cached || fetch(e.request).then(resp => {
          const clone = resp.clone();
          caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
          return resp;
        }))
    );
    return;
  }

  // API：Network First
  if (url.pathname.startsWith('/api/')) {
    e.respondWith(
      fetch(e.request)
        .then(resp => {
          const clone = resp.clone();
          caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
          return resp;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // 其他：Stale While Revalidate
  e.respondWith(
    caches.match(e.request).then(cached => {
      const fetchPromise = fetch(e.request).then(resp => {
        const clone = resp.clone();
        caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
        return resp;
      });
      return cached || fetchPromise;
    })
  );
});
```

---

## 3. 浏览器兼容性

- **Chrome / Edge**：40+（2015-04）
- **Firefox**：44+（2016-01）
- **Safari**：11.1+（2018-03）

所有现代浏览器均支持。iOS Safari 11.1-12 有部分限制（无法后台同步），13+ 完善。

---

## 4. 使用场景示例

### 场景 1：静态站点离线可用

```js
// 预缓存所有页面 + 资源
const PRECACHE = ['/', '/about', '/contact', '/main.css', '/app.js'];

// fetch 事件统一走 Cache First
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
```

### 场景 2：电商 API 数据（Network First）

```js
// 商品列表 API 走 Network First，失败返回缓存
self.addEventListener('fetch', (e) => {
  if (e.request.url.includes('/api/products')) {
    e.respondWith(
      fetch(e.request)
        .then(resp => {
          const clone = resp.clone();
          caches.open('api-v1').then(c => c.put(e.request, clone));
          return resp;
        })
        .catch(() => caches.match(e.request))
    );
  }
});
```

### 场景 3：新闻列表（Stale While Revalidate）

```js
// 先返回缓存（秒开），后台更新
self.addEventListener('fetch', (e) => {
  if (e.request.url.includes('/api/news')) {
    e.respondWith(
      caches.match(e.request).then(cached => {
        const fetchPromise = fetch(e.request).then(resp => {
          const clone = resp.clone();
          caches.open('news-v1').then(c => c.put(e.request, clone));
          return resp;
        });
        return cached || fetchPromise;
      })
    );
  }
});
```

---

## 5. 实际应用案例分析

### 案例：文档站点 PWA 化

**背景**：技术文档站点，用户反馈地铁上打不开，要求离线可用。

**改造方案**：

1. **预缓存**：install 时缓存所有 HTML/CSS/JS/图片（约 2MB）
2. **运行时缓存**：字体文件、第三方 CDN 资源走 Cache First
3. **API 数据**：搜索接口走 Network First，失败返回缓存结果
4. **版本管理**：CACHE_NAME 带版本号（`docs-v1.2.3`），activate 时清理旧版本

**关键代码**：

```js
const VERSION = 'v1.2.3';
const CACHE_NAME = `docs-${VERSION}`;

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      cache.addAll(['/', '/main.css', '/app.js', '/logo.png'])
    )
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(names =>
      Promise.all(
        names.filter(n => n.startsWith('docs-') && n !== CACHE_NAME)
          .map(n => caches.delete(n))
      )
    )
  );
});
```

**收益**：离线可访问、二次访问秒开、服务器流量下降 60%。

---

## 6. 最佳实践与常见坑

1. **缓存版本必须带版本号**：CACHE_NAME 用 `app-v1.2.3` 格式，activate 时清理旧版本，否则用户永远拿到旧缓存。
2. **POST 请求不可缓存**：Cache Storage 只支持 GET，POST/PUT/DELETE 会直接报错。
3. **Opaque Response 占空间**：跨域资源（无 CORS）返回 opaque response，无法读取内容但可缓存，占用配额（通常 50MB/域名）。
4. **skipWaiting 与 clients.claim 慎用**：新版 SW 立即接管可能导致页面资源版本不一致，生产环境建议等用户刷新。
5. **调试技巧**：Chrome DevTools → Application → Service Workers 可强制更新、查看缓存、模拟离线。
6. **不要缓存带鉴权的 API**：`/api/user/profile` 缓存后，换账号登录可能看到旧数据。

---

## 7. 参考资料

- [MDN: Service Worker API](https://developer.mozilla.org/zh-CN/docs/Web/API/Service_Worker_API)
- [Can I use: Service Workers](https://caniuse.com/serviceworkers)
- [web.dev: Service Worker lifecycle](https://web.dev/articles/service-worker-lifecycle)
- [Google Workbox](https://developer.chrome.com/docs/workbox)
