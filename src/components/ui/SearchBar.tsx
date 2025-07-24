import React, { useState, useEffect, useRef } from 'react';
import { cn, debounce } from '@/lib/utils';
import { SearchInput } from './SearchInput';
import { SearchSuggestions, SearchHistoryItem, SearchSuggestion } from './SearchSuggestions';

const MAX_HISTORY_ITEMS = 10;

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  getSuggestions?: (query: string) => Promise<SearchSuggestion[]>;
  className?: string;
  autoFocus?: boolean;
  debounceTime?: number;
  persistHistory?: boolean;
  historyStorageKey?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = '搜索...',
  onSearch,
  getSuggestions,
  className,
  autoFocus = false,
  debounceTime = 300,
  persistHistory = true,
  historyStorageKey = 'gallery-search-history',
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load search history from localStorage
  useEffect(() => {
    if (persistHistory) {
      try {
        const savedHistory = localStorage.getItem(historyStorageKey);
        if (savedHistory) {
          setHistory(JSON.parse(savedHistory));
        }
      } catch (error) {
        console.error('Failed to load search history:', error);
      }
    }
  }, [persistHistory, historyStorageKey]);

  // Save search history to localStorage
  useEffect(() => {
    if (persistHistory && history.length > 0) {
      try {
        localStorage.setItem(historyStorageKey, JSON.stringify(history));
      } catch (error) {
        console.error('Failed to save search history:', error);
      }
    }
  }, [history, persistHistory, historyStorageKey]);

  // Fetch suggestions when search value changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!getSuggestions || !searchValue.trim()) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const results = await getSuggestions(searchValue);
        setSuggestions(results);
      } catch (error) {
        console.error('Failed to fetch suggestions:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debouncedFetch = debounce(fetchSuggestions, debounceTime);
    debouncedFetch();

    return () => {
      // No need to cancel debounce as it's handled by the debounce function
    };
  }, [searchValue, getSuggestions, debounceTime]);

  // Close suggestions dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = (query: string) => {
    if (!query.trim()) return;
    
    onSearch(query);
    
    // Add to history
    const newHistoryItem: SearchHistoryItem = {
      id: Date.now().toString(),
      text: query,
      timestamp: Date.now(),
    };
    
    // Remove duplicates and limit history size
    setHistory((prev) => {
      const filteredHistory = prev.filter((item) => item.text !== query);
      return [newHistoryItem, ...filteredHistory].slice(0, MAX_HISTORY_ITEMS);
    });
    
    setIsFocused(false);
  };

  const handleInputChange = (value: string) => {
    setSearchValue(value);
    if (value.trim() === '') {
      setSuggestions([]);
    }
  };

  const handleInputFocus = () => {
    setIsFocused(true);
  };

  const handleSelectSuggestion = (text: string) => {
    setSearchValue(text);
    handleSearch(text);
  };

  const handleClearHistory = () => {
    setHistory([]);
    if (persistHistory) {
      localStorage.removeItem(historyStorageKey);
    }
  };

  const handleRemoveHistoryItem = (id: string) => {
    setHistory((prev) => {
      const newHistory = prev.filter((item) => item.id !== id);
      if (persistHistory) {
        localStorage.setItem(historyStorageKey, JSON.stringify(newHistory));
      }
      return newHistory;
    });
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <SearchInput
        placeholder={placeholder}
        value={searchValue}
        onChange={handleInputChange}
        onSearch={handleSearch}
        autoFocus={autoFocus}
        debounceTime={debounceTime}
        showSearchIcon={true}
        showClearButton={true}
        className="w-full"
        onFocus={handleInputFocus}
      />
      
      {isLoading && (
        <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin h-4 w-4 border-2 border-primary-500 border-t-transparent rounded-full" />
        </div>
      )}
      
      <SearchSuggestions
        isOpen={isFocused}
        searchValue={searchValue}
        suggestions={suggestions}
        history={history}
        onSelectSuggestion={handleSelectSuggestion}
        onClearHistory={handleClearHistory}
        onRemoveHistoryItem={handleRemoveHistoryItem}
      />
    </div>
  );
};