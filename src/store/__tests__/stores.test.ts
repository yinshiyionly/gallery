/**
 * 基础的 store 测试
 * 这些测试验证 store 的基本功能是否正常工作
 */

import { useMediaStore } from '../mediaStore';
import { useSearchStore } from '../searchStore';
import { useUIStore } from '../uiStore';
import { useThemeStore } from '../useThemeStore';
import type { MediaItem } from '@/types';

// Mock 媒体数据
const mockMediaItem: MediaItem = {
  _id: '1',
  title: 'Test Image',
  description: 'A test image',
  url: 'https://example.com/image.jpg',
  thumbnailUrl: 'https://example.com/thumb.jpg',
  type: 'image',
  tags: ['test', 'image'],
  createdAt: new Date(),
  updatedAt: new Date(),
  metadata: {
    width: 800,
    height: 600,
    size: 1024,
    format: 'jpg',
  },
};

describe('Media Store', () => {
  beforeEach(() => {
    useMediaStore.getState().reset();
  });

  test('should initialize with empty state', () => {
    const state = useMediaStore.getState();
    expect(state.items).toEqual([]);
    expect(state.currentItem).toBeNull();
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  test('should set items correctly', () => {
    const { setItems } = useMediaStore.getState();
    setItems([mockMediaItem]);
    
    const state = useMediaStore.getState();
    expect(state.items).toHaveLength(1);
    expect(state.items[0]).toEqual(mockMediaItem);
  });

  test('should add items correctly', () => {
    const { setItems, addItems } = useMediaStore.getState();
    setItems([mockMediaItem]);
    
    const newItem = { ...mockMediaItem, _id: '2', title: 'Second Image' };
    addItems([newItem]);
    
    const state = useMediaStore.getState();
    expect(state.items).toHaveLength(2);
    expect(state.items[1]).toEqual(newItem);
  });

  test('should update item correctly', () => {
    const { setItems, updateItem } = useMediaStore.getState();
    setItems([mockMediaItem]);
    
    updateItem('1', { title: 'Updated Title' });
    
    const state = useMediaStore.getState();
    expect(state.items[0].title).toBe('Updated Title');
  });

  test('should handle selection correctly', () => {
    const { setItems, toggleSelectedItem, clearSelection } = useMediaStore.getState();
    setItems([mockMediaItem]);
    
    toggleSelectedItem(mockMediaItem);
    expect(useMediaStore.getState().selectedItems).toHaveLength(1);
    
    toggleSelectedItem(mockMediaItem);
    expect(useMediaStore.getState().selectedItems).toHaveLength(0);
    
    toggleSelectedItem(mockMediaItem);
    clearSelection();
    expect(useMediaStore.getState().selectedItems).toHaveLength(0);
  });
});

describe('Search Store', () => {
  beforeEach(() => {
    useSearchStore.getState().resetSearch();
  });

  test('should initialize with default state', () => {
    const state = useSearchStore.getState();
    expect(state.query).toBe('');
    expect(state.searchHistory).toEqual([]);
    expect(state.isSearching).toBe(false);
  });

  test('should set query correctly', () => {
    const { setQuery } = useSearchStore.getState();
    setQuery('test query');
    
    const state = useSearchStore.getState();
    expect(state.query).toBe('test query');
  });

  test('should manage search history correctly', () => {
    const { addToHistory, clearHistory } = useSearchStore.getState();
    
    addToHistory('first search');
    addToHistory('second search');
    addToHistory('first search'); // Should move to top
    
    let state = useSearchStore.getState();
    expect(state.searchHistory).toEqual(['first search', 'second search']);
    
    clearHistory();
    state = useSearchStore.getState();
    expect(state.searchHistory).toEqual([]);
  });

  test('should manage recent tags correctly', () => {
    const { addRecentTag, removeRecentTag } = useSearchStore.getState();
    
    addRecentTag('tag1');
    addRecentTag('tag2');
    addRecentTag('tag1'); // Should move to top
    
    let state = useSearchStore.getState();
    expect(state.recentTags).toEqual(['tag1', 'tag2']);
    
    removeRecentTag('tag1');
    state = useSearchStore.getState();
    expect(state.recentTags).toEqual(['tag2']);
  });
});

describe('UI Store', () => {
  beforeEach(() => {
    useUIStore.getState().resetUI();
  });

  test('should initialize with default state', () => {
    const state = useUIStore.getState();
    expect(state.theme).toBe('system');
    expect(state.galleryLayout).toBe('grid');
    expect(state.isModalOpen).toBe(false);
    expect(state.animationsEnabled).toBe(true);
  });

  test('should toggle modal correctly', () => {
    const { toggleModal } = useUIStore.getState();
    
    toggleModal();
    expect(useUIStore.getState().isModalOpen).toBe(true);
    
    toggleModal();
    expect(useUIStore.getState().isModalOpen).toBe(false);
    
    toggleModal(true, 'media');
    const state = useUIStore.getState();
    expect(state.isModalOpen).toBe(true);
    expect(state.modalContent).toBe('media');
  });

  test('should manage notifications correctly', () => {
    const { addNotification, removeNotification, clearNotifications } = useUIStore.getState();
    
    addNotification({ type: 'success', message: 'Test message' });
    
    let state = useUIStore.getState();
    expect(state.notifications).toHaveLength(1);
    expect(state.notifications[0].message).toBe('Test message');
    
    const notificationId = state.notifications[0].id;
    removeNotification(notificationId);
    
    state = useUIStore.getState();
    expect(state.notifications).toHaveLength(0);
    
    addNotification({ type: 'error', message: 'Error message' });
    clearNotifications();
    
    state = useUIStore.getState();
    expect(state.notifications).toHaveLength(0);
  });
});

describe('Theme Store', () => {
  beforeEach(() => {
    useThemeStore.setState({ theme: 'system', systemTheme: 'light', resolvedTheme: 'light' });
  });

  test('should initialize with system theme', () => {
    const state = useThemeStore.getState();
    expect(state.theme).toBe('system');
    expect(state.resolvedTheme).toBe('light');
  });

  test('should set theme correctly', () => {
    const { setTheme } = useThemeStore.getState();
    
    setTheme('dark');
    expect(useThemeStore.getState().theme).toBe('dark');
    expect(useThemeStore.getState().resolvedTheme).toBe('dark');
    
    setTheme('light');
    expect(useThemeStore.getState().theme).toBe('light');
    expect(useThemeStore.getState().resolvedTheme).toBe('light');
  });

  test('should resolve system theme correctly', () => {
    const { setSystemTheme, updateResolvedTheme } = useThemeStore.getState();
    
    // 设置为系统主题模式
    useThemeStore.setState({ theme: 'system' });
    
    setSystemTheme('dark');
    updateResolvedTheme();
    expect(useThemeStore.getState().resolvedTheme).toBe('dark');
    
    setSystemTheme('light');
    updateResolvedTheme();
    expect(useThemeStore.getState().resolvedTheme).toBe('light');
  });
});