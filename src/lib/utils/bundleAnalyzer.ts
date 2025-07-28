/**
 * Bundle 分析和优化工具
 * 用于监控和优化代码分割效果
 */

interface BundleInfo {
  name: string;
  size: number;
  gzipSize?: number;
  loadTime?: number;
  cached: boolean;
}

interface PerformanceMetrics {
  totalBundleSize: number;
  loadedBundles: BundleInfo[];
  pendingBundles: string[];
  cacheHitRate: number;
  averageLoadTime: number;
}

class BundleAnalyzer {
  private loadedBundles = new Map<string, BundleInfo>();
  private loadTimes = new Map<string, number>();
  private observers: Array<(metrics: PerformanceMetrics) => void> = [];

  /**
   * 记录 bundle 加载开始
   */
  startBundleLoad(bundleName: string): void {
    this.loadTimes.set(bundleName, performance.now());
  }

  /**
   * 记录 bundle 加载完成
   */
  endBundleLoad(bundleName: string, size?: number): void {
    const startTime = this.loadTimes.get(bundleName);
    const loadTime = startTime ? performance.now() - startTime : 0;
    
    const bundleInfo: BundleInfo = {
      name: bundleName,
      size: size || 0,
      loadTime,
      cached: this.isBundleCached(bundleName)
    };

    this.loadedBundles.set(bundleName, bundleInfo);
    this.loadTimes.delete(bundleName);
    
    this.notifyObservers();
  }

  /**
   * 检查 bundle 是否被缓存
   */
  private isBundleCached(bundleName: string): boolean {
    // 检查浏览器缓存
    if (typeof window !== 'undefined' && 'caches' in window) {
      // 这里可以实现更复杂的缓存检查逻辑
      return false;
    }
    return false;
  }

  /**
   * 获取性能指标
   */
  getMetrics(): PerformanceMetrics {
    const loadedBundles = Array.from(this.loadedBundles.values());
    const pendingBundles = Array.from(this.loadTimes.keys());
    
    const totalBundleSize = loadedBundles.reduce((sum, bundle) => sum + bundle.size, 0);
    const cachedBundles = loadedBundles.filter(bundle => bundle.cached);
    const cacheHitRate = loadedBundles.length > 0 ? cachedBundles.length / loadedBundles.length : 0;
    
    const loadTimesArray = loadedBundles
      .map(bundle => bundle.loadTime || 0)
      .filter(time => time > 0);
    const averageLoadTime = loadTimesArray.length > 0 
      ? loadTimesArray.reduce((sum, time) => sum + time, 0) / loadTimesArray.length 
      : 0;

    return {
      totalBundleSize,
      loadedBundles,
      pendingBundles,
      cacheHitRate,
      averageLoadTime
    };
  }

  /**
   * 添加性能监控观察者
   */
  addObserver(callback: (metrics: PerformanceMetrics) => void): () => void {
    this.observers.push(callback);
    
    return () => {
      const index = this.observers.indexOf(callback);
      if (index > -1) {
        this.observers.splice(index, 1);
      }
    };
  }

  /**
   * 通知所有观察者
   */
  private notifyObservers(): void {
    const metrics = this.getMetrics();
    this.observers.forEach(callback => callback(metrics));
  }

  /**
   * 分析 bundle 大小
   */
  analyzeBundleSizes(): {
    largest: BundleInfo[];
    smallest: BundleInfo[];
    recommendations: string[];
  } {
    const bundles = Array.from(this.loadedBundles.values());
    const sorted = bundles.sort((a, b) => b.size - a.size);
    
    const largest = sorted.slice(0, 5);
    const smallest = sorted.slice(-5).reverse();
    
    const recommendations: string[] = [];
    
    // 分析建议
    if (largest.length > 0 && largest[0].size > 500000) { // 500KB
      recommendations.push(`最大的 bundle "${largest[0].name}" 超过 500KB，考虑进一步分割`);
    }
    
    const totalSize = bundles.reduce((sum, bundle) => sum + bundle.size, 0);
    if (totalSize > 2000000) { // 2MB
      recommendations.push('总 bundle 大小超过 2MB，建议启用更积极的代码分割');
    }
    
    const slowBundles = bundles.filter(bundle => (bundle.loadTime || 0) > 1000);
    if (slowBundles.length > 0) {
      recommendations.push(`${slowBundles.length} 个 bundle 加载时间超过 1 秒，检查网络或优化 bundle 大小`);
    }

    return { largest, smallest, recommendations };
  }

