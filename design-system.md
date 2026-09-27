# Spark 设计系统 · 火花 v1.0.0

> 面向 18–35 岁人群的年轻活力风设计系统：高饱和撞色 + 有目的的微动效 + 严格的 WCAG 2.1 AA 可访问性。适用于 Web 端产品与漫画在线阅读器等界面。
>
> 硬约束速记：动效 200–500ms ｜ 圆角 8–24px ｜ 间距 8px 基数 ｜ 正文行高 1.4–1.6 ｜ 正文对比 ≥4.5:1、大字/图形 ≥3:1 ｜ 断点 767 / 1200。

## 1. 设计原则

1. **能量感**：高饱和紫青撞色 + 橙色点睛，页面同时最多一个渐变主视觉。
2. **秩序感**：8px 网格、四档圆角、五级字阶，活力建立在纪律之上。
3. **包容性**：所有配对色彩过 AA 对比度；焦点可见；触控目标 ≥44px。
4. **动效有目的**：每个动画都回答「什么变了」；`prefers-reduced-motion` 下全部退化为透明度过渡。

## 2. 色彩系统

### 2.1 核心色板（HEX / RGB / HSL 全量标注）

| Token | 角色 | HEX | RGB | HSL | 用途 |
| --- | --- | --- | --- | --- | --- |
| `--spark-primary` | 主色 · 电光紫 | `#7C3AED` | 124, 58, 237 | 263°, 83%, 58% | 主按钮、品牌强调、选中态、焦点环 |
| `--spark-secondary` | 辅色 · 活力青 | `#06B6D4` | 6, 182, 212 | 189°, 94%, 43% | 渐变、图形、图标、深底文字；**禁作白底正文** |
| `--spark-accent` | 强调 · 元气橙 | `#F97316` | 249, 115, 22 | 25°, 95%, 53% | CTA 点睛、徽章、热度；**白字禁搭**（配墨字） |
| `--spark-pink` | 趣味粉 | `#EC4899` | 236, 72, 153 | 330°, 81%, 60% | 收藏/喜欢、渐变端点、情感化提示 |
| `--spark-success` | 成功绿 | `#22C55E` | 34, 197, 94 | 142°, 71%, 45% | 成功态、完成勾、在线状态 |
| `--spark-warning` | 警示黄 | `#F59E0B` | 245, 158, 11 | 38°, 92%, 50% | 提醒、倒计时、等级 |
| `--spark-error` | 错误红 | `#EF4444` | 239, 68, 68 | 0°, 84%, 60% | 错误态、删除、危险操作 |
| `--spark-ink` | 墨色（中性基准） | `#0F172A` | 15, 23, 42 | 222°, 47%, 11% | 正文、深色背景 |

### 2.2 中性色阶（Slate 系）

`gray-50 #F8FAFC` ｜ `gray-100 #F1F5F9` ｜ `gray-200 #E2E8F0`（描边）｜ `gray-400 #94A3B8`（占位/禁用）｜ `gray-600 #475569`（次级正文，白底 7.6:1）｜ `gray-900 #0F172A`（正文，白底 17.9:1）

### 2.3 对比度安全配对表（WCAG 2.1 AA 实测值）

| 场景 | 前景 / 背景 | 对比度 | 结论 |
| --- | --- | --- | --- |
| 正文 | 墨 `#0F172A` / 白 | 17.9:1 | ✅ AAA |
| 次级正文 | `#475569` / 白 | 7.6:1 | ✅ AA |
| 紫色文字 | `#7C3AED` / 白 | 5.7:1 | ✅ AA 正文可用 |
| 青色小字 | `#0E7490`（青-700）/ 白 | 4.9:1 | ✅ 唯一可作白底小字的青 |
| 橙色小字 | `#C2410C`（橙-700）/ 白 | 5.2:1 | ✅ 唯一可作白底小字的橙 |
| 错误文字 | `#DC2626`（红-600）/ 白 | 4.8:1 | ✅ |
| 主按钮 | 白字 / 紫 `#7C3AED` 底 | 5.7:1 | ✅ |
| 强调按钮 | **墨字** / 橙 `#F97316` 底 | 6.4:1 | ✅（白字仅 2.8:1，禁止） |
| 次按钮 | 墨字 / 青 `#06B6D4` 底 | 7.4:1 | ✅ |
| 大字/图形 3:1 档 | 白 / `#EA580C`（橙-600）或 `#0891B2`（青-600） | 3.6:1 | ✅ 仅限 ≥24px 或图形 |

