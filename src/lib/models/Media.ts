import mongoose from 'mongoose';

// 媒体 Schema
export const MediaSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    url: {
      type: String,
      required: true,
      validate: {
        validator: function (v: string) {
          return /^https?:\/\/.+/.test(v);
        },
        message: 'URL must be a valid HTTP/HTTPS URL',
      },
    },
    thumbnailUrl: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['image', 'video'],
      required: true,
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

// 添加文本索引
MediaSchema.index({ title: 'text', description: 'text', tags: 'text' });

// 添加其他索引
MediaSchema.index({ type: 1, createdAt: -1 });
MediaSchema.index({ tags: 1 });
MediaSchema.index({ isActive: 1, createdAt: -1 });

// 导出模型
export default mongoose.models.Media || mongoose.model('Media', MediaSchema);