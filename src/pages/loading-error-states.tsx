import React from 'react';
import { LoadingErrorStatesDemo } from '@/components/ui/LoadingErrorStatesDemo';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

/**
 * 加载和错误状态组件演示页面
 */
export default function LoadingErrorStatesPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">加载和错误状态组件演示</h1>
      <ErrorBoundary>
        <LoadingErrorStatesDemo />
      </ErrorBoundary>
    </div>
  );
}