**文字降级规则**：青/橙/粉/黄在白底上只允许三种身份——①降级到 -700 深色变体写小字；②保持原色但只做 ≥24px 大字或图形；③做色块时配墨字。深底（墨色）上文字用 `#F8FAFC`（15.9:1）、`#E2E8F0`（13.1:1）、`#FCD34D`（琥珀-300）。

### 2.4 渐变与配比

- `--spark-gradient-primary`: `linear-gradient(135deg, #7C3AED 0%, #06B6D4 100%)` —— Hero、主视觉卡、进度条
- `--spark-gradient-sunset`: `linear-gradient(135deg, #F97316 0%, #EC4899 100%)` —— 徽章、点赞、庆祝场景
- 渐变上的文字：≥18px 加粗白色，或墨色；**禁止**在渐变上排长正文
- 画面配比 60/30/10：60% 白/灰-50 中性面 + 30% 墨字与描边 + 10% 高饱和色（同一屏高饱和色相 ≤3）

## 3. 字体系统

- **字体栈**：拉丁与界面 `Inter, 'PingFang SC', 'HarmonyOS Sans SC', 'MiSans', 'Microsoft YaHei', sans-serif`；代码 `'JetBrains Mono', 'SFMono-Regular', Menlo, monospace`
- **字重**：400 正文 ｜ 500 次强调 ｜ 700 标题 ｜ 900 Display（年轻化标识）
- **字阶**（桌面 → 移动）：

| 级别 | 字号/行高 | 字重 | 字距 | 用途 |
| --- | --- | --- | --- | --- |
| Display | 48/54 → 36/42 | 900 | −0.02em | 首页主标题 |
| H1 | 36/44 → 28/36 | 900 | −0.02em | 页面标题 |
| H2 | 28/36 → 24/32 | 700 | −0.01em | 区块标题 |
| H3 | 22/30 → 20/28 | 700 | 0 | 卡片标题 |
| Body-L | 18/28（1.56）→ 17/26 | 400 | 0 | 导语 |
| Body | 16/24（1.5） | 400 | 0 | 正文 |
| Caption | 14/20（1.43） | 400 | 0 | 辅助说明 |
| Overline | 12/16 | 700 | +0.08em 大写 | 眉题/标签 |

规则：正文行高锁定 1.4–1.6；中文正文不加字距，拉丁正文 −0.01em；段落最大宽度 72 字符（约 640px）；数字与代码用等宽栈。

## 4. 间距 · 圆角 · 图标 · 栅格

### 4.1 间距（8px 基数）

`4`（仅微调图标与文字间隙）｜ `8` ｜ `12` ｜ `16` ｜ `24` ｜ `32` ｜ `40` ｜ `48` ｜ `64`。组件内边距 16，卡片间 24，区块间 48/64。

### 4.2 圆角（8–24 四档）

| Token | 值 | 用途 |
| --- | --- | --- |
| `--spark-radius-sm` | 8px | 输入框、Chip、小按钮 |
| `--spark-radius-md` | 12px | 按钮、卡片、下拉 |
| `--spark-radius-lg` | 16px | 弹窗、大卡片 |
| `--spark-radius-xl` | 24px | Hero 卡、图片容器、Blob 装饰 |

### 4.3 图标

24px 网格，描边 **1.75px** 统一线重，圆头圆角（`stroke-linecap/join: round`）；语义动画见第 5 节；双色图标仅允许主色 + 墨色。

### 4.4 栅格与断点

