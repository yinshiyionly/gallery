import dotenv from 'dotenv';
import { MediaService } from '../src/lib/services/mediaService';
import { connectToDatabase, disconnectFromDatabase } from '../src/lib/mongodb';

// 加载环境变量
dotenv.config({ path: '.env.local' });

/**
 * 测试媒体服务功能
 */
async function testMediaService() {
  try {
    console.log('连接到数据库...');
    await connectToDatabase();
    
    // 创建测试媒体
    console.log('创建测试媒体...');
    const testMedia = await MediaService.create({
      title: '测试媒体',
      description: '这是一个测试媒体项目',
      url: 'https://example.com/test.jpg',
      thumbnailUrl: 'https://example.com/test-thumb.jpg',
      type: 'image',
      tags: ['test', 'demo'],
      metadata: {
        width: 800,
        height: 600,
        size: 1024,
        format: 'jpg'
      },
      isActive: true
    });
    
    console.log('创建的媒体:', testMedia);
    
    // 查询媒体
    console.log('\n查询媒体...');
    const foundMedia = await MediaService.findById(testMedia._id.toString());
    console.log('查询结果:', foundMedia);
    
    // 更新媒体
    console.log('\n更新媒体...');
    const updatedMedia = await MediaService.update(testMedia._id.toString(), {
      title: '已更新的测试媒体',
      tags: ['test', 'demo', 'updated']
    });
    console.log('更新后的媒体:', updatedMedia);
    
    // 搜索媒体
    console.log('\n搜索媒体...');
    const searchResults = await MediaService.search({
      query: '测试',
      limit: 5
    });
    console.log('搜索结果:', searchResults);
    
    // 软删除媒体
    console.log('\n软删除媒体...');
    const softDeletedMedia = await MediaService.softDelete(testMedia._id.toString());
    console.log('软删除后的媒体:', softDeletedMedia);
    
    // 恢复媒体
    console.log('\n恢复媒体...');
    const restoredMedia = await MediaService.restore(testMedia._id.toString());
    console.log('恢复后的媒体:', restoredMedia);
    
    // 硬删除媒体
    console.log('\n删除测试媒体...');
    const deleteResult = await MediaService.delete(testMedia._id.toString());
    console.log('删除结果:', deleteResult);
    
    console.log('\n测试完成!');
  } catch (error) {
    console.error('测试过程中出错:', error);
  } finally {
    // 断开数据库连接
    await disconnectFromDatabase();
  }
}

// 执行测试
testMediaService();