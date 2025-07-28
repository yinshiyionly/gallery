import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { MediaCard } from './MediaCard';
import { Loading } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';
import { InfiniteScrollLoader, ScrollTrigger } from '@/components/ui/SmoothScroll';
import { useInfiniteScroll } from '@/hooks';
import { useImagePreloading } from '@/hooks/useImagePreloading';
import { MediaItem, LayoutType } from '@/types';
import { useUIStore } from '@/store';

interface GalleryGridProps {
  items: MediaItem[];
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => Promise<void>;
  onItemClick: (item: MediaItem) => void;
  className?: string;
  layoutControls?: boolean;
}

/**
 * 画廊网格布局组件
 * 支持网格和瀑布流两种布局模式，实现无限滚动加载
 */
export const GalleryGrid: React.FC<GalleryGridProps> = ({
  items,
  loading,
  hasMore,
  onLoadMore,
  onItemClick,
  className = '',
  layoutControls = true,
}) => {
  // 从 UI Store 获取布局类型
  const { galleryLayout, setGalleryLayout } = useUIStore();
  
  // 无限滚动的引用元素
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  
  // 使用自定义 hook 实现无限滚动
  const { isFetching } = useInfiniteScroll(loadMoreRef, onLoadMore, {
    threshold: 0.5,
    disabled: !hasMore || loading,
  });

  // 使用图片预加载 hook
  const { preloadNext, preloadBasedOnVisible } = useImagePreloading(items, {
    preloadCount: 8,
    priority: 'medium'
  });

  // 布局切换动画
  useEffect(() => {
    controls.start({
      opacity: 1,
      transition: { duration: 0.3 }
    });
  }, [galleryLayout, controls]);

  // 当新项目加载时，预加载下一批图片
  useEffect(() => {
    if (items.length > 0) {
      const visibleIndexes = items.slice(0, 12).map((_, index) => index);
      preloadBasedOnVisible(visibleIndexes);
    }
  }, [items.length, preloadBasedOnVisible]);

  // 动画变体
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.9
    },
    show: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    },
  };

  // 布局切换动画变体
  const layoutVariants = {
    grid: {
      opacity: 1,
      transition: { duration: 0.3 }
    },
    masonry: {
      opacity: 1,
      transition: { duration: 0.3 }
    }
  };

  // 切换布局类型
  const toggleLayout = (layout: LayoutType) => {
    setGalleryLayout(layout);
  };

  // 如果没有内容且不在加载中，显示空状态
  if (items.length === 0 && !loading) {
    return (
      <EmptyState
        icon={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        }
        title="没有找到媒体内容"
        description="请尝试调整搜索条件或清除筛选器"
      />
    );
  }

  return (
    <div className={`w-full ${className}`}>
      {/* 布局控制按钮 */}
      {layoutControls && (
        <ScrollTrigger animation="slideUp" className="flex justify-end mb-6">
          <motion.div 
            className="inline-flex rounded-lg shadow-sm bg-white dark:bg-gray-800 p-1" 
            role="group"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <motion.button
              type="button"
              onClick={() => toggleLayout('grid')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                galleryLayout === 'grid'
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-current={galleryLayout === 'grid' ? 'page' : undefined}
            >
              <motion.svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                animate={{ rotate: galleryLayout === 'grid' ? 0 : -5 }}
                transition={{ duration: 0.2 }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </motion.svg>
            </motion.button>
            <motion.button
              type="button"
              onClick={() => toggleLayout('masonry')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                galleryLayout === 'masonry'
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-current={galleryLayout === 'masonry' ? 'page' : undefined}
            >
              <motion.svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                animate={{ rotate: galleryLayout === 'masonry' ? 0 : 5 }}
                transition={{ duration: 0.2 }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </motion.svg>
            </motion.button>
          </motion.div>
        </ScrollTrigger>
      )}

      {/* 媒体网格 */}
      <motion.div
        layout
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className={
          galleryLayout === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'
            : 'columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6'
        }
        style={{ opacity: 0 }}
        animate={controls}
      >
        <AnimatePresence mode="popLayout">
          {items.map((item, index) => (
            <motion.div
              key={item._id}
              variants={itemVariants}
              layout
              className={galleryLayout === 'masonry' ? 'mb-6 break-inside-avoid' : ''}
              initial="hidden"
              animate="show"
              exit={{ 
                opacity: 0, 
                scale: 0.8,
                y: -20,
                transition: { duration: 0.2 }
              }}
              whileHover={{ 
                zIndex: 10,
                transition: { duration: 0.1 }
              }}
            >
              <MediaCard 
                media={item} 
                onClick={onItemClick} 
                priority={index < 8} 
                layoutId={`media-${item._id}`}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* 无限滚动加载器 */}
      <InfiniteScrollLoader
        isLoading={loading || isFetching}
        hasMore={hasMore}
        onLoadMore={async () => {
          if (!loading && !isFetching) {
            await onLoadMore();
          }
        }}
        className="mt-8"
      />
      
      {/* 隐藏的触发器元素 */}
      <div ref={loadMoreRef} className="h-1" />
    </div>
  );
};