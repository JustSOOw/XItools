import React, { ReactNode, useState } from 'react';
import classNames from 'classnames';
import Sidebar from './navigation/Sidebar';
import SettingsModal from './SettingsModal';
import { useI18n } from '../hooks/useI18n';

export interface LayoutProps {
  children: ReactNode;
  className?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, className }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // 获取翻译函数
  const { t } = useI18n();
  
  return (
    <div className="flex h-screen overflow-hidden bg-background p-4 gap-4">
      {/* 多级导航侧边栏 */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />
      
      {/* 主内容区 */}
      <main className={classNames('flex-1 overflow-hidden', className)}>
        {children}
      </main>

      {/* 设置模态框 */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};

// 移除旧的SidebarItem组件，现在使用新的导航组件

export default Layout; 