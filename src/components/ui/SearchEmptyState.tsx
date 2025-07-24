import React from 'react';
import { EmptyState } from './EmptyState';

interface SearchEmptyStateProps {
  query?: string;
  onClear?: () => void;
  className?: string;
}

/**
 * 搜索无结果状态组件
 * 专门用于搜索结果为空的情况
 */
export const SearchEmptyState: React.FC<SearchEmptyStateProps> = ({
  query,
  onClear,
  className,
}) => {
  const searchIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1}
      stroke="currentColor"
      className="w-16 h-16 text-gray-300 dark:text-gray-600"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
      />
    </svg>
  );

  return (
    <EmptyState
      title="未找到搜索结果"
      message={query ? `没有找到与"${query}"相关的内容，请尝试其他关键词或浏览所有内容。` : '没有找到符合条件的内容。'}
      icon={searchIcon}
      action={onClear ? { label: '清除搜索', onClick: onClear } : undefined}
      className={className}
    />
  );
};