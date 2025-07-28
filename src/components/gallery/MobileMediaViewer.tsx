import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { OptimizedImage } from '../ui/OptimizedImage';
import { useTouch } from '@/hooks/useTouch';
import { MediaItem } from '@/types';

interface MobileMediaViewerProps {
  media: MediaItem;
  isOpen: boolean;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

/**
 * 移动端优化的媒体查看器
 * 支持触摸手势、缩放、滑动切换等功能
 */
export const MobileMediaViewer: React.FC<MobileMediaViewerProps> = ({
  media,
  isOpen,
  onClose,
  onNext,
  onPrevious,
  hasNext = false,
  hasPrevious = false
}) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 重置视图状态
  const resetView = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setIsDragging(false);
  };

  // 自动隐藏控制栏
  const hideControlsAfterDelay = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  // 显示控制栏
  const showControlsTemporarily = () => {
    setShowControls(true);
    hideControlsAfterDelay();
  };

  // 触摸手势处理
  const { ref: touchRef } = useTouch({
    onSwipe: (gesture) => {
      if (scale > 1) return; // 缩放状态下不处理滑动切换
      
      if (gesture.direction === 'left' && hasNext && onNext) {
        onNext();
        resetView();
      } else if (gesture.direction === 'right' && hasPrevious && onPrevious) {
        onPrevious();
        resetView();
      } else if (gesture.direction === 'down' && gesture.distance > 100) {
        onClose();
      }
    },
    onPinch: (gesture) => {
      const newScale = Math.max(0.5, Math.min(3, gesture.scale));
      setScale(newScale);
      
      if (newScale === 1) {
        setPosition({ x: 0, y: 0 });
      }
    },
    onTap: () => {
      showControlsTemporarily();
    },
    onDoubleTap: (point) => {
      if (scale === 1) {
        // 双击放大到点击位置
        const rect = imageRef.current?.getBoundingClientRect();
        if (rect) {
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          const offsetX = (centerX - (point.x - rect.left)) * 1.5;
          const offsetY = (centerY - (point.y - rect.top)) * 1.5;
          
          setScale(2);
          setPosition({ x: offsetX, y: offsetY });
        }
      } else {
        // 双击重置
        resetView();
      }
    },
    swipeThreshold: 50,
    pinchThreshold: 0.1
  });

  // 拖拽处理
  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDrag = (event: any, info: PanInfo) => {
    if (scale > 1) {
      setPosition(prev => ({
        x: prev.x + info.delta.x,
        y: prev.y + info.delta.y
      }));
    }
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    setIsDragging(false);
    
    if (scale === 1) {
      // 在原始尺寸下，处理滑动切换
      const threshold = 100;
      const velocity = Math.abs(info.velocity.x);
      
      if (Math.abs(info.offset.x) > threshold || velocity > 500) {
        if (info.offset.x > 0 && hasPrevious && onPrevious) {
          onPrevious();
          resetView();
        } else if (info.offset.x < 0 && hasNext && onNext) {
          onNext();
          resetView();
        }
      } else if (info.offset.y > threshold && info.velocity.y > 300) {
        // 向下滑动关闭
        onClose();
      }
    } else {
      // 缩放状态下，限制拖拽范围
      const maxX = (scale - 1) * 150;
      const maxY = (scale - 1) * 150;
      
      setPosition(prev => ({
        x: Math.max(-maxX, Math.min(maxX, prev.x)),
        y: Math.max(-maxY, Math.min(maxY, prev.y))
      }));
    }
  };

  // 合并refs
  const combinedRef = (element: HTMLDivElement) => {
    containerRef.current = element;
    touchRef.current = element;
  };

  // 当媒体变化时重置视图
  useEffect(() => {
    if (isOpen) {
      resetView();
      showControlsTemporarily();
    }
  }, [media._id, isOpen]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={combinedRef}
        className="fixed inset-0 z-50 bg-black"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* 背景遮罩 */}
        <motion.div
          className="absolute inset-0 bg-black"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.9 }}
          exit={{ opacity: 0 }}
        />

        {/* 媒体内容 */}
        <motion.div
          ref={imageRef}
          className="absolute inset-0 flex items-center justify-center"
          drag={scale > 1}
          dragConstraints={containerRef}
          dragElastic={0.1}
          onDragStart={handleDragStart}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          animate={{
            scale,
            x: position.x,
            y: position.y
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30
          }}
          style={{
            cursor: isDragging ? 'grabbing' : scale > 1 ? 'grab' : 'default'
          }}
        >
          <OptimizedImage
            src={media.url}
            alt={media.title}
            className="max-w-full max-h-full object-contain"
            priority
            optimizationOptions={{
              quality: 95,
              format: 'auto'
            }}
            showPlaceholder={true}
          />
        </motion.div>

        {/* 控制栏 */}
        <AnimatePresence>
          {showControls && (
            <>
              {/* 顶部控制栏 */}
              <motion.div
                className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/60 to-transparent p-4"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between text-white">
                  <button
                    onClick={onClose}
                    className="p-2 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  
                  <div className="text-center">
                    <h3 className="text-lg font-medium truncate max-w-xs">{media.title}</h3>
                    {media.metadata && (
                      <p className="text-sm text-gray-300">
                        {media.metadata.width} × {media.metadata.height}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* 缩放指示器 */}
                    {scale !== 1 && (
                      <span className="text-sm bg-black/30 backdrop-blur-sm px-2 py-1 rounded">
                        {Math.round(scale * 100)}%
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* 底部控制栏 */}
              <motion.div
                className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/60 to-transparent p-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-center space-x-6">
                  {/* 上一张按钮 */}
                  <button
                    onClick={() => {
                      if (onPrevious) {
                        onPrevious();
                        resetView();
                      }
                    }}
                    disabled={!hasPrevious}
                    className={`p-3 rounded-full backdrop-blur-sm transition-colors ${
                      hasPrevious 
                        ? 'bg-white/20 text-white hover:bg-white/30' 
                        : 'bg-gray-600/20 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  {/* 重置缩放按钮 */}
                  <button
                    onClick={resetView}
                    className="p-3 rounded-full bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>

                  {/* 下一张按钮 */}
                  <button
                    onClick={() => {
                      if (onNext) {
                        onNext();
                        resetView();
                      }
                    }}
                    disabled={!hasNext}
                    className={`p-3 rounded-full backdrop-blur-sm transition-colors ${
                      hasNext 
                        ? 'bg-white/20 text-white hover:bg-white/30' 
                        : 'bg-gray-600/20 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                {/* 手势提示 */}
                <motion.div
                  className="mt-4 text-center text-sm text-gray-300"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1, duration: 0.5 }}
                >
                  <p>双击缩放 • 滑动切换 • 下拉关闭</p>
                </motion.div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* 加载指示器 */}
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ delay: 0.5, duration: 0.3 }}
        >
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};