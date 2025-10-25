/**
 * 用户认证路由
 *
 * 提供用户注册、登录、登出、资料管理等API端点
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { authService } from '../services/authService';
import {
  UserRegisterRequest,
  UserLoginRequest,
  UserUpdateRequest,
  PasswordChangeRequest,
  PasswordResetInitRequest,
  PasswordResetRequest,
  AuthResponse,
  AuthErrorResponse,
  UserInfoResponse,
} from '../types/userTypes';
import { extractBearerToken, generateJWT } from '../utils/jwtUtils';

/**
 * 注册认证相关路由
 */
export default async function authRoutes(fastify: FastifyInstance) {
  /**
   * 用户注册
   */
  fastify.post<{
    Body: UserRegisterRequest;
  }>(
    '/auth/register',
    {
      schema: {
        description: '用户注册',
        tags: ['认证'],
        body: {
          type: 'object',
          required: ['username', 'email', 'password'],
          properties: {
            username: { type: 'string', minLength: 3, maxLength: 20 },
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6, maxLength: 50 },
            avatar: { type: 'string', format: 'uri' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              data: {
                type: 'object',
                properties: {
                  user: { type: 'object' },
                  token: { type: 'string' },
                  expiresAt: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
          400: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              error: { type: 'string' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: UserRegisterRequest }>, reply: FastifyReply) => {
      try {
        const userAgent = request.headers['user-agent'];
        const ipAddress = request.ip;

        const result = await authService.register(request.body, userAgent, ipAddress);

        reply.status(200).send(result);
      } catch (error) {
        console.error('用户注册失败:', error);

        const errorResponse: AuthErrorResponse = {
          success: false,
          error: error instanceof Error ? error.message : '注册失败',
        };

        reply.status(400).send(errorResponse);
      }
    },
  );

  /**
   * 用户登录
   */
  fastify.post<{
    Body: UserLoginRequest;
  }>(
    '/auth/login',
    {
      schema: {
        description: '用户登录',
        tags: ['认证'],
        body: {
          type: 'object',
          required: ['identifier', 'password'],
          properties: {
            identifier: { type: 'string', minLength: 1 },
            password: { type: 'string', minLength: 1 },
            rememberMe: { type: 'boolean' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              data: {
                type: 'object',
                properties: {
                  user: { type: 'object' },
                  token: { type: 'string' },
                  expiresAt: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
          401: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              error: { type: 'string' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: UserLoginRequest }>, reply: FastifyReply) => {
      try {
        const userAgent = request.headers['user-agent'];
        const ipAddress = request.ip;

        const result = await authService.login(request.body, userAgent, ipAddress);

        reply.status(200).send(result);
      } catch (error) {
        console.error('用户登录失败:', error);

        const errorResponse: AuthErrorResponse = {
          success: false,
          error: error instanceof Error ? error.message : '登录失败',
        };

        reply.status(401).send(errorResponse);
      }
    },
  );

  /**
   * 用户登出
   */
  fastify.post(
    '/auth/logout',
    {
      schema: {
        description: '用户登出',
        tags: ['认证'],
        headers: {
          type: 'object',
          properties: {
            authorization: { type: 'string' },
          },
          required: ['authorization'],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const token = extractBearerToken(request.headers.authorization);

        if (!token) {
          return reply.status(401).send({
            success: false,
            error: '缺少认证token',
          });
        }

        const result = await authService.logout(token);

        reply.status(200).send(result);
      } catch (error) {
        console.error('用户登出失败:', error);

        reply.status(500).send({
          success: false,
          error: '登出失败',
        });
      }
    },
  );

  /**
   * 验证token有效性
   */
  fastify.get(
    '/auth/verify',
    {
      schema: {
        description: '验证token有效性',
        tags: ['认证'],
        headers: {
          type: 'object',
          properties: {
            authorization: { type: 'string' },
          },
          required: ['authorization'],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
            },
          },
          401: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              error: { type: 'string' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const token = extractBearerToken(request.headers.authorization);

        if (!token) {
          return reply.status(401).send({
            success: false,
            error: '缺少认证token',
          });
        }

        const user = await authService.verifyToken(token);

        if (!user) {
          return reply.status(401).send({
            success: false,
            error: 'Token无效或已过期',
          });
        }

        reply.status(200).send({
          success: true,
          message: 'Token有效',
        });
      } catch (error) {
        console.error('Token验证失败:', error);

        reply.status(401).send({
          success: false,
          error: 'Token验证失败',
        });
      }
    },
  );

  /**
   * 刷新token
   */
  fastify.post(
    '/auth/refresh',
    {
      schema: {
        description: '刷新token',
        tags: ['认证'],
        headers: {
          type: 'object',
          properties: {
            authorization: { type: 'string' },
          },
          required: ['authorization'],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              data: {
                type: 'object',
                properties: {
                  token: { type: 'string' },
                  expiresAt: { type: 'string' },
                },
              },
            },
          },
          401: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              error: { type: 'string' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const token = extractBearerToken(request.headers.authorization);

        if (!token) {
          return reply.status(401).send({
            success: false,
            error: '缺少认证token',
          });
        }

        const user = await authService.verifyToken(token);

        if (!user) {
          return reply.status(401).send({
            success: false,
            error: 'Token无效或已过期',
          });
        }

        // 生成新的token
        const newToken = generateJWT({ userId: user.id, username: user.username });

        // 计算过期时间（30天后）
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        reply.status(200).send({
          success: true,
          message: 'Token刷新成功',
          data: {
            token: newToken,
            expiresAt: expiresAt.toISOString(),
          },
        });
      } catch (error) {
        console.error('Token刷新失败:', error);

        reply.status(401).send({
          success: false,
          error: 'Token刷新失败',
        });
      }
    },
  );

  /**
   * 获取当前用户信息
   */
  fastify.get(
    '/auth/me',
    {
      schema: {
        description: '获取当前用户信息',
        tags: ['认证'],
        headers: {
          type: 'object',
          properties: {
            authorization: { type: 'string' },
          },
          required: ['authorization'],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  user: { type: 'object' },
                },
              },
            },
          },
          401: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              error: { type: 'string' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const token = extractBearerToken(request.headers.authorization);

        if (!token) {
          return reply.status(401).send({
            success: false,
            error: '缺少认证token',
          });
        }

        const user = await authService.verifyToken(token);

        if (!user) {
          return reply.status(401).send({
            success: false,
            error: 'Token无效或已过期',
          });
        }

        const response: UserInfoResponse = {
          success: true,
          data: { user },
        };

        // 使用JSON字符串发送响应以避免Fastify序列化问题
        const responseString = JSON.stringify(response);
        reply.status(200).header('Content-Type', 'application/json').send(responseString);
      } catch (error) {
        console.error('获取用户信息失败:', error);

        reply.status(500).send({
          success: false,
          error: '获取用户信息失败',
        });
      }
    },
  );

  /**
   * 更新用户资料
   */
  fastify.put<{
    Body: UserUpdateRequest;
  }>(
    '/auth/profile',
    {
      schema: {
        description: '更新用户资料',
        tags: ['认证'],
        headers: {
          type: 'object',
          properties: {
            authorization: { type: 'string' },
          },
          required: ['authorization'],
        },
        body: {
          type: 'object',
          properties: {
            email: { type: 'string', format: 'email' },
            avatar: { type: 'string' },
            bio: { type: 'string', maxLength: 500 },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  user: { type: 'object' },
                },
              },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: UserUpdateRequest }>, reply: FastifyReply) => {
      try {
        const token = extractBearerToken(request.headers.authorization);

        if (!token) {
          return reply.status(401).send({
            success: false,
            error: '缺少认证token',
          });
        }

        const currentUser = await authService.verifyToken(token);

        if (!currentUser) {
          return reply.status(401).send({
            success: false,
            error: 'Token无效或已过期',
          });
        }

        const updatedUser = await authService.updateUserProfile(currentUser.id, request.body);

        const response: UserInfoResponse = {
          success: true,
          data: { user: updatedUser },
        };

        reply.status(200).send(response);
      } catch (error) {
        console.error('更新用户资料失败:', error);

        reply.status(400).send({
          success: false,
          error: error instanceof Error ? error.message : '更新用户资料失败',
        });
      }
    },
  );

  /**
   * 修改密码
   */
  fastify.put<{
    Body: PasswordChangeRequest;
  }>(
    '/auth/change-password',
    {
      schema: {
        description: '修改密码',
        tags: ['认证'],
        headers: {
          type: 'object',
          properties: {
            authorization: { type: 'string' },
          },
          required: ['authorization'],
        },
        body: {
          type: 'object',
          required: ['currentPassword', 'newPassword', 'confirmPassword'],
          properties: {
            currentPassword: { type: 'string', minLength: 1 },
            newPassword: { type: 'string', minLength: 6, maxLength: 50 },
            confirmPassword: { type: 'string', minLength: 1 },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: PasswordChangeRequest }>, reply: FastifyReply) => {
      try {
        const token = extractBearerToken(request.headers.authorization);

        if (!token) {
          return reply.status(401).send({
            success: false,
            error: '缺少认证token',
          });
        }

        const currentUser = await authService.verifyToken(token);

        if (!currentUser) {
          return reply.status(401).send({
            success: false,
            error: 'Token无效或已过期',
          });
        }

        const result = await authService.changePassword(
          currentUser.id,
          request.body.currentPassword,
          request.body.newPassword,
        );

        reply.status(200).send(result);
      } catch (error) {
        console.error('修改密码失败:', error);

        reply.status(400).send({
          success: false,
          error: error instanceof Error ? error.message : '修改密码失败',
        });
      }
    },
  );

  /**
   * 发送密码重置验证码（用户名 + 邮箱校验）
   */
  fastify.post<{
    Body: PasswordResetInitRequest;
  }>(
    '/auth/request-password-reset',
    {
      schema: {
        description: '发送密码重置验证码（用户名 + 邮箱验证）',
        tags: ['认证'],
        body: {
          type: 'object',
          required: ['username', 'email'],
          properties: {
            username: { type: 'string', minLength: 1 },
            email: { type: 'string', format: 'email' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              data: {
                type: 'object',
                properties: {
                  expiresAt: { type: 'string', format: 'date-time' },
                  maskedEmail: { type: 'string' },
                },
              },
            },
          },
          400: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              error: { type: 'string' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: PasswordResetInitRequest }>, reply: FastifyReply) => {
      try {
        const userAgent = request.headers['user-agent'];
        const result = await authService.requestPasswordReset(request.body, {
          userAgent: typeof userAgent === 'string' ? userAgent : undefined,
          ipAddress: request.ip,
        });

        reply.status(200).send(result);
      } catch (error) {
        console.error('发送密码重置验证码失败:', error);

        reply.status(400).send({
          success: false,
          error: error instanceof Error ? error.message : '发送验证码失败',
        });
      }
    },
  );

  /**
   * 重置密码（用户名 + 邮箱 + 验证码验证）
   */
  fastify.post<{
    Body: PasswordResetRequest;
  }>(
    '/auth/reset-password',
    {
      schema: {
        description: '重置密码（无需登录，基于用户名 + 邮箱 + 验证码）',
        tags: ['认证'],
        body: {
          type: 'object',
          required: ['username', 'email', 'verificationCode', 'newPassword', 'confirmPassword'],
          properties: {
            username: { type: 'string', minLength: 1 },
            email: { type: 'string', format: 'email' },
            verificationCode: { type: 'string', minLength: 6, maxLength: 6 },
            newPassword: { type: 'string', minLength: 6, maxLength: 50 },
            confirmPassword: { type: 'string', minLength: 1 },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
            },
          },
          400: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              error: { type: 'string' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: PasswordResetRequest }>, reply: FastifyReply) => {
      try {
        const result = await authService.resetPassword(request.body);

        reply.status(200).send(result);
      } catch (error) {
        console.error('密码重置失败:', error);

        reply.status(400).send({
          success: false,
          error: error instanceof Error ? error.message : '密码重置失败',
        });
      }
    },
  );
}

