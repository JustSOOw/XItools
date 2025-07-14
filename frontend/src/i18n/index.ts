/**
 * i18n 国际化配置文件
 * 配置多语言支持，包括中文和英文
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// 导入翻译资源
import zhCN from './locales/zh-CN';
import enUS from './locales/en-US';

// 支持的语言列表
export const supportedLanguages = ['zh-CN', 'en-US'] as const;
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
        subtitle: '输入您的邮箱地址，我们将发送重置密码的链接给您',
        emailLabel: '邮箱地址',
        emailPlaceholder: '请输入邮箱地址',
        submit: '发送重置链接',
        sending: '发送中...',
        backToLogin: '返回登录',
        emailSent: '重置链接已发送到 {{email}}',
        emailSentTitle: '邮件已发送',
        emailSentMessage: '我们已向 {{email}} 发送了密码重置链接',
        checkEmail: '请检查您的邮箱',
        nextSteps: '接下来的步骤：',
        step1: '检查您的邮箱收件箱（包括垃圾邮件文件夹）',
        step2: '点击邮件中的重置密码链接',
        step3: '按照页面提示设置新密码',
        resendEmail: '重新发送邮件',
        resending: '重新发送中...',
        emailResent: '邮件已重新发送',
        sendFailed: '发送失败，请稍后重试',
        resendFailed: '重新发送失败，请稍后重试',
        error: '发送失败',
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
  'en-US': {
    common: {
      loading: {
        text: 'Loading...',
      },
      app: {
        name: 'XItools',
        title: 'Smart Task Board',
      },
      feedback: {
        success: 'Success',
        error: 'Error',
        warning: 'Warning',
        info: 'Info',
      },
      settings: 'Settings',
    },
    auth: {
      brand: {
        title: 'XItools',
        subtitle: 'Smart Task Board',
        description: 'Efficient collaboration, intelligent management, making teamwork easier',
        feature1: 'Smart Task Management',
        feature2: 'Team Collaboration',
        feature3: 'Data Analytics',
        highlight1: {
          title: 'MCP AI Integration',
          desc: 'Direct AI editor connection, smart task management',
        },
        highlight2: {
          title: 'Real-time Kanban',
          desc: 'WebSocket sync, multi-user collaboration',
        },
        highlight3: {
          title: 'Multi-view Management',
          desc: 'Board, list, and calendar views',
        },
        stats: {
          tools: 'MCP Tools',
          views: 'View Modes',
          sync: 'Real-time Sync',
        },
      },
      login: {
        title: 'Login',
        subtitle: 'Welcome back',
        identifier: 'Username/Email',
        identifierPlaceholder: 'Enter username or email',
        password: 'Password',
        passwordPlaceholder: 'Enter password',
        rememberMe: 'Remember me',
        submit: 'Login',
        loggingIn: 'Logging in...',
        noAccount: "Don't have an account?",
        switchToRegister: 'Sign up now',
        forgotPassword: 'Forgot password?',
      },
      register: {
        title: 'Register',
        subtitle: 'Create your account',
        username: 'Username',
        usernamePlaceholder: 'Enter username',
        email: 'Email',
        emailPlaceholder: 'Enter email address',

        password: 'Password',
        passwordPlaceholder: 'Enter password',
        confirmPassword: 'Confirm Password',
        confirmPasswordPlaceholder: 'Enter password again',
        submit: 'Register',
        registering: 'Registering...',
        hasAccount: 'Already have an account?',
        switchToLogin: 'Sign in now',
      },
      forgotPassword: {
        title: 'Forgot Password',
        subtitle: 'Enter your email address and we will send you a password reset link',
        emailLabel: 'Email Address',
        emailPlaceholder: 'Enter your email address',
        submit: 'Send Reset Link',
        sending: 'Sending...',
        backToLogin: 'Back to Login',
        emailSent: 'Reset link sent to {{email}}',
        emailSentTitle: 'Email Sent',
        emailSentMessage: 'We have sent a password reset link to {{email}}',
        checkEmail: 'Please check your email',
        nextSteps: 'Next steps:',
        step1: 'Check your email inbox (including spam folder)',
        step2: 'Click the password reset link in the email',
        step3: 'Follow the instructions to set a new password',
        resendEmail: 'Resend Email',
        resending: 'Resending...',
        emailResent: 'Email resent successfully',
        sendFailed: 'Failed to send, please try again later',
        resendFailed: 'Failed to resend, please try again later',
        error: 'Send Failed',
      },
      password: {
        strength: 'Password Strength',
        weak: 'Weak',
        medium: 'Medium',
        strong: 'Strong',
        veryStrong: 'Very Strong',
      },
      profile: {
        title: 'Profile',
        profileTab: 'Profile',
        passwordTab: 'Change Password',
        username: 'Username',
        email: 'Email Address',
        avatar: 'Avatar',
        avatarPlaceholder: 'Enter avatar URL (optional)',
        currentPassword: 'Current Password',
        newPassword: 'New Password',
        confirmNewPassword: 'Confirm New Password',
        updateProfile: 'Update Profile',
        updating: 'Updating...',
        changePassword: 'Change Password',
        changingPassword: 'Changing...',
        logout: 'Logout',
        updateSuccess: 'Profile updated successfully',
        passwordChangeSuccess: 'Password changed successfully',
        logoutConfirm: 'Are you sure you want to logout?',
        notLoggedIn: 'Please login first',
        lastLogin: 'Last Login',
      },
      roles: {
        admin: 'Administrator',
        user: 'User',
        guest: 'Guest',
      },
      validation: {
        identifierRequired: 'Please enter username or email',
        passwordRequired: 'Please enter password',
        passwordMinLength: 'Password must be at least 6 characters',
        usernameRequired: 'Please enter username',
        usernameMinLength: 'Username must be at least 3 characters',
        usernameMaxLength: 'Username cannot exceed 20 characters',
        usernameInvalid: 'Username can only contain letters, numbers and underscores',
        usernameFormat: 'Username can only contain letters, numbers and underscores',
        emailRequired: 'Please enter email address',
        emailInvalid: 'Please enter a valid email address',
        emailFormat: 'Please enter a valid email address',
        usernameUpdateRequired: 'Please enter username',
        usernameUpdateMinLength: 'Username must be at least 3 characters',
        currentPasswordRequired: 'Please enter current password',
        newPasswordRequired: 'Please enter new password',
        passwordStrength: 'Password is weak, consider using a more complex password',
        passwordSameAsCurrent: 'New password cannot be the same as current password',
        confirmPasswordRequired: 'Please confirm password',
        passwordMismatch: 'Passwords do not match',
      },
      footer: {
        privacy: 'Privacy Policy',
        terms: 'Terms of Service',
        help: 'Help Center',
        copyright: 'All rights reserved',
      },
      feedback: {
        welcome: 'Welcome',
        welcomeNew: 'Welcome new user',
        goodbye: 'Goodbye',
        loginSuccess: 'Login successful, welcome {{username}}!',
        loginSuccessGeneric: 'Login successful!',
        loginFailed: 'Login failed',
        registerSuccess: 'Registration successful, welcome {{username}}!',
        registerSuccessGeneric: 'Registration successful!',
        registerFailed: 'Registration failed',
        logoutSuccess: 'Logged out safely',
        passwordChanged: 'Password changed successfully',
        passwordChangeFailed: 'Password change failed',
        securityUpdate: 'Security Update',
        profileUpdated: 'Profile updated successfully',
        profileSaved: 'Profile saved',
        profileUpdateFailed: 'Profile update failed',
        sessionExpired: 'Session has expired, please log in again',
        sessionExpiredTitle: 'Session Expired',
        relogin: 'Log in again',
        networkError: 'Network connection failed',
        connectionProblem: 'Connection Problem',
        retry: 'Retry',
      },
      errors: {
        unknown: 'Unknown error, please try again later',
        network: 'Network connection failed, please check your network settings',
        server: 'Server error, please try again later',
        login: {
          failed: 'Login failed, please try again',
          invalidCredentials: 'Invalid username or password',
          userNotFound: 'User not found',
          userInactive: 'Account has been disabled',
        },
        register: {
          failed: 'Registration failed, please try again',
          usernameExists: 'Username already exists',
          usernameTaken: 'Username already exists',
          emailExists: 'Email already registered',
          emailTaken: 'Email already registered',
          weakPassword: 'Password is too weak',
          invalidData: 'Invalid input data',
          serverError: 'Server error, please try again later',
        },
        token: {
          expired: 'Login has expired, please log in again',
          invalid: 'Invalid login status, please log in again',
          missing: 'Missing authentication information, please log in again',
        },
        session: {
          revoked: 'Session has been revoked, please log in again',
        },
        permission: {
          insufficient: 'Insufficient permissions',
          forbidden: 'Access forbidden',
          accessDenied: 'Access denied',
        },
        profile: {
          updateFailed: 'Profile update failed',
          currentPasswordIncorrect: 'Current password is incorrect',
          passwordSameAsCurrent: 'New password cannot be the same as current password',
          passwordChangeFailed: 'Password change failed',
          avatarUploadFailed: 'Avatar upload failed',
        },
      },
      loading: {
        checking: 'Checking authentication status...',
      },
      unauthorized: {
        title: 'Access Denied',
        message:
          'You need {{requiredRole}} permission to access this page. Current permission: {{currentRole}}',
        goBack: 'Go Back',
      },
      roleGuard: {
        accessDenied: 'Access Denied',
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
  'en-US': {
    ...enUS,
    // 深度合并common命名空间，避免覆盖
    common: {
      ...enUS.common,
      ...inlineAuthResources['en-US'].common,
    },
    // 添加auth命名空间（来自内联资源）
    auth: inlineAuthResources['en-US'].auth,
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

// 语言规范化函数
const normalizeLanguage = (lng: string): SupportedLanguage => {
  if (lng === 'zh' || lng.startsWith('zh-')) {
    return 'zh-CN';
  }
  if (lng === 'en' || lng.startsWith('en-')) {
    return 'en-US';
  }
  return defaultLanguage;
};

export default i18n;
