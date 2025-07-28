# HD Cover Management Design Document

## Overview

The HD Cover Management feature provides a comprehensive system for managing high-definition cover images within the multi-platform gallery application. This feature integrates with the existing MongoDB infrastructure and follows the established architectural patterns of the application. The system manages cover images with both original and HD versions, storing metadata in the "hd_cover" collection within the "emby" database.

The design leverages the existing Next.js architecture, Mongoose ODM, and service layer patterns already established in the codebase. It provides both programmatic APIs and React components for managing and displaying HD cover images.

## Architecture

### Database Layer
- **Database**: `emby` (separate from the main application database)
- **Collection**: `hd_cover`
- **Schema Validation**: MongoDB native validation with JSON Schema
- **Connection**: Separate connection utility for the emby database

### Service Layer
- **HdCoverService**: Core business logic for CRUD operations
- **HdCoverRepository**: Data access layer with MongoDB operations
- **ValidationService**: Input validation and sanitization

### API Layer
- **REST Endpoints**: `/api/hd-covers/*` for HTTP operations
- **Error Handling**: Consistent error responses following existing patterns
- **Middleware**: Request validation and authentication

### Frontend Layer
- **React Components**: Reusable components for displaying HD covers
- **Custom Hooks**: `useHdCover` for state management
- **Store Integration**: Zustand store for caching and state management

## Components and Interfaces

### Data Models

```typescript
// HD Cover Document Interface
export interface HdCover {
  _id?: string;
  code: string;
  origin_url: string;
  hd_url: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Input Interfaces
export interface CreateHdCoverInput {
  code: string;
  origin_url: string;
  hd_url: string;
}

export interface UpdateHdCoverInput {
  origin_url?: string;
  hd_url?: string;
}

export interface BulkImportInput {
  covers: CreateHdCoverInput[];
}

// Response Interfaces
export interface HdCoverResponse {
  success: boolean;
  data?: HdCover;
  error?: string;
}

export interface BulkImportResponse {
  success: boolean;
  results: {
    successful: number;
    failed: number;
    errors: Array<{ code: string; error: string }>;
  };
}
```

### Core Services

#### HdCoverService
```typescript
export class HdCoverService {
  static async create(data: CreateHdCoverInput): Promise<HdCover>
  static async findByCode(code: string): Promise<HdCover | null>
  static async update(code: string, data: UpdateHdCoverInput): Promise<HdCover | null>
  static async upsert(data: CreateHdCoverInput): Promise<HdCover>
  static async delete(code: string): Promise<boolean>
  static async bulkImport(data: BulkImportInput): Promise<BulkImportResponse>
  static async findAll(options?: PaginationOptions): Promise<PaginatedResult<HdCover>>
}
```

#### Database Connection
```typescript
export class EmbyDatabase {
  static async connect(): Promise<mongoose.Connection>
  static async disconnect(): Promise<void>
  static isConnected(): boolean
}
```

### API Endpoints

- `GET /api/hd-covers/:code` - Retrieve cover by code
- `POST /api/hd-covers` - Create new cover
- `PUT /api/hd-covers/:code` - Update existing cover
- `DELETE /api/hd-covers/:code` - Delete cover
- `POST /api/hd-covers/bulk-import` - Bulk import covers
- `GET /api/hd-covers` - List all covers with pagination

### React Components

#### HdCoverImage Component
```typescript
interface HdCoverImageProps {
  code: string;
  alt?: string;
  className?: string;
  fallbackSrc?: string;
  onError?: (error: Error) => void;
  onLoad?: () => void;
}

export const HdCoverImage: React.FC<HdCoverImageProps>
```

#### HdCoverManager Component
```typescript
interface HdCoverManagerProps {
  onImport?: (result: BulkImportResponse) => void;
  onError?: (error: Error) => void;
}

export const HdCoverManager: React.FC<HdCoverManagerProps>
```

### Custom Hooks

#### useHdCover Hook
```typescript
interface UseHdCoverOptions {
  code: string;
  enabled?: boolean;
}

interface UseHdCoverReturn {
  cover: HdCover | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export const useHdCover: (options: UseHdCoverOptions) => UseHdCoverReturn
```

## Data Models

### MongoDB Schema
The HD Cover collection uses MongoDB's native JSON Schema validation:

```javascript
{
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["code", "origin_url", "hd_url"],
      properties: {
        code: {
          bsonType: "string",
          description: "Unique identifier code for the cover image"
        },
        origin_url: {
          bsonType: "string",
          description: "Original image URL"
        },
        hd_url: {
          bsonType: "string", 
          description: "High-definition image URL"
        }
      }
    }
  },
  validationAction: "error"
}
```

### Mongoose Model
```typescript
const HdCoverSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  origin_url: {
    type: String,
    required: true,
    validate: {
      validator: (v: string) => /^https?:\/\/.+/.test(v),
      message: 'origin_url must be a valid HTTP/HTTPS URL'
    }
  },
  hd_url: {
    type: String,
    required: true,
    validate: {
      validator: (v: string) => /^https?:\/\/.+/.test(v),
      message: 'hd_url must be a valid HTTP/HTTPS URL'
    }
  }
}, {
  timestamps: true,
  collection: 'hd_cover'
});
```

## Error Handling

### Validation Errors
- **Code Validation**: Non-empty string, unique constraint
- **URL Validation**: Valid HTTP/HTTPS format for both origin_url and hd_url
- **Required Fields**: All three fields (code, origin_url, hd_url) must be present

### Runtime Errors
- **Database Connection**: Handle connection failures to emby database
- **Network Errors**: Handle image loading failures with fallback mechanisms
- **Duplicate Keys**: Handle unique constraint violations gracefully

### Error Response Format
```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}
```

## Testing Strategy

### Unit Tests
- **Service Layer**: Test all CRUD operations and business logic
- **Validation**: Test input validation and error handling
- **Database Operations**: Test MongoDB operations with test database

### Integration Tests
- **API Endpoints**: Test all REST endpoints with various scenarios
- **Database Integration**: Test actual MongoDB operations
- **Error Scenarios**: Test error handling and edge cases

### Component Tests
- **HdCoverImage**: Test image loading, fallback behavior, and error handling
- **HdCoverManager**: Test bulk import functionality and user interactions
- **Custom Hooks**: Test state management and API integration

### Test Structure
```
src/lib/services/__tests__/
  - hdCoverService.test.ts
src/lib/models/__tests__/
  - HdCover.test.ts
src/pages/api/__tests__/
  - hd-covers.test.ts
src/components/__tests__/
  - HdCoverImage.test.ts
  - HdCoverManager.test.ts
src/hooks/__tests__/
  - useHdCover.test.ts
```

### Test Data Management
- **Test Database**: Separate test database for emby connection
- **Fixtures**: Predefined test data for consistent testing
- **Cleanup**: Automatic cleanup after each test run

## Performance Considerations

### Caching Strategy
- **In-Memory Cache**: Cache frequently accessed covers in Zustand store
- **Browser Cache**: Leverage HTTP caching headers for image resources
- **Database Indexing**: Index on code field for fast lookups

### Image Loading Optimization
- **Progressive Loading**: Load HD images with fallback to original
- **Lazy Loading**: Implement lazy loading for cover images
- **Error Recovery**: Automatic retry mechanism for failed image loads

### Bulk Operations
- **Batch Processing**: Process bulk imports in chunks to avoid memory issues
- **Progress Tracking**: Provide progress feedback for large imports
- **Error Isolation**: Continue processing even if individual items fail