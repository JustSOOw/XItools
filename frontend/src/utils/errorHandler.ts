/*
 * @Author: XItools Team
 * @Date: 2025-07-01 13:00:00
 * @LastEditors: JustSOOw 117962858+JustSOOw@users.noreply.github.com
 * @LastEditTime: 2025-07-01 13:50:58
 * @FilePath: \XItools\frontend\src\utils\errorHandler.ts
 * @Description: 错误处理工具函数，提供统一的错误消息处理和多语言支持
 *
 * Copyright (c) 2025 by XItools Team, All Rights Reserved.
 */

import { TFunction } from 'i18next';

/**
 * 错误类型枚举
 */
export enum ErrorType {
  NETWORK = 'network',
  SERVER = 'server',
  VALIDATION = 'validation',
  AUTH = 'auth',
  PERMISSION = 'permission',
  UNKNOWN = 'unknown',
}

/**
 * 认证错误代码枚举（与后端保持一致）
 */
export enum AuthErrorCode {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  USER_INACTIVE = 'USER_INACTIVE',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',
  SESSION_REVOKED = 'SESSION_REVOKED',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  USERNAME_TAKEN = 'USERNAME_TAKEN',
  EMAIL_TAKEN = 'EMAIL_TAKEN',
  WEAK_PASSWORD = 'WEAK_PASSWORD',
  RATE_LIMITED = 'RATE_LIMITED',
}

/**
 * 错误信息接口
 */
export interface ErrorInfo {
  type: ErrorType;
  code?: string;
  message: string;
  details?: any;
  statusCode?: number;
}

/**
 * API错误响应接口
 */
export interface ApiErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: any;
}

/**
 * 错误处理类
 */
export class ErrorHandler {
  private t: TFunction;

  constructor(t: TFunction) {
    this.t = t;
  }

  /**
   * 处理API错误响应
   */
  handleApiError(error: any): ErrorInfo {
    // 网络错误
    if (!error.response) {
      return {
        type: ErrorType.NETWORK,
        message: this.t('errors.network'),
        statusCode: 0,
      };
    }

    const { status, data } = error.response;
    const errorResponse: ApiErrorResponse = data;

    // 根据状态码和错误代码确定错误类型和消息
    switch (status) {
      case 400:
        return this.handleValidationError(errorResponse);
      case 401:
        return this.handleAuthError(errorResponse);
      case 403:
        return this.handlePermissionError(errorResponse);
      case 429:
        return this.handleRateLimitError(errorResponse);
      case 500:
      case 502:
      case 503:
      case 504:
        return this.handleServerError(errorResponse, status);
      default:
        return this.handleUnknownError(errorResponse, status);
    }
  }

  /**
   * 处理验证错误
   */
  private handleValidationError(errorResponse: ApiErrorResponse): ErrorInfo {
    // 检查是否包含特定的错误关键词，返回更友好的提示
    const originalError = errorResponse.error || '';

    // 邮箱已被注册
    if (originalError.includes('邮箱已被注册') || originalError.includes('该邮箱已被注册')) {
      return {
        type: ErrorType.VALIDATION,
        code: AuthErrorCode.EMAIL_TAKEN,
        message: this.t('errors.register.emailExists'),
        details: errorResponse.details,
        statusCode: 400,
      };
    }

    // 用户名已被注册
    if (originalError.includes('用户名已') || originalError.includes('username')) {
      return {
        type: ErrorType.VALIDATION,
        code: AuthErrorCode.USERNAME_TAKEN,
        message: this.t('errors.register.usernameExists'),
        details: errorResponse.details,
        statusCode: 400,
      };
    }

    // 其他验证错误，使用后端返回的原始消息
    return {
      type: ErrorType.VALIDATION,
      code: errorResponse.code,
      message: originalError || this.t('auth:errors.validation'),
      details: errorResponse.details,
      statusCode: 400,
    };
  }

