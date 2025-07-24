# Custom Hooks Documentation

This directory contains custom React hooks for the multi-platform gallery application. These hooks provide data fetching, caching, error handling, and infinite scrolling functionality.

## Hooks Overview

### useMedia

A hook for fetching and managing media data with caching and error handling.

**Features:**
- Data fetching with pagination
- Caching with configurable timeout
- Error handling with retry mechanism
- Integration with Zustand store
- Support for search parameters

**Usage:**
```typescript
import { useMedia } from '@/hooks';

const MyComponent = () => {
  const {
    media,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    retry
  } = useMedia(
    { query: 'nature', type: 'image' }, // search params
    { 
      limit: 20,
      enableCache: true,
      cacheTimeout: 300000 // 5 minutes
    }
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message} <button onClick={retry}>Retry</button></div>;

  return (
    <div>
      {media.map(item => <MediaCard key={item._id} item={item} />)}
      {hasMore && <button onClick={loadMore}>Load More</button>}
    </div>
  );
};
```

### useSearch

A hook for handling search functionality with debouncing, caching, and history.

**Features:**
- Debounced search with configurable delay
- Search history management
- Caching with configurable timeout
- Error handling and retry
- Integration with search store

**Usage:**
```typescript
import { useSearch } from '@/hooks';

const SearchComponent = () => {
  const {
    query,
    setQuery,
    results,
    loading,
    error,
    hasMore,
    loadMore,
    searchHistory,
    clearResults
  } = useSearch({
    debounceMs: 300,
    enableCache: true
  });

  return (
    <div>
      <input 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search media..."
      />
      
      {loading && <div>Searching...</div>}
      {error && <div>Error: {error.message}</div>}
      
      <div>
        {results.map(item => <MediaCard key={item._id} item={item} />)}
      </div>
      
      {hasMore && <button onClick={loadMore}>Load More Results</button>}
    </div>
  );
};
```

### useInfiniteScroll

A hook for implementing infinite scroll functionality with error handling and debouncing.

**Features:**
- Intersection Observer based detection
- Debounced loading to prevent rapid calls
- Error handling with retry capability
- Configurable threshold and root margin
- Cleanup on unmount

**Usage:**
```typescript
import { useInfiniteScroll } from '@/hooks';
import { useRef } from 'react';

const InfiniteScrollComponent = () => {
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const { media, loadMore } = useMedia();
  
  const { isFetching, error, retry } = useInfiniteScroll(
    loadMoreRef,
    loadMore,
    {
      threshold: 0.1,
      rootMargin: '100px',
      debounceMs: 100
    }
  );

  return (
    <div>
      {media.map(item => <MediaCard key={item._id} item={item} />)}
      
      <div ref={loadMoreRef}>
        {isFetching && <div>Loading more...</div>}
        {error && (
          <div>
            Error loading more: {error.message}
            <button onClick={retry}>Retry</button>
          </div>
        )}
      </div>
    </div>
  );
};
```

## Implementation Details

### Caching Strategy

All hooks implement intelligent caching:
- **Memory-based caching** with configurable timeout
- **Cache keys** generated from parameters
- **Cache invalidation** on parameter changes
- **Stale-while-revalidate** pattern for better UX

### Error Handling

Comprehensive error handling includes:
- **Network errors** with retry mechanism
- **HTTP errors** with status code information
- **API errors** with server-provided messages
- **Timeout handling** for long-running requests

### Performance Optimizations

- **Request deduplication** to prevent duplicate calls
- **Debouncing** for search and scroll events
- **Request cancellation** using AbortController
- **Memory cleanup** on component unmount

### Store Integration

Hooks integrate with Zustand stores for:
- **Global state management** across components
- **Persistent storage** for user preferences
- **Cache sharing** between hook instances
- **State synchronization** across the app

## Testing

Each hook includes comprehensive unit tests covering:
- Basic functionality and state management
- Error scenarios and recovery
- Caching behavior and invalidation
- Integration with stores and external APIs
- Edge cases and cleanup

Run tests with:
```bash
npm test src/hooks/__tests__
```

## Requirements Fulfilled

This implementation fulfills the following requirements:

**Requirement 3.1** - Media browsing functionality:
- `useMedia` hook provides efficient media data fetching
- Supports pagination and infinite loading
- Integrates with search and filtering

**Requirement 3.4** - Pagination and infinite scroll:
- `useInfiniteScroll` hook implements smooth infinite scrolling
- `useMedia` supports both pagination and infinite loading modes
- Optimized performance with debouncing and caching

**Requirement 7.2** - Performance optimization:
- Intelligent caching reduces API calls
- Request deduplication prevents redundant requests
- Memory management and cleanup prevent leaks
- Debouncing optimizes user interactions