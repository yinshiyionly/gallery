import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './Button';
import { ThemeToggle } from './ThemeToggle';
import { useUIStore } from '@/store';
import { cn } from '@/lib/utils';

interface UserPreferencesProps {
  className?: string;
}

export const UserPreferences: React.FC<UserPreferencesProps> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    galleryLayout, 
    setGalleryLayout,
    animationsEnabled,
    setAnimationsEnabled,
    autoPlayVideos,
    setAutoPlayVideos
  } = useUIStore();

  // 点击外部关闭
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && !(event.target as Element).closest('.preferences-container')) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className={cn('relative preferences-container', className)}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
        aria-label="用户偏好设置"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
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
        <span className="hidden sm:inline">偏好</span>
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
          >
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                用户偏好设置
              </h3>
              
              <div className="space-y-4">
                {/* 主题设置 */}
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      主题模式
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      选择您偏好的界面主题
                    </p>
                  </div>
                  <ThemeToggle showDropdown />
                </div>

                {/* 画廊布局 */}
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      画廊布局
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      选择媒体展示布局方式
                    </p>
                  </div>
                  <div className="flex border rounded-md overflow-hidden">
                    <button
                      className={cn(
                        'p-2 text-xs',
                        galleryLayout === 'grid'
                          ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                          : 'bg-white text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                      )}
                      onClick={() => setGalleryLayout('grid')}
                      title="网格布局"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                    </button>
                    <button
                      className={cn(
                        'p-2 text-xs',
                        galleryLayout === 'masonry'
                          ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                          : 'bg-white text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                      )}
                      onClick={() => setGalleryLayout('masonry')}
                      title="瀑布流布局"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 2h10v10H5V5z" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* 动画效果 */}
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      动画效果
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      启用或禁用界面动画
                    </p>
                  </div>
                  <button
                    onClick={() => setAnimationsEnabled(!animationsEnabled)}
                    className={cn(
                      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                      animationsEnabled
                        ? 'bg-primary-600'
                        : 'bg-gray-200 dark:bg-gray-700'
                    )}
                  >
                    <span
                      className={cn(
                        'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                        animationsEnabled ? 'translate-x-6' : 'translate-x-1'
                      )}
                    />
                  </button>
                </div>

                {/* 视频自动播放 */}
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      视频自动播放
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      在画廊中自动播放视频
                    </p>
                  </div>
                  <button
                    onClick={() => setAutoPlayVideos(!autoPlayVideos)}
                    className={cn(
                      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                      autoPlayVideos
                        ? 'bg-primary-600'
                        : 'bg-gray-200 dark:bg-gray-700'
                    )}
                  >
                    <span
                      className={cn(
                        'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                        autoPlayVideos ? 'translate-x-6' : 'translate-x-1'
                      )}
                    />
                  </button>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="w-full"
                >
                  关闭
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};