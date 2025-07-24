import fetch from 'node-fetch';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';

/**
 * 测试搜索 API
 */
async function testSearchAPI() {
  console.log('测试搜索 API...');
  
  try {
    // 测试基本搜索
    console.log('\n1. 基本搜索测试:');
    const basicSearchResponse = await fetch(`${API_BASE_URL}/search?q=test`);
    const basicSearchData = await basicSearchResponse.json();
    console.log('状态码:', basicSearchResponse.status);
    console.log('分页信息:', basicSearchData.pagination);
    console.log('结果数量:', basicSearchData.data?.length || 0);
    
    // 测试标签筛选
    console.log('\n2. 标签筛选测试:');
    const tagSearchResponse = await fetch(`${API_BASE_URL}/search?tags=nature,landscape`);
    const tagSearchData = await tagSearchResponse.json();
    console.log('状态码:', tagSearchResponse.status);
    console.log('分页信息:', tagSearchData.pagination);
    console.log('结果数量:', tagSearchData.data?.length || 0);
    
    // 测试类型筛选
    console.log('\n3. 类型筛选测试:');
    const typeSearchResponse = await fetch(`${API_BASE_URL}/search?type=image`);
    const typeSearchData = await typeSearchResponse.json();
    console.log('状态码:', typeSearchResponse.status);
    console.log('分页信息:', typeSearchData.pagination);
    console.log('结果数量:', typeSearchData.data?.length || 0);
    
    // 测试组合搜索
    console.log('\n4. 组合搜索测试:');
    const combinedSearchResponse = await fetch(`${API_BASE_URL}/search?q=test&type=image&tags=nature`);
    const combinedSearchData = await combinedSearchResponse.json();
    console.log('状态码:', combinedSearchResponse.status);
    console.log('分页信息:', combinedSearchData.pagination);
    console.log('结果数量:', combinedSearchData.data?.length || 0);
    
    // 测试搜索建议
    console.log('\n5. 搜索建议测试:');
    const suggestSearchResponse = await fetch(`${API_BASE_URL}/search?q=te&suggest=true`);
    const suggestSearchData = await suggestSearchResponse.json();
    console.log('状态码:', suggestSearchResponse.status);
    console.log('结果数量:', suggestSearchData.data?.length || 0);
    
    // 测试标签建议
    console.log('\n6. 标签建议测试:');
    const tagSuggestResponse = await fetch(`${API_BASE_URL}/search/tags?q=na`);
    const tagSuggestData = await tagSuggestResponse.json();
    console.log('状态码:', tagSuggestResponse.status);
    console.log('标签建议:', tagSuggestData.data);
    
    console.log('\n搜索 API 测试完成!');
  } catch (error) {
    console.error('测试过程中出错:', error);
  }
}

// 执行测试
testSearchAPI();