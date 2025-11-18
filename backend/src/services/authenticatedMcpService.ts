/**
 * MCP认证服务包装器
 *
 * 在现有MCP服务基础上添加API密钥认证功能
 */

import { FastifyInstance } from 'fastify';
import { Server as SocketIOServer } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import { mcpAuthMiddleware, logMcpRequest } from '../middleware/mcpAuth';
import { requirePermissions, requireMcpAuth } from '../middleware/apiKeyMiddleware';
import { getApiKeyService } from './apiKeyService';
import { ApiKeyPermission, McpUserContext } from '../types/apiKeyTypes';

// 初始化服务
const prisma = new PrismaClient();
const apiKeyService = getApiKeyService(prisma);

/**
 * 设置带认证的MCP服务路由
 */
export async function setupAuthenticatedMCPService(
  server: FastifyInstance,
  io: SocketIOServer,
): Promise<void> {
  console.log('开始配置带认证的MCP服务...');

  /**
   * MCP健康检查端点 - 无需认证的基础状态检查
   * 用于客户端验证服务器可用性
   */
  server.get('/mcp-auth/health', async (request, reply) => {
    return {
      status: 'ok',
      service: 'xitools-mcp-auth',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      capabilities: {
        authentication: 'api-key',
        transport: 'streamable-http',
        tools: true,
        resources: false,
      },
    };
  });

  /**
   * MCP OPTIONS端点 - 处理CORS预检请求
   * 这是Cursor等客户端在发送实际请求前的必要步骤
   */
  server.options('/mcp-auth', async (_request, reply) => {
    reply.header('Access-Control-Allow-Origin', '*');
    reply.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    reply.header('Access-Control-Allow-Headers', 'Authorization, Content-Type, Accept');
    reply.header('Access-Control-Max-Age', '86400'); // 24小时
    reply.status(200).send();
  });

  /**
   * 通用MCP工具调用端点
   *
   * 所有MCP工具调用都通过这个统一端点进行，包含认证、速率限制和日志记录
   */
  server.post<{
    Params: { toolName: string };
    Body: any;
  }>(
    '/api/mcp/:toolName',
    {
      preHandler: [
        mcpAuthMiddleware,
        async (request, reply) => {
          const { toolName } = request.params;

          // 根据工具类型检查权限
          if (isReadOnlyTool(toolName)) {
            await requirePermissions(ApiKeyPermission.MCP_READ)(request, reply);
          } else {
            await requirePermissions(ApiKeyPermission.MCP_WRITE)(request, reply);
          }
        },
      ],
    },
    async (request, reply) => {
      const { toolName } = request.params;
      const mcpUser = requireMcpAuth(request);

      try {
        console.log(`MCP工具调用: ${toolName}, 用户: ${mcpUser.userId}`);

        // 根据工具名称分发到对应的处理函数
        const result = await dispatchMcpTool(toolName, request.body, mcpUser, io);

        return {
          success: true,
          data: result,
        };
      } catch (error) {
        console.error(`MCP工具 ${toolName} 执行失败:`, error);

        return reply.status(500).send({
          success: false,
          error: error instanceof Error ? error.message : '工具执行失败',
          toolName,
        });
      }
    },
  );

  /**
   * MCP GET端点 - 用于SSE连接建立和服务器验证
   * 支持streamable-http协议的GET请求要求
   */
  server.get(
    '/mcp-auth',
    {
      preHandler: [mcpAuthMiddleware],
    },
    async (request, reply) => {
      const mcpUser = request.user;

      if (!mcpUser) {
        return reply.status(401).send({
          error: 'API密钥认证失败',
          code: 'AUTHENTICATION_REQUIRED',
        });
      }

      // 检查Accept header是否包含text/event-stream
      const acceptHeader = request.headers.accept || '';
      if (!acceptHeader.includes('text/event-stream')) {
        return reply.status(405).send({
          error: 'Method Not Allowed',
          message: 'GET endpoint requires Accept: text/event-stream header',
        });
      }

      try {
        // 设置SSE headers
        reply.header('Content-Type', 'text/event-stream');
        reply.header('Cache-Control', 'no-cache');
        reply.header('Connection', 'keep-alive');
        reply.header('Access-Control-Allow-Origin', '*');
        reply.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        reply.header('Access-Control-Allow-Headers', 'Authorization, Content-Type, Accept');

        // 发送初始连接事件（可选）
        reply.raw.write(`event: connected\n`);
        reply.raw.write(`data: ${JSON.stringify({
          serverInfo: {
            name: 'xitools-mcp-auth',
            version: '1.0.0',
          },
          timestamp: new Date().toISOString()
        })}\n\n`);

        // 保持连接开放，定期发送心跳
        const heartbeatInterval = setInterval(() => {
          try {
            reply.raw.write(`: heartbeat\n\n`);
          } catch (error) {
            console.log('SSE连接已关闭，清理心跳');
            clearInterval(heartbeatInterval);
          }
        }, 30000); // 每30秒发送一次心跳

        // 处理连接关闭
        request.raw.on('close', () => {
          console.log('MCP SSE连接关闭');
          clearInterval(heartbeatInterval);
        });

        request.raw.on('error', () => {
          console.log('MCP SSE连接错误');
          clearInterval(heartbeatInterval);
        });

      } catch (error) {
        console.error('MCP GET端点错误:', error);
        return reply.status(500).send({
          error: '服务器内部错误',
          code: 'INTERNAL_ERROR',
        });
      }
    },
  );

  /**
   * 兼容性MCP端点 - 支持原有的MCP协议格式
   * 使用独立路径避免与原有MCP服务冲突
   */
  server.post(
    '/mcp-auth',
    {
      preHandler: [mcpAuthMiddleware],
    },
    async (request, reply) => {
      const mcpUser = request.user;

      if (!mcpUser) {
        return reply.status(401).send({
          jsonrpc: '2.0',
          error: {
            code: -32001,
            message: '需要API密钥认证',
          },
          id: null,
        });
      }

      try {
        // 设置CORS headers
        reply.header('Access-Control-Allow-Origin', '*');
        reply.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        reply.header('Access-Control-Allow-Headers', 'Authorization, Content-Type, Accept');

        // 检查Accept header
        const acceptHeader = request.headers.accept || '';
        const supportsSSE = acceptHeader.includes('text/event-stream');
        const supportsJSON = acceptHeader.includes('application/json');

        if (!supportsJSON && !supportsSSE) {
          return reply.status(400).send({
            jsonrpc: '2.0',
            error: {
              code: -32600,
              message: 'Invalid Accept header. Must include application/json or text/event-stream',
            },
            id: null,
          });
        }

        // 将认证信息注入到原有的MCP处理逻辑中
        const body = request.body as any;

        // 如果是工具调用，添加用户上下文
        if (body.method === 'tools/call') {
          const toolName = body.params?.name;
          if (toolName) {
            // 检查权限
            if (isReadOnlyTool(toolName)) {
              if (
                !mcpUser.permissions.some(
                  (p) => (p as any) === ApiKeyPermission.MCP_READ || (p as any) === 'mcp:read',
                )
              ) {
                return reply.status(403).send({
                  jsonrpc: '2.0',
                  error: {
                    code: -32002,
                    message: '权限不足，需要读取权限',
                  },
                  id: body.id,
                });
              }
            } else {
              if (
                !mcpUser.permissions.some(
                  (p) => (p as any) === ApiKeyPermission.MCP_WRITE || (p as any) === 'mcp:write',
                )
              ) {
                return reply.status(403).send({
                  jsonrpc: '2.0',
                  error: {
                    code: -32002,
                    message: '权限不足，需要写入权限',
                  },
                  id: body.id,
                });
              }
            }

            // 将用户上下文添加到参数中
            if (body.params && body.params.arguments) {
              const mcpUserContext: McpUserContext = {
                userId: mcpUser.userId,
                apiKeyId: request.apiKey?.id || '',
                permissions: mcpUser.permissions as unknown as ApiKeyPermission[],
                ipAddress: request.ip,
                userAgent: request.headers['user-agent'],
              };
              body.params.arguments._mcpUser = mcpUserContext;
            }
          }
        }

        // 根据method分发处理
        if (body.method === 'initialize') {
          // 设置正确的Content-Type为JSON响应，确保UTF-8编码
          reply.header('Content-Type', 'application/json; charset=utf-8');

          return {
            jsonrpc: '2.0',
            result: {
              protocolVersion: '2024-11-05',
              capabilities: {
                tools: {},
                resources: {},
                prompts: {},
                logging: {},
              },
              serverInfo: {
                name: 'xitools-mcp-auth',
                version: '1.0.0',
              },
            },
            id: body.id,
          };
        } else if (body.method === 'tools/list') {
          // 设置正确的Content-Type为JSON响应，确保UTF-8编码
          reply.header('Content-Type', 'application/json; charset=utf-8');

          return {
            jsonrpc: '2.0',
            result: {
              tools: [
                {
                  name: 'list_tasks',
                  description: '列出用户的任务',
                  inputSchema: {
                    type: 'object',
                    properties: {
                      boardId: {
                        type: 'string',
                        description: '看板ID（可选）',
                      },
                      status: {
                        type: 'string',
                        description: '任务状态过滤（可选）',
                      },
                    },
                  },
                },
                {
                  name: 'get_task_details',
                  description: '获取任务详情',
                  inputSchema: {
                    type: 'object',
                    properties: {
                      taskId: {
                        type: 'string',
                        description: '任务ID',
                      },
                    },
                    required: ['taskId'],
                  },
                },
                {
                  name: 'submit_task_dataset',
                  description:
                    '批量创建任务（严格要求：每个任务必须提供 boardId 与 status，且 status 必须是该看板列的 UUID；禁止使用列名）。如不清楚列UUID，请先用 get_columns 获取。',
                  inputSchema: {
                    type: 'object',
                    properties: {
                      tasks: {
                        type: 'array',
                        description:
                          '任务数据数组。每个任务需包含 title、boardId（看板UUID）与 status（列UUID）。status 绝不能使用列名。',
                        items: {
                          type: 'object',
                          properties: {
                            title: { type: 'string', description: '任务标题' },
                            description: { type: 'string', description: '任务描述（可选）' },
                            priority: {
                              type: 'string',
                              description: '优先级（可选）：High | Medium | Low',
                            },
                            boardId: {
                              type: 'string',
                              description: '看板ID（UUID）',
                            },
                            status: {
                              type: 'string',
                              description:
                                '状态列ID（UUID，严格要求）。使用 get_columns(boardId) 获取列UUID，不要传列名。',
                              pattern: '^[0-9a-fA-F-]{36}$',
                            },
                            dueDate: { type: 'string', description: '截止时间（可选，ISO字符串）' },
                            tags: {
                              type: 'array',
                              description: '标签列表（可选）',
                              items: { type: 'string' },
                            },
                          },
                          required: ['title', 'boardId', 'status'],
                          examples: [
                            {
                              title: '修复登录异常',
                              boardId: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
                              status: 'yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy',
                              priority: 'Medium',
                            },
                          ],
                        },
                      },
                    },
                    required: ['tasks'],
                  },
                },
                {
                  name: 'update_task',
                  description: '更新任务',
                  inputSchema: {
                    type: 'object',
                    properties: {
                      taskId: {
                        type: 'string',
                        description: '任务ID',
                      },
                      title: {
                        type: 'string',
                        description: '任务标题',
                      },
                      description: {
                        type: 'string',
                        description: '任务描述',
                      },
                      status: {
                        type: 'string',
                        description: '任务状态',
                      },
                      priority: {
                        type: 'string',
                        description: '优先级',
                      },
                    },
                    required: ['taskId'],
                  },
                },
                {
                  name: 'delete_task',
                  description: '删除任务',
                  inputSchema: {
                    type: 'object',
                    properties: {
                      taskId: {
                        type: 'string',
                        description: '要删除的任务ID',
                      },
                    },
                    required: ['taskId'],
                  },
                },
                {
                  name: 'clear_all_tasks',
                  description: '清空所有任务',
                  inputSchema: {
                    type: 'object',
                    properties: {
                      boardId: {
                        type: 'string',
                        description: '看板ID（可选）',
                      },
                    },
                  },
                },
                {
                  name: 'get_task_schema',
                  description: '获取任务Schema定义',
                  inputSchema: {
                    type: 'object',
                    properties: {
                      boardId: {
                        type: 'string',
                        description: '看板ID',
                      },
                    },
                    required: ['boardId'],
                  },
                },
                {
                  name: 'get_columns',
                  description: '获取看板列',
                  inputSchema: {
                    type: 'object',
                    properties: {
                      boardId: {
                        type: 'string',
                        description: '看板ID',
                      },
                    },
                  },
                },
                {
                  name: 'create_column',
                  description: '创建看板列',
                  inputSchema: {
                    type: 'object',
                    properties: {
                      column_data: {
                        type: 'object',
                        properties: {
                          name: { type: 'string', description: '列名称' },
                          boardId: { type: 'string', description: '看板ID' },
                          order: { type: 'number', description: '排序顺序' },
                          color: { type: 'string', description: '列背景色' },
                          isDefault: { type: 'boolean', description: '是否为默认列' },
                        },
                        required: ['name', 'boardId', 'order'],
                      },
                    },
                    required: ['column_data'],
                  },
                },
                {
                  name: 'update_column',
                  description: '更新看板列',
                  inputSchema: {
                    type: 'object',
                    properties: {
                      column_id: { type: 'string', description: '列ID' },
                      updates: {
                        type: 'object',
                        properties: {
                          name: { type: 'string', description: '列名称' },
                          color: { type: 'string', description: '列背景色' },
                          order: { type: 'number', description: '排序顺序' },
                        },
                      },
                    },
                    required: ['column_id', 'updates'],
                  },
                },
                {
                  name: 'delete_column',
                  description: '删除看板列',
                  inputSchema: {
                    type: 'object',
                    properties: {
                      column_id: { type: 'string', description: '列ID' },
                    },
                    required: ['column_id'],
                  },
                },
                {
                  name: 'reorder_columns',
                  description: '重新排序看板列',
                  inputSchema: {
                    type: 'object',
                    properties: {
                      boardId: { type: 'string', description: '看板ID' },
                      column_ids: {
                        type: 'array',
                        items: { type: 'string' },
                        description: '列ID数组（按新顺序）',
                      },
                    },
                    required: ['boardId', 'column_ids'],
                  },
                },
                {
                  name: 'update_task_color',
                  description: '更新任务颜色',
                  inputSchema: {
                    type: 'object',
                    properties: {
                      task_id: { type: 'string', description: '任务ID' },
                      color: { type: 'string', description: '颜色值' },
                    },
                    required: ['task_id'],
                  },
                },
                {
                  name: 'get_user_hierarchy',
                  description:
                    '获取当前用户的完整层级结构：工作区→项目→看板→列，返回每个节点的 UUID 与名称。建议在创建任务前先调用此工具以获取 boardId 和列UUID（status）。',
                  inputSchema: {
                    type: 'object',
                    properties: {},
                  },
                },
                {
                  name: 'get_workspaces',
                  description: '获取工作区列表',
                  inputSchema: {
                    type: 'object',
                    properties: {},
                  },
                },
                {
                  name: 'get_projects',
                  description: '获取项目列表',
                  inputSchema: {
                    type: 'object',
                    properties: {},
                  },
                },
                {
                  name: 'get_boards',
                  description: '获取看板列表',
                  inputSchema: {
                    type: 'object',
                    properties: {},
                  },
                },
                {
                  name: 'create_project',
                  description: '创建项目（必须指定工作区UUID）',
                  inputSchema: {
                    type: 'object',
                    properties: {
                      name: { type: 'string', description: '项目名称' },
                      description: { type: 'string', description: '项目描述（可选）' },
                      workspaceId: {
                        type: 'string',
                        description: '工作区ID（UUID，严格要求）',
                        pattern: '^[0-9a-fA-F-]{36}$',
                      },
                    },
                    required: ['name', 'workspaceId'],
                  },
                },
                {
                  name: 'create_board',
                  description: '创建看板（必须指定项目UUID）',
                  inputSchema: {
                    type: 'object',
                    properties: {
                      name: { type: 'string', description: '看板名称' },
                      description: { type: 'string', description: '看板描述（可选）' },
                      projectId: {
                        type: 'string',
                        description: '项目ID（UUID，严格要求）',
                        pattern: '^[0-9a-fA-F-]{36}$',
                      },
                    },
                    required: ['name', 'projectId'],
                  },
                },
              ],
            },
            id: body.id,
          };
          // 新增：返回空的 prompts 列表，满足 Host 对 offerings 的校验
          } else if (body.method === 'prompts/list') {
            reply.header('Content-Type', 'application/json; charset=utf-8');
            return {
              jsonrpc: '2.0',
              result: { prompts: [] },
              id: body.id,
            };
          // 新增：返回空的 resources 列表
          } else if (body.method === 'resources/list') {
            reply.header('Content-Type', 'application/json; charset=utf-8');
            return {
              jsonrpc: '2.0',
              result: { resources: [] },
              id: body.id,
            };

        } else if (body.method === 'tools/call') {
          // 处理工具调用
          const toolName = body.params?.name;
          const toolArgs = body.params?.arguments || {};

          if (toolName) {
            try {
              // 设置正确的Content-Type为JSON响应，确保UTF-8编码
              reply.header('Content-Type', 'application/json; charset=utf-8');

              // 将UserContext转换为McpUserContext
              const mcpUserContext: McpUserContext = {
                userId: mcpUser.userId,
                apiKeyId: request.apiKey?.id || '',
                permissions: mcpUser.permissions as unknown as ApiKeyPermission[],
                ipAddress: request.ip,
                userAgent: request.headers['user-agent'],
              };

              const result = await dispatchMcpTool(toolName, toolArgs, mcpUserContext, io);

              // 确保结果以UTF-8编码正确序列化
              const resultText = JSON.stringify(result, null, 2);

              return {
                jsonrpc: '2.0',
                result: {
                  content: [
                    {
                      type: 'text',
                      text: resultText,
                    },
                  ],
                },
                id: body.id,
              };
            } catch (error) {
              // 设置错误响应的Content-Type
              reply.header('Content-Type', 'application/json; charset=utf-8');

              return {
                jsonrpc: '2.0',
                error: {
                  code: -32603,
                  message: error instanceof Error ? error.message : '工具执行失败',
                },
                id: body.id,
              };
            }
          }
        }

        // 临时响应，实际实现需要整合原有的MCP服务
        return {
          jsonrpc: '2.0',
          result: {
            message: 'MCP认证服务已就绪',
          },
          id: body.id,
        };
      } catch (error) {
        console.error('MCP请求处理失败:', error);

        return reply.status(500).send({
          jsonrpc: '2.0',
          error: {
            code: -32603,
            message: '内部服务器错误',
          },
          id: null,
        });
      }
    },
  );

  console.log('带认证的MCP服务配置完成');
}

