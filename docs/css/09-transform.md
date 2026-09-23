# 变换 Transform（2D / 3D / perspective / preserve-3d）

> 面向前端开发人员的 CSS3 高级特性参考资料 —— `transform` 是唯一"不惊动文档流"的几何工具：位移、旋转、缩放、倾斜全部发生在**绘制结果**上，布局原封不动。它是高性能动画的基石，也是翻转卡、3D 立方体、视差层的原材料。

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
| [index-01-2d-transforms.html](../../examples/css/09-transform/index-01-2d-transforms.html) | 2D 变换实验台：translate/rotate/scale/skew + matrix 对照 + transform-origin |
| [index-02-3d-flip-card.html](../../examples/css/09-transform/index-02-3d-flip-card.html) | 3D 翻转卡片：perspective / preserve-3d / backface-visibility 全流程 |
| [index-03-3d-cube-carousel.html](../../examples/css/09-transform/index-03-3d-cube-carousel.html) | 3D 立方体 + 3D 轮播 + translateZ 层深视差 |

---

## 1. 概念解释

### 1.1 transform 是什么

`transform` 对元素应用一个**几何矩阵变换**——平移（translate）、旋转（rotate）、缩放（scale）、倾斜（skew）以及它们的 3D 扩展。关键性质：

- **不改变文档流**：元素布局位置、占位大小完全不变，"变形"只发生在最终绘制上。旁边的元素不会让位，父容器不会增高——这一半是坑（覆盖/溢出），一半是超能力（无重排的位移动画）。
- **作用对象是"变换后的盒子"**：先按 `transform-origin` 确定基准点，再按声明顺序**从左到右**依次应用各函数。顺序敏感：`translate(100px) rotate(45deg)` 与 `rotate(45deg) translate(100px)` 结果不同。
- **2D 与 3D**：一旦使用 3D 函数（`translateZ/rotateX/rotateY/rotate3d…`）或矩阵含 Z 分量，元素进入 3D 渲染上下文，此时"透视"由 `perspective` 提供。

### 1.2 解决什么问题

- **高性能动画**：动 `transform` 只走合成器（GPU 更新矩阵），不触发 Layout/Paint——把 `width` 动画换成 `scaleX`、把 `left` 换成 `translateX` 是性能优化的第一课。
- **几何装饰**：徽标的 45° 角标、面包屑的斜切分隔、对话框的入场缩放，全部不需要图片。
- **3D 界面**：翻转卡、立方体、封面轮播、层深视差——CSS 原生 3D 足以支撑大部分营销页需求，无需 WebGL。
- **精确居中/偏移**：`translate(-50%, -50%)` 居中、徽标 `translate(50%, -50%)` 挂角，都是"不影响布局"前提下的定位修正。

### 1.3 底层原理

1. **矩阵本质**：每个 transform 函数都对应一个 4×4 矩阵，浏览器把函数序列**按序相乘**得到一个总矩阵，一次性应用于元素的所有顶点。`matrix()`/`matrix3d()` 就是这个总矩阵的直书形式——理解了它就理解了"函数顺序为何影响结果"。
2. **transform-origin**：变换的基准点，默认 `50% 50%`（盒子中心）。旋转/缩放都绕它进行；`translate` 不受其影响（平移与基准点无关）。修改 origin = 先把坐标系平移到 origin、做变换、再平移回来。
3. **perspective（透视）**：3D 之所以"看起来立体"，是因为近大远小。`perspective: 800px` 定义"观察者到 z=0 平面的距离"——值越小透视越夸张（鱼眼感），越大越接近平行投影。它写在**父元素**上作用于所有子元素（共享一个灭点），或作为变换函数 `transform: perspective(800px) rotateY(45deg)` 只作用于单个元素（各自灭点）。
4. **transform-style: preserve-3d**：默认 `flat` 会把子元素"拍扁"到父元素平面上；`preserve-3d` 让子元素保留自己的 z 坐标，真正的 3D 结构（立方体的六个面必须有它）。注意：`overflow: hidden`、`filter`、`opacity < 1` 等属性会**强制打平** preserve-3d（常见"3D 失效"原因）。
5. **backface-visibility**：控制元素背面朝向观察者时是否可见。翻转卡的正反面各写 `backface-visibility: hidden`，配合 `rotateY(180deg)`，就得到"翻过去看到另一面"。
6. **合成层与性能**：被 transform 动画驱动的元素会被浏览器提升为合成层，动画期间由合成器线程更新纹理矩阵——主线程卡顿时动画依然流畅（对比 JS 逐帧改 `left`）。代价是层的显存开销与文本栅格化模糊风险（层被放大时文字先栅格化后放大）。

