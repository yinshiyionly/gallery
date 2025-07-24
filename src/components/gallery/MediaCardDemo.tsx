import React, { useState } from 'react';
import { MediaCard } from './MediaCard';
import { MediaItem } from '@/types';

export const MediaCardDemo: React.FC = () => {
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  
  // Sample media items for demonstration
  const sampleMedia: MediaItem[] = [
    {
      _id: '1',
      title: 'Beautiful Mountain Landscape',
      description: 'A stunning view of mountains during sunset',
      url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&auto=format',
      type: 'image',
      tags: ['nature', 'mountains', 'sunset'],
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
      metadata: {
        width: 1920,
        height: 1080,
        format: 'jpg',
      },
    },
    {
      _id: '2',
      title: 'City Skyline at Night',
      description: 'Urban landscape with skyscrapers illuminated at night',
      url: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df',
      thumbnailUrl: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=500&auto=format',
      type: 'image',
      tags: ['city', 'night', 'urban', 'architecture'],
      createdAt: new Date('2023-02-15'),
      updatedAt: new Date('2023-02-15'),
      metadata: {
        width: 1920,
        height: 1080,
        format: 'jpg',
      },
    },
    {
      _id: '3',
      title: 'Drone Footage of Beach',
      description: 'Aerial view of a tropical beach with crystal clear water',
      url: 'https://example.com/video.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&auto=format',
      type: 'video',
      tags: ['beach', 'aerial', 'ocean'],
      createdAt: new Date('2023-03-10'),
      updatedAt: new Date('2023-03-10'),
      metadata: {
        width: 1920,
        height: 1080,
        format: 'mp4',
        duration: 125, // 2:05 minutes
      },
    },
  ];

  const handleMediaClick = (media: MediaItem) => {
    setSelectedMedia(media);
    console.log('Selected media:', media);
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">MediaCard Component Demo</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Different Layout Sizes</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {sampleMedia.map((media) => (
            <MediaCard 
              key={media._id} 
              media={media} 
              onClick={handleMediaClick}
              priority={true}
            />
          ))}
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Priority vs Lazy Loading</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg mb-2 text-gray-700 dark:text-gray-300">Priority Loading</h3>
            <MediaCard media={sampleMedia[0]} priority={true} />
          </div>
          <div>
            <h3 className="text-lg mb-2 text-gray-700 dark:text-gray-300">Lazy Loading</h3>
            <MediaCard media={sampleMedia[1]} priority={false} />
          </div>
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Image vs Video</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg mb-2 text-gray-700 dark:text-gray-300">Image</h3>
            <MediaCard media={sampleMedia[0]} />
          </div>
          <div>
            <h3 className="text-lg mb-2 text-gray-700 dark:text-gray-300">Video</h3>
            <MediaCard media={sampleMedia[2]} />
          </div>
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Custom Styling</h2>
        <MediaCard 
          media={sampleMedia[1]} 
          className="max-w-md mx-auto border-4 border-primary-500" 
        />
      </div>
      
      {selectedMedia && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50" onClick={() => setSelectedMedia(null)}>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-2">{selectedMedia.title}</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">{selectedMedia.description}</p>
            <div className="aspect-video relative mb-4">
              {selectedMedia.type === 'image' ? (
                <img 
                  src={selectedMedia.url} 
                  alt={selectedMedia.title}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full bg-black flex items-center justify-center text-white">
                  Video Player Placeholder
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedMedia.tags.map(tag => (
                <span key={tag} className="px-2 py-1 bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300 rounded">
                  {tag}
                </span>
              ))}
            </div>
            <button 
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
              onClick={() => setSelectedMedia(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};