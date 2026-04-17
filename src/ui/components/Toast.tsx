import { useEffect, useState } from 'preact/hooks';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

export interface ToastProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

export function Toast({ toasts, onRemove }: ToastProps) {
  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <ToastItem 
          key={toast.id} 
          toast={toast} 
          onRemove={onRemove} 
        />
      ))}
    </div>
  );
}

interface ToastItemProps {
  toast: ToastMessage;
  onRemove: (id: string) => void;
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // 显示动画
    const showTimer = setTimeout(() => setIsVisible(true), 10);
    
    // 自动隐藏
    const duration = toast.duration || 3000;
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onRemove(toast.id), 300);
    }, duration);
    
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [toast.id, toast.duration, onRemove]);
  
  const getTypeStyles = (type: ToastType): string => {
    const typeMap: Record<ToastType, string> = {
      success: 'toast--success',
      error: 'toast--error',
      warning: 'toast--warning',
      info: 'toast--info'
    };
    return typeMap[type];
  };
  
  const getIcon = (type: ToastType): string => {
    const iconMap: Record<ToastType, string> = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };
    return iconMap[type];
  };
  
  return (
    <div 
      className={`toast ${getTypeStyles(toast.type)} ${isVisible ? 'toast--visible' : ''}`}
    >
      <span className="toast__icon">
        {getIcon(toast.type)}
      </span>
      <span className="toast__message">
        {toast.message}
      </span>
      <button 
        className="toast__close"
        onClick={() => onRemove(toast.id)}
      >
        ×
      </button>
    </div>
  );
}

// Toast 管理器 Hook
export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  
  const addToast = (type: ToastType, message: string, duration?: number) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newToast: ToastMessage = { id, type, message, duration };
    setToasts(prev => [...prev, newToast]);
  };
  
  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };
  
  return { toasts, addToast, removeToast };
}