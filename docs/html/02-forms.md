# 表单增强（Enhanced Forms）

> 面向前端开发人员的 HTML5 高级特性参考资料 —— 新输入类型、验证体系与 Constraint Validation API，让浏览器成为表单的第一道质检员。

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
| [index-01-input-types.html](../../examples/html/02-forms/index-01-input-types.html) | 全家桶输入类型 + datalist + output + fieldset/legend + label 关联 |
| [index-02-validation-api.html](../../examples/html/02-forms/index-02-validation-api.html) | Constraint Validation API：validity 状态实时面板 + setCustomValidity + novalidate 自定义验证 |
| [index-03-user-valid-pseudo.html](../../examples/html/02-forms/index-03-user-valid-pseudo.html) | `:valid`/`:invalid` 与 `:user-valid`/`:user-invalid` 的体验差异 + autocomplete |

---

## 1. 概念解释

### 1.1 表单增强是什么

HTML5 表单增强是一套"**把校验与输入体验下沉到浏览器**"的机制，由三部分组成：

1. **语义化输入类型**：`email/url/number/range/date/color…`——浏览器据此渲染合适的控件与**合适的移动端虚拟键盘**，并内建格式校验；
2. **声明式验证属性**：`required/pattern/min/max/step/minlength…`——校验规则写在标签上，浏览器在提交时自动执行；
3. **Constraint Validation API**：`checkValidity()/reportValidity()/setCustomValidity()/validity` 对象——JS 侧读取与介入同一套校验管线。

一句话概括：以前"输入格式对不对"要靠 JS 逐字段手写，现在**规则声明给浏览器，浏览器免费执行**；开发者只在"业务级校验"（如密码强度、两次密码一致）时介入。

### 1.2 解决什么问题

- **移动端键盘联动**：`type="email"` 唤起的键盘自带 `@` 与 `.com`；`type="tel"` 是纯数字拨号键盘；`inputmode` 可进一步微调。用户少按两层切换键，转化率直接受益。
- **消灭手写正则样板代码**：邮箱、URL、数字范围、必填这些"八股校验"由原生管线处理，JS 只做业务校验。
- **统一的无障碍提示链路**：校验失败时，浏览器把错误与控件关联（ARIA `aria-invalid` / 错误气泡），读屏用户能收到一致反馈——前提是你用了 `label` 与规范结构。
- **原生控件的红利**：`date/color/range` 直接得到跨平台原生 UI；`datalist` 得到"输入 + 候选"组合控件。

### 1.3 底层原理

**约束校验管线（Constraint Validation Pipeline）**：每个可校验元素（`input/select/textarea/button[form]…`）内部持有一个 `ValidityState` 对象。表单提交时，浏览器按以下顺序执行：

1. 收集所有"候选提交按钮"与可校验控件；
2. 对每个控件依次检查约束：`typeMismatch → valueMissing → tooLong/tooShort → rangeUnderflow/rangeOverflow → stepMismatch → patternMismatch`，最后是**自定义约束**（`setCustomValidity` 设置的非空消息）；
3. 全部通过 → 触发 `submit` 事件、表单真正提交；任一失败 → **阻止提交**，浏览器在第一个非法控件上弹出错误气泡并聚焦它，表单触发 `invalid` 事件（不冒泡）。

关键点：**`invalid` 事件不冒泡**，监听全表单必须用捕获阶段委托。另一个常被误解的点：`required` 空值对应 `valueMissing`；`pattern` 只对"非空值"检查——空值归 `required` 管，两者分工明确。

**`novalidate` 的意义**：它不关闭 API，而是**跳过"提交时自动拦截"这一步**。表单仍会持有 validity 状态、`checkValidity()` 依然可用。这就是"自定义验证"的理论基础——用 `novalidate` 接管提交时机，自己决定何时/如何展示错误（错误文案样式完全可控、错误位置可聚合到顶部等），同时复用原生校验引擎。

**`:user-invalid` 与 `:invalid` 的区别是体验的分水岭**：`:invalid` 在页面加载后立刻命中（邮箱框还空着就红了），用户莫名其妙；`:user-invalid`（及 `:user-valid`）只在**用户交互之后**（输入过且失焦、或尝试提交）才命中。它的实现原理是浏览器内部维护 "user-modified / focused" 标志位。该特性 2023 年起进入全绿基线，是"红色报错不吓人"的最优解。

