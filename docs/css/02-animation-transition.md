# 动画与过渡（transition / animation / keyframes）

> 面向前端开发人员的 CSS3 高级特性参考资料 —— 动效是界面的"时间维度"：`transition` 负责"状态 A → 状态 B"的补间，`@keyframes + animation` 负责"多关键帧、可循环、可编排"的时间线。理解渲染流水线，才能写出既流畅又不费电的动画。

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
| [index-01-transition-playground.html](../../examples/css/02-animation-transition/index-01-transition-playground.html) | transition 全参数实验台 + cubic-bezier 曲线可视化 + steps() 逐帧对比 |
| [index-02-keyframes-animation.html](../../examples/css/02-animation-transition/index-02-keyframes-animation.html) | @keyframes / animation 八个子属性实验台、play-state 播放控制 |
| [index-03-trigger-performance.html](../../examples/css/02-animation-transition/index-03-trigger-performance.html) | 三种触发方式（hover / class / IntersectionObserver）+ 性能对照 + reduced-motion |

---

## 1. 概念解释

### 1.1 transition 与 animation 的分工

- **`transition`（过渡）**：声明"当某个属性值发生变化时，用多长时间、什么节奏到达新值"。它**没有初始帧，也没有循环**——起点是旧值、终点是新值，必须由**状态变化**（hover、class 切换、JS 修改）触发。适合：按钮反馈、面板展开、颜色微调等**双向、对称**的交互补间。
- **`@keyframes + animation`（关键帧动画）**：先把"一条时间线上的若干个关键帧"命名定义，再由 `animation-*` 属性调度播放。它可以**自动播放、无限循环、来回往返、停在某一帧、中途暂停**，还能在一个元素上叠加多条动画。适合：加载指示器、无限轮播、入场编排、装饰性动效。

一句话记忆：**transition 是"被动响应的补间"，animation 是"主动执行的时间线"**。

### 1.2 解决什么问题

- **消除状态突变**：人眼对"闪变"极其敏感，无过渡的显示/隐藏、变色、位移会被感知为"闪烁"或"卡顿"；100~300ms 的补间能显著提升"系统在响应我"的感受。
- **引导注意力与解释因果**：元素从哪来、到哪去（入场方向）、层级如何切换（对话框缩放自按钮位置），动效为界面提供空间叙事。
- **表达等待与状态**：spinner、骨架屏 shimmer、进度环，都是纯 CSS 动画的经典舞台，零 JS、零图片。
- **降本**：用合成器动画替代 JS 逐帧改样式（`setInterval` + `style.left`），把工作量从 CPU 主线程转移到合成器线程，主线程卡顿也不掉帧（详见 1.3）。

### 1.3 底层原理：渲染流水线与"什么动画才流畅"

浏览器把每帧画面画出来要经过四步（简化模型）：

```
Style（计算样式） → Layout（布局/回流） → Paint（绘制/重绘） → Composite（合成）
```

1. **Layout 属性**：`width / height / margin / top / left` 等。改它们会触发**重排**，代价最高——尤其是 animation 循环改 `left` 时，每帧都在重新布局整棵树（或局部）。
2. **Paint 属性**：`color / background / box-shadow` 等。不重排但要**重绘**像素；大面积、大模糊时 paint 成本很高。
3. **Composite 属性**：`transform` 与 `opacity`。浏览器把元素提前"抬升"为独立合成层，动画只修改层的位移/缩放/透明度矩阵，**由合成器线程在 GPU 上完成，不经过 Style/Layout/Paint**——这就是"只动 transform/opacity"这条铁律的由来。
4. **合成层（layer）**：被提升的元素拥有独立纹理，`translate3d / will-change: transform` 等都能触发提升。但层不是免费的：每层占显存（宽×高×4 字节），层爆炸会导致内存暴涨、初始化变慢——所以 `will-change` 要**精准、可回收**，不能全局撒网。
5. **Layout thrashing（布局抖动）**：在同一个 JS 循环里**交替"读布局（offsetTop/getBoundingClientRect）→ 写样式"**，每次读都强制浏览器同步重排，一帧内可能触发几十次 reflow。解法是**读写分离（批处理）**，或直接改用 transform 动画。
6. **缓动函数的本质**：一个"时间进度 t(0→1) → 属性进度 p"的映射函数。`linear` 恒等映射；`ease` 系列是三次贝塞尔；`steps(n)` 是阶梯映射——把连续时间切成 n 个台阶，实现"逐帧"观感。
7. **`prefers-reduced-motion`**：操作系统"减弱动态效果"开关会暴露给 CSS 媒体查询。前庭功能障碍、晕动症用户会因大幅位移动画眩晕，**装饰性动画应能被一键关停**——这是无障碍的硬要求，不是可选项。

