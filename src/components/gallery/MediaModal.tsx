import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { MediaItem } from '@/types';

interface MediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  media: MediaItem | null;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

export const MediaModal: React.FC<MediaModalProps> = ({
  isOpen,
  onClose,
  media,
  onPrevious,
  onNext,
  hasPrevious = false,
  hasNext = false,
}) => {
  if (!media) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-4xl w-full bg-white dark:bg-gray-900"
    >
      <div className="flex flex-col">
        <div className="relative aspect-video w-full overflow-hidden bg-black">
          {media.type === 'image' ? (
            <Image
              src={media.url}
              alt={media.title}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 800px"
            />
          ) : (
            <video
              src={media.url}
              controls
              className="w-full h-full object-contain"
              poster={media.thumbnailUrl}
            />
          )}

          {/* Navigation buttons */}
          <div className="absolute inset-y-0 left-0 flex items-center">
            {hasPrevious && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onPrevious}
                className="bg-black/30 text-white hover:bg-black/50 rounded-full ml-2"
                aria-label="上一个"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </Button>
            )}
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center">
            {hasNext && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onNext}
                className="bg-black/30 text-white hover:bg-black/50 rounded-full mr-2"
                aria-label="下一个"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Button>
            )}
          </div>
        </div>

        <div className="p-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{media.title}</h2>
          
          {media.description && (
            <p className="mt-2 text-gray-700 dark:text-gray-300">{media.description}</p>
          )}

          <div className="mt-4 flex flex-wrap gap-1">
            {media.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-500 dark:text-gray-400">
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
        </div>
      </div>
    </Modal>
  );
};