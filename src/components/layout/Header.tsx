import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { SearchInput } from '../ui/SearchInput';
import { ThemeToggle } from '../ui/ThemeToggle';
import { cn } from '@/lib/utils';

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle search
  const handleSearch = (query: string) => {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
        isScrolled 
          ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-sm' 
          : 'bg-transparent',
        className
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
              多端画廊
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              href="/"
              className={cn(
                'text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors',
                router.pathname === '/' && 'text-primary-600 dark:text-primary-400 font-medium'
              )}
            >
              首页
            </Link>
            <Link 
              href="/gallery"
              className={cn(
                'text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors',
                router.pathname === '/gallery' && 'text-primary-600 dark:text-primary-400 font-medium'
              )}
            >
              画廊
            </Link>
          </nav>

          {/* Search and Theme Toggle */}
          <div className="hidden md:flex items-center space-x-3">
            <div className="w-64">
              <SearchInput 
                placeholder="搜索媒体..."
                onSearch={handleSearch}
              />
            </div>
            <ThemeToggle />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <button
              className="p-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 shadow-lg">
          <div className="container mx-auto px-4 py-3 space-y-3">
            <div className="w-full">
              <SearchInput 
                placeholder="搜索媒体..."
                onSearch={(query) => {
                  handleSearch(query);
                  setIsMobileMenuOpen(false);
                }}
              />
            </div>
            <nav className="flex flex-col space-y-3">
              <Link 
                href="/"
                className={cn(
                  'px-3 py-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors',
                  router.pathname === '/' && 'bg-gray-100 dark:bg-gray-800 text-primary-600 dark:text-primary-400 font-medium'
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                首页
              </Link>
              <Link 
                href="/gallery"
                className={cn(
                  'px-3 py-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors',
                  router.pathname === '/gallery' && 'bg-gray-100 dark:bg-gray-800 text-primary-600 dark:text-primary-400 font-medium'
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                画廊
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export { Header };