---

## 2. 语法说明

### 2.1 transition 全参数

```css
/* 标准写法：transition 是四个子属性的简写 */
transition: <property> <duration> <timing-function> <delay>;

/* 示例：transform 用 0.3s ease，box-shadow 延迟 0.1s */
.btn {
  transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1),
              box-shadow 0.3s ease 0.1s;   /* 第二组：延迟 100ms 起步 */
}

/* 精确写法（等价于上面的展开） */
.btn {
  transition-property: transform, box-shadow;
  transition-duration: 0.3s, 0.3s;   /* 逗号数量与 property 一一对应，不够则循环取值 */
  transition-timing-function: cubic-bezier(0.22, 1, 0.36, 1), ease;
  transition-delay: 0s, 0.1s;
}
```

| 子属性 | 默认值 | 说明 |
| --- | --- | --- |
| `transition-property` | `all` | 参与过渡的属性名；`none` 关闭所有过渡。**写 `all` 是性能陷阱**（见第 6 节） |
| `transition-duration` | `0s` | 过渡时长；**为 0 时过渡完全不生效**（包括 delay 也不生效） |
| `transition-timing-function` | `ease` | 每个属性的缓动；也接受 `steps()`/`cubic-bezier()` |
| `transition-delay` | `0s` | 延迟；负值表示"快进"——从进度中段直接开始 |

**哪些属性可以过渡**：有"中间值"的属性均可——长度类（width/height/margin/padding…）、颜色类（color/background-color/border-color…）、`opacity`、`transform`、`box-shadow`/`text-shadow`、`filter`、`clip-path`（同形状数）、`grid-template-columns/rows`（Chrome 107+）。**离散值不可平滑过渡**：`display`、`font-family`、`visibility`（特殊：延迟翻转，见坑 6.6）。

### 2.2 缓动函数

```css
/* 关键字（都是内置贝塞尔） */
.a { transition-timing-function: ease; }        /* 快出慢入，默认 */
.b { transition-timing-function: linear; }      /* 匀速，适合循环动画 */
.c { transition-timing-function: ease-in; }     /* 慢进快出：离场 */
.d { transition-timing-function: ease-out; }    /* 快进慢出：入场首选 */
.e { transition-timing-function: ease-in-out; } /* 两端慢：往返 */

/* 自定义贝塞尔：4 个参数是两个控制点坐标 */
.f { transition-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1); }
/*    x 必须在 [0,1]；y 可以超出 → 产生"回弹/过冲"（overshoot） */

/* 阶梯：n 段台阶；start=时间到先跳（帧保留首帧），end=时间到再跳 */
.g { transition-timing-function: steps(8, end); }
```

常用贝塞尔速查：出入场收尾 `cubic-bezier(0.22, 1, 0.36, 1)`（easeOutQuint 观感）；回弹 `cubic-bezier(0.34, 1.56, 0.64, 1)`；Material 标准曲线 `cubic-bezier(0.4, 0, 0.2, 1)`。

### 2.3 @keyframes 与 animation 全参数

