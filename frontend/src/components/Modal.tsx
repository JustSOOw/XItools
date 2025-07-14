import React, { ReactNode, useEffect, useRef } from 'react';
import classNames from 'classnames';
import Button from './Button';
import Portal from './Portal';
import {
  ModalAnimation,
  ModalHeaderAnimation,
  ModalContentAnimation,
  ModalFooterAnimation,
} from './animations';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
  closeOnClickOutside?: boolean;
  closeOnEsc?: boolean;
  showCloseButton?: boolean;
  footer?: ReactNode;
  animationVariant?: 'fade' | 'scale' | 'slideUp' | 'slideDown';
  disableAnimation?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  size = 'md',
  className,
  closeOnClickOutside = true,
  closeOnEsc = true,
  showCloseButton = true,
  footer,
  animationVariant = 'scale',
  disableAnimation = false,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // 处理ESC键关闭
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && closeOnEsc) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, closeOnEsc]);

  // 处理点击外部关闭
  const handleOutsideClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node) && closeOnClickOutside) {
      onClose();
    }
  };

  // 模态框打开时禁止滚动
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // 设置大小类
  const sizeClasses = {
    sm: 'max-w-sm max-h-[80vh]',
    md: 'max-w-md max-h-[85vh]',
    lg: 'max-w-2xl max-h-[90vh]',
    xl: 'max-w-4xl max-h-[90vh]',
    full: 'max-w-full max-h-[95vh] mx-4',
  };

  // 如果禁用动画，使用原始实现
  if (disableAnimation) {
    if (!isOpen) return null;

    return (
      <Portal>
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={handleOutsideClick}
        >
          <div
            ref={modalRef}
            className={classNames(
              'bg-background rounded-lg shadow-xl w-full transition-all flex flex-col',
              sizeClasses[size],
              className,
            )}
          >
            {/* 模态框头部 */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                {title && <h3 className="text-lg font-medium">{title}</h3>}

                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="text-text-secondary hover:text-text-primary focus:outline-none"
                    aria-label="关闭"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                )}
              </div>
            )}

            {/* 模态框内容 */}
            <div className="px-6 py-4 overflow-y-auto flex-1">{children}</div>

            {/* 模态框底部 */}
            {footer && (
              <div className="flex justify-end space-x-2 px-6 py-4 border-t border-border flex-shrink-0">
                {footer}
              </div>
            )}
          </div>
        </div>
      </Portal>
    );
  }

  // 使用动画版本
  return (
    <Portal>
      <ModalAnimation
        isOpen={isOpen}
        variant={animationVariant}
        overlayClassName="bg-black/50 backdrop-blur-sm"
        onOverlayClick={closeOnClickOutside ? onClose : undefined}
        className={classNames(
          'bg-background rounded-lg shadow-xl w-full flex flex-col',
          sizeClasses[size],
          className,
        )}
      >
        <div ref={modalRef}>
          {/* 模态框头部 */}
          {(title || showCloseButton) && (
            <ModalHeaderAnimation className="flex items-center justify-between px-6 py-4 border-b border-border">
              {title && <h3 className="text-lg font-medium">{title}</h3>}

              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="text-text-secondary hover:text-text-primary focus:outline-none"
                  aria-label="关闭"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              )}
            </ModalHeaderAnimation>
          )}

          {/* 模态框内容 */}
          <ModalContentAnimation className="px-6 py-4 overflow-y-auto flex-1">
            {children}
          </ModalContentAnimation>

          {/* 模态框底部 */}
          {footer && (
            <ModalFooterAnimation className="flex justify-end space-x-2 px-6 py-4 border-t border-border flex-shrink-0">
              {footer}
            </ModalFooterAnimation>
          )}
        </div>
      </ModalAnimation>
    </Portal>
  );
};

// 预设的模态框底部按钮组
export const ModalFooter: React.FC<{
  onCancel?: () => void;
  onConfirm?: () => void;
  cancelText?: string;
  confirmText?: string;
  isConfirmLoading?: boolean;
  isConfirmDisabled?: boolean;
}> = ({
  onCancel,
  onConfirm,
  cancelText = '取消',
  confirmText = '确定',
  isConfirmLoading = false,
  isConfirmDisabled = false,
}) => {
  return (
    <>
      {onCancel && (
        <Button variant="ghost" onClick={onCancel}>
          {cancelText}
        </Button>
      )}
      {onConfirm && (
        <Button
          variant="primary"
          onClick={onConfirm}
          isLoading={isConfirmLoading}
          disabled={isConfirmDisabled}
        >
          {confirmText}
        </Button>
      )}
    </>
  );
};

export default Modal;