/**
 * 判断是否为只读工具
 */
function isReadOnlyTool(toolName: string): boolean {
  const readOnlyTools = [
    'get_task_schema',
    'list_tasks',
    'get_task_details',
    'get_columns',
    'get_workspaces',
    'get_projects',
    'get_boards',
  ];

  return readOnlyTools.includes(toolName) || toolName.startsWith('get_');
}

/**
 * MCP工具分发器
 *
 * 根据工具名称和用户上下文执行相应的工具逻辑
 */
async function dispatchMcpTool(
  toolName: string,
  params: any,
  mcpUser: McpUserContext,
  io: SocketIOServer,
): Promise<any> {
  // 为所有参数添加用户上下文
  const contextParams = {
    ...params,
    _mcpUser: mcpUser,
  };

  switch (toolName) {
    case 'get_task_schema':
      return await handleGetTaskSchema(contextParams);

    case 'list_tasks':
      return await handleListTasks(contextParams);

    case 'get_task_details':
      return await handleGetTaskDetails(contextParams);

    case 'submit_task_dataset':
      return await handleSubmitTaskDataset(contextParams, io);

    case 'update_task':
      return await handleUpdateTask(contextParams, io);

    case 'delete_task':
      return await handleDeleteTask(contextParams, io);

    case 'get_columns':
      return await handleGetColumns(contextParams);

    case 'create_column':
      return await handleCreateColumn(contextParams, io);

    case 'update_column':
      return await handleUpdateColumn(contextParams, io);

    case 'delete_column':
      return await handleDeleteColumn(contextParams, io);

    case 'reorder_columns':
      return await handleReorderColumns(contextParams, io);

    case 'clear_all_tasks':
      return await handleClearAllTasks(contextParams, io);

    case 'update_task_color':
      return await handleUpdateTaskColor(contextParams, io);

    case 'get_user_hierarchy':
      return await handleGetUserHierarchy(contextParams);

    case 'get_workspaces':
      return await handleGetWorkspaces(contextParams);

    case 'get_projects':
      return await handleGetProjects(contextParams);

    case 'get_boards':
      return await handleGetBoards(contextParams);

    case 'create_project':
      return await handleCreateProject(contextParams, io);

    case 'create_board':
      return await handleCreateBoard(contextParams, io);

    default:
      throw new Error(`未知的MCP工具: ${toolName}`);
  }
}

