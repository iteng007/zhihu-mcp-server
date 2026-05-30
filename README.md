# Zhihu MCP Server

基于 [zhihu-plus-plus](https://github.com/zly2006/zhihu-plus-plus) 项目实现的知乎 MCP 服务器，提供完整的知乎 API 访问能力，包括认证和 zse96 v2 签名。

## 功能特性

- ✅ **完整的 zse96 v2 签名实现** - 从 zhihu-plus-plus 项目移植
- ⚠️ **热榜获取** - 获取知乎实时热门话题（当前返回数据异常，需要调试）
- ✅ **搜索功能** - 搜索问题、回答、文章、用户（需要Cookie）
- ✅ **热搜词** - 获取当前热门搜索关键词
- ✅ **问题详情** - 获取问题信息和回答列表
- ✅ **回答详情** - 获取回答内容和元数据
- ✅ **文章详情** - 获取专栏文章内容
- ✅ **用户信息** - 获取用户资料
- ✅ **Cookie 认证** - 支持登录态访问
- ✅ **配置查询** - 获取当前配置信息

## 安装

```bash
cd zhihu-mcp-server
npm install
```

## 配置

### 1. 在 Claude Code 中配置

编辑 `~/.claude/.mcp.json` 或项目的 `.mcp.json`：

```json
{
  "mcpServers": {
    "zhihu": {
      "command": "node",
      "args": [
        "D:\\code\\zhihu-mcp-server\\index.js"
      ]
    }
  }
}
```

### 2. 设置 Cookie（可选，用于访问需要登录的内容）

首次使用时，可以通过 `zhihu_set_cookies` 工具设置 Cookie：

1. 在浏览器中登录知乎
2. 打开开发者工具（F12）
3. 进入 Application/Storage → Cookies → https://www.zhihu.com
4. 复制以下 Cookie 值：
   - `d_c0` (必需)
   - `z_c0` (可选，用于完整登录态)
   - 其他相关 Cookie

5. 在 Claude Code 中调用：
```javascript
zhihu_set_cookies({
  "d_c0": "你的d_c0值",
  "z_c0": "你的z_c0值"
})
```

Cookie 会保存在 `~/.zhihu-mcp/config.json` 中。

## 可用工具

### 1. `zhihu_hot_list` ⚠️
获取知乎热榜内容。

**⚠️ 已知问题：** 当前该接口返回的数据格式异常，所有字段显示为 "N/A"。可能原因：
- 知乎API端点已变更
- 需要额外的请求头或参数
- 反爬机制升级

建议暂时使用 `zhihu_hot_search` 获取热门话题。

**参数：**
- `limit` (可选): 返回结果数量，默认 50

**示例：**
```javascript
zhihu_hot_list({ limit: 20 })
```

### 2. `zhihu_search` ✅
搜索知乎内容。

**⚠️ 注意：** 该接口需要设置有效的Cookie才能正常使用，否则会返回 403 Forbidden 错误。

**参数：**
- `query` (必需): 搜索关键词
- `limit` (可选): 返回结果数量，默认 10
- `offset` (可选): 分页偏移量，默认 0

**示例：**
```javascript
zhihu_search({ 
  query: "人工智能",
  limit: 20
})
```

### 3. `zhihu_hot_search` ✅
获取知乎热搜词。

**✅ 状态：** 该接口无需Cookie即可正常使用，返回当前热门搜索关键词列表。

**示例：**
```javascript
zhihu_hot_search()
```

### 4. `zhihu_get_question`
获取问题详情。

**参数：**
- `question_id` (必需): 问题 ID

**示例：**
```javascript
zhihu_get_question({ question_id: "12345678" })
```

### 5. `zhihu_get_answer`
获取回答详情。

**参数：**
- `answer_id` (必需): 回答 ID

**示例：**
```javascript
zhihu_get_answer({ answer_id: "87654321" })
```

### 6. `zhihu_get_article`
获取文章详情。

**参数：**
- `article_id` (必需): 文章 ID

**示例：**
```javascript
zhihu_get_article({ article_id: "123456789" })
```

### 7. `zhihu_question_answers`
获取问题的回答列表。

**参数：**
- `question_id` (必需): 问题 ID
- `limit` (可选): 返回结果数量，默认 20
- `offset` (可选): 分页偏移量，默认 0
- `sort` (可选): 排序方式，`default` 或 `updated`

**示例：**
```javascript
zhihu_question_answers({ 
  question_id: "12345678",
  limit: 10,
  sort: "default"
})
```

### 8. `zhihu_get_user`
获取用户信息。

**参数：**
- `user_token` (必需): 用户 URL token 或 ID

**示例：**
```javascript
zhihu_get_user({ user_token: "zhang-san-12" })
```

### 9. `zhihu_set_cookies`
设置登录 Cookie。

**参数：**
- `cookies` (必需): Cookie 键值对对象

**示例：**
```javascript
zhihu_set_cookies({
  cookies: {
    "d_c0": "your_d_c0_value",
    "z_c0": "your_z_c0_value"
  }
})
```

### 10. `zhihu_get_config`
获取当前配置信息。

**示例：**
```javascript
zhihu_get_config()
```

## 技术实现

### zse96 v2 签名算法

本项目完整移植了 zhihu-plus-plus 中的 zse96 v2 签名算法：

1. **加密流程**：
   - 使用自定义的块加密算法（基于 ZK 和 ZB 常量表）
   - 对请求参数进行 MD5 哈希
   - 使用自定义 Base64 编码

2. **签名生成**：
   ```
   signSource = zse93 + pathname + d_c0 + body
   md5Hash = MD5(signSource)
   signature = encryptZseV4(md5Hash)
   x-zse-96 = "2.0_" + signature
   ```

3. **请求头**：
   - `x-zse-93`: 固定值 `101_3_3.0`
   - `x-zse-96`: 动态签名 `2.0_[signature]`
   - `x-requested-with`: `fetch`

### API 端点

基于 zhihu-plus-plus 项目中的 API 端点：

- 热榜: `/api/v3/feed/topstory/hot-lists/total`
- 搜索: `/api/v4/search_v3`
- 热搜: `/api/v4/search/hot_search`
- 问题: `/api/v4/questions/[id]`
- 回答: `/api/v4/answers/[id]`
- 文章: `/api/v4/articles/[id]`
- 用户: `/api/v4/members/[token]`

## 使用示例

在 Claude Code 中：

```
获取知乎热榜前 10 条
```

```
搜索知乎上关于"机器学习"的内容
```

```
获取问题 12345678 的详细信息
```

## 配置文件

配置保存在 `~/.zhihu-mcp/config.json`：

```json
{
  "cookies": {
    "d_c0": "your_cookie_value"
  },
  "userAgent": "Mozilla/5.0 ...",
  "zse93": "101_3_3.0"
}
```

## API 状态说明

根据实际测试（2026-05-30），各API接口状态如下：

| 接口 | 状态 | 是否需要Cookie | 说明 |
|------|------|---------------|------|
| `zhihu_hot_search` | ✅ 正常 | ❌ 否 | 返回热搜词列表，无需登录 |
| `zhihu_search` | ✅ 正常 | ✅ 是 | 需要Cookie，否则返回403 |
| `zhihu_get_config` | ✅ 正常 | ❌ 否 | 查看当前配置 |
| `zhihu_hot_list` | ⚠️ 异常 | ❌ 否 | 返回数据格式异常，待修复 |
| `zhihu_get_question` | ❓ 未测试 | ❓ 待确认 | - |
| `zhihu_get_answer` | ❓ 未测试 | ❓ 待确认 | - |
| `zhihu_get_article` | ❓ 未测试 | ❓ 待确认 | - |
| `zhihu_question_answers` | ❓ 未测试 | ❓ 待确认 | - |
| `zhihu_get_user` | ❓ 未测试 | ❓ 待确认 | - |

## 注意事项

1. **Cookie 安全**：Cookie 包含敏感信息，请妥善保管配置文件
2. **请求频率**：避免过于频繁的请求，遵守知乎的使用条款
3. **登录态**：搜索等功能需要登录才能访问，需要设置有效的 Cookie
4. **签名算法**：签名算法来自 zhihu-plus-plus 项目的逆向工程
5. **API稳定性**：知乎API可能随时变更，部分接口可能失效

## 许可证

AGPL-3.0 - 与 zhihu-plus-plus 项目保持一致

## 致谢

- [zhihu-plus-plus](https://github.com/zly2006/zhihu-plus-plus) - 签名算法和 API 端点参考
- [@modelcontextprotocol/sdk](https://github.com/modelcontextprotocol/sdk) - MCP SDK

## 故障排除

### 签名错误
如果遇到签名验证失败，检查：
1. `zse93` 值是否正确（默认 `101_3_3.0`）
2. Cookie 中的 `d_c0` 是否有效
3. User-Agent 是否被知乎识别

### Cookie 过期
Cookie 会定期过期，需要重新从浏览器获取并更新。

### 请求被限流
如果请求过于频繁，知乎可能会限流。建议：
- 增加请求间隔
- 使用有效的登录 Cookie
- 避免短时间内大量请求
