import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';

interface ProgressiveImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
  className?: string;
  placeholder?: string;
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
  quality?: number;
}

export const ProgressiveImage: React.FC<ProgressiveImageProps> = ({
  src,
  alt,
  width,
  height,
  fill = false,
  sizes,
  priority = false,
  className = '',
  placeholder = 'blur',
  blurDataURL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFeAJcI9oYGgAAAABJRU5ErkJggg==",
  onLoad,
  onError,
  quality = 75,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "100px" });

  const handleLoad = () => {
    setIsLoading(false);
    setImageLoaded(true);
    if (onLoad) onLoad();
  };

  const handleError = () => {
    setIsLoading(false);
    setIsError(true);
    if (onError) onError();
  };

  // 生成低质量占位图URL
  const getLowQualityPlaceholder = (originalSrc: string) => {
    if (originalSrc.includes('?')) {
      return `${originalSrc}&q=10&w=50`;
    }
    return `${originalSrc}?q=10&w=50`;
  };

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      {/* 加载状态 */}
      {isLoading && (
        <motion.div
          className="absolute inset-0 bg-gray-200 dark:bg-gray-700"
          initial={{ opacity: 1 }}
          animate={{ opacity: isLoading ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* 脉冲动画 */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </motion.div>
      )}

      {/* 错误状态 */}
      {isError && (
        <motion.div
          className="absolute inset-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="text-center text-gray-400">
            <svg
              className="mx-auto h-12 w-12 mb-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-xs">加载失败</p>
          </div>
        </motion.div>
      )}

      {/* 主图片 */}
      {isInView && !isError && (
        <motion.div
          className="relative w-full h-full"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{
            opacity: imageLoaded ? 1 : 0,
            scale: imageLoaded ? 1 : 1.05,
          }}
          transition={{
            duration: 0.6,
            ease: 'easeOut',
          }}
        >
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            fill={fill}
            sizes={sizes}
            priority={priority}
            quality={quality}
            placeholder={placeholder}
            blurDataURL={blurDataURL}
            className="object-cover"
            onLoad={handleLoad}
            onError={handleError}
            loading={priority ? 'eager' : 'lazy'}
          />
        </motion.div>
      )}

      {/* 渐进式加载效果 */}
      {isInView && !isError && !imageLoaded && (
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ duration: 0.3 }}
        >
          <Image
            src={getLowQualityPlaceholder(src)}
            alt={alt}
            width={width}
            height={height}
            fill={fill}
            className="object-cover filter blur-sm"
            quality={10}
          />
        </motion.div>
      )}
    </div>
  );
};

// 带有淡入效果的图片组件
export const FadeInImage: React.FC<ProgressiveImageProps & {
  delay?: number;
}> = ({ delay = 0, ...props }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleLoad = () => {
    setImageLoaded(true);
    if (props.onLoad) props.onLoad();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: imageLoaded ? 1 : 0, y: imageLoaded ? 0 : 20 }}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
    >
      <ProgressiveImage {...props} onLoad={handleLoad} />
    </motion.div>
  );
};

// 带有缩放效果的图片组件
export const ScaleInImage: React.FC<ProgressiveImageProps & {
  delay?: number;
}> = ({ delay = 0, ...props }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleLoad = () => {
    setImageLoaded(true);
    if (props.onLoad) props.onLoad();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: imageLoaded ? 1 : 0, 
        scale: imageLoaded ? 1 : 0.8 
      }}
      transition={{ 
        duration: 0.6, 
        delay, 
        ease: 'easeOut',
        type: 'spring',
        stiffness: 100
      }}
    >
      <ProgressiveImage {...props} onLoad={handleLoad} />
    </motion.div>
  );
};