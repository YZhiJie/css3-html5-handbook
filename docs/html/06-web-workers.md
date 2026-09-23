# Web Workers

> Web Worker 让 JS 拥有真正的多线程能力：把耗时计算丢到后台线程，主线程继续流畅响应点击与动画。它通过消息传递（结构化克隆）与主线程通信，不能碰 DOM，却能把页面从"一个长任务全卡死"中解放出来。本章覆盖三种 Worker 的区别、postMessage 与结构化克隆、Transferable 零拷贝转移、Blob URL 内联 Worker（file:// 双击可用）、Promise 化通信封装、典型场景与错误处理。

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
| Blob 内联 Worker 与主线程阻塞对比 | 主线程长任务卡死动画 vs Worker 后台计算 | ../../examples/html/06-web-workers/index-01-blob-worker-calc.html |
| Transferable 与图片像素处理 | ArrayBuffer 转移所有权 + Worker 内灰度/反色 | ../../examples/html/06-web-workers/index-02-transferable-pixels.html |
| Promise 化封装与批量任务 | 双向通信 Promise 化 + 排序任务队列 + 错误传递 | ../../examples/html/06-web-workers/index-03-promise-worker.html |

## 1. 概念解释 —— 是什么、解决什么问题、底层原理

### 1.1 是什么

Web Worker 是浏览器提供的**后台线程**机制：`new Worker(url)` 会启动一个独立于页面主线程的 JS 执行环境，拥有自己的全局作用域（`DedicatedWorkerGlobalScope`，没有 `window`/`document`）。主线程与 Worker 之间**不共享任何变量**，只能通过 `postMessage` 传递消息（数据被序列化复制）。

三种 Worker 的定位：

| 类型 | 生命周期 | 归属 | 典型用途 |
| --- | --- | --- | --- |
| **Dedicated Worker**（本章主角） | 随创建它的页面关闭而终止 | 只属于创建它的那个页面 | 重计算、图像处理、数据解析 |
| **Shared Worker** | 多个同源页面共享，最后一个页面关闭才销毁 | 同源多页面共享 | 多标签页共享一条 WebSocket 连接、共享缓存状态 |
| **Service Worker** | 独立于页面，事件驱动唤醒 | 一个域（用于 PWA） | 离线缓存、消息推送、请求拦截 |

### 1.2 解决什么问题

JS 是单线程的：事件循环同一时刻只能跑一个任务。一旦某个任务耗时 500ms 以上——一个暴力循环、一张大图逐像素处理、一次几十万行的排序——主线程就会"冻结"：**动画掉帧、点击无响应、输入卡顿**，这就是所谓的"主线程阻塞"。

Web Worker 的回答是：**把 CPU 密集任务挪到后台线程**。主线程只负责 UI 与交互，Worker 只负责算，两者用消息互发结果。注意它解决的是 **CPU 瓶颈**，而不是网络等待——异步 IO（fetch、定时器）本来就不会阻塞主线程，没必要为了一个 `fetch` 开 Worker。

### 1.3 底层原理

- **线程 + 消息队列**：每个 Worker 是一条真实 OS 线程，内部同样有事件循环。主线程 `postMessage` 的消息进入 Worker 的任务队列，Worker 里 `onmessage` 回调按序处理，来回都是异步的。
- **结构化克隆（Structured Clone）**：消息默认**深拷贝**传递。支持普通对象、数组、Map/Set、Date、RegExp、ArrayBuffer、Blob、ImageData 等；**不支持**函数、DOM 节点、Error 对象（部分浏览器）、Symbol、原型链（克隆后 `constructor` 丢失，变成纯数据对象）。大对象克隆本身有成本，这就是 Transferable 存在的原因（见 2.4）。
- **隔离模型**：Worker 没有DOM，也无法直接读主线程变量——所有状态交换必须显式 `postMessage`。这避免了多线程共享内存的经典竞态问题（除非刻意用 `SharedArrayBuffer` + `Atomics`，属于进阶玩法）。
- **同源与 CSP**：Worker 脚本受同源策略约束；用 `blob:` URL 创建的内联 Worker 受页面 CSP `worker-src`/`script-src` 约束。

