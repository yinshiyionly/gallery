import mongoose, { FilterQuery, Model, Document } from 'mongoose';

/**
 * 数据库操作错误类
 */
export class DbError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.name = 'DbError';
    this.statusCode = statusCode;
  }
}

/**
 * 安全执行数据库操作的包装函数
 * @param operation 数据库操作函数
 * @returns 操作结果或抛出格式化的错误
 */
export async function safeDbOperation<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error: any) {
    // 处理 MongoDB 特定错误
    if (error.name === 'ValidationError') {
      throw new DbError(`验证错误: ${error.message}`, 400);
    }
    
    if (error.name === 'CastError') {
      throw new DbError(`无效的 ID 格式: ${error.message}`, 400);
    }
    
    if (error.code === 11000) {
      throw new DbError(`重复键错误: ${JSON.stringify(error.keyValue)}`, 409);
    }
    
    // 重新抛出原始错误或包装为 DbError
    if (error instanceof DbError) {
      throw error;
    }
    
    throw new DbError(`数据库操作失败: ${error.message}`);
  }
}

/**
 * 检查 MongoDB ID 是否有效
 * @param id 要检查的 ID
 * @returns 是否为有效的 MongoDB ID
 */
export function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

/**
 * 构建文本搜索查询
 * @param query 搜索文本
 * @param fields 要搜索的字段
 * @returns 查询对象
 */
export function buildTextSearchQuery<T extends Document>(
  query: string,
  fields: (keyof T)[]
): FilterQuery<T> {
  if (!query || !query.trim()) {
    return {};
  }
  
  // 如果模型有文本索引，使用 $text 搜索
  if (fields.length === 0) {
    return { $text: { $search: query } };
  }
  
  // 否则使用正则表达式搜索指定字段
  const regexQuery = { $regex: query, $options: 'i' };
  
  if (fields.length === 1) {
    return { [fields[0]]: regexQuery };
  }
  
  return {
    $or: fields.map(field => ({ [field]: regexQuery }))
  };
}

/**
 * 构建分页查询参数
 * @param page 页码
 * @param limit 每页数量
 * @returns 分页参数对象
 */
export function buildPaginationParams(page: number = 1, limit: number = 10) {
  const validPage = Math.max(1, page);
  const validLimit = Math.min(100, Math.max(1, limit));
  const skip = (validPage - 1) * validLimit;
  
  return {
    skip,
    limit: validLimit,
    page: validPage
  };
}

/**
 * 执行带分页的查询
 * @param model Mongoose 模型
 * @param filter 过滤条件
 * @param page 页码
 * @param limit 每页数量
 * @param sort 排序条件
 * @returns 分页结果
 */
export async function paginatedQuery<T extends Document>(
  model: Model<T>,
  filter: FilterQuery<T> = {},
  page: number = 1,
  limit: number = 10,
  sort: Record<string, 1 | -1> = { createdAt: -1 }
) {
  const { skip, limit: validLimit, page: validPage } = buildPaginationParams(page, limit);
  
  const [data, total] = await Promise.all([
    model.find(filter).sort(sort).skip(skip).limit(validLimit).lean().exec(),
    model.countDocuments(filter)
  ]);
  
  return {
    data,
    pagination: {
      page: validPage,
      limit: validLimit,
      total,
      totalPages: Math.ceil(total / validLimit)
    }
  };
}

/**
 * 批量操作辅助函数
 * @param items 要操作的项目数组
 * @param operation 对每个项目执行的操作
 * @returns 操作结果统计
 */
export async function bulkOperation<T, R>(
  items: T[],
  operation: (item: T) => Promise<R>
): Promise<{ success: R[]; failed: { item: T; error: Error }[] }> {
  const results = {
    success: [] as R[],
    failed: [] as { item: T; error: Error }[]
  };
  
  for (const item of items) {
    try {
      const result = await operation(item);
      results.success.push(result);
    } catch (error: any) {
      results.failed.push({ item, error });
    }
  }
  
  return results;
}