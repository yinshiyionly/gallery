import React, { useState } from 'react';
import { GalleryGrid } from './GalleryGrid';
import { MediaItem } from '@/types';

/**
 * 画廊网格布局演示组件
 */
export const GalleryGridDemo: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  
  // 模拟媒体数据
  const mockItems: MediaItem[] = [
    {
      _id: '1',
      title: '自然风景',
      description: '美丽的山脉和湖泊风景',
      url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
      thumbnailUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=500&q=60',
      type: 'image',
      tags: ['自然', '风景', '山'],
      createdAt: new Date('2023-01-15'),
      updatedAt: new Date('2023-01-15'),
      metadata: {
        width: 1920,
        height: 1080,
        format: 'jpg',
      },
    },
    {
      _id: '2',
      title: '城市夜景',
      description: '繁华都市的夜晚景色',
      url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390',
      thumbnailUrl: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=500&q=60',
      type: 'image',
      tags: ['城市', '夜景', '建筑'],
      createdAt: new Date('2023-02-20'),
      updatedAt: new Date('2023-02-20'),
      metadata: {
        width: 1600,
        height: 900,
        format: 'jpg',
      },
    },
    {
      _id: '3',
      title: '海滩日落',
      description: '美丽的海滩日落景色',
      url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
      thumbnailUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&q=60',
      type: 'image',
      tags: ['海滩', '日落', '海洋'],
      createdAt: new Date('2023-03-10'),
      updatedAt: new Date('2023-03-10'),
      metadata: {
        width: 2000,
        height: 1333,
        format: 'jpg',
      },
    },
    {
      _id: '4',
      title: '野生动物',
      description: '非洲草原上的野生动物',
      url: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d',
      thumbnailUrl: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=500&q=60',
      type: 'image',
      tags: ['动物', '野生', '自然'],
      createdAt: new Date('2023-04-05'),
      updatedAt: new Date('2023-04-05'),
      metadata: {
        width: 1800,
        height: 1200,
        format: 'jpg',
      },
    },
    {
      _id: '5',
      title: '航拍视频',
      description: '城市航拍视频',
      url: 'https://example.com/video1.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=500&q=60',
      type: 'video',
      tags: ['航拍', '城市', '视频'],
      createdAt: new Date('2023-05-15'),
      updatedAt: new Date('2023-05-15'),
      metadata: {
        width: 1920,
        height: 1080,
        format: 'mp4',
        duration: 120,
      },
    },
    {
      _id: '6',
      title: '美食特写',
      description: '精美的食物摄影',
      url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
      thumbnailUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=60',
      type: 'image',
      tags: ['美食', '摄影', '特写'],
      createdAt: new Date('2023-06-20'),
      updatedAt: new Date('2023-06-20'),
      metadata: {
        width: 1600,
        height: 1067,
        format: 'jpg',
      },
    },
    {
      _id: '7',
      title: '建筑设计',
      description: '现代建筑设计作品',
      url: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625',
      thumbnailUrl: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=500&q=60',
      type: 'image',
      tags: ['建筑', '设计', '现代'],
      createdAt: new Date('2023-07-10'),
      updatedAt: new Date('2023-07-10'),
      metadata: {
        width: 2200,
        height: 1467,
        format: 'jpg',
      },
    },
    {
      _id: '8',
      title: '旅行视频',
      description: '环球旅行记录视频',
      url: 'https://example.com/video2.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=500&q=60',
      type: 'video',
      tags: ['旅行', '视频', '环球'],
      createdAt: new Date('2023-08-05'),
      updatedAt: new Date('2023-08-05'),
      metadata: {
        width: 1920,
        height: 1080,
        format: 'mp4',
        duration: 180,
      },
    },
  ];

  // 模拟加载更多数据
  const handleLoadMore = async () => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, 1000);
    });
  };

  // 处理点击媒体项
  const handleItemClick = (item: MediaItem) => {
    setSelectedItem(item);
    console.log('Selected item:', item);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">画廊网格布局演示</h2>
      
      <GalleryGrid
        items={mockItems}
        loading={false}
        hasMore={false}
        onLoadMore={handleLoadMore}
        onItemClick={handleItemClick}
        className="mb-8"
      />
      
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-xl font-semibold">{selectedItem.title}</h3>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <div className="aspect-video relative mb-4">
                {selectedItem.type === 'image' ? (
                  <img
                    src={selectedItem.url}
                    alt={selectedItem.title}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                    <span className="text-white">视频播放器（演示）</span>
                  </div>
                )}
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">{selectedItem.description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedItem.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <p>创建时间: {selectedItem.createdAt.toLocaleDateString()}</p>
                <p>
                  分辨率: {selectedItem.metadata.width} × {selectedItem.metadata.height}
                </p>
                <p>格式: {selectedItem.metadata.format}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};