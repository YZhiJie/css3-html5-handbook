# 漫画 · 第 17 话 Web Workers：后台线程解冻页面

> 对应正文：[docs/html/06-web-workers.md](../../docs/html/06-web-workers.md) ｜ 原画：[EP.17-web-workers.svg](./EP.17-web-workers.svg)

## 登场角色

- **像素酱**：CSS 造型师，页面上放了个 60fps 旋转方块当装饰，结果"导出报表"按钮一点——方块当场冻住，按钮转圈也没了，整个页面假死好几秒。
- **标签君**：HTML5 结构师，本话主角。开了一条 Worker 后台线程，把 4000 万次累加和像素处理都丢进去，主线程只管 UI。

## 剧情梗概

JS 是单线程的，事件循环同一时刻只跑一个任务；CPU 密集型长任务（大循环、逐像素处理、几十万行排序）一旦超过 500ms，动画掉帧、点击无响应、输入卡顿。Web Worker 提供真正的后台 OS 线程：主线程与 Worker 不共享任何变量，只通过 `postMessage` 传递消息，Worker 里没有 DOM、没有 window，只负责算。注意它解决的是 CPU 瓶颈——fetch、定时器的等待本来就不占主线程。

## 分格解读

### 格1 · 痛点现场

主线程被一个同步大循环占住后，事件循环里排队的动画帧、点击回调、输入事件全部无法执行，表现为页面"假死"。这类问题无法靠异步回调解决——代码本身在持续吃 CPU。

### 格2 · 机制登场

`new Worker(url)` 启动独立执行环境，有自己的事件循环与全局对象 `self`，无 `window`/`document`。两边靠消息队列通信：主线程 `postMessage` 投递、Worker 的 `self.onmessage` 处理、算完再 `self.postMessage` 回传，全程异步。消息默认走**结构化克隆**深拷贝：支持普通对象、Map/Set、ArrayBuffer、ImageData；不支持函数、DOM 节点，class 实例克隆后丢原型变纯数据——所以约定 `{type, payload}` 消息协议。

### 格3 · 落地收束

三个工程要点：①**Blob URL 内联 Worker**——`new Worker('./a.js')` 在 file:// 下被同源策略拒绝，把代码放字符串里 `URL.createObjectURL(new Blob([code]))` 双击即可运行，工程环境再用独立文件；②**Transferable**——`postMessage(buf, [buf])` 转移 ArrayBuffer 所有权实现零拷贝，适合几十 MB 的 ImageData 像素，但转移后主线程的 buf 立即变空（byteLength=0），用完再转移回来；③**Promise 化封装**——自增 id 关联请求与回包，业务层 `await pw.invoke({type:'sort', data})`；`onerror` 必挂（Worker 异常不会出现在主线程控制台）、配超时 reject、用完 `terminate()` 回收。

## 码叔划重点

1. Worker 解决 CPU 密集而非网络等待；无 DOM、不共享变量，只靠 postMessage 结构化克隆通信。
2. 大 buffer 用 Transferable 转移而非拷贝，转移后原引用 byteLength=0；消息只传纯数据。
3. file:// 用 Blob 内联 Worker；onerror 必挂、超时保护、terminate 回收一个都不能少。

## 自测一题

**问**：把一个 8MB 的 ArrayBuffer `postMessage(buf, [buf])` 发给 Worker 后，主线程紧接着读 `buf.byteLength` 得到什么？如果后面还要用这块数据该怎么办？

**答**：得到 `0`。Transferable 的语义是**转移所有权**而非拷贝：buffer 的底层内存直接移交给接收方，发送方的引用立刻变为"已分离"的空 buffer，再读写都没有数据（所以规范上应立即把该引用置 null，防止误用）。如果主线程后面还需要数据，标准做法是让 Worker 处理完后把同一个 buffer 再通过 `postMessage(result, [buffer])` 转移回来，所有权重新回到主线程；只是想让两边都能看到同一份数据且不能接受"失去所有权"的场景，才用默认的克隆传递（付出复制成本）。

## 动手实验

- Blob 内联 Worker：主线程长任务卡死动画 vs Worker 后台计算对比：[examples/html/06-web-workers/index-01-blob-worker-calc.html](../../examples/html/06-web-workers/index-01-blob-worker-calc.html)
- Transferable 像素处理：ArrayBuffer 零拷贝转移 + Worker 内灰度/反色：[index-02-transferable-pixels.html](../../examples/html/06-web-workers/index-02-transferable-pixels.html)
- Promise 化通信：invoke 封装 + 排序任务队列 + 错误传递：[index-03-promise-worker.html](../../examples/html/06-web-workers/index-03-promise-worker.html)

## 下一话预告

第 18 话《Geolocation》——经纬度到手前先过三关：安全上下文、用户授权、还有几百米的坐标系偏移。
