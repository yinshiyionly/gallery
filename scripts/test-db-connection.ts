/**
 * 测试数据库连接脚本
 * 
 * 使用方法:
 * npx ts-node scripts/test-db-connection.ts
 */

import { connectToDatabase, disconnectFromDatabase, getConnectionState } from '../src/lib/mongodb';
import { getConnectionStateDescription } from '../src/lib/utils/db-status';

async function testConnection() {
  console.log('正在测试 MongoDB 连接...');
  
  try {
    // 尝试连接数据库
    const conn = await connectToDatabase();
    
    console.log('✅ 数据库连接成功!');
    console.log(`连接状态: ${getConnectionStateDescription()} (${getConnectionState()})`);
    console.log(`数据库名称: ${conn.connection.db.databaseName}`);
    
    // 获取集合列表
    const collections = await conn.connection.db.listCollections().toArray();
    console.log(`\n可用集合 (${collections.length}):`);
    
    if (collections.length === 0) {
      console.log('  - 没有可用集合');
    } else {
      collections.forEach(collection => {
        console.log(`  - ${collection.name}`);
      });
    }
    
    // 断开连接
    await disconnectFromDatabase();
    console.log('\n数据库连接已关闭');
  } catch (error) {
    console.error('❌ 数据库连接失败:');
    console.error(error);
    process.exit(1);
  }
}

// 执行测试
testConnection()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('未处理的错误:', err);
    process.exit(1);
  });