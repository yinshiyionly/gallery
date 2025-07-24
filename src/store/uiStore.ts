import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Theme, LayoutType } from '@/types';

interface UIState {
  // 主题设置
  theme: Theme;
  
  // 布局设置
  galleryLayout: LayoutType;
  gridColumns: number;
  cardSize: 'small' | 'medium' | 'large';
  
  // 模态框状态
  isModalOpen: boolean;
  modalContent: 'media' | 'settings' | 'search' | null;
  
  // 导航状态
  isMobileMenuOpen: boolean;
  isSearchBarVisible: boolean;
  isSidebarOpen: boolean;
  
  // 用户偏好
  animationsEnabled: boolean;
  autoPlayVideos: boolean;
  showImageInfo: boolean;
  enableKeyboardShortcuts: boolean;
  
  // 加载状态
  isPageLoading: boolean;
  loadingMessage: string;
  
  // 通知系统
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    timestamp: number;
  }>;
  
  // Actions
  setTheme: (theme: Theme) => void;
  
  setGalleryLayout: (layout: LayoutType) => void;
  setGridColumns: (columns: number) => void;
  setCardSize: (size: 'small' | 'medium' | 'large') => void;
  
  toggleModal: (isOpen?: boolean, content?: 'media' | 'settings' | 'search' | null) => void;
  setModalContent: (content: 'media' | 'settings' | 'search' | null) => void;
  
  toggleMobileMenu: (isOpen?: boolean) => void;
  toggleSearchBar: (isVisible?: boolean) => void;
  toggleSidebar: (isOpen?: boolean) => void;
  
  setAnimationsEnabled: (enabled: boolean) => void;
  setAutoPlayVideos: (enabled: boolean) => void;
  setShowImageInfo: (show: boolean) => void;
  setEnableKeyboardShortcuts: (enabled: boolean) => void;
  
  setPageLoading: (isLoading: boolean, message?: string) => void;
  
  addNotification: (notification: Omit<UIState['notifications'][0], 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  
  resetUI: () => void;
}

const initialState = {
  theme: 'system' as Theme,
  galleryLayout: 'grid' as LayoutType,
  gridColumns: 3,
  cardSize: 'medium' as const,
  isModalOpen: false,
  modalContent: null,
  isMobileMenuOpen: false,
  isSearchBarVisible: true,
  isSidebarOpen: false,
  animationsEnabled: true,
  autoPlayVideos: false,
  showImageInfo: true,
  enableKeyboardShortcuts: true,
  isPageLoading: false,
  loadingMessage: '',
  notifications: [],
};

// Create store with persistence
export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setTheme: (theme) => set({ theme }),
      
      setGalleryLayout: (galleryLayout) => set({ galleryLayout }),
      setGridColumns: (gridColumns) => set({ gridColumns }),
      setCardSize: (cardSize) => set({ cardSize }),
      
      toggleModal: (isOpen, content) => set((state) => ({
        isModalOpen: isOpen !== undefined ? isOpen : !state.isModalOpen,
        modalContent: content !== undefined ? content : state.modalContent,
      })),
      
      setModalContent: (modalContent) => set({ modalContent }),
      
      toggleMobileMenu: (isOpen) => set((state) => ({ 
        isMobileMenuOpen: isOpen !== undefined ? isOpen : !state.isMobileMenuOpen 
      })),
      
      toggleSearchBar: (isVisible) => set((state) => ({ 
        isSearchBarVisible: isVisible !== undefined ? isVisible : !state.isSearchBarVisible 
      })),
      
      toggleSidebar: (isOpen) => set((state) => ({ 
        isSidebarOpen: isOpen !== undefined ? isOpen : !state.isSidebarOpen 
      })),
      
      setAnimationsEnabled: (animationsEnabled) => set({ animationsEnabled }),
      setAutoPlayVideos: (autoPlayVideos) => set({ autoPlayVideos }),
      setShowImageInfo: (showImageInfo) => set({ showImageInfo }),
      setEnableKeyboardShortcuts: (enableKeyboardShortcuts) => set({ enableKeyboardShortcuts }),
      
      setPageLoading: (isPageLoading, loadingMessage = '') => set({ 
        isPageLoading, 
        loadingMessage 
      }),
      
      addNotification: (notification) => {
        const id = Date.now().toString();
        const timestamp = Date.now();
        set((state) => ({
          notifications: [...state.notifications, { ...notification, id, timestamp }]
        }));
        
        // 自动移除通知（5秒后）
        setTimeout(() => {
          set((state) => ({
            notifications: state.notifications.filter(n => n.id !== id)
          }));
        }, 5000);
      },
      
      removeNotification: (id) => set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id)
      })),
      
      clearNotifications: () => set({ notifications: [] }),
      
      resetUI: () => set({
        ...initialState,
        notifications: [],
      }),
    }),
    {
      name: 'ui-store',
      partialize: (state) => ({
        theme: state.theme,
        galleryLayout: state.galleryLayout,
        gridColumns: state.gridColumns,
        cardSize: state.cardSize,
        isSearchBarVisible: state.isSearchBarVisible,
        animationsEnabled: state.animationsEnabled,
        autoPlayVideos: state.autoPlayVideos,
        showImageInfo: state.showImageInfo,
        enableKeyboardShortcuts: state.enableKeyboardShortcuts,
      }),
    }
  )
);