  /**
   * 处理认证错误
   */
  private handleAuthError(errorResponse: ApiErrorResponse): ErrorInfo {
    const code = errorResponse.code as AuthErrorCode;
    let translationKey = 'auth:errors.login.failed';

    switch (code) {
      case AuthErrorCode.INVALID_CREDENTIALS:
        translationKey = 'errors.login.invalidCredentials';
        break;
      case AuthErrorCode.USER_NOT_FOUND:
        translationKey = 'errors.login.userNotFound';
        break;
      case AuthErrorCode.USER_INACTIVE:
        translationKey = 'errors.login.userInactive';
        break;
      case AuthErrorCode.TOKEN_EXPIRED:
        translationKey = 'errors.token.expired';
        break;
      case AuthErrorCode.TOKEN_INVALID:
        translationKey = 'errors.token.invalid';
        break;
      case AuthErrorCode.SESSION_REVOKED:
        translationKey = 'errors.session.revoked';
        break;
      case AuthErrorCode.USERNAME_TAKEN:
        translationKey = 'errors.register.usernameExists';
        break;
      case AuthErrorCode.EMAIL_TAKEN:
        translationKey = 'errors.register.emailExists';
        break;
      case AuthErrorCode.WEAK_PASSWORD:
        translationKey = 'errors.register.weakPassword';
        break;
      default:
        // 如果没有匹配的错误代码，使用原始错误消息或默认消息
        if (
          errorResponse.error.includes('用户不存在') ||
          errorResponse.error.includes('User does not exist')
        ) {
          translationKey = 'errors.login.userNotFound';
        } else if (
          errorResponse.error.includes('密码错误') ||
          errorResponse.error.includes('password')
        ) {
          translationKey = 'errors.login.invalidCredentials';
        } else if (
          errorResponse.error.includes('用户名已') ||
          errorResponse.error.includes('username')
        ) {
          translationKey = 'errors.register.usernameExists';
        } else if (
          errorResponse.error.includes('邮箱已') ||
          errorResponse.error.includes('email')
        ) {
          translationKey = 'errors.register.emailExists';
        }
        break;
    }

    return {
      type: ErrorType.AUTH,
      code,
      message: this.t(translationKey),
      statusCode: 401,
    };
  }

  /**
   * 处理权限错误
   */
  private handlePermissionError(errorResponse: ApiErrorResponse): ErrorInfo {
    const code = errorResponse.code as AuthErrorCode;
    let translationKey = 'auth:errors.permission.accessDenied';

    if (code === AuthErrorCode.INSUFFICIENT_PERMISSIONS) {
      translationKey = 'auth:errors.permission.insufficient';
    } else if (
      errorResponse.error.includes('无权访问') ||
      errorResponse.error.includes('forbidden')
    ) {
      translationKey = 'auth:errors.permission.forbidden';
    }

    return {
      type: ErrorType.PERMISSION,
      code,
      message: this.t(translationKey),
      statusCode: 403,
    };
  }

  /**
   * 处理频率限制错误
   */
  private handleRateLimitError(errorResponse: ApiErrorResponse): ErrorInfo {
    let translationKey = 'auth:errors.rateLimit.tooManyRequests';

    if (errorResponse.error.includes('登录') || errorResponse.error.includes('login')) {
      translationKey = 'auth:errors.rateLimit.loginAttempts';
    } else if (errorResponse.error.includes('注册') || errorResponse.error.includes('register')) {
      translationKey = 'auth:errors.rateLimit.registerAttempts';
    }

    return {
      type: ErrorType.AUTH,
      code: AuthErrorCode.RATE_LIMITED,
      message: this.t(translationKey),
      statusCode: 429,
    };
  }

  /**
   * 处理服务器错误
   */
  private handleServerError(errorResponse: ApiErrorResponse, statusCode: number): ErrorInfo {
    return {
      type: ErrorType.SERVER,
      code: errorResponse.code,
      message: this.t('errors.server'),
      details: errorResponse.details,
      statusCode,
    };
  }

  /**
   * 处理未知错误
   */
  private handleUnknownError(errorResponse: ApiErrorResponse, statusCode: number): ErrorInfo {
    return {
      type: ErrorType.UNKNOWN,
      code: errorResponse.code,
      message: this.t('errors.unknown'),
      details: errorResponse.details,
      statusCode,
    };
  }

  /**
   * 获取用户友好的错误消息
   */
  getUserFriendlyMessage(error: any): string {
    const errorInfo = this.handleApiError(error);
    return errorInfo.message;
  }

  /**
   * 检查是否为认证错误
   */
  isAuthError(error: any): boolean {
    if (!error.response) return false;
    return error.response.status === 401;
  }

  /**
   * 检查是否为权限错误
   */
  isPermissionError(error: any): boolean {
    if (!error.response) return false;
    return error.response.status === 403;
  }

  /**
   * 检查是否为网络错误
   */
  isNetworkError(error: any): boolean {
    return !error.response;
  }
}

/**
 * 创建错误处理器实例
 */
export function createErrorHandler(t: TFunction): ErrorHandler {
  return new ErrorHandler(t);
}

/**
 * 全局错误处理函数
 */
export function handleGlobalError(error: any, t: TFunction): ErrorInfo {
  const handler = new ErrorHandler(t);
  return handler.handleApiError(error);
}

/**
 * 获取错误消息的简化函数
 */
export function getErrorMessage(error: any, t: TFunction): string {
  const handler = new ErrorHandler(t);
  return handler.getUserFriendlyMessage(error);
}
