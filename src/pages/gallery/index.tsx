import React, { useState, useEffect, useRef } from 'react';
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

export default function Gallery() {
  const router = useRouter();
  const { query, view } = router.query;
  
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
  
  // 使用自定义 Hook 获取媒体数据
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
    
    if (view === 'search') {
      // 如果是搜索视图，滚动到搜索栏
      const searchElement = document.getElementById('search-section');
      if (searchElement) {
        searchElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [query, view]);
  
  // 处理搜索
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    // 更新 URL 查询参数，但不触发页面刷新
    const newQuery = { ...router.query, query };
    router.push({
      pathname: router.pathname,
      query: newQuery,
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
      title="多端画廊 - 画廊"
      description="浏览我们的媒体画廊，查看高质量的图片和视频内容"
    >
      <Head>
        {/* 基础 SEO */}
        <meta name="keywords" content="画廊,媒体浏览,图片搜索,视频搜索,媒体筛选" />
        <meta name="author" content="多端画廊团队" />
        <link rel="canonical" href="https://gallery.example.com/gallery" />
        
        {/* 动态 SEO 基于搜索查询 */}
        {searchQuery && (
          <>
            <meta name="description" content={`搜索 "${searchQuery}" 的结果 - 多端画廊`} />
            <meta property="og:title" content={`搜索: ${searchQuery} - 多端画廊`} />
            <meta property="og:description" content={`在多端画廊中搜索 "${searchQuery}" 的媒体内容结果`} />
          </>
        )}
        
        {/* Open Graph */}
        <meta property="og:title" content={searchQuery ? `搜索: ${searchQuery} - 多端画廊` : "多端画廊 - 媒体浏览"} />
        <meta property="og:description" content={searchQuery ? `在多端画廊中搜索 "${searchQuery}" 的媒体内容结果` : "浏览我们的媒体画廊，查看高质量的图片和视频内容"} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://gallery.example.com/gallery${searchQuery ? `?query=${encodeURIComponent(searchQuery)}` : ''}`} />
        <meta property="og:image" content="https://gallery.example.com/og-image.jpg" />
        <meta property="og:site_name" content="多端画廊" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={searchQuery ? `搜索: ${searchQuery} - 多端画廊` : "多端画廊 - 媒体浏览"} />
        <meta name="twitter:description" content={searchQuery ? `在多端画廊中搜索 "${searchQuery}" 的媒体内容结果` : "浏览我们的媒体画廊，查看高质量的图片和视频内容"} />
        <meta name="twitter:image" content="https://gallery.example.com/og-image.jpg" />
        
        {/* 结构化数据 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "CollectionPage",
              "name": searchQuery ? `搜索结果: ${searchQuery}` : "媒体画廊",
              "description": searchQuery ? `搜索 "${searchQuery}" 的媒体内容结果` : "浏览高质量的图片和视频内容",
              "url": `https://gallery.example.com/gallery${searchQuery ? `?query=${encodeURIComponent(searchQuery)}` : ''}`,
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
      </Head>
      
      {/* 搜索和筛选区域 */}
      <div id="search-section" className="pt-24 pb-4">
        <FilterBar
          onSearch={handleSearch}
          onFilter={handleFilter}
          filters={filters}
          searchQuery={searchQuery}
        />
      </div>
      
      {/* 画廊内容 */}
      <div className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold">
              {searchQuery ? `搜索结果: "${searchQuery}"` : '媒体画廊'}
            </h1>
            {totalItems > 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                共 {totalItems} 个媒体项目
              </p>
            )}
          </div>
          
          {error ? (
            <EmptyState
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              }
              title="加载失败"
              description={error.message || "无法加载媒体内容，请稍后再试"}
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