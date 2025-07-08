# XItools MCP用户认证系统使用指南

## 概述

XItools MCP用户认证系统为Model Context Protocol (MCP) 服务提供完整的用户认证、API密钥管理和安全监控功能。本指南将帮助您了解如何使用这个系统。

## 目录

1. [快速开始](#快速开始)
2. [API密钥管理](#api密钥管理)
3. [权限系统](#权限系统)
4. [安全功能](#安全功能)
5. [监控和统计](#监控和统计)
6. [最佳实践](#最佳实践)
7. [故障排除](#故障排除)
8. [API参考](#api参考)

## 快速开始

### 1. 注册和登录

首先，您需要在XItools系统中注册一个账户：

```bash
# 注册新用户
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "your_username",
    "email": "your_email@example.com",
    "password": "your_secure_password"
  }'

# 登录获取JWT令牌
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "your_email@example.com",
    "password": "your_secure_password"
  }'
```

登录成功后，您将收到一个JWT令牌，用于后续的API调用。

### 2. 创建第一个API密钥

使用获得的JWT令牌创建您的第一个API密钥：

```bash
curl -X POST http://localhost:3000/api/user/api-keys \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "我的第一个MCP密钥",
    "permissions": ["mcp:read", "mcp:write"],
    "expiresAt": "2024-12-31T23:59:59Z"
  }'
```

**重要提示：** API密钥只在创建时显示一次，请务必保存好！

### 3. 使用API密钥调用MCP工具

使用创建的API密钥调用MCP工具：

```bash
# 获取任务Schema
curl -X POST http://localhost:3000/api/mcp/get_task_schema \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "boardId": "your_board_id"
  }'

# 列出任务
curl -X POST http://localhost:3000/api/mcp/list_tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "boardId": "your_board_id"
  }'
```

## API密钥管理

### 密钥类型和权限

XItools支持以下权限类型：

- **mcp:read**: 允许读取MCP数据（获取任务、看板、项目等）
- **mcp:write**: 允许修改MCP数据（创建、更新、删除任务等）
- **mcp:admin**: 管理员权限，拥有所有权限

### 创建API密钥

通过Web界面或API创建密钥时，您可以配置：

- **名称**: 密钥的描述性名称
- **权限**: 选择适当的权限组合
- **过期时间**: 设置密钥的有效期（可选择永不过期）

### 管理现有密钥

#### 查看密钥列表

```bash
curl -X GET http://localhost:3000/api/user/api-keys \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 查看密钥使用统计

```bash
curl -X GET http://localhost:3000/api/user/api-keys/{keyId}/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 删除密钥

```bash
curl -X DELETE http://localhost:3000/api/user/api-keys/{keyId} \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 权限系统

### 权限级别

1. **读取权限 (mcp:read)**
   - 获取任务列表和详情
   - 查看看板、项目、工作区信息
   - 获取任务Schema

2. **写入权限 (mcp:write)**
   - 创建、更新、删除任务
   - 管理看板列
   - 重排序任务和列

3. **管理员权限 (mcp:admin)**
   - 完全访问所有MCP功能
   - 查看系统级统计信息
   - 管理其他用户的密钥（如果启用）

### 权限验证

系统会在每次API调用时验证权限：

```javascript
// 权限不足时的响应示例
{
  "success": false,
  "error": "权限不足，需要写入权限",
  "code": "INSUFFICIENT_PERMISSIONS"
}
```

## 安全功能

### 速率限制

为防止滥用，系统实施多层速率限制：

- **每分钟**: 60次请求
- **每小时**: 1,000次请求
- **每天**: 10,000次请求

超出限制时，您将收到HTTP 429状态码：

```json
{
  "success": false,
  "error": "每分钟请求次数超出限制",
  "code": "RATE_LIMIT_EXCEEDED",
  "retryAfter": 60
}
```

### 异常检测

系统会自动检测并报告异常使用模式：

- **请求频率突增**: 短时间内请求量异常增加
- **高错误率**: 错误请求比例过高
- **多IP访问**: 同一密钥从过多不同IP地址使用
- **响应时间异常**: 请求响应时间过长

### 自动过期管理

系统会自动处理过期密钥：

- **提前通知**: 在过期前30、7、3、1天发送通知
- **自动禁用**: 过期密钥会被自动禁用
- **自动清理**: 过期30天后的密钥会被自动删除

## 监控和统计

### 实时监控面板

访问Web界面可查看：

- **概览统计**: 总密钥数、活跃密钥、请求统计
- **使用趋势**: 24小时和7天的使用趋势图
- **热门端点**: 最常使用的API端点
- **错误分析**: 错误类型和频率分析

### 详细统计报告

#### 基础统计

```bash
curl -X GET http://localhost:3000/api/user/api-keys/{keyId}/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

响应示例：
```json
{
  "success": true,
  "data": {
    "totalRequests": 1250,
    "successRequests": 1180,
    "failedRequests": 70,
    "lastUsedAt": "2024-01-15T10:30:00Z",
    "mostUsedTool": "list_tasks"
  }
}
```

#### 详细分析

```bash
curl -X GET "http://localhost:3000/api/user/api-keys/{keyId}/detailed-stats?timeRange=week" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 健康状态检查

每个API密钥都有健康分数（0-100）：

```bash
curl -X GET http://localhost:3000/api/user/api-keys/{keyId}/health \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

健康分数基于以下因素：
- **错误率**: 错误请求的比例
- **响应时间**: 平均响应时间
- **过期状态**: 是否临近过期
- **使用模式**: 是否存在异常使用

## 最佳实践

### 1. 密钥管理

- **最小权限原则**: 只授予必要的权限
- **定期轮换**: 定期更新API密钥
- **合理命名**: 使用描述性的密钥名称
- **安全存储**: 妥善保管API密钥，不要硬编码在代码中

### 2. 使用建议

- **环境变量**: 使用环境变量存储API密钥
- **错误处理**: 正确处理速率限制和权限错误
- **重试机制**: 实现指数退避的重试逻辑
- **监控使用**: 定期检查使用统计和健康状态

### 3. 安全建议

- **HTTPS**: 始终使用HTTPS传输
- **IP限制**: 如果可能，限制密钥使用的IP地址
- **监控告警**: 设置异常使用的告警
- **及时撤销**: 怀疑泄露时立即删除密钥

## 故障排除

### 常见错误

#### 1. 认证失败 (401)

```json
{
  "success": false,
  "error": "API密钥无效或已禁用",
  "code": "INVALID_API_KEY"
}
```

**解决方案**:
- 检查API密钥是否正确
- 确认密钥未过期
- 验证密钥是否被禁用

#### 2. 权限不足 (403)

```json
{
  "success": false,
  "error": "权限不足，需要写入权限",
  "code": "INSUFFICIENT_PERMISSIONS"
}
```

**解决方案**:
- 检查密钥是否有相应权限
- 联系管理员升级权限
- 使用具有足够权限的密钥

#### 3. 速率限制 (429)

```json
{
  "success": false,
  "error": "每分钟请求次数超出限制",
  "code": "RATE_LIMIT_EXCEEDED",
  "retryAfter": 60
}
```

**解决方案**:
- 等待重试时间后再发送请求
- 实现请求队列和速率控制
- 考虑优化请求频率

#### 4. 服务器错误 (500)

**解决方案**:
- 检查请求参数是否正确
- 查看服务器日志
- 联系技术支持

### 调试技巧

1. **查看响应头**: 检查速率限制相关的响应头
2. **使用健康检查**: 定期检查密钥健康状态
3. **查看使用日志**: 分析使用模式找出问题
4. **测试工具**: 使用提供的测试脚本验证功能

## API参考

### 认证API

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/auth/register` | POST | 用户注册 |
| `/api/auth/login` | POST | 用户登录 |
| `/api/auth/logout` | POST | 用户登出 |
| `/api/auth/refresh` | POST | 刷新令牌 |

### API密钥管理

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/user/api-keys` | GET | 获取密钥列表 |
| `/api/user/api-keys` | POST | 创建新密钥 |
| `/api/user/api-keys/{id}` | DELETE | 删除密钥 |
| `/api/user/api-keys/{id}/stats` | GET | 获取使用统计 |
| `/api/user/api-keys/{id}/health` | GET | 获取健康状态 |

### MCP工具调用

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/mcp/{toolName}` | POST | 调用MCP工具 |
| `/mcp-auth` | POST | 传统MCP协议 |

### 统计和监控

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/user/api-keys/dashboard` | GET | 实时仪表板 |
| `/api/user/api-keys/expiration-report` | GET | 过期报告 |
| `/api/user/api-keys/{id}/detailed-stats` | GET | 详细统计 |
| `/api/user/api-keys/{id}/logs` | GET | 使用日志 |

## 示例代码

### JavaScript/Node.js

```javascript
const axios = require('axios');

class XItoolsMCPClient {
  constructor(apiKey, baseURL = 'http://localhost:3000') {
    this.apiKey = apiKey;
    this.baseURL = baseURL;
  }

  async callTool(toolName, params = {}) {
    try {
      const response = await axios.post(
        `${this.baseURL}/api/mcp/${toolName}`,
        params,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data;
    } catch (error) {
      if (error.response?.status === 429) {
        // 处理速率限制
        const retryAfter = error.response.data.retryAfter;
        console.log(`速率限制，${retryAfter}秒后重试`);
        await this.sleep(retryAfter * 1000);
        return this.callTool(toolName, params);
      }
      throw error;
    }
  }

  async listTasks(boardId) {
    return this.callTool('list_tasks', { boardId });
  }

  async createTask(taskData) {
    return this.callTool('submit_task_dataset', { tasks: [taskData] });
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 使用示例
const client = new XItoolsMCPClient('xitools_your_api_key_here');

async function example() {
  try {
    // 获取任务列表
    const tasks = await client.listTasks('your-board-id');
    console.log('任务列表:', tasks);

    // 创建新任务
    const newTask = await client.createTask({
      title: '新任务',
      description: '任务描述',
      status: 'todo-column-id',
      boardId: 'your-board-id'
    });
    console.log('创建的任务:', newTask);
  } catch (error) {
    console.error('调用失败:', error.message);
  }
}
```

### Python

```python
import requests
import time
from typing import Dict, Any, Optional

class XItoolsMCPClient:
    def __init__(self, api_key: str, base_url: str = "http://localhost:3000"):
        self.api_key = api_key
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        })

    def call_tool(self, tool_name: str, params: Dict[str, Any] = None) -> Dict[str, Any]:
        """调用MCP工具"""
        if params is None:
            params = {}
            
        url = f"{self.base_url}/api/mcp/{tool_name}"
        
        try:
            response = self.session.post(url, json=params)
            
            if response.status_code == 429:
                # 处理速率限制
                retry_after = response.json().get('retryAfter', 60)
                print(f"速率限制，{retry_after}秒后重试")
                time.sleep(retry_after)
                return self.call_tool(tool_name, params)
            
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"请求失败: {e}")
            raise

    def list_tasks(self, board_id: str) -> Dict[str, Any]:
        """列出任务"""
        return self.call_tool('list_tasks', {'boardId': board_id})

    def create_task(self, task_data: Dict[str, Any]) -> Dict[str, Any]:
        """创建任务"""
        return self.call_tool('submit_task_dataset', {'tasks': [task_data]})

# 使用示例
client = XItoolsMCPClient('xitools_your_api_key_here')

try:
    # 获取任务列表
    tasks = client.list_tasks('your-board-id')
    print('任务列表:', tasks)
    
    # 创建新任务
    new_task = client.create_task({
        'title': '新任务',
        'description': '任务描述',
        'status': 'todo-column-id',
        'boardId': 'your-board-id'
    })
    print('创建的任务:', new_task)
except Exception as e:
    print(f'调用失败: {e}')
```

## 支持和反馈

如果您在使用过程中遇到问题或有建议，请：

1. 查看本指南的故障排除部分
2. 检查API响应中的错误信息
3. 查看系统日志
4. 联系技术支持团队

---

**版本**: 1.0  
**最后更新**: 2024年1月  
**文档状态**: 最新