  /**
   * 生成性能报告
   */
  generateReport(): string {
    const metrics = this.getMetrics();
    const analysis = this.analyzeBundleSizes();
    
    let report = '=== Bundle 性能报告 ===\n\n';
    
    report += `总 Bundle 数量: ${metrics.loadedBundles.length}\n`;
    report += `总大小: ${(metrics.totalBundleSize / 1024).toFixed(2)} KB\n`;
    report += `缓存命中率: ${(metrics.cacheHitRate * 100).toFixed(1)}%\n`;
    report += `平均加载时间: ${metrics.averageLoadTime.toFixed(2)} ms\n\n`;
    
    if (analysis.largest.length > 0) {
      report += '最大的 Bundles:\n';
      analysis.largest.forEach((bundle, index) => {
        report += `${index + 1}. ${bundle.name}: ${(bundle.size / 1024).toFixed(2)} KB`;
        if (bundle.loadTime) {
          report += ` (${bundle.loadTime.toFixed(2)} ms)`;
        }
        report += '\n';
      });
      report += '\n';
    }
    
    if (analysis.recommendations.length > 0) {
      report += '优化建议:\n';
      analysis.recommendations.forEach((rec, index) => {
        report += `${index + 1}. ${rec}\n`;
      });
    }
    
    return report;
  }

  /**
   * 清除所有数据
   */
  clear(): void {
    this.loadedBundles.clear();
    this.loadTimes.clear();
  }
}

// 创建全局实例
export const bundleAnalyzer = new BundleAnalyzer();

/**
 * 装饰器函数，用于自动跟踪动态导入
 */
export const trackDynamicImport = <T>(
  importFn: () => Promise<T>,
  bundleName: string
): (() => Promise<T>) => {
  return async () => {
    bundleAnalyzer.startBundleLoad(bundleName);
    
    try {
      const result = await importFn();
      bundleAnalyzer.endBundleLoad(bundleName);
      return result;
    } catch (error) {
      bundleAnalyzer.endBundleLoad(bundleName);
      throw error;
    }
  };
};

/**
 * 监控 Next.js 动态导入
 */
export const monitorNextDynamicImports = () => {
  if (typeof window === 'undefined') return;

  // 监控 webpack chunk 加载
  const originalJsonpCallback = (window as any).__webpack_require__?.cache;
  
  if (originalJsonpCallback) {
    // 这里可以添加更复杂的 webpack chunk 监控逻辑
    console.log('Bundle analyzer: Monitoring webpack chunks');
  }

  // 监控 Performance API
  if ('performance' in window && 'getEntriesByType' in performance) {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.name.includes('chunk') || entry.name.includes('_next')) {
          const bundleName = entry.name.split('/').pop() || entry.name;
          bundleAnalyzer.endBundleLoad(bundleName, entry.transferSize);
        }
      });
    });

    observer.observe({ entryTypes: ['resource'] });
  }
};

/**
 * 开发环境下的 bundle 分析工具
 */
export const devBundleAnalyzer = {
  /**
   * 在控制台输出性能报告
   */
  logReport(): void {
    if (process.env.NODE_ENV === 'development') {
      console.log(bundleAnalyzer.generateReport());
    }
  },

  /**
   * 在页面上显示性能指标
   */
  showMetrics(): void {
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
      const metrics = bundleAnalyzer.getMetrics();
      
      // 创建或更新性能指标显示
      let metricsDiv = document.getElementById('bundle-metrics');
      if (!metricsDiv) {
        metricsDiv = document.createElement('div');
        metricsDiv.id = 'bundle-metrics';
        metricsDiv.style.cssText = `
          position: fixed;
          top: 10px;
          right: 10px;
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 10px;
          border-radius: 5px;
          font-family: monospace;
          font-size: 12px;
          z-index: 10000;
          max-width: 300px;
        `;
        document.body.appendChild(metricsDiv);
      }
      
      metricsDiv.innerHTML = `
        <div><strong>Bundle Metrics</strong></div>
        <div>Loaded: ${metrics.loadedBundles.length}</div>
        <div>Size: ${(metrics.totalBundleSize / 1024).toFixed(2)} KB</div>
        <div>Cache Hit: ${(metrics.cacheHitRate * 100).toFixed(1)}%</div>
        <div>Avg Load: ${metrics.averageLoadTime.toFixed(2)} ms</div>
      `;
    }
  },

  /**
   * 启动实时监控
   */
  startRealTimeMonitoring(): () => void {
    if (process.env.NODE_ENV !== 'development') {
      return () => {};
    }

    const unsubscribe = bundleAnalyzer.addObserver(() => {
      this.showMetrics();
    });

    monitorNextDynamicImports();
    
    return unsubscribe;
  }
};