/**
 * 图片优化和处理工具函数
 * 支持自适应尺寸、格式转换、懒加载等功能
 */

export interface ImageDimensions {
  width: number;
  height: number;
}

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
  blur?: boolean;
  priority?: boolean;
}

/**
 * 生成响应式图片尺寸配置
 */
export const generateResponsiveSizes = (baseWidth: number = 400): string => {
  return [
    `(max-width: 640px) ${Math.min(baseWidth, 640)}px`,
    `(max-width: 768px) ${Math.min(baseWidth * 1.2, 768)}px`,
    `(max-width: 1024px) ${Math.min(baseWidth * 1.5, 1024)}px`,
    `(max-width: 1280px) ${Math.min(baseWidth * 2, 1280)}px`,
    `${baseWidth * 2.5}px`
  ].join(', ');
};

/**
 * 生成模糊占位符数据URL
 */
export const generateBlurDataURL = (width: number = 10, height: number = 10): string => {
  const canvas = typeof window !== 'undefined' ? document.createElement('canvas') : null;
  if (!canvas) {
    // 服务端渲染时返回默认模糊图片
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFeAJcI9oYGgAAAABJRU5ErkJggg==';
  }
  
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    // 创建渐变背景
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#f3f4f6');
    gradient.addColorStop(1, '#e5e7eb');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }
  
  return canvas.toDataURL();
};

/**
 * 检测浏览器支持的图片格式
 */
export const getSupportedImageFormat = (): 'avif' | 'webp' | 'jpeg' => {
  if (typeof window === 'undefined') return 'webp'; // 服务端默认
  
  // 检测 AVIF 支持
  const avifCanvas = document.createElement('canvas');
  avifCanvas.width = 1;
  avifCanvas.height = 1;
  const avifSupported = avifCanvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
  
  if (avifSupported) return 'avif';
  
  // 检测 WebP 支持
  const webpCanvas = document.createElement('canvas');
  webpCanvas.width = 1;
  webpCanvas.height = 1;
  const webpSupported = webpCanvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  
  return webpSupported ? 'webp' : 'jpeg';
};

/**
 * 计算图片的宽高比
 */
export const calculateAspectRatio = (width: number, height: number): number => {
  return width / height;
};

/**
 * 根据容器尺寸计算图片显示尺寸
 */
export const calculateDisplaySize = (
  originalWidth: number,
  originalHeight: number,
  containerWidth: number,
  containerHeight?: number
): ImageDimensions => {
  const aspectRatio = calculateAspectRatio(originalWidth, originalHeight);
  
  if (containerHeight) {
    // 如果指定了容器高度，选择较小的缩放比例
    const widthScale = containerWidth / originalWidth;
    const heightScale = containerHeight / originalHeight;
    const scale = Math.min(widthScale, heightScale);
    
    return {
      width: Math.round(originalWidth * scale),
      height: Math.round(originalHeight * scale)
    };
  }
  
  // 只指定宽度时，按比例计算高度
  return {
    width: containerWidth,
    height: Math.round(containerWidth / aspectRatio)
  };
};

/**
 * 生成优化的图片URL（适用于Cloudinary等CDN）
 */
export const generateOptimizedImageUrl = (
  originalUrl: string,
  options: ImageOptimizationOptions = {}
): string => {
  const {
    width,
    height,
    quality = 80,
    format,
    blur = false
  } = options;
  
  // 如果是Cloudinary URL，添加变换参数
  if (originalUrl.includes('cloudinary.com')) {
    const baseUrl = originalUrl.split('/upload/')[0] + '/upload/';
    const imagePath = originalUrl.split('/upload/')[1];
    
    const transformations = [];
    
    if (width) transformations.push(`w_${width}`);
    if (height) transformations.push(`h_${height}`);
    if (quality !== 80) transformations.push(`q_${quality}`);
    if (format) transformations.push(`f_${format}`);
    if (blur) transformations.push('e_blur:300');
    
    // 添加自动优化
    transformations.push('f_auto', 'q_auto');
    
    return `${baseUrl}${transformations.join(',')}/${imagePath}`;
  }
  
  // 对于其他URL，返回原始URL（可以根据需要扩展）
  return originalUrl;
};

/**
 * 预加载图片
 */
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
};

/**
 * 批量预加载图片
 */
export const preloadImages = async (urls: string[]): Promise<void> => {
  try {
    await Promise.all(urls.map(url => preloadImage(url)));
  } catch (error) {
    console.warn('Some images failed to preload:', error);
  }
};

/**
 * 检测图片是否在视口中
 */
export const isImageInViewport = (element: HTMLElement, threshold: number = 0): boolean => {
  const rect = element.getBoundingClientRect();
  const windowHeight = window.innerHeight || document.documentElement.clientHeight;
  const windowWidth = window.innerWidth || document.documentElement.clientWidth;
  
  return (
    rect.top >= -threshold &&
    rect.left >= -threshold &&
    rect.bottom <= windowHeight + threshold &&
    rect.right <= windowWidth + threshold
  );
};

/**
 * 创建Intersection Observer用于懒加载
 */
export const createLazyLoadObserver = (
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {}
): IntersectionObserver => {
  const defaultOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options
  };
  
  return new IntersectionObserver(callback, defaultOptions);
};

/**
 * 获取设备像素比
 */
export const getDevicePixelRatio = (): number => {
  return typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
};

/**
 * 根据设备像素比调整图片尺寸
 */
export const adjustSizeForDPR = (size: number): number => {
  const dpr = getDevicePixelRatio();
  return Math.round(size * Math.min(dpr, 2)); // 限制最大2倍，避免过大
};

/**
 * 生成srcSet字符串
 */
export const generateSrcSet = (
  baseUrl: string,
  sizes: number[],
  options: ImageOptimizationOptions = {}
): string => {
  return sizes
    .map(size => {
      const optimizedUrl = generateOptimizedImageUrl(baseUrl, {
        ...options,
        width: size
      });
      return `${optimizedUrl} ${size}w`;
    })
    .join(', ');
};