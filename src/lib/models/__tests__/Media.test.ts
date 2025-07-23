import mongoose from 'mongoose';
import { Media, MediaDocument } from '../Media';

// 在测试前连接到测试数据库
beforeAll(async () => {
  if (!process.env.MONGODB_URI) {
    process.env.MONGODB_URI = 'mongodb://localhost:27017/test_gallery';
  }
  await mongoose.connect(process.env.MONGODB_URI);
});

// 每个测试后清理数据
afterEach(async () => {
  await Media.deleteMany({});
});

// 所有测试完成后断开连接
afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

describe('Media Model', () => {
  it('应该成功创建有效的媒体记录', async () => {
    const mediaData = {
      title: '测试图片',
      description: '这是一个测试图片描述',
      url: 'https://example.com/image.jpg',
      thumbnailUrl: 'https://example.com/thumbnail.jpg',
      type: 'image' as const,
      tags: ['测试', '图片'],
      metadata: {
        width: 1920,
        height: 1080,
        size: 1024000,
        format: 'jpg'
      }
    };

    const media = new Media(mediaData);
    const savedMedia = await media.save();

    // 验证保存的数据
    expect(savedMedia._id).toBeDefined();
    expect(savedMedia.title).toBe(mediaData.title);
    expect(savedMedia.description).toBe(mediaData.description);
    expect(savedMedia.url).toBe(mediaData.url);
    expect(savedMedia.thumbnailUrl).toBe(mediaData.thumbnailUrl);
    expect(savedMedia.type).toBe(mediaData.type);
    expect(savedMedia.tags).toEqual(expect.arrayContaining(['测试', '图片']));
    expect(savedMedia.metadata.width).toBe(mediaData.metadata.width);
    expect(savedMedia.isActive).toBe(true);
    expect(savedMedia.createdAt).toBeDefined();
    expect(savedMedia.updatedAt).toBeDefined();
  });

  it('应该验证必填字段', async () => {
    const invalidMedia = new Media({
      description: '缺少必填字段的媒体'
    });

    // 验证失败应该抛出错误
    await expect(invalidMedia.save()).rejects.toThrow();
  });

  it('应该验证URL格式', async () => {
    const invalidMedia = new Media({
      title: '无效URL测试',
      url: 'invalid-url',
      thumbnailUrl: 'https://example.com/thumbnail.jpg',
      type: 'image'
    });

    // URL验证应该失败
    await expect(invalidMedia.save()).rejects.toThrow();
  });

  it('应该验证媒体类型枚举值', async () => {
    const invalidMedia = new Media({
      title: '无效类型测试',
      url: 'https://example.com/file.pdf',
      thumbnailUrl: 'https://example.com/thumbnail.jpg',
      type: 'document' // 无效类型
    });

    // 类型验证应该失败
    await expect(invalidMedia.save()).rejects.toThrow();
  });

  it('应该将标签转换为小写', async () => {
    const media = new Media({
      title: '标签测试',
      url: 'https://example.com/image.jpg',
      thumbnailUrl: 'https://example.com/thumbnail.jpg',
      type: 'image',
      tags: ['TEST', 'Image', 'PHOTO']
    });

    const savedMedia = await media.save();
    
    // 验证标签已转换为小写
    expect(savedMedia.tags).toEqual(expect.arrayContaining(['test', 'image', 'photo']));
  });

  it('应该限制标题长度', async () => {
    // 创建超长标题
    const longTitle = 'a'.repeat(201);
    
    const media = new Media({
      title: longTitle,
      url: 'https://example.com/image.jpg',
      thumbnailUrl: 'https://example.com/thumbnail.jpg',
      type: 'image'
    });

    // 长度验证应该失败
    await expect(media.save()).rejects.toThrow();
  });
});