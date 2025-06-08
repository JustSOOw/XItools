import React from 'react';

interface ColumnPlaceholderProps {
  className?: string;
}

const ColumnPlaceholder: React.FC<ColumnPlaceholderProps> = ({ className }) => {
  return (
    <div 
      className={`
        w-72 h-32 rounded-lg border-2 border-dashed border-primary/30 bg-primary/5
        flex items-center justify-center transition-all duration-200
        ${className || ''}
      `}
    >
      <div className="text-center">
        <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-primary/20 flex items-center justify-center">
          <svg className="w-4 h-4 text-primary/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </div>
        <p className="text-sm text-primary/60 font-medium">放置列到此处</p>
      </div>
    </div>
  );
};

export default ColumnPlaceholder;