```css
/* 1) 先定义关键帧时间线 */
@keyframes slide-in {
  from { opacity: 0; transform: translateX(-24px); }  /* 0% 可写 from */
  60%  { opacity: 1; }                                 /* 中间可插任意百分比帧 */
  to   { opacity: 1; transform: translateX(0); }       /* 100% 可写 to */
}

/* 2) 再用 animation 简写调度 */
.card {
  animation: slide-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) 0.2s 1 both;
  /*        名称      时长      缓动                 延迟  次数 填充 */
}

/* 3) 展开的八个子属性 */
.card {
  animation-name: slide-in;
  animation-duration: 0.5s;
  animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
  animation-delay: 0.2s;         /* 负值 = 跳过开头，直接从中间播（做错峰利器） */
  animation-iteration-count: 1;  /* 次数或 infinite */
  animation-direction: normal;   /* normal / reverse / alternate / alternate-reverse */
  animation-fill-mode: both;     /* none / forwards / backwards / both：决定首尾帧是否应用 */
  animation-play-state: running; /* running / paused：JS 可切换实现播放/暂停 */
}
```

要点：

- **简写中两个时间值**：第一个时间解析为 `duration`，第二个为 `delay`——只写一个就是 duration。
- **`fill-mode: both`** 是入场动画的"标准配置"：`backwards` 让延迟期间停在第一帧（否则会先闪现原始状态），`forwards` 让播完后停在最后一帧（否则会跳回原始状态）。
- **`direction: alternate` + `infinite`** = 来回摆动，做呼吸、漂浮最省事。
- **多动画叠加**：`animation: spin 2s linear infinite, pulse 1s ease infinite;` 逗号分隔，同名属性以后写的为准。
- **JS 控制**：`el.getAnimations()` / `el.style.animationPlayState = 'paused'`；监听 `animationend/animationstart/animationiteration` 事件可做编排。

---

## 3. 浏览器兼容性

> 以下为大致基线（依据 caniuse 数据整理，仅作选型参考，上线前请以实际目标用户环境为准）。

| 特性 | Chrome | Edge | Firefox | Safari | 移动端简述 | 坑点备注 |
| --- | --- | --- | --- | --- | --- | --- |
| `transition` | 26 | 12 | 16 | 9 | iOS Safari 9 / Android WebView 4.4+ 基线无虞 | 老版 WebKit 需 `-webkit-`；`transition: all` 隐式过渡不可控 |
| `cubic-bezier()` / `steps()` | 26 | 12 | 16 | 9 | 与 transition 同代 | y 值可越界做回弹；x 越界会被浏览器截断 |
| `@keyframes` / `animation` | 43（无前缀） | 12 | 16 | 9 | 全主流移动浏览器可用 | 旧内核（<43）需 `-webkit-keyframes`；iOS 上 infinite 动画耗电明显 |
| `animation-play-state` | 43 | 12 | 16 | 9 | 同上 | `paused` 不阻止 delay 阶段的 `backwards` 填充 |
| `will-change` | 36 | 79 | 36 | 9.1 | 移动端普遍支持但层预算更紧 | 是"提示"不是"命令"，滥用反而掉帧、爆显存 |
| `IntersectionObserver` | 51 | 15 | 55 | 12.1 | 微信 X5/现代 WebView 均可用 | 根内滚动容器需传 `root`；旧项目降级用 scroll+rect |
| `prefers-reduced-motion` | 74 | 79 | 63 | 10.1 | iOS 10.1+ 跟随系统"减弱动态效果" | Safari 不支持 media 特性 `prefers-reduced-motion: no-preference` 的老版本回退写法 |

---

## 4. 使用场景示例

### 4.1 场景一：按钮交互反馈（transition 的标准形态）

**场景描述**：悬停按钮时轻微上浮 + 阴影加深，按下时回落；只动 `transform` 与伪元素 `opacity`，全程合成器动画。

