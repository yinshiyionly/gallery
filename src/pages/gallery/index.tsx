import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { SearchInput } from '@/components/ui/SearchInput';
import { Loading } from '@/components/ui/Loading';

export default function Gallery() {
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // 这里将来会实现搜索功能
  };

  return (
    <Layout
      title="多端画廊 - 画廊"
      description="浏览我们的媒体画廊，查看高质量的图片和视频内容"
    >
      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-6">媒体画廊</h1>
          
          {/* 搜索和筛选区域 */}
          <div className="mb-8">
            <div className="max-w-md">
              <SearchInput 
                placeholder="搜索媒体..."
                value={searchQuery}
                onChange={setSearchQuery}
                onSearch={handleSearch}
              />
            </div>
          </div>
          
          {/* 画廊内容 */}
          <div className="min-h-[400px]">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loading size="lg" text="加载中..." />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {/* 这里将来会显示媒体内容 */}
                {Array.from({ length: 8 }).map((_, index) => (
                  <div 
                    key={index}
                    className="bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden shadow-md aspect-square flex items-center justify-center"
                  >
                    <p className="text-gray-500 dark:text-gray-400">媒体项目 {index + 1}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}