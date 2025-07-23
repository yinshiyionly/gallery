/**
 * MongoDB 连接工具函数测试
 * 
 * 注意: 这些测试需要有效的 MongoDB 连接字符串才能通过
 * 可以通过设置环境变量 MONGODB_URI 或在 .env.test.local 文件中定义
 */

import { 
  connectToDatabase, 
  disconnectFromDatabase, 
  isConnected, 
  getConnectionState,
  resetConnection
} from '../mongodb';
import mongoose from 'mongoose';

// 模拟环境变量
beforeAll(() => {
  // 如果没有设置 MONGODB_URI，使用测试数据库 URI
  if (!process.env.MONGODB_URI) {
    process.env.MONGODB_URI = 'mongodb://localhost:27017/test_gallery';
  }
});

// 每个测试后断开连接
afterEach(async () => {
  await resetConnection();
});

// 所有测试完成后清理
afterAll(async () => {
  await mongoose.disconnect();
});

describe('MongoDB 连接工具函数', () => {
  it('应该成功连接到数据库', async () => {
    const conn = await connectToDatabase();
    expect(conn).toBeDefined();
    expect(isConnected()).toBe(true);
    expect(getConnectionState()).toBe(1);
  });

  it('应该重用现有连接', async () => {
    const conn1 = await connectToDatabase();
    const conn2 = await connectToDatabase();
    expect(conn1).toBe(conn2);
  });

  it('应该成功断开连接', async () => {
    await connectToDatabase();
    expect(isConnected()).toBe(true);
    
    await disconnectFromDatabase();
    expect(isConnected()).toBe(false);
    expect(getConnectionState()).toBe(0);
  });

  it('应该处理连接错误', async () => {
    // 保存原始 URI
    const originalUri = process.env.MONGODB_URI;
    
    try {
      // 设置无效的 URI
      process.env.MONGODB_URI = 'mongodb://invalid-host:27017/test';
      
      // 应该抛出错误
      await expect(connectToDatabase({
        serverSelectionTimeoutMS: 1000 // 快速超时以加速测试
      })).rejects.toThrow();
    } finally {
      // 恢复原始 URI
      process.env.MONGODB_URI = originalUri;
    }
  });

  it('应该使用自定义连接选项', async () => {
    const options = {
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 30000
    };
    
    const conn = await connectToDatabase(options);
    expect(conn).toBeDefined();
    expect(isConnected()).toBe(true);
    
    // 注意: 我们无法直接测试选项是否应用，因为 mongoose 不暴露这些内部配置
    // 但我们可以确保连接成功
  });
});