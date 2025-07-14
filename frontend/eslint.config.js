// 简化的 ESLint 配置，专注于基础检查
import typescriptParser from '@typescript-eslint/parser';

export default [
  {
    files: ['src/**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      ecmaVersion: 2020,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        // 浏览器环境
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        navigator: 'readonly',
        localStorage: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        // DOM 类型
        HTMLElement: 'readonly',
        HTMLInputElement: 'readonly',
        HTMLTextAreaElement: 'readonly',
        HTMLSelectElement: 'readonly',
        HTMLButtonElement: 'readonly',
        HTMLDivElement: 'readonly',
        Element: 'readonly',
        Node: 'readonly',
        MouseEvent: 'readonly',
        KeyboardEvent: 'readonly',
        Event: 'readonly',
        DOMRect: 'readonly',
        File: 'readonly',
        FileReader: 'readonly',
        // Node.js 类型
        NodeJS: 'readonly',
        process: 'readonly',
      },
    },
    rules: {
      // 基础规则
      'no-unused-vars': 'warn',
      'no-undef': 'warn',
      'no-console': 'warn',
      'no-case-declarations': 'off',
      // React 相关
      'react/react-in-jsx-scope': 'off',
      // 暂时关闭严格检查
      'prefer-const': 'warn',
      'no-var': 'warn',
    },
  },
];