### 1.4 为什么示例都用 Blob URL 内联 Worker

教科书示例都是 `new Worker('worker.js')`，但**双击以 file:// 打开时浏览器会因同源限制拒绝加载外部 Worker 脚本**（Chrome 直接报 `cannot be accessed from origin 'null'`）。把 Worker 代码写成字符串、用 `URL.createObjectURL(new Blob([code]))` 生成内联地址，则**完全不依赖网络与外部文件，file:// 双击即可运行**——本手册所有 Worker 示例采用这种写法。多文件的真实工程写法见 2.6 的代码片段（需本地静态服务器）。

## 2. 语法说明 —— 完整语法、属性/参数表、代码片段

### 2.1 创建与通信

```js
// 主线程：用 Blob URL 创建内联 Worker（file:// 下唯一可靠写法）
const code = `
  // Worker 线程内部：self 就是 Worker 的全局对象（没有 window）
  self.onmessage = (e) => {          // 接收主线程消息
    const result = e.data.a + e.data.b;
    self.postMessage(result);        // 把结果发回主线程
  };
`;
const worker = new Worker(URL.createObjectURL(new Blob([code], { type: 'text/javascript' })));

worker.onmessage = (e) => console.log('结果：', e.data);  // 主线程接收
worker.onerror = (e) => console.error(e.message, e.lineno); // Worker 内未捕获错误统一走这里

worker.postMessage({ a: 1, b: 2 });  // 发送（数据被结构化克隆）
worker.terminate();                  // 立即销毁 Worker（硬杀，消息可能来不及送达）
```

| 主线程 API | 说明 |
| --- | --- |
| `new Worker(url, { type })` | `type: 'classic'`（默认）或 `'module'`（ESM Worker） |
| `worker.postMessage(data, [transfer])` | 发消息；第二个参数可转移 Buffer 所有权 |
| `worker.onmessage` | 接收 Worker 回传 |
| `worker.onerror` | Worker 内任何未捕获异常都会冒泡到这里 |
| `worker.onmessageerror` | 消息无法反序列化时触发（如发了不支持的类型） |
| `worker.terminate()` | 主线程主动硬杀 Worker |

Worker 线程内部可用：`self.onmessage / self.postMessage`、`fetch`、`setTimeout`、`indexedDB`、`importScripts()`；**不可用**：`window`、`document`、DOM 一切 API。

### 2.2 结构化克隆支持范围（高频踩坑点）

| 可传递 | 不可传递（抛错或丢信息） |
| --- | --- |
| 对象/数组（深拷贝，丢原型） | 函数（DataCloneError） |
| Map / Set / Date / RegExp | DOM 节点 |
| ArrayBuffer / TypedArray / Blob / File | Error 对象（多数环境） |
| ImageData / ImageBitmap | Symbol、WeakMap |

```js
// 原型丢失演示：class 实例克隆后只是普通对象
class Point { constructor(x) { this.x = x; } dist() { return this.x; } }
worker.postMessage(new Point(3));
// Worker 里收到后 p instanceof Point === false，p.dist 不存在
// 结论：传"纯数据 + 消息里带 type 字段"，Worker 侧按 type 分发处理
```

### 2.3 Transferable：转移所有权而非拷贝

```js
// 拷贝：8MB 的 buffer 会被完整复制一份（几十毫秒级开销）
worker.postMessage(bigBuffer);

// 转移：几乎零开销，但主线程立刻失去所有权
worker.postMessage(bigBuffer, [bigBuffer]);
bigBuffer.byteLength; // 0 ！主线程里已变空，不能再用

// 典型配合：ImageData 的像素 buffer
const img = ctx.getImageData(0, 0, w, h);          // 取出像素
worker.postMessage(img.data.buffer, [img.data.buffer]); // 转移给 Worker 处理
```