/**
 * 以下是具体的工具处理函数
 * 每个函数都会从params中获取用户上下文，并确保数据隔离
 */

async function handleGetTaskSchema(params: any): Promise<any> {
  const mcpUser = params._mcpUser as McpUserContext;
  const { boardId } = params;

  // 如果提供了boardId，验证用户是否有权限访问该看板
  if (boardId) {
    const board = await prisma.board.findFirst({
      where: {
        id: boardId,
        ownerId: mcpUser.userId,
      },
      include: {
        columns: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!board) {
      throw new Error('看板不存在或无权访问');
    }

    const columns = board.columns;

    const schema = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      title: 'Task',
      description: 'Schema for a single task item',
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'The main title or name of the task',
        },
        description: {
          type: 'string',
          description: 'Detailed description of the task (can be Markdown)',
        },
        status: {
          type: 'string',
          description: '任务状态 - 必须使用列的UUID，不能使用列名称',
          enum: columns.map((col) => col.id),
        },
        priority: {
          type: 'string',
          enum: ['High', 'Medium', 'Low'],
          description: 'Priority of the task',
        },
        boardId: {
          type: 'string',
          description: '看板ID - 必须指定任务所属的看板',
          enum: [boardId],
        },
      },
      required: ['title', 'status', 'boardId'],
    };

    return {
      schema,
      availableColumns: columns.map((col) => ({
        id: col.id,
        name: col.name,
        order: col.order,
        boardId: col.boardId,
      })),
      availableBoards: [
        {
          id: board.id,
          name: board.name,
        },
      ],
      usage: {
        note: '创建任务时，status字段必须使用列的UUID，boardId必须指定看板UUID',
        example: {
          title: '示例任务',
          status: columns[0]?.id || '列UUID',
          boardId: boardId,
          description: '任务描述',
          priority: 'High',
        },
      },
    };
  }

  // 如果没有提供boardId，获取用户的所有看板信息
  const boards = await prisma.board.findMany({
    where: { ownerId: mcpUser.userId },
    include: {
      columns: {
        orderBy: { order: 'asc' },
      },
    },
    take: 10, // 限制返回的看板数量
  });

  if (boards.length === 0) {
    throw new Error('用户暂无看板，请先创建看板');
  }

  // 收集所有列信息
  const allColumns = boards.flatMap((board) =>
    board.columns.map((col) => ({
      id: col.id,
      name: col.name,
      order: col.order,
      boardId: col.boardId,
    })),
  );

  const schema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'Task',
    description: 'Schema for a single task item',
    type: 'object',
    properties: {
      title: {
        type: 'string',
        description: 'The main title or name of the task',
      },
      description: {
        type: 'string',
        description: 'Detailed description of the task (can be Markdown)',
      },
      status: {
        type: 'string',
        description: '任务状态 - 必须使用列的UUID，不能使用列名称',
        enum: allColumns.map((col) => col.id),
      },
      priority: {
        type: 'string',
        enum: ['High', 'Medium', 'Low'],
        description: 'Priority of the task',
      },
      boardId: {
        type: 'string',
        description: '看板ID - 必须指定任务所属的看板',
        enum: boards.map((board) => board.id),
      },
    },
    required: ['title', 'status', 'boardId'],
  };

  return {
    schema,
    availableColumns: allColumns,
    availableBoards: boards.map((board) => ({
      id: board.id,
      name: board.name,
    })),
    usage: {
      note: '创建任务时，status字段必须使用列的UUID，boardId必须指定看板UUID',
      example: {
        title: '示例任务',
        status: allColumns[0]?.id || '列UUID',
        boardId: boards[0].id,
        description: '任务描述',
        priority: 'High',
      },
    },
  };
}