---

## 2. 语法说明

### 2.1 变换函数一览

| 函数 | 语法 | 说明 |
| --- | --- | --- |
| `translate()` | `translate(tx, ty?)` / `translateX/Y/Z(t)` | 平移；百分比基于**自身盒子尺寸**（居中技巧的基础） |
| `rotate()` | `rotate(angle)` / `rotateX/Y/Z(angle)` | 旋转；2D 的 rotate 等价 rotateZ；deg/turn/rad |
| `scale()` | `scale(sx, sy?)` / `scaleX/Y/Z(s)` | 缩放；无单位数字，1 为原样，负值=镜像翻转 |
| `skew()` | `skew(ax, ay?)` / `skewX/Y(angle)` | 倾斜（剪切变形）；常用做平行四边形 |
| `matrix()` | `matrix(a,b,c,d,e,f)` | 2D 总矩阵直书，对应 `matrix3d` 的 4×4 版本 |
| `perspective()` | `perspective(length)` | 作为函数时只对当前元素的后续函数生效 |

```css
/* 多函数组合：从左到右依次应用，顺序即语义 */
.target {
  transform: translate(50%, -50%) rotate(45deg) scale(1.2);
}
```

### 2.2 配套属性

| 属性 | 默认值 | 说明 |
| --- | --- | --- |
| `transform-origin` | `50% 50%` | 变换基准点；可用关键字/百分比/长度，3D 可写第三个 z 值 |
| `perspective` | `none` | 写在父级：为所有子元素提供统一透视；`none` = 平行投影 |
| `perspective-origin` | `50% 50%` | 观察点（灭点位置），改变"从哪个角度看" |
| `transform-style` | `flat` | `preserve-3d` = 子元素保留 3D 关系（立方体必需） |
| `backface-visibility` | `visible` | `hidden` = 背面朝向时隐藏（翻转卡必需） |

### 2.3 3D 空间搭建模板

```css
/* 场景三件套：透视（父） → 保 3D（中） → 变换（子） */
.scene  { perspective: 800px; }            /* 1. 舞台给透视 */
.card3d { transform-style: preserve-3d;    /* 2. 中间层保留 3D */
          transition: transform .6s; }
.card3d:hover { transform: rotateY(180deg); }

.face {
  position: absolute; inset: 0;
  backface-visibility: hidden;             /* 3. 各面藏起背面 */
}
.face--back { transform: rotateY(180deg); } /* 背面预翻 180° */
```

### 2.4 matrix 速记

```
matrix(a, b, c, d, e, f) 对应：
| a  c  e |      a/d = 缩放分量（含旋转的 cos）
| b  d  f |      b/c = 旋转的 sin（剪切也混在这两个值里）
| 0  0  1 |      e/f = 平移分量（px）
例：translate(20px, 30px) rotate(45deg) 的总矩阵可由 matrix() 一次写出
```

---

## 3. 浏览器兼容性

> 以下为大致基线（依据 caniuse 数据整理，仅作选型参考，上线前请以实际目标用户环境为准）。

| 特性 | Chrome | Edge | Firefox | Safari | 移动端简述 | 坑点备注 |
| --- | --- | --- | --- | --- | --- | --- |
| 2D transforms | 36（无前缀） | 12 | 16 | 9 | 主流移动内核全可用 | 老内核需 `-webkit-transform`；与 transition 组合时注意 9 以下 Safari |
| 3D transforms | 36（无前缀） | 12 | 16 | 9 | iOS 早期即支持（-webkit-） | Safari 15.4 前需 `-webkit-` 写法；老 Android 对嵌套 3D 性能弱 |
| `transform-origin` | 36 | 12 | 16 | 9 | 同上 | 关键字 `top left` 与百分比等价；z 分量需配合 3D 场景 |
| `perspective` / `perspective-origin` | 36 | 12 | 16 | 9 | 移动端可用 | 值过小（<200px）畸变严重；写在祖先上才有"共享灭点" |
| `transform-style: preserve-3d` | 36 | 12 | 16 | 9 | 移动端可用 | **`overflow:hidden`/`filter`/`opacity<1` 会强制打平**——3D 失效首要嫌疑 |
| `backface-visibility` | 36 | 12 | 16 | 9（前缀至 14） | iOS 可用 | Safari 长期只认 `-webkit-backface-visibility`，双写最稳 |
| 独立变换属性 `rotate/scale/translate` | 104 | 104 | 72 | 14.1 | 现代移动内核可用 | 与 `transform` 属性**叠加**而非覆盖；调试时注意两者同时存在 |

