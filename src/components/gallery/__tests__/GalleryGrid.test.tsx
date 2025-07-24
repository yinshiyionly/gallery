import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { GalleryGrid } from '../GalleryGrid';
import { useUIStore } from '@/store';

// Mock the useUIStore
jest.mock('@/store', () => ({
  useUIStore: jest.fn(),
}));

// Mock the useInfiniteScroll hook
jest.mock('@/hooks', () => ({
  useInfiniteScroll: jest.fn(() => ({ isFetching: false, setHasMore: jest.fn() })),
}));

describe('GalleryGrid', () => {
  const mockItems = [
    {
      _id: '1',
      title: 'Test Image 1',
      description: 'Test description 1',
      url: 'https://example.com/image1.jpg',
      thumbnailUrl: 'https://example.com/thumbnail1.jpg',
      type: 'image',
      tags: ['test', 'image'],
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {
        width: 800,
        height: 600,
        format: 'jpg',
      },
    },
    {
      _id: '2',
      title: 'Test Video 1',
      description: 'Test description 2',
      url: 'https://example.com/video1.mp4',
      thumbnailUrl: 'https://example.com/thumbnail2.jpg',
      type: 'video',
      tags: ['test', 'video'],
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {
        width: 1280,
        height: 720,
        format: 'mp4',
      },
    },
  ];

  const mockSetGalleryLayout = jest.fn();

  beforeEach(() => {
    (useUIStore as jest.Mock).mockReturnValue({
      galleryLayout: 'grid',
      setGalleryLayout: mockSetGalleryLayout,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders grid layout correctly', () => {
    const onLoadMore = jest.fn().mockResolvedValue(undefined);
    const onItemClick = jest.fn();

    render(
      <GalleryGrid
        items={mockItems}
        loading={false}
        hasMore={true}
        onLoadMore={onLoadMore}
        onItemClick={onItemClick}
      />
    );

    // Check if items are rendered
    expect(screen.getByText('Test Image 1')).toBeInTheDocument();
    expect(screen.getByText('Test Video 1')).toBeInTheDocument();
  });

  it('renders empty state when no items', () => {
    const onLoadMore = jest.fn().mockResolvedValue(undefined);
    const onItemClick = jest.fn();

    render(
      <GalleryGrid
        items={[]}
        loading={false}
        hasMore={false}
        onLoadMore={onLoadMore}
        onItemClick={onItemClick}
      />
    );

    // Check if empty state is rendered
    expect(screen.getByText('没有找到媒体内容')).toBeInTheDocument();
  });

  it('toggles layout when layout buttons are clicked', () => {
    const onLoadMore = jest.fn().mockResolvedValue(undefined);
    const onItemClick = jest.fn();

    render(
      <GalleryGrid
        items={mockItems}
        loading={false}
        hasMore={true}
        onLoadMore={onLoadMore}
        onItemClick={onItemClick}
      />
    );

    // Find and click the masonry layout button
    const masonryButton = screen.getAllByRole('button')[1];
    fireEvent.click(masonryButton);

    // Check if setGalleryLayout was called with 'masonry'
    expect(mockSetGalleryLayout).toHaveBeenCalledWith('masonry');
  });

  it('does not show layout controls when layoutControls is false', () => {
    const onLoadMore = jest.fn().mockResolvedValue(undefined);
    const onItemClick = jest.fn();

    render(
      <GalleryGrid
        items={mockItems}
        loading={false}
        hasMore={true}
        onLoadMore={onLoadMore}
        onItemClick={onItemClick}
        layoutControls={false}
      />
    );

    // Check that layout buttons are not rendered
    expect(screen.queryByRole('group')).not.toBeInTheDocument();
  });
});