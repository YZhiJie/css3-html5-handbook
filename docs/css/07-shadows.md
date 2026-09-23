# 阴影效果（box-shadow / text-shadow / drop-shadow）

> 面向前端开发人员的 CSS3 高级特性参考资料 —— 阴影是界面"海拔系统"（Elevation）的语言：一层阴影表达悬浮，多层阴影表达材质，`drop-shadow` 表达轮廓。

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
| [index-01-box-shadow-basics.html](../../examples/css/07-shadows/index-01-box-shadow-basics.html) | box-shadow 全参数交互实验台 |
| [index-02-neumorphism.html](../../examples/css/07-shadows/index-02-neumorphism.html) | 多层阴影材质感：新拟态（Neumorphism）控件 |
| [index-03-text-shadow.html](../../examples/css/07-shadows/index-03-text-shadow.html) | text-shadow：霓虹字、浮雕、长投影 |
| [index-04-drop-shadow.html](../../examples/css/07-shadows/index-04-drop-shadow.html) | filter: drop-shadow 与 box-shadow 的本质区别 |

---

## 1. 概念解释

### 1.1 三种阴影是什么

- **`box-shadow`**：沿**盒子边框盒（border-box）的矩形轮廓**投射阴影，参数控制偏移、模糊、扩散、颜色与内外方向。它是 UI 海拔系统（Material Design 的 elevation）的基础。
- **`text-shadow`**：沿**文字字形轮廓**投射阴影，无 spread、无 inset，可叠多层，是霓虹字、浮雕字、长投影的原料。
- **`filter: drop-shadow()`**：基于**元素渲染后的实际 alpha 通道**投射阴影——透明 PNG、SVG、带圆角的异形、`clip-path` 裁剪后的形状，阴影都会贴着真实轮廓走。

### 1.2 解决什么问题

- **层级表达**：纯色卡片堆在一起分不清先后，阴影用"海拔"暗示可交互性与浮层关系（Dialog > Dropdown > Card > Page）。
- **材质与光感**：多层阴影可以模拟"柔和环境光 + 定向光源 + 接触阴影"三段结构，让平面获得拟物质感（新拟态、玻璃拟态的底部）。
- **异形轮廓投影**：气泡的尖角、SVG 图标、透明底插图，`box-shadow` 只能给矩形，`drop-shadow` 才能贴合轮廓。
- **文字特效**：霓虹、描边、浮雕、3D 长投影，全部可用 `text-shadow` 纯 CSS 实现，零图片。

### 1.3 底层原理

**阴影是怎么画出来的**：浏览器把元素的形状（盒子或 alpha 轮廓）作为遮罩，在遮罩之外填充阴影色，再做高斯模糊。三个关键推论——

1. **模糊半径（blur）是标准差的两倍关系**：模糊值越大过渡越宽、越"虚"；为 0 时是硬边实心剪影；
2. **扩散半径（spread）在模糊之前把剪影整体放大/缩小**：负 spread 让阴影"收进"元素下方，产生贴地接触感；
3. **多层阴影从上到下绘制**：第一个阴影画在最上层，后面的被前面的盖住——所以"细的写前面，粗的写后面"。

**性能模型（重要）**：`box-shadow` 绘制发生在**绘制（paint）阶段**；大面积、大模糊的阴影会显著增加绘制区域。带阴影的元素做 `transform` 动画时，若阴影随元素一起重绘，每帧都在 paint——优化的本质是"**让阴影只在合成阶段动**"：

- 阴影本身静止（如 hover 抬升时仅元素位移，阴影层用伪元素+opacity 变化）；
- 使用 `will-change: transform` 或 `translate3d` 提升合成层，避免反复重绘；
- 避免对**大模糊阴影**做连续属性变更（改 `box-shadow` 值必然重绘）。

**与 `filter: drop-shadow()` 的性能差异**：`drop-shadow` 属于 `filter` 家族，天然会把元素提升为独立合成层，但滤波计算成本高于 `box-shadow`；对大面积、高频动画元素要谨慎，小图标则几乎无感。

**`inset` 内阴影**：方向反转，阴影画在盒子内部边缘，用于"凹陷"表达（输入框、新拟态按压态）。

---

## 2. 语法说明

### 2.1 box-shadow 完整语法

```
box-shadow: [inset] <offset-x> <offset-y> [<blur>] [<spread>] <color>;
box-shadow: 阴影1, 阴影2, …;      /* 逗号分隔多层，先写的在上层 */
box-shadow: none;
```