**`autocomplete` 与浏览器填充**：`autocomplete` 告诉浏览器"这个字段语义上是什么"（`name/email/tel/new-password/current-password/one-time-code…`），密码管理器与系统自动填充据此工作。`autocomplete="off"` 在密码字段上常被 Chrome 忽略——浏览器认为这损害用户安全。

---

## 2. 语法说明

### 2.1 输入类型一览

| 类型 | 控件/键盘行为 | 配套属性 | 备注 |
| --- | --- | --- | --- |
| `email` | 文本键盘 + `@`/`.com`；提交时校验邮箱格式 | `multiple`（逗号分隔多邮箱） | 校验是"宽松 RFC"，`a@b` 也能过 |
| `url` | 键盘带 `/`、`.com`；校验绝对 URL | — | 无协议头（`example.com`）会判非法 |
| `tel` | 纯电话拨号键盘；**不做格式校验**（各国格式差异大） | `pattern` 手工约束 | 校验交给 pattern 或 JS |
| `search` | 带清除按钮的搜索框（部分平台圆角） | — | 语义上可用于无障碍搜索地标 |
| `number` | 数字键盘（iOS）／带步进箭头 | `min/max/step` | 非法输入时 `value` 返回 `""` |
| `range` | 滑杆 | `min/max/step` | 默认 0~100；可配 `<output>` 实时显示 |
| `date` / `time` | 日期/时间选择器 | `min/max/step` | `step=1` 秒级（time） |
| `datetime-local` | 本地日期+时间 | `min/max/step` | 不含时区，提交值为 `2026-09-23T10:30` |
| `month` / `week` | 月/周选择器 | `min/max` | Firefox 长期未实现，降级为文本框 |
| `color` | 系统取色器 | — | 值恒为 `#rrggbb` 小写 |

**移动端键盘微调属性**（对 `text` 类输入尤其重要）：

| 属性 | 作用 | 示例 |
| --- | --- | --- |
| `inputmode` | 虚拟键盘形态：`numeric` / `decimal` / `tel` / `search` / `email`… | 验证码框 `<input inputmode="numeric">`（值仍是文本） |
| `enterkeyhint` | 回车键文案：`go/search/send/next/done…` | 搜索框 `enterkeyhint="search"` |
| `autocapitalize` | 首字母大写策略 | 用户名框 `autocapitalize="none"` |
| `autocorrect` / `spellcheck` | 自动更正/拼写检查 | 邮箱框关闭 |

### 2.2 验证属性

| 属性 | 适用的类型/元素 | 失败时 validity 标志 | 示例 |
| --- | --- | --- | --- |
| `required` | 绝大多数控件 | `valueMissing` | `<input required>` |
| `pattern` | text/search/tel/url/email/password | `patternMismatch` | `pattern="[0-9]{6}"`（模式隐式带 `^$`，不用写） |
| `min` / `max` | number/range/date 系 | `rangeUnderflow` / `rangeOverflow` | `min="1" max="100"` |
| `step` | number/range/date 系 | `stepMismatch` | `step="0.01"`（金额） |
| `minlength` / `maxlength` | 文本类 | `tooShort` / `tooLong` | maxlength 静默截断输入，minlength 才是校验 |
| `type` | — | `typeMismatch` | `type="email"` |
| `checked`/`selected` 与 group | radio/checkbox 组 | `valueMissing` | 同 `name` 一组至少选一 |

### 2.3 Constraint Validation API

