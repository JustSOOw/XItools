import React, { ReactNode, useRef, useEffect } from 'react';
import classNames from 'classnames';

export interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'glassmorphic' | 'outlined';
  isHoverable?: boolean;
  isInteractive?: boolean;
  noPadding?: boolean;
  style?: React.CSSProperties;
}

const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'default',
  isHoverable = false,
  isInteractive = false,
  noPadding = false,
  style,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const baseClasses = 'rounded-card transition-all duration-200';

  // 如果有自定义背景色，不应用默认背景色
  const hasCustomBackground = style?.background || style?.backgroundColor;

  const variantClasses = {
    default: hasCustomBackground ? 'shadow-md' : 'bg-surface shadow-md',
    glassmorphic: 'bg-white/20 backdrop-blur-md border border-white/30 shadow-lg',
    outlined: 'border border-border bg-transparent',
  };

  const interactiveClasses = isInteractive ? 'cursor-pointer' : '';
  const hoverClasses = isHoverable ? 'hover:shadow-lg hover:translate-y-[-2px]' : '';
  const paddingClasses = noPadding ? '' : 'p-3';

  const cardClasses = classNames(
    baseClasses,
    variantClasses[variant],
    interactiveClasses,
    hoverClasses,
    paddingClasses,
    className,
  );

  // 深色模式适配
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');

    if (cardRef.current && variant === 'glassmorphic' && isDark) {
      cardRef.current.classList.remove('bg-white/20', 'border-white/30');
      cardRef.current.classList.add('bg-dark-surface/30', 'border-gray-100/10');
    }
  }, [variant]);

  return (
    <div ref={cardRef} className={cardClasses} style={style}>
      {children}
    </div>
  );
};

export default Card;
