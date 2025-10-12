/**
 * 设置模态框组件
 * 包含主题设置、语言设置、API密钥管理等功能
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from './Modal';
import ThemeSettings from './ThemeSettings';
// import LanguageSelector from './LanguageSelector'; // 语言切换功能已禁用
import { ApiKeyManagement } from './settings/ApiKeyManagement';
import Button from './Button';
import { useI18n } from '../hooks/useI18n';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// 设置分类
type SettingsCategory = 'appearance' | 'language' | 'general' | 'api-keys' | 'about';

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { t } = useI18n();
  const [activeCategory, setActiveCategory] = useState<SettingsCategory>('appearance');

  // 设置分类配置
  const categories = [
    {
      id: 'appearance' as const,
      name: t('settings:categories.appearance'),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"
          />
        </svg>
      ),
    },
    // 语言切换功能已禁用
    // {
    //   id: 'language' as const,
    //   name: t('settings:categories.language'),
    //   icon: (
    //     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //       <path
    //         strokeLinecap="round"
    //         strokeLinejoin="round"
    //         strokeWidth={2}
    //         d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
    //       />
    //     </svg>
    //   ),
    // },
    {
      id: 'general' as const,
      name: t('settings:categories.general'),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
    },
    {
      id: 'api-keys' as const,
      name: 'API密钥',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
          />
        </svg>
      ),
    },
    {
      id: 'about' as const,
      name: t('settings:categories.about'),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  ];

  // 渲染设置内容
  const renderSettingsContent = () => {
    switch (activeCategory) {
      case 'appearance':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-text-primary mb-4">
                {t('settings:appearance.title')}
              </h3>
              <ThemeSettings />
            </div>
          </div>
        );

      // 语言切换功能已禁用
      // case 'language':
      //   return (
      //     <div className="space-y-6">
      //       <div>
      //         <h3 className="text-lg font-medium text-text-primary mb-4">
      //           {t('settings:language.title')}
      //         </h3>
      //         <div className="space-y-4">
      //           <div>
      //             <label className="block text-sm font-medium text-text-secondary mb-2">
      //               {t('settings:language.currentLanguage')}
      //             </label>
      //             <LanguageSelector
      //               variant="dropdown"
      //               showName={true}
      //               showFlag={true}
      //               className="w-full max-w-xs"
      //             />
      //           </div>
      //           <div className="text-sm text-text-secondary">
      //             <p>
      //               {t('settings:language.autoDetect')}: {t('common:actions.enable')}
      //             </p>
      //             <p className="mt-1">{t('settings:language.availableLanguages')}: 中文, English</p>
      //           </div>
      //         </div>
      //       </div>
      //     </div>
      //   );

      case 'general':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-text-primary mb-4">
                {t('settings:general.title')}
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-text-primary">
                      {t('settings:general.autoSave')}
                    </label>
                    <p className="text-xs text-text-secondary">
                      {t('settings:general.autoSaveDescription')}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary/50"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-text-primary">
                      {t('settings:general.checkUpdates')}
                    </label>
                    <p className="text-xs text-text-secondary">
                      {t('settings:general.checkUpdatesDescription')}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary/50"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'api-keys':
        return (
          <div className="space-y-6">
            <div>
              <ApiKeyManagement className="api-key-section" />
            </div>
          </div>
        );

      case 'about':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-text-primary mb-4">
                {t('settings:about.title')}
              </h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <span className="text-xl font-bold text-primary">XI</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-text-primary">{t('common:app.name')}</h4>
                    <p className="text-sm text-text-secondary">{t('common:app.description')}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-text-secondary">{t('settings:about.version')}:</span>
                    <span className="ml-2 text-text-primary">1.0.0</span>
                  </div>
                  <div>
                    <span className="text-text-secondary">{t('settings:about.developer')}:</span>
                    <span className="ml-2 text-text-primary">Furdow</span>
                  </div>
                </div>
                <div className="pt-4 border-t border-border">
                  <p className="text-xs text-text-secondary">
                    © 2025 XItools. {t('settings:about.license')}: MIT
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('settings:title')} size="xl">
      <div className="flex h-[600px] overflow-hidden">
        {/* 左侧分类导航 */}
        <div className="w-48 border-r border-border pr-4">
          <nav className="space-y-1">
            {categories.map((category) => (
              <motion.button
                key={category.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveCategory(category.id)}
                className={`
                  w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left
                  transition-colors duration-200
                  ${
                    activeCategory === category.id
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'text-text-secondary hover:text-text-primary hover:bg-background-secondary'
                  }
                `}
              >
                {category.icon}
                <span className="text-sm font-medium">{category.name}</span>
              </motion.button>
            ))}
          </nav>
        </div>

        {/* 右侧设置内容 */}
        <div className="flex-1 pl-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex-1 overflow-y-auto h-full"
            >
              {renderSettingsContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </Modal>
  );
};

export default SettingsModal;