| 断点 | 范围 | 列数 | 间距 | 页边距 |
| --- | --- | --- | --- | --- |
| Mobile | <767px | 4 列 | 16px | 16px |
| Tablet | 768–1199px | 8 列 | 24px | 32px |
| Desktop | ≥1200px | 12 列 | 24px | 内容容器 1160px 居中 |

跨断点策略：卡片 1 列 → 2 列 → 3–4 列；导航底部 Tab 栏 → 侧边栏；字号按第 3 节缩放。

## 5. 动效系统（200–500ms 硬约束）

### 5.1 时长与缓动

| 级别 | 时长 | 缓动 | 场景 |
| --- | --- | --- | --- |
| Micro | **200ms** | `cubic-bezier(0.4, 0, 0.2, 1)` | hover、按下、焦点环、图标微转 |
| Standard | **300ms** | `cubic-bezier(0.4, 0, 0.2, 1)` | 展开、切换、Toast |
| Emphasis | **450ms** | `cubic-bezier(0.34, 1.56, 0.64, 1)`（回弹） | 弹窗入场、庆祝、收藏 pop |
| Exit | **200ms** | `cubic-bezier(0.4, 0, 1, 1)` | 退场一律比入场快 |

### 5.2 微交互目录（hover / click / focus 触发）

| 触发 | 交互 | 规格 |
| --- | --- | --- |
| 按钮悬停 | 上浮 + 加深 | `translateY(-2px)` 200ms |
| 按钮按下 | 果冻压缩 | `scale(0.97)` 200ms |
| 焦点 | 光环生长 | `box-shadow: 0 0 0 3px offset 2px` 200ms |
| 卡片悬停 | 抬升 + 大阴影 | `translateY(-4px)` 200ms（仅可交互卡） |
| 收藏 | 心形回弹 pop | `scale(1 → 1.3 → 1)` 450ms 回弹 |
| 图标悬停 | 旋转 15°；点击摇摆 | 200ms / 450ms |
| 开关 | 滑块弹簧位移 | 300ms 回弹 |
| 成功反馈 | 对勾描边 | `stroke-dashoffset` 300ms |
| 输入聚焦 | 边框变色 + 光环 | 200ms |

氛围循环动画（骨架屏微光、Blob 漂浮）不属于交互动效，可 >500ms，但必须支持 `prefers-reduced-motion: reduce` 降级为静态。

## 6. 组件状态规范

### 6.1 按钮（四变体 × 五状态）

| 状态 | Primary（紫底白字） | Secondary（青底墨字） | Accent（橙底墨字） | Ghost（透明底紫字） |
| --- | --- | --- | --- | --- |
| Default | 紫 `#7C3AED` | 青 `#06B6D4` | 橙 `#F97316` | 无底，紫字 |
| Hover | 紫-700 `#6D28D9` + `translateY(-2px)` | 青-600 `#0891B2` | 橙-600 `#EA580C` | 灰-100 底 |
| Active | `scale(0.97)` | 同左 | 同左 | `scale(0.97)` |
| Focus-visible | 3px 光环 `#C4B5FD`，偏移 2px | 同左（青-200 `#A5F3FC`） | 同左（橙-200 `#FED7AA`） | 同左 |
| Disabled | `opacity .45 + saturate(.6)`，禁用指针，无位移 | 同左 | 同左 | 同左 |

通用：高度 44px（触控达标），内边距 0 24px，圆角 12px，字 16/700。

### 6.2 输入框

Default：灰-200 边 → Hover：灰-400 边 → Focus：紫边 + 3px 紫-200 光环 → Error：红-600 边 + 14px 红字提示（4.8:1）→ Disabled：灰-100 底 + 灰-400 字。高度 44px，圆角 8px。

### 6.3 卡片 / Chip / 开关 / 链接

