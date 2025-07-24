import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Layout } from '@/components/layout/Layout';
import { GalleryGrid } from '@/components/gallery/GalleryGrid';
import { FilterBar } from '@/components/gallery/FilterBar';
import { MediaModal } from '@/components/gallery/MediaModal';
import { Loading } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';
import { useMedia } from '@/hooks';
import { MediaItem, SearchParams } from '@/types';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function SearchPage() {
  const router = useRouter();
  const { q: query } = router.query;
  
  // 搜索和筛选状态
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Partial<SearchParams>>({
    sortBy: 'createdAt',
    sortOrder: 'desc',
    type: 'all',
  });
  
  // 媒体模态框状态
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  
  // 使用自定义 Hook 获取搜索结果
  const {
    media,
    loading,
    error,
    hasMore,
    loadMore,
    totalItems,
  } = useMedia({
    ...filters,
    query: searchQuery,
  });
  
  // 当 URL 查询参数变化时更新搜索状态
  useEffect(() => {
    if (query && typeof query === 'string') {
      setSearchQuery(query);
    }
  }, [query]);
  
  // 处理搜索
  const handleSearch = (newQuery: string) => {
    setSearchQuery(newQuery);
    
    // 更新 URL 查询参数
    router.push({
      pathname: '/search',
      query: { q: newQuery },
    }, undefined, { shallow: true });
  };
  
  // 处理筛选
  const handleFilter = (newFilters: Partial<SearchParams>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };
  
  // 处理媒体点击
  const handleMediaClick = (media: MediaItem) => {
    setSelectedMedia(media);
    setModalOpen(true);
  };
  
  // 处理模态框关闭
  const handleCloseModal = () => {
    setModalOpen(false);
  };
  
  // 处理上一个/下一个媒体
  const handlePreviousMedia = () => {
    if (!selectedMedia) return;
    const currentIndex = media.findIndex(m => m._id === selectedMedia._id);
    if (currentIndex > 0) {
      setSelectedMedia(media[currentIndex - 1]);
    }
  };
  
  const handleNextMedia = () => {
    if (!selectedMedia) return;
    const currentIndex = media.findIndex(m => m._id === selectedMedia._id);
    if (currentIndex < media.length - 1) {
      setSelectedMedia(media[currentIndex + 1]);
    }
  };

  return (
    <Layout
      title={searchQuery ? `搜索: ${searchQuery} - 多端画廊` : '搜索 - 多端画廊'}
      description={searchQuery ? `搜索 "${searchQuery}" 的媒体内容结果` : '在多端画廊中搜索您感兴趣的媒体内容'}
    >
      <Head>
        {/* 基础 SEO */}
        <meta name="keywords" content={`搜索,${searchQuery || '媒体搜索'},画廊搜索,图片搜索,视频搜索`} />
        <meta name="author" content="多端画廊团队" />
        <link rel="canonical" href={`https://gallery.example.com/search${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''}`} />
        
        {/* Open Graph */}
        <meta property="og:title" content={searchQuery ? `搜索: ${searchQuery} - 多端画廊` : '搜索 - 多端画廊'} />
        <meta property="og:description" content={searchQuery ? `在多端画廊中搜索 "${searchQuery}" 的媒体内容结果` : '在多端画廊中搜索您感兴趣的媒体内容'} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://gallery.example.com/search${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''}`} />
        <meta property="og:image" content="https://gallery.example.com/og-image.jpg" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={searchQuery ? `搜索: ${searchQuery} - 多端画廊` : '搜索 - 多端画廊'} />
        <meta name="twitter:description" content={searchQuery ? `在多端画廊中搜索 "${searchQuery}" 的媒体内容结果` : '在多端画廊中搜索您感兴趣的媒体内容'} />
        <meta name="twitter:image" content="https://gallery.example.com/og-image.jpg" />
        
        {/* 搜索结果结构化数据 */}
        {searchQuery && totalItems > 0 && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "SearchResultsPage",
                "name": `搜索结果: ${searchQuery}`,
                "description": `搜索 "${searchQuery}" 的媒体内容结果`,
                "url": `https://gallery.example.com/search?q=${encodeURIComponent(searchQuery)}`,
                "mainEntity": {
                  "@type": "ItemList",
                  "numberOfItems": totalItems,
                  "itemListElement": media.slice(0, 10).map((item, index) => ({
                    "@type": "MediaObject",
                    "position": index + 1,
                    "name": item.title,
                    "description": item.description,
                    "contentUrl": item.url,
                    "thumbnailUrl": item.thumbnailUrl,
                    "uploadDate": item.createdAt
                  }))
                }
              })
            }}
          />
        )}
      </Head>
      
      {/* 面包屑导航 */}
      <div className="pt-24 pb-4">
        <div className="container mx-auto px-4">
          <nav className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <Link href="/" className="hover:text-primary-600 dark:hover:text-primary-400">
              首页
            </Link>
            <span>/</span>
            <Link href="/gallery" className="hover:text-primary-600 dark:hover:text-primary-400">
              画廊
            </Link>
            <span>/</span>
            <span className="text-gray-900 dark:text-gray-100">搜索</span>
          </nav>
        </div>
      </div>
      
      {/* 搜索和筛选区域 */}
      <div className="pb-4">
        <FilterBar
          onSearch={handleSearch}
          onFilter={handleFilter}
          filters={filters}
          searchQuery={searchQuery}
          autoFocus={!searchQuery}
        />
      </div>
      
      {/* 搜索结果内容 */}
      <div className="py-8">
        <div className="container mx-auto px-4">
          {/* 搜索结果标题和统计 */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                {searchQuery ? (
                  <>
                    搜索结果: <span className="text-primary-600 dark:text-primary-400">"{searchQuery}"</span>
                  </>
                ) : (
                  '搜索媒体内容'
                )}
              </h1>
              {searchQuery && totalItems > 0 && (
                <p className="text-gray-600 dark:text-gray-400">
                  找到 {totalItems} 个相关结果
                </p>
              )}
            </div>
            
            {searchQuery && (
              <div className="mt-4 md:mt-0">
                <Link 
                  href="/gallery"
                  className="text-primary-600 dark:text-primary-400 hover:underline"
                >
                  浏览所有媒体 →
                </Link>
              </div>
            )}
          </div>
          
          {/* 搜索提示 */}
          {!searchQuery && (
            <motion.div 
              className="text-center py-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="max-w-md mx-auto">
                <div className="text-6xl mb-4">🔍</div>
                <h2 className="text-xl font-semibold mb-2">开始搜索</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  在上方搜索框中输入关键词，查找您感兴趣的媒体内容
                </p>
                <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                  <p>💡 搜索提示：</p>
                  <ul className="space-y-1">
                    <li>• 可以搜索标题、描述或标签</li>
                    <li>• 使用筛选器缩小搜索范围</li>
                    <li>• 支持实时搜索建议</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* 搜索结果 */}
          {searchQuery && (
            <>
              {error ? (
                <EmptyState
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  }
                  title="搜索失败"
                  description={error.message || "无法完成搜索，请稍后再试"}
                />
              ) : totalItems === 0 && !loading ? (
                <EmptyState
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  }
                  title="未找到相关内容"
                  description={`没有找到与 "${searchQuery}" 相关的媒体内容`}
                  action={
                    <Link href="/gallery">
                      <button className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors">
                        浏览所有媒体
                      </button>
                    </Link>
                  }
                />
              ) : (
                <GalleryGrid
                  items={media}
                  loading={loading}
                  hasMore={hasMore}
                  onLoadMore={loadMore}
                  onItemClick={handleMediaClick}
                  layoutControls={true}
                />
              )}
            </>
          )}
        </div>
      </div>
      
      {/* 媒体模态框 */}
      <MediaModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        media={selectedMedia}
        onPrevious={handlePreviousMedia}
        onNext={handleNextMedia}
        hasPrevious={selectedMedia ? media.findIndex(m => m._id === selectedMedia._id) > 0 : false}
        hasNext={selectedMedia ? media.findIndex(m => m._id === selectedMedia._id) < media.length - 1 : false}
      />
    </Layout>
  );
}