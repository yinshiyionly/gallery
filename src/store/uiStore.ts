import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  theme: 'light' | 'dark' | 'system';
  galleryLayout: 'grid' | 'masonry';
  isModalOpen: boolean;
  isMobileMenuOpen: boolean;
  
  // Actions
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setGalleryLayout: (layout: 'grid' | 'masonry') => void;
  toggleModal: (isOpen?: boolean) => void;
  toggleMobileMenu: (isOpen?: boolean) => void;
}

// Create store with persistence
export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'system',
      galleryLayout: 'grid',
      isModalOpen: false,
      isMobileMenuOpen: false,
      
      setTheme: (theme) => set({ theme }),
      setGalleryLayout: (galleryLayout) => set({ galleryLayout }),
      toggleModal: (isOpen) => set((state) => ({ isModalOpen: isOpen !== undefined ? isOpen : !state.isModalOpen })),
      toggleMobileMenu: (isOpen) => set((state) => ({ isMobileMenuOpen: isOpen !== undefined ? isOpen : !state.isMobileMenuOpen })),
    }),
    {
      name: 'ui-store',
      partialize: (state) => ({
        theme: state.theme,
        galleryLayout: state.galleryLayout,
      }),
    }
  )
);