# 漫画 · 第 18 话 Geolocation：拿到坐标之前的三关

> 对应正文：[docs/html/07-geolocation.md](../../docs/html/07-geolocation.md) ｜ 原画：[EP.18-geolocation.svg](./EP.18-geolocation.svg)

## 登场角色

- **像素酱**：CSS 造型师，给"附近门店"页接定位——本地 http 测试站点上 `navigator.geolocation` 居然是 undefined；上线后一进页面就弹授权框，用户反射性点"阻止"，打卡功能集体失灵；还有人反馈点位离实际位置差了几百米。
- **标签君**：HTML5 结构师，本话主角。依次拆解安全上下文、权限模型、PositionOptions、三种错误码和坐标系偏移。

## 剧情梗概

Geolocation API 只回答一个问题：设备现在在哪（经纬度 ± 误差半径）。它不提供地图、不做逆地理编码，且只在**安全上下文**（https 或 localhost）暴露、必须用户授权。定位由 GPS/WiFi/基站/IP 多源融合，`accuracy` 给出本次结果的可信半径。这是一个错误分支远多于成功分支的 API——本话的核心是把每条失败路径都设计好。

## 分格解读

### 格1 · 痛点现场

两道门槛：①Chrome 50+/Firefox 55+ 起只在 https 或 localhost 暴露 API，http 页面 `navigator.geolocation` 直接是 `undefined`，不做特性检测就是 TypeError 白屏；②位置是敏感隐私，首次调用触发权限弹窗，进页面就弹的转化率极差，而一旦用户点了拒绝，浏览器不会再弹窗，只能引导去站点设置手动恢复。

### 格2 · 机制登场

三个方法：`getCurrentPosition(ok, err, options)` 单次定位；`watchPosition` 在移动时持续回调、返回 watchId；`clearWatch(id)` 取消（页面隐藏/卸载必须调，否则持续耗电）。PositionOptions 三参数：`enableHighAccuracy`（尽量用 GPS，更慢更耗电）、`timeout`（建议必设，默认 Infinity 会让用户干等）、`maximumAge`（可接受多久以内的缓存）。成功回调给 `coords.latitude/longitude/accuracy`——accuracy 是 68% 置信圆半径，是判断"这结果能不能用"的关键字段。错误回调只信稳定的 `err.code`：1 拒绝授权、2 定位不可用、3 超时。

### 格3 · 落地收束

三件落地大事：①**坐标系**——API 直出 WGS-84，高德/腾讯用 GCJ-02、百度用 BD-09，不转换直接上图点位偏移几百米，来源端和消费端必须统一坐标系；②**授权姿势**——弹窗绑定"定位"按钮的用户手势，用 `permissions.query` 预检（granted 静默定位、denied 显示开启引导），accuracy 大于阈值的结果直接判不可信；③**降级链**——精确定位失败 → 服务端 IP 城市级定位 → 手动选择城市，保证功能永远有出路。开发阶段先接 Mock（把成功回调抽象注入，真实/Mock 共用同一套渲染逻辑），不受环境与权限干扰。

## 码叔划重点

1. 先特性检测、必设 timeout；错误只按 err.code 分支，denied 别反复弹，改展示开启引导。
2. accuracy 先过滤再消费；权限弹窗绑用户手势；watchPosition 用完必须 clearWatch。
3. API 出 WGS84、国内地图吃 GCJ-02/BD-09，两端坐标系不统一必偏几百米。

## 自测一题

**问**：用户在公司里打卡却被判定"距公司 1.2 公里"，代码算距离的公式没错，最可能漏掉了哪一步？

**答**：漏掉了对 `coords.accuracy` 的校验。定位结果是"经纬度 + 误差半径"的组合：室内信号弱时系统可能返回一个 accuracy 高达 800 米的粗略坐标，用这个点去算围栏距离，得出"1.2 公里"在数学上正确、在业务上无意义。正确做法是消费坐标前先过滤精度——accuracy 大于业务阈值（如 200 米）就判定结果不可信，提示"信号弱，请到窗边重试"，而不是拿去算距离。此外还要排查 WGS84/GCJ-02 坐标系是否统一：围栏坐标若按高德后台（GCJ-02）标定，而浏览器返回 WGS84 未转换，全体点位会稳定偏移约 500 米。

## 动手实验

- 单次定位全流程（真实 + Mock 双路径）：[examples/html/07-geolocation/index-01-get-current-position.html](../../examples/html/07-geolocation/index-01-get-current-position.html)
- watchPosition 持续定位 + 内联 SVG 轨迹绘制：[index-02-watch-position.html](../../examples/html/07-geolocation/index-02-watch-position.html)
- PositionOptions 调参面板 + 三种错误码演练：[index-03-options-errors.html](../../examples/html/07-geolocation/index-03-options-errors.html)

## 下一话预告

第 19 话《拖放 API》——从桌面拖一张图片进网页：dragstart 到 drop 的事件链与 dataTransfer 的规矩。
