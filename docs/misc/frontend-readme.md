# XItools 前端

XItools智能任务看板前端项目，基于React、TypeScript、Vite、Zustand、Tailwind CSS等技术栈开发。

## 技术栈

- **UI框架**: React
- **构建工具**: Vite
- **状态管理**: Zustand
- **桌面应用打包**: Electron
- **实时通信**: Socket.IO-client
- **样式方案**: Tailwind CSS
- **开发语言**: TypeScript

## 项目结构

```
frontend/
├── public/             # 静态资源
├── src/
│   ├── assets/         # 图片、字体等资源
│   ├── components/     # 可复用组件
│   ├── hooks/          # 自定义钩子
│   ├── services/       # API服务
│   ├── store/          # 状态管理
│   ├── types/          # 类型定义
│   └── utils/          # 工具函数
├── .eslintrc.js        # ESLint配置
├── .prettierrc         # Prettier配置
├── index.html          # HTML模板
├── package.json        # 项目依赖
├── postcss.config.js   # PostCSS配置
├── tailwind.config.js  # Tailwind配置
├── tsconfig.json       # TypeScript配置
└── vite.config.ts      # Vite配置
```

## 功能模块

- 多项目/多看板管理
- 任务卡片创建与管理
- 多视图切换（看板视图、列表视图、日历视图）
- 实时同步
- 多主题支持

## 开发命令

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview

# 代码检查
npm run lint

# 自动修复代码问题
npm run lint:fix
``` 