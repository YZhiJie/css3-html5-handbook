# Web Locks API

> 面向前端开发人员的 HTML5 高级特性参考资料 —— Web Locks 提供跨标签页/窗口的互斥机制，解决「多个标签同时读写共享状态」的竞态条件，浏览器原生、零依赖、跨 Tab 生效。

## 目录

- [1. 概念解释](#1-概念解释)
- [2. 语法说明](#2-语法说明)
- [3. 浏览器兼容性](#3-浏览器兼容性)
- [4. 使用场景示例](#4-使用场景示例)
- [5. 实际应用案例分析](#5-实际应用案例分析)
- [6. 最佳实践与常见坑](#6-最佳实践与常见坑)
- [7. 参考资料](#7-参考资料)

配套可运行示例（单文件 HTML，双击即开）：

| 示例文件 | 演示内容 |
| --- | --- |
| [index-01-web-locks.html](../../examples/html/15-web-locks/index-01-web-locks.html) | 独占锁/共享锁对比 + 排队机制 + ifAvailable + 自动释放 + 跨 Tab 读写竞态演示 |

---

## 1. 概念解释

### 1.1 解决什么问题

同一站点在多个标签页同时打开时，`localStorage` / `IndexedDB` 的读写没有天然互斥——三个标签同时修改草稿会互相覆盖，结果丢失。

Web Locks 提供**按名称排队的锁**：

- **独占锁（exclusive）**：同一名字同时只能有一个持有者，适合写操作。
- **共享锁（shared）**：同一名字可被多个持有者同时持有，但排斥独占锁，适合读操作。

锁在**当前页面上下文**范围内生效，即跨标签页/窗口/iframe（同源内）均可排队与互斥。

### 1.2 核心行为

1. 取锁成功进入回调；失败按策略排队或拒绝。
2. 回调执行完毕锁自动释放——即使页面崩溃，浏览器也保证锁的最终一致性。
3. 可以嵌套取不同名字的锁，但不能嵌套取同名锁（死锁防护）。

---

## 2. 语法说明

### 2.1 基础 API

```js
// 请求独占锁（默认策略：排队等待）
await navigator.locks.request("draft", async (lock) => {
  // 持有锁期间，其他标签请求同名锁会排队
  await saveToDB(data);
});
// 回调结束后锁自动释放
```

### 2.2 策略参数

```js
// 共享锁：允许多个读锁同时存在
await navigator.locks.request("user-data", { mode: "shared" }, async (lock) => {
  const data = await loadFromDB();
  return data;
});

// 非阻塞：如果锁正被占用，立即返回 undefined，不排队
const got = await navigator.locks.request("draft",
  { mode: "exclusive", ifAvailable: true },
  async (lock) => {
    if (!lock) return null; // 锁被占用
    await saveToDB(data);
    return "saved";
  }
);

// 插队：新请求排在队首（慎用，可能饿死旧请求）
await navigator.locks.request("draft", { mode: "exclusive", steal: true }, async (lock) => {
  // 抢走当前持有者的锁（原持有者回调里的 await 可能抛 AbortError）
});
```

### 2.3 查询状态

```js
const state = await navigator.locks.query();
console.log(state.held);    // 当前持有的锁
console.log(state.pending); // 排队中的锁
```

### 2.4 与 AbortSignal 配合

```js
const ac = new AbortController();
setTimeout(() => ac.abort(), 5000); // 5 秒超时

try {
  await navigator.locks.request("draft", { signal: ac.signal }, async (lock) => {
    await saveToDB(data);
  });
} catch (e) {
  if (e.name === "AbortError") console.log("取锁超时");
}
```

---

## 3. 浏览器兼容性

| 特性 | Chrome | Edge | Firefox | Safari |
| --- | --- | --- | --- | --- |
| Web Locks API | 69+ | 79+ | 72+ | 15.4+ |
| `ifAvailable` | 69+ | 79+ | 72+ | 15.4+ |
| `steal` | 69+ | 79+ | 72+ | 15.4+ |
| `AbortSignal` | 69+ | 79+ | 72+ | 15.4+ |

> 全部现代浏览器均已支持，无需 Polyfill。

---

## 4. 使用场景示例

### 场景 1：单标签写草稿

```js
async function saveDraft(data) {
  await navigator.locks.request("draft", async (lock) => {
    localStorage.setItem("draft", JSON.stringify(data));
  });
}
```

多标签同时保存时排队执行，最后一版写入生效，不会互相覆盖。

### 场景 2：读多写少的缓存同步

```js
// 读：共享锁，多标签并发读不阻塞
async function loadCache() {
  return navigator.locks.request("cache", { mode: "shared" }, async () => {
    return JSON.parse(localStorage.getItem("cache") || "{}");
  });
}

// 写：独占锁，排斥所有读写
async function updateCache(data) {
  await navigator.locks.request("cache", { mode: "exclusive" }, async () => {
    localStorage.setItem("cache", JSON.stringify(data));
  });
}
```

---

## 5. 实际应用案例分析

**多人协作白板（单用户多标签）**：用户开了两个标签，一个写文本、一个画图形。两者都需写入 `localStorage` 持久化草稿，再由 Service Worker 后台同步。

- 文本标签先拿到 `draft` 独占锁，写入文本内容；图形标签请求同名锁排队等待。
- 文本锁释放后图形标签进入回调，写入图形数据。
- 两个标签的操作顺序化，数据始终一致。
- 打开第三个标签只读预览——请求共享锁，与独占写锁互斥但不阻塞其他读锁。

---

## 6. 最佳实践与常见坑

1. **锁回调必须是 async**：返回的 Promise 决定锁释放时机；同步回调返回即释放，锁可能太短。
2. **不要嵌套取同名锁**：浏览器会抛 `DOMException: "Lock request is already in progress"`，防止死锁。
3. **锁名要语义化**：不要用一个全局名字锁住整站，细粒度命名（`"user:${id}:draft"`）避免无意义排队。
4. **异常处理**：回调内抛异常不会吞掉锁——锁仍正常释放，但错误会冒泡到外层 Promise。
5. **跨域 iframe 不共享**：同源策略限制，不同源的 iframe 不共享锁命名空间。
6. **Service Worker 也可用**：锁在浏览上下文全局生效，主线程与 SW 之间也能互斥。

---

## 7. 参考资料

- [MDN — Web Locks API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Locks_API)
- [W3C Web Locks](https://w3c.github.io/web-locks/)
- [caniuse — Web Locks API](https://caniuse.com/mdn-api_navigator_locks)