| 参数 | 可省略 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `inset` | 是 | 外阴影 | 关键字写在最前或最后均可；内阴影画在盒内 |
| `<offset-x>` / `<offset-y>` | 否 | 0 | 偏移量，可为负；**不写即无阴影**（除非有 spread） |
| `<blur>` | 是 | 0 | 模糊半径 ≥0，值越大越虚；不可为负 |
| `<spread>` | 是 | 0 | 扩散半径，可负：正=放大剪影，负=收缩 |
| `<color>` | 是 | currentColor | 建议显式写出；常用半透明黑/品牌色 |

```css
/* 单层常规 */
.card { box-shadow: 0 2px 8px rgba(0,0,0,.12); }

/* 三段式海拔：接触阴影(细) + 主阴影(中) + 环境阴影(大而淡) */
.card-elevated {
  box-shadow:
    0 1px 2px  rgba(16,24,40,.06),   /* ① 接触：贴地细线 */
    0 4px 12px rgba(16,24,40,.10),   /* ② 主体：中等范围 */
    0 16px 40px rgba(16,24,40,.14);  /* ③ 环境：大而柔和 */
}

/* 内凹（输入框 / 按压态） */
.well { box-shadow: inset 0 2px 6px rgba(0,0,0,.18); }

/* 用 spread 画"环"：聚焦态比 outline 更柔和 */
.ring { box-shadow: 0 0 0 4px rgba(59,91,219,.25); }
```

### 2.2 text-shadow 语法

```
text-shadow: <offset-x> <offset-y> [<blur>] <color>;   /* 可叠多层 */
```

与 `box-shadow` 的差异：**没有 `spread`、没有 `inset`**；阴影跟随字形（包括中文字形）；不影响布局。

```css
/* 霓虹：同色多层，模糊逐层放大，再补一层白芯 */
.neon {
  color: #fff;
  text-shadow:
    0 0 4px  #fff,
    0 0 11px #fff,
    0 0 19px #fff,
    0 0 40px #0ff,
    0 0 80px #0ff;
}

/* 浮雕：亮色上移 + 暗色下移，模拟顶光 */
.emboss {
  color: #dfe6e9;
  text-shadow: 0 -1px 0 rgba(255,255,255,.9), 0 1px 1px rgba(0,0,0,.35);
}

/* 长投影：45° 方向逐像素堆叠（JS 生成更省事） */
.long { text-shadow: 1px 1px 0 #b33939, 2px 2px 0 #b33939, 3px 3px 0 #b33939 /* … */; }
```

### 2.3 filter: drop-shadow 语法

```
filter: drop-shadow(<offset-x> <offset-y> [<blur>] <color>);  /* 可叠多层 */
```

| 对比维度 | box-shadow | drop-shadow |
| --- | --- | --- |
| 阴影轮廓 | border-box 矩形 | 实际渲染的 alpha 轮廓 |
| spread 参数 | 支持 | **不支持**（用多重叠加近似） |
| inset | 支持 | 不支持 |
| 作用于文字 | 不（文字阴影用 text-shadow） | 支持（跟随字形，效果同 text-shadow） |
| 透明镂空区域 | 阴影是实心矩形 | 镂空处**无阴影**（真"剪影"） |
| 触发合成层 | 否 | 是（filter 特性） |
| 典型代价 | 绘制面积增大 | 滤波计算成本，小元素无感 |

```css
/* 气泡尖角也带阴影：::before 画的三角是内容的一部分，
   drop-shadow 会把"主体+伪元素"合并成一个轮廓再投影 */
.bubble { filter: drop-shadow(0 6px 12px rgba(0,0,0,.2)); }

/* SVG 图标着色 + 投影一步到位 */
.icon svg { filter: drop-shadow(0 3px 5px rgba(0,0,0,.3)); }
```

### 2.4 相关辅助属性

| 属性 | 作用 |
| --- | --- |
| `will-change: transform` | 提前告知浏览器提升合成层，减少动画期重绘 |
| `contain: paint` | 限制绘制范围，防止大阴影溢出引发整页重绘 |
| `backface-visibility: hidden` | 配合 3D 变换的层提升小技巧 |
| `clip-path` | 与 drop-shadow 组合做异形卡片（注意顺序：先裁剪后投影需外层包裹） |

---

## 3. 浏览器兼容性

**以下为大致基线**（依据 caniuse 数据整理，实际支持请以最新 caniuse 为准）：

