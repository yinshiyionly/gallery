import React from 'react';
import { motion, PanInfo, useAnimation } from 'framer-motion';
import { useRouter } from 'next/router';

interface GestureHandlerProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  enableNavigation?: boolean;
  swipeThreshold?: number;
  className?: string;
}

export const GestureHandler: React.FC<GestureHandlerProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  enableNavigation = false,
  swipeThreshold = 100,
  className = '',
}) => {
  const router = useRouter();
  const controls = useAnimation();
  const [isDragging, setIsDragging] = React.useState(false);

  // 处理拖拽开始
  const handleDragStart = () => {
    setIsDragging(true);
  };

  // 处理拖拽结束
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);
    
    const { offset, velocity } = info;
    const swipeConfidenceThreshold = 10000;
    const swipePower = Math.abs(offset.x) * velocity.x;

    // 水平滑动检测
    if (Math.abs(offset.x) > swipeThreshold || swipePower > swipeConfidenceThreshold) {
      if (offset.x > 0) {
        // 向右滑动
        if (onSwipeRight) {
          onSwipeRight();
        } else if (enableNavigation) {
          router.back();
        }
      } else {
        // 向左滑动
        if (onSwipeLeft) {
          onSwipeLeft();
        } else if (enableNavigation) {
          // 可以实现前进功能，但浏览器API限制
          console.log('向左滑动 - 前进');
        }
      }
    }

    // 垂直滑动检测
    if (Math.abs(offset.y) > swipeThreshold) {
      if (offset.y > 0) {
        // 向下滑动
        if (onSwipeDown) {
          onSwipeDown();
        }
      } else {
        // 向上滑动
        if (onSwipeUp) {
          onSwipeUp();
        }
      }
    }

    // 重置位置
    controls.start({
      x: 0,
      y: 0,
      transition: { type: 'spring', stiffness: 300, damping: 30 }
    });
  };

  return (
    <motion.div
      className={className}
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.2}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      animate={controls}
      whileDrag={{ scale: 0.95 }}
      style={{
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
    >
      {children}
    </motion.div>
  );
};

// 页面级手势处理组件
export const PageGestureHandler: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  const router = useRouter();

  const handleSwipeRight = () => {
    // 向右滑动返回上一页
    if (window.history.length > 1) {
      router.back();
    }
  };

  const handleSwipeUp = () => {
    // 向上滑动回到顶部
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleSwipeDown = () => {
    // 向下滑动刷新页面（仅在顶部时）
    if (window.scrollY === 0) {
      router.reload();
    }
  };

  return (
    <GestureHandler
      onSwipeRight={handleSwipeRight}
      onSwipeUp={handleSwipeUp}
      onSwipeDown={handleSwipeDown}
      enableNavigation={true}
      className={className}
    >
      {children}
    </GestureHandler>
  );
};

// 媒体浏览手势处理组件
export const MediaGestureHandler: React.FC<{
  children: React.ReactNode;
  onPrevious?: () => void;
  onNext?: () => void;
  onClose?: () => void;
  className?: string;
}> = ({ children, onPrevious, onNext, onClose, className = '' }) => {
  const handleSwipeLeft = () => {
    if (onNext) {
      onNext();
    }
  };

  const handleSwipeRight = () => {
    if (onPrevious) {
      onPrevious();
    }
  };

  const handleSwipeDown = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <GestureHandler
      onSwipeLeft={handleSwipeLeft}
      onSwipeRight={handleSwipeRight}
      onSwipeDown={handleSwipeDown}
      swipeThreshold={80}
      className={className}
    >
      {children}
    </GestureHandler>
  );
};

// 列表项手势处理组件
export const ListItemGestureHandler: React.FC<{
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  className?: string;
}> = ({ children, onSwipeLeft, onSwipeRight, className = '' }) => {
  return (
    <GestureHandler
      onSwipeLeft={onSwipeLeft}
      onSwipeRight={onSwipeRight}
      swipeThreshold={60}
      className={className}
    >
      {children}
    </GestureHandler>
  );
};