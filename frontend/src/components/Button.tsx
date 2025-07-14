import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import classNames from 'classnames';
import { motion } from 'framer-motion';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'warning';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  isFullWidth?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  disableAnimation?: boolean;
  animationVariant?: 'scale' | 'bounce' | 'none';
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  isFullWidth = false,
  icon,
  iconPosition = 'left',
  className,
  disabled,
  disableAnimation = false,
  animationVariant = 'scale',
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center rounded-element font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2';

  const variantClasses = {
    primary: 'bg-primary text-white hover:bg-primary-600 active:bg-primary-700',
    secondary: 'bg-secondary text-white hover:bg-secondary-600 active:bg-secondary-700',
    ghost: 'bg-transparent hover:bg-surface text-text-primary border border-border',
    danger: 'bg-error text-white hover:bg-error/90 active:bg-error/80',
    success: 'bg-success text-white hover:bg-success/90 active:bg-success/80',
    warning: 'bg-warning text-text-primary hover:bg-warning/90 active:bg-warning/80',
  };

  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-5 py-2.5',
  };

  const buttonClasses = classNames(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    isFullWidth ? 'w-full' : '',
    disabled || isLoading ? 'opacity-70 cursor-not-allowed' : '',
    className,
  );

  // 动画变体配置
  const animationVariants = {
    scale: {
      whileHover: { scale: disabled || isLoading ? 1 : 1.02 },
      whileTap: { scale: disabled || isLoading ? 1 : 0.98 },
    },
    bounce: {
      whileHover: { scale: disabled || isLoading ? 1 : 1.05 },
      whileTap: { scale: disabled || isLoading ? 1 : 0.95, y: disabled || isLoading ? 0 : 1 },
    },
    none: {},
  };

  const motionProps = disableAnimation ? {} : animationVariants[animationVariant];

  return (
    <motion.button
      className={buttonClasses}
      disabled={disabled || isLoading}
      transition={{
        duration: 0.15,
        ease: [0.4, 0.0, 0.2, 1],
      }}
      {...motionProps}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}

      {icon && iconPosition === 'left' && !isLoading && <span className="mr-2">{icon}</span>}

      {children}

      {icon && iconPosition === 'right' && <span className="ml-2">{icon}</span>}
    </motion.button>
  );
};

export default Button;