| 特性 | Chrome | Edge | Firefox | Safari | 移动端简述 | 坑点备注 |
| --- | --- | --- | --- | --- | --- | --- |
| `box-shadow` 基础 | 10（旧需 `-webkit-`） | 12 | 4 | 5.1（旧需 `-webkit-`） | 全线支持 | 无 spread 的老语法已被淘汰；`inset` 位置前后均可 |
| `box-shadow` 多层 | 10 | 12 | 4 | 5.1 | 全线支持 | 层级顺序"先写在上"，写反效果发闷 |
| `text-shadow` | 4 | 12 | 3.5 | 5 | 全线支持 | 不支持 spread/inset；大量模糊文字会拖慢绘制 |
| `filter: drop-shadow()` | 53（filter 统一语法） | 79 | 35 | 9.1（`-webkit-filter` 更早） | 现代内核全线支持 | 不支持 spread；多层叠加成本高；老 Safari 需 `-webkit-` 前缀 |
| `will-change` | 36 | 79 | 36 | 9.1 | 全线支持 | 滥用反而增加内存，只给真正要动的元素 |
| `clip-path` 异形+阴影组合 | 55 | 79 | 3.5（基础形状 55） | 9.1 | iOS/Android 现代内核 OK | `clip-path` 会把 box-shadow 一起裁掉，需外层包一层放阴影 |

> 坑点小结：三种阴影在现代浏览器兼容性都已"绿透"，真正的坑在**性能与层叠细节**（见第 6 节），以及老 WebKit 前缀残留（国内部分 Hybrid 容器仍内置旧内核）。

---

## 4. 使用场景示例

> 每个场景在示例目录中都有对应的可交互页面，此处给出核心代码与逐段注释。

### 场景 1：卡片海拔系统（中后台/内容站通用）

```css
/* 海拔三级制：hover 从 1 级升到 2 级，仅过渡阴影与位移，
   让"可点击卡片"有悬浮反馈 */
.card {
  box-shadow: 0 1px 2px rgba(16,24,40,.06), 0 1px 3px rgba(16,24,40,.10);
  transition: transform .2s ease, box-shadow .2s ease;
  will-change: transform;              /* 提升合成层，位移动画不吃绘制 */
}
.card:hover {
  transform: translateY(-4px);         /* 抬升 4px 强化"浮起" */
  box-shadow: 0 4px 12px rgba(16,24,40,.12), 0 16px 32px rgba(16,24,40,.14);
}
```

**预期效果**：鼠标扫过卡片列表时卡片依次"浮起"，阴影由浅变深，位移与阴影同步过渡，动画不掉帧。完整演示见 [index-01-box-shadow-basics.html](../../examples/css/07-shadows/index-01-box-shadow-basics.html)。

### 场景 2：新拟态（Neumorphism）控件组（工具类产品/设置面板）

```css
/* 新拟态核心：同底色 + 双向光影。
   光源假设在左上：亮阴影向左上，暗阴影向右下 */
:root { --nm-bg: #e0e5ec; --nm-dark: rgba(163,177,198,.6); --nm-light: rgba(255,255,255,.9); }
.nm-raised {                           /* 凸起：双外阴影 */
  background: var(--nm-bg);
  box-shadow: 9px 9px 18px var(--nm-dark), -9px -9px 18px var(--nm-light);
}
.nm-pressed {                          /* 凹陷：双内阴影 */
  background: var(--nm-bg);
  box-shadow: inset 6px 6px 12px var(--nm-dark), inset -6px -6px 12px var(--nm-light);
}
```

**预期效果**：按钮与面板"从底色里长出来"，按下时切换为凹陷态，材质感统一。完整演示见 [index-02-neumorphism.html](../../examples/css/07-shadows/index-02-neumorphism.html)。

### 场景 3：霓虹文字牌（营销页/深色 Banner）

```css
/* 五层霓虹：三层白芯紧贴字形 + 两层主题色大范围光晕。
   深色底 + 光晕是霓虹成立的前提，浅底会"发灰" */
.neon-sign {
  color: #fff;
  text-shadow:
    0 0 4px  #fff,          /* 白芯：让笔画"通电" */
    0 0 11px #fff,
    0 0 21px #fff,
    0 0 42px #0ff,          /* 青色光晕层 1 */
    0 0 82px #0ff;          /* 光晕层 2：范围越大透明度要越低 */
}
```

**预期效果**：深色背景上的标题像通电灯管，可配合闪烁动画（只动画 opacity 不动画阴影本身）。完整演示见 [index-03-text-shadow.html](../../examples/css/07-shadows/index-03-text-shadow.html)。

### 场景 4：异形气泡与 SVG 图标的贴轮廓阴影（客服组件/图标墙）