可转移类型目前有：`ArrayBuffer`、`MessagePort`、`ImageBitmap` 等（`SharedArrayBuffer` 例外，它不可转移而是共享）。**转移后的对象在读侧持有**，这就是"零拷贝"。

### 2.4 Promise 化双向通信封装（推荐模式）

```js
// 把"发消息→等回包"封装成 Promise：内部用自增 id 关联请求与响应
function createPromiseWorker(worker) {
  const pending = new Map();                    // id → {resolve, reject}
  worker.onmessage = (e) => {
    const { id, ok, data } = e.data;            // Worker 约定回包格式：{id, ok, data}
    const p = pending.get(id);
    if (!p) return;
    pending.delete(id);
    ok ? p.resolve(data) : p.reject(data);      // ok=false 时 reject，业务层 catch
  };
  return {
    invoke(payload) {
      return new Promise((resolve, reject) => {
        const id = Math.random().toString(36).slice(2);
        pending.set(id, { resolve, reject });
        worker.postMessage({ id, payload });    // 消息带 id 出去
      });
    }
  };
}
```

### 2.5 错误处理与调试

- Worker 内**任何未捕获异常**都会触发主线程的 `worker.onerror`；事件对象上有 `message`、`filename`、`lineno`。必须显式监听，否则错误被静默吞掉，任务永远没有回包（Promise 化封装里要配合超时 reject）。
- DevTools 的 Sources 面板可以看到 Worker 线程并打断点；Console 可用线程选择器切换上下文。
- Worker 内也可以 `try/catch` 自己把错误 postMessage 回主线程，这样错误信息可以携带业务上下文。

### 2.6 多文件工程写法（片段，需本地静态服务器）

```js
// 真实工程中 Worker 代码独立成文件（构建工具如 webpack/vite 有专门 import 语法）。
// 注意：file:// 双击打开时下面的写法会被同源策略拦截，必须 http(s) 或 localhost 下运行！
const worker = new Worker('./workers/sort.js');        // 经典 Worker，同源脚本
const modWorker = new Worker('./workers/sort.mjs', { type: 'module' }); // ESM Worker，可 import

// Worker 内部加载更多脚本（仅 classic Worker 可用，module Worker 直接用 import）：
// importScripts('./lib/bigint.js', './lib/parse.js'); // 同步加载，路径相对 Worker 文件
```

## 3. 浏览器兼容性

> 以下版本为基于 caniuse 的**大致基线**，仅供参考，关键场景请以实测为准。

| 特性 | Chrome | Edge | Firefox | Safari | 移动端 | 坑点备注 |
| --- | --- | --- | --- | --- | --- | --- |
| Dedicated Worker 基础 | 4 | 12 | 3.5 | 4 | iOS Safari 5 / Android 2.1 起支持 | file:// 下禁止加载外部 Worker 脚本，须 Blob URL 或本地服务器 |
| postMessage 结构化克隆 | 13 | 12 | 18 | 6 | 同期移动端均已支持 | 函数/DOM 不可传，抛 DataCloneError |
| Transferable（ArrayBuffer） | 17 | 12 | 18 | 6 | Android 4.4 起 | 转移后主线程 byteLength 变 0，误用会"数据消失" |
| Blob URL Worker | 10 | 12 | 8 | 6 | iOS 6 起 | 受 CSP worker-src 限制；撤销 URL 前须保证 Worker 已创建 |
| Shared Worker | 4 | 12 | 3.5 | 5.1~6 支持，7~15 移除，16.4 恢复 | Android 部分支持 | Safari 长期不支持导致普及率低，用前必须特性检测 |
| Module Worker（type:module） | 80 | 80 | 114 | 15 | iOS 15 起 | 旧 Safari/Firefox 直接抛错，需按特性降级 classic |
| OffscreenCanvas（Worker 内画图） | 69 | 79 | 105 | 16.4 | iOS 16.4 起 | 把 canvas 渲染也搬进 Worker 的钥匙，旧浏览器需回退主线程 |

