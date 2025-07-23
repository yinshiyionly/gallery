export interface MediaItem {
  _id: string
  title: string
  description?: string
  url: string
  thumbnailUrl: string
  type: 'image' | 'video'
  tags: string[]
  createdAt: Date
  updatedAt: Date
  metadata: {
    width?: number
    height?: number
    size?: number
    format?: string
  }
}

export interface MediaResponse {
  data: MediaItem[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface SearchParams {
  query?: string
  type?: 'image' | 'video' | 'all'
  tags?: string[]
  page?: number
  limit?: number
  sortBy?: 'createdAt' | 'title'
  sortOrder?: 'asc' | 'desc'
}

export interface ApiError {
  message: string
  code: string
  statusCode: number
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: ApiError
}