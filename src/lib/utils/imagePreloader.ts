/**
 * 图片预加载管理器
 * 用于预加载关键图片，提升用户体验
 */

interface PreloadOptions {
  priority?: 'high' | 'medium' | 'low';
  timeout?: number;
  retries?: number;
}

interface PreloadTask {
  url: string;
  options: PreloadOptions;
  promise: Promise<void>;
  status: 'pending' | 'loaded' | 'error';
}

class ImagePreloader {
  private tasks = new Map<string, PreloadTask>();
  private loadedImages = new Set<string>();
  private maxConcurrent = 6; // 最大并发加载数
  private currentLoading = 0;
  private queue: PreloadTask[] = [];

  /**
   * 预加载单个图片
   */
  async preload(url: string, options: PreloadOptions = {}): Promise<void> {
    // 如果已经加载过，直接返回
    if (this.loadedImages.has(url)) {
      return Promise.resolve();
    }

    // 如果正在加载，返回现有的Promise
    if (this.tasks.has(url)) {
      return this.tasks.get(url)!.promise;
    }

    const task = this.createPreloadTask(url, options);
    this.tasks.set(url, task);

    // 如果当前加载数未达到上限，立即开始加载
    if (this.currentLoading < this.maxConcurrent) {
      this.executeTask(task);
    } else {
      // 否则加入队列
      this.addToQueue(task);
    }

    return task.promise;
  }

  /**
   * 批量预加载图片
   */
  async preloadBatch(
    urls: string[], 
    options: PreloadOptions = {}
  ): Promise<PromiseSettledResult<void>[]> {
    const promises = urls.map(url => this.preload(url, options));
    return Promise.allSettled(promises);
  }

  /**
   * 预加载关键图片（高优先级）
   */
  async preloadCritical(urls: string[]): Promise<void> {
    const criticalPromises = urls.map(url => 
      this.preload(url, { priority: 'high', timeout: 5000 })
    );
    
    try {
      await Promise.all(criticalPromises);
    } catch (error) {
      console.warn('Some critical images failed to preload:', error);
    }
  }

  /**
   * 预加载下一页的图片（低优先级）
   */
  preloadNext(urls: string[]): void {
    urls.forEach(url => {
      this.preload(url, { priority: 'low', timeout: 10000 }).catch(() => {
        // 静默处理错误，不影响用户体验
      });
    });
  }

  /**
   * 清除预加载缓存
   */
  clear(): void {
    this.tasks.clear();
    this.loadedImages.clear();
    this.queue = [];
    this.currentLoading = 0;
  }

  /**
   * 获取预加载统计信息
   */
  getStats() {
    const total = this.tasks.size;
    const loaded = Array.from(this.tasks.values()).filter(t => t.status === 'loaded').length;
    const error = Array.from(this.tasks.values()).filter(t => t.status === 'error').length;
    const pending = total - loaded - error;

    return {
      total,
      loaded,
      error,
      pending,
      loadedPercentage: total > 0 ? Math.round((loaded / total) * 100) : 0
    };
  }

  private createPreloadTask(url: string, options: PreloadOptions): PreloadTask {
    const { timeout = 8000, retries = 2 } = options;

    const promise = this.loadImageWithRetry(url, retries, timeout);
    
    return {
      url,
      options,
      promise,
      status: 'pending'
    };
  }

  private async loadImageWithRetry(
    url: string, 
    retries: number, 
    timeout: number
  ): Promise<void> {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        await this.loadSingleImage(url, timeout);
        this.loadedImages.add(url);
        this.updateTaskStatus(url, 'loaded');
        return;
      } catch (error) {
        if (attempt === retries) {
          this.updateTaskStatus(url, 'error');
          throw error;
        }
        // 等待一段时间后重试
        await this.delay(Math.pow(2, attempt) * 1000);
      }
    }
  }

  private loadSingleImage(url: string, timeout: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const timeoutId = setTimeout(() => {
        reject(new Error(`Image load timeout: ${url}`));
      }, timeout);

      img.onload = () => {
        clearTimeout(timeoutId);
        resolve();
      };

      img.onerror = () => {
        clearTimeout(timeoutId);
        reject(new Error(`Failed to load image: ${url}`));
      };

      img.src = url;
    });
  }

  private executeTask(task: PreloadTask): void {
    this.currentLoading++;
    
    task.promise
      .finally(() => {
        this.currentLoading--;
        this.processQueue();
      });
  }

  private addToQueue(task: PreloadTask): void {
    // 根据优先级插入队列
    const priority = task.options.priority || 'medium';
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    
    let insertIndex = this.queue.length;
    for (let i = 0; i < this.queue.length; i++) {
      const queuePriority = this.queue[i].options.priority || 'medium';
      if (priorityOrder[priority] < priorityOrder[queuePriority]) {
        insertIndex = i;
        break;
      }
    }
    
    this.queue.splice(insertIndex, 0, task);
  }

  private processQueue(): void {
    while (this.queue.length > 0 && this.currentLoading < this.maxConcurrent) {
      const task = this.queue.shift()!;
      this.executeTask(task);
    }
  }

  private updateTaskStatus(url: string, status: 'loaded' | 'error'): void {
    const task = this.tasks.get(url);
    if (task) {
      task.status = status;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 创建全局实例
export const imagePreloader = new ImagePreloader();

// 导出类型和工具函数
export type { PreloadOptions };

/**
 * 预加载关键图片的便捷函数
 */
export const preloadCriticalImages = (urls: string[]): Promise<void> => {
  return imagePreloader.preloadCritical(urls);
};

/**
 * 预加载下一页图片的便捷函数
 */
export const preloadNextPageImages = (urls: string[]): void => {
  imagePreloader.preloadNext(urls);
};

/**
 * 获取预加载统计信息
 */
export const getPreloadStats = () => {
  return imagePreloader.getStats();
};