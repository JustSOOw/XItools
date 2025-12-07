/**
 * i18n 国际化配置文件
 * 配置多语言支持，包括中文和英文
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// 导入翻译资源
import zhCN from './locales/zh-CN';

// 支持的语言列表（仅中文）
export const supportedLanguages = ['zh-CN'] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];

// 默认语言
export const defaultLanguage: SupportedLanguage = 'zh-CN';

// 内联的认证相关翻译资源（用于登录模块）
const inlineAuthResources = {
  'zh-CN': {
    common: {
      loading: {
        text: '加载中...',
      },
      app: {
        name: 'XItools',
        title: '智能任务看板',
      },
      feedback: {
        success: '成功',
        error: '错误',
        warning: '警告',
        info: '信息',
      },
      settings: '设置',
    },
    auth: {
      brand: {
        title: 'XItools',
        subtitle: '智能任务看板',
        description: '高效协作，智能管理，让团队工作更轻松',
        feature1: '智能任务管理',
        feature2: '团队协作',
        feature3: '数据分析',
        highlight1: {
          title: 'MCP智能集成',
          desc: 'AI编辑器直连，智能任务管理',
        },
        highlight2: {
          title: '实时协作看板',
          desc: 'WebSocket同步，多人协作',
        },
        highlight3: {
          title: '多视图管理',
          desc: '看板、列表、日历三种视图',
        },
        stats: {
          tools: 'MCP工具',
          views: '视图模式',
          sync: '实时同步',
        },
      },
      login: {
        title: '登录',
        subtitle: '欢迎回来',
        identifier: '用户名/邮箱',
        identifierPlaceholder: '请输入用户名或邮箱',
        password: '密码',
        passwordPlaceholder: '请输入密码',
        rememberMe: '记住我',
        submit: '登录',
        loggingIn: '登录中...',
        noAccount: '还没有账号？',
        switchToRegister: '立即注册',
        forgotPassword: '忘记密码？',
      },
      register: {
        title: '注册',
        subtitle: '创建您的账号',
        username: '用户名',
        usernamePlaceholder: '请输入用户名',
        email: '邮箱',
        emailPlaceholder: '请输入邮箱地址',

        password: '密码',
        passwordPlaceholder: '请输入密码',
        confirmPassword: '确认密码',
        confirmPasswordPlaceholder: '请再次输入密码',
        submit: '注册',
        registering: '注册中...',
        hasAccount: '已有账号？',
        switchToLogin: '立即登录',
      },
      forgotPassword: {
        title: '忘记密码',
        subtitle: '请输入用户名和邮箱获取验证码',
        usernameLabel: '用户名',
        usernamePlaceholder: '请输入用户名',
        emailLabel: '邮箱',
        emailPlaceholder: '请输入邮箱地址',
        verificationCodeLabel: '验证码',
        verificationCodePlaceholder: '请输入邮箱收到的6位验证码',
        sendCode: '发送验证码',
        sendingCode: '发送中...',
        resendCode: '重新发送',
        codeSent: '验证码已发送',
        sendCodeFailed: '验证码发送失败',
        maskedEmailHint: '验证码已发送至 {{email}}',
        resendAfter: '{{seconds}}秒后重发',
        pleaseGetCode: '请先获取验证码',
        newPasswordLabel: '新密码',
        newPasswordPlaceholder: '请输入新密码',
        confirmPasswordLabel: '确认新密码',
        confirmPasswordPlaceholder: '请再次输入新密码',
        submit: '重置密码',
        resetting: '重置中...',
        backToLogin: '返回登录',
        resetSuccess: '密码重置成功',
        resetFailed: '密码重置失败，请稍后重试',
        successTitle: '重置成功',
        successMessage: '您的密码已重置成功，即将返回登录页',
        error: '操作失败',
      },
      password: {
        strength: '密码强度',
        weak: '弱',
        medium: '中等',
        strong: '强',
        veryStrong: '很强',
      },
      profile: {
        title: '个人资料',
        profileTab: '个人资料',
        passwordTab: '修改密码',
        username: '用户名',
        email: '邮箱地址',
        avatar: '头像',
        avatarPlaceholder: '请输入头像URL（可选）',
        currentPassword: '当前密码',
        newPassword: '新密码',
        confirmNewPassword: '确认新密码',
        updateProfile: '更新资料',
        updating: '更新中...',
        changePassword: '修改密码',
        changingPassword: '修改中...',
        logout: '退出登录',
        updateSuccess: '资料更新成功',
        passwordChangeSuccess: '密码修改成功',
        logoutConfirm: '确定要退出登录吗？',
        notLoggedIn: '请先登录',
        lastLogin: '最后登录',
      },
      roles: {
        admin: '管理员',
        user: '用户',
        guest: '访客',
      },
      validation: {
        identifierRequired: '请输入用户名或邮箱',
        passwordRequired: '请输入密码',
        passwordMinLength: '密码至少需要6位字符',
        usernameRequired: '请输入用户名',
        usernameMinLength: '用户名至少需要3位字符',
        usernameMaxLength: '用户名不能超过20位字符',
        usernameInvalid: '用户名只能包含字母、数字和下划线',
        usernameFormat: '用户名只能包含字母、数字和下划线',
        emailRequired: '请输入邮箱地址',
        emailInvalid: '请输入有效的邮箱地址',
        emailFormat: '请输入有效的邮箱地址',
        usernameUpdateRequired: '请输入用户名',
        usernameUpdateMinLength: '用户名至少需要3个字符',
        currentPasswordRequired: '请输入当前密码',
        newPasswordRequired: '请输入新密码',
        passwordStrength: '密码强度较弱，建议使用更复杂的密码',
        passwordSameAsCurrent: '新密码不能与当前密码相同',
        confirmPasswordRequired: '请确认密码',
        verificationCodeRequired: '请输入验证码',
        verificationCodeMismatch: '验证码输入错误，请重试',
        passwordMismatch: '两次输入的密码不一致',
      },
      footer: {
        privacy: '隐私政策',
        terms: '服务条款',
        help: '帮助中心',
        copyright: '保留所有权利',
      },
      feedback: {
        welcome: '欢迎',
        welcomeNew: '欢迎新用户',
        goodbye: '再见',
        loginSuccess: '登录成功，欢迎 {{username}}！',
        loginSuccessGeneric: '登录成功！',
        loginFailed: '登录失败',
        registerSuccess: '注册成功，欢迎 {{username}}！',
        registerSuccessGeneric: '注册成功！',
        registerFailed: '注册失败',
        logoutSuccess: '已安全退出',
        passwordChanged: '密码修改成功',
        passwordChangeFailed: '密码修改失败',
        securityUpdate: '安全更新',
        profileUpdated: '资料更新成功',
        profileSaved: '资料已保存',
        profileUpdateFailed: '资料更新失败',
        sessionExpired: '会话已过期，请重新登录',
        sessionExpiredTitle: '会话过期',
        relogin: '重新登录',
        networkError: '网络连接失败',
        connectionProblem: '连接问题',
        retry: '重试',
      },
      errors: {
        unknown: '未知错误，请稍后重试',
        network: '网络连接失败，请检查网络设置',
        server: '服务器错误，请稍后重试',
        login: {
          failed: '登录失败，请重试',
          invalidCredentials: '用户名或密码错误',
          userNotFound: '用户不存在',
          userInactive: '账户已被禁用',
        },
        register: {
          failed: '注册失败，请重试',
          usernameExists: '用户名已存在',
          usernameTaken: '用户名已存在',
          emailExists: '邮箱已被注册',
          emailTaken: '邮箱已被注册',
          weakPassword: '密码强度不足',
          invalidData: '输入数据无效',
          serverError: '服务器错误，请稍后重试',
        },
        token: {
          expired: '登录已过期，请重新登录',
          invalid: '登录状态无效，请重新登录',
          missing: '缺少认证信息，请重新登录',
        },
        session: {
          revoked: '会话已被撤销，请重新登录',
        },
        permission: {
          insufficient: '权限不足',
          forbidden: '禁止访问',
          accessDenied: '访问被拒绝',
        },
        profile: {
          updateFailed: '资料更新失败',
          currentPasswordIncorrect: '当前密码错误',
          passwordSameAsCurrent: '新密码不能与当前密码相同',
          passwordChangeFailed: '密码修改失败',
          avatarUploadFailed: '头像上传失败',
        },
      },
      loading: {
        checking: '正在检查认证状态...',
      },
      unauthorized: {
        title: '访问被拒绝',
        message: '您需要 {{requiredRole}} 权限才能访问此页面，当前权限：{{currentRole}}',
        goBack: '返回',
      },
      roleGuard: {
        accessDenied: '访问被拒绝',
      },
    },
  },
};

// 合并翻译资源：深度合并JSON文件与内联的认证资源
const resources = {
  'zh-CN': {
    ...zhCN,
    // 深度合并common命名空间，避免覆盖
    common: {
      ...zhCN.common,
      ...inlineAuthResources['zh-CN'].common,
    },
    // 添加auth命名空间（来自内联资源）
    auth: inlineAuthResources['zh-CN'].auth,
  },
};

// 初始化 i18next
i18n.use(initReactI18next).init({
  resources,
  lng: 'zh-CN',
  fallbackLng: 'zh-CN',
  defaultNS: 'common',
  ns: ['common', 'auth', 'task', 'board', 'calendar', 'settings', 'feedback', 'error'],
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

// 语言规范化函数（已禁用多语言，始终返回中文）
const normalizeLanguage = (lng: string): SupportedLanguage => {
  // 所有语言都映射到中文
  return 'zh-CN';
};

export default i18n;