```js
// 1) 读取校验状态：不弹任何 UI，纯数据
const el = form.elements.email;
el.validity;          // ValidityState：一组布尔标志 + valid 汇总
el.validity.valid;    // true = 所有约束都通过
el.validationMessage; // 非空 = 当前失败原因的本地化文案（只读）

// 2) 手动触发"浏览器原生错误气泡"（等价提交时的报错 UI）
form.reportValidity();        // 逐个检查整表单并弹出首个错误
el.reportValidity();          // 只针对单个控件

// 3) 静默检查：true/false，不弹 UI（适合自定义展示错误的位置）
if (!form.checkValidity()) { /* 自己渲染错误列表 */ }

// 4) 自定义约束：设置非空字符串 → 控件视为非法（customError=true）
if (pwd.value !== pwd2.value) {
  pwd2.setCustomValidity('两次输入的密码不一致');  // 置为非法
} else {
  pwd2.setCustomValidity('');                      // 必须手动清空！
}

// 5) invalid 事件：提交被拦截或 checkValidity 调用时触发，不冒泡
form.addEventListener('invalid', e => { /* e.target = 非法控件 */ }, true); // 捕获委托
```

`ValidityState` 完整标志位：

| 标志 | 含义 |
| --- | --- |
| `valueMissing` | 必填但为空 |
| `typeMismatch` | 格式不符（email/url） |
| `patternMismatch` | 不匹配 pattern |
| `tooLong` / `tooShort` | 超出 maxlength / 不足 minlength |
| `rangeUnderflow` / `rangeOverflow` | 低于 min / 高于 max |
| `stepMismatch` | 不符合步进 |
| `customError` | setCustomValidity 设置了非空消息 |
| `valid` | 以上全部为 false |

### 2.4 结构与关联标签

```html
<!-- fieldset/legend：为相关控件分组，读屏进入组时先报组名 -->
<fieldset>
  <legend>收货地址</legend>
  <!-- label 关联最佳实践：显式 for/id 优先（点击区域大、结构清晰）；
       包裹式适合 radio/checkbox 这类小控件 -->
  <label for="city">城市</label>
  <input id="city" name="city" required>
</fieldset>

<!-- datalist：输入 + 候选下拉；值仍可自由输入（不是 select） -->
<input list="city-list" name="city2">
<datalist id="city-list">
  <option value="北京"><option value="上海"><option value="深圳">
</datalist>

<!-- output：展示"计算/汇总"结果，语义上是表单的输出槽 -->
<input type="number" id="a" value="3"> × <input type="number" id="b" value="4">
<output for="a b" id="result">12</output>

<!-- novalidate：关闭提交拦截，接管校验展示 -->
<form novalidate>…</form>
```

---

## 3. 浏览器兼容性

> 以下为大致基线（依据 caniuse 与 MDN 数据整理，仅供参考，上线前请以目标用户实测为准）。

| 特性 | Chrome | Edge | Firefox | Safari | 移动端简述 | 坑点备注 |
| --- | --- | --- | --- | --- | --- | --- |
| 基础验证属性 required/pattern/min/max | 10+ | 12+ | 4+ | 10.1+ | 全部支持 | Safari 对错误气泡 UI 简陋，但管线行为一致 |
| `email/url/number/range` 类型 | 10+ | 12+ | 4+ | 10.1+ | 键盘联动全支持 | `number` 输入中文输入法下可能出现"半值"，读值要做兜底 |
| `date/time` 类型 | 20+ | 12+ | 57+ | 14.1+（此前桌面为空输入框） | iOS Safari 较早支持 | 老桌面 Safari（≤13）无控件，需 JS 日期选择器兜底 |
| `datetime-local` | 20+ | 12+ | 57+ | 16.4+ | iOS 较早支持 | Safari 桌面支持最晚；`month`/`week` 在 Firefox 仍未实现，降级为文本框 |
| `color` | 20+ | 12+ | 29+ | 12.1+ | 移动端均为系统取色器 | 值恒为 `#rrggbb` 小写，无法带透明度 |
| `datalist` | 20+ | 12+ | 4+ | 12.1+ | Android Chrome 表现好；iOS 体验因版本而异 | 候选样式不可自定义；Safari 早期只支持"下拉"形态 |
| `<output>` | 10+ | 12+ | 4+ | 5.1+ | 无问题 | 纯语义元素，无兼容风险 |
| `inputmode` | 66+ | 79+ | 95+ | 12.2+ | 移动端价值最大 | Firefox 桌面较晚；对桌面无副作用，放心加 |
| `enterkeyhint` | 77+ | 79+ | 94+ | 13.1+ | iOS/Android 回车键文案生效 | 桌面无意义，但写上无害 |
| Constraint Validation API | 10+ | 12+ | 4+ | 10.1+ | 无问题 | `reportValidity()` 在 Safari ≤14 的气泡位置曾不跟随滚动 |
| `:user-valid` / `:user-invalid` | 119+ | 119+ | 88+ | 16.5+ | 随内核同步 | 旧浏览器不命中该伪类——需保留 `:invalid` 作为兜底增强策略 |
| `autocomplete` 丰富令牌（new-password 等） | 14+ | 12+ | 4+ | 10.1+（部分令牌选择性支持） | 密码管理器生态差异大 | `autocomplete="off"` 在密码框常被忽略，属浏览器有意为之 |

