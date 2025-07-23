import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { MediaItem } from '@/types';

interface MediaCardProps {
  media: MediaItem;
  onClick?: (media: MediaItem) => void;
  priority?: boolean;
}

export const MediaCard: React.FC<MediaCardProps> = ({ media, onClick, priority = false }) => {
  const handleClick = () => {
    if (onClick) {
      onClick(media);
    }
  };

  return (
    <motion.div
      className="group relative overflow-hidden rounded-lg bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      layout
    >
      <div className="aspect-[4/3] relative overflow-hidden">
        <Image
          src={media.thumbnailUrl}
          alt={media.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          priority={priority}
        />
        {media.type === 'video' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-black/50 rounded-full p-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-white"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">{media.title}</h3>
        <div className="mt-2 flex flex-wrap gap-1">
          {media.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300"
            >
              {tag}
            </span>
          ))}
          {media.tags.length > 3 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
              +{media.tags.length - 3}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};