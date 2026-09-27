# 漫画 · 第 16 话 Web Storage：刷新不丢的键值仓库

> 对应正文：[docs/html/05-web-storage.md](../../docs/html/05-web-storage.md) ｜ 原画：[EP.16-web-storage.svg](./EP.16-web-storage.svg)

## 登场角色

- **像素酱**：CSS 造型师，把表格列配置塞进 Cookie，结果单条 4KB 存不下，还发现连请求一张 logo.png 都背着这串数据，读写时还得自己拼字符串算过期。
- **标签君**：HTML5 结构师，本话主角。拿出 localStorage / sessionStorage 两个 API 完全一致、生命周期完全不同的仓库，并演示 storage 事件与生产级封装。

## 剧情梗概

Web Storage 是浏览器端的同源键值对存储：不随 HTTP 请求发送、容量 5~10MB、原生 get/set 同步 API。它取代了"什么都往 Cookie 塞"的旧模式——需要服务器认识的凭证留 Cookie，只想让浏览器记住的前端状态全部搬进 Storage。唯一的门槛是：值只能是字符串，以及各种写入失败的边界必须兜住。

## 分格解读

### 格1 · 痛点现场

Cookie 三个硬伤：每个同源 HTTP 请求自动携带（图片、接口都背着，白白增大请求头）；单条约 4KB、每域约 50 条；`document.cookie` 只是字符串，读写要自己解析拼接。表格列配置、一页缓存数据根本塞不下。

### 格2 · 机制登场

两个仓库 API 相同（都实现 Storage 接口）、按同源隔离：`localStorage` 持久化，关浏览器重启电脑都在，适合主题、语言、长期缓存；`sessionStorage` 绑定当前标签页会话，刷新保留、关标签页销毁，适合表单草稿、多步向导。storage 事件是零依赖广播：任一标签页改了 localStorage，浏览器向**同源的其他所有标签页**派发事件（key/oldValue/newValue/url），写入页自己收不到——A 页加购物车、B 页角标实时更新就靠它。

### 格3 · 落地收束

值只能存字符串：裸存对象读回来是 `"[object Object]"`，必须 `JSON.stringify/parse` 成对使用；注意 undefined 序列化会消失、循环引用抛 TypeError、读不到返回 null。生产封装做四件事：命名空间前缀防 key 冲突；包一层 `{v, e}` 实现 TTL 过期；探针检测存储可用性，隐私模式/被禁用时降级内存 Map；所有 setItem try/catch，配额满（QuotaExceededError）不中断业务。敏感信息（密码、长期 token）绝不入 Storage——XSS 下完全透明可读，HttpOnly Cookie 才是它们的位置。

## 码叔划重点

1. localStorage 持久、sessionStorage 随标签页，同源隔离、不随请求发送；只存字符串，对象必须 stringify/parse 成对。
2. storage 事件只广播给同源其他标签页；配额满与隐私模式会抛错，setItem 一律 try/catch + 内存降级。
3. key 加命名空间、TTL 自己实现、clear() 是核弹别乱按；敏感凭证交给 HttpOnly Cookie。

## 自测一题

**问**：在标签页 A 里监听了 storage 事件，然后自己在 A 里 `setItem('theme','dark')`，回调为什么不触发？怎么让 A 页 UI 也更新？

**答**：这是规范的刻意设计：storage 事件只派发给**同源的其他**窗口/标签页，执行修改的当前页面不收到，避免"自己写自己收"的循环反馈。本页 UI 必须在写入处同步更新——标准模式是把"改数据 + 改本页 UI"放在同一个操作函数里，其他标签页靠 storage 事件被动同步；不要试图靠本页 storage 事件驱动自己的渲染。

## 动手实验

- 存储基础：API 全操作 + 生命周期对比 + 容量压测 + 序列化陷阱：[examples/html/05-web-storage/index-01-storage-basics.html](../../examples/html/05-web-storage/index-01-storage-basics.html)
- storage 事件：双标签页主题/购物车实时同步：[index-02-storage-event-sync.html](../../examples/html/05-web-storage/index-02-storage-event-sync.html)
- 生产级封装：命名空间 + TTL 过期 + 内存降级 + 安全 JSON：[index-03-storage-wrapper.html](../../examples/html/05-web-storage/index-03-storage-wrapper.html)

## 下一话预告

第 17 话《Web Workers》——JS 也能多线程：把冻住页面的重计算丢进后台，消息一来一回，动画照常丝滑。
