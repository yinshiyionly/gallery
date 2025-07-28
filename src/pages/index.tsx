import React, { useState } from 'react';
import { AnimatedLayout, AnimatedSection, AnimatedTitle, AnimatedContent } from '@/components/layout/AnimatedLayout';
import { Button } from '@/components/ui/Button';
import { MediaCard } from '@/components/gallery/MediaCard';
import { MediaModal } from '@/components/gallery/MediaModal';
import { Loading } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useMedia } from '@/hooks';
import { MediaItem } from '@/types';
import Head from 'next/head';
import { GetStaticProps } from 'next';

interface HomeProps {
  initialFeaturedMedia?: MediaItem[];
}

export default function Home({ initialFeaturedMedia = [] }: HomeProps) {
  // 获取精选媒体内容，使用初始数据作为 fallback
  const { media: featuredMedia, loading } = useMedia(
    { sortBy: 'createdAt', sortOrder: 'desc', limit: 6 },
    { 
      featured: true, 
      limit: 6,
      initialData: initialFeaturedMedia
    }
  );

  // 媒体模态框状态
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

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
    const currentIndex = featuredMedia.findIndex(m => m._id === selectedMedia._id);
    if (currentIndex > 0) {
      setSelectedMedia(featuredMedia[currentIndex - 1]);
    }
  };

  const handleNextMedia = () => {
    if (!selectedMedia) return;
    const currentIndex = featuredMedia.findIndex(m => m._id === selectedMedia._id);
    if (currentIndex < featuredMedia.length - 1) {
      setSelectedMedia(featuredMedia[currentIndex + 1]);
    }
  };

  return (
    <AnimatedLayout
      title="多端画廊 - 首页"
      description="一个基于 Next.js 和 MongoDB 构建的现代化多端画廊项目"
    >
      <Head>
        {/* 基础 SEO */}
        <meta name="keywords" content="画廊,图片,视频,多端,响应式,Next.js,MongoDB,媒体展示" />
        <meta name="author" content="多端画廊团队" />
        <link rel="canonical" href="https://gallery.example.com/" />
        
        {/* Open Graph */}
        <meta property="og:title" content="多端画廊 - 探索精彩视觉世界" />
        <meta property="og:description" content="多端画廊为您提供流畅的浏览体验，展示高质量的图片和视频内容，支持多种设备访问。" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://gallery.example.com/" />
        <meta property="og:image" content="https://gallery.example.com/og-image.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="多端画廊" />
        <meta property="og:locale" content="zh_CN" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="多端画廊 - 探索精彩视觉世界" />
        <meta name="twitter:description" content="多端画廊为您提供流畅的浏览体验，展示高质量的图片和视频内容，支持多种设备访问。" />
        <meta name="twitter:image" content="https://gallery.example.com/og-image.jpg" />
        
        {/* 结构化数据 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "多端画廊",
              "description": "一个基于 Next.js 和 MongoDB 构建的现代化多端画廊项目",
              "url": "https://gallery.example.com/",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://gallery.example.com/gallery?query={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
      </Head>

      {/* Hero Section */}
      <AnimatedSection className="pt-24 pb-12 md:pt-32 md:pb-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <AnimatedContent className="md:w-1/2 mb-8 md:mb-0 md:pr-8">
              <AnimatedTitle className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4">
                探索精彩<span className="text-primary-600 dark:text-primary-400">视觉世界</span>
              </AnimatedTitle>
              <motion.p 
                className="text-lg text-gray-600 dark:text-gray-300 mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                多端画廊为您提供流畅的浏览体验，展示高质量的图片和视频内容，支持多种设备访问。
              </motion.p>
              <motion.div 
                className="flex flex-wrap gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Link href="/gallery">
                  <Button size="lg">
                    浏览画廊
                  </Button>
                </Link>
                <Link href="/gallery?view=search">
                  <Button variant="outline" size="lg">
                    搜索内容
                  </Button>
                </Link>
              </motion.div>
            </AnimatedContent>
            <AnimatedContent delay={0.2} className="md:w-1/2">
              <motion.div 
                className="relative h-64 md:h-80 lg:h-96 rounded-lg overflow-hidden shadow-xl"
                whileHover={{ scale: 1.02, y: -5 }}
                transition={{ duration: 0.3 }}
              >
                {loading ? (
                  <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <Loading size="lg" />
                  </div>
                ) : featuredMedia.length > 0 ? (
                  <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-500/30 to-secondary-500/30 z-10"></div>
                    <img 
                      src={featuredMedia[0].thumbnailUrl} 
                      alt="精选媒体" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <p className="text-gray-500 dark:text-gray-400">暂无精选内容</p>
                  </div>
                )}
              </motion.div>
            </AnimatedContent>
          </div>
        </div>
      </AnimatedSection>

      {/* Featured Media Section */}
      <AnimatedSection delay={0.3} className="py-12">
        <div className="container mx-auto px-4">
          <motion.div 
            className="flex justify-between items-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <AnimatedTitle level={2} className="text-2xl md:text-3xl font-bold">精选内容</AnimatedTitle>
            <Link href="/gallery">
              <Button variant="outline" size="sm">
                查看全部
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </Button>
            </Link>
          </motion.div>
          
          {loading ? (
            <motion.div 
              className="flex justify-center items-center h-64"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Loading size="lg" text="加载精选内容..." />
            </motion.div>
          ) : featuredMedia.length > 0 ? (
            <AnimatedContent delay={0.5} stagger className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {featuredMedia.map((item, index) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ 
                    duration: 0.5, 
                    delay: 0.5 + index * 0.1,
                    ease: 'easeOut'
                  }}
                  whileHover={{ y: -5, scale: 1.02 }}
                >
                  <MediaCard
                    media={item}
                    onClick={handleMediaClick}
                    priority={true}
                  />
                </motion.div>
              ))}
            </AnimatedContent>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <EmptyState
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                }
                title="暂无精选内容"
                description="请稍后再来查看"
              />
            </motion.div>
          )}
        </div>
      </AnimatedSection>

      {/* Features Section */}
      <AnimatedSection delay={0.6} className="py-12 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <AnimatedTitle level={2} className="text-3xl font-bold text-center mb-12">特色功能</AnimatedTitle>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: '响应式设计',
                description: '完美适配各种设备屏幕，从手机到桌面电脑',
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                ),
              },
              {
                title: '高性能加载',
                description: '优化的图片加载和缓存机制，提供流畅的浏览体验',
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
              },
              {
                title: '强大搜索',
                description: '快速搜索和筛选功能，轻松找到您感兴趣的内容',
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                ),
              },
            ].map((feature, index) => (
              <motion.div 
                key={index}
                className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md"
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  duration: 0.6, 
                  delay: 0.7 + index * 0.1,
                  ease: 'easeOut'
                }}
                whileHover={{ 
                  y: -8, 
                  scale: 1.03,
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div 
                  className="text-primary-600 dark:text-primary-400 mb-4"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  {feature.icon}
                </motion.div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Media Modal */}
      <MediaModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        media={selectedMedia}
        onPrevious={handlePreviousMedia}
        onNext={handleNextMedia}
        hasPrevious={selectedMedia ? featuredMedia.findIndex(m => m._id === selectedMedia._id) > 0 : false}
        hasNext={selectedMedia ? featuredMedia.findIndex(m => m._id === selectedMedia._id) < featuredMedia.length - 1 : false}
      />
    </AnimatedLayout>
  );
}

// 静态生成优化 - 预获取精选媒体内容
export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  try {
    // 在构建时获取精选媒体内容
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/media?limit=6&sortBy=createdAt&sortOrder=desc`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch featured media');
    }
    
    const data = await response.json();
    
    return {
      props: {
        initialFeaturedMedia: data.data || [],
      },
      // 重新验证时间：1小时
      revalidate: 3600,
    };
  } catch (error) {
    console.error('Error fetching featured media for static generation:', error);
    
    return {
      props: {
        initialFeaturedMedia: [],
      },
      revalidate: 3600,
    };
  }
};