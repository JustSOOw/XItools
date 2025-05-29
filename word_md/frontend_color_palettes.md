# 前端配色方案

本文档定义四套配色主题，分别为：浅色主题 (Light Theme)、深色主题 (Dark Theme)、柔和主题 (Soft Theme)、高对比主题 (High Contrast Theme)。以下配色可用于 Tailwind CSS 配置或自定义 CSS 变量。

## 1. 浅色主题 (Light Theme)
- 主色 (Primary): #4F46E5
- 次色 (Secondary): #10B981
- 强调色 (Accent): #F59E0B
- 背景色 (Background): #FFFFFF
- 表面色 (Surface): #F3F4F6
- 主要文本 (Text Primary): #111827
- 次要文本 (Text Secondary): #6B7280
- 成功色 (Success): #10B981
- 警告色 (Warning): #FBBF24
- 错误色 (Error): #EF4444

## 2. 深色主题 (Dark Theme)
- 主色 (Primary): #6366F1
- 次色 (Secondary): #34D399
- 强调色 (Accent): #FBBF24
- 背景色 (Background): #1F2937
- 表面色 (Surface): #374151
- 主要文本 (Text Primary): #F9FAFB
- 次要文本 (Text Secondary): #D1D5DB
- 成功色 (Success): #34D399
- 警告色 (Warning): #FBBF24
- 错误色 (Error): #F87171

## 3. 柔和主题 (Soft Theme)
- 主色 (Primary): #F6D365
- 次色 (Secondary): #FDA085
- 强调色 (Accent): #A1C4FD
- 背景色 (Background): #FFFFFF
- 表面色 (Surface): #FFF5E1
- 主要文本 (Text Primary): #333333
- 次要文本 (Text Secondary): #555555
- 成功色 (Success): #A3E635
- 警告色 (Warning): #FACC15
- 错误色 (Error): #F47272

## 4. 艺术主题 (Artistic Theme)
- 主色 (Primary): #8E44AD
- 次色 (Secondary): #3498DB
- 强调色 (Accent): #E74C3C
- 背景色 (Background): #FCF3CF
- 表面色 (Surface): #FDFEFE
- 主要文本 (Text Primary): #2C3E50
- 次要文本 (Text Secondary): #7F8C8D
- 成功色 (Success): #27AE60
- 警告色 (Warning): #F1C40F
- 错误色 (Error): #C0392B

## 5. 全局样式设定
为了统一组件视觉风格，以下为卡片（Card）及常用元素的毛玻璃效果与其他样式设定，基于 Tailwind CSS 工具类和自定义 CSS 变量。

### 5.1 卡片（Card）毛玻璃效果
- 背景: 半透明背景与模糊滤镜
  - Light Theme: `bg-white bg-opacity-20 backdrop-blur-md`
  - Dark Theme: `dark:bg-gray-900 dark:bg-opacity-30 backdrop-blur-md`
- 边框: `border border-white/30 dark:border-gray-100/10`
- 圆角: `rounded-lg`
- 阴影: `shadow-lg`

```css
.card {
  @apply bg-white bg-opacity-20 backdrop-blur-md border border-white/30 rounded-lg shadow-lg;
}
.dark .card {
  @apply bg-gray-900 bg-opacity-30 border-gray-100/10;
}
```

### 5.2 按钮（Button）样式
- 主按钮: `bg-primary text-white hover:bg-primary/90`
- 次按钮: `bg-secondary text-white hover:bg-secondary/90`
- 圆角: `rounded-md`
- 内边距: `py-2 px-4`

```css
.btn-primary {
  @apply bg-primary text-white rounded-md py-2 px-4 hover:bg-primary/90;
}
.btn-secondary {
  @apply bg-secondary text-white rounded-md py-2 px-4 hover:bg-secondary/90;
}
```

### 5.3 标签（Tag）样式
- 默认标签: `bg-accent bg-opacity-20 text-accent px-2 py-1 rounded`

```css
.tag {
  @apply bg-accent bg-opacity-20 text-accent px-2 py-1 rounded;
}
```

### 5.4 通用阴影与过渡
- 阴影: `shadow-md` 或 `shadow-lg`
- 过渡: `transition-shadow transition-colors duration-200`

### 5.5 CSS 变量示例
在全局 CSS 中定义主题色变量，便于调整：
```css
:root {
  --color-primary: #4F46E5;
  --color-secondary: #10B981;
  --color-accent: #F59E0B;
  --card-blur: 10px;
  --card-bg-opacity-light: 0.2;
  --card-bg-opacity-dark: 0.3;
}
``` 