# XItools项目开发过程中的问题与解决方案

## 项目概述

XItools是一个基于React和Node.js的智能任务看板应用，集成了MCP（Model Context Protocol）服务，提供智能化的任务管理体验。在开发过程中，我们遇到了一系列技术挑战和环境配置问题，本文档旨在记录这些问题及其解决方案，为后续开发提供参考。

## 后端开发问题

### 1. MCP服务环境配置问题

#### 1.1 MCP SDK导入错误

**错误信息**：
```
No exports main defined in @modelcontextprotocol/sdk/package.json
```

**原因**：
MCP SDK使用了非标准的导出路径配置，导致在不同的模块系统（CommonJS与ESM）之间存在兼容性问题。

**尝试的解决方案**：
1. 测试不同的SDK版本（1.11.4、1.10.0、1.0.0、0.7.0）
2. 创建测试文件验证正确的导入语法
3. 在`package.json`中切换`"type": "module"`和`"type": "commonjs"`配置

**最终解决方案**：
将`package.json`中的`"type"`设置为`"module"`，并使用正确的ESM导入语法：
```javascript
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
```

注意路径末尾的`.js`扩展名是必需的，这是ESM模块系统的特性。

#### 1.2 Node.js运行环境问题

**错误现象**：
无法直接运行TypeScript文件，或者运行时模块解析失败

**尝试的解决方案**：
1. 安装`ts-node`和相关依赖
2. 在`package.json`中更新`dev`脚本

**最终解决方案**：
```json
"scripts": {
  "dev": "ts-node src/index.ts",
  // 其他脚本...
}
```

#### 1.3 MCP服务工具注册时序问题

**错误信息**：
```
Cannot register capabilities after connecting to transport
```

**原因**：
在将MCP服务连接到传输层后尝试注册工具，而正确的顺序应该是先注册所有工具，然后再连接到传输层。

**解决方案**：
确保所有MCP工具的注册在`mcpServer.connect(transport)`调用之前完成。将代码调整为：
```javascript
// 先注册所有工具
mcpServer.tool("get_task_schema", ...);
mcpServer.tool("submit_task_dataset", ...);
// 其他工具...

// 最后再连接到传输层
mcpServer.connect(transport);
```