---

## 4. 使用场景示例

### 4.1 场景一：精确居中（transform 不占布局的经典应用）

**场景描述**：把浮层/弹窗绝对定位到容器正中，不依赖 flex/grid，兼容所有时代的浏览器。

```css
.overlay {
  position: absolute;
  top: 50%; left: 50%;            /* 先把盒子的"左上角"放到中心 */
  transform: translate(-50%, -50%); /* 再按"自身尺寸"回拉一半 */
  /* translate 的百分比基于自身：不知道元素宽高也能精确居中 */
}
```

**逐段注释**：`top/left: 50%` 参照**父容器**尺寸；`translate(-50%,-50%)` 参照**自身**尺寸——两者相加刚好居中。整个过程不触发重排（transform 不改变布局），浮层显隐时只更新合成层。

**预期效果**：任意尺寸的盒子精确居中；内容变化（文字增减）后依然居中，无需 JS 重算。

### 4.2 场景二：角标徽标（rotate + 偏移的组合定位）

**场景描述**：商品卡右上角"NEW"斜角标，旋转 45° 后挂在角上，超出部分被卡片裁剪。

```css
.badge-wrap { position: relative; overflow: hidden; } /* 裁掉徽标露出的部分 */
.badge {
  position: absolute;
  top: 14px; right: -34px;          /* 先放在右上角外延 */
  transform: rotate(45deg);         /* 转成 45° 斜带 */
  padding: 4px 40px;
  background: #f72585; color: #fff; font-size: 12px;
}
```

**预期效果**：缎带式角标横穿卡片右上角；旋转不影响布局，兄弟元素纹丝不动。

### 4.3 场景三：3D 翻转卡片（perspective + preserve-3d + backface 三件套）

**场景描述**：团队介绍卡，正面头像与姓名，悬停翻转展示简介。

```css
.flip-scene { perspective: 900px; }          /* 舞台：观察距离 900px */
.flip-inner {
  position: relative;
  transform-style: preserve-3d;              /* 内部保留 3D 关系 */
  transition: transform .7s cubic-bezier(0.4, 0, 0.2, 1);
}
.flip-scene:hover .flip-inner { transform: rotateY(180deg); }
.flip-face {
  position: absolute; inset: 0;
  backface-visibility: hidden;               /* 背对观察者时隐藏 */
  display: grid; place-items: center;
}
.flip-face--front { transform: rotateY(0deg); }
.flip-face--back  { transform: rotateY(180deg); } /* 背面预翻，翻过来时刚好朝前 */
```

**逐段注释**：三层结构缺一不可——`perspective` 提供近大远小；`preserve-3d` 让正反两面处于同一 3D 空间（否则背面会被拍扁叠在正面）；`backface-visibility: hidden` 让各自"翻过去"时消失。

**预期效果**：悬停卡片绕 Y 轴翻转，正面隐去、背面显现；翻转过程中有立体透视感。

### 4.4 场景四：3D 立方体（六面拼接）

**场景描述**：一个可旋转的 CSS 立方体，六个面用 `rotateX/Y + translateZ` 拼装。

```css
.cube { position: relative; width: 120px; height: 120px;
        transform-style: preserve-3d;
        animation: cube-spin 8s linear infinite; }
.cube__face {
  position: absolute; inset: 0;
  display: grid; place-items: center;
  border: 1px solid rgba(67, 97, 238, .6);
  background: rgba(67, 97, 238, .08);
}
.cube__face--front  { transform: translateZ(60px); }               /* 前面：半径 = 边长/2 */
.cube__face--back   { transform: rotateY(180deg) translateZ(60px); }
.cube__face--right  { transform: rotateY(90deg)  translateZ(60px); }
.cube__face--left   { transform: rotateY(-90deg) translateZ(60px); }
.cube__face--top    { transform: rotateX(90deg)  translateZ(60px); }
.cube__face--bottom { transform: rotateX(-90deg) translateZ(60px); }
@keyframes cube-spin {
  from { transform: rotateX(-20deg) rotateY(0turn); }
  to   { transform: rotateX(-20deg) rotateY(1turn); }
}
```

