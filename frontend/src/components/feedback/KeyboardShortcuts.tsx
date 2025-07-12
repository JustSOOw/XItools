/*
 * @Author: Furdow wang22338014@gmail.com
 * @Date: 2025-01-27 22:00:00
 * @LastEditors: Furdow wang22338014@gmail.com
 * @LastEditTime: 2025-01-27 22:00:00
 * @FilePath: \XItools\frontend\src\components\feedback\KeyboardShortcuts.tsx
 * @Description: 快捷键系统组件 - 提供全局快捷键支持和快捷键帮助
 *
 * Copyright (c) 2025 by Furdow, All Rights Reserved.
 */

import React, { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '../Modal';

interface KeyboardShortcut {
  key: string;
  description: string;
  action: () => void;
  category?: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
}

interface KeyboardShortcutsProps {
  shortcuts: KeyboardShortcut[];
  disabled?: boolean;
}

/**
 * 快捷键系统组件
 * 提供全局快捷键监听和处理
 */
const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({ shortcuts, disabled = false }) => {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (disabled) return;

      // 忽略在输入框中的按键
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.contentEditable === 'true'
      ) {
        return;
      }

      // 查找匹配的快捷键
      const matchedShortcut = shortcuts.find((shortcut) => {
        const keyMatch = shortcut.key.toLowerCase() === event.key.toLowerCase();
        const ctrlMatch = !!shortcut.ctrlKey === event.ctrlKey;
        const altMatch = !!shortcut.altKey === event.altKey;
        const shiftMatch = !!shortcut.shiftKey === event.shiftKey;

        return keyMatch && ctrlMatch && altMatch && shiftMatch;
      });

      if (matchedShortcut) {
        event.preventDefault();
        matchedShortcut.action();
      }
    },
    [shortcuts, disabled],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return null; // 这个组件不渲染任何内容
};

/**
 * 快捷键帮助模态框组件
 */
export const KeyboardShortcutsHelp: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  shortcuts: KeyboardShortcut[];
}> = ({ isOpen, onClose, shortcuts }) => {
  // 按类别分组快捷键
  const groupedShortcuts = shortcuts.reduce(
    (groups, shortcut) => {
      const category = shortcut.category || '通用';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(shortcut);
      return groups;
    },
    {} as Record<string, KeyboardShortcut[]>,
  );

  // 格式化快捷键显示
  const formatShortcut = (shortcut: KeyboardShortcut) => {
    const keys = [];
    if (shortcut.ctrlKey) keys.push('Ctrl');
    if (shortcut.altKey) keys.push('Alt');
    if (shortcut.shiftKey) keys.push('Shift');
    keys.push(shortcut.key.toUpperCase());
    return keys;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="快捷键帮助" size="lg">
      <div className="space-y-6">
        {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
          <motion.div
            key={category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-lg font-medium text-text-primary mb-3">{category}</h3>
            <div className="space-y-2">
              {categoryShortcuts.map((shortcut, index) => (
                <motion.div
                  key={index}
                  className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-surface transition-colors"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <span className="text-text-secondary">{shortcut.description}</span>
                  <div className="flex items-center space-x-1">
                    {formatShortcut(shortcut).map((key, keyIndex) => (
                      <React.Fragment key={keyIndex}>
                        <kbd className="px-2 py-1 text-xs font-mono bg-border text-text-primary rounded border">
                          {key}
                        </kbd>
                        {keyIndex < formatShortcut(shortcut).length - 1 && (
                          <span className="text-text-secondary">+</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </Modal>
  );
};

/**
 * 快捷键提示组件
 * 显示当前可用的快捷键提示
 */
export const KeyboardShortcutHint: React.FC<{
  shortcut: KeyboardShortcut;
  isVisible: boolean;
  position?: 'top' | 'bottom' | 'left' | 'right';
}> = ({ shortcut, isVisible, position = 'bottom' }) => {
  const formatShortcut = (shortcut: KeyboardShortcut) => {
    const keys = [];
    if (shortcut.ctrlKey) keys.push('Ctrl');
    if (shortcut.altKey) keys.push('Alt');
    if (shortcut.shiftKey) keys.push('Shift');
    keys.push(shortcut.key.toUpperCase());
    return keys.join(' + ');
  };

  const positionClasses = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
    left: 'right-full mr-2',
    right: 'left-full ml-2',
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`absolute z-50 ${positionClasses[position]}`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
        >
          <div className="bg-background border border-border rounded-lg shadow-lg px-3 py-2 whitespace-nowrap">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-text-secondary">{shortcut.description}</span>
              <kbd className="px-2 py-1 text-xs font-mono bg-surface text-text-primary rounded border">
                {formatShortcut(shortcut)}
              </kbd>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/**
 * 快捷键Hook
 * 提供便捷的快捷键管理功能
 */
export const useKeyboardShortcuts = () => {
  const [shortcuts, setShortcuts] = React.useState<KeyboardShortcut[]>([]);
  const [isHelpOpen, setIsHelpOpen] = React.useState(false);

  const addShortcut = useCallback((shortcut: KeyboardShortcut) => {
    setShortcuts((prev) => [...prev, shortcut]);
  }, []);

  const removeShortcut = useCallback((key: string) => {
    setShortcuts((prev) => prev.filter((s) => s.key !== key));
  }, []);

  const showHelp = useCallback(() => {
    setIsHelpOpen(true);
  }, []);

  const hideHelp = useCallback(() => {
    setIsHelpOpen(false);
  }, []);

  // 添加默认的帮助快捷键
  React.useEffect(() => {
    const helpShortcut: KeyboardShortcut = {
      key: '?',
      description: '显示快捷键帮助',
      action: showHelp,
      category: '帮助',
    };
    setShortcuts((prev) => [helpShortcut, ...prev]);
  }, [showHelp]);

  return {
    shortcuts,
    addShortcut,
    removeShortcut,
    showHelp,
    hideHelp,
    isHelpOpen,
    KeyboardShortcuts: <KeyboardShortcuts shortcuts={shortcuts} />,
    KeyboardShortcutsHelp: (
      <KeyboardShortcutsHelp isOpen={isHelpOpen} onClose={hideHelp} shortcuts={shortcuts} />
    ),
  };
};

export default KeyboardShortcuts;
