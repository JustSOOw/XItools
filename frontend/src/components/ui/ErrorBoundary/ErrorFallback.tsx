/*
 * @Author: Furdow wang22338014@gmail.com
 * @Date: 2025-01-27 21:25:00
 * @LastEditors: Furdow wang22338014@gmail.com
 * @LastEditTime: 2025-01-27 21:25:00
 * @FilePath: \XItools\frontend\src\components\ui\ErrorBoundary\ErrorFallback.tsx
 * @Description: 错误回退组件 - 当发生错误时显示的备用UI
 *
 * Copyright (c) 2025 by Furdow, All Rights Reserved.
 */

import React, { useState } from 'react';
import classNames from 'classnames';
import Button from '../../Button';
import { ErrorFallbackProps } from './ErrorBoundary';
import { useI18n } from '../../../hooks/useI18n';
import globalConfirmDialog from '../../../services/globalConfirmDialog';

/**
 * 默认错误回退组件
 * 提供友好的错误信息和恢复选项
 */
const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, errorInfo, resetError }) => {
  const { t } = useI18n();
  const [showDetails, setShowDetails] = useState(false);

  const handleReload = () => {
    window.location.reload();
  };

  const handleReportError = () => {
    // 这里可以集成错误报告服务
    const errorReport = {
      message: error?.message,
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    console.log('Error Report:', errorReport);

    // 可以发送到错误监控服务
    // errorReportingService.report(errorReport);

    globalConfirmDialog.info(
      t('error:reportGenerated', { defaultValue: '错误报告已生成并记录到控制台。' }),
      undefined,
      t('error:reportTitle', { defaultValue: '错误报告' }),
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full">
        <div className="bg-surface rounded-lg shadow-lg p-6 border border-border">
          {/* 错误图标 */}
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full">
            <svg
              className="w-8 h-8 text-red-600 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>

          {/* 错误标题 */}
          <h1 className="text-xl font-semibold text-center text-text-primary mb-2">
            {t('error:title')}
          </h1>

          {/* 错误描述 */}
          <p className="text-text-secondary text-center mb-6">{t('error:description')}</p>

          {/* 错误信息（可展开） */}
          {error && (
            <div className="mb-6">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-sm text-primary hover:text-primary/80 focus:outline-none"
              >
                {showDetails ? t('error:hideDetails') : t('error:showDetails')}
              </button>

              {showDetails && (
                <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-md border border-red-200 dark:border-red-800">
                  <div className="text-xs font-mono text-red-800 dark:text-red-200">
                    <div className="font-semibold mb-1">{t('error:errorMessage')}:</div>
                    <div className="mb-3 break-words">{error.message}</div>

                    {process.env.NODE_ENV === 'development' && (
                      <>
                        <div className="font-semibold mb-1">{t('error:errorStack')}:</div>
                        <pre className="whitespace-pre-wrap text-xs overflow-auto max-h-32">
                          {error.stack}
                        </pre>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 操作按钮 */}
          <div className="space-y-3">
            <Button variant="primary" size="md" onClick={resetError} className="w-full">
              {t('common:actions.retry')}
            </Button>

            <div className="flex space-x-3">
              <Button variant="secondary" size="sm" onClick={handleReload} className="flex-1">
                {t('error:refreshPage')}
              </Button>

              <Button variant="ghost" size="sm" onClick={handleReportError} className="flex-1">
                {t('error:reportError')}
              </Button>
            </div>
          </div>

          {/* 帮助信息 */}
          <div className="mt-6 pt-4 border-t border-border">
            <p className="text-xs text-text-secondary text-center">{t('error:contactSupport')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * 简化版错误回退组件 - 用于小组件
 */
export const SimpleErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetError }) => {
  const { t } = useI18n();
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="w-12 h-12 mb-4 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
        <svg
          className="w-6 h-6 text-red-600 dark:text-red-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
        </svg>
      </div>

      <h3 className="text-lg font-medium text-text-primary mb-2">{t('error:loadFailed')}</h3>

      <p className="text-text-secondary mb-4 text-sm">
        {error?.message || t('error:componentError')}
      </p>

      <Button variant="primary" size="sm" onClick={resetError}>
        {t('common:actions.retry')}
      </Button>
    </div>
  );
};

export default ErrorFallback;
