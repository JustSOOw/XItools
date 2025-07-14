/*
 * @Author: Furdow wang22338014@gmail.com
 * @Date: 2025-01-27 22:00:00
 * @LastEditors: JustSOOw 117962858+JustSOOw@users.noreply.github.com
 * @LastEditTime: 2025-06-15 11:29:22
 * @FilePath: \XItools\frontend\src\components\animations\AnimationDemo.tsx
 * @Description: 动画演示组件 - 用于测试和展示各种动画效果
 *
 * Copyright (c) 2025 by Furdow, All Rights Reserved.
 */

import React, { useState } from 'react';
import {
  PageTransition,
  ViewTransition,
  CardAnimation,
  CardListAnimation,
  ListAnimation,
  ListItemAnimation,
  ModalAnimation,
} from './index';
import {
  ConfirmDialog,
  SuccessAnimation,
  useConfirmDialog,
  useSuccessAnimation,
  StatusIndicator,
} from '../feedback';
import Button from '../Button';

/**
 * 动画演示组件
 * 用于开发和测试阶段验证动画效果
 */
const AnimationDemo: React.FC = () => {
  const [currentView, setCurrentView] = useState('demo1');
  const [showModal, setShowModal] = useState(false);
  const [items, setItems] = useState(['项目 1', '项目 2', '项目 3']);

  const { showConfirm, ConfirmDialog } = useConfirmDialog();
  const { showSuccess, SuccessAnimation } = useSuccessAnimation();

  const handleAddItem = () => {
    const newItem = `项目 ${items.length + 1}`;
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (index: number) => {
    showConfirm(
      {
        title: '确认删除',
        message: `确定要删除"${items[index]}"吗？`,
        type: 'danger',
      },
      () => {
        setItems(items.filter((_, i) => i !== index));
        showSuccess({
          message: '删除成功！',
          variant: 'simple',
        });
      },
    );
  };

  const handleShowSuccess = () => {
    showSuccess({
      message: '操作成功完成！',
      variant: 'celebration',
      duration: 3000,
    });
  };

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold text-text-primary mb-6">动画效果演示</h1>

      {/* 页面切换动画演示 */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-text-primary">页面切换动画</h2>
        <div className="flex space-x-2 mb-4">
          <Button onClick={() => setCurrentView('demo1')} size="sm">
            演示 1
          </Button>
          <Button onClick={() => setCurrentView('demo2')} size="sm">
            演示 2
          </Button>
          <Button onClick={() => setCurrentView('demo3')} size="sm">
            演示 3
          </Button>
        </div>

        <div className="h-32 bg-surface rounded-lg p-4">
          <ViewTransition viewKey={currentView} mode="slideUp">
            {currentView === 'demo1' && (
              <div className="text-center">
                <h3 className="text-lg font-medium text-text-primary">演示页面 1</h3>
                <p className="text-text-secondary">这是第一个演示页面的内容</p>
              </div>
            )}
            {currentView === 'demo2' && (
              <div className="text-center">
                <h3 className="text-lg font-medium text-text-primary">演示页面 2</h3>
                <p className="text-text-secondary">这是第二个演示页面的内容</p>
              </div>
            )}
            {currentView === 'demo3' && (
              <div className="text-center">
                <h3 className="text-lg font-medium text-text-primary">演示页面 3</h3>
                <p className="text-text-secondary">这是第三个演示页面的内容</p>
              </div>
            )}
          </ViewTransition>
        </div>
      </section>

      {/* 卡片动画演示 */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-text-primary">卡片动画</h2>
        <div className="grid grid-cols-3 gap-4">
          <CardAnimation variant="hover">
            <div className="bg-surface rounded-lg p-4 border border-border">
              <h3 className="font-medium text-text-primary">悬停动画</h3>
              <p className="text-sm text-text-secondary">鼠标悬停查看效果</p>
            </div>
          </CardAnimation>

          <CardAnimation variant="tap">
            <div className="bg-surface rounded-lg p-4 border border-border">
              <h3 className="font-medium text-text-primary">点击动画</h3>
              <p className="text-sm text-text-secondary">点击查看效果</p>
            </div>
          </CardAnimation>

          <CardAnimation variant="drag">
            <div className="bg-surface rounded-lg p-4 border border-border">
              <h3 className="font-medium text-text-primary">拖拽动画</h3>
              <p className="text-sm text-text-secondary">拖拽查看效果</p>
            </div>
          </CardAnimation>
        </div>
      </section>

      {/* 列表动画演示 */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-text-primary">列表动画</h2>
        <div className="flex space-x-2 mb-4">
          <Button onClick={handleAddItem} size="sm">
            添加项目
          </Button>
        </div>

        <ListAnimation className="space-y-2">
          {items.map((item, index) => (
            <ListItemAnimation key={item} itemKey={item} variant="slide">
              <div className="bg-surface rounded-lg p-3 border border-border flex justify-between items-center">
                <span className="text-text-primary">{item}</span>
                <Button variant="danger" size="sm" onClick={() => handleRemoveItem(index)}>
                  删除
                </Button>
              </div>
            </ListItemAnimation>
          ))}
        </ListAnimation>
      </section>

      {/* 状态指示器演示 */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-text-primary">状态指示器</h2>
        <div className="flex flex-wrap gap-4">
          <StatusIndicator status="loading" message="加载中..." />
          <StatusIndicator status="success" message="操作成功" />
          <StatusIndicator status="error" message="操作失败" />
          <StatusIndicator status="warning" message="警告信息" />
          <StatusIndicator status="info" message="提示信息" />
        </div>
      </section>

      {/* 反馈组件演示 */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-text-primary">反馈组件</h2>
        <div className="flex space-x-2">
          <Button onClick={() => setShowModal(true)}>显示模态框</Button>
          <Button onClick={handleShowSuccess}>显示成功动画</Button>
        </div>
      </section>

      {/* 模态框动画演示 */}
      <ModalAnimation
        isOpen={showModal}
        variant="scale"
        overlayClassName="bg-black/50 backdrop-blur-sm"
        onOverlayClick={() => setShowModal(false)}
        className="bg-background rounded-lg shadow-xl max-w-md w-full mx-4 p-6"
      >
        <h3 className="text-lg font-medium text-text-primary mb-4">模态框动画演示</h3>
        <p className="text-text-secondary mb-6">这是一个带有缩放动画的模态框示例。</p>
        <div className="flex justify-end space-x-2">
          <Button variant="ghost" onClick={() => setShowModal(false)}>
            取消
          </Button>
          <Button onClick={() => setShowModal(false)}>确定</Button>
        </div>
      </ModalAnimation>

      {/* 反馈组件 */}
      {ConfirmDialog}
      {SuccessAnimation}
    </div>
  );
};

export default AnimationDemo;
