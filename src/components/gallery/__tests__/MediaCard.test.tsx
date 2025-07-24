import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MediaCard } from '../MediaCard';
import { MediaItem } from '@/types';

// Mock the next/image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} src={props.src} alt={props.alt} />;
  },
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

describe('MediaCard Component', () => {
  const mockMedia: MediaItem = {
    _id: '1',
    title: 'Test Image',
    description: 'This is a test image',
    url: 'https://example.com/image.jpg',
    thumbnailUrl: 'https://example.com/thumbnail.jpg',
    type: 'image',
    tags: ['test', 'image', 'sample', 'extra'],
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
    metadata: {
      width: 1920,
      height: 1080,
      format: 'jpg',
    },
  };

  const mockVideoMedia: MediaItem = {
    ...mockMedia,
    _id: '2',
    type: 'video',
    metadata: {
      ...mockMedia.metadata,
      duration: 125, // 2:05 minutes
    },
  };

  it('renders the media card with correct title and tags', () => {
    render(<MediaCard media={mockMedia} />);
    
    expect(screen.getByText('Test Image')).toBeInTheDocument();
    expect(screen.getByText('test')).toBeInTheDocument();
    expect(screen.getByText('image')).toBeInTheDocument();
    expect(screen.getByText('sample')).toBeInTheDocument();
    expect(screen.getByText('+1')).toBeInTheDocument(); // Shows +1 for the extra tag
  });

  it('renders description when available', () => {
    render(<MediaCard media={mockMedia} />);
    expect(screen.getByText('This is a test image')).toBeInTheDocument();
  });

  it('shows video play icon for video media', () => {
    render(<MediaCard media={mockVideoMedia} />);
    // Check for the SVG path that represents the play button
    const svgElement = document.querySelector('svg');
    expect(svgElement).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<MediaCard media={mockMedia} onClick={handleClick} />);
    
    fireEvent.click(screen.getByText('Test Image'));
    expect(handleClick).toHaveBeenCalledWith(mockMedia);
  });
});