```html
<button class="btn">立即购买</button>
<style>
  .btn {
    position: relative;
    padding: 12px 28px;
    border: 0;
    border-radius: 10px;
    background: #4361ee;
    color: #fff;
    cursor: pointer;
    /* 只声明参与过渡的属性：transform + 伪元素 opacity，禁止 all */
    transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    /* 贝塞尔 y>1 → 轻微回弹，反馈更"Q" */
  }
  /* 阴影放在伪元素上：hover 时只改 opacity（合成器友好），
     直接过渡 box-shadow 数值则会逐帧重绘 */
  .btn::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    box-shadow: 0 10px 24px rgba(67, 97, 238, 0.45);
    opacity: 0;
    transition: opacity 0.25s ease;
    pointer-events: none;  /* 不挡住按钮自身的 hover 与点击 */
    z-index: -1;           /* 垫到按钮下层 */
  }
  .btn:hover  { transform: translateY(-2px); }
  .btn:active { transform: translateY(0) scale(0.97); transition-duration: 0.08s; } /* 按压要快 */
  .btn:hover::after { opacity: 1; }
</style>
```

**逐段注释**：`translateY` 走合成器；回弹贝塞尔负责"弹一下"的手感；`:active` 把时长压到 80ms 让按压"跟手"；伪元素阴影层静止不动，仅透明度变化，paint 只发生一次。

**预期效果**：悬停上浮带轻微过冲、阴影淡入；按下快速回落，无任何布局抖动。

### 4.2 场景二：steps() 逐帧 —— 打字机与雪碧图动画

**场景描述**：用 `steps()` 做"逐格跳变"的打字机效果和逐帧动画，理解 start/end 的区别。

```css
/* 打字机：宽度从 0 到最大（ch 按字符数），steps 逐字符露出 */
.type {
  display: inline-block;
  overflow: hidden;        /* 裁掉未打出的字 */
  white-space: nowrap;
  width: 12ch;             /* 文本共 12 个字符宽 */
  animation: typing 2.4s steps(12, end) infinite alternate;
  /* 12 步 = 每步露出 1 字符；end = 每段末尾才跳变（更像逐字输入） */
}
@keyframes typing { from { width: 0; } to { width: 12ch; } }

/* 逐帧动画（雪碧图思路的纯 CSS 版）：8 帧图 8 步跳 */
.sprite {
  width: 64px; height: 64px;
  background:
    conic-gradient(from 0deg, #4361ee 0 45deg, #f72585 45deg 90deg,
                   #4cc9f0 90deg 135deg, #ffbe0b 135deg 180deg,
                   #8338ec 180deg 225deg, #3a86ff 225deg 270deg,
                   #ff006e 270deg 315deg, #06d6a0 315deg 360deg);
  animation: roll 1.6s steps(8, end) infinite;
  /* 8 步每步转 45°，观感是"逐格"而非平滑旋转 */
}
@keyframes roll { to { transform: rotate(360deg); } }
```

**预期效果**：文字一个一个出现再倒退消失；色轮按 45° 一格"哒哒哒"地转，与平滑旋转形成鲜明对照。

### 4.3 场景三：IntersectionObserver 进入视口触发入场编排

**场景描述**：卡片列表滚动进入视口时依次上浮入场（stagger 错峰），核心 API 是 `IntersectionObserver`，错峰用 `transitionDelay`。

```html
<div class="reveal-list">
  <div class="reveal">卡片 1</div>
  <div class="reveal">卡片 2</div>
  <div class="reveal">卡片 3</div>
</div>
<style>
  /* 初始态：透明 + 下移，元素本身静止（无动画在跑） */
  .reveal {
    opacity: 0;
    transform: translateY(24px);
    transition: opacity 0.5s ease, transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
  }
  /* 进入视口后加上类：过渡到可见态 */
  .reveal.is-inview { opacity: 1; transform: none; }
</style>
<script>
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;      // 只处理"进入"这一侧
      entry.target.classList.add('is-inview');
      io.unobserve(entry.target);             // 只入场一次，避免反复触发
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  // threshold 15% 露出才触发；rootMargin 让底部提前 40px 开始

  // 错峰：同一屏内的卡片按序号延迟，形成波浪式入场
  document.querySelectorAll('.reveal').forEach((el, i) => {
    el.style.transitionDelay = `${(i % 6) * 80}ms`;  // 每屏 6 个一组
    io.observe(el);
  });
</script>
```

