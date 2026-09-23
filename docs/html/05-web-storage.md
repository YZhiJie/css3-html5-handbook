# Web 存储

> Web Storage（localStorage / sessionStorage）是 HTML5 提供的浏览器端键值对存储：不随 HTTP 请求发送、容量以 MB 计、API 简单同步。它取代了"什么都往 Cookie 里塞"的旧模式，是记住用户偏好、缓存接口数据、跨标签页同步状态的基础设施。本章覆盖两种存储的生命周期差异、storage 事件跨标签页同步、JSON 序列化的坑、容量与淘汰策略、与 Cookie 的对比、生产级封装（命名空间/过期时间/降级）、隐私模式限制与安全边界。

## 目录

- [1. 概念解释](#1-概念解释--是什么解决什么问题底层原理)
- [2. 语法说明](#2-语法说明--完整语法属性参数表代码片段)
- [3. 浏览器兼容性](#3-浏览器兼容性)
- [4. 使用场景示例](#4-使用场景示例)
- [5. 实际应用案例分析](#5-实际应用案例分析)
- [6. 最佳实践与常见坑](#6-最佳实践与常见坑)
- [7. 参考资料](#7-参考资料)

配套可运行示例（双击即可运行，零依赖）：

| 示例 | 说明 | 路径 |
| --- | --- | --- |
| 存储基础与序列化坑 | API 全操作 + 生命周期对比 + 容量探测 + 序列化陷阱 | ../../examples/html/05-web-storage/index-01-storage-basics.html |
| storage 事件跨标签页同步 | 双标签页主题/购物车实时同步演示 | ../../examples/html/05-web-storage/index-02-storage-event-sync.html |
| 生产级封装工具函数 | 命名空间 + 过期时间 + 内存降级 + 安全 JSON | ../../examples/html/05-web-storage/index-03-storage-wrapper.html |

## 1. 概念解释 —— 是什么、解决什么问题、底层原理

### 1.1 是什么

Web Storage 是 HTML5 定义的**浏览器本地键值对存储**，挂在 `window` 上，包含两个"长得一模一样"的对象：

| 对象 | 生命周期 | 典型用途 |
| --- | --- | --- |
| `localStorage` | **持久化**：不主动删除就永远在（关浏览器、重启电脑都在） | 主题偏好、语言设置、登录令牌、长期缓存 |
| `sessionStorage` | **会话级**：绑定"当前标签页的页面会话"，关闭标签页即销毁 | 表单草稿、一次性流程状态（多步向导）、防刷新丢数据 |

两者 API 完全一致（都实现 `Storage` 接口），都以**同源**（协议 + 域名 + 端口）为隔离单位，每个源独立一份，互不可见。

### 1.2 解决什么问题

在 Web Storage 出现之前，浏览器端持久化几乎只有 Cookie 一条路，而 Cookie 有三个硬伤：

1. **每个 HTTP 请求都自动携带**——哪怕请求的是一张根本不需要它的图片，也会白白增加请求头体积；
2. **容量极小**——单条约 4KB、每个域总数约 50 条，存不下一份表格列配置或一页缓存数据；
3. **API 繁陋**——`document.cookie` 只是一个字符串，读写都要自己解析、拼接、算过期时间。

Web Storage 的回答是：**不随请求发送、容量 5~10MB、原生 get/set API**。于是分工变得清晰——Cookie 只负责它不可替代的职责（随请求带给服务器的会话标识），纯前端状态全部交给 Web Storage。

### 1.3 底层原理

- **存储位置**：浏览器把每个源的存储数据落在磁盘上（Chrome 用 LevelDB、Firefox 用 SQLite），`setItem` 是同步写入，读到的永远是"刚刚设置"的值——没有异步回调，但也意味着**大体积读写会阻塞主线程**。
- **同源隔离**：`https://a.com` 与 `http://a.com`、`a.com` 与 `b.a.com` 互相隔离。`file://` 协议比较特殊：Chrome/Firefox 把所有本地文件视为一个共享源（localStorage 互通），Safari 则按目录处理，行为不一致——所以本地开发时不要依赖 file:// 下的隔离语义。
- **sessionStorage 的"标签页"语义**：刷新标签页数据保留；关闭标签页销毁。注意两个细节：① 通过 `window.open()` 或 `target="_blank"` 链接打开的新页面会**复制一份** sessionStorage 作为独立副本（之后两边互不影响）；② 现代浏览器的"恢复关闭的标签页"通常也会恢复 sessionStorage（浏览器崩溃恢复则不一定）。
- **storage 事件的广播机制**：任一源的数据发生变化时，浏览器向**同源的其他所有窗口/标签页**派发 `storage` 事件（**当前执行修改的页面不会收到**，这是设计使然）。它让"标签页 A 改数据、标签页 B 实时响应"成为零依赖能力。

### 1.4 与 Cookie 的本质分工

| 维度 | localStorage | sessionStorage | Cookie |
| --- | --- | --- | --- |
| 容量 | 约 5~10MB | 约 5MB | 单条约 4KB，每域约 50 条 |
| 随请求发送 | 否 | 否 | **是**（每次同源请求自动带上，含图片/接口） |
| 生命周期 | 永久（手动删） | 标签页关闭即销毁 | 可设 Expires/Max-Age，也可会话级 |
| API | 简洁同步 get/set | 同左 | 字符串拼接/解析，繁琐 |
| 服务端可写 | 否 | 否 | 是（Set-Cookie 响应头） |
| 典型角色 | 前端偏好/缓存 | 页面会话状态 | 会话凭证（需要随请求走的才用它） |

一句话：**需要服务器认识的放 Cookie，只想让浏览器记住的放 Web Storage。**

## 2. 语法说明 —— 完整语法、属性/参数表、代码片段

### 2.1 Storage 接口 API

```js
// 写入：key 和 value 都会被强制转成字符串
localStorage.setItem('theme', 'dark');

// 读取：key 不存在时返回 null（不是 undefined、也不抛错）
const theme = localStorage.getItem('theme');

// 删除单条
localStorage.removeItem('theme');

// 清空当前源的全部数据（危险操作，多标签页共用时慎用）
localStorage.clear();

// 按"下标"遍历：第 i 个 key；配合 length 可枚举所有条目
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  console.log(key, localStorage.getItem(key));
}
```

| 成员 | 签名 | 说明 |
| --- | --- | --- |
| `setItem` | `setItem(key, value)` | 写入；value 非字符串会被 `String()` 转换（对象会变成 `"[object Object]"`，见 2.2） |
| `getItem` | `getItem(key) → string \| null` | 读取；不存在返回 `null` |
| `removeItem` | `removeItem(key)` | 删除单条；key 不存在时静默成功 |
| `clear` | `clear()` | 清空当前源所有条目 |
| `key` | `key(index) → string \| null` | 返回第 index 个 key（顺序不保证稳定） |
| `length` | 只读属性 | 当前源条目总数 |

也可以像普通对象一样读写（`localStorage.theme = 'dark'`），但**不推荐**：与 API 方式行为有细微差异（如原型链上的 key），且可读性差。

### 2.2 序列化的四个经典坑（重点）

```js
const user = { name: '明', age: 18 };

// 坑 1：直接存对象，读回来是字符串 "[object Object]"
localStorage.setItem('u1', user);                 // 实际存入 "[object Object]"
localStorage.getItem('u1');                       // "[object Object]" —— 数据已损坏

// 正确：必须 JSON.stringify / JSON.parse 成对使用
localStorage.setItem('u2', JSON.stringify(user));
JSON.parse(localStorage.getItem('u2'));           // { name: '明', age: 18 }

// 坑 2：undefined 在 JSON.stringify 中"凭空消失"
JSON.stringify({ a: undefined, b: 2 });           // '{"b":2}' —— a 没了，parse 回来也没有 a

// 坑 3：循环引用直接抛 TypeError
const a = {}; a.self = a;
JSON.stringify(a);                                // TypeError: Converting circular structure to JSON

// 坑 4：null 与字符串 "null" 语义混淆
localStorage.setItem('flag', null);               // 存入字符串 "null"
localStorage.getItem('flag');                     // "null"（字符串！）
JSON.parse(null);                                 // 巧合地返回 null，容易掩盖 bug
```

结论：封装一层 `safeParse`，把"不存在"“解析失败”都收敛成明确的返回值（见 2.5 与示例 3）。

### 2.3 storage 事件（跨标签页同步）

```js
// 只在"同源的其他标签页"触发；本页自己 setItem 不会触发
window.addEventListener('storage', (e) => {
  console.log(e.key);         // 变化的 key（clear() 时为 null）
  console.log(e.oldValue);    // 旧值字符串
  console.log(e.newValue);    // 新值字符串；删除时为 null
  console.log(e.url);         // 触发变更的页面地址
  console.log(e.storageArea); // 变化的存储区对象（localStorage 或 sessionStorage）
});
```

注意两点：① 只监听 `localStorage` 的变更（sessionStorage 每个标签页独立，天然不会跨页触发）；② 值都是字符串，复杂数据要自己 `JSON.parse(e.newValue)`。

### 2.4 容量与淘汰策略

- 配额按"源"计算，主流浏览器约 **5MB（UTF-16 计数，实际按字符数）**，超出时 `setItem` 抛出 `QuotaExceededError`——**不会静默丢弃**，必须 try/catch。
- localStorage **没有自动淘汰策略**（不像 HTTP 缓存会被 LRU 清理），用户"清除站点数据"时才会删除。
- Safari 的无痕模式曾长期"允许写入但一刷新全丢"，旧版本甚至配额为 0 直接抛错——所以任何写入都要有降级预案（见 2.5）。

### 2.5 生产级封装（命名空间 + 过期时间 + 降级）

```js
// 统一封装：解决 ①对象序列化 ②key 冲突（加命名空间前缀）③过期时间 ④隐私模式/禁用降级
class SafeStorage {
  constructor(ns = 'app', storage = window.localStorage || null) {
    this.ns = ns + ':';                    // 命名空间前缀，避免多模块共用一个源时 key 冲突
    this.mem = new Map();                  // 内存兜底：storage 不可用（隐私模式被禁）时数据存内存
    try {
      const k = '__test__';
      storage.setItem(k, '1');             // 探针写入：判断 storage 真的可用（Safari 旧无痕模式写不进）
      storage.removeItem(k);
      this.storage = storage;
    } catch { this.storage = null; }       // 不可用则全部走内存，功能不中断但刷新即失
  }
  _k(key) { return this.ns + key; }        // 拼命名空间

  set(key, value, ttlMs) {                 // ttlMs：毫秒级过期时间，可选
    const payload = { v: value, e: ttlMs ? Date.now() + ttlMs : 0 }; // e=0 表示永不过期
    const raw = JSON.stringify(payload);   // 统一包一层再序列化，读时统一解
    if (!this.storage) return this.mem.set(this._k(key), raw);
    try { this.storage.setItem(this._k(key), raw); }
    catch { this.mem.set(this._k(key), raw); } // 容量满/被禁时降级内存，避免页面报错
  }
  get(key) {
    const raw = this.storage ? this.storage.getItem(this._k(key)) : this.mem.get(this._k(key));
    if (raw == null) return null;                       // 不存在
    try {
      const { v, e } = JSON.parse(raw);
      if (e && Date.now() > e) { this.remove(key); return null; } // 已过期：删掉并视为不存在
      return v;
    } catch { return null; }                            // 脏数据（手改过/版本迁移）按不存在处理
  }
  remove(key) {
    this.mem.delete(this._k(key));
    if (this.storage) this.storage.removeItem(this._k(key));
  }
}
const store = new SafeStorage('myapp');
store.set('user', { name: '明' }, 1000 * 60 * 30);      // 30 分钟后自动失效
```

## 3. 浏览器兼容性

> 以下版本为基于 caniuse 的**大致基线**，仅供参考，关键场景请以实测为准。

| 特性 | Chrome | Edge | Firefox | Safari | 移动端 | 坑点备注 |
| --- | --- | --- | --- | --- | --- | --- |
| localStorage / sessionStorage | 4 | 12 | 3.5 | 4 | iOS Safari 3.2 / Android 2.1 起全面支持 | 极旧 Android WebView 在"清除数据"后可能出现读写出错 |
| storage 事件 | 4 | 12 | 3.5 | 4 | 同上 | 本页不触发；旧 IE 不支持跨标签页可靠触发 |
| 容量（每源） | 10MB | 10MB | 10MB | 5MB | 多为 5~10MB | 以"字符数"计而非字节数，中文与英文成本相同 |
| 隐私/无痕模式 | 可用（关闭即清） | 同左 | 可用（部分版本隔离存储） | 旧版写入失败或刷新丢失 | 低端机 WebView 可能直接禁用 | **必须 try/catch + 内存降级** |
| file:// 协议 | 可用（所有本地文件共享同一 localStorage） | 同左 | 可用（按文件路径隔离） | 按目录隔离 | — | 本地双击演示跨标签页同步时注意各浏览器隔离策略不同 |

## 4. 使用场景示例

### 4.1 场景一：记住用户偏好（主题/字号）

**场景描述**：用户切换深色主题、调大字号后，下次打开页面仍然生效——典型的 localStorage 持久化。

```js
// 读取偏好：给默认值，保证首次访问也有合理表现
const theme = localStorage.getItem('theme') || 'light';
document.documentElement.dataset.theme = theme;

// 切换时写入：下次任何页面读取都能拿到
document.querySelector('#toggle').addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  localStorage.setItem('theme', next);          // localStorage 持久，重启浏览器也生效
});
```

**预期效果**：切换主题后刷新/关闭再打开页面，主题保持上次选择。完整可交互版本见 [示例 1](../../examples/html/05-web-storage/index-01-storage-basics.html)。

### 4.2 场景二：跨标签页实时同步（购物车徽标/主题）

**场景描述**：电商页与购物车页分属两个标签页，在 A 页加入购物车，B 页角标数字要立刻变——用 storage 事件零成本实现。

```js
// 标签页 A：加入购物车（只管写，不关心谁在听）
cartBtn.addEventListener('click', () => {
  const n = +localStorage.getItem('cart-count') || 0;
  localStorage.setItem('cart-count', String(n + 1));
});

// 标签页 B：监听变化并更新 UI（注意：B 自己写入时不会触发，需单独处理本页逻辑）
window.addEventListener('storage', (e) => {
  if (e.key === 'cart-count') {
    badge.textContent = e.newValue || '0';       // e.newValue 是字符串，删除时为 null
  }
});
```

**预期效果**：两个标签页同时打开示例，任一页修改数据，另一页 UI 立即同步，并显示 old/new 值对比。见 [示例 2](../../examples/html/05-web-storage/index-02-storage-event-sync.html)。

### 4.3 场景三：带过期时间的接口数据缓存

**场景描述**：城市列表、字典表这类低频变化数据，请求一次缓存 10 分钟，命中缓存就省一次网络。

```js
async function getCityList() {
  const cache = store.get('city-list');          // store 是 2.5 封装的 SafeStorage
  if (cache) return cache;                       // 未过期直接用，不发请求

  const res = await fetch('/api/cities').then(r => r.json());
  store.set('city-list', res, 10 * 60 * 1000);   // 写入并设置 10 分钟 TTL
  return res;
}
```

**预期效果**：10 分钟内反复调用只发一次请求；过期后自动重新拉取。见 [示例 3](../../examples/html/05-web-storage/index-03-storage-wrapper.html)。

### 4.4 场景四：表单草稿自动保存（sessionStorage）

**场景描述**：长表单填写到一半误刷新/误关标签，输入内容不丢；但换一个新标签重新进入时又是空白表单（草稿不该"跨会话"残留）——这正是 sessionStorage 的语义。

```js
const form = document.querySelector('#profile-form');

// 输入即保存：防抖 500ms，避免每个按键都写盘
let timer;
form.addEventListener('input', (e) => {
  clearTimeout(timer);
  timer = setTimeout(() => {
    const draft = Object.fromEntries(new FormData(form));
    sessionStorage.setItem('draft:profile', JSON.stringify(draft));
  }, 500);
});

// 页面加载时恢复草稿；提交成功后记得 removeItem 清掉
const draft = sessionStorage.getItem('draft:profile');
if (draft) Object.entries(JSON.parse(draft)).forEach(([k, v]) => form.elements[k].value = v);
```

**预期效果**：填写一半刷新页面，内容自动回填；关闭标签页后重新打开，草稿已随会话销毁。

### 4.5 场景五：容量探测与写入保护

**场景描述**：写入大字符串前先探测剩余空间，或写入失败时优雅提示，而不是让 QuotaExceededError 直接打断业务。

```js
function estimateQuota() {
  let bytes = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    bytes += (k.length + (localStorage.getItem(k) || '').length) * 2; // UTF-16 每字符约 2 字节
  }
  return bytes;                                  // 粗略估算已用字节数
}

function safeSet(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (err) {
    // 容量满或被禁用： here 降级策略——清理过期项后重试，仍失败则提示用户
    console.warn('写入失败', err.name);
    return false;
  }
}
```

**预期效果**：在示例 1 中点击"压测容量"可看到逐步写入直至抛错被捕获的全过程。

## 5. 实际应用案例分析

### 5.1 中后台系统：用户偏好与表格列配置持久化

**背景**：某运营中后台有 40+ 张可配置表格（列显隐、列顺序、每页条数、筛选条件），用户每次进页面都要重配，投诉集中。

**方案选型**：
- 用 `localStorage` + 命名空间（`app:table-prefs:{userId}:{tableId}`）保存列配置 JSON；key 里带 userId，避免同一台电脑切换账号后配置串号。
- 写入防抖 300ms：列宽拖拽会高频触发，直接写会造成主线程卡顿。
- 版本号字段：配置结构升级时（如新增列字段），读到的旧版本数据按默认值重建，而不是解析出错白屏。

**踩坑与解决**：
1. **多标签页配置互踩**——用户开了两个标签页分别调列配置，后写覆盖先写。用 storage 事件监听其他页的配置变化做"最后写入胜出 + 提示刷新"，避免静默丢失。
2. **clear() 误伤**——早期某模块"重置本表配置"的实现调用了 `localStorage.clear()`，把登录态和全部偏好清空。规范后禁止业务代码直接调 clear，统一走封装的 `remove(prefix)`。
3. **隐私模式丢失**——部分用户开启严格隐私浏览，写入抛异常导致页面报错。封装层 try/catch 后降级内存 Map，功能当次会话仍可用。

### 5.2 Web 端 IM：多标签页登录态与消息同步

**背景**：IM 页面常被用户复制成多个标签页，旧方案里 A 标签页退出登录，B 标签页还继续收发消息，出现"幽灵会话"。

**方案选型**：登录态/token 存 localStorage；退出时 `removeItem('token')` 并写入一个"登出广播" key（值为时间戳）；所有标签页监听 storage 事件，发现 token 变化或广播即跳转登录页。高频消息体**不**走 storage（写入是同步的，消息一多会卡主线程），而是用 `BroadcastChannel`（不可用时降级 storage 事件）。

**踩坑分析**：
1. storage 事件的 `newValue` 是字符串，token 解析要收敛到一个工具函数，避免各处 `JSON.parse` 写法不一致。
2. `oldValue/newValue` 对比时要考虑"值实际没变但写了一次"（重复写相同值**不会**触发事件，这是好事，可用来去重）。
3. 移动端 WebView 里 storage 事件可能不可靠，最终兜底仍是轮询 + 接口 401 跳登录。

## 6. 最佳实践与常见坑

1. **永远 JSON.stringify/parse 成对封装**，禁止裸 setItem 存对象——否则读回来是 `"[object Object]"`。
2. **所有 setItem 必须 try/catch**：容量满（QuotaExceededError）与隐私模式禁用都会抛异常，未捕获会导致后续代码中断。
3. **不在 Web Storage 里存敏感信息**（密码、支付凭证、长期有效的 token）：XSS 一旦发生，`localStorage` 里的东西对攻击者完全透明可读；Cookie 可配 HttpOnly 而 Storage 不能。
4. **key 加命名空间前缀**（如 `app:module:key`）：多模块共存一个源，裸 key 极易冲突；也便于按前缀批量清理。
5. **需要过期时间就自己实现**（包一层 `{v, expireAt}`），Storage 原生没有 TTL；过期数据要顺带 removeItem 防止堆积。
6. **大对象（>100KB）慎入 Storage**：同步 API 会阻塞主线程，且会长期占用配额；大二进制用 IndexedDB 或 Cache API。
7. **不要用 Storage 传"事件流"**：storage 事件只保证"变了就通知"，不保证顺序与可靠性；严格消息通道用 BroadcastChannel / Worker。
8. **clear() 是核弹级操作**：会清掉同源全部数据（包括其他应用的模块数据），业务代码一律只 removeItem 自己的命名空间。
9. **校验读回的数据**：用户手动改过、版本升级都可能出现脏数据，`JSON.parse` 必须 try/catch 并给默认值。
10. **file:// 下行为不可依赖**：Chrome 把所有本地文件当一个源，做本地演示没问题，但不要据此设计隔离逻辑；正式环境判断同源仍以协议 + 域名 + 端口为准。
11. **多标签页覆盖**：并发写同一 key 是"最后写入胜出"，对一致性有要求时配合 storage 事件做冲突提示或集中到服务端。
12. **降级要"静默但有痕"**：降级内存后功能仍可用但刷新即失，应上报埋点，而不是让用户莫名丢数据。

## 7. 参考资料

- MDN — Web Storage API 概述：<https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Storage_API>
- MDN — Window.localStorage：<https://developer.mozilla.org/zh-CN/docs/Web/API/Window/localStorage>
- MDN — Window.sessionStorage：<https://developer.mozilla.org/zh-CN/docs/Web/API/Window/sessionStorage>
- MDN — storage 事件：<https://developer.mozilla.org/zh-CN/docs/Web/API/Window/storage_event>
- MDN — Web Storage API 使用指南（含隐私模式说明）：<https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API>
- WHATWG HTML 标准 — Web storage 章节：<https://html.spec.whatwg.org/multipage/webstorage.html>
- caniuse — Web Storage 兼容性数据：<https://caniuse.com/namevalue-storage>
- MDN — Cookie 与 Storage 选型对比：<https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Cookie>
