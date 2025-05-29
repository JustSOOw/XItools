import React, { ReactNode, useRef, useEffect } from 'react';
import classNames from 'classnames';

export interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'glassmorphic' | 'outlined';
  isHoverable?: boolean;
  isInteractive?: boolean;
  noPadding?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'default',
  isHoverable = false,
  isInteractive = false,
  noPadding = false,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const baseClasses = 'rounded-lg transition-all';
  
  const variantClasses = {
    default: 'bg-surface shadow-md',
    glassmorphic: 'bg-white/20 backdrop-blur-md border border-white/30 shadow-lg',
    outlined: 'border border-border bg-transparent',
  };
  
  const interactiveClasses = isInteractive ? 'cursor-pointer' : '';
  const hoverClasses = isHoverable ? 'hover:shadow-lg hover:translate-y-[-2px]' : '';
  const paddingClasses = noPadding ? '' : 'p-4';
  
  const cardClasses = classNames(
    baseClasses,
    variantClasses[variant],
    interactiveClasses,
    hoverClasses,
    paddingClasses,
    className
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
    <div ref={cardRef} className={cardClasses}>
      {children}
    </div>
  );
};

export default Card; 