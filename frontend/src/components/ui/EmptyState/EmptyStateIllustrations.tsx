/*
 * @Author: Furdow wang22338014@gmail.com
 * @Date: 2025-01-27 22:10:00
 * @LastEditors: Furdow wang22338014@gmail.com
 * @LastEditTime: 2025-01-27 22:10:00
 * @FilePath: \XItools\frontend\src\components\ui\EmptyState\EmptyStateIllustrations.tsx
 * @Description: 空状态插画组件 - 提供精美的SVG插画
 * 
 * Copyright (c) 2025 by Furdow, All Rights Reserved. 
 */

import React from 'react';

interface IllustrationProps {
  className?: string;
  size?: number;
}

/**
 * 任务管理插画
 */
export const TaskManagementIllustration: React.FC<IllustrationProps> = ({ 
  className = '', 
  size = 120 
}) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 120 120" 
    fill="none" 
    className={className}
  >
    {/* 背景圆 */}
    <circle cx="60" cy="60" r="50" fill="currentColor" className="text-primary/10" />
    
    {/* 看板 */}
    <rect x="25" y="35" width="70" height="50" rx="4" fill="currentColor" className="text-surface" stroke="currentColor" strokeWidth="1" className="text-border" />
    
    {/* 列 */}
    <rect x="30" y="40" width="18" height="40" rx="2" fill="currentColor" className="text-primary/20" />
    <rect x="51" y="40" width="18" height="40" rx="2" fill="currentColor" className="text-secondary/20" />
    <rect x="72" y="40" width="18" height="40" rx="2" fill="currentColor" className="text-accent/20" />
    
    {/* 卡片 */}
    <rect x="32" y="42" width="14" height="8" rx="1" fill="currentColor" className="text-primary" />
    <rect x="32" y="52" width="14" height="8" rx="1" fill="currentColor" className="text-primary" />
    
    <rect x="53" y="42" width="14" height="8" rx="1" fill="currentColor" className="text-secondary" />
    
    <rect x="74" y="42" width="14" height="8" rx="1" fill="currentColor" className="text-accent" />
    <rect x="74" y="52" width="14" height="8" rx="1" fill="currentColor" className="text-accent" />
    <rect x="74" y="62" width="14" height="8" rx="1" fill="currentColor" className="text-accent" />
    
    {/* 装饰元素 */}
    <circle cx="45" cy="25" r="2" fill="currentColor" className="text-primary/40" />
    <circle cx="75" cy="25" r="1.5" fill="currentColor" className="text-secondary/40" />
    <circle cx="35" cy="95" r="1.5" fill="currentColor" className="text-accent/40" />
    <circle cx="85" cy="95" r="2" fill="currentColor" className="text-primary/40" />
  </svg>
);

/**
 * 搜索插画
 */
export const SearchIllustration: React.FC<IllustrationProps> = ({ 
  className = '', 
  size = 120 
}) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 120 120" 
    fill="none" 
    className={className}
  >
    {/* 背景圆 */}
    <circle cx="60" cy="60" r="50" fill="currentColor" className="text-primary/10" />
    
    {/* 放大镜 */}
    <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="3" className="text-primary" />
    <line x1="65" y1="65" x2="80" y2="80" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="text-primary" />
    
    {/* 搜索结果线条 */}
    <line x1="25" y1="85" x2="45" y2="85" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-text-secondary/40" />
    <line x1="25" y1="90" x2="40" y2="90" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-text-secondary/40" />
    <line x1="25" y1="95" x2="50" y2="95" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-text-secondary/40" />
    
    {/* 装饰点 */}
    <circle cx="85" cy="35" r="2" fill="currentColor" className="text-secondary/60" />
    <circle cx="30" cy="30" r="1.5" fill="currentColor" className="text-accent/60" />
  </svg>
);

/**
 * 网络连接插画
 */
export const NetworkIllustration: React.FC<IllustrationProps> = ({ 
  className = '', 
  size = 120 
}) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 120 120" 
    fill="none" 
    className={className}
  >
    {/* 背景圆 */}
    <circle cx="60" cy="60" r="50" fill="currentColor" className="text-red-500/10" />
    
    {/* 断开的连接线 */}
    <line x1="30" y1="60" x2="50" y2="60" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="text-red-500" />
    <line x1="70" y1="60" x2="90" y2="60" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="text-red-500" />
    
    {/* 节点 */}
    <circle cx="30" cy="60" r="4" fill="currentColor" className="text-red-500" />
    <circle cx="90" cy="60" r="4" fill="currentColor" className="text-red-500" />
    
    {/* X 标记 */}
    <line x1="55" y1="55" x2="65" y2="65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-red-500" />
    <line x1="65" y1="55" x2="55" y2="65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-red-500" />
    
    {/* 信号波纹（断开） */}
    <path d="M 35 45 Q 45 35 55 45" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" className="text-red-500/40" strokeDasharray="3,3" />
    <path d="M 65 45 Q 75 35 85 45" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" className="text-red-500/40" strokeDasharray="3,3" />
  </svg>
);