**逐段注释**：拼装口诀是"**先转正、再推出**"——`rotateY(90deg)` 把面转到朝右，`translateZ(60px)` 沿新的法线方向推出半边长。注意函数顺序：先 rotate 后 translate，Z 轴已随旋转指向侧面。

**预期效果**：一个缓慢自转、六面透光的立方体；父级加 `perspective` 后近面大远面小。

### 4.5 场景五：translateZ 层深（视差与悬浮）

```css
/* 层深：父级 perspective + preserve-3d，子层用 translateZ 拉开远近 */
.scene   { perspective: 600px; transform-style: preserve-3d; }
.layer-bg  { transform: translateZ(-80px) scale(1.15); } /* 远层：后移并放大补偿 */
.layer-mid { transform: translateZ(0); }
.layer-ui  { transform: translateZ(40px); }              /* 近层：更大更亮 */
/* translateZ 的正值把元素"推向观察者"→ 视觉变大；
   负值推远 → 变小（需配合 scale 补偿占位） */
```

**预期效果**：不同 z 层的元素随鼠标/滚动产生视差位移，画面获得纵深。

### 4.6 场景六：斜切标签页与平行四边形导航（skew 的经典应用）

**场景描述**：游戏/电竞风导航项是平行四边形，文字保持水平；斜切与文字回正分离在两层。

```css
.nav-item {
  position: relative;
  padding: 10px 28px;
  color: #fff; cursor: pointer;
}
.nav-item::before {
  content: "";
  position: absolute; inset: 0;
  background: #4361ee;
  transform: skewX(-14deg);      /* 只有背景层倾斜 */
  border-radius: 4px;
  z-index: -1;                    /* 垫到文字下面 */
}
/* 若直接在 .nav-item 上 skew，文字会跟着斜——
   "背景斜、文字正"是 skew 应用的黄金分层法 */
```

**逐段注释**：`skewX(-14deg)` 对伪元素做水平剪切变形，`z-index: -1` 把斜切背景垫到内容层之下；文字因不在变形层内而保持直立。hover 时给 `::before` 换色/加亮即可，无需触碰布局。

**预期效果**：一排互相衔接的平行四边形导航，选中项背景加亮；文字始终水平清晰。

---

## 5. 实际应用案例分析

### 案例一：电商商品卡 hover 组合动效（营销页/列表页）

**需求**：商品网格悬停时：卡片上浮 + 微缩放、图片放大、角标滑入、"找相似"按钮升起。要求 60fps，长列表不卡。

**方案选型**：全部动效收敛到 `transform + opacity`：卡片 `translateY(-6px)`，图片容器 `scale(1.06)`（配 `overflow:hidden` 裁剪），角标 `translateX(120%) → 0`，按钮 `translateY(100%) → 0`。一次 hover 只改 4 个合成器属性，`transition-delay` 微错峰制造层次。

**踩坑记录**：

1. **图片放大后模糊**：`scale(1.06)` 放大的是已栅格化的位图。解法：图片输出尺寸按"放大后"出图（多出 6% 分辨率成本可接受），或把 scale 加在容器、用 `img { width: 106% }` 的真实尺寸替换。
2. **圆角裁剪失效**：给图片容器加 `overflow: hidden` 后，某些浏览器把容器层拍平导致子层 3D 失效——本场景只有 2D 缩放，无影响；但同一模板复用到 3D 卡时改用 `clip-path: inset(0 round 12px)` 解决（clip-path 保留合成层路径裁剪）。
3. **触屏"粘滞 hover"**：移动端点击后 hover 态残留。解法：`@media (hover: hover)` 包裹全部 hover 规则，触屏设备直接不启用悬停动效。
4. **`will-change` 滥用**：早期给全列表卡片（200+ 个）统一加 `will-change: transform`，中端安卓显存暴涨掉帧。解法：只对 hover 中的元素动态加（`:hover` 内声明，或 JS mouseenter 时加、leave 后移除）。

### 案例二：中后台"拖拽排序"的 transform 位移（B 端）

**需求**：卡片列表拖拽排序，拖动跟手、松手后其他卡片"让位"动画。

