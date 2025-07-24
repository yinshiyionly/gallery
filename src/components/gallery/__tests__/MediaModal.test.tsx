import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MediaModal } from '../MediaModal';
import { MediaItem } from '@/types';

// Mock the next/image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} src={props.src} alt={props.alt} />;
  },
}));

// Mock document.fullscreenElement and related methods
Object.defineProperty(document, 'fullscreenElement', {
  writable: true,
  value: null,
});

document.documentElement.requestFullscreen = jest.fn().mockResolvedValue(undefined);
document.exitFullscreen = jest.fn().mockResolvedValue(undefined);

describe('MediaModal', () => {
  const mockMedia: MediaItem = {
    _id: '1',
    title: 'Test Image',
    description: 'This is a test image',
    url: '/test-image.jpg',
    thumbnailUrl: '/test-thumbnail.jpg',
    type: 'image',
    tags: ['test', 'image'],
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
    metadata: {
      width: 800,
      height: 600,
      format: 'jpg',
    },
  };

  const mockVideoMedia: MediaItem = {
    ...mockMedia,
    _id: '2',
    title: 'Test Video',
    url: '/test-video.mp4',
    type: 'video',
    metadata: {
      ...mockMedia.metadata,
      duration: 120,
    },
  };

  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    media: mockMedia,
    onPrevious: jest.fn(),
    onNext: jest.fn(),
    hasPrevious: true,
    hasNext: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with image media', () => {
    render(<MediaModal {...defaultProps} />);
    
    expect(screen.getByText('Test Image')).toBeInTheDocument();
    expect(screen.getByText('This is a test image')).toBeInTheDocument();
    expect(screen.getByText('test')).toBeInTheDocument();
    expect(screen.getByText('image')).toBeInTheDocument();
    expect(screen.getByText('类型: 图片')).toBeInTheDocument();
    expect(screen.getByText('尺寸: 800 x 600')).toBeInTheDocument();
    expect(screen.getByText('格式: jpg')).toBeInTheDocument();
    
    // Navigation buttons
    expect(screen.getByLabelText('上一个')).toBeInTheDocument();
    expect(screen.getByLabelText('下一个')).toBeInTheDocument();
    
    // Zoom controls
    expect(screen.getByLabelText('缩小')).toBeInTheDocument();
    expect(screen.getByLabelText('放大')).toBeInTheDocument();
    expect(screen.getByLabelText('重置缩放')).toBeInTheDocument();
    expect(screen.getByLabelText('全屏查看')).toBeInTheDocument();
    
    // Zoom percentage
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('renders correctly with video media', () => {
    render(<MediaModal {...defaultProps} media={mockVideoMedia} />);
    
    expect(screen.getByText('Test Video')).toBeInTheDocument();
    expect(screen.getByText('类型: 视频')).toBeInTheDocument();
    
    // Video element should be present
    const videoElement = screen.getByRole('video');
    expect(videoElement).toBeInTheDocument();
    expect(videoElement).toHaveAttribute('src', '/test-video.mp4');
    expect(videoElement).toHaveAttribute('poster', '/test-thumbnail.jpg');
    
    // No zoom controls for videos
    expect(screen.queryByLabelText('缩小')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('放大')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('重置缩放')).not.toBeInTheDocument();
    
    // Fullscreen control should still be present
    expect(screen.getByLabelText('全屏查看')).toBeInTheDocument();
  });

  it('calls onPrevious when previous button is clicked', () => {
    render(<MediaModal {...defaultProps} />);
    
    const previousButtons = screen.getAllByLabelText('上一个');
    fireEvent.click(previousButtons[0]); // Click the first previous button
    
    expect(defaultProps.onPrevious).toHaveBeenCalledTimes(1);
  });

  it('calls onNext when next button is clicked', () => {
    render(<MediaModal {...defaultProps} />);
    
    const nextButtons = screen.getAllByLabelText('下一个');
    fireEvent.click(nextButtons[0]); // Click the first next button
    
    expect(defaultProps.onNext).toHaveBeenCalledTimes(1);
  });

  it('toggles fullscreen when fullscreen button is clicked', () => {
    render(<MediaModal {...defaultProps} />);
    
    const fullscreenButton = screen.getByLabelText('全屏查看');
    fireEvent.click(fullscreenButton);
    
    expect(document.documentElement.requestFullscreen).toHaveBeenCalledTimes(1);
    
    // Mock fullscreen state
    Object.defineProperty(document, 'fullscreenElement', { value: document.documentElement });
    
    // Re-render to update the component
    render(<MediaModal {...defaultProps} />);
    
    const exitFullscreenButton = screen.getByLabelText('退出全屏');
    fireEvent.click(exitFullscreenButton);
    
    expect(document.exitFullscreen).toHaveBeenCalledTimes(1);
    
    // Reset mock
    Object.defineProperty(document, 'fullscreenElement', { value: null });
  });

  it('handles keyboard navigation', () => {
    render(<MediaModal {...defaultProps} />);
    
    // Left arrow for previous
    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    expect(defaultProps.onPrevious).toHaveBeenCalledTimes(1);
    
    // Right arrow for next
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(defaultProps.onNext).toHaveBeenCalledTimes(1);
    
    // + key for zoom in
    fireEvent.keyDown(window, { key: '+' });
    expect(screen.getByText('125%')).toBeInTheDocument();
    
    // - key for zoom out
    fireEvent.keyDown(window, { key: '-' });
    expect(screen.getByText('100%')).toBeInTheDocument();
    
    // 0 key for reset zoom
    fireEvent.keyDown(window, { key: '+' });
    fireEvent.keyDown(window, { key: '+' });
    expect(screen.getByText('150%')).toBeInTheDocument();
    fireEvent.keyDown(window, { key: '0' });
    expect(screen.getByText('100%')).toBeInTheDocument();
    
    // f key for fullscreen
    fireEvent.keyDown(window, { key: 'f' });
    expect(document.documentElement.requestFullscreen).toHaveBeenCalledTimes(1);
  });

  it('does not render when media is null', () => {
    const { container } = render(<MediaModal {...defaultProps} media={null} />);
    expect(container.firstChild).toBeNull();
  });
});