import React from 'react';
import { Skeleton } from './Skeleton';

interface MediaSkeletonProps {
  count?: number;
  grid?: boolean;
}

/**
 * 媒体卡片的骨架屏组件
 * 用于在媒体内容加载时显示占位符
 */
export const MediaSkeleton: React.FC<MediaSkeletonProps> = ({ 
  count = 6,
  grid = true 
}) => {
  return (
    <div className={`grid ${grid ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : ''} gap-4 w-full`}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex flex-col space-y-2">
          {/* 图片占位符 */}
          <Skeleton className="w-full h-48 rounded-lg" />
          
          {/* 标题占位符 */}
          <Skeleton className="h-6 w-3/4" />
          
          {/* 描述占位符 */}
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          
          {/* 标签占位符 */}
          <div className="flex flex-wrap gap-2 mt-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-12 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
};