```css
/* 气泡：主体 + ::before 三角尖，drop-shadow 一次给整体轮廓投影 */
.bubble {
  position: relative;
  background: #4361ee; color: #fff;
  padding: 12px 16px; border-radius: 12px;
  filter: drop-shadow(0 8px 14px rgba(67,97,238,.35));
}
.bubble::after {
  content: "";
  position: absolute; left: 22px; bottom: -8px;
  border: 8px solid transparent;
  border-top-color: #4361ee;    /* CSS 三角与主体同色，轮廓合并 */
}
/* box-shadow 在这里会画一个矩形——尖角处"漏光"，两者区别一眼可见 */
```

**预期效果**：气泡的三角尖也带着阴影，看起来浑然一体；旁边用 `box-shadow` 的对照组则能看到矩形阴影的破绽。完整演示见 [index-04-drop-shadow.html](../../examples/css/07-shadows/index-04-drop-shadow.html)。

### 场景 5：阴影参数实验台（调试/教学工具）

```html
<!-- 滑杆分别控制 x / y / blur / spread，勾选框控制 inset 与颜色 -->
<input type="range" id="sx" min="-40" max="40" value="0">
```

```css
/* JS 每次拖动重写一行 box-shadow，实时预览参数语义 */
#stage {
  box-shadow: var(--sx, 0px) var(--sy, 10px) var(--blur, 20px) var(--spread, 0px) var(--color, rgba(0,0,0,.35));
}
```

**预期效果**：拖滑杆立即看到每个参数对阴影形态的影响，附"多层 vs 单层"切换。完整演示见 [index-01-box-shadow-basics.html](../../examples/css/07-shadows/index-01-box-shadow-basics.html)。

---

## 5. 实际应用案例分析

### 案例 1：电商移动端首页 —— 阴影升级与首屏绘制优化

**背景**：某电商 App 的 H5 首页，商品卡使用"单层大模糊阴影"（`0 10px 30px rgba(0,0,0,.25)`），低端安卓机上滚动掉帧明显；同时设计侧要求 hover/按压有"浮起"感。

**方案选型**：

1. **单层改多层**：`0 1px 2px + 0 2px 8px + 0 12px 24px` 三层结构，小模糊层负责"清晰度"，大模糊层透明度调低负责"氛围"——视觉层级感反而更强，且**大模糊层可以淡一些**减少着色成本；
2. **动画只动 transform 与 opacity**：抬升效果改成外层容器 `translateY(-4px)`，阴影层用伪元素承载并通过 `opacity` 0→1 切换，避免 `box-shadow` 值变化引发逐帧重绘；
3. **`will-change: transform` 只给卡片轨道容器**（一次提升，而不是给 60 张卡各提一层，防止合成层爆炸）；
4. **按压态用 spread 收缩**：`box-shadow: 0 0 0 1px rgba(0,0,0,.06)` 模拟边界的"边界感"，比加深模糊便宜。

**踩坑与分析**：

1. **iOS 上 `will-change` 滥用导致白屏**：60 个卡片全部提升合成层后内存激增。教训是"容器提升一次，子元素共享"，`will-change` 数量控制在个位数；
2. **暗色模式下阴影"消失"**：深底上黑阴影不可见。增加"暗色模式专用阴影令牌"：改用亮色描边 + 微光（`0 0 0 1px rgba(255,255,255,.06)`），海拔感由描边承担；
3. **圆角溢出**：阴影超出了滚动容器可视区，引发额外合成与裁剪问题，用 `overflow: clip` + `contain: paint` 收口。

**结论**：阴影的"贵"不在于写了几层，而在于**让浏览器重绘多少次**。静态多层 ≠ 性能差；动态改值 = 性能杀手。

### 案例 2：SaaS 中后台 —— 统一海拔令牌体系 + 暗色适配

**背景**：设计系统要覆盖 弹窗/下拉/卡片/输入框 四类浮层，早期各组件阴影各写各的，视觉评审反复打回"浮层关系不对"。

**方案选型**：

- 定义海拔令牌（结合变量篇）：`--elev-1`（卡片）、`--elev-2`（下拉）、`--elev-3`（模态）、`--elev-4`（Toast），每级都是"接触+主体+环境"三段式；
- 输入框聚焦环用 `box-shadow: 0 0 0 3px rgba(brand, .25)` 替代 outline，与海拔体系共用一套"环"语言；
- 暗色模式整体替换阴影令牌：黑阴影换"微亮描边 + 内高光"，浮层用 `--elev-*` 的暗色版本；
- 大型模态加 `contain: paint`，防止 40px 大模糊溢出把整页拉进重绘区。

**踩坑与分析**：