async function handleListTasks(params: any): Promise<any> {
  const mcpUser = params._mcpUser as McpUserContext;
  const { boardId, filter_options } = params;

  // 构建查询条件，确保只返回用户的任务
  const where: any = {
    ownerId: mcpUser.userId,
  };

  // 如果指定了看板ID，添加看板过滤
  if (boardId) {
    where.boardId = boardId;
  }

  // 应用其他过滤条件
  if (filter_options) {
    if (filter_options.status) {
      where.status = filter_options.status;
    }
    if (filter_options.priority) {
      where.priority = filter_options.priority;
    }
    if (filter_options.assignees && Array.isArray(filter_options.assignees) && filter_options.assignees.length > 0) {
      where.assignees = {
        hasSome: filter_options.assignees,
      };
    }
    if (filter_options.tags && filter_options.tags.length > 0) {
      where.tags = {
        some: {
          name: {
            in: filter_options.tags,
          },
        },
      };
    }
  }

  const tasks = await prisma.task.findMany({
    where,
    include: {
      tags: true,
    },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  });

  return tasks;
}

// 其他工具处理函数的基本框架
async function handleGetTaskDetails(params: any): Promise<any> {
  const mcpUser = params._mcpUser as McpUserContext;
  const { task_id } = params;

  const task = await prisma.task.findFirst({
    where: {
      id: task_id,
      ownerId: mcpUser.userId, // 确保只能访问用户自己的任务
    },
    include: {
      tags: true,
    },
  });

  if (!task) {
    throw new Error('任务不存在或无权访问');
  }

  return task;
}

