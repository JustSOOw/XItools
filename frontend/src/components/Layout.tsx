import React, { ReactNode, useState } from 'react';
import classNames from 'classnames';
import ThemeToggle from './ThemeToggle';

export interface LayoutProps {
  children: ReactNode;
  className?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, className }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  return (
    <div className="flex h-screen overflow-hidden bg-background p-4 gap-4">
      {/* 侧边栏 */}
      <aside
        className={classNames(
          'sidebar-container transition-all duration-300 ease-in-out flex flex-col',
          isSidebarCollapsed ? 'w-16' : 'w-64'
        )}
      >
        {/* Logo区域 */}
        <div className={classNames(
          'h-16 border-b border-border/30 flex items-center px-4 mb-2',
          isSidebarCollapsed ? 'justify-center' : 'justify-between'
        )}>
          {!isSidebarCollapsed && <h1 className="text-xl font-bold text-primary">XItools</h1>}
          {isSidebarCollapsed && <span className="text-xl font-bold text-primary">XI</span>}

          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-1.5 rounded-element hover:bg-primary/10 text-text-secondary hover:text-primary transition-all duration-200"
            aria-label={isSidebarCollapsed ? '展开侧边栏' : '收起侧边栏'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              {isSidebarCollapsed ? (
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              ) : (
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              )}
            </svg>
          </button>
        </div>
        
        {/* 导航菜单 */}
        <nav className="flex-1 overflow-y-auto py-2">
          <ul className="space-y-2 px-3">
            <SidebarItem 
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1H3a1 1 0 01-1-1V4zM8 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1H9a1 1 0 01-1-1V4zM15 3a1 1 0 00-1 1v12a1 1 0 001 1h2a1 1 0 001-1V4a1 1 0 00-1-1h-2z" />
                </svg>
              } 
              label="看板" 
              isActive={true} 
              isCollapsed={isSidebarCollapsed} 
            />
            <SidebarItem 
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              } 
              label="列表" 
              isCollapsed={isSidebarCollapsed} 
            />
            <SidebarItem 
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
              } 
              label="日历" 
              isCollapsed={isSidebarCollapsed} 
            />
            <SidebarItem 
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
              } 
              label="设置" 
              isCollapsed={isSidebarCollapsed} 
            />
          </ul>
        </nav>
        
        {/* 主题切换按钮 */}
        <div className="p-3 border-t border-border/30 mt-2">
          <div className="w-full">
            <ThemeToggle
              showLabel={!isSidebarCollapsed}
              size="md"
              variant="button"
              className="w-full"
            />
          </div>
        </div>
      </aside>
      
      {/* 主内容区 */}
      <main className={classNames('flex-1 overflow-hidden', className)}>
        {children}
      </main>
    </div>
  );
};

// 侧边栏项目组件
interface SidebarItemProps {
  icon: ReactNode;
  label: string;
  isActive?: boolean;
  isCollapsed?: boolean;
  onClick?: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  icon,
  label,
  isActive = false,
  isCollapsed = false,
  onClick,
}) => {
  return (
    <li>
      <button
        onClick={onClick}
        className={classNames(
          'w-full flex items-center px-3 py-2.5 menu-item transition-all duration-200',
          isActive
            ? 'menu-item-active text-primary'
            : 'text-text-secondary hover:text-text-primary'
        )}
      >
        <span className="flex-shrink-0">{icon}</span>
        {!isCollapsed && <span className="ml-3">{label}</span>}
      </button>
    </li>
  );
};

export default Layout; 