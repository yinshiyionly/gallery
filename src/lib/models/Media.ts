import mongoose, { Document, Schema } from 'mongoose';

/**
 * 媒体资源元数据接口
 */
export interface MediaMetadata {
  width?: number;
  height?: number;
  size?: number;
  format?: string;
}

/**
 * 媒体资源接口
 */
export interface IMedia {
  title: string;
  description?: string;
  url: string;
  thumbnailUrl: string;
  type: 'image' | 'video';
  tags: string[];
  metadata: MediaMetadata;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 媒体资源文档接口 (包含 Mongoose 文档方法)
 */
export interface MediaDocument extends IMedia, Document {}

/**
 * 媒体资源 Schema
 */
const MediaSchema = new Schema<MediaDocument>(
  {
    title: {
      type: String,
      required: [true, '标题是必填项'],
      trim: true,
      maxlength: [200, '标题不能超过200个字符']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, '描述不能超过1000个字符']
    },
    url: {
      type: String,
      required: [true, 'URL是必填项'],
      validate: {
        validator: function(v: string) {
          return /^https?:\/\/.+/.test(v);
        },
        message: 'URL必须是有效的HTTP/HTTPS链接'
      }
    },
    thumbnailUrl: {
      type: String,
      required: [true, '缩略图URL是必填项']
    },
    type: {
      type: String,
      enum: {
        values: ['image', 'video'],
        message: '类型必须是image或video'
      },
      required: [true, '类型是必填项']
    },
    tags: [{
      type: String,
      trim: true,
      lowercase: true
    }],
    metadata: {
      width: Number,
      height: Number,
      size: Number,
      format: String
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// 添加索引优化
MediaSchema.index({ title: 'text', description: 'text', tags: 'text' });
MediaSchema.index({ type: 1, createdAt: -1 });
MediaSchema.index({ tags: 1 });
MediaSchema.index({ isActive: 1, createdAt: -1 });

/**
 * 媒体资源模型
 * 
 * 注意: 使用 mongoose.models.Media 检查模型是否已经存在，
 * 避免在热重载时重复定义模型
 */
export const Media = mongoose.models.Media || mongoose.model<MediaDocument>('Media', MediaSchema);

export default Media;