**预期效果**：滚动到哪，哪里的卡片以 80ms 间隔依次浮入；已入场的不复播。

### 4.4 场景四：无限循环加载指示器（keyframes 编排）

**场景描述**：三点加载动画——同一 keyframes、负 delay 错相、`alternate` 摆动，一个关键帧定义服务三个元素。

```css
.dot {
  width: 10px; height: 10px; border-radius: 50%;
  background: #4361ee;
  animation: bounce 0.9s ease-in-out infinite alternate;
  /* alternate：0→1→0 来回；ease-in-out 让两端自然减速 */
}
.dot:nth-child(2) { animation-delay: 0.15s; }  /* 正负皆可；负值表示"从进度中段开始" */
.dot:nth-child(3) { animation-delay: 0.3s; }
@keyframes bounce {
  from { transform: translateY(0) scale(1); opacity: 0.6; }
  to   { transform: translateY(-12px) scale(1.15); opacity: 1; }
}
```

**预期效果**：三点波浪式跳动，循环播放，主线程繁忙时合成器依然平滑。

### 4.5 场景五：无障碍兜底 —— prefers-reduced-motion

```css
/* 全站兜底：用户系统开启"减弱动态效果"时，压缩所有动画时长 */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;   /* 保留 animationend 事件可触发 */
    animation-iteration-count: 1 !important; /* 关停无限循环 */
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;        /* 关闭平滑滚动 */
  }
}
```

**预期效果**：装饰性动画瞬间完成、循环停止；信息传达不丢失（状态直接呈现终态）。

---

## 5. 实际应用案例分析

### 案例一：电商首页"楼层"入场编排（营销页）

**需求**：大促首页十几个楼层，要求滚动到位后楼层内商品卡依次入场，低端机上不能卡。

**方案选型**：`IntersectionObserver` 触发 + `transform/opacity` 过渡 + 每屏错峰 `transitionDelay`。没有用 scroll 监听（每帧读 `getBoundingClientRect` 强制同步布局），没有用 JS 逐帧动画库（体积与主线程成本）。

**踩坑记录**：

1. **初始状态闪烁**：第一版把 `opacity: 0` 写在 CSS，但 JS 加载慢时用户先看到"空白楼层"再闪入场。解法：`<html class="no-js">` 默认可见，JS 就绪后替换为 `js` 类，选择器写成 `.js .reveal { opacity: 0 }`，无 JS 环境内容照常可读（渐进增强）。
2. **图片加载打断入场**：图片解码发生在动画中途，首帧明显掉帧。解法：入场动画的 `transform` 从 `translateY(24px)` 改为 `scale(0.98) + translateY(12px)`，同时给图片容器固定宽高比（`aspect-ratio`），解码抖动被限制在层内。
3. **无限轮播楼层耗电**：某楼层用 `infinite` 动画做氛围光，在 iOS Safari 上被系统降帧。解法：`@media (prefers-reduced-motion: reduce)` 关停 + 页面不可见时（`visibilitychange`）手动暂停 `play-state`。

### 案例二：中后台侧边栏折叠（B 端高频交互）

**需求**：侧栏 240px ⇄ 64px 折叠，菜单文字淡出，图标 tooltip 化，动画要求 60fps。

**方案选型**：**不改 `width`，改 `transform` 不现实**（侧栏参与文档流布局，改 transform 会让右侧内容不回流，等于"盖住"而非"腾出"）。正确做法是：**把布局过渡收敛为一次性的受控行为**——`width` 过渡 + `transition: width 0.25s ease`，同时把过渡期间的重排控制在侧栏子树；菜单文字用 `opacity` + `white-space: nowrap; overflow: hidden` 收窄，避免文字换行闪动。这是"布局动画不可避免时，把它的波及面降到最小"的典型案例。

**踩坑记录**：