1. **下拉菜单阴影被父级 `overflow: hidden` 裁剪**：改用 fixed 定位弹层（或去掉祖先裁剪），阴影与内容一起逃逸；
2. **`backdrop-filter` 与阴影叠加性能差**：玻璃拟态面板（blur 背景）+ 大阴影在低端机帧率腰斩，降级方案是"半透明背景 + 阴影承担层级"，把 blur 留给高配设备；
3. **内阴影输入框在 Firefox 上发灰**：`inset` 阴影颜色透明度过高时与边框混色，统一把内阴影透明度提到 ≥.15 并配 1px 实线边框兜底；
4. **阴影令牌迁移**：老代码里散落的 37 种写法通过代码搜索 + 代码规范（阴影必须引用令牌）逐步收敛，评审机器人拦截新增魔法值。

**结论**：把阴影当"设计令牌"而不是"样式细节"管理，是中后台长期保持视觉一致性的关键。

---

## 6. 最佳实践与常见坑

1. **多层阴影写法记牢"先细后粗"**：先写的层在上层，接触阴影（细）在前、环境阴影（粗）在后，顺序反了会显得"闷"。
2. **动画阴影别直接改 `box-shadow` 值**：值变化必然重绘；用"伪元素阴影 + opacity 过渡"或"transform 抬升"替代。
3. **`will-change` 克制使用**：只给动画容器提升合成层，成片元素滥用会导致合成层爆炸、内存暴涨（尤其 iOS）。
4. **暗色模式阴影要换语言**：深底上黑阴影失效，改用 `0 0 0 1px rgba(255,255,255,.06)` 描边 + 微内高光表达层级。
5. **透明度建议范围**：普通卡片阴影透明度 6%～14%；超过 25% 会显得"脏"，除非是强氛围营销页。
6. **`box-shadow` 会被 `clip-path`/祖先 `overflow` 裁剪**：异形+阴影要外层包一层，弹层阴影要注意逃逸裁剪上下文。
7. **`drop-shadow` 没有 spread**：需要"扩散更大"的效果用两层 `drop-shadow` 叠加近似；同时它对高频大元素成本高，小图标才适合随便用。
8. **镂空图形必须用 `drop-shadow`**：透明 PNG/SVG 镂空处 `box-shadow` 仍会投出矩形，`drop-shadow` 才是贴轮廓剪影。
9. **text-shadow 无 spread/inset**：文字描边需求可用四方向 1px 阴影模拟，或直接用 `-webkit-text-stroke`；文字闪烁动画建议动 `opacity` 而非阴影值。
10. **聚焦环优先 box-shadow 而非 outline**：`0 0 0 3px rgba(...)` 环形更柔和且不受 `overflow` 裁剪影响（注意与无障碍要求不冲突，环必须清晰可见）。
11. **大模糊+大面积是绘制成本大户**：列表滚动场景把模糊控制在 24px 以内、透明度压低；能用边框/背景分层表达的层级别硬上阴影。
12. **老内核前缀兜底**：面向国内 Hybrid 容器时保留 `-webkit-box-shadow`/`-webkit-filter` 前缀行，写在标准属性之前。

---

## 7. 参考资料

- MDN — `box-shadow`：<https://developer.mozilla.org/zh-CN/docs/Web/CSS/box-shadow>
- MDN — `text-shadow`：<https://developer.mozilla.org/zh-CN/docs/Web/CSS/text-shadow>
- MDN — `filter: drop-shadow()`：<https://developer.mozilla.org/zh-CN/docs/Web/CSS/filter-function/drop-shadow>
- MDN — `will-change`：<https://developer.mozilla.org/zh-CN/docs/Web/CSS/will-change>
- MDN — 合成层与性能优化（渲染性能）：<https://developer.mozilla.org/zh-CN/docs/Web/Performance>
- CSS Backgrounds and Borders Level 3 规范（box-shadow 定义）：<https://www.w3.org/TR/css-backgrounds-3/#box-shadow>
- Filter Effects Module Level 1 规范（drop-shadow 定义）：<https://drafts.fxtf.org/filter-effects-1/#funcdef-filter-drop-shadow>
- Material Design — Elevation（海拔系统设计参考）：<https://m3.material.io/styles/elevation/overview>
- caniuse — CSS box-shadow：<https://caniuse.com/css-boxshadow>
- caniuse — CSS text-shadow：<https://caniuse.com/css-textshadow>
- caniuse — CSS filter 函数：<https://caniuse.com/css-filters>
- 新拟态设计集散地（参数灵感）：<https://neumorphism.io/>
