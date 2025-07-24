import React, { useState } from 'react';
import { Loading } from './Loading';
import { MediaSkeleton } from './MediaSkeleton';
import { ErrorMessage } from './ErrorMessage';
import { EmptyState } from './EmptyState';
import { SearchEmptyState } from './SearchEmptyState';
import { ErrorBoundary } from './ErrorBoundary';
import { Button } from './Button';

/**
 * 加载和错误状态组件演示
 * 展示各种加载、错误和空状态组件
 */
export const LoadingErrorStatesDemo: React.FC = () => {
  const [showError, setShowError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 模拟加载
  const handleLoadingDemo = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  // 故意触发错误边界
  const ErrorThrower = () => {
    throw new Error('这是一个测试错误');
  };

  return (
    <div className="space-y-8 p-4">
      <h2 className="text-2xl font-bold mb-4">加载和错误状态组件</h2>

      {/* 加载动画演示 */}
      <section className="border rounded-lg p-6 space-y-4">
        <h3 className="text-xl font-semibold">加载动画</h3>
        <div className="flex flex-wrap gap-8">
          <div className="flex flex-col items-center">
            <p className="mb-2">小尺寸</p>
            <Loading size="sm" />
          </div>
          <div className="flex flex-col items-center">
            <p className="mb-2">中尺寸</p>
            <Loading size="md" />
          </div>
          <div className="flex flex-col items-center">
            <p className="mb-2">大尺寸</p>
            <Loading size="lg" />
          </div>
          <div className="flex flex-col items-center">
            <p className="mb-2">带文本</p>
            <Loading size="md" text="加载中..." />
          </div>
        </div>
        <div className="mt-4">
          <Button onClick={handleLoadingDemo}>
            {isLoading ? '加载中...' : '显示全屏加载'}
          </Button>
          {isLoading && <Loading fullScreen text="加载中，请稍候..." />}
        </div>
      </section>

      {/* 骨架屏演示 */}
      <section className="border rounded-lg p-6 space-y-4">
        <h3 className="text-xl font-semibold">骨架屏</h3>
        <div className="w-full">
          <MediaSkeleton count={3} />
        </div>
      </section>

      {/* 错误消息演示 */}
      <section className="border rounded-lg p-6 space-y-4">
        <h3 className="text-xl font-semibold">错误消息</h3>
        <ErrorMessage 
          title="加载失败" 
          message="无法加载媒体内容，请检查您的网络连接并重试。" 
          retry={() => alert('重试加载')} 
        />
      </section>

      {/* 错误边界演示 */}
      <section className="border rounded-lg p-6 space-y-4">
        <h3 className="text-xl font-semibold">错误边界</h3>
        <p className="mb-4">点击按钮触发错误，将被错误边界捕获</p>
        <ErrorBoundary>
          {showError ? <ErrorThrower /> : (
            <Button onClick={() => setShowError(true)} variant="outline">
              触发错误
            </Button>
          )}
        </ErrorBoundary>
      </section>

      {/* 空状态演示 */}
      <section className="border rounded-lg p-6 space-y-4">
        <h3 className="text-xl font-semibold">空状态</h3>
        <EmptyState 
          title="暂无媒体内容" 
          message="当前没有可显示的媒体内容，请稍后再试。" 
          action={{ label: '刷新', onClick: () => alert('刷新内容') }} 
        />
      </section>

      {/* 搜索空状态演示 */}
      <section className="border rounded-lg p-6 space-y-4">
        <h3 className="text-xl font-semibold">搜索空状态</h3>
        <div className="mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="输入搜索词..."
            className="px-4 py-2 border rounded-md w-full max-w-md"
          />
        </div>
        <SearchEmptyState 
          query={searchQuery} 
          onClear={() => setSearchQuery('')} 
        />
      </section>
    </div>
  );
};