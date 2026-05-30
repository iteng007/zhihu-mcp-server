/**
 * Test script for Zhihu API functionality
 */

import { signRequest, encryptZseV4 } from './zse-signer.js';

// Test 1: Test signature generation
console.log('=== Test 1: Signature Generation ===');
const testUrl = 'https://www.zhihu.com/api/v4/search/hot_search';
const signature = signRequest(testUrl, '', null, '101_3_3.0');
console.log('Generated signature:', signature);
console.log('Signature format correct:', signature.startsWith('2.0_'));

// Test 2: Test hot search API
console.log('\n=== Test 2: Hot Search API ===');
async function testHotSearch() {
  try {
    const url = 'https://www.zhihu.com/api/v4/search/hot_search';
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'x-zse-93': '101_3_3.0',
      'x-zse-96': signRequest(url, '', null, '101_3_3.0'),
      'x-requested-with': 'fetch'
    };

    console.log('Request URL:', url);

    const response = await fetch(url, { headers });
    console.log('Response status:', response.status);

    if (response.ok) {
      const data = await response.json();
      console.log('Full response:', JSON.stringify(data, null, 2));

      // Check different possible data structures
      const items = data.data || data.words || data.top_search?.words || [];
      console.log('Got', items.length, 'hot search items');

      if (items.length > 0) {
        console.log('First item:', items[0]);
      }
      return items.length > 0;
    } else {
      const text = await response.text();
      console.log('Error response:', text);
      return false;
    }
  } catch (error) {
    console.error('Request failed:', error.message);
    return false;
  }
}

// Test 3: Test hot list API (guest access)
console.log('\n=== Test 3: Hot List API ===');
async function testHotList() {
  try {
    const url = 'https://www.zhihu.com/api/v3/feed/topstory/hot-lists/total?limit=10&mobile=true';
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'x-zse-93': '101_3_3.0',
      'x-zse-96': signRequest(url, '', null, '101_3_3.0'),
      'x-requested-with': 'fetch'
    };

    const response = await fetch(url, { headers });
    console.log('Response status:', response.status);

    if (response.ok) {
      const data = await response.json();
      console.log('Success! Got', data.data?.length || 0, 'hot list items');
      if (data.data && data.data.length > 0) {
        console.log('First item:', data.data[0].target?.title || 'N/A');
      }
      return true;
    } else {
      const text = await response.text();
      console.log('Error response:', text);
      return false;
    }
  } catch (error) {
    console.error('Request failed:', error.message);
    return false;
  }
}

// Test 4: Test search API
console.log('\n=== Test 4: Search API ===');
async function testSearch() {
  try {
    const query = encodeURIComponent('人工智能');
    const url = `https://www.zhihu.com/api/v4/search_v3?gk_version=gz-gaokao&t=general&q=${query}&correction=1&search_source=Normal&limit=5`;
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'x-zse-93': '101_3_3.0',
      'x-zse-96': signRequest(url, '', null, '101_3_3.0'),
      'x-requested-with': 'fetch'
    };

    const response = await fetch(url, { headers });
    console.log('Response status:', response.status);

    if (response.ok) {
      const data = await response.json();
      console.log('Success! Got', data.data?.length || 0, 'search results');
      if (data.data && data.data.length > 0) {
        console.log('First result type:', data.data[0].type);
      }
      return true;
    } else {
      const text = await response.text();
      console.log('Error response:', text);
      return false;
    }
  } catch (error) {
    console.error('Request failed:', error.message);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('\n========================================');
  console.log('Starting Zhihu API Tests');
  console.log('========================================\n');

  const results = {
    hotSearch: await testHotSearch(),
    hotList: await testHotList(),
    search: await testSearch()
  };

  console.log('\n========================================');
  console.log('Test Results Summary');
  console.log('========================================');
  console.log('Hot Search API:', results.hotSearch ? '✓ PASS' : '✗ FAIL');
  console.log('Hot List API:', results.hotList ? '✓ PASS' : '✗ FAIL');
  console.log('Search API:', results.search ? '✓ PASS' : '✗ FAIL');
  console.log('========================================\n');

  const allPassed = Object.values(results).every(r => r);
  if (allPassed) {
    console.log('✓ All tests passed! Zhihu API integration is working.');
  } else {
    console.log('✗ Some tests failed. Check the output above for details.');
  }
}

runTests();