1. **图表重绘卡顿**：侧栏内有 ECharts 图表，width 过渡期间每帧 resize 重绘。解法：监听 `transitionend` 后才调用 `chart.resize()`，过渡期间用 `overflow: hidden` 裁剪。
2. **`transition: all` 连坐**：早期写成 `transition: all .25s`，折叠时背景色、圆角也被拉长，观感"肉"。解法：显式列出 `width, opacity`。
3. **折叠状态持久化**：动画中途刷新页面，CSS 类已持久化但动画从"初始值"跳到"终值"闪一下。解法：首帧渲染时给根元素加 `preload` 类禁用全部过渡，`requestAnimationFrame` 两帧后移除。

---

## 6. 最佳实践与常见坑

1. **只动 `transform` 与 `opacity`**：这是唯一的"零重排零重绘"组合；需要动尺寸时优先想 `scale()` 等价方案，万不得已再动布局属性，并限制过渡范围。
2. **禁用 `transition: all`**：`all` 会让任何意外属性（颜色、内边距、甚至 flex 值）都被拉长，且属性变更时性能不可控；显式列出属性名，改动即"审查"。
3. **`will-change` 是手术刀不是维生素**：只在"即将持续动画"的元素上加，动画结束（`animationend`）后移除；全局对几百个元素声明 `will-change: transform` 会让移动端显存爆炸、反而掉帧。
4. **提升合成层用 `transform: translateZ(0)` 要有节制**：老项目里"一 blurry 就加 translateZ(0)"的习惯会让层数失控；先测量（DevTools → Layers 面板）再优化。
5. **JS 读写分离，杜绝布局抖动**：循环里先批量读（offsetTop/rect），再批量写；或用 `ResizeObserver`/`IntersectionObserver` 这类"浏览器择时回调"的 API 替代手动 rect 探测。
6. **`display: none` 没有过渡**：`display` 是离散值，切换瞬间生效，transition 来不及插值。方案：`visibility` + `opacity` + `pointer-events` 组合（visibility 会等过渡结束才翻转），或用现代的 `transition-behavior: allow-discrete` + `@starting-style`（Chrome 117+，降级需回退方案）。
7. **短动画、快入场慢出场**：微交互 150~250ms；页面级入场 300~500ms；超过 700ms 的过渡会让用户"等动画"。入场用 ease-out（快速出现），离场用 ease-in（迅速让位）。
8. **错峰用负 delay 或 transitionDelay**：`animation-delay: -0.5s` 让元素"从半路开始播"，比"等待后再播"的编排观感连续；列表 stagger 每 60~90ms 一档即可，太大显得拖沓。
9. **页面不可见时暂停无限动画**：`document.visibilitychange` 时把 `animation-play-state` 切到 `paused`，省电也避免切回标签页时的"追帧"。
10. **永远写 `prefers-reduced-motion` 兜底**：装饰性动画全关、必要动画降级为淡入淡出（opacity 不易引发眩晕）；这是 WCAG 2.3.3 的落地方式。
11. **测试"低端设备 + 低电量"**：DevTools CPU 4x/6x throttling 复现中低端手机；iOS 省电模式会主动降帧，`infinite` 动画尤其受影响。

---

## 7. 参考资料

- MDN — CSS transitions：https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_transitions
- MDN — 使用 CSS 动画：https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_animations/Using_CSS_animations
- MDN — `animation` 简写与子属性：https://developer.mozilla.org/zh-CN/docs/Web/CSS/animation
- MDN — `prefers-reduced-motion`：https://developer.mozilla.org/zh-CN/docs/Web/CSS/@media/prefers-reduced-motion
- MDN — IntersectionObserver API：https://developer.mozilla.org/zh-CN/docs/Web/API/IntersectionObserver
- CSS 规范 — CSS Animations Level 1：https://drafts.csswg.org/css-animations-1/
- CSS 规范 — CSS Easing Functions Level 1：https://drafts.csswg.org/css-easing-1/
- caniuse — CSS Animation / Transitions：https://caniuse.com/css-animation , https://caniuse.com/css-transitions
- Google Developers — 渲染性能（合成器动画原理）：https://web.dev/articles/rendering-performance
- Web Animation 性能工具：Chrome DevTools → Performance / Layers 面板
