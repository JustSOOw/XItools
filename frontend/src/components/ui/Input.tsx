/**
 * 通用输入框组件
 */

import React, { InputHTMLAttributes, forwardRef } from 'react';
import classNames from 'classnames';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, label, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-text-primary mb-2">{label}</label>
        )}
        <input
          ref={ref}
          className={classNames(
            'w-full px-3 py-2 border rounded-lg transition-colors',
            'bg-surface text-text-primary placeholder-text-secondary',
            'focus:ring-2 focus:ring-primary/20 focus:border-primary',
            error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-border',
            className,
          )}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';

export default Input;
