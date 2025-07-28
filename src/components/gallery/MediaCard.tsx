import React, { useState, useRef, useEffect } from 'react';
import { motion, useInView, useAnimation } from 'framer-motion';
import { MediaItem } from '@/types';
import { OptimizedImage } from '../ui/OptimizedImage';
import { preloadCriticalImages } from '@/lib/utils/imagePreloader';

interface MediaCardProps {
  media: MediaItem;
  onClick?: (media: MediaItem) => void;
  priority?: boolean;
  className?: string;
  layoutId?: string;
}

export const MediaCard: React.FC<MediaCardProps> = ({ 
  media, 
  onClick, 
  priority = false,
  className = '',
  layoutId
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "50px" });
  const controls = useAnimation();
  
  // 进入视图时的动画
  useEffect(() => {
    if (isInView) {
      controls.start({
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
          duration: 0.6,
          ease: "easeOut",
        }
      });
    }
  }, [isInView, controls]);

  // 预加载关键图片
  useEffect(() => {
    if (priority && media.thumbnailUrl) {
      preloadCriticalImages([media.thumbnailUrl, media.url]);
    }
  }, [priority, media.thumbnailUrl, media.url]);
  
  const handleClick = () => {
    if (onClick) {
      onClick(media);
    }
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  return (
    <motion.div
      ref={ref}
      layoutId={layoutId}
      className={`group relative overflow-hidden rounded-lg bg-white dark:bg-gray-800 shadow-md cursor-pointer ${className}`}
      initial={{ 
        opacity: 0, 
        y: 30, 
        scale: 0.9 
      }}
      animate={controls}
      whileHover={{ 
        y: -8,
        scale: 1.02,
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        transition: { 
          duration: 0.3,
          ease: "easeOut"
        }
      }}
      whileTap={{ 
        scale: 0.98,
        transition: { duration: 0.1 }
      }}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="aspect-[4/3] relative overflow-hidden">
        {/* 优化的图片组件 */}
        <OptimizedImage
          src={media.thumbnailUrl}
          alt={media.title}
          aspectRatio={4/3}
          lazy={!priority}
          priority={priority}
          className="w-full h-full"
          optimizationOptions={{
            quality: priority ? 90 : 80,
            format: 'auto'
          }}
          onLoadComplete={handleImageLoad}
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        
        {/* 悬停时的缩放效果覆盖层 */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ scale: 1 }}
          animate={{ 
            scale: isHovered ? 1.05 : 1
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          style={{
            backgroundImage: `url(${media.thumbnailUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: isHovered ? 0.1 : 0
          }}
        />
        {/* 视频播放图标 */}
        {media.type === 'video' && (
          <motion.div 
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: imageLoaded ? 1 : 0,
              scale: imageLoaded ? 1 : 0.8
            }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <motion.div 
              className="bg-black/60 backdrop-blur-sm rounded-full p-3"
              initial={{ scale: 1 }}
              animate={{ 
                scale: isHovered ? 1.2 : 1,
                backgroundColor: isHovered ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.6)'
              }}
              transition={{ duration: 0.2 }}
              whileHover={{ 
                scale: 1.3,
                rotate: 5
              }}
              whileTap={{ scale: 0.9 }}
            >
              <motion.svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-white"
                viewBox="0 0 20 20"
                fill="currentColor"
                animate={{ 
                  filter: isHovered ? 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.5))' : 'none'
                }}
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                  clipRule="evenodd"
                />
              </motion.svg>
            </motion.div>
          </motion.div>
        )}
        
        {/* 悬停时的元数据覆盖层 */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: isHovered ? 1 : 0,
            y: isHovered ? 0 : 20
          }}
          transition={{ 
            duration: 0.3,
            ease: "easeOut"
          }}
        >
          {media.metadata && (
            <motion.div 
              className="flex items-center text-white text-xs space-x-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ 
                opacity: isHovered ? 1 : 0,
                y: isHovered ? 0 : 10
              }}
              transition={{ 
                duration: 0.2,
                delay: isHovered ? 0.1 : 0
              }}
            >
              {media.metadata.width && media.metadata.height && (
                <motion.span
                  className="bg-black/30 backdrop-blur-sm px-2 py-1 rounded"
                  whileHover={{ scale: 1.05 }}
                >
                  {media.metadata.width} × {media.metadata.height}
                </motion.span>
              )}
              {media.metadata.format && (
                <motion.span 
                  className="bg-black/30 backdrop-blur-sm px-2 py-1 rounded uppercase"
                  whileHover={{ scale: 1.05 }}
                >
                  {media.metadata.format}
                </motion.span>
              )}
              {media.type === 'video' && media.metadata.duration && (
                <motion.span 
                  className="bg-black/30 backdrop-blur-sm px-2 py-1 rounded"
                  whileHover={{ scale: 1.05 }}
                >
                  {Math.floor(media.metadata.duration / 60)}:{(media.metadata.duration % 60).toString().padStart(2, '0')}
                </motion.span>
              )}
            </motion.div>
          )}
        </motion.div>
      </div>
      
      {/* 卡片内容区域 */}
      <motion.div 
        className="p-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ 
          opacity: imageLoaded ? 1 : 0,
          y: imageLoaded ? 0 : 10
        }}
        transition={{ 
          duration: 0.4,
          delay: 0.3
        }}
      >
        <motion.h3 
          className="text-sm font-medium text-gray-900 dark:text-white truncate"
          whileHover={{ color: '#3B82F6' }}
          transition={{ duration: 0.2 }}
        >
          {media.title}
        </motion.h3>
        {media.description && (
          <motion.p 
            className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            {media.description}
          </motion.p>
        )}
        <motion.div 
          className="mt-2 flex flex-wrap gap-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          {media.tags.slice(0, 3).map((tag, index) => (
            <motion.span
              key={tag}
              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                duration: 0.2, 
                delay: 0.5 + index * 0.05 
              }}
              whileHover={{ 
                scale: 1.05,
                backgroundColor: '#3B82F6',
                color: '#FFFFFF'
              }}
            >
              {tag}
            </motion.span>
          ))}
          {media.tags.length > 3 && (
            <motion.span 
              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                duration: 0.2, 
                delay: 0.65 
              }}
              whileHover={{ scale: 1.05 }}
            >
              +{media.tags.length - 3}
            </motion.span>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};