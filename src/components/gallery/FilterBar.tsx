import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import { useUIStore } from '@/store';
import { SearchParams } from '@/types';

interface FilterBarProps {
  onSearch: (query: string) => void;
  onFilter: (filters: Partial<SearchParams>) => void;
  filters: Partial<SearchParams>;
  searchQuery: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  onSearch,
  onFilter,
  filters,
  searchQuery,
}) => {
  const { galleryLayout, setGalleryLayout } = useUIStore();
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const handleTypeChange = (type: 'all' | 'image' | 'video') => {
    onFilter({ ...filters, type });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [sortBy, sortOrder] = e.target.value.split('-');
    onFilter({
      ...filters,
      sortBy: sortBy as 'createdAt' | 'title',
      sortOrder: sortOrder as 'asc' | 'desc',
    });
  };

  const toggleFilters = () => {
    setIsFiltersOpen(!isFiltersOpen);
  };

  return (
    <div className="sticky top-16 z-30 bg-white dark:bg-gray-900 border-b dark:border-gray-800 py-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <SearchInput
              value={searchQuery}
              onChange={onSearch}
              placeholder="搜索媒体内容..."
              className="w-full"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFilters}
              className="flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
                  clipRule="evenodd"
                />
              </svg>
              筛选
            </Button>

            <div className="flex border rounded-md overflow-hidden">
              <button
                className={`p-2 ${
                  galleryLayout === 'grid'
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                    : 'bg-white text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                }`}
                onClick={() => setGalleryLayout('grid')}
                aria-label="网格布局"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                className={`p-2 ${
                  galleryLayout === 'masonry'
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                    : 'bg-white text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                }`}
                onClick={() => setGalleryLayout('masonry')}
                aria-label="瀑布流布局"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 2h10v10H5V5z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isFiltersOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    媒体类型
                  </label>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant={filters.type === 'all' || !filters.type ? 'default' : 'outline'}
                      onClick={() => handleTypeChange('all')}
                    >
                      全部
                    </Button>
                    <Button
                      size="sm"
                      variant={filters.type === 'image' ? 'default' : 'outline'}
                      onClick={() => handleTypeChange('image')}
                    >
                      图片
                    </Button>
                    <Button
                      size="sm"
                      variant={filters.type === 'video' ? 'default' : 'outline'}
                      onClick={() => handleTypeChange('video')}
                    >
                      视频
                    </Button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="sort"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    排序方式
                  </label>
                  <select
                    id="sort"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    value={`${filters.sortBy || 'createdAt'}-${filters.sortOrder || 'desc'}`}
                    onChange={handleSortChange}
                  >
                    <option value="createdAt-desc">最新上传</option>
                    <option value="createdAt-asc">最早上传</option>
                    <option value="title-asc">标题 A-Z</option>
                    <option value="title-desc">标题 Z-A</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};