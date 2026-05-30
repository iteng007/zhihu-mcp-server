# Cookie 认证问题诊断报告

## 问题总结

所有 Cookie 格式测试均失败，错误信息：
- `ERR_DECODE_SECURE_COOKIE` - Cookie 无法解码
- `ERR_PARSE_LOGIN_TICKET` - 登录票据解析失败
- `身份未经过验证` - 缺少必要的认证信息

## 测试结果

| 测试 | Cookie 格式 | 结果 | 错误 |
|------|------------|------|------|
| 1 | 完整 z_c0 | ✗ | ERR_DECODE_SECURE_COOKIE |
| 2 | z_c0 带长度前缀 | ✗ | ERR_PARSE_LOGIN_TICKET |
| 3 | z_c0 仅 base64 | ✗ | ERR_PARSE_LOGIN_TICKET |
| 4 | 仅 d_c0 | ✗ | 身份未经过验证 |
| 5 | 签名不含 d_c0 | ✗ | ERR_DECODE_SECURE_COOKIE |
| 6 | URL 编码 z_c0 | ✗ | ERR_PARSE_LOGIN_TICKET |
| 7 | z_c0 作为 d_c0 | ✗ | 身份未经过验证 |

## 根本原因分析

### 1. Cookie 可能已过期或无效

**证据：**
- 所有格式都失败，包括标准格式
- 错误信息指向 Cookie 解码问题
- z_c0 中的时间戳：1780154699 (2026-05-31)

**可能性：** 高
- Cookie 可能在复制时损坏
- Cookie 可能已被服务器撤销
- Cookie 可能绑定到特定 IP/设备

### 2. 缺少必要的 Cookie 字段

**证据：**
- 我们只有 d_c0 和 z_c0
- 知乎可能需要更多 Cookie 进行验证

**常见必需 Cookie：**
- `_xsrf` - CSRF 令牌
- `_zap` - 分析追踪
- `q_c1` - 质量控制
- `tst` - 时间戳
- `capsion_ticket` - 验证码票据

**可能性：** 很高

### 3. Cookie 格式问题

**证据：**
- z_c0 是 Tornado 签名 Cookie 格式
- 格式：`version|field:value|field:value|...|signature`
- 我们的 z_c0：`2|1:0|10:1780154699|4:z_c0|92:value|signature`

**Tornado Cookie 结构：**
```
2                    - 版本号
1:0                  - 字段 1
10:1780154699        - 字段 10（时间戳）
4:z_c0               - 字段 4（cookie 名称）
92:Mi4x...           - 字段 92（实际值，长度:内容）
043fb6b...           - HMAC 签名
```

**问题：** 服务器无法验证签名，可能因为：
- 签名密钥不匹配
- Cookie 被修改或损坏
- 服务器端密钥已更换

**可能性：** 极高

## 解决方案

### 方案 A：获取完整的 Cookie 字符串（推荐）

**步骤：**

1. **打开浏览器开发者工具**
   - 按 F12
   - 切换到 "Network" 标签

2. **访问知乎并捕获请求**
   - 访问 https://www.zhihu.com
   - 刷新页面
   - 点击任意请求（通常是第一个 document 请求）

3. **复制完整的 Cookie 头**
   - 在 "Request Headers" 中找到 "Cookie:"
   - 复制整行的值（可能很长）
   - 应该包含多个 cookie，用分号分隔

**示例格式：**
```
d_c0=xxx; z_c0=xxx; _xsrf=xxx; _zap=xxx; q_c1=xxx; tst=xxx; ...
```

4. **提供给我**
   - 我会解析并配置所有 Cookie
   - 重新测试认证

### 方案 B：从 Application 标签获取所有 Cookie

**步骤：**

1. **打开开发者工具**
   - 按 F12
   - 切换到 "Application" 标签

2. **查看 Cookies**
   - 左侧展开 "Cookies"
   - 点击 "https://www.zhihu.com"

3. **复制所有 Cookie**
   - 提供所有 Cookie 的名称和值
   - 特别是：
     - `d_c0`
     - `z_c0`
     - `_xsrf`
     - `_zap`
     - `q_c1`
     - 任何其他看起来重要的

### 方案 C：使用浏览器导出工具

**使用 Cookie 导出扩展：**
1. 安装 "EditThisCookie" 或 "Cookie-Editor" 扩展
2. 访问 zhihu.com
3. 导出所有 Cookie（JSON 格式）
4. 提供给我

### 方案 D：验证 Cookie 是否仍然有效

**测试步骤：**

1. **在浏览器中测试**
   - 打开无痕窗口
   - 手动设置这些 Cookie（使用开发者工具）
   - 刷新页面
   - 看是否能保持登录状态

2. **如果无法保持登录**
   - Cookie 已过期或无效
   - 需要重新登录并获取新的 Cookie

## 临时解决方案

在修复 Cookie 认证之前，以下功能仍然可用（无需登录）：

### ✅ 可用功能
1. **热搜词** - Web API，无需认证
2. **热榜** - Android API，游客模式
3. **推荐内容** - Android API，游客模式

### ⚠️ 需要认证的功能
1. **搜索** - 需要有效 Cookie
2. **问题详情** - 部分需要认证
3. **回答详情** - 需要认证
4. **用户信息** - 需要认证
5. **个人内容** - 需要认证

## 下一步行动

**请选择一个方案并提供：**

1. **方案 A**：完整的 Cookie 请求头
2. **方案 B**：所有单独的 Cookie 值
3. **方案 C**：Cookie 导出的 JSON
4. **方案 D**：确认 Cookie 是否仍然有效

**或者：**

如果你暂时不需要认证功能，我们可以：
- 继续使用游客模式功能
- 完善现有的热搜、热榜、推荐功能
- 添加更多不需要认证的功能

## 技术细节

### Tornado Signed Cookie 格式

知乎使用 Tornado 框架的签名 Cookie：

```python
# Tornado Cookie 签名过程
def create_signed_value(secret, name, value):
    timestamp = str(int(time.time()))
    value = base64.b64encode(value)
    signature = hmac.new(secret, 
                        f"{name}|{value}|{timestamp}",
                        hashlib.sha256).hexdigest()
    return f"2|1:0|10:{timestamp}|4:{name}|{len(value)}:{value}|{signature}"
```

**验证失败原因：**
- 服务器使用密钥验证签名
- 如果签名不匹配，返回 ERR_DECODE_SECURE_COOKIE
- 我们无法生成有效签名（不知道密钥）
- 必须使用浏览器生成的原始 Cookie

### 为什么游客模式可用

Android API 端点不需要签名 Cookie：
- 使用简单的 HTTP headers
- 不验证 Cookie 签名
- 允许游客访问公开内容

这就是为什么热榜和推荐功能可以工作。

## 结论

Cookie 认证失败的根本原因是：
1. **Cookie 签名验证失败** - 服务器无法验证 z_c0 的签名
2. **可能缺少其他必需 Cookie** - 仅有 d_c0 和 z_c0 可能不够
3. **Cookie 可能已过期或无效** - 需要验证

**推荐行动：**
提供完整的 Cookie 请求头（方案 A），这样我可以：
- 获取所有必需的 Cookie
- 确保 Cookie 格式正确
- 重新测试认证功能
