import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { MediaItem } from '@/types';
import { Skeleton } from '../ui/Skeleton';

interface MediaCardProps {
  media: MediaItem;
  onClick?: (media: MediaItem) => void;
  priority?: boolean;
  className?: string;
  layoutId?: string;
}

export const MediaCard: React.FC<MediaCardProps> = ({ 
  media, 
  onClick, 
  priority = false,
  className = '',
  layoutId
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  
  const handleClick = () => {
    if (onClick) {
      onClick(media);
    }
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  return (
    <motion.div
      layoutId={layoutId}
      className={`group relative overflow-hidden rounded-lg bg-white dark:bg-gray-800 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer ${className}`}
      whileHover={{ 
        y: -5,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="aspect-[4/3] relative overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
            <Skeleton className="w-full h-full" />
          </div>
        )}
        <Image
          src={media.thumbnailUrl}
          alt={media.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className={`object-cover transition-all duration-300 ${
            isHovered ? 'scale-110' : 'scale-100'
          } ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          priority={priority}
          loading={priority ? 'eager' : 'lazy'}
          onLoad={handleImageLoad}
          placeholder="blur"
          blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFeAJcI9oYGgAAAABJRU5ErkJggg=="
        />
        {media.type === 'video' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div 
              className="bg-black/50 rounded-full p-3"
              initial={{ opacity: 0.8, scale: 1 }}
              animate={{ 
                opacity: isHovered ? 1 : 0.8,
                scale: isHovered ? 1.1 : 1
              }}
              transition={{ duration: 0.2 }}
            >
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
            </motion.div>
          </div>
        )}
        
        {/* Overlay with metadata on hover */}
        <motion.div 
          className="absolute inset-0 bg-black/40 flex flex-col justify-end p-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {media.metadata && (
            <div className="flex items-center text-white text-xs space-x-2">
              {media.metadata.width && media.metadata.height && (
                <span>{media.metadata.width} × {media.metadata.height}</span>
              )}
              {media.metadata.format && (
                <span className="uppercase">{media.metadata.format}</span>
              )}
              {media.type === 'video' && media.metadata.duration && (
                <span>{Math.floor(media.metadata.duration / 60)}:{(media.metadata.duration % 60).toString().padStart(2, '0')}</span>
              )}
            </div>
          )}
        </motion.div>
      </div>
      
      <div className="p-3">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">{media.title}</h3>
        {media.description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{media.description}</p>
        )}
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