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

## 5. 卡片与列背景色方案
以下是专门为卡片和列设计的背景色选项，用户可以从这些选项中为任务卡片和看板列选择合适的背景色：

### 5.1 基础色系 (适用于所有主题)
- 默认白 (Default White): #FFFFFF
- 默认灰 (Default Gray): #F3F4F6
- 浅蓝 (Light Blue): #DBEAFE
- 浅绿 (Light Green): #DCFCE7
- 浅紫 (Light Purple): #F3E8FF
- 浅黄 (Light Yellow): #FEF9C3
- 浅红 (Light Red): #FEE2E2
- 浅橙 (Light Orange): #FFEDD5
- 浅青 (Light Cyan): #CFFAFE
- 浅粉 (Light Pink): #FCE7F3

### 5.2 中等饱和度色系
- 天蓝 (Sky Blue): #BAE6FD
- 草绿 (Grass Green): #BBF7D0
- 薰衣草 (Lavender): #DDD6FE
- 柠檬黄 (Lemon): #FEF08A
- 珊瑚红 (Coral): #FECACA
- 杏橙 (Apricot): #FED7AA
- 水青 (Aqua): #99F6E4
- 玫瑰粉 (Rose): #FBCFE8

### 5.3 深色系 (适合深色主题)
- 深蓝 (Navy Blue): #1E40AF
- 深绿 (Forest Green): #166534
- 深紫 (Deep Purple): #6B21A8
- 深黄 (Amber): #B45309
- 深红 (Crimson): #991B1B
- 深橙 (Burnt Orange): #B45309
- 深青 (Teal): #115E59
- 深粉 (Magenta): #9D174D

### 5.4 渐变色背景
- 蓝紫渐变 (Blue-Purple): linear-gradient(135deg, #4F46E5 0%, #A78BFA 100%)
- 绿青渐变 (Green-Cyan): linear-gradient(135deg, #10B981 0%, #22D3EE 100%)
- 橙红渐变 (Orange-Red): linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)
- 粉紫渐变 (Pink-Purple): linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)
- 黄绿渐变 (Yellow-Green): linear-gradient(135deg, #FBBF24 0%, #34D399 100%)

## 6. 全局样式设定
为了统一组件视觉风格，以下为卡片（Card）及常用元素的毛玻璃效果与其他样式设定，基于 Tailwind CSS 工具类和自定义 CSS 变量。

### 6.1 卡片（Card）毛玻璃效果
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

### 6.2 按钮（Button）样式
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

### 6.3 标签（Tag）样式
- 默认标签: `bg-accent bg-opacity-20 text-accent px-2 py-1 rounded`

```css
.tag {
  @apply bg-accent bg-opacity-20 text-accent px-2 py-1 rounded;
}
```

### 6.4 通用阴影与过渡
- 阴影: `shadow-md` 或 `shadow-lg`
- 过渡: `transition-shadow transition-colors duration-200`

### 6.5 CSS 变量示例
在全局 CSS 中定义主题色变量，便于调整：
```css
:root {
  --color-primary: #4F46E5;
  --color-secondary: #10B981;
  --color-accent: #F59E0B;
  --card-blur: 10px;
  --card-bg-opacity-light: 0.2;
  --card-bg-opacity-dark: 0.3;
  
  /* 卡片背景色变量 */
  --card-bg-default: #FFFFFF;
  --card-bg-blue: #DBEAFE;
  --card-bg-green: #DCFCE7;
  --card-bg-purple: #F3E8FF;
  --card-bg-yellow: #FEF9C3;
  --card-bg-red: #FEE2E2;
  --card-bg-orange: #FFEDD5;
  --card-bg-cyan: #CFFAFE;
  --card-bg-pink: #FCE7F3;
}
``` 