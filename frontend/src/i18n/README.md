# XItools 多语言支持 (i18n)

## 概述

XItools 提供完整的多语言支持，目前支持中文（简体）和英文。本文档介绍了多语言系统的架构、使用方法和扩展指南。

## 功能特性

### 🌍 核心特性

- **实时语言切换**：无需刷新页面即可切换语言
- **智能语言检测**：自动检测浏览器语言偏好
- **持久化存储**：记住用户的语言选择
- **类型安全**：完整的TypeScript类型支持
- **命名空间组织**：按功能模块组织翻译资源

### 📚 支持的语言

- **中文 (zh-CN)**：简体中文界面
- **English (en-US)**：英文界面

### 🎯 覆盖范围

- **认证系统**：登录、注册、用户资料管理
- **错误处理**：统一的错误消息翻译
- **表单验证**：表单验证消息的多语言支持
- **用户界面**：所有用户界面文本的翻译
- **设置页面**：主题、偏好设置等配置界面

## 架构设计

### 文件结构

```
frontend/src/i18n/
├── index.ts                 # i18n配置和初始化
├── types.ts                 # TypeScript类型定义
├── README.md               # 本文档
└── locales/
    ├── zh-CN/              # 中文翻译资源
    │   ├── index.ts        # 中文资源导出
    │   ├── common.json     # 通用翻译
    │   ├── auth.json       # 认证相关翻译
    │   ├── error.json      # 错误消息翻译
    │   ├── settings.json   # 设置页面翻译
    │   ├── task.json       # 任务相关翻译
    │   ├── board.json      # 看板相关翻译
    │   ├── calendar.json   # 日历相关翻译
    │   └── feedback.json   # 反馈相关翻译
    └── en-US/              # 英文翻译资源
        ├── index.ts        # 英文资源导出
        ├── common.json     # 通用翻译
        ├── auth.json       # 认证相关翻译
        ├── error.json      # 错误消息翻译
        ├── settings.json   # 设置页面翻译
        ├── task.json       # 任务相关翻译
        ├── board.json      # 看板相关翻译
        ├── calendar.json   # 日历相关翻译
        └── feedback.json   # 反馈相关翻译
```

### 命名空间组织

- **common**: 通用文本和应用基础信息
- **auth**: 认证相关（登录、注册、用户资料）
- **error**: 错误消息和验证提示
- **settings**: 设置页面和配置选项
- **task**: 任务管理相关
- **board**: 看板和项目管理
- **calendar**: 日历和时间相关
- **feedback**: 用户反馈和帮助

## 使用方法

### 基础用法

```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation('auth');

  return (
    <div>
      <h1>{t('login.title')}</h1>
      <p>{t('login.subtitle')}</p>
    </div>
  );
}
```

### 带参数的翻译

```tsx
const { t } = useTranslation('error');

// 使用插值
const message = t('validation.minLength', { min: 8 });

// 使用计数
const count = t('items', { count: 5 });
```

### 命名空间特定的Hook

```tsx
import { useAuthTranslation } from '../hooks/useI18n';

function AuthComponent() {
  const { t } = useAuthTranslation();

  return <span>{t('login.title')}</span>;
}
```

### 增强的i18n Hook

```tsx
import { useI18n } from '../hooks/useI18n';

function LanguageSelector() {
  const { currentLanguage, changeLanguage, supportedLanguages } = useI18n();

  return (
    <select value={currentLanguage} onChange={(e) => changeLanguage(e.target.value)}>
      {Object.entries(supportedLanguages).map(([code, name]) => (
        <option key={code} value={code}>
          {name}
        </option>
      ))}
    </select>
  );
}
```

## 错误处理集成

### 认证错误处理

```tsx
import { useAuthError } from '../hooks/useAuthError';

function LoginForm() {
  const { handleLoginError } = useAuthError();

  try {
    await login(credentials);
  } catch (error) {
    const errorMessage = handleLoginError(error);
    setError(errorMessage);
  }
}
```

### 表单验证

```tsx
import { useFormValidation } from '../hooks/useFormValidation';

function RegisterForm() {
  const { data, errors, updateField, validateAll } = useFormValidation(
    { username: '', email: '', password: '' },
    {
      username: { required: true, minLength: 3 },
      email: { required: true, email: true },
      password: { required: true, minLength: 8 },
    },
  );

  const handleSubmit = () => {
    if (validateAll()) {
      // 提交表单
    }
  };
}
```

## 翻译键命名规范

### 层级结构

```json
{
  "module": {
    "component": {
      "action": "翻译文本"
    }
  }
}
```

### 示例

```json
{
  "auth": {
    "login": {
      "title": "登录",
      "submit": "登录",
      "failed": "登录失败"
    },
    "register": {
      "title": "注册",
      "submit": "注册",
      "success": "注册成功"
    }
  }
}
```

### 命名约定

- 使用小写字母和驼峰命名
- 动作使用动词：`submit`, `cancel`, `save`
- 状态使用形容词：`loading`, `success`, `failed`
- 消息使用名词：`title`, `description`, `message`

## 添加新语言

### 1. 创建语言目录

```bash
mkdir frontend/src/i18n/locales/fr-FR
```

### 2. 复制翻译文件

```bash
cp frontend/src/i18n/locales/en-US/*.json frontend/src/i18n/locales/fr-FR/
```

### 3. 翻译内容

编辑 `fr-FR` 目录下的所有 JSON 文件，将英文翻译为法文。

### 4. 创建导出文件

```typescript
// frontend/src/i18n/locales/fr-FR/index.ts
import common from './common.json';
import auth from './auth.json';
// ... 其他导入

export default {
  common,
  auth,
  // ... 其他导出
};
```

### 5. 更新配置

```typescript
// frontend/src/i18n/index.ts
import frFR from './locales/fr-FR';

// 添加到资源配置
resources: {
  'zh-CN': zhCN,
  'en-US': enUS,
  'fr-FR': frFR,
}

// 添加到支持的语言
supportedLngs: ['zh-CN', 'en-US', 'fr-FR'],
```

## 最佳实践

### 1. 翻译质量

- 保持翻译的一致性和准确性
- 考虑文化差异和本地化需求
- 使用专业的翻译服务或母语者校对

### 2. 性能优化

- 使用命名空间避免加载不必要的翻译
- 考虑懒加载大型翻译文件
- 缓存翻译资源

### 3. 维护性

- 定期检查缺失的翻译键
- 使用工具自动化翻译文件的同步
- 建立翻译更新的工作流程

### 4. 测试

- 测试所有语言的界面显示
- 验证文本长度对布局的影响
- 检查特殊字符的显示

## 开发工具

### 缺失翻译检测

开发环境会在控制台显示缺失的翻译键：

```
Missing translation key: auth:login.title for language: en-US
```

### 类型安全

TypeScript 会检查翻译键的有效性：

```typescript
// ✅ 正确
t('auth:login.title');

// ❌ 错误 - TypeScript 会报错
t('auth:login.invalidKey');
```

## 故障排除

### 常见问题

1. **翻译不显示**

   - 检查翻译键是否正确
   - 确认命名空间是否已加载
   - 验证 JSON 文件格式是否正确

2. **语言切换不生效**

   - 检查 localStorage 中的语言设置
   - 确认语言代码是否在支持列表中
   - 验证 i18n 配置是否正确

3. **TypeScript 类型错误**
   - 确保翻译文件已正确导入
   - 检查类型定义是否最新
   - 重启 TypeScript 服务

### 调试技巧

- 启用 i18n 调试模式查看详细日志
- 使用浏览器开发工具检查网络请求
- 检查 React DevTools 中的 i18n 状态
