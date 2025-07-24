import React, { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { MediaItem } from '@/types';

interface MediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  media: MediaItem | null;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

export const MediaModal: React.FC<MediaModalProps> = ({
  isOpen,
  onClose,
  media,
  onPrevious,
  onNext,
  hasPrevious = false,
  hasNext = false,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  // Reset zoom and position when media changes
  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [media?._id]);

  // Handle fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  }, []);

  // Listen for fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Handle zoom in/out
  const handleZoomIn = () => {
    setScale(prevScale => Math.min(prevScale + 0.25, 3));
  };

  const handleZoomOut = () => {
    setScale(prevScale => {
      const newScale = Math.max(prevScale - 0.25, 1);
      if (newScale === 1) {
        setPosition({ x: 0, y: 0 }); // Reset position when zoomed out completely
      }
      return newScale;
    });
  };

  const handleResetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          if (hasPrevious && onPrevious) onPrevious();
          break;
        case 'ArrowRight':
          if (hasNext && onNext) onNext();
          break;
        case '+':
        case '=':
          handleZoomIn();
          break;
        case '-':
          handleZoomOut();
          break;
        case '0':
          handleResetZoom();
          break;
        case 'f':
          toggleFullscreen();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, hasPrevious, hasNext, onPrevious, onNext, toggleFullscreen]);

  if (!media) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-5xl w-full bg-white dark:bg-gray-900 p-0"
      size="xl"
    >
      <div className="flex flex-col">
        <div className="relative w-full overflow-hidden bg-black" style={{ 
          height: isFullscreen ? '90vh' : '70vh',
        }}>
          {media.type === 'image' ? (
            <div className="w-full h-full flex items-center justify-center overflow-hidden">
              <motion.div
                className="relative"
                style={{
                  scale,
                  x: position.x,
                  y: position.y,
                  cursor: scale > 1 ? 'grab' : 'default',
                }}
                drag={scale > 1}
                dragConstraints={{ left: -300, right: 300, top: -300, bottom: 300 }}
                dragElastic={0.1}
                onDragStart={() => setIsDragging(true)}
                onDragEnd={() => setIsDragging(false)}
              >
                <Image
                  src={media.url}
                  alt={media.title}
                  width={media.metadata.width || 800}
                  height={media.metadata.height || 600}
                  className="object-contain max-h-[70vh]"
                  sizes="(max-width: 768px) 100vw, 1200px"
                  priority
                  quality={90}
                  onDoubleClick={handleZoomIn}
                />
              </motion.div>
            </div>
          ) : (
            <video
              src={media.url}
              controls
              className="w-full h-full object-contain"
              poster={media.thumbnailUrl}
            />
          )}

          {/* Navigation buttons */}
          <div className="absolute inset-y-0 left-0 flex items-center">
            {hasPrevious && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onPrevious}
                className="bg-black/30 text-white hover:bg-black/50 rounded-full ml-2 z-10"
                aria-label="上一个"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </Button>
            )}
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center">
            {hasNext && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onNext}
                className="bg-black/30 text-white hover:bg-black/50 rounded-full mr-2 z-10"
                aria-label="下一个"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Button>
            )}
          </div>

          {/* Controls overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent flex justify-center items-center gap-2">
            {media.type === 'image' && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleZoomOut}
                  disabled={scale === 1}
                  className="text-white hover:bg-black/30 rounded-full"
                  aria-label="缩小"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    <path fillRule="evenodd" d="M5 8a1 1 0 011-1h4a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </Button>
                <span className="text-white text-sm">{Math.round(scale * 100)}%</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleZoomIn}
                  disabled={scale >= 3}
                  className="text-white hover:bg-black/30 rounded-full"
                  aria-label="放大"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    <path fillRule="evenodd" d="M8 5a1 1 0 000 2v3a1 1 0 001 1h3a1 1 0 100-2H9V5a1 1 0 00-1 0z" clipRule="evenodd" />
                  </svg>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleResetZoom}
                  disabled={scale === 1 && position.x === 0 && position.y === 0}
                  className="text-white hover:bg-black/30 rounded-full"
                  aria-label="重置缩放"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              className="text-white hover:bg-black/30 rounded-full"
              aria-label={isFullscreen ? "退出全屏" : "全屏查看"}
            >
              {isFullscreen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 10a1 1 0 011-1h3a1 1 0 01-1-1V5a1 1 0 112 0v3a1 1 0 01-1 1H6a1 1 0 01-1-1zm10 0a1 1 0 01-1 1h-3a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1h3a1 1 0 011 1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 011.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 011.414-1.414L15 13.586V12a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              )}
            </Button>
          </div>
        </div>

        <div className="p-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{media.title}</h2>
          
          {media.description && (
            <p className="mt-2 text-gray-700 dark:text-gray-300">{media.description}</p>
          )}

          <div className="mt-4 flex flex-wrap gap-1">
            {media.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-500 dark:text-gray-400">
            <div>
              <p>
                <span className="font-medium">类型:</span>{' '}
                {media.type === 'image' ? '图片' : '视频'}
              </p>
              {media.metadata.width && media.metadata.height && (
                <p>
                  <span className="font-medium">尺寸:</span>{' '}
                  {media.metadata.width} x {media.metadata.height}
                </p>
              )}
            </div>
            <div>
              {media.metadata.format && (
                <p>
                  <span className="font-medium">格式:</span> {media.metadata.format}
                </p>
              )}
              <p>
                <span className="font-medium">上传时间:</span>{' '}
                {new Date(media.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <div className="mt-4 flex justify-between items-center">
            <div className="flex gap-2">
              {hasPrevious && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onPrevious}
                  className="flex items-center gap-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  上一个
                </Button>
              )}
              {hasNext && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onNext}
                  className="flex items-center gap-1"
                >
                  下一个
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </Button>
              )}
            </div>
            <div className="text-xs text-gray-500">
              {media.type === 'image' && '提示: 双击图片放大, 使用鼠标拖动移动图片'}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};