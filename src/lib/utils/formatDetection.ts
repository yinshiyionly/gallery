/**
 * 图片格式检测和支持性检查工具
 */

interface FormatSupport {
  webp: boolean;
  avif: boolean;
  heic: boolean;
  jxl: boolean;
}

class FormatDetector {
  private supportCache: FormatSupport | null = null;
  private detectionPromises: Map<string, Promise<boolean>> = new Map();

  /**
   * 检测浏览器支持的图片格式
   */
  async detectSupport(): Promise<FormatSupport> {
    if (this.supportCache) {
      return this.supportCache;
    }

    const [webp, avif, heic, jxl] = await Promise.all([
      this.checkFormat('webp'),
      this.checkFormat('avif'),
      this.checkFormat('heic'),
      this.checkFormat('jxl')
    ]);

    this.supportCache = { webp, avif, heic, jxl };
    return this.supportCache;
  }

  /**
   * 检测特定格式支持
   */
  private async checkFormat(format: string): Promise<boolean> {
    if (typeof window === 'undefined') {
      // 服务端渲染时的默认支持
      return format === 'webp' || format === 'avif';
    }

    if (this.detectionPromises.has(format)) {
      return this.detectionPromises.get(format)!;
    }

    const promise = this.performFormatCheck(format);
    this.detectionPromises.set(format, promise);
    return promise;
  }

  /**
   * 执行格式检测
   */
  private performFormatCheck(format: string): Promise<boolean> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(false);
        return;
      }

      // 绘制一个像素
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, 1, 1);

      try {
        const dataUrl = canvas.toDataURL(`image/${format}`);
        resolve(dataUrl.indexOf(`data:image/${format}`) === 0);
      } catch {
        resolve(false);
      }
    });
  }

  /**
   * 获取最佳支持的格式
   */
  async getBestFormat(): Promise<'avif' | 'webp' | 'jpeg'> {
    const support = await this.detectSupport();
    
    if (support.avif) return 'avif';
    if (support.webp) return 'webp';
    return 'jpeg';
  }

  /**
   * 检查是否支持现代格式
   */
  async supportsModernFormats(): Promise<boolean> {
    const support = await this.detectSupport();
    return support.webp || support.avif;
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.supportCache = null;
    this.detectionPromises.clear();
  }
}

// 创建全局实例
export const formatDetector = new FormatDetector();

/**
 * 图片URL格式转换器
 */
export class ImageUrlConverter {
  /**
   * 转换Cloudinary URL到指定格式
   */
  static convertCloudinaryFormat(url: string, format: string): string {
    if (!url.includes('cloudinary.com')) {
      return url;
    }

    // 解析Cloudinary URL
    const parts = url.split('/upload/');
    if (parts.length !== 2) {
      return url;
    }

    const [baseUrl, imagePath] = parts;
    const transformations = [`f_${format}`, 'q_auto'];

    return `${baseUrl}/upload/${transformations.join(',')}/${imagePath}`;
  }

  /**
   * 为URL添加格式后缀（适用于支持多格式的CDN）
   */
  static addFormatSuffix(url: string, format: string): string {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    
    // 检查是否已经有格式参数
    if (urlObj.searchParams.has('format')) {
      urlObj.searchParams.set('format', format);
    } else {
      // 添加格式参数
      urlObj.searchParams.append('format', format);
    }

    return urlObj.toString();
  }

  /**
   * 智能格式转换
   */
  static async convertToOptimalFormat(url: string): Promise<string> {
    const bestFormat = await formatDetector.getBestFormat();
    
    if (url.includes('cloudinary.com')) {
      return this.convertCloudinaryFormat(url, bestFormat);
    }
    
    // 对于其他CDN，尝试添加格式参数
    return this.addFormatSuffix(url, bestFormat);
  }
}

/**
 * 图片格式回退管理器
 */
export class FormatFallbackManager {
  private fallbackMap = new Map<string, string[]>();

  /**
   * 设置格式回退链
   */
  setFallbackChain(originalUrl: string, fallbackUrls: string[]): void {
    this.fallbackMap.set(originalUrl, fallbackUrls);
  }

  /**
   * 获取回退URL
   */
  getFallbackUrls(originalUrl: string): string[] {
    return this.fallbackMap.get(originalUrl) || [];
  }

  /**
   * 生成自动回退链
   */
  async generateFallbackChain(baseUrl: string): Promise<string[]> {
    const support = await formatDetector.detectSupport();
    const fallbacks: string[] = [];

    // 按优先级添加支持的格式
    if (support.avif) {
      fallbacks.push(ImageUrlConverter.convertCloudinaryFormat(baseUrl, 'avif'));
    }
    if (support.webp) {
      fallbacks.push(ImageUrlConverter.convertCloudinaryFormat(baseUrl, 'webp'));
    }
    
    // 总是添加JPEG作为最终回退
    fallbacks.push(ImageUrlConverter.convertCloudinaryFormat(baseUrl, 'jpg'));

    this.setFallbackChain(baseUrl, fallbacks);
    return fallbacks;
  }

  /**
   * 尝试加载图片，失败时使用回退
   */
  async loadWithFallback(originalUrl: string): Promise<string> {
    const fallbacks = this.getFallbackUrls(originalUrl);
    const urlsToTry = [originalUrl, ...fallbacks];

    for (const url of urlsToTry) {
      try {
        await this.testImageLoad(url);
        return url;
      } catch {
        continue;
      }
    }

    throw new Error('All image formats failed to load');
  }

  private testImageLoad(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = url;
    });
  }

  /**
   * 清除回退缓存
   */
  clear(): void {
    this.fallbackMap.clear();
  }
}

// 创建全局实例
export const fallbackManager = new FormatFallbackManager();

// 便捷函数
export const detectImageFormats = () => formatDetector.detectSupport();
export const getBestImageFormat = () => formatDetector.getBestFormat();
export const convertToOptimalFormat = (url: string) => ImageUrlConverter.convertToOptimalFormat(url);