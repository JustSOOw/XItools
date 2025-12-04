import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> { }

// 展开全部：从顶部向下展开
// 设计：顶部一条横线（基准），下方一个向下指的箭头，表示内容向下展开
export const SidebarExpandIcon: React.FC<IconProps> = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        {...props}
    >
        {/* 顶部基准线 */}
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 6h15" />
        {/* 向下的箭头 */}
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v9m0 0l-5-5m5 5l5-5" />
        {/* 增加一些装饰线表示列表？不，保持简洁 */}
    </svg>
);

// 收纳全部：向上收纳到顶部
// 设计：顶部一条横线（基准），下方一个向上指的箭头，表示内容向上收起
export const SidebarCollapseIcon: React.FC<IconProps> = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        {...props}
    >
        {/* 顶部基准线 */}
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 6h15" />
        {/* 向上的箭头 */}
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V10m0 0l-5 5m5-5l5 5" />
    </svg>
);
