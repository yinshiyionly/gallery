import fetch from 'node-fetch';

/**
 * 测试媒体 API 路由
 */
async function testMediaApi() {
  try {
    console.log('测试媒体 API 路由...');
    
    // 测试基本 GET 请求
    console.log('\n1. 测试基本 GET 请求:');
    const baseResponse = await fetch('http://localhost:3000/api/media');
    const baseData = await baseResponse.json();
    console.log('状态码:', baseResponse.status);
    console.log('响应数据:', JSON.stringify(baseData, null, 2));
    
    // 测试分页
    console.log('\n2. 测试分页 (page=1, limit=5):');
    const paginatedResponse = await fetch('http://localhost:3000/api/media?page=1&limit=5');
    const paginatedData = await paginatedResponse.json();
    console.log('状态码:', paginatedResponse.status);
    console.log('分页信息:', paginatedData.pagination);
    console.log(`返回项目数: ${paginatedData.data?.length || 0}`);
    
    // 测试排序
    console.log('\n3. 测试排序 (按标题升序):');
    const sortedResponse = await fetch('http://localhost:3000/api/media?sortBy=title&sortOrder=asc');
    const sortedData = await sortedResponse.json();
    console.log('状态码:', sortedResponse.status);
    console.log('排序后的前几项:');
    sortedData.data?.slice(0, 3).forEach((item: any, index: number) => {
      console.log(`  ${index + 1}. ${item.title}`);
    });
    
    // 测试类型过滤
    console.log('\n4. 测试类型过滤 (仅图片):');
    const filteredResponse = await fetch('http://localhost:3000/api/media?type=image');
    const filteredData = await filteredResponse.json();
    console.log('状态码:', filteredResponse.status);
    console.log(`返回项目数: ${filteredData.data?.length || 0}`);
    console.log('所有项目类型是否为图片:', filteredData.data?.every((item: any) => item.type === 'image'));
    
    console.log('\n测试完成!');
  } catch (error) {
    console.error('测试失败:', error);
  }
}

// 执行测试
testMediaApi();