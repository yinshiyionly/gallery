import React, { useState } from 'react';
import { GetStaticProps, GetStaticPaths } from 'next';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Head from 'next/head';
import Link from 'next/link';
import { AnimatedLayout, AnimatedSection, AnimatedTitle, AnimatedContent } from '@/components/layout/AnimatedLayout';
import { MediaGestureHandler } from '@/components/ui/GestureHandler';
import { Button } from '@/components/ui/Button';
import { MediaCard } from '@/components/gallery/MediaCard';
import { MediaModal } from '@/components/gallery/MediaModal';
import { Loading } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';
import { MediaItem } from '@/types';
import { motion } from 'framer-motion';

interface MediaDetailProps {
  media: MediaItem | null;
  relatedMedia: MediaItem[];
  error?: string;
}

export default function MediaDetail({ media, relatedMedia, error }: MediaDetailProps) {
  const router = useRouter();
  
  // 如果页面正在生成中，显示加载状态
  if (router.isFallback) {
    return (
      <AnimatedLayout title="加载中..." description="正在加载媒体内容">
        <motion.div 
          className="flex justify-center items-center h-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Loading size="lg" text="加载媒体内容..." />
        </motion.div>
      </AnimatedLayout>
    );
  }
  
  // 如果发生错误或媒体不存在，显示错误状态
  if (error || !media) {
    return (
      <AnimatedLayout title="内容不可用" description="无法加载请求的媒体内容">
        <AnimatedSection className="container mx-auto px-4 py-24">
          <EmptyState
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            }
            title="内容不可用"
            description={error || "无法加载请求的媒体内容"}
            action={
              <Button onClick={() => router.push('/gallery')}>
                返回画廊
              </Button>
            }
          />
        </AnimatedSection>
      </AnimatedLayout>
    );
  }
  
  // 媒体模态框状态
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  
  // 点击外部关闭分享菜单
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shareMenuOpen && !(event.target as Element).closest('.share-menu-container')) {
        setShareMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [shareMenuOpen]);
  
  // 处理媒体点击
  const handleMediaClick = (clickedMedia: MediaItem) => {
    setSelectedMedia(clickedMedia);
    setModalOpen(true);
  };
  
  // 处理模态框关闭
  const handleCloseModal = () => {
    setModalOpen(false);
  };
  
  // 处理上一个/下一个媒体
  const handlePreviousMedia = () => {
    if (!selectedMedia) return;
    const currentIndex = relatedMedia.findIndex(m => m._id === selectedMedia._id);
    if (currentIndex > 0) {
      setSelectedMedia(relatedMedia[currentIndex - 1]);
    }
  };
  
  const handleNextMedia = () => {
    if (!selectedMedia) return;
    const currentIndex = relatedMedia.findIndex(m => m._id === selectedMedia._id);
    if (currentIndex < relatedMedia.length - 1) {
      setSelectedMedia(relatedMedia[currentIndex + 1]);
    }
  };
  
  // 分享功能
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: media.title,
          text: media.description || '查看这个精彩的媒体内容',
          url: shareUrl,
        });
      } catch (error) {
        console.error('分享失败:', error);
        setShareMenuOpen(true);
      }
    } else {
      setShareMenuOpen(true);
    }
  };
  
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert('链接已复制到剪贴板');
      setShareMenuOpen(false);
    } catch (error) {
      console.error('复制失败:', error);
    }
  };
  
  const shareToSocial = (platform: string) => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(media.title);
    const encodedDescription = encodeURIComponent(media.description || '查看这个精彩的媒体内容');
    
    let shareLink = '';
    
    switch (platform) {
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
        break;
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'linkedin':
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case 'weibo':
        shareLink = `https://service.weibo.com/share/share.php?url=${encodedUrl}&title=${encodedTitle}`;
        break;
      case 'wechat':
        // 微信分享需要特殊处理，这里只是示例
        handleCopyLink();
        return;
    }
    
    if (shareLink) {
      window.open(shareLink, '_blank', 'width=600,height=400');
      setShareMenuOpen(false);
    }
  };

  return (
    <AnimatedLayout
      title={`${media.title} - 多端画廊`}
      description={media.description || `查看 ${media.title} 的详细信息`}
    >
      <Head>
        {/* 基础 SEO */}
        <meta name="keywords" content={`${media.tags.join(',')},${media.type === 'image' ? '图片' : '视频'},媒体,画廊`} />
        <meta name="author" content="多端画廊团队" />
        <link rel="canonical" href={`https://gallery.example.com/media/${media._id}`} />
        
        {/* Open Graph */}
        <meta property="og:title" content={`${media.title} - 多端画廊`} />
        <meta property="og:description" content={media.description || `查看 ${media.title} 的详细信息`} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://gallery.example.com/media/${media._id}`} />
        <meta property="og:image" content={media.thumbnailUrl} />
        <meta property="og:image:width" content={media.metadata.width?.toString() || "800"} />
        <meta property="og:image:height" content={media.metadata.height?.toString() || "600"} />
        <meta property="og:site_name" content="多端画廊" />
        <meta property="article:published_time" content={media.createdAt} />
        <meta property="article:modified_time" content={media.updatedAt} />
        <meta property="article:tag" content={media.tags.join(',')} />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${media.title} - 多端画廊`} />
        <meta name="twitter:description" content={media.description || `查看 ${media.title} 的详细信息`} />
        <meta name="twitter:image" content={media.thumbnailUrl} />
        <meta name="twitter:creator" content="@gallery_team" />
        
        {/* 结构化数据 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": media.type === 'image' ? "ImageObject" : "VideoObject",
              "name": media.title,
              "description": media.description,
              "url": media.url,
              "thumbnailUrl": media.thumbnailUrl,
              "contentUrl": media.url,
              "uploadDate": media.createdAt,
              "width": media.metadata.width,
              "height": media.metadata.height,
              "encodingFormat": media.metadata.format,
              "keywords": media.tags.join(','),
              "creator": {
                "@type": "Organization",
                "name": "多端画廊"
              },
              "publisher": {
                "@type": "Organization",
                "name": "多端画廊",
                "url": "https://gallery.example.com"
              }
            })
          }}
        />
      </Head>
      
      <AnimatedSection className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* 导航面包屑 */}
          <motion.nav 
            className="flex mb-6 text-sm" 
            aria-label="面包屑导航"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link href="/" className="text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400">
                  首页
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                  </svg>
                  <Link href="/gallery" className="ml-1 text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400 md:ml-2">
                    画廊
                  </Link>
                </div>
              </li>
              <li aria-current="page">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                  </svg>
                  <span className="ml-1 text-gray-500 md:ml-2 dark:text-gray-400 truncate max-w-[200px]" title={media.title}>
                    {media.title}
                  </span>
                </div>
              </li>
            </ol>
          </motion.nav>
          
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* 媒体内容 */}
            <div className="lg:col-span-3">
              <MediaGestureHandler
                onPrevious={() => console.log('Previous media')}
                onNext={() => console.log('Next media')}
                onClose={() => router.back()}
              >
                <AnimatedContent className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg">
                  <motion.div 
                    className="relative aspect-video bg-gray-100 dark:bg-gray-700"
                    whileHover={{ scale: 1.01 }}
                    transition={{ duration: 0.2 }}
                  >
                    {media.type === 'image' ? (
                      <Image
                        src={media.url}
                        alt={media.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 50vw"
                        className="object-contain cursor-pointer"
                        onClick={() => handleMediaClick(media)}
                        priority
                      />
                    ) : (
                      <video
                        src={media.url}
                        poster={media.thumbnailUrl}
                        controls
                        className="w-full h-full object-contain"
                      />
                    )}
                  </motion.div>
                
                  <motion.div 
                    className="p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <AnimatedTitle className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                      {media.title}
                    </AnimatedTitle>
                  
                    {media.description && (
                      <motion.p 
                        className="text-gray-700 dark:text-gray-300 mb-6"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                      >
                        {media.description}
                      </motion.p>
                    )}
                    
                    <motion.div 
                      className="flex flex-wrap gap-2 mb-6"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                    >
                      {media.tags.map((tag, index) => (
                        <motion.span
                          key={tag}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3, delay: 0.4 + index * 0.05 }}
                          whileHover={{ scale: 1.05 }}
                        >
                          {tag}
                        </motion.span>
                      ))}
                    </motion.div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-500 dark:text-gray-400 mb-6">
                    <div>
                      <p>
                        <span className="font-medium">类型:</span>{' '}
                        {media.type === 'image' ? '图片' : '视频'}
                      </p>
                      {media.metadata.width && media.metadata.height && (
                        <p>
                          <span className="font-medium">尺寸:</span>{' '}
                          {media.metadata.width} x {media.metadata.height}
                        </p>
                      )}
                    </div>
                    <div>
                      {media.metadata.format && (
                        <p>
                          <span className="font-medium">格式:</span> {media.metadata.format}
                        </p>
                      )}
                      <p>
                        <span className="font-medium">上传时间:</span>{' '}
                        {new Date(media.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                    <motion.div 
                      className="flex flex-wrap gap-3"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.6 }}
                    >
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          onClick={() => handleMediaClick(media)}
                          className="flex items-center gap-2"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                          </svg>
                          {media.type === 'image' ? '查看大图' : '全屏播放'}
                        </Button>
                      </motion.div>
                    
                      <motion.div 
                        className="relative share-menu-container"
                        whileHover={{ scale: 1.05 }} 
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          variant="outline"
                          onClick={handleShare}
                          className="flex items-center gap-2"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                          </svg>
                          分享
                        </Button>
                      
                        {/* 分享菜单 */}
                        {shareMenuOpen && (
                          <motion.div 
                            className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                          >
                          <div className="py-2">
                            <button
                              onClick={handleCopyLink}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                              </svg>
                              复制链接
                            </button>
                            <button
                              onClick={() => shareToSocial('twitter')}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                            >
                              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                              </svg>
                              Twitter
                            </button>
                            <button
                              onClick={() => shareToSocial('facebook')}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                            >
                              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                              </svg>
                              Facebook
                            </button>
                            <button
                              onClick={() => shareToSocial('weibo')}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                            >
                              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M9.31 8.17c-.04.2-.12.4-.25.56-.13.16-.3.28-.49.36-.19.08-.4.12-.61.12-.21 0-.42-.04-.61-.12-.19-.08-.36-.2-.49-.36-.13-.16-.21-.36-.25-.56-.04-.2-.04-.41 0-.61.04-.2.12-.4.25-.56.13-.16.3-.28.49-.36.19-.08.4-.12.61-.12.21 0 .42.04.61.12.19.08.36.2.49.36.13.16.21.36.25.56.04.2.04.41 0 .61z"/>
                              </svg>
                              微博
                            </button>
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                      
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          variant="outline"
                          onClick={() => router.back()}
                          className="flex items-center gap-2"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                          </svg>
                          返回
                        </Button>
                      </motion.div>
                    </motion.div>
                  </motion.div>
                </AnimatedContent>
              </MediaGestureHandler>
            </div>
            
            {/* 相关媒体 */}
            <div className="lg:col-span-2">
              <AnimatedContent delay={0.3}>
                <AnimatedTitle level={2} className="text-xl font-bold mb-4">相关媒体</AnimatedTitle>
                
                {relatedMedia.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                    {relatedMedia.map((item, index) => (
                      <motion.div
                        key={item._id}
                        initial={{ opacity: 0, x: 20, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        transition={{ 
                          duration: 0.4, 
                          delay: 0.4 + index * 0.1,
                          ease: 'easeOut'
                        }}
                        whileHover={{ scale: 1.02, y: -2 }}
                      >
                        <MediaCard
                          media={item}
                          onClick={handleMediaClick}
                        />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <motion.div 
                    className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-center"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                  >
                    <p className="text-gray-500 dark:text-gray-400">暂无相关媒体</p>
                  </motion.div>
                )}
              </AnimatedContent>
            </div>
          </div>
          </div>
        </div>
      </AnimatedSection>
      
      {/* 媒体模态框 */}
      <MediaModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        media={selectedMedia}
        onPrevious={handlePreviousMedia}
        onNext={handleNextMedia}
        hasPrevious={selectedMedia && selectedMedia._id !== media._id ? relatedMedia.findIndex(m => m._id === selectedMedia._id) > 0 : false}
        hasNext={selectedMedia && selectedMedia._id !== media._id ? relatedMedia.findIndex(m => m._id === selectedMedia._id) < relatedMedia.length - 1 : false}
      />
    </AnimatedLayout>
  );
}

// 静态路径生成 - 预生成热门媒体页面
export const getStaticPaths: GetStaticPaths = async () => {
  try {
    // 获取热门媒体 ID 用于预生成
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/media?limit=20&sortBy=createdAt&sortOrder=desc`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch media for static paths');
    }
    
    const data = await response.json();
    const paths = (data.data || []).map((media: MediaItem) => ({
      params: { id: media._id },
    }));
    
    return {
      paths,
      // 启用增量静态再生 - 其他页面在请求时生成
      fallback: 'blocking',
    };
  } catch (error) {
    console.error('Error generating static paths:', error);
    
    return {
      paths: [],
      fallback: 'blocking',
    };
  }
};

// 静态生成优化 - 预获取媒体详情和相关内容
export const getStaticProps: GetStaticProps<MediaDetailProps> = async (context) => {
  const { id } = context.params || {};
  
  if (!id || typeof id !== 'string') {
    return {
      props: {
        media: null,
        relatedMedia: [],
        error: '无效的媒体 ID',
      },
    };
  }
  
  try {
    // 获取媒体详情
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/media/${id}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return {
          notFound: true,
        };
      }
      throw new Error(`获取媒体详情失败: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      if (data.message?.includes('not found')) {
        return {
          notFound: true,
        };
      }
      throw new Error(data.message || '获取媒体详情失败');
    }
    
    return {
      props: {
        media: data.data.media,
        relatedMedia: data.data.relatedMedia || [],
      },
      // 重新验证时间：1小时
      revalidate: 3600,
    };
  } catch (error) {
    console.error('获取媒体详情失败:', error);
    
    return {
      props: {
        media: null,
        relatedMedia: [],
        error: error instanceof Error ? error.message : '获取媒体详情失败',
      },
      // 错误页面较短的重新验证时间
      revalidate: 300,
    };
  }
};