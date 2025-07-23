import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { MediaCard } from './MediaCard';
import { Loading } from '@/components/ui/Loading';
import { useInfiniteScroll } from '@/hooks';
import { MediaItem } from '@/types';
import { useUIStore } from '@/store';

interface GalleryGridProps {
  items: MediaItem[];
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => Promise<void>;
  onItemClick: (item: MediaItem) => void;
}

export const GalleryGrid: React.FC<GalleryGridProps> = ({
  items,
  loading,
  hasMore,
  onLoadMore,
  onItemClick,
}) => {
  const { galleryLayout } = useUIStore();
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const { isFetching } = useInfiniteScroll(loadMoreRef, onLoadMore, {
    disabled: !hasMore || loading,
  });

  if (items.length === 0 && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-16 w-16 text-gray-400 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">没有找到媒体内容</h3>
        <p className="text-gray-500 dark:text-gray-400 mt-1">请尝试调整搜索条件</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <motion.div
        layout
        className={
          galleryLayout === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
            : 'columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4'
        }
      >
        {items.map((item, index) => (
          <div key={item._id} className={galleryLayout === 'masonry' ? 'mb-4 break-inside-avoid' : ''}>
            <MediaCard media={item} onClick={onItemClick} priority={index < 8} />
          </div>
        ))}
      </motion.div>

      {/* Loading indicator and infinite scroll trigger */}
      <div ref={loadMoreRef} className="w-full py-8 flex justify-center">
        {(loading || isFetching) && <Loading size="md" text="加载更多..." />}
      </div>
    </div>
  );
};