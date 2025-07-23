import { FilterQuery, UpdateQuery } from 'mongoose';
import Media, { IMedia, MediaDocument } from '../models/Media';
import { connectToDatabase } from '../mongodb';

/**
 * 分页查询参数接口
 */
export interface PaginationOptions {
  page?: number;
  limit?: number;
  sort?: Record<string, 1 | -1>;
}

/**
 * 搜索参数接口
 */
export interface SearchOptions extends PaginationOptions {
  query?: string;
  type?: 'image' | 'video' | 'all';
  tags?: string[];
  isActive?: boolean;
}

/**
 * 分页查询结果接口
 */
export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * 媒体服务类 - 提供媒体资源的 CRUD 操作
 */
export class MediaService {
  /**
   * 创建新的媒体资源
   * @param mediaData 媒体数据
   * @returns 创建的媒体文档
   */
  static async create(mediaData: Omit<IMedia, 'createdAt' | 'updatedAt'>): Promise<MediaDocument> {
    await connectToDatabase();
    return await Media.create(mediaData);
  }

  /**
   * 根据 ID 查找媒体资源
   * @param id 媒体资源 ID
   * @returns 媒体文档或 null
   */
  static async findById(id: string): Promise<MediaDocument | null> {
    await connectToDatabase();
    return await Media.findById(id);
  }

  /**
   * 查找所有媒体资源
   * @param filter 过滤条件
   * @param options 分页和排序选项
   * @returns 分页后的媒体资源列表
   */
  static async findAll(
    filter: FilterQuery<MediaDocument> = {},
    options: PaginationOptions = {}
  ): Promise<PaginatedResult<MediaDocument>> {
    await connectToDatabase();
    
    const { 
      page = 1, 
      limit = 10, 
      sort = { createdAt: -1 } 
    } = options;
    
    const skip = (page - 1) * limit;
    
    const [data, total] = await Promise.all([
      Media.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      Media.countDocuments(filter)
    ]);
    
    return {
      data: data as MediaDocument[],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * 更新媒体资源
   * @param id 媒体资源 ID
   * @param updateData 更新数据
   * @returns 更新后的媒体文档
   */
  static async update(
    id: string, 
    updateData: UpdateQuery<MediaDocument>
  ): Promise<MediaDocument | null> {
    await connectToDatabase();
    return await Media.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
  }

  /**
   * 删除媒体资源
   * @param id 媒体资源 ID
   * @returns 删除操作结果
   */
  static async delete(id: string): Promise<{ deleted: boolean }> {
    await connectToDatabase();
    const result = await Media.findByIdAndDelete(id);
    return { deleted: !!result };
  }

  /**
   * 软删除媒体资源（将 isActive 设置为 false）
   * @param id 媒体资源 ID
   * @returns 更新后的媒体文档
   */
  static async softDelete(id: string): Promise<MediaDocument | null> {
    return await this.update(id, { isActive: false });
  }

  /**
   * 恢复软删除的媒体资源
   * @param id 媒体资源 ID
   * @returns 更新后的媒体文档
   */
  static async restore(id: string): Promise<MediaDocument | null> {
    return await this.update(id, { isActive: true });
  }

  /**
   * 搜索媒体资源
   * @param options 搜索选项
   * @returns 分页后的搜索结果
   */
  static async search(options: SearchOptions = {}): Promise<PaginatedResult<MediaDocument>> {
    const { 
      query, 
      type, 
      tags, 
      isActive = true,
      page = 1,
      limit = 10,
      sort = { createdAt: -1 }
    } = options;
    
    const filter: FilterQuery<MediaDocument> = { isActive };
    
    // 添加类型过滤
    if (type && type !== 'all') {
      filter.type = type;
    }
    
    // 添加标签过滤
    if (tags && tags.length > 0) {
      filter.tags = { $in: tags };
    }
    
    // 添加文本搜索
    if (query && query.trim()) {
      // 使用文本索引进行搜索
      filter.$text = { $search: query };
      
      // 如果没有指定排序，则按相关性排序
      if (!options.sort) {
        sort['score'] = { $meta: 'textScore' };
      }
    }
    
    return await this.findAll(filter, { page, limit, sort });
  }

  /**
   * 按标签获取媒体资源
   * @param tag 标签
   * @param options 分页和排序选项
   * @returns 分页后的媒体资源列表
   */
  static async findByTag(
    tag: string,
    options: PaginationOptions = {}
  ): Promise<PaginatedResult<MediaDocument>> {
    return await this.findAll(
      { tags: tag, isActive: true },
      options
    );
  }

  /**
   * 获取最近添加的媒体资源
   * @param limit 限制数量
   * @returns 媒体资源列表
   */
  static async findRecent(limit: number = 10): Promise<MediaDocument[]> {
    await connectToDatabase();
    return await Media.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }

  /**
   * 批量创建媒体资源
   * @param mediaItems 媒体数据数组
   * @returns 创建的媒体文档数组
   */
  static async bulkCreate(
    mediaItems: Array<Omit<IMedia, 'createdAt' | 'updatedAt'>>
  ): Promise<MediaDocument[]> {
    await connectToDatabase();
    return await Media.insertMany(mediaItems);
  }

  /**
   * 批量更新媒体资源
   * @param updates 更新操作数组，每个元素包含 id 和更新数据
   * @returns 更新操作结果
   */
  static async bulkUpdate(
    updates: Array<{ id: string; data: UpdateQuery<MediaDocument> }>
  ): Promise<{ success: number; failed: number }> {
    await connectToDatabase();
    
    let success = 0;
    let failed = 0;
    
    for (const update of updates) {
      try {
        const result = await Media.findByIdAndUpdate(
          update.id,
          update.data,
          { new: true, runValidators: true }
        );
        
        if (result) {
          success++;
        } else {
          failed++;
        }
      } catch (error) {
        failed++;
      }
    }
    
    return { success, failed };
  }
}

export default MediaService;