---

## 4. 使用场景示例

### 场景一：注册表单（必填 + 格式 + 密码一致性）

**场景描述**：注册是约束校验最典型的战场——必填、邮箱格式、密码长度、两次一致。前两档交给原生，第三档用 `setCustomValidity`。

```html
<form id="reg" novalidate><!-- novalidate：接管提交，自己控制报错时机与样式 -->
  <label for="mail">邮箱 <input id="mail" name="mail" type="email" required autocomplete="email"></label>

  <label for="pwd">密码（至少 8 位） <input id="pwd" name="pwd" type="password" minlength="8" required autocomplete="new-password"></label>

  <label for="pwd2">确认密码 <input id="pwd2" name="pwd2" type="password" required autocomplete="new-password"></label>

  <button type="submit">注册</button>
  <p id="err" role="alert"></p><!-- 错误聚合区：role=alert 让读屏立即播报 -->
</form>

<script>
  const f = document.getElementById('reg');
  const pwd = f.pwd, pwd2 = f.pwd2;
  // 交叉校验：任何一侧密码变化都重新评估"两次一致"这一业务约束
  function syncCustom() {
    pwd2.setCustomValidity(pwd.value === pwd2.value ? '' : '两次输入的密码不一致');
  }
  pwd.addEventListener('input', syncCustom);
  pwd2.addEventListener('input', syncCustom);

  f.addEventListener('submit', e => {
    e.preventDefault();                    // 演示页不真提交
    syncCustom();                          // 提交前最后同步一次
    if (f.reportValidity()) {              // 原生气泡展示首个错误；全通过返回 true
      f.err.textContent = '✔ 校验全部通过（演示，未真的提交）';
    }
  });
</script>
```

**逐段注释**：`novalidate` 关闭提交拦截但不关闭 API；`autocomplete="new-password"` 提示密码管理器"这是新密码，别自动填旧密码"；`reportValidity()` 返回布尔值可直接当分支条件；`setCustomValidity('')` 必须在合法时显式清空，否则控件永远非法。

**预期效果**：提交空表单 → 浏览器聚焦邮箱并弹原生气泡；密码不一致 → 气泡显示自定义文案；全部合法 → 自定义成功提示。

### 场景二：配置面板（range + output + datalist）

**场景描述**：中后台的"生成配置"面板：滑杆选并发数、文本框配候选值、实时显示汇总。

```html
<label for="conc">并发数：<output id="conc-out" for="conc">8</output></label>
<input type="range" id="conc" min="1" max="64" step="1" value="8" list="conc-ticks">
<datalist id="conc-ticks"><!-- datalist 给 range 提供刻度点 -->
  <option value="8"><option value="16"><option value="32">
</datalist>

<label for="env">部署环境</label>
<input id="env" list="env-list" autocomplete="off">
<datalist id="env-list">
  <option value="dev"><option value="staging"><option value="prod">
</datalist>

<script>
  const r = document.getElementById('conc'), out = document.getElementById('conc-out');
  r.addEventListener('input', () => out.value = r.value); // input 事件拖动实时回调
</script>
```

**逐段注释**：`<output for="conc">` 语义上声明"我是 conc 的输出"；datalist 用在 range 上是刻度标记、用在 text 上是候选下拉——同一个元素两种玩法。

**预期效果**：拖动滑杆数字实时变化；环境框聚焦出现候选，也允许输入任意自定义值。