## 4. 使用场景示例

### 4.1 场景一：耗时计算不卡 UI（主线程 vs Worker 对比）

**场景描述**：计算 4000 万次累加。主线程跑会让 CSS 旋转动画冻结；Worker 跑则动画全程流畅——最直观理解"为什么需要 Worker"。

```js
// Worker 代码（内联字符串，file:// 可用）
const code = `
  self.onmessage = (e) => {
    const n = e.data.n;
    let sum = 0;
    const t0 = Date.now();
    for (let i = 0; i < n; i++) sum += i;   // 纯 CPU 循环，几百毫秒到数秒
    self.postMessage({ sum, cost: Date.now() - t0 });
  };
`;
const worker = new Worker(URL.createObjectURL(new Blob([code])));

worker.onmessage = (e) => {
  result.textContent = '合计 ' + e.data.sum + '，耗时 ' + e.data.cost + 'ms';
};
worker.postMessage({ n: 40000000 });        // 主线程瞬间返回，动画照常转
```

**预期效果**：点击"主线程计算"，旋转方块当场冻结；点击"Worker 计算"，方块持续旋转，结果照常算出。完整对比见 [示例 1](../../examples/html/06-web-workers/index-01-blob-worker-calc.html)。

### 4.2 场景二：图片像素处理（Transferable 零拷贝）

**场景描述**：把一张画布图像的像素交给 Worker 做灰度/反色，主线程只负责展示。用 Transferable 转移 `ImageData.data.buffer`，避免几十 MB 像素数据的克隆开销。

```js
const img = ctx.getImageData(0, 0, w, h);           // 取像素（大对象）
worker.postMessage(img.data.buffer, [img.data.buffer]); // 转移所有权，主线程即刻变空

// Worker 内：收到的是 TypedArray 可直接逐像素算
self.onmessage = (e) => {
  const buf = e.data.buffer, mode = e.data.mode;
  const arr = new Uint8ClampedArray(buf);
  for (let i = 0; i < arr.length; i += 4) {         // 每像素 4 字节 R/G/B/A
    const gray = arr[i] * .299 + arr[i + 1] * .587 + arr[i + 2] * .114;
    if (mode === 'gray') arr[i] = arr[i + 1] = arr[i + 2] = gray;
    if (mode === 'invert') { arr[i] = 255 - arr[i]; arr[i + 1] = 255 - arr[i + 1]; arr[i + 2] = 255 - arr[i + 2]; }
  }
  self.postMessage({ buffer: buf, cost: t }, [buf]); // 处理完再转移回主线程
};
```

**预期效果**：点击灰度/反色按钮，画布立即切换效果；日志显示"转移后主线程 byteLength=0"，验证所有权确实移动了。见 [示例 2](../../examples/html/06-web-workers/index-02-transferable-pixels.html)。

### 4.3 场景三：大数据排序（Promise 化任务队列）

**场景描述**：对 20 万个随机数排序若干次，全部封装成 `invoke()` Promise 调用，可 `await`、可并行多个 Worker，主线程零阻塞。

```js
const pw = createPromiseWorker(worker);             // 2.4 节的封装
const data = Array.from({ length: 200000 }, () => Math.random() * 1e6);

// 像 async 函数一样用：完全感知不到底下是线程消息
const sorted = await pw.invoke({ type: 'sort', data });
console.log('最小值', sorted[0], '最大值', sorted[sorted.length - 1]);

// 出错也能被 try/catch：Worker 内 throw 会被封装转成 Promise reject
try { await pw.invoke({ type: 'boom' }); }
catch (err) { console.warn('Worker 报错：', err); }
```