/**
 * 日历插画
 */
export const CalendarIllustration: React.FC<IllustrationProps> = ({ 
  className = '', 
  size = 120 
}) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 120 120" 
    fill="none" 
    className={className}
  >
    {/* 背景圆 */}
    <circle cx="60" cy="60" r="50" fill="currentColor" className="text-primary/10" />
    
    {/* 日历主体 */}
    <rect x="30" y="35" width="60" height="50" rx="4" fill="currentColor" className="text-surface" stroke="currentColor" strokeWidth="1" className="text-border" />
    
    {/* 日历头部 */}
    <rect x="30" y="35" width="60" height="12" rx="4" fill="currentColor" className="text-primary" />
    
    {/* 日历环 */}
    <rect x="40" y="30" width="3" height="10" rx="1.5" fill="currentColor" className="text-text-secondary" />
    <rect x="77" y="30" width="3" height="10" rx="1.5" fill="currentColor" className="text-text-secondary" />
    
    {/* 日期网格 */}
    <g className="text-text-secondary/30">
      <line x1="35" y1="52" x2="85" y2="52" stroke="currentColor" strokeWidth="0.5" />
      <line x1="35" y1="58" x2="85" y2="58" stroke="currentColor" strokeWidth="0.5" />
      <line x1="35" y1="64" x2="85" y2="64" stroke="currentColor" strokeWidth="0.5" />
      <line x1="35" y1="70" x2="85" y2="70" stroke="currentColor" strokeWidth="0.5" />
      <line x1="35" y1="76" x2="85" y2="76" stroke="currentColor" strokeWidth="0.5" />
      
      <line x1="43" y1="47" x2="43" y2="80" stroke="currentColor" strokeWidth="0.5" />
      <line x1="51" y1="47" x2="51" y2="80" stroke="currentColor" strokeWidth="0.5" />
      <line x1="59" y1="47" x2="59" y2="80" stroke="currentColor" strokeWidth="0.5" />
      <line x1="67" y1="47" x2="67" y2="80" stroke="currentColor" strokeWidth="0.5" />
      <line x1="75" y1="47" x2="75" y2="80" stroke="currentColor" strokeWidth="0.5" />
    </g>
    
    {/* 今日标记 */}
    <circle cx="55" cy="61" r="3" fill="currentColor" className="text-primary" />
    
    {/* 装饰元素 */}
    <circle cx="25" cy="25" r="1.5" fill="currentColor" className="text-secondary/60" />
    <circle cx="95" cy="95" r="2" fill="currentColor" className="text-accent/60" />
  </svg>
);

/**
 * 筛选插画
 */
export const FilterIllustration: React.FC<IllustrationProps> = ({ 
  className = '', 
  size = 120 
}) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 120 120" 
    fill="none" 
    className={className}
  >
    {/* 背景圆 */}
    <circle cx="60" cy="60" r="50" fill="currentColor" className="text-primary/10" />
    
    {/* 漏斗 */}
    <path d="M 35 35 L 85 35 L 70 55 L 70 75 L 60 80 L 60 75 L 50 75 L 50 55 Z" fill="currentColor" className="text-primary/20" stroke="currentColor" strokeWidth="2" className="text-primary" />
    
    {/* 筛选项目 */}
    <circle cx="40" cy="40" r="2" fill="currentColor" className="text-secondary" />
    <circle cx="50" cy="40" r="2" fill="currentColor" className="text-accent" />
    <circle cx="60" cy="40" r="2" fill="currentColor" className="text-primary" />
    <circle cx="70" cy="40" r="2" fill="currentColor" className="text-secondary" />
    <circle cx="80" cy="40" r="2" fill="currentColor" className="text-accent" />
    
    {/* 筛选结果 */}
    <circle cx="55" cy="65" r="1.5" fill="currentColor" className="text-primary" />
    <circle cx="65" cy="65" r="1.5" fill="currentColor" className="text-primary" />
    
    {/* 装饰线条 */}
    <line x1="25" y1="90" x2="35" y2="90" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-text-secondary/40" />
    <line x1="85" y1="90" x2="95" y2="90" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-text-secondary/40" />
  </svg>
);
