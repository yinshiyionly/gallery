import mongoose from 'mongoose';

// 媒体 Schema
export const MediaSchema = new mongoose.Schema(
  {
    // DDL 必需字段
    code: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      description: 'code必须是字符串',
    },
    origin_url: {
      type: String,
      required: true,
      validate: {
        validator: function (v: string) {
          return /^https?:\/\/.+/.test(v);
        },
        message: '原始地址必须是有效的 HTTP/HTTPS URL',
      },
      description: '原始地址必须是字符串',
    },
    hd_url: {
      type: String,
      required: true,
      validate: {
        validator: function (v: string) {
          return /^https?:\/\/.+/.test(v);
        },
        message: '高清地址必须是有效的 HTTP/HTTPS URL',
      },
      description: '高清地址必须是字符串',
    },
    
    // 可选字段
    title: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    thumbnailUrl: {
      type: String,
    },
    type: {
      type: String,
      enum: ['image', 'video'],
      default: 'image',
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    metadata: {
      width: Number,
      height: Number,
      size: Number,
      format: String,
      duration: Number, // 视频时长（秒）
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// 添加索引
MediaSchema.index({ code: 1 }, { unique: true }); // code 唯一索引
MediaSchema.index({ title: 'text', description: 'text', tags: 'text' }); // 文本搜索索引
MediaSchema.index({ type: 1, createdAt: -1 }); // 类型和创建时间索引
MediaSchema.index({ tags: 1 }); // 标签索引
MediaSchema.index({ isActive: 1, createdAt: -1 }); // 激活状态和创建时间索引

// 导出模型
export default mongoose.models.Media || mongoose.model('Media', MediaSchema);