**预期效果**：任务列表逐个完成并显示各自耗时，期间页面动画/输入全程流畅；"触发 Worker 内部错误"按钮能看到错误被 reject 到主线程。见 [示例 3](../../examples/html/06-web-workers/index-03-promise-worker.html)。

### 4.4 场景四：轮询与数据解析（fetch + 解析都进 Worker）

**场景描述**：仪表盘每 3 秒拉一份 10MB 的 CSV 并解析聚合。解析在主线程做会周期性卡顿，Worker 里 fetch + 解析 + 聚合一条龙，主线程只收最终聚合结果。

```js
// Worker 内代码：fetch 在 Worker 里完全可用
self.onmessage = (e) => {
  if (e.data.type !== 'start') return;
  setInterval(async () => {                          // Worker 里的定时器与主线程互不干扰
    const text = await (await fetch(e.data.url)).text();
    const rows = text.split('\n').map(l => l.split(','));  // CPU 密集的解析在 Worker 里做
    const total = rows.reduce((s, r) => s + Number(r[2] || 0), 0);
    self.postMessage({ total, rows: rows.length });  // 只回传聚合结果（几字节）
  }, 3000);
};
```

**预期效果**：网络与解析都发生在后台线程，主线程每个 3 秒只收到一个轻量对象，页面无任何卡顿。

### 4.5 场景五：terminate 回收与超时保护

**场景描述**：用户取消操作或任务超时后，主动 `terminate()` 硬杀 Worker 并重建，防止僵尸任务常驻内存。

```js
function withTimeout(worker, msg, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      worker.terminate();                              // 超时硬杀：释放线程资源
      reject(new Error('任务超时，Worker 已终止'));
    }, ms);
    worker.onmessage = (e) => { clearTimeout(timer); resolve(e.data); };
    worker.postMessage(msg);
  });
}
```

**预期效果**：示例 3 中点击"超时杀掉 Worker"，2 秒后任务被强制终止、Promise reject、Worker 重建，后续任务不受影响。

## 5. 实际应用案例分析

### 5.1 中后台报表：百万行 CSV 导出

**背景**：某 BI 中后台"导出明细"按钮，需把 80 万行表格拼成 CSV 下载。主线程版本一导出整个页面白屏 6~8 秒，期间点任何按钮都无效，用户频繁重复点击导致更糟。

**方案选型**：拼接与字符串转义全部挪进 Dedicated Worker；主线程只 `postMessage` 查询参数，收到回包后用 Blob + `URL.createObjectURL` 触发下载。因为字符串本身不可 Transferable，采用**分片回传**：Worker 每凑 5 万行 postMessage 一段，主线程按序拼接，既避免单条巨型消息的克隆卡顿，又能实时显示进度条。

**踩坑分析**：
1. **克隆开销被低估**——最初一次性回传 100MB 字符串，结构化克隆本身在主线程卡了 1 秒多；分片后单条仅 3MB，无感。
2. **Worker 里没有 UI 状态**——业务最初把"当前筛选条件"里的 DOM 引用直接 postMessage，抛 DataCloneError。规范后消息只传纯数据（`{filters, columns}`），Worker 保持无状态。
3. **进度消息与结果消息混在一条管道**——用消息里的 `type` 字段区分（`progress` / `done` / `error`），主线程按 type 分发，封装成一个 `on(type, cb)` 的小型事件器。

### 5.2 在线图像编辑器：滤镜实时预览

**背景**：网页版修图工具拖动"亮度/对比度"滑杆时需要实时重算 1200 万像素，主线程版拖动滑杆帧率跌到 5fps。

**方案选型**：双 Worker 池（`navigator.hardwareConcurrency` 决定数量）+ Transferable 像素 buffer；主线程把 ImageData 的 buffer 转移给空闲 Worker，回传再转移回来直接 `putImageData`，全程零拷贝。滑杆 input 事件节流 32ms，丢弃排队中的旧任务（回包带 seq 序号，过期序号直接丢）。

