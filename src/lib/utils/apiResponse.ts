import { NextApiResponse } from 'next';

/**
 * API 响应接口
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    statusCode: number;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * 发送成功响应
 * @param res Next.js 响应对象
 * @param data 响应数据
 * @param statusCode HTTP 状态码
 */
export function sendSuccess<T>(
  res: NextApiResponse,
  data: T,
  statusCode: number = 200
): void {
  const response: ApiResponse<T> = {
    success: true,
    data
  };
  
  res.status(statusCode).json(response);
}

/**
 * 发送带分页的成功响应
 * @param res Next.js 响应对象
 * @param data 响应数据
 * @param pagination 分页信息
 * @param statusCode HTTP 状态码
 */
export function sendPaginatedSuccess<T>(
  res: NextApiResponse,
  data: T,
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  },
  statusCode: number = 200
): void {
  const response: ApiResponse<T> = {
    success: true,
    data,
    pagination
  };
  
  res.status(statusCode).json(response);
}

/**
 * 发送错误响应
 * @param res Next.js 响应对象
 * @param message 错误消息
 * @param statusCode HTTP 状态码
 * @param code 错误代码
 */
export function sendError(
  res: NextApiResponse,
  message: string,
  statusCode: number = 500,
  code?: string
): void {
  const response: ApiResponse = {
    success: false,
    error: {
      message,
      statusCode,
      ...(code && { code })
    }
  };
  
  res.status(statusCode).json(response);
}

/**
 * 发送验证错误响应
 * @param res Next.js 响应对象
 * @param message 错误消息
 */
export function sendValidationError(
  res: NextApiResponse,
  message: string
): void {
  sendError(res, message, 400, 'VALIDATION_ERROR');
}

/**
 * 发送未找到错误响应
 * @param res Next.js 响应对象
 * @param message 错误消息
 */
export function sendNotFoundError(
  res: NextApiResponse,
  message: string = 'Resource not found'
): void {
  sendError(res, message, 404, 'NOT_FOUND');
}

/**
 * 发送方法不允许错误响应
 * @param res Next.js 响应对象
 * @param allowedMethods 允许的 HTTP 方法
 */
export function sendMethodNotAllowed(
  res: NextApiResponse,
  allowedMethods: string[]
): void {
  res.setHeader('Allow', allowedMethods.join(', ').toUpperCase());
  sendError(
    res,
    `Method not allowed. Use ${allowedMethods.join(', ').toUpperCase()}`,
    405,
    'METHOD_NOT_ALLOWED'
  );
}