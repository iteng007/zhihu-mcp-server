# 如何获取知乎 Cookie

## 方法 1：从浏览器开发者工具获取

1. **打开知乎网站**
   - 访问 https://www.zhihu.com
   - 确保已登录

2. **打开开发者工具**
   - 按 F12 或右键 → 检查

3. **进入 Application/存储 标签**
   - 点击左侧 "Cookies"
   - 选择 "https://www.zhihu.com"

4. **查找并复制以下 Cookie**
   - `d_c0` - **必需**，用于请求签名
   - `z_c0` - 可选，用于身份验证（你已经提供了）

5. **Cookie 格式**
   - `d_c0` 通常是一个长字符串，类似：`AUDxxx...xxx|xxx...xxx`
   - 只需要复制 "Value" 列的值

## 方法 2：从浏览器请求头获取

1. 打开知乎网站并登录
2. 按 F12 打开开发者工具
3. 切换到 "Network/网络" 标签
4. 刷新页面
5. 点击任意请求（通常是第一个）
6. 查看 "Request Headers/请求头"
7. 找到 "Cookie" 行
8. 在 Cookie 字符串中找到 `d_c0=xxx;` 部分
9. 复制 `d_c0=` 后面到下一个分号之前的内容

## 示例

如果你看到的 Cookie 是：
```
d_c0=AUDxxxxxxxxxxx|1234567890; z_c0=2|1:0|10:1780154699|...
```

那么你需要复制的 `d_c0` 值是：
```
AUDxxxxxxxxxxx|1234567890
```

## 配置到 MCP 服务器

获取到 `d_c0` 后，告诉我这个值，我会帮你配置。

或者你也可以手动编辑配置文件：
```
C:\Users\ffather\.zhihu-mcp\config.json
```

格式如下：
```json
{
  "cookies": {
    "d_c0": "你的d_c0值",
    "z_c0": "你的z_c0值"
  },
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "zse93": "101_3_3.0"
}
```
