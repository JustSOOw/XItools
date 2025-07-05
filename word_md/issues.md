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

## 前端开发问题

### 2. React应用页面卡死问题

#### 2.1 问题现象
**症状**：
- 登录页面完全卡死，浏览器无响应
- 无法右键点击、无法打开F12开发者工具
- 页面中的任何操作都无效
- 简单的测试页面正常工作，说明基础React功能没问题

#### 2.2 问题排查过程
**排查步骤**：
1. 创建简化版AppRouter测试 - 正常工作
2. 使用原始AppRouter但不加载App.tsx - 正常工作
3. 使用原始AppRouter + App.tsx - 卡死

**结论**：问题定位在App.tsx中的复杂逻辑导致的无限循环。

#### 2.3 根本原因分析
**核心问题**：useCallback的依赖数组包含了不稳定的函数引用，导致无限重新创建和循环调用。

**具体问题代码**：
```javascript
const loadBoardData = useCallback(async (boardId: string) => {
  // ... 异步加载逻辑
}, [setLoading, setTasks, setColumns, t]); // 问题：包含了setState函数

useEffect(() => {
  if (currentBoardId) {
    loadBoardData(currentBoardId); // 触发无限循环
  }
}, [currentBoardId, loadBoardData]); // loadBoardData不断重新创建
```

**循环链条**：
1. `loadBoardData`依赖`setTasks`、`setColumns`等setState函数
2. 这些函数在每次渲染时可能重新创建（虽然React通常会保持它们稳定）
3. 导致`loadBoardData`重新创建
4. 触发依赖`loadBoardData`的useEffect重新执行
5. 重新调用`loadBoardData`，形成无限循环

#### 2.4 解决方案
**修复方法**：
1. **移除不必要的依赖**：从useCallback依赖数组中移除setState函数
   ```javascript
   }, [t]); // 移除setState函数依赖，它们是稳定的
   ```

2. **简化AppRouter逻辑**：
   ```javascript
   useEffect(() => {
     // 只依赖isInitialized，避免checkAuthStatus引起的循环
   }, [isInitialized]);
   ```

3. **禁用React.StrictMode**：在开发阶段移除StrictMode避免双重渲染加剧问题

4. **清理userStore的自动检查**：
   ```javascript
   onRehydrateStorage: () => (state) => {
     // 不执行任何操作，避免与AppRouter的认证初始化冲突
   }
   ```

#### 2.5 经验总结
**最佳实践**：
1. **useCallback依赖数组要谨慎**：只包含真正会变化的值，setState函数通常是稳定的
2. **避免复杂的useEffect链**：多个useEffect相互依赖容易形成循环
3. **认证状态管理要统一**：避免多个组件同时管理认证状态
4. **使用简化版本逐步排查**：通过逐步简化组件定位问题根源
5. **开发时关注浏览器性能**：无限循环会导致页面完全卡死

**调试技巧**：
- 使用简单的测试组件验证基础功能
- 逐步恢复复杂逻辑，定位问题范围
- 检查useCallback和useEffect的依赖数组
- 注意React组件间的状态同步问题
