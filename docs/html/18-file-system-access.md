# File System Access API

> 面向前端开发人员的 HTML5 高级特性参考资料 —— File System Access API 让网页直接读写本地文件系统：打开文件、保存文件、读写目录，无需上传下载。本章聚焦实战：showOpenFilePicker/showSaveFilePicker/showDirectoryPicker 三件套、权限管理、与拖拽/粘贴的配合。

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
| [index-01-file-system-access.html](../../examples/html/18-file-system-access/index-01-file-system-access.html) | 打开文件 + 保存文件 + 读写目录 + 权限管理 |

---

## 1. 概念解释

### 1.1 File System Access API 是什么

File System Access API 让网页获得「原生应用级」的文件系统能力：

- **showOpenFilePicker**：打开文件选择器，返回 FileSystemFileHandle
- **showSaveFilePicker**：打开保存对话框，返回 FileSystemFileHandle
- **showDirectoryPicker**：打开目录选择器，返回 FileSystemDirectoryHandle
- **FileSystemHandle**：文件/目录句柄，可读写、可持久化到 IndexedDB

### 1.2 解决什么问题

- **无需上传下载**：直接读写本地文件，不用先上传到服务器
- **真正的保存**：`Ctrl+S` 直接写入本地文件，不是下载副本
- **目录操作**：读取整个目录树，批量处理文件
- **权限持久化**：用户授权一次，下次直接读写（句柄存 IndexedDB）

### 1.3 底层原理

浏览器通过 File System Access API 暴露文件系统句柄，网页通过句柄读写文件。权限模型：

- **读取**：用户选择文件后自动获得读权限
- **写入**：需 `requestPermission({ mode: 'readwrite' })` 显式授权
- **持久化**：句柄可存入 IndexedDB，下次直接 `queryPermission` 检查

---

## 2. 语法说明

### 2.1 打开文件

```js
// 打开单个文件
const [handle] = await showOpenFilePicker({
  types: [{
    description: '文本文件',
    accept: { 'text/plain': ['.txt', '.md'] }
  }]
});
const file = await handle.getFile();
const text = await file.text();
```

### 2.2 保存文件

```js
// 保存新文件
const handle = await showSaveFilePicker({
  suggestedName: 'untitled.txt',
  types: [{
    description: '文本文件',
    accept: { 'text/plain': ['.txt'] }
  }]
});
const writable = await handle.createWritable();
await writable.write('Hello, World!');
await writable.close();
```

### 2.3 读写目录

```js
// 打开目录
const dirHandle = await showDirectoryPicker();

// 遍历目录
for await (const [name, handle] of dirHandle.entries()) {
  if (handle.kind === 'file') {
    console.log('文件:', name);
  } else {
    console.log('目录:', name);
  }
}

// 创建文件
const fileHandle = await dirHandle.getFileHandle('new.txt', { create: true });
const writable = await fileHandle.createWritable();
await writable.write('新文件');
await writable.close();
```

### 2.4 权限管理

```js
// 检查权限
const opts = { mode: 'readwrite' };
if ((await handle.queryPermission(opts)) === 'granted') {
  // 已有权限
}

// 请求权限
if ((await handle.requestPermission(opts)) === 'granted') {
  // 授权成功
}
```

---

## 3. 浏览器兼容性

- **Chrome / Edge**：86+（2020-10）
- **Firefox**：不支持（2024 年仍在实验阶段）
- **Safari**：15.2+（2021-12，部分支持）

Chrome/Edge 完整支持，Safari 部分支持（无 showDirectoryPicker），Firefox 不支持。生产环境需特性检测。

---

## 4. 使用场景示例

### 场景 1：文本编辑器（打开+保存）

```js
// 打开
const [handle] = await showOpenFilePicker();
const file = await handle.getFile();
editor.value = await file.text();

// 保存
const writable = await handle.createWritable();
await writable.write(editor.value);
await writable.close();
```

### 场景 2：图片批量处理

```js
const dirHandle = await showDirectoryPicker();
for await (const [name, handle] of dirHandle.entries()) {
  if (handle.kind === 'file' && name.match(/\.(jpg|png)$/)) {
    const file = await handle.getFile();
    // 处理图片...
  }
}
```

### 场景 3：权限持久化

```js
// 保存句柄到 IndexedDB
const db = await openDB('fs-handles', 1);
await db.put('handles', dirHandle, 'project-dir');

// 下次直接读取
const handle = await db.get('handles', 'project-dir');
if ((await handle.queryPermission({ mode: 'readwrite' })) === 'granted') {
  // 直接读写
}
```

---

## 5. 实际应用案例分析

### 案例：Markdown 编辑器

**背景**：网页版 Markdown 编辑器，用户要求「像 VS Code 一样直接保存到本地」。

**改造方案**：

1. **打开**：showOpenFilePicker 选择 .md 文件
2. **保存**：Ctrl+S 触发 showSaveFilePicker，直接写入本地
3. **自动保存**：每 30 秒自动保存（已授权的文件）
4. **最近文件**：句柄存 IndexedDB，下次直接打开

**关键代码**：

```js
let currentHandle = null;

async function openFile() {
  [currentHandle] = await showOpenFilePicker({
    types: [{ accept: { 'text/markdown': ['.md'] } }]
  });
  const file = await currentHandle.getFile();
  editor.value = await file.text();
}

async function saveFile() {
  if (!currentHandle) {
    currentHandle = await showSaveFilePicker({
      suggestedName: 'untitled.md'
    });
  }
  const writable = await currentHandle.createWritable();
  await writable.write(editor.value);
  await writable.close();
}
```

**收益**：用户体验接近原生编辑器，留存率提升 25%。

---

## 6. 最佳实践与常见坑

1. **特性检测**：`if ('showOpenFilePicker' in window)`，不支持时回退到 `<input type="file">`。
2. **权限是临时的**：页面刷新后权限失效，需重新请求（句柄可持久化到 IndexedDB）。
3. **不要存文件内容**：IndexedDB 存句柄不存内容，避免占用配额。
4. **错误处理**：用户取消选择会抛 AbortError，需 try/catch。
5. **路径分隔符**：Windows 是 `\`，macOS/Linux 是 `/`，用 `handle.name` 不要拼路径。

---

## 7. 参考资料

- [MDN: File System Access API](https://developer.mozilla.org/zh-CN/docs/Web/API/File_System_Access_API)
- [Can I use: File System Access](https://caniuse.com/native-filesystem-api)
- [web.dev: File System Access](https://web.dev/articles/file-system-access)