- 卡片：白底、灰-200 边、圆角 16px；可交互卡 hover `translateY(-4px)` + `box-shadow 0 12px 32px rgba(15,23,42,.12)`；Focus-visible 同按钮光环
- Chip：圆角 8px，hover 灰-100，active `scale(.95)`，选中态紫底白字
- 开关：44×24 轨道，选中紫底，滑块 300ms 回弹位移
- 链接：下划线 `text-underline-offset: 3px`，hover 变紫-700，focus 光环

## 7. 落地代码（复制即用）

```css
:root {
  /* 色彩 */
  --spark-primary: #7C3AED;   --spark-primary-strong: #6D28D9;
  --spark-secondary: #06B6D4; --spark-secondary-strong: #0891B2;
  --spark-accent: #F97316;    --spark-accent-strong: #EA580C;
  --spark-pink: #EC4899;  --spark-success: #22C55E;
  --spark-warning: #F59E0B; --spark-error: #EF4444;
  --spark-ink: #0F172A; --spark-text-2: #475569;
  --spark-surface: #FFFFFF; --spark-surface-2: #F8FAFC;
  --spark-border: #E2E8F0;
  --spark-ring: 0 0 0 3px #C4B5FD;
  --spark-gradient-primary: linear-gradient(135deg,#7C3AED,#06B6D4);
  --spark-gradient-sunset: linear-gradient(135deg,#F97316,#EC4899);
  /* 形状与空间 */
  --spark-radius-sm: 8px; --spark-radius-md: 12px;
  --spark-radius-lg: 16px; --spark-radius-xl: 24px;
  --spark-space-1: 8px;  --spark-space-2: 16px; --spark-space-3: 24px;
  --spark-space-4: 32px; --spark-space-5: 48px; --spark-space-6: 64px;
  /* 动效（200–500ms 硬约束） */
  --spark-dur-micro: 200ms; --spark-dur-std: 300ms; --spark-dur-emph: 450ms;
  --spark-ease: cubic-bezier(.4,0,.2,1);
  --spark-ease-spring: cubic-bezier(.34,1.56,.64,1);
  --spark-shadow-lg: 0 12px 32px rgba(15,23,42,.12);
}
```

```html
<!-- 主按钮：AA 安全配对（白字/紫底），完整五状态 -->
<button class="spark-btn spark-btn--primary">立即开始</button>
<style>
.spark-btn { height:44px; padding:0 24px; border:0; border-radius:12px;
  font: 700 16px/1 Inter,'PingFang SC',sans-serif; cursor:pointer;
  transition: transform 200ms cubic-bezier(.4,0,.2,1), background 200ms; }
.spark-btn--primary { background:#7C3AED; color:#fff; }
.spark-btn--primary:hover  { background:#6D28D9; transform:translateY(-2px); }
.spark-btn--primary:active { transform:scale(.97); }
.spark-btn--primary:focus-visible { outline:none; box-shadow:0 0 0 3px #C4B5FD; }
.spark-btn--primary:disabled { opacity:.45; filter:saturate(.6); cursor:not-allowed; transform:none; }
</style>
```

## 8. 可访问性与响应式验收清单

- [ ] 所有文本配对来自 2.3 安全配对表；图形/大字 ≥3:1
- [ ] 全组件 `:focus-visible` 光环可见；操作顺序符合 DOM 顺序
- [ ] 触控/点击目标 ≥44×44px；表单错误同时用颜色 + 文字（不只靠颜色）
- [ ] `prefers-reduced-motion: reduce` 下仅保留透明度过渡
- [ ] 767 / 1200 两断点实测：字阶缩放、栅格列数、导航形态切换正常
- [ ] 渐变上无长正文；同一屏高饱和色相 ≤3

## 9. 跨平台一致性

1. **Token 命名**：`--spark-{类别}-{名称}-{变体}`，Web 为 CSS 变量，iOS/Android 端以同一份 JSON token 源生成。
2. **交付物**：`tokens.css`（本文件第 7 节）＋ 图标 SVG Sprite（1.75px 线重）＋ 组件状态表（第 6 节）。
3. **版本纪律**：色彩/字阶/动效 token 变更走 minor 版本；删除 token 走 major 并提供迁移对照表。
