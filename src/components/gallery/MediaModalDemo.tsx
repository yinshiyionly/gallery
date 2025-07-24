import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { MediaModal } from './MediaModal';
import { MediaItem } from '@/types';

// Sample media items for demonstration
const sampleMediaItems: MediaItem[] = [
  {
    _id: '1',
    title: '示例图片 1',
    description: '这是一张示例图片，用于展示媒体模态框的功能。',
    url: 'https://images.unsplash.com/photo-1682687982501-1e58ab814714',
    thumbnailUrl: 'https://images.unsplash.com/photo-1682687982501-1e58ab814714?w=500&auto=format',
    type: 'image',
    tags: ['风景', '自然', '示例'],
    createdAt: new Date('2023-05-15'),
    updatedAt: new Date('2023-05-15'),
    metadata: {
      width: 1920,
      height: 1080,
      format: 'jpg',
      size: 1024000,
    },
  },
  {
    _id: '2',
    title: '示例图片 2',
    description: '这是另一张示例图片，用于测试导航功能。',
    url: 'https://images.unsplash.com/photo-1682695796954-bad0d0f59ff1',
    thumbnailUrl: 'https://images.unsplash.com/photo-1682695796954-bad0d0f59ff1?w=500&auto=format',
    type: 'image',
    tags: ['城市', '建筑', '示例'],
    createdAt: new Date('2023-06-20'),
    updatedAt: new Date('2023-06-20'),
    metadata: {
      width: 1920,
      height: 1080,
      format: 'jpg',
      size: 1536000,
    },
  },
  {
    _id: '3',
    title: '示例视频',
    description: '这是一个示例视频，用于测试视频播放功能。',
    url: 'https://www.w3schools.com/html/mov_bbb.mp4',
    thumbnailUrl: 'https://www.w3schools.com/images/w3schools_green.jpg',
    type: 'video',
    tags: ['视频', '动画', '示例'],
    createdAt: new Date('2023-07-10'),
    updatedAt: new Date('2023-07-10'),
    metadata: {
      width: 1280,
      height: 720,
      format: 'mp4',
      size: 5242880,
      duration: 10,
    },
  },
];

export const MediaModalDemo: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  const currentMedia = sampleMediaItems[currentMediaIndex];

  const handlePrevious = () => {
    setCurrentMediaIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleNext = () => {
    setCurrentMediaIndex((prev) => (prev < sampleMediaItems.length - 1 ? prev + 1 : prev));
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">媒体模态框演示</h2>
      <div className="flex flex-wrap gap-4">
        {sampleMediaItems.map((media, index) => (
          <div
            key={media._id}
            className="relative w-48 h-48 overflow-hidden rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => {
              setCurrentMediaIndex(index);
              setIsModalOpen(true);
            }}
          >
            {media.type === 'image' ? (
              <img
                src={media.thumbnailUrl}
                alt={media.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                <img
                  src={media.thumbnailUrl}
                  alt={media.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 text-white text-sm truncate">
              {media.title}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <Button onClick={() => setIsModalOpen(true)}>打开媒体模态框</Button>
      </div>

      <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <h3 className="font-medium mb-2">功能说明：</h3>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>点击缩略图或按钮打开媒体详情模态框</li>
          <li>使用左右箭头按钮或键盘方向键浏览媒体</li>
          <li>图片支持缩放功能（使用 +/- 按钮或键盘 +/- 键）</li>
          <li>双击图片可以放大</li>
          <li>放大后可以拖动图片查看细节</li>
          <li>使用全屏按钮或按 F 键进入全屏模式</li>
          <li>按 0 键重置缩放</li>
          <li>按 ESC 键关闭模态框</li>
        </ul>
      </div>

      <MediaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        media={currentMedia}
        onPrevious={handlePrevious}
        onNext={handleNext}
        hasPrevious={currentMediaIndex > 0}
        hasNext={currentMediaIndex < sampleMediaItems.length - 1}
      />
    </div>
  );
};