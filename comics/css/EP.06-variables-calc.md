# 漫画 · 第 6 话 变量与 calc：CSS 的"运行时"与"计算器"

> 对应正文：[docs/css/06-variables-calc.md](../../docs/css/06-variables-calc.md) ｜ 原画：[EP.06-variables-calc.svg](./EP.06-variables-calc.svg)

## 登场角色

- **像素酱**：CSS 造型师，本话主角。被散落全项目的 37 处写死色值折磨，改个品牌色漏改一处就"花"。
- **标签君**：HTML5 结构师，演示 `:root` 与 `.card` 的作用域嵌套，以及一行 JS 全站换色的魔法。

## 剧情梗概

自定义属性与预处理变量的本质区别是"它是活的"：参与层叠、被 DOM 继承、可在运行时被 JS 修改。像素酱把魔法数字收敛进变量，学会用继承作用域换肤、用 `var()` 回退值兜底、用 calc 家族做混合单位运算，最后靠 `@property` 让变量也能参与动画。

## 分格解读

### 格1 · 痛点现场

`#4361ee` 这类"魔法数字"写死在无数条声明里，改主题色 = 全局搜索替换，漏改一处界面就花了。解法是把值收敛到 `:root` 的变量里：`--brand: #4361ee`，所有地方引用 `var(--brand)`，改一处全站生效，顺便消灭魔法数字。

### 格2 · 机制登场

变量沿 DOM 树向下继承，子元素取"最近祖先"的值——在 `.card` 上覆盖 `--accent`，其后代吃到品红，出了卡片自动还原全局的青色，**主题切换的本质就是利用继承的作用域覆盖**。JS 侧 `el.style.setProperty('--brand', …)` 一行即全站换色；`var(--gap, 8px)` 的回退值在变量未定义时兜底，避免"invalid at computed-value time"整条声明失效。

### 格3 · 落地收束

主题三段式：亮色写 `:root` 默认 → 暗色写 `[data-theme="dark"]` 覆盖同一组变量 → JS 改 `dataset.theme` 并用 localStorage 记住选择。`calc()` 让混合单位互相运算（`100% - 240px`），但**运算符两侧必须有空格**。未注册的变量对浏览器只是字符串、动画只能跳变；`@property` 声明 `syntax: '<angle>'` 等类型后，变量即可参与 transition/keyframes 逐帧插值。

## 码叔划重点

1. 变量参与层叠与继承，换肤 = 换一组变量；高频变化的变量挂在尽可能小的子树根上。
2. calc 运算符两侧必须有空格：`calc(100% - 10px)` 对，`calc(100%-10px)` 直接解析失败。
3. 未注册的变量是字符串不能插值；`@property` 注册类型后才能参与过渡与动画。

## 自测一题

**问**：在 `.card` 上覆盖了 `--accent: red`，卡片**外部**的 `.tag { background: var(--accent) }` 是什么颜色？为什么？

**答**：全局 `:root` 里 `--accent` 的颜色。变量沿 DOM 继承、取最近祖先，`.card` 的覆盖只影响其后代，出了卡片自动还原——这正是"作用域即换肤边界"，也是暗色模式只需在根节点覆盖一组变量的原理。

## 动手实验

- 变量作用域、继承与 JS `setProperty` 联动：[examples/css/06-variables-calc/](../../examples/css/06-variables-calc/index-01-variable-basics.html)
- `calc()/min()/max()/clamp()` 流体排版与安全间距：[index-02-fluid-typography.html](../../examples/css/06-variables-calc/index-02-fluid-typography.html)
- 主题切换实战：`data-theme` + `localStorage` 记忆：[index-03-theme-switcher.html](../../examples/css/06-variables-calc/index-03-theme-switcher.html)
- `@property` 注册类型 + 变量驱动的动画：[index-04-property-registration.html](../../examples/css/06-variables-calc/index-04-property-registration.html)

## 下一话预告

第 7 话《阴影》——界面的海拔系统：box-shadow、text-shadow、drop-shadow 三兄弟分工。
