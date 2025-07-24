import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { connectToDatabase, disconnectFromDatabase } from '../src/lib/mongodb';
import mongoose from 'mongoose';

// 加载环境变量
dotenv.config();

/**
 * 测试媒体详情 API
 */
async function testMediaDetailsApi() {
  try {
    console.log('连接到数据库...');
    await connectToDatabase();
    
    // 获取 Media 模型
    const Media = mongoose.models.Media || 
      mongoose.model('Media', require('../src/lib/models/Media').MediaSchema);
    
    // 查找一个现有的媒体项目用于测试
    const media = await Media.findOne({ isActive: true }).lean();
    
    if (!media) {
      console.log('没有找到媒体项目，创建测试数据...');
      
      // 创建测试数据
      const testMedia = await Media.create({
        title: '测试媒体项目',
        description: '这是一个用于测试的媒体项目',
        url: 'https://example.com/test-media.jpg',
        thumbnailUrl: 'https://example.com/test-media-thumb.jpg',
        type: 'image',
        tags: ['测试', '示例'],
        metadata: {
          width: 1920,
          height: 1080,
          size: 1024000,
          format: 'jpg'
        }
      });
      
      console.log('创建的测试媒体项目:', testMedia._id);
      
      // 使用创建的测试媒体 ID
      await testApiEndpoint(testMedia._id.toString());
    } else {
      console.log('找到现有媒体项目:', media._id);
      
      // 使用现有媒体 ID
      await testApiEndpoint(media._id.toString());
    }
    
    // 测试无效 ID
    await testApiEndpoint('invalid-id');
    
    // 测试不存在的 ID
    await testApiEndpoint(new mongoose.Types.ObjectId().toString());
    
  } catch (error) {
    console.error('测试失败:', error);
  } finally {
    // 断开数据库连接
    await disconnectFromDatabase();
    console.log('测试完成');
  }
}

/**
 * 测试 API 端点
 * @param id 媒体 ID
 */
async function testApiEndpoint(id: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const url = `${baseUrl}/api/media/${id}`;
    
    console.log(`\n测试 API 端点: ${url}`);
    
    const response = await fetch(url);
    const data = await response.json();
    
    console.log('状态码:', response.status);
    console.log('响应数据:', JSON.stringify(data, null, 2));
    
    return data;
  } catch (error) {
    console.error('API 请求失败:', error);
    throw error;
  }
}

// 执行测试
testMediaDetailsApi();