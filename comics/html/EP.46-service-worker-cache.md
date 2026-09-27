# 漫画 · 第 46 话 Service Worker 缓存策略：Cache First / Network First / SWR

> 对应正文：[docs/html/17-service-worker-cache.md](../../docs/html/17-service-worker-cache.md) ｜ 原画：[EP.46-service-worker-cache.svg](./EP.46-service-worker-cache.svg)

## 登场角色

- **像素酱**：CSS 造型师，本话主角。用户抱怨地铁上打不开页面、电梯里白屏 30 秒、二次访问还慢——HTTP Cache-Control 太粗，无法按 URL 定制策略，离线等于完全不可用。
- **标签君**：HTML5 结构师，搬出 Service Worker 三大缓存策略——Cache First 静态资源、Network First API、Stale While Revalidate 列表，让应用离线可用、秒开。

## 剧情梗概

用户对加载速度的忍耐是零。地铁、电梯、弱网环境打不开，竞争对手秒开，用户流失 30%。标签君用 Service Worker 拦截网络请求，按资源类型定制缓存策略：静态资源 Cache First 秒开、API Network First 实时优先、列表 SWR 秒开+后台更新。最后 CACHE_NAME 带版本号，activate 清理旧缓存，用户永远拿新版。

## 分格解读

### 格1 · 痛点现场

用户抱怨：地铁上打不开、电梯里白屏 30 秒、二次访问还慢。HTTP Cache-Control 太粗，无法按 URL 定制策略；离线 = 完全不可用；竞争对手秒开，用户流失严重。

### 格2 · 机制登场

三大缓存策略：Cache First（有缓存用缓存，适用 CSS/JS/图片）；Network First（先走网络，失败用缓存，适用 API）；Stale While Revalidate（先返回缓存秒开，后台更新，适用新闻/商品列表）。SW 生命周期：install 预缓存 → activate 清理旧版 → fetch 拦截请求。

### 格3 · 落地收束

四大场景：静态资源 Cache First（二次访问秒开、服务器流量降 60%）、API Network First（实时优先、失败兜底）、列表 SWR（秒开+后台更新、体验最佳）、离线可用 PWA（地铁/电梯也能开）。Chrome 40+ / Safari 11.1+ / Firefox 44+ 全绿。

## 码叔划重点

1. Cache First 静态资源；Network First API；SWR 列表——别用错场景。
2. CACHE_NAME 必须带版本号，activate 清理旧缓存，否则用户永远拿旧版。
3. POST 请求不可缓存；带鉴权的 API 别缓存，换账号会串数据。

## 自测一题

**问**：为什么 CACHE_NAME 必须带版本号（如 `app-v1.2.3`），而不是固定 `app-cache`？

**答**：SW 的 activate 事件里要清理旧缓存（`caches.delete(oldName)`）。如果 CACHE_NAME 固定，新版 SW 激活时无法区分新旧缓存，会误删当前版本，导致用户拿到旧资源或缓存失效。

## 动手实验

- 注册 SW + 三大缓存策略对比 + 缓存版本管理：[examples/html/17-service-worker-cache/](../../examples/html/17-service-worker-cache/index-01-service-worker-cache.html)

## 下一话预告

第 47 话《逻辑属性进阶》——margin-left/right 在 RTL 语言下全错？inline-start/block-end 让布局自动适配书写方向，国际化不再写两套样式。