async function handleSubmitTaskDataset(params: any, io: SocketIOServer): Promise<any> {
  console.log('🔧 handleSubmitTaskDataset 被调用，参数:', JSON.stringify(params, null, 2));

  const mcpUser = params._mcpUser as McpUserContext;
  const { tasks, boardId } = params;

  console.log('🔧 解析参数:', {
    mcpUser: mcpUser?.userId,
    tasksLength: Array.isArray(tasks) ? tasks.length : 'not array',
    boardId
  });

  if (!Array.isArray(tasks) || tasks.length === 0) {
    throw new Error('任务数据不能为空');
  }

  const createdTasks: any[] = [];

  // 使用事务确保数据一致性
  await prisma.$transaction(async (tx) => {
    // 确定使用的看板ID
    let targetBoardId = boardId;

    if (!targetBoardId) {
      // 如果没有指定boardId，获取用户的默认看板
      const defaultBoard = await tx.board.findFirst({
        where: {
          ownerId: mcpUser.userId,
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

      if (!defaultBoard) {
        // 如果用户没有任何看板，创建一个默认看板
        const newBoard = await tx.board.create({
          data: {
            name: '我的看板',
            description: '默认看板',
            ownerId: mcpUser.userId,
            order: 0,
          },
        });

        // 创建默认列
        const defaultColumns = [
          { name: '待办', order: 0, isDefault: true },
          { name: '进行中', order: 1, isDefault: true },
          { name: '已完成', order: 2, isDefault: true },
        ];

        for (const column of defaultColumns) {
          await tx.boardColumn.create({
            data: {
              ...column,
              boardId: newBoard.id,
            },
          });
        }

        targetBoardId = newBoard.id;
      } else {
        targetBoardId = defaultBoard.id;
      }
    } else {
      // 验证指定的看板所有权
      const board = await tx.board.findFirst({
        where: {
          id: targetBoardId,
          ownerId: mcpUser.userId,
        },
      });

      if (!board) {
        throw new Error(`看板 ${targetBoardId} 不存在或无权访问`);
      }
    }

    // 获取看板的默认列（用于没有指定status的任务）
    const defaultColumn = await tx.boardColumn.findFirst({
      where: {
        boardId: targetBoardId,
        isDefault: true,
      },
      orderBy: {
        order: 'asc',
      },
    });

    for (const taskData of tasks) {

      // 确定任务状态（如果没有指定，使用默认列）
      let taskStatus = taskData.status;
      if (!taskStatus && defaultColumn) {
        taskStatus = defaultColumn.id;
      }

      // 确保targetBoardId不为空
      if (!targetBoardId) {
        throw new Error('无法确定目标看板ID');
      }

      // 确保有有效的状态列ID
      if (!taskStatus) {
        throw new Error('无法确定任务状态列，请指定有效的status或确保看板有默认列');
      }

      console.log('创建任务数据:', {
        title: taskData.title,
        targetBoardId,
        taskStatus,
        userId: mcpUser.userId
      });

      // 验证状态列是否属于目标看板
      const statusColumn = await tx.boardColumn.findFirst({
        where: {
          id: taskStatus,
          boardId: targetBoardId,
        },
      });

      if (!statusColumn) {
        throw new Error(`状态列 ${taskStatus} 不属于看板 ${targetBoardId}`);
      }

      // 创建任务，确保设置正确的所有者
      const task = await tx.task.create({
        data: {
          title: taskData.title,
          description: taskData.description || '',
          status: taskStatus, // 使用验证过的状态列ID
          priority: taskData.priority || null,
          dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
          assignees: taskData.assignees || [],
          acceptanceCriteria: taskData.acceptanceCriteria || '',
          estimatedEffort: taskData.estimatedEffort || null,
          loggedTime: taskData.loggedTime || null,
          boardId: targetBoardId,
          ownerId: mcpUser.userId, // 确保设置正确的所有者
        },
        include: {
          tags: true,
        },
      });

      createdTasks.push(task);
    }
  });

  // 通过WebSocket广播任务添加事件
  io.emit('tasks_added', createdTasks);

  return createdTasks;
}

async function handleUpdateTask(params: any, io: SocketIOServer): Promise<any> {
  const mcpUser = params._mcpUser as McpUserContext;
  const { task_id, updates } = params;

  // 验证任务所有权
  const existingTask = await prisma.task.findFirst({
    where: {
      id: task_id,
      ownerId: mcpUser.userId,
    },
  });

  if (!existingTask) {
    throw new Error('任务不存在或无权修改');
  }

  const updatedTask = await prisma.task.update({
    where: { id: task_id },
    data: {
      ...updates,
      updatedAt: new Date(),
    },
    include: {
      tags: true,
    },
  });

  // 广播任务更新事件
  io.emit('task_updated', updatedTask);

  return updatedTask;
}

async function handleDeleteTask(params: any, io: SocketIOServer): Promise<any> {
  const mcpUser = params._mcpUser as McpUserContext;
  const { task_id } = params;

  // 验证任务所有权
  const task = await prisma.task.findFirst({
    where: {
      id: task_id,
      ownerId: mcpUser.userId,
    },
  });

  if (!task) {
    throw new Error('任务不存在或无权删除');
  }

  await prisma.task.delete({
    where: { id: task_id },
  });

  // 广播任务删除事件
  io.emit('task_deleted', { taskId: task_id });

  return { success: true, taskId: task_id };
}

async function handleGetColumns(params: any): Promise<any> {
  const mcpUser = params._mcpUser as McpUserContext;
  const { boardId } = params;

  // 验证看板所有权
  const board = await prisma.board.findFirst({
    where: {
      id: boardId,
      ownerId: mcpUser.userId,
    },
  });

  if (!board) {
    throw new Error('看板不存在或无权访问');
  }

  const columns = await prisma.boardColumn.findMany({
    where: { boardId },
    orderBy: { order: 'asc' },
  });

  return columns;
}

async function handleCreateColumn(params: any, io: SocketIOServer): Promise<any> {
  const mcpUser = params._mcpUser as McpUserContext;
  const { column_data } = params;

  // 验证看板所有权
  const board = await prisma.board.findFirst({
    where: {
      id: column_data.boardId,
      ownerId: mcpUser.userId,
    },
  });

  if (!board) {
    throw new Error('看板不存在或无权访问');
  }

  const newColumn = await prisma.boardColumn.create({
    data: column_data,
  });

  // 广播列创建事件
  io.emit('column_created', newColumn);

  return newColumn;
}

async function handleUpdateColumn(params: any, io: SocketIOServer): Promise<any> {
  const mcpUser = params._mcpUser as McpUserContext;
  const { column_id, updates } = params;

  // 验证列所有权（通过看板）
  const column = await prisma.boardColumn.findFirst({
    where: {
      id: column_id,
      board: {
        ownerId: mcpUser.userId,
      },
    },
  });

  if (!column) {
    throw new Error('列不存在或无权修改');
  }

  const updatedColumn = await prisma.boardColumn.update({
    where: { id: column_id },
    data: updates,
  });

  // 广播列更新事件
  io.emit('column_updated', updatedColumn);

  return updatedColumn;
}

async function handleDeleteColumn(params: any, io: SocketIOServer): Promise<any> {
  const mcpUser = params._mcpUser as McpUserContext;
  const { column_id } = params;

  // 验证列所有权（通过看板）
  const column = await prisma.boardColumn.findFirst({
    where: {
      id: column_id,
      board: {
        ownerId: mcpUser.userId,
      },
    },
  });

  if (!column) {
    throw new Error('列不存在或无权删除');
  }

  // 检查列中是否有任务
  const taskCount = await prisma.task.count({
    where: { status: column_id },
  });

  if (taskCount > 0) {
    throw new Error('列中还有任务，无法删除');
  }

  await prisma.boardColumn.delete({
    where: { id: column_id },
  });

  // 广播列删除事件
  io.emit('column_deleted', { id: column_id });

  return { success: true, id: column_id };
}

async function handleReorderColumns(params: any, io: SocketIOServer): Promise<any> {
  const mcpUser = params._mcpUser as McpUserContext;
  const { boardId, column_ids } = params;

  // 验证看板所有权
  const board = await prisma.board.findFirst({
    where: {
      id: boardId,
      ownerId: mcpUser.userId,
    },
  });

  if (!board) {
    throw new Error('看板不存在或无权访问');
  }

  // 更新列顺序 - 先设置临时顺序避免唯一约束冲突
  const updatedColumns = await prisma.$transaction(async (tx) => {
    // 第一步：将所有列设置为负数顺序，避免冲突
    for (let i = 0; i < column_ids.length; i++) {
      await tx.boardColumn.update({
        where: { id: column_ids[i] },
        data: { order: -(i + 1000) }, // 使用负数临时顺序
      });
    }

    // 第二步：设置最终顺序
    const results = [];
    for (let i = 0; i < column_ids.length; i++) {
      const updatedColumn = await tx.boardColumn.update({
        where: { id: column_ids[i] },
        data: { order: i },
      });
      results.push(updatedColumn);
    }
    return results;
  });

  // 广播列重排序事件
  io.emit('columns_reordered', updatedColumns);

  return updatedColumns;
}

async function handleClearAllTasks(params: any, io: SocketIOServer): Promise<any> {
  const mcpUser = params._mcpUser as McpUserContext;

  // 只删除用户自己的任务
  const deletedTasks = await prisma.task.deleteMany({
    where: {
      ownerId: mcpUser.userId,
    },
  });

  const result = {
    success: true,
    deletedCount: deletedTasks.count,
    message: `已删除 ${deletedTasks.count} 个任务`,
  };

  // 广播任务清除事件
  io.emit('user_tasks_cleared', {
    userId: mcpUser.userId,
    deletedCount: deletedTasks.count,
  });

  return result;
}

async function handleGetWorkspaces(params: any): Promise<any> {
  const mcpUser = params._mcpUser as McpUserContext;


  const workspaces = await prisma.workspace.findMany({
    where: { ownerId: mcpUser.userId },
    include: {
      projects: {
        include: {
          boards: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  return workspaces;
}

async function handleGetProjects(params: any): Promise<any> {
  const mcpUser = params._mcpUser as McpUserContext;
  const { workspaceId } = params;

  const where: any = {
    ownerId: mcpUser.userId,
  };

  if (workspaceId) {
    where.workspaceId = workspaceId;
  }

  const projects = await prisma.project.findMany({
    where,
    include: {
      boards: {
        include: {
          columns: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  return projects;
}

async function handleGetBoards(params: any): Promise<any> {
  const mcpUser = params._mcpUser as McpUserContext;
  const { projectId, workspaceId } = params;

  const where: any = {
    ownerId: mcpUser.userId,
  };

  if (projectId) {
    where.projectId = projectId;
  } else if (workspaceId) {
    where.project = {
      workspaceId: workspaceId,
    };
  }

  const boards = await prisma.board.findMany({
    where,
    include: {
      columns: {
        orderBy: { order: 'asc' },
      },
      project: {
        include: {
          workspace: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  return boards;
}
/**
 * 工具：获取用户完整层级（工作区→项目→看板→列）
 * 返回所有节点的UUID+名称，用于在创建任务前查表使用
 */
async function handleGetUserHierarchy(params: any): Promise<any> {
  const mcpUser = params._mcpUser as McpUserContext;

  const workspaces = await prisma.workspace.findMany({
    where: { ownerId: mcpUser.userId },
    include: {
      projects: {
        include: {
          boards: {
            include: {
              columns: { orderBy: { order: 'asc' } },
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  return workspaces.map((ws) => ({
    id: ws.id,
    name: ws.name,
    projects: ws.projects.map((p) => ({
      id: p.id,
      name: p.name,
      boards: p.boards.map((b) => ({
        id: b.id,
        name: b.name,
        columns: b.columns.map((c) => ({ id: c.id, name: c.name })),
      })),
    })),
  }));
}


async function handleUpdateTaskColor(params: any, io: SocketIOServer): Promise<any> {
  const mcpUser = params._mcpUser as McpUserContext;
  const { task_id, color } = params;

  // 验证任务所有权
  const existingTask = await prisma.task.findFirst({
    where: {
      id: task_id,
      ownerId: mcpUser.userId,
    },
  });

  if (!existingTask) {
    throw new Error('任务不存在或无权修改');
  }

  const updatedTask = await prisma.task.update({
    where: { id: task_id },
    data: {
      color: color || null,
      updatedAt: new Date(),
    },
    include: {
      tags: true,
    },
  });

  // 广播任务更新事件
  io.emit('task_updated', updatedTask);

  return updatedTask;
}


/**
 * 工具：创建项目
 * 要求：workspaceId 必须属于当前用户；返回新项目的基础信息
 */
async function handleCreateProject(params: any, io: SocketIOServer): Promise<any> {
  const mcpUser = params._mcpUser as McpUserContext;
  const { name, description, workspaceId } = params;

  if (!name || !workspaceId) {
    throw new Error('缺少必要参数：name 与 workspaceId');
  }

  // 验证工作区归属
  const ws = await prisma.workspace.findFirst({
    where: { id: workspaceId, ownerId: mcpUser.userId },
  });
  if (!ws) throw new Error('工作区不存在或无权访问');

  const project = await prisma.project.create({
    data: {
      name,
      description: description || null,
      workspaceId,
      ownerId: mcpUser.userId,
    },
  });

  return { id: project.id, name: project.name, description: project.description, workspaceId: project.workspaceId };
}

/**
 * 工具：创建看板
 * 要求：projectId 必须属于当前用户；返回新看板的基础信息
 */
async function handleCreateBoard(params: any, io: SocketIOServer): Promise<any> {
  const mcpUser = params._mcpUser as McpUserContext;
  const { name, description, projectId } = params;

  if (!name || !projectId) {
    throw new Error('缺少必要参数：name 与 projectId');
  }

  // 验证项目归属
  const proj = await prisma.project.findFirst({
    where: { id: projectId, ownerId: mcpUser.userId },
  });
  if (!proj) throw new Error('项目不存在或无权访问');

  const board = await prisma.board.create({
    data: {
      name,
      description: description || null,
      projectId,
      ownerId: mcpUser.userId,
    },
  });

  return { id: board.id, name: board.name, description: board.description, projectId: board.projectId };
}
