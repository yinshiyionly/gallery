import React, { ComponentType, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useLazyComponent } from '@/hooks/useLazyComponent';

interface LazyWrapperProps {
  importFn: () => Promise<{ default: ComponentType<any> }>;
  componentName: string;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
  threshold?: number;
  rootMargin?: string;
  preload?: boolean;
  className?: string;
  children?: React.ReactNode;
  [key: string]: any;
}

/**
 * 懒加载包装组件
 * 提供统一的懒加载体验和错误处理
 */
export const LazyWrapper: React.FC<LazyWrapperProps> = ({
  importFn,
  componentName,
  fallback,
  errorFallback,
  threshold = 0.1,
  rootMargin = '50px',
  preload = false,
  className = '',
  children,
  ...props
}) => {
  const { Component, isLoading, error, ref } = useLazyComponent(
    importFn,
    componentName,
    {
      threshold,
      rootMargin,
      preload
    }
  );

  // 默认加载状态
  const defaultFallback = (
    <motion.div
      className={`flex items-center justify-center p-8 ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="flex flex-col items-center space-y-3">
        <motion.div
          className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        <p className="text-sm text-gray-600 dark:text-gray-400">
          正在加载 {componentName}...
        </p>
      </div>
    </motion.div>
  );

  // 默认错误状态
  const defaultErrorFallback = (
    <motion.div
      className={`flex items-center justify-center p-8 ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="text-center">
        <div className="text-red-500 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          组件加载失败
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {componentName} 无法正常加载
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
        >
          刷新页面
        </button>
      </div>
    </motion.div>
  );

  // 如果有错误，显示错误状态
  if (error) {
    return <>{errorFallback || defaultErrorFallback}</>;
  }

  // 如果正在加载，显示加载状态
  if (isLoading || !Component) {
    return (
      <div ref={ref} className={className}>
        {fallback || defaultFallback}
      </div>
    );
  }

  // 渲染实际组件
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Suspense fallback={fallback || defaultFallback}>
        <Component {...props}>
          {children}
        </Component>
      </Suspense>
    </motion.div>
  );
};

/**
 * 创建懒加载组件的高阶组件
 */
export const withLazyLoading = <P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  componentName: string,
  options: {
    fallback?: React.ReactNode;
    errorFallback?: React.ReactNode;
    threshold?: number;
    rootMargin?: string;
    preload?: boolean;
  } = {}
) => {
  return (props: P) => (
    <LazyWrapper
      importFn={importFn}
      componentName={componentName}
      {...options}
      {...props}
    />
  );
};

/**
 * 条件懒加载组件
 * 根据条件决定是否启用懒加载
 */
export const ConditionalLazyWrapper: React.FC<LazyWrapperProps & {
  condition: boolean;
}> = ({ condition, ...props }) => {
  if (!condition) {
    // 如果条件不满足，直接渲染组件（不懒加载）
    return <LazyWrapper {...props} preload={true} />;
  }

  return <LazyWrapper {...props} />;
};

/**
 * 批量懒加载组件
 */
interface BatchLazyWrapperProps {
  components: Array<{
    importFn: () => Promise<{ default: ComponentType<any> }>;
    name: string;
    props?: any;
  }>;
  fallback?: React.ReactNode;
  className?: string;
  concurrent?: number;
  delay?: number;
}

export const BatchLazyWrapper: React.FC<BatchLazyWrapperProps> = ({
  components,
  fallback,
  className = '',
  concurrent = 3,
  delay = 100
}) => {
  const [loadedComponents, setLoadedComponents] = React.useState<Map<string, ComponentType<any>>>(new Map());
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const loadComponents = async () => {
      const chunks = [];
      for (let i = 0; i < components.length; i += concurrent) {
        chunks.push(components.slice(i, i + concurrent));
      }

      for (const chunk of chunks) {
        const promises = chunk.map(async ({ importFn, name }) => {
          try {
            const module = await importFn();
            return { name, component: module.default };
          } catch (error) {
            console.warn(`Failed to load component ${name}:`, error);
            return null;
          }
        });

        const results = await Promise.all(promises);
        
        results.forEach((result) => {
          if (result) {
            setLoadedComponents(prev => new Map(prev).set(result.name, result.component));
          }
        });

        // 在批次之间添加延迟
        if (delay > 0 && chunks.indexOf(chunk) < chunks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }

      setIsLoading(false);
    };

    loadComponents();
  }, [components, concurrent, delay]);

  if (isLoading) {
    return (
      <div className={className}>
        {fallback || (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={className}>
      {components.map(({ name, props = {} }) => {
        const Component = loadedComponents.get(name);
        if (!Component) return null;

        return (
          <motion.div
            key={name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Component {...props} />
          </motion.div>
        );
      })}
    </div>
  );
};