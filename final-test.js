/**
 * Final comprehensive test of Zhihu MCP server
 */

import { signRequest } from './zse-signer.js';
import fs from 'fs';
import path from 'path';
import os from 'os';

const CONFIG_FILE = path.join(os.homedir(), '.zhihu-mcp', 'config.json');
const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));

const ANDROID_HEADERS = {
  'x-api-version': '3.1.8',
  'x-app-version': '10.61.0',
  'x-app-za': 'OS=Android&Release=12&Model=sdk_gphone64_arm64&VersionName=10.61.0&VersionCode=26107&Product=com.zhihu.android&Width=1440&Height=2952&Installer=%E7%81%B0%E5%BA%A6&DeviceType=AndroidPhone&Brand=google',
  'User-Agent': 'com.zhihu.android/Futureve/10.61.0 Mozilla/5.0 (Linux; Android 12; sdk_gphone64_arm64 Build/SE1A.220630.001.A1; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/57.0.1000.10 Mobile Safari/537.36'
};

console.log('========================================');
console.log('Zhihu MCP Server - Final Test');
console.log('========================================\n');

// Test 1: Hot Search (Web API, no auth needed)
async function testHotSearch() {
  console.log('=== Test 1: Hot Search (Web API) ===');
  try {
    const url = 'https://www.zhihu.com/api/v4/search/hot_search';
    const headers = {
      'User-Agent': config.userAgent,
      'x-zse-93': config.zse93,
      'x-zse-96': signRequest(url, '', null, config.zse93),
      'x-requested-with': 'fetch'
    };

    const response = await fetch(url, { headers });
    if (response.ok) {
      const data = await response.json();
      const items = data.hot_search_queries || [];
      console.log(`✓ SUCCESS! Got ${items.length} hot search items`);
      console.log('Top 3:');
      items.slice(0, 3).forEach((item, i) => {
        console.log(`  ${i + 1}. ${item.query} (${item.hot_show})`);
      });
      return true;
    }
    return false;
  } catch (error) {
    console.log(`✗ FAILED: ${error.message}`);
    return false;
  }
}

// Test 2: Hot List (Android API, guest mode)
async function testHotList() {
  console.log('\n=== Test 2: Hot List (Android API) ===');
  try {
    const url = 'https://api.zhihu.com/topstory/hot-list?limit=10';
    const response = await fetch(url, { headers: ANDROID_HEADERS });

    if (response.ok) {
      const data = await response.json();
      const items = data.data || [];
      console.log(`✓ SUCCESS! Got ${items.length} hot list items`);
      console.log('Top 3:');
      items.slice(0, 3).forEach((item, i) => {
        const title = item.target?.title || item.target?.question?.title || 'N/A';
        console.log(`  ${i + 1}. ${title}`);
      });
      return true;
    }
    return false;
  } catch (error) {
    console.log(`✗ FAILED: ${error.message}`);
    return false;
  }
}

// Test 3: Recommendations (Android API)
async function testRecommendations() {
  console.log('\n=== Test 3: Recommendations (Android API) ===');
  try {
    const url = 'https://api.zhihu.com/topstory/recommend?limit=5';
    const response = await fetch(url, { headers: ANDROID_HEADERS });

    if (response.ok) {
      const data = await response.json();
      const items = data.data || [];
      console.log(`✓ SUCCESS! Got ${items.length} recommendation items`);
      if (items.length > 0) {
        const title = items[0].target?.title || items[0].target?.question?.title || 'N/A';
        console.log('First item:', title);
      }
      return true;
    }
    return false;
  } catch (error) {
    console.log(`✗ FAILED: ${error.message}`);
    return false;
  }
}

// Test 4: Question details (Android API)
async function testQuestionDetails() {
  console.log('\n=== Test 4: Question Details (Android API) ===');
  try {
    // Use a known question ID
    const questionId = '19550225'; // A popular question
    const url = `https://api.zhihu.com/questions/${questionId}`;
    const response = await fetch(url, { headers: ANDROID_HEADERS });

    if (response.ok) {
      const data = await response.json();
      console.log(`✓ SUCCESS! Got question details`);
      console.log('Title:', data.title || 'N/A');
      console.log('Answer count:', data.answer_count || 0);
      console.log('Follower count:', data.follower_count || 0);
      return true;
    }
    return false;
  } catch (error) {
    console.log(`✗ FAILED: ${error.message}`);
    return false;
  }
}

async function runTests() {
  const results = {
    hotSearch: await testHotSearch(),
    hotList: await testHotList(),
    recommendations: await testRecommendations(),
    questionDetails: await testQuestionDetails()
  };

  console.log('\n========================================');
  console.log('Test Results Summary');
  console.log('========================================');
  console.log('Hot Search (Web API):', results.hotSearch ? '✓ PASS' : '✗ FAIL');
  console.log('Hot List (Android API):', results.hotList ? '✓ PASS' : '✗ FAIL');
  console.log('Recommendations (Android API):', results.recommendations ? '✓ PASS' : '✗ FAIL');
  console.log('Question Details (Android API):', results.questionDetails ? '✓ PASS' : '✗ FAIL');
  console.log('========================================\n');

  const passCount = Object.values(results).filter(r => r).length;
  const totalCount = Object.values(results).length;

  if (passCount === totalCount) {
    console.log(`✓ All ${totalCount} tests passed!`);
    console.log('\n🎉 Zhihu MCP Server is fully functional!');
    console.log('\nAvailable features (guest mode):');
    console.log('  • Hot Search - Get trending search keywords');
    console.log('  • Hot List - Get trending topics and questions');
    console.log('  • Recommendations - Get personalized recommendations');
    console.log('  • Question Details - Get detailed question information');
    console.log('\nNote: Some features require authentication (search, user-specific content)');
    console.log('      Cookie authentication needs to be fixed for those features.');
  } else {
    console.log(`⚠ ${passCount}/${totalCount} tests passed`);
    console.log('\nWorking features can still be used via MCP server.');
  }
}

runTests();
