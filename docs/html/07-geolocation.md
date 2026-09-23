# 地理定位

> Geolocation API 让网页在用户授权后拿到设备的经纬度（GPS/WiFi/IP 多源融合），是打卡、附近门店、跑步轨迹、天气本地化的入口。它强依赖安全上下文（https 或 localhost）与用户授权，错误分支远多于成功分支。本章覆盖 getCurrentPosition 与 watchPosition、PositionOptions 三参数、权限模型与三种错误码、WGS84 与国内 GCJ-02 坐标偏移、精度 accuracy 的正确用法、以及不依赖真实权限的 Mock 方案。

## 目录

- [1. 概念解释](#1-概念解释--是什么解决什么问题底层原理)
- [2. 语法说明](#2-语法说明--完整语法属性参数表代码片段)
- [3. 浏览器兼容性](#3-浏览器兼容性)
- [4. 使用场景示例](#4-使用场景示例)
- [5. 实际应用案例分析](#5-实际应用案例分析)
- [6. 最佳实践与常见坑](#6-最佳实践与常见坑)
- [7. 参考资料](#7-参考资料)

配套可运行示例（双击即可运行，零依赖；**真实定位需 https 或 localhost**）：

| 示例 | 说明 | 路径 |
| --- | --- | --- |
| 单次定位（真实 + Mock 双路径） | getCurrentPosition 全流程，无权限也能走通 | ../../examples/html/07-geolocation/index-01-get-current-position.html |
| 持续定位与轨迹绘制 | watchPosition + 内联 SVG 坐标图画轨迹 | ../../examples/html/07-geolocation/index-02-watch-position.html |
| PositionOptions 与错误处理 | 三参数调节面板 + 三种错误码模拟与真实触发 | ../../examples/html/07-geolocation/index-03-options-errors.html |

## 1. 概念解释 —— 是什么、解决什么问题、底层原理

### 1.1 是什么

Geolocation API 是浏览器提供的**位置获取接口**，挂在 `navigator.geolocation` 上。它只回答一个问题：**设备现在在哪（经纬度 ± 误差半径）**。注意它：

- **不提供地图**——地图渲染（瓦片、POI、路径）是地图 SDK 的事，本章示例用内联 SVG 自绘"坐标图"代替；
- **不提供逆地理编码**（坐标 → 地址文字），那也是地图服务的职责；
- **必须用户授权**——位置属于敏感隐私，浏览器有一套独立的权限流程。

### 1.2 解决什么问题

在它出现之前，网页想知道用户位置只能靠"让用户手填城市"或服务端看 IP。Geolocation API 把这件事标准化成三行代码，并且带来两个关键特性：

1. **多源融合的精度**：GPS（室外 5~10m）、WiFi 热点指纹（几十米）、蜂窝基站（几百米到几公里）、IP（城市级）由系统/浏览器自动选择与加权，`accuracy` 字段直接告诉你这次结果"可信半径"是多少米；
2. **持续定位**：`watchPosition` 在设备移动时持续回调，跑步、骑行、外卖骑手轨迹类需求的基础。

### 1.3 底层原理与权限模型

- **数据来源与浏览器无关的融合**：浏览器调用操作系统的定位服务（桌面端多为 WiFi/IP，移动端可用 GPS 芯片），拿到一个 `Coordinates` 对象。`enableHighAccuracy: true` 只是"尽量用 GPS"的** hint**，不保证真的更准、也不保证更快。
- **权限模型**：首次调用会触发浏览器权限弹窗，用户可选"允许 / 仅本次 / 拒绝"。可用 `navigator.permissions.query({ name: 'geolocation' })` 预先查询状态（`granted` / `prompt` / `denied`）。**拒绝后浏览器不会再弹窗**，页面只能提示用户去站点设置里手动恢复。
- **安全上下文强制**：Chrome 50+、Firefox 55+ 起只在 **https 或 localhost** 上暴露该 API；http 站点下 `navigator.geolocation` 直接是 `undefined`。`file://` 下各浏览器表现不一（Chrome 视为可信上下文但可能拒绝授权，Firefox 可用），**所以本地演示请用 localhost 起静态服务器，或使用示例中的 Mock 模式**。
- **iOS/移动端细节**：iOS Safari 要求定位调用发生在用户手势触发的调用链上更易获得授权；App 内嵌 WebView 还受原生定位权限约束。

### 1.4 坐标系统：WGS84 与国内 GCJ-02（重要！）

浏览器 API 返回的是 **WGS84**（GPS 原始坐标系）。但国内合规地图服务（高德、腾讯、百度）使用加偏坐标系：

| 坐标系 | 说明 | 谁在用 |
| --- | --- | --- |
| WGS-84 | GPS 国际标准（API 直出） | 国际地图、原始数据 |
| GCJ-02 | 国测局加偏（"火星坐标"），WGS84 经非线性偏移得到 | 高德、腾讯地图 |
| BD-09 | 在 GCJ-02 基础上再偏移 | 百度地图 |

**把 WGS84 坐标直接丢给高德/百度 API，点位会偏移几百米**（俗称"火星坐标坑"）。正确做法：换库或调用厂商提供的坐标转换接口（如高德 WebAPI 的 convert 接口）后再使用。本手册示例只演示原始坐标，不做偏移转换（避免引入外部服务）。

## 2. 语法说明 —— 完整语法、属性/参数表、代码片段

### 2.1 三个核心方法

```js
// 特性检测：http 非安全上下文下 geolocation 直接不存在，必须先判空
if (!('geolocation' in navigator)) {
  alertSafe('当前环境不支持定位（多为非 https/localhost）');
}

// ① 单次定位：拿到一个结果就结束
navigator.geolocation.getCurrentPosition(onSuccess, onError, options);

// ② 持续定位：设备移动/精度变化时反复回调，返回 watchId 用于取消
const watchId = navigator.geolocation.watchPosition(onSuccess, onError, options);

// ③ 取消持续定位（离开页面/组件卸载时务必调用，否则持续耗电）
navigator.geolocation.clearWatch(watchId);
```

### 2.2 PositionOptions 参数表

| 参数 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `enableHighAccuracy` | boolean | `false` | 尝试使用 GPS 等高精度源。更准但更慢、更耗电；false 时倾向 WiFi/IP 快速出结果 |
| `timeout` | number(ms) | Infinity | 定位允许的最长时间，超时触发 `TIMEOUT` 错误。**建议必设**，否则 GPS 搜星可能挂很久 |
| `maximumAge` | number(ms) | 0 | 允许使用"多久以内"的缓存位置。设 60000 可秒回最近一次结果，设 0 强制现测 |

```js
const options = {
  enableHighAccuracy: true,   // 打开车的场景要 GPS 级精度
  timeout: 10000,             // 10 秒等不到就报 TIMEOUT，别让用户干等
  maximumAge: 30000           // 30 秒内的缓存位置可接受
};
```

### 2.3 成功回调：Position 对象

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `coords.latitude` | number | 纬度，-90 ~ 90（WGS84） |
| `coords.longitude` | number | 经度，-180 ~ 180（WGS84） |
| `coords.accuracy` | number | **精度半径（米）**，68% 置信圆。展示与判断"能不能用"的关键字段 |
| `coords.altitude` | number \| null | 海拔（米），多数环境为 null |
| `coords.heading` | number \| null | 运动方向（度），静止时 null |
| `coords.speed` | number \| null | 速度（m/s），静止时 null |
| `timestamp` | number | 该位置数据产生的时间戳（不是回调时间） |

### 2.4 错误回调：PositionError

| code | 常量 | 触发条件 | 处置建议 |
| --- | --- | --- | --- |
| 1 | `PERMISSION_DENIED` | 用户拒绝 / 系统禁用 / 浏览器策略拦截 | 引导去浏览器站点设置开启权限，别反复重试 |
| 2 | `POSITION_UNAVAILABLE` | 设备无法测出位置（无 GPS 信号、网络断） | 提示稍后重试或降级为手动选择城市 |
| 3 | `TIMEOUT` | 超过 options.timeout | 缩短 maximumAge / 关闭高精度后重试一次 |

```js
function onError(err) {
  // err.code / err.message；message 文案各浏览器不同，业务判断用 code
  switch (err.code) {
    case err.PERMISSION_DENIED: showTip('您拒绝了定位授权，可在浏览器站点设置中开启'); break;
    case err.POSITION_UNAVAILABLE: showTip('暂时无法获取位置信息，请检查网络或稍后重试'); break;
    case err.TIMEOUT: showTip('定位超时，请移到开阔地带重试'); break;
  }
}
```

### 2.5 权限查询（Permissions API）

```js
// 预先探测权限状态，避免"一进页面就弹窗"的差体验
navigator.permissions.query({ name: 'geolocation' }).then((st) => {
  if (st.state === 'granted') startLocate();          // 已授权：静默定位
  if (st.state === 'denied') showGuide();             // 已拒绝：显示开启引导
  // prompt：等用户点了"定位"按钮再发起，把弹窗绑定到明确意图上
});
```

### 2.6 降级与 Mock 思路

```js
// Mock：把"定位成功"抽象成回调注入，真实/Mock 两条路径共用同一套下游 UI 逻辑
function locate(onOk, onErr) {
  if (mockSwitch) {                                   // Mock 开关打开
    setTimeout(() => onOk(makeMockPosition()), 600);  // 模拟延迟，走真实同款回调
    return;
  }
  if (!('geolocation' in navigator)) {                // 特性缺失降级
    onErr({ code: 2, message: '环境不支持定位' });
    return;
  }
  navigator.geolocation.getCurrentPosition(onOk, onErr, options);
}
```

## 3. 浏览器兼容性

> 以下版本为基于 caniuse 的**大致基线**，仅供参考，关键场景请以实测为准。

| 特性 | Chrome | Edge | Firefox | Safari | 移动端 | 坑点备注 |
| --- | --- | --- | --- | --- | --- | --- |
| getCurrentPosition / watchPosition | 5（50 起需安全上下文） | 12 | 3.5（55 起需安全上下文） | 5 | iOS Safari 3.2 / Android 全支持 | **http 站点 API 直接消失**，务必特性检测 |
| Permissions API 查询 geolocation | 43 | 14 | 46 | 16 | iOS 16 起 | 旧 Safari 无此 API，需 try/catch 降级为"直接调用" |
| altitude / heading / speed | 部分设备有值 | 同左 | 桌面多为 null | 多为 null | 移动端 GPS 下较常见 | 全部可能为 null，使用前必须判空 |
| maximumAge 缓存语义 | 支持 | 支持 | 支持 | 支持 | 支持 | 各实现缓存粒度不同，不要拿它当"精确回放"用 |
| file:// 协议 | API 存在但授权常被拒 | 同左 | 基本可用 | 按目录差异大 | — | 本地演示请用 localhost 服务器或示例内置 Mock 模式 |

## 4. 使用场景示例

### 4.1 场景一：单次定位展示（真实 + Mock 双路径）

**场景描述**：点击"定位"按钮获取当前位置，展示经纬度、精度圈与耗时；无权限/非 https 环境走 Mock 路径演示完整 UI 流程——两条路径共用同一套渲染函数。

```js
function locate() {
  setStatus('定位中…');
  const t0 = performance.now();
  const onOk = (pos) => renderPosition(pos, performance.now() - t0); // 真实/Mock 共用
  const onErr = (err) => renderError(err);

  if (mock.checked) { setTimeout(() => onOk(mockPosition()), 600); return; } // Mock 路径
  if (!('geolocation' in navigator)) { onErr({ code: 2, message: '环境不支持' }); return; }
  navigator.geolocation.getCurrentPosition(onOk, onErr, {   // 真实路径
    enableHighAccuracy: true, timeout: 10000, maximumAge: 0
  });
}
```

**预期效果**：Mock 开关打开时无需任何权限即可看到完整定位结果面板（含误差圆）；关闭后走真实授权流程。见 [示例 1](../../examples/html/07-geolocation/index-01-get-current-position.html)。

### 4.2 场景二：跑步轨迹记录（watchPosition + 轨迹图）

**场景描述**：持续监听位置变化，把每个点画到自绘 SVG 坐标图上并累计里程——跑步/骑行 App 的核心交互。

```js
let watchId = null, points = [];

startBtn.onclick = () => {
  points = [];
  watchId = navigator.geolocation.watchPosition((pos) => {
    points.push([pos.coords.longitude, pos.coords.latitude]); // 收集轨迹点
    drawTrail(points);                                        // 重画 SVG 折线
    updateDistance(points);                                   // 累计距离（简化为坐标线性换算）
  }, onError, { enableHighAccuracy: true, timeout: 15000, maximumAge: 1000 });
};

stopBtn.onclick = () => navigator.geolocation.clearWatch(watchId); // 必须取消，否则持续耗电
```

**预期效果**：Mock 模式下模拟一个"移动的点"沿轨迹行进，SVG 图上折线逐步生长、里程实时增加；停止后回调不再触发。见 [示例 2](../../examples/html/07-geolocation/index-02-watch-position.html)。

### 4.3 场景三：PositionOptions 调参与错误码演练

**场景描述**：用滑块/开关调节 `enableHighAccuracy / timeout / maximumAge`，分别用 Mock 按钮触发三种错误码，学会按 `code` 分支处理——真实项目里错误分支远比成功分支重要。

```js
tryLocateBtn.onclick = () => {
  const opts = {
    enableHighAccuracy: highAccuracy.checked,
    timeout: +timeoutRange.value,          // 滑块：1000 ~ 20000ms
    maximumAge: +maxAgeRange.value         // 滑块：0 ~ 120000ms
  };
  navigator.geolocation.getCurrentPosition(onOk, (err) => {
    // err.code 才是稳定判断依据；err.message 各浏览器文案不同，仅作展示
    errorPanel.textContent = 'code=' + err.code + '：' + codeName(err.code) + ' — ' + err.message;
  }, opts);
};
```

**预期效果**：把 timeout 拉到 1000ms 常态可复现 `TIMEOUT`；面板显示三种错误的完整处理文案。见 [示例 3](../../examples/html/07-geolocation/index-03-options-errors.html)。

### 4.4 场景四：与地图服务配合（不引 SDK 的轻量做法）

**场景描述**：拿到坐标后引导用户"查看大图"，不引入任何地图 JS SDK：跳转地图厂商的 URL 即可（移动端还可尝试唤起 App）。

```js
function openInMaps(lat, lng) {
  // 注意：API 返回 WGS84；跳国内地图前应先做 GCJ-02 偏移转换（此处仅示意）
  const gcj = wgs84ToGcj02(lat, lng);              // 转换函数可内联实现（公式公开）
  window.open('https://uri.amap.com/marker?position=' + gcj[1] + ',' + gcj[0]); // 高德
  // 备选：百度 BD-09 需再偏移一次；国际场景直接用 WGS84 拼 Google Maps URL
}
```

**预期效果**：新标签页打开地图并定位到该点。示例 1 中的"在地图中查看"按钮演示了这一思路。

### 4.5 场景五：定位失败的服务端降级（IP 定位思路）

**场景描述**：三种错误都出现时的兜底：改用服务端从请求 IP 粗定位（城市级），把"附近门店"列表按城市展示而不是街道展示。

```js
function locateWithFallback(onOk, onCity) {
  navigator.geolocation.getCurrentPosition(onOk, (err) => {
    // 精确定位失败 → 降级请求自己的后端，由后端根据请求 IP 返回城市级坐标
    fetch('/api/geo/ip-locate').then(r => r.json()).then(onCity).catch(() => {
      showManualPicker();                          // 最终兜底：让用户手动选城市
    });
  }, { timeout: 5000, maximumAge: 60000 });
}
```

**预期效果**：示例 3 的"完整降级链"按钮演示 精确定位 → IP 定位（Mock 数据） → 手动选择 的三级递进。

## 5. 实际应用案例分析

### 5.1 企业考勤打卡：定位 + 精度校验 + 防作弊

**背景**：某中后台考勤模块要求员工在公司 300 米围栏内打卡。上线后投诉集中在"在公司里却打不上卡"。

**方案选型**：
- `getCurrentPosition` + `enableHighAccuracy: true` + `timeout: 8000`；拿到坐标后先看 `accuracy`——**大于 200 米的结果直接判定不可信**，提示"信号弱，请到窗边重试"而不是拿去算距离（这就是大量误判的根源：精度 800 米的点算出"距公司 1.2 公里"毫无意义）。
- 距离计算用 Haversine 公式（球面距离），围栏判断留 20% 容差。
- Mock 模式作为 QA 工具内置在测试环境构建里，用环境变量开关，生产构建剔除。

**踩坑分析**：
1. **没有处理 PERMISSION_DENIED 的"永久拒绝"态**——用户第一次点了拒绝后，后续每次打卡都静默失败。增加 `permissions.query` 预检，denied 时直接展示"如何开启权限"的图文引导。
2. **WGS84 vs GCJ-02**——围栏坐标按高德后台标定（GCJ-02），而浏览器返回 WGS84，全公司点位集体偏移约 500 米。接入坐标转换后恢复正常。教训：**坐标系的"来源"和"消费"两端必须统一坐标系**。
3. **watchPosition 泄漏**——打卡页跳转后忘记 clearWatch，移动端后台持续耗电被系统弹出"耗电警告"。规范：组件卸载/页面 `visibilitychange` 隐藏时统一清理。

### 5.2 天气类站点：首屏本地化与"仅本次授权"

**背景**：天气站希望新访客首屏直接展示本地天气，但一进页面就弹权限框转化率极差。

**方案选型**：首屏先用 IP 级城市定位渲染内容（无权限、无等待）；页面底部放一个"更精确的本地天气"按钮，用户点击（明确手势）才发起 `getCurrentPosition`。Safari 的"仅本次"授权语义下，每次进页面重新询问的体验也因"绑定手势"而变得可接受。

**踩坑分析**：
1. iOS 上 `maximumAge` 过大导致展示"昨天缓存位置"的天气；最终 maximumAge 固定 5 分钟以内。
2. http 旧域名迁移时 API 消失，靠 `'geolocation' in navigator` 特性检测引导跳转 https 域，避免脚本报错白屏。

## 6. 最佳实践与常见坑

1. **永远先特性检测**：`'geolocation' in navigator` 不成立时（http 站点）直接走降级，不要让 TypeError 白屏。
2. **必设 timeout**：默认 Infinity 意味着 GPS 搜星可以让用户等到天荒地老；配合 maximumAge 做到"先给缓存值，再要新值"。
3. **用 accuracy 判断数据可用性**：accuracy > 500 米的结果用于"附近门店排序"这类精细场景就是灾难；先过滤精度再消费坐标。
4. **错误处理只信 err.code**：err.message 是给用户看的文案，各浏览器不一致；业务分支全部按 code 写。
5. **拒绝后不要反复弹**：PERMISSION_DENIED 时重试毫无意义（浏览器不再弹窗），改为展示开启权限的引导路径。
6. **watchPosition 必须 clearWatch**：组件卸载、页面隐藏时清理，否则移动端后台持续定位、耗电与隐私双重问题。
7. **注意坐标系**：API 出 WGS84，国内地图吃 GCJ-02/BD-09，混用必偏移几百米；落库前先统一坐标系并在字段上注明。
8. **把权限弹窗绑定到用户手势**：进页面就弹框转化率低且体验差；用"定位"按钮/开关的点击触发。
9. **提供降级链**：精确定位失败 → IP 定位（服务端） → 手动选择城市，三级兜底保证功能永远有出路。
10. **Mock 优先开发**：定位效果受环境/权限干扰大，先把 Mock 数据源接进 UI 流程再接真实 API，开发与 QA 效率完全不同。
11. **隐私合规**：明示用途（"用于计算打卡距离"）再申请权限；不要把坐标上传到与功能无关的域，避免合规风险。
12. **file:// 下不可依赖**：本地双击 HTML 时各浏览器授权行为不一，本地演示用 localhost 或 Mock 模式。

## 7. 参考资料

- MDN — Geolocation API 总览：<https://developer.mozilla.org/zh-CN/docs/Web/API/Geolocation_API>
- MDN — Geolocation.getCurrentPosition：<https://developer.mozilla.org/zh-CN/docs/Web/API/Geolocation/getCurrentPosition>
- MDN — Geolocation.watchPosition：<https://developer.mozilla.org/zh-CN/docs/Web/API/Geolocation/watchPosition>
- MDN — PositionOptions 与 Coordinates：<https://developer.mozilla.org/zh-CN/docs/Web/API/GeolocationPosition>
- MDN — Permissions API：<https://developer.mozilla.org/zh-CN/docs/Web/API/Permissions_API>
- W3C Geolocation 规范（第二版）：<https://www.w3.org/TR/geolocation/>
- MDN — 安全上下文（Secure Contexts）说明：<https://developer.mozilla.org/zh-CN/docs/Web/Security/Secure_Contexts>
- caniuse — Geolocation 兼容性数据：<https://caniuse.com/geolocation>
- GCJ-02 偏移背景与转换思路（社区整理）：<https://github.com/googollee/eviltransform>
