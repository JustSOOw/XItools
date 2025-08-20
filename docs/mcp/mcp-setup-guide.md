# XItools MCP设置指南

本指南将帮助您配置XItools的MCP（Model Context Protocol）服务，让您的AI助手能够直接与XItools进行交互。

## 📋 前置要求

- XItools账户和API Key
- 支持MCP的AI客户端（如Claude Desktop、Cursor等）

## 🔑 第一步：获取API Key

1. 登录XItools网站：https://xitools.furdow.com
2. 进入"设置" → "API密钥管理"
3. 点击"创建新密钥"
4. 设置密钥名称（如"MCP客户端"）
5. 选择权限：
   - **读取权限**：查看任务、看板、项目等
   - **写入权限**：创建、更新、删除任务等
   - **管理权限**：完整的管理功能
6. 复制生成的API Key（格式：`xitools_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`）

## ⚙️ 第二步：配置AI客户端

XItools使用HTTP传输方式，无需安装额外软件，只需要在AI客户端中添加配置即可。

### Claude Desktop配置

编辑Claude Desktop配置文件：

**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Linux**: `~/.config/Claude/claude_desktop_config.json`

添加以下配置：

```json
{
  "mcpServers": {
    "xitools": {
      "url": "https://xitools.furdow.com/mcp-auth",
      "headers": {
        "Authorization": "Bearer xitools_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
      }
    }
  }
}
```

### Cursor配置

在Cursor中，打开设置并找到MCP配置部分，添加：

```json
{
  "mcpServers": {
    "xitools": {
      "url": "https://xitools.furdow.com/mcp-auth",
      "headers": {
        "Authorization": "Bearer xitools_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
      }
    }
  }
}
```

### 其他MCP客户端

对于其他支持MCP的客户端，使用HTTP传输配置：
- **URL**: `https://xitools.furdow.com/mcp-auth`
- **认证头**: `Authorization: Bearer xitools_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

## 🧪 第三步：测试连接

1. 重启Claude Desktop或您的AI客户端
2. 在对话中询问："请列出我的任务"
3. 如果配置正确，AI将能够访问您的XItools数据

## 🛠️ 可用的MCP工具

XItools提供以下MCP工具：

### 任务管理
- `get_task_schema` - 获取任务Schema定义
- `list_tasks` - 列出用户的任务
- `get_task_details` - 获取任务详情
- `submit_task_dataset` - 批量创建任务
- `update_task` - 更新任务
- `delete_task` - 删除任务

### 看板管理
- `get_columns` - 获取看板列
- `create_column` - 创建看板列
- `update_column` - 更新看板列
- `delete_column` - 删除看板列
- `reorder_columns` - 重新排序看板列

### 项目管理
- `get_workspaces` - 获取工作区列表
- `get_projects` - 获取项目列表
- `get_boards` - 获取看板列表

### 实用工具
- `clear_all_tasks` - 清空所有任务

## 🔍 故障排除

### 常见问题

**1. "未配置API Key"错误**
- 确保API Key格式正确（以`xitools_`开头）
- 检查环境变量或配置文件是否正确设置

**2. "无法连接到XItools服务器"错误**
- 检查网络连接
- 确认服务器URL是否正确
- 检查防火墙设置

**3. "权限不足"错误**
- 确保API Key具有相应权限
- 检查API Key是否已过期

**4. Claude Desktop无法识别MCP服务器**
- 检查配置文件路径是否正确
- 确保Node.js路径正确
- 重启Claude Desktop

### 手动测试API

您可以使用curl测试MCP端点：

```bash
# 测试工具列表
curl -X POST https://xitools.furdow.com/mcp-auth \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer xitools_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/list",
    "id": 1
  }'

# 测试任务列表
curl -X POST https://xitools.furdow.com/mcp-auth \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer xitools_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "list_tasks",
      "arguments": {}
    },
    "id": 2
  }'
```

## 🔒 安全注意事项

1. **保护API Key**：不要在公共代码库中提交API Key
2. **权限最小化**：只授予必要的权限
3. **定期轮换**：定期更新API Key
4. **监控使用**：在XItools中监控API Key使用情况

## 📞 获取帮助

如果遇到问题，请：

1. 查看XItools日志
2. 检查API Key使用记录
3. 联系技术支持

---

**注意**：此功能需要XItools服务器运行最新版本，确保您的服务器已更新到支持API Key认证的版本。
