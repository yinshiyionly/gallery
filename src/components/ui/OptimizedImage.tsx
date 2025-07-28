import React, { useState, useRef, forwardRef } from 'react';
import Image, { ImageProps } from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useLazyImage } from '@/hooks/useLazyImage';
import {
  generateResponsiveSizes,
  generateBlurDataURL,
  generateOptimizedImageUrl,
  getSupportedImageFormat,
  adjustSizeForDPR
} from '@/lib/utils/imageUtils';

interface OptimizedImageProps extends Omit<ImageProps, 'src' | 'alt'> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  aspectRatio?: number;
  lazy?: boolean;
  showPlaceholder?: boolean;
  placeholderColor?: string;
  fallbackSrc?: string;
  optimizationOptions?: {
    quality?: number;
    format?: 'auto' | 'webp' | 'avif' | 'jpeg' | 'png';
    blur?: boolean;
  };
  onLoadComplete?: () => void;
  onError?: (error: Error) => void;
  className?: string;
}

/**
 * 优化的图片组件
 * 支持懒加载、自适应格式、响应式尺寸、占位符等功能
 */
export const OptimizedImage = forwardRef<HTMLDivElement, OptimizedImageProps>(
  ({
    src,
    alt,
    width,
    height,
    aspectRatio,
    lazy = true,
    showPlaceholder = true,
    placeholderColor = '#f3f4f6',
    fallbackSrc,
    optimizationOptions = {},
    onLoadComplete,
    onError,
    className = '',
    priority = false,
    sizes,
    quality = 80,
    ...props
  }, ref) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // 使用懒加载Hook
    const { ref: lazyRef, isLoaded: lazyLoaded, error: lazyError } = useLazyImage(
      src,
      {
        preload: priority || !lazy,
        fallbackSrc,
        onLoad: () => {
          setImageLoaded(true);
          onLoadComplete?.();
        },
        onError: (error) => {
          setImageError(true);
          onError?.(error);
        }
      }
    );

    // 合并refs
    const combinedRef = (element: HTMLDivElement) => {
      if (ref) {
        if (typeof ref === 'function') {
          ref(element);
        } else {
          ref.current = element;
        }
      }
      containerRef.current = element;
      lazyRef.current = element;
    };

    // 生成优化的图片URL
    const optimizedSrc = generateOptimizedImageUrl(src, {
      width: width ? adjustSizeForDPR(width) : undefined,
      height: height ? adjustSizeForDPR(height) : undefined,
      quality: optimizationOptions.quality || quality,
      format: optimizationOptions.format === 'auto' 
        ? getSupportedImageFormat() 
        : optimizationOptions.format,
      blur: optimizationOptions.blur
    });

    // 生成响应式sizes
    const responsiveSizes = sizes || generateResponsiveSizes(width || 400);

    // 生成模糊占位符
    const blurDataURL = generateBlurDataURL();

    // 计算容器样式
    const containerStyle: React.CSSProperties = {
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: placeholderColor,
      ...(aspectRatio && {
        aspectRatio: aspectRatio.toString()
      }),
      ...(width && height && {
        width,
        height
      })
    };

    // 如果懒加载且未进入视口，显示占位符
    if (lazy && !lazyLoaded && showPlaceholder) {
      return (
        <div
          ref={combinedRef}
          className={`${className} flex items-center justify-center`}
          style={containerStyle}
        >
          <motion.div
            className="w-full h-full flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {/* 加载骨架屏 */}
            <motion.div
              className="w-full h-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200"
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'linear'
              }}
              style={{
                backgroundSize: '200% 100%'
              }}
            />
          </motion.div>
        </div>
      );
    }

    return (
      <div
        ref={combinedRef}
        className={`${className} relative`}
        style={containerStyle}
      >
        <AnimatePresence mode="wait">
          {/* 占位符动画 */}
          {!imageLoaded && showPlaceholder && (
            <motion.div
              key="placeholder"
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200"
                animate={{
                  background: [
                    'linear-gradient(45deg, #f3f4f6, #e5e7eb)',
                    'linear-gradient(45deg, #e5e7eb, #f3f4f6)',
                    'linear-gradient(45deg, #f3f4f6, #e5e7eb)'
                  ]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />
              
              {/* 加载图标 */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.6 }}
                transition={{ duration: 0.5 }}
              >
                <motion.svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'linear'
                  }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </motion.svg>
              </motion.div>
            </motion.div>
          )}

          {/* 错误状态 */}
          {(imageError || lazyError) && (
            <motion.div
              key="error"
              className="absolute inset-0 flex items-center justify-center bg-gray-100"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center text-gray-500">
                <svg
                  className="w-12 h-12 mx-auto mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
                <p className="text-sm">图片加载失败</p>
              </div>
            </motion.div>
          )}

          {/* 实际图片 */}
          {(lazy ? lazyLoaded : true) && !imageError && !lazyError && (
            <motion.div
              key="image"
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: imageLoaded ? 1 : 0, scale: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <Image
                src={optimizedSrc}
                alt={alt}
                fill
                sizes={responsiveSizes}
                quality={quality}
                priority={priority}
                placeholder="blur"
                blurDataURL={blurDataURL}
                onLoad={() => {
                  setImageLoaded(true);
                  onLoadComplete?.();
                }}
                onError={() => {
                  setImageError(true);
                  onError?.(new Error('Image failed to load'));
                }}
                style={{
                  objectFit: 'cover',
                  objectPosition: 'center'
                }}
                {...props}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

OptimizedImage.displayName = 'OptimizedImage';