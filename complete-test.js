/**
 * Comprehensive test of all Zhihu MCP server features
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
console.log('Zhihu MCP Server - Complete Feature Test');
console.log('========================================\n');

// Helper to build cookie string
function getCookieString() {
  return Object.entries(config.cookies)
    .map(([k, v]) => `${k}=${v}`)
    .join('; ');
}

// Test 1: Hot Search
async function testHotSearch() {
  console.log('=== 1. Hot Search (热搜词) ===');
  try {
    const url = 'https://www.zhihu.com/api/v4/search/hot_search';
    const headers = {
      'User-Agent': config.userAgent,
      'x-zse-93': config.zse93,
      'x-zse-96': signRequest(url, config.cookies.d_c0, null, config.zse93),
      'x-requested-with': 'fetch',
      'Cookie': getCookieString()
    };

    const response = await fetch(url, { headers });
    if (response.ok) {
      const data = await response.json();
      const items = data.hot_search_queries || [];
      console.log(`✓ SUCCESS - ${items.length} items`);
      console.log(`  Top: ${items[0]?.query} (${items[0]?.hot_show})`);
      return true;
    }
    console.log('✗ FAILED');
    return false;
  } catch (error) {
    console.log(`✗ ERROR: ${error.message}`);
    return false;
  }
}

// Test 2: Hot List
async function testHotList() {
  console.log('\n=== 2. Hot List (热榜) ===');
  try {
    const url = 'https://www.zhihu.com/api/v3/feed/topstory/hot-lists/total?limit=10&mobile=true';
    const headers = {
      'User-Agent': config.userAgent,
      'x-zse-93': config.zse93,
      'x-zse-96': signRequest(url, config.cookies.d_c0, null, config.zse93),
      'x-requested-with': 'fetch',
      'Cookie': getCookieString()
    };

    const response = await fetch(url, { headers });
    if (response.ok) {
      const data = await response.json();
      const items = data.data || [];
      console.log(`✓ SUCCESS - ${items.length} items`);
      const title = items[0]?.target?.title || items[0]?.target?.question?.title;
      console.log(`  Top: ${title?.substring(0, 50)}...`);
      return true;
    }
    console.log('✗ FAILED');
    return false;
  } catch (error) {
    console.log(`✗ ERROR: ${error.message}`);
    return false;
  }
}

// Test 3: Search
async function testSearch() {
  console.log('\n=== 3. Search (搜索) ===');
  try {
    const query = encodeURIComponent('Claude AI');
    const url = `https://www.zhihu.com/api/v4/search_v3?gk_version=gz-gaokao&t=general&q=${query}&correction=1&search_source=Normal&limit=5`;
    const headers = {
      'User-Agent': config.userAgent,
      'x-zse-93': config.zse93,
      'x-zse-96': signRequest(url, config.cookies.d_c0, null, config.zse93),
      'x-requested-with': 'fetch',
      'Cookie': getCookieString()
    };

    const response = await fetch(url, { headers });
    if (response.ok) {
      const data = await response.json();
      const items = data.data || [];
      console.log(`✓ SUCCESS - ${items.length} results`);
      if (items.length > 0) {
        const title = items[0].object?.question?.title || items[0].object?.title || items[0].highlight?.title;
        console.log(`  First: ${title?.substring(0, 50) || 'N/A'}...`);
      }
      return true;
    }
    console.log('✗ FAILED');
    return false;
  } catch (error) {
    console.log(`✗ ERROR: ${error.message}`);
    return false;
  }
}

// Test 4: Question Details
async function testQuestionDetails() {
  console.log('\n=== 4. Question Details (问题详情) ===');
  try {
    const questionId = '19550225';
    const url = `https://www.zhihu.com/api/v4/questions/${questionId}?include=read_count,visit_count,answer_count,voteup_count,comment_count,follower_count,detail,excerpt,author,relationship.is_following,topics`;
    const headers = {
      'User-Agent': config.userAgent,
      'x-zse-93': config.zse93,
      'x-zse-96': signRequest(url, config.cookies.d_c0, null, config.zse93),
      'x-requested-with': 'fetch',
      'Cookie': getCookieString()
    };

    const response = await fetch(url, { headers });
    if (response.ok) {
      const data = await response.json();
      console.log(`✓ SUCCESS`);
      console.log(`  Title: ${data.title?.substring(0, 50)}...`);
      console.log(`  Answers: ${data.answer_count}, Followers: ${data.follower_count}`);
      return true;
    }
    console.log('✗ FAILED');
    return false;
  } catch (error) {
    console.log(`✗ ERROR: ${error.message}`);
    return false;
  }
}

// Test 5: Answer Details
async function testAnswerDetails() {
  console.log('\n=== 5. Answer Details (回答详情) ===');
  try {
    const answerId = '3618557388';
    const url = `https://www.zhihu.com/api/v4/answers/${answerId}?include=content,paid_info,can_comment,excerpt,thanks_count,voteup_count,comment_count,visited_count,attachment,reaction,ip_info,pagination_info,question.topics,reaction.relation.voting,author.badge_v2`;
    const headers = {
      'User-Agent': config.userAgent,
      'x-zse-93': config.zse93,
      'x-zse-96': signRequest(url, config.cookies.d_c0, null, config.zse93),
      'x-requested-with': 'fetch',
      'Cookie': getCookieString()
    };

    const response = await fetch(url, { headers });
    if (response.ok) {
      const data = await response.json();
      console.log(`✓ SUCCESS`);
      console.log(`  Author: ${data.author?.name}`);
      console.log(`  Votes: ${data.voteup_count}, Comments: ${data.comment_count}`);
      return true;
    }
    console.log('✗ FAILED');
    return false;
  } catch (error) {
    console.log(`✗ ERROR: ${error.message}`);
    return false;
  }
}

// Test 6: User Info
async function testUserInfo() {
  console.log('\n=== 6. User Info (用户信息) ===');
  try {
    const url = 'https://www.zhihu.com/api/v4/me';
    const headers = {
      'User-Agent': config.userAgent,
      'x-zse-93': config.zse93,
      'x-zse-96': signRequest(url, config.cookies.d_c0, null, config.zse93),
      'x-requested-with': 'fetch',
      'Cookie': getCookieString()
    };

    const response = await fetch(url, { headers });
    if (response.ok) {
      const data = await response.json();
      console.log(`✓ SUCCESS`);
      console.log(`  User: ${data.name}`);
      console.log(`  ID: ${data.id}, URL Token: ${data.url_token}`);
      return true;
    }
    console.log('✗ FAILED');
    return false;
  } catch (error) {
    console.log(`✗ ERROR: ${error.message}`);
    return false;
  }
}

// Test 7: Recommendations (Android API)
async function testRecommendations() {
  console.log('\n=== 7. Recommendations (推荐内容) ===');
  try {
    const url = 'https://api.zhihu.com/topstory/recommend?limit=5';
    const headers = {
      ...ANDROID_HEADERS,
      'Cookie': getCookieString()
    };

    const response = await fetch(url, { headers });
    if (response.ok) {
      const data = await response.json();
      const items = data.data || [];
      console.log(`✓ SUCCESS - ${items.length} items`);
      return true;
    }
    console.log('✗ FAILED');
    return false;
  } catch (error) {
    console.log(`✗ ERROR: ${error.message}`);
    return false;
  }
}

async function runTests() {
  const results = {
    hotSearch: await testHotSearch(),
    hotList: await testHotList(),
    search: await testSearch(),
    questionDetails: await testQuestionDetails(),
    answerDetails: await testAnswerDetails(),
    userInfo: await testUserInfo(),
    recommendations: await testRecommendations()
  };

  console.log('\n========================================');
  console.log('Test Results Summary');
  console.log('========================================');
  Object.entries(results).forEach(([name, passed]) => {
    console.log(`${name}: ${passed ? '✓ PASS' : '✗ FAIL'}`);
  });
  console.log('========================================\n');

  const passCount = Object.values(results).filter(r => r).length;
  const totalCount = Object.values(results).length;

  console.log(`Result: ${passCount}/${totalCount} tests passed\n`);

  if (passCount === totalCount) {
    console.log('🎉 ALL FEATURES WORKING!');
    console.log('\nZhihu MCP Server is fully functional with authentication.');
    console.log('\nAvailable features:');
    console.log('  ✓ Hot Search - Get trending search keywords');
    console.log('  ✓ Hot List - Get trending topics');
    console.log('  ✓ Search - Search for questions, answers, articles');
    console.log('  ✓ Question Details - Get detailed question information');
    console.log('  ✓ Answer Details - Get detailed answer information');
    console.log('  ✓ User Info - Get current user information');
    console.log('  ✓ Recommendations - Get personalized recommendations');
    console.log('\nYou can now use all MCP tools via Claude Code!');
  } else {
    console.log(`⚠ ${totalCount - passCount} feature(s) need attention.`);
  }
}

runTests();
