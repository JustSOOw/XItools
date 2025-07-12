import React from 'react';

interface ColumnPlaceholderProps {
  className?: string;
}

const ColumnPlaceholder: React.FC<ColumnPlaceholderProps> = ({ className }) => {
  return (
    <div
      className={`
        w-72 h-32 rounded-lg border-2 border-dashed border-transparent bg-transparent opacity-0
        flex items-center justify-center transition-all duration-200
        ${className || ''}
      `}
    >
      {/* 完全透明的占位符内容 */}
      <div className="text-center opacity-0">
        <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-transparent flex items-center justify-center">
          <svg
            className="w-4 h-4 text-transparent"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 8h16M4 16h16"
            />
          </svg>
        </div>
        <p className="text-sm text-transparent font-medium">放置列到此处</p>
      </div>
    </div>
  );
};

export default ColumnPlaceholder;