**踩坑分析**：
1. **转移后误用**——buffer 转移出去后主线程又读 `data.length` 得到 0，排查半天。团队随后在封装里约定：转移出去的引用立即置 null，配 lint 注释标记。
2. **Safari 不支持 OffscreenCanvas（16.4 前）**——把 `ctx.getImageData/putImageData` 留在主线程、只把"纯像素计算"放 Worker，兼容性最好，是比 OffscreenCanvas 更普适的折中。
3. **Worker 冷启动延迟**——首次点击滤镜有 100ms+ 的启动延迟，方案是页面空闲时预创建 Worker 池并 keep-alive，而不是每次现建现毁。

## 6. 最佳实践与常见坑

1. **file:// 双击打不开外部 Worker**：`new Worker('./a.js')` 在本地文件协议下被同源策略拦截；单文件演示一律用 Blob URL 内联，工程环境走 http(s) 或 localhost。
2. **消息只传纯数据**：函数、DOM 节点、class 实例（原型会丢）都不适合跨线程传；约定 `{type, payload}` 消息协议，Worker 按 type 分发。
3. **大 buffer 用 Transferable**：大于 1MB 的 ArrayBuffer/ImageData 转移而非拷贝；但要清楚转移后主线程引用立刻失效（byteLength === 0）。
4. **必挂 onerror**：Worker 内未捕获异常不会出现在主线程控制台，不监听 onerror 就是静默失败；配合超时机制避免 Promise 永远 pending。
5. **用完要回收**：长期不用的 Worker 调 `terminate()`（或 Worker 内 `self.close()`），否则线程常驻占用内存；任务型场景建议"池 + 复用"而非频繁新建。
6. **不要为了"异步感"滥用 Worker**：fetch、setTimeout 本身不阻塞主线程；只有 CPU 密集（大循环、像素、排序、解析）才值得开线程，Worker 的消息克隆与线程通信本身有成本。
7. **Blob URL 生命周期**：创建 Worker 后 `URL.revokeObjectURL(url)` 是安全的（Worker 已持有引用），但重复创建前别急着撤销；页面卸载时统一撤销防内存泄漏。
8. **主线程与 Worker 的时钟独立**：Worker 里 `setInterval` 在后台标签页仍可能被浏览器节流；精确调度不要依赖 Worker 定时器。
9. **CSP 会拦 blob: Worker**：配置了 `Content-Security-Policy` 的站点需显式放行 `worker-src blob:`，否则内联 Worker 静默创建失败。
10. **特性检测再降级**：`typeof Worker === 'undefined'` 时回退主线程分片计算（`setTimeout` 切片），SharedWorker/Module Worker 同理先检测后使用。
11. **进度反馈用分片消息**：长任务定期 postMessage 进度（带 type 字段），主线程才好渲染进度条、支持"取消"。
12. **调试技巧**：DevTools Sources 面板能看到每个 Worker 线程；Worker 内 `console.log` 会直接打到主线程控制台，前缀可用消息自带的 tag 区分。

## 7. 参考资料

- MDN — Web Workers API 总览：<https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Workers_API>
- MDN — 使用 Web Workers：<https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Workers_API/Using_web_workers>
- MDN — Worker 全局作用域与函数参考：<https://developer.mozilla.org/zh-CN/docs/Web/API/DedicatedWorkerGlobalScope>
- MDN — Transferable 对象：<https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Workers_API/Transferable_objects>
- MDN — 结构化克隆算法：<https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Workers_API/Structured_clone_algorithm>
- MDN — SharedWorker：<https://developer.mozilla.org/zh-CN/docs/Web/API/SharedWorker>
- MDN — Service Worker（延伸）：<https://developer.mozilla.org/zh-CN/docs/Web/API/Service_Worker_API>
- WHATWG HTML 标准 — Web workers 章节：<https://html.spec.whatwg.org/multipage/workers.html>
- caniuse — Web Workers 兼容性数据：<https://caniuse.com/webworkers>