### 场景三：移动端登录页（键盘联动）

**场景描述**：手机号 + 验证码登录，键盘形态直接影响输入效率。

```html
<!-- tel → 纯数字拨号键盘 -->
<label>手机号 <input type="tel" inputmode="numeric" autocomplete="tel"
        pattern="1[3-9]\d{9}" maxlength="11" enterkeyhint="next"></label>
<!-- 验证码：type=text + inputmode=numeric（不要用 number：number 会隐藏输入内容外的一切） -->
<label>验证码 <input inputmode="numeric" pattern="\d{6}" maxlength="6"
        autocomplete="one-time-code" enterkeyhint="done"></label>
```

**逐段注释**：`autocomplete="one-time-code"` 让 iOS 直接从短信里提取验证码建议到键盘上方；验证码用 `text + inputmode="numeric"` 而不是 `type="number"`，因为 number 的滚轮/清除行为不适合定长验证码。

**预期效果**：手机号框弹拨号键盘；验证码框弹出数字键盘并出现"来自短信"的一键填充条。

### 场景四：聚合式错误提示（自定义验证 UI）

**场景描述**：设计规范要求错误显示在表单顶部列表而非逐字段气泡——这是 `novalidate + checkValidity()` 的标准舞台。

```js
form.addEventListener('submit', e => {
  e.preventDefault();
  // checkValidity() 静默检查：不弹气泡，把控制权完全交给开发者
  if (form.checkValidity()) return doSubmit();
  const errors = [...form.elements]
    .filter(el => el.willValidate && !el.validity.valid)
    .map(el => `${el.name}: ${el.validationMessage}`); // 本地化错误文案免费获得
  errBox.innerHTML = errors.map(t => `<li>${t}</li>`).join('');
  errBox.hidden = false;
  form.elements[0]?.focus(); // 聚焦第一个控件，读屏从头部开始播报
});
```

**逐段注释**：`willValidate` 过滤掉 reset 按钮、隐藏控件等"不参与校验"的元素；`validationMessage` 直接复用浏览器翻译好的文案；最后手动聚焦，保证键盘用户不迷路。

**预期效果**：提交非法表单 → 顶部聚合列出全部错误；不再出现原生气泡。

---

## 5. 实际应用案例分析

### 案例一：电商结算页 —— 原生校验与业务校验的分层协作

某电商结算页含地址、配送时间（`datetime-local`）、留言等 20+ 字段。团队确立三层校验架构：

1. **第一层（HTML 原生）**：必填、`type=email`、`pattern`（手机号）、`minlength`。收益：零 JS 维护、移动端键盘联动免费获得。踩坑：`pattern` 里写 `^$` 锚点导致全量失配——**pattern 隐式带锚点**，去掉后修复。
2. **第二层（业务交叉校验）**：优惠券与积分互斥、地址需与配送范围匹配，用 `setCustomValidity` 挂到对应控件，把"业务非法"翻译成和原生一致的报错通道。踩坑：`setCustomValidity` 设置后忘了在合法分支清空，导致字段"永远红"——团队最终封装成 `setFieldError(el, msg|null)` 单一入口。
3. **第三层（服务端）**：原生校验可被开发者工具绕过，服务端必须全量复查——**前端校验只为体验，不为安全**。
4. **踩坑三：`:invalid` 红色风暴**。上线初期用 `:invalid` 直接标红，用户刚进页面就满屏红框，客诉激增。切换为 `:user-invalid`（配 `:invalid` 兜底）后负反馈归零。这是本案例最值得移植的经验：**错误展示的时机比错误的规则更重要**。

### 案例二：中后台低代码表单引擎 —— Constraint API 作为统一校验内核

某中后台自研表单引擎（配置 JSON → 渲染 React 表单），把 Constraint Validation API 作为内核而非自研校验器：

