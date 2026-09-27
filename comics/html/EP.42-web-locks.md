# 漫画 · 第 42 话 Web Locks API：跨标签页互斥锁

> 对应正文：[docs/html/15-web-locks.md](../../docs/html/15-web-locks.md) ｜ 原画：[EP.42-web-locks.svg](./EP.42-web-locks.svg)

## 登场角色

- **像素酱**：CSS 造型师，本话苦主。用户开了三个标签同时编辑草稿，localStorage 被写成一锅粥——后写入的覆盖先写入的，数据丢失投诉不断。
- **标签君**：HTML5 结构师，掏出浏览器原生锁——`navigator.locks.request()` 按名称排队，独占锁写、共享锁读、回调结束自动释放，跨标签页/窗口/iframe 同源生效。

## 剧情梗概

像素酱被「多标签竞态」折磨：标签 A 写草稿、标签 B 同时写、Service Worker 也在抢，数据互相覆盖。标签君引入 Web Locks——`navigator.locks.request('draft', async () => { ... })` 一行搞定互斥，回调结束锁自动释放，页面崩溃浏览器也保证最终一致性。共享锁 `mode: 'shared'` 让多标签并发读不阻塞；`ifAvailable: true` 拿不到立即返回不排队；`AbortSignal` 防止无限等待。

## 分格解读

### 格1 · 痛点现场

同一站点三个标签同时打开，localStorage 写操作互相覆盖。IndexedDB 异步竞态、轮询同步顺序乱、Service Worker 也来抢——自己实现跨 tab 锁几乎不可能。

### 格2 · 机制登场

`navigator.locks.request('draft', async () => { ... })` 请求独占锁，同名锁同时只有一个持有者，回调结束自动释放。`mode: 'shared'` 共享锁允许多个读并发；`ifAvailable: true` 非阻塞尝试；`signal` 支持 AbortSignal 超时。

### 格3 · 落地收束

四大场景：单标签写草稿（排队写入保一致）、读多写少缓存（shared 并发读 + exclusive 独占写）、非阻塞轮询（ifAvailable 拿不到就跳过）、AbortSignal 超时（防无限排队卡死）。记住边界：**不要嵌套取同名锁**，浏览器会抛异常防死锁。

## 码叔划重点

1. 独占锁同时只一个持有者；共享锁并发读、排斥写——读多写少用 shared。
2. 回调结束锁自动释放；页面崩溃浏览器也保证最终一致性。
3. 不要嵌套取同名锁；锁名要语义化（"user:123:draft"）避免无意义排队。

## 自测一题

**问**：为什么 Web Locks 的回调必须是 async 函数？同步回调会有什么问题？

**答**：锁的释放时机由回调返回的 Promise 决定——Promise resolve 时锁才释放。同步回调立即返回，锁在同步代码执行完就释放了，后续异步操作（如 `await fetch`）实际在无锁状态下运行，互斥失效。必须 `async` 并在回调内 `await` 所有异步操作。

## 动手实验

- 独占锁/共享锁对比 + ifAvailable 非阻塞 + 跨标签页竞态演示 + AbortSignal 超时：[examples/html/15-web-locks/](../../examples/html/15-web-locks/index-01-web-locks.html)

## 下一话预告

第 43 话《text-wrap 与 field-sizing》——`text-wrap: balance` 标题两行均分、`field-sizing: content` 输入框随内容自动伸缩、`interpolate-size` 解锁 auto 动画，排版细节原生搞定。