**方案选型**：被拖卡片用 `transform: translate(x, y)` 跟手（不触发重排，拖拽丝滑）；其余卡片让位同样用 `transform: translateY(卡片高度)`，配 `transition: transform .2s`。**绝不改 DOM 顺序**直到松手——因为改顺序会销毁/重建节点，动画全断。松手后再一次性把 transform 归零、同步真实 DOM 顺序。

**踩坑记录**：

1. **transition 与拖拽打架**：被拖元素若带 transition，跟手会有"橡皮筋延迟"。解法：拖动开始时给被拖元素加 `transition: none` 类，松手移除。
2. **transform 后 getBoundingClientRect 失真**：让位中的卡片 rect 包含 transform 偏移，命中检测要减去当前位移，或直接用指针相对"槽位坐标"计算。
3. **文本模糊**：拖拽层因合成层缩放导致文字发虚。解法：拖拽期间避免非整数位移（`Math.round`），并避免在拖拽层上叠加 `scale`。

---

## 6. 最佳实践与常见坑

1. **记住顺序敏感性**：`rotate(90deg) translateX(100px)` 中 translate 沿旋转后的 X 轴（即"朝下"），与 `translateX(100px) rotate(90deg)` 完全不同。写 3D 时用"先转正、再推出"的口诀。
2. **transform 不影响文档流是双刃剑**：位移后的元素**依然占据原位**，可能覆盖别处、撑出滚动条（视觉虽没动，布局盒还在）；检查 `overflow` 与交互热区。
3. **preserve-3d 会被"拍扁"**：在 3D 祖先链上出现 `overflow: hidden`、`filter`、`opacity < 1`、`clip-path`、`contain: paint` 等，子树 3D 立即失效。3D 失效先查这批属性。
4. **Safari 的前缀遗留**：`backface-visibility` 老版本要 `-webkit-`；3D transform 在老 iOS 要 `-webkit-transform`。双写成本极低，兼容收益极高。
5. **百分比 translate 基于自身**：`translateX(-50%)` 是"自身宽度的一半"，不是父级——居中、挂角技巧全靠这一点，也是"位移没到位"的首要原因。
6. **别用 scale 放大位图文字**：`scale(2)` 会把已栅格化的文字拉虚；缩放文本优先改 `font-size`（接受重排），或保证元素初始就是大尺寸再缩小。
7. **动画只用 transform/opacity**：与 transition 章的结论一致——`translateX` 替代 `left`、`scaleX` 替代 `width`、`rotate` 替代"换图旋转帧"。
8. **`perspective` 写对位置**：写父级 = 多个子元素共享灭点（立方体/轮播的正确做法）；写成变换函数 `transform: perspective(800px) rotateY(…)` 则每个元素独立灭点，拼 3D 物体会"散架"。
9. **注意独立属性与 transform 的叠加**：现代 CSS 的 `rotate`/`scale`/`translate` 独立属性与 `transform` **同时生效**（先应用独立属性再应用 transform），迁移代码时不要两处都写。
10. **移动端 3D 性能预算**：低端安卓上嵌套 preserve-3d + 大面积层的合成开销高；3D 效果控制在单屏 3~5 个立方体/卡片量级，并给 `@media (prefers-reduced-motion: reduce)` 关停。
11. **矩阵调试法**：复合变换出问题时，用 `getComputedStyle(el).transform` 读取最终矩阵（matrix3d(...)），逐项核对缩放/旋转/平移分量，比肉眼猜快得多。

---

## 7. 参考资料

- MDN — transform：https://developer.mozilla.org/zh-CN/docs/Web/CSS/transform
- MDN — 使用 CSS 变换：https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_transforms/Using_CSS_transforms
- MDN — perspective：https://developer.mozilla.org/zh-CN/docs/Web/CSS/perspective
- MDN — transform-style：https://developer.mozilla.org/zh-CN/docs/Web/CSS/transform-style
- MDN — backface-visibility：https://developer.mozilla.org/zh-CN/docs/Web/CSS/backface-visibility
- CSS 规范 — CSS Transforms Module Level 2：https://drafts.csswg.org/css-transforms-2/
- Desandro — 3D 变换经典教程（Intro to CSS 3D transforms）：https://3dtransforms.desandro.com/
- caniuse — CSS 3D Transforms：https://caniuse.com/transforms3d
- caniuse — 2D Transforms：https://caniuse.com/transforms2d