1. **方案选型**：对比过纯 JS 校验库方案。选择原生内核的理由：① JSON schema 里的 `required/min/max/pattern` 可直接映射为 DOM 属性，一份配置同时驱动 UI 与校验；② `validationMessage` 提供多语言文案，省掉错误文案国际化一整层；③ 动态显隐字段时，浏览器自动跳过 `hidden` 字段（不参与校验），省掉"隐藏字段要不要校验"的判定逻辑。
2. **踩坑一**：`number` 输入在输入法"半值"状态下 `value` 为空字符串，引擎误判"必填未填"。解法：提交前用 `valueAsNumber` 二次读取并区分 `NaN` 与空串。
3. **踩坑二**：`invalid` 事件不冒泡，引擎初期监听不到字段级失败。统一改为捕获阶段委托 `form.addEventListener('invalid', fn, true)`。
4. **结论**：原生 API 的"边界行为"（hidden 跳过、锚点隐式、invalid 不冒泡）是文档冷知识但工程高频坑；把它们固化进引擎的公共层，业务侧就再也不用踩。

---

## 6. 最佳实践与常见坑

1. **每个输入都必须有 `<label>`**：显式 `for/id` 优先；点击 label 聚焦控件、读屏朗读字段名。placeholder 不能替代 label——输入后消失，且对比度往往不达标。
2. **错误展示优先 `:user-invalid`**，`:invalid` 只做兜底（旧浏览器增强降级）；否则"页面未动、满屏红"劝退用户。
3. **`setCustomValidity` 必须在合法时显式清空**（传 `''`），否则 customError 永久为 true、控件永远非法。建议封装成单一函数管理。
4. **`pattern` 隐式首尾锚定**，不要写 `^…$`；标志位用 `pattern="…"` 无法带 `i` 修饰——大小写不敏感场景在 pattern 内用字符类表达。
5. **`invalid` 事件不冒泡**：全表单监听用捕获阶段 `addEventListener('invalid', fn, true)`，或逐控件绑定。
6. **提交被 `required` 拦截时不会触发 `submit` 事件**——想在提交前统一做日志/埋点，注意原生拦截会"吞掉"这次 submit。
7. **验证码/金额等数字输入用 `inputmode="numeric"` + `type="text"`**，不要 `type="number"`：后者禁止部分字符、滚轮误改值、maxlength 失效。
8. **密码字段用 `autocomplete="new-password"` / `current-password`**，让密码管理器正确工作；`autocomplete="off"` 在密码框常被浏览器忽略，别指望它阻止填充。
9. **`maxlength` 是静默截断不是校验错误**（不产生 tooLong 交给用户看到的机会），需要提示"还能输入几个字"时用 JS 读 `value.length` 展示计数器。
10. **fieldset/legend 分组一组 radio/checkbox**：读屏报组名（"配送方式：××"），单独的 label 只报选项名。
11. **动态隐藏的字段不参与校验**（`display:none` 或 `hidden` 的控件 `willValidate=false`），这是双刃剑：配合显隐逻辑很方便，但"隐藏但仍需提交的原始值"要改用 `type="hidden"` 或只读展示。
12. **服务端必须重新校验**：所有 HTML 校验都能被绕过；前端约束只改善体验，不是安全边界。
13. **`reportValidity()` 一次只展示一个错误**（逐字段依次），聚合式错误列表请用 `checkValidity()` + 自渲染。

---

## 7. 参考资料

- MDN · HTML 表单指南（表单校验）：https://developer.mozilla.org/zh-CN/docs/Learn/Forms/Form_validation
- MDN · Constraint Validation API：https://developer.mozilla.org/zh-CN/docs/Web/API/Constraint_validation
- MDN · `ValidityState`：https://developer.mozilla.org/zh-CN/docs/Web/API/ValidityState
- MDN · `<input>` 类型总览：https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/input
- MDN · `:user-invalid` 伪类：https://developer.mozilla.org/en-US/docs/Web/CSS/:user-invalid
- MDN · `datalist`：https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/datalist
- WHATWG · HTML Living Standard（Forms 章节）：https://html.spec.whatwg.org/multipage/forms.html
- MDN · HTML `autocomplete` 属性（令牌总表）：https://developer.mozilla.org/zh-CN/docs/Web/HTML/Attributes/autocomplete
- caniuse · `:user-invalid`：https://caniuse.com/mdn-css_selectors_user-invalid
- caniuse · `inputmode`：https://caniuse.com/mdn-html_global_attributes_inputmode
