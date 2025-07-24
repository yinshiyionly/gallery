import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

export interface SearchHistoryItem {
  id: string;
  text: string;
  timestamp: number;
}

export interface SearchSuggestion {
  id: string;
  text: string;
  type?: 'history' | 'suggestion' | 'trending';
}

interface SearchSuggestionsProps {
  isOpen: boolean;
  searchValue: string;
  suggestions: SearchSuggestion[];
  history: SearchHistoryItem[];
  onSelectSuggestion: (text: string) => void;
  onClearHistory?: () => void;
  onRemoveHistoryItem?: (id: string) => void;
  className?: string;
  maxHeight?: string;
}

export const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({
  isOpen,
  searchValue,
  suggestions,
  history,
  onSelectSuggestion,
  onClearHistory,
  onRemoveHistoryItem,
  className,
  maxHeight = '300px',
}) => {
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset highlighted index when suggestions change or dropdown opens/closes
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [isOpen, suggestions, history, searchValue]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      const itemsCount = suggestions.length + (history.length > 0 ? history.length : 0);
      
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex((prev) => (prev < itemsCount - 1 ? prev + 1 : 0));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : itemsCount - 1));
          break;
        case 'Enter':
          if (highlightedIndex >= 0) {
            e.preventDefault();
            const allItems = [...history, ...suggestions];
            if (highlightedIndex < allItems.length) {
              onSelectSuggestion(allItems[highlightedIndex].text);
            }
          }
          break;
        case 'Escape':
          e.preventDefault();
          setHighlightedIndex(-1);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, highlightedIndex, suggestions, history, onSelectSuggestion]);

  // Scroll to highlighted item
  useEffect(() => {
    if (highlightedIndex >= 0 && containerRef.current) {
      const highlightedElement = containerRef.current.querySelector(
        `[data-index="${highlightedIndex}"]`
      ) as HTMLElement;
      
      if (highlightedElement) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const elementRect = highlightedElement.getBoundingClientRect();
        
        if (elementRect.bottom > containerRect.bottom) {
          containerRef.current.scrollTop += elementRect.bottom - containerRect.bottom;
        } else if (elementRect.top < containerRect.top) {
          containerRef.current.scrollTop -= containerRect.top - elementRect.top;
        }
      }
    }
  }, [highlightedIndex]);

  if (!isOpen) return null;

  const showHistory = history.length > 0 && !searchValue;
  const showSuggestions = suggestions.length > 0;
  const noResults = !showHistory && !showSuggestions;

  return (
    <div
      className={cn(
        'absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg dark:bg-gray-800 dark:border-gray-700',
        className
      )}
    >
      <div
        ref={containerRef}
        className="overflow-y-auto"
        style={{ maxHeight }}
      >
        {showHistory && (
          <div className="p-2">
            <div className="flex items-center justify-between px-3 py-1.5">
              <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400">搜索历史</h3>
              {onClearHistory && (
                <button
                  type="button"
                  className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  onClick={onClearHistory}
                >
                  清除
                </button>
              )}
            </div>
            {history.map((item, index) => (
              <div
                key={item.id}
                data-index={index}
                className={cn(
                  'flex items-center justify-between px-3 py-2 text-sm cursor-pointer',
                  highlightedIndex === index
                    ? 'bg-gray-100 dark:bg-gray-700'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-750'
                )}
                onClick={() => onSelectSuggestion(item.text)}
              >
                <div className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-2 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  <span>{item.text}</span>
                </div>
                {onRemoveHistoryItem && (
                  <button
                    type="button"
                    className="p-1 text-gray-400 rounded-full hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-gray-600 dark:hover:text-gray-300"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveHistoryItem(item.id);
                    }}
                  >
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      ></path>
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {showSuggestions && (
          <div className="p-2">
            {searchValue && (
              <div className="px-3 py-1.5">
                <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400">搜索建议</h3>
              </div>
            )}
            {suggestions.map((suggestion, index) => {
              const actualIndex = showHistory ? history.length + index : index;
              return (
                <div
                  key={suggestion.id}
                  data-index={actualIndex}
                  className={cn(
                    'flex items-center px-3 py-2 text-sm cursor-pointer',
                    highlightedIndex === actualIndex
                      ? 'bg-gray-100 dark:bg-gray-700'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-750'
                  )}
                  onClick={() => onSelectSuggestion(suggestion.text)}
                >
                  <svg
                    className="w-4 h-4 mr-2 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    ></path>
                  </svg>
                  <span>
                    {searchValue ? (
                      <>
                        {suggestion.text.split(new RegExp(`(${searchValue})`, 'i')).map((part, i) =>
                          part.toLowerCase() === searchValue.toLowerCase() ? (
                            <strong key={i} className="font-medium text-primary-600 dark:text-primary-400">
                              {part}
                            </strong>
                          ) : (
                            <span key={i}>{part}</span>
                          )
                        )}
                      </>
                    ) : (
                      suggestion.text
                    )}
                  </span>
                  {suggestion.type === 'trending' && (
                    <span className="ml-2 px-1.5 py-0.5 text-xs font-medium text-primary-600 bg-primary-100 rounded dark:bg-primary-900 dark:text-primary-400">
                      热门
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {noResults && searchValue && (
          <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
            没有找到与 "{searchValue}" 相关的结果
          </div>
        )}
      </div>
    </div>
  );
};