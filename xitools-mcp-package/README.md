# furdow-xitools-mcp

XItools远程MCP服务客户端 - 通过stdio连接到xitools.furdow.com的MCP服务。

## 🚀 快速开始

### 在Cursor中配置

在Cursor的MCP配置中添加：

```json
{
  "mcpServers": {
    "xitools": {
      "command": "npx",
      "args": ["furdow-xitools-mcp@latest"]
    }
  }
}
```

### 在Claude Desktop中配置

在`claude_desktop_config.json`中添加：

```json
{
  "mcpServers": {
    "xitools": {
      "command": "npx",
      "args": ["furdow-xitools-mcp@latest"]
    }
  }
}
```

## 📋 功能特性

- ✅ **任务管理**: 创建、更新、删除任务
- ✅ **列管理**: 管理任务列表和看板
- ✅ **远程同步**: 数据存储在云端，多设备同步
- ✅ **实时更新**: 支持实时数据更新
- ✅ **简单配置**: 一行配置即可使用

## 🛠️ 可用工具

### 任务管理工具
- `get_task_schema` - 获取任务数据结构
- `submit_task_dataset` - 提交任务数据集
- `get_tasks` - 获取任务列表
- `create_task` - 创建新任务
- `update_task` - 更新任务
- `delete_task` - 删除任务

### 列管理工具
- `get_columns` - 获取列列表
- `create_column` - 创建新列
- `update_column` - 更新列
- `delete_column` - 删除列

## 🔧 技术原理

这个包是一个**stdio代理**，工作原理：

1. **接收**: 监听stdin的MCP请求
2. **转发**: 将请求转换为HTTP请求发送到`xitools.furdow.com`
3. **响应**: 将服务器响应转换回stdio格式返回

```
Cursor/Claude → stdio → 本包 → HTTP → xitools.furdow.com
```

## 🌐 服务器信息

- **服务器地址**: xitools.furdow.com
- **MCP端点**: http://xitools.furdow.com/mcp
- **健康检查**: http://xitools.furdow.com/health

## 📝 使用示例

配置完成后，你可以在Cursor或Claude Desktop中使用以下命令：

```
创建一个名为"学习React"的任务
```

```
显示所有任务
```

```
将任务移动到"进行中"列
```

## 🐛 故障排除

### 连接问题
如果遇到连接问题，请检查：
1. 网络连接是否正常
2. xitools.furdow.com是否可访问
3. 防火墙是否阻止了连接

### 日志查看
包会输出日志到stderr，可以通过以下方式查看：
```bash
npx furdow-xitools-mcp 2> xitools-mcp.log
```

## 📞 支持

- **项目主页**: https://xitools.furdow.com
- **问题反馈**: https://github.com/furdow/xitools/issues
- **文档**: https://xitools.furdow.com/docs

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件。
