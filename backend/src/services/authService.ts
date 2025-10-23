/**
 * 用户认证服务
 *
 * 提供用户注册、登录、密码验证、会话管理等核心认证功能
 */

import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import {
  User,
  UserSession,
  userRegisterSchema,
  userLoginSchema,
  UserRegisterRequest,
  UserLoginRequest,
  AuthResponse,
  UserUpdateRequest,
  userUpdateSchema,
  passwordChangeSchema,
  PasswordChangeRequest,
  passwordResetSchema,
  PasswordResetRequest,
} from '../types/userTypes';
import { generateJWT, verifyJWT, JWTPayload } from '../utils/jwtUtils';

const prisma = new PrismaClient();

/**
 * 认证服务类
 */
export class AuthService {
  private readonly saltRounds = 12; // bcrypt盐轮数

  /**
   * 用户注册
   */
  async register(
    data: UserRegisterRequest,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<AuthResponse> {
    // 验证输入数据
    const validatedData = userRegisterSchema.parse(data);

    // 检查用户名是否已存在
    const existingUsername = await prisma.user.findUnique({
      where: { username: validatedData.username },
    });
    if (existingUsername) {
      throw new Error('用户名已存在');
    }

    // 检查邮箱是否已存在
    const existingEmail = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });
    if (existingEmail) {
      throw new Error('邮箱已被注册');
    }

    // 加密密码
    const passwordHash = await bcrypt.hash(validatedData.password, this.saltRounds);

    // 创建用户
    const user = await prisma.user.create({
      data: {
        username: validatedData.username,
        email: validatedData.email,
        passwordHash,
        avatar: validatedData.avatar || null,
        bio: validatedData.bio || null,
        role: validatedData.role || 'user', // 设置默认角色为普通用户
        isActive: true,
        lastLoginAt: new Date(),
      },
    });

    // 生成JWT token
    const token = generateJWT({ userId: user.id, username: user.username });

    // 创建用户会话记录
    const session = await this.createSession(user.id, token, userAgent, ipAddress);

    // 创建默认工作区
    await this.createDefaultWorkspace(user.id);

    return {
      success: true,
      message: '注册成功',
      data: {
        user: this.sanitizeUser(user),
        token,
        expiresAt: session.expiresAt,
      },
    };
  }

  /**
   * 用户登录
   */
  async login(
    data: UserLoginRequest,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<AuthResponse> {
    // 验证输入数据
    const validatedData = userLoginSchema.parse(data);

    // 查找用户（支持用户名或邮箱登录）
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ username: validatedData.identifier }, { email: validatedData.identifier }],
        isActive: true,
      },
    });

    if (!user) {
      throw new Error('用户不存在或账户已被禁用');
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(validatedData.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('密码错误');
    }

    // 更新最后登录时间
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // 生成JWT token
    const token = generateJWT({ userId: user.id, username: user.username });

    // 创建用户会话记录
    const session = await this.createSession(user.id, token, userAgent, ipAddress);

    return {
      success: true,
      message: '登录成功',
      data: {
        user: this.sanitizeUser(user),
        token,
        expiresAt: session.expiresAt,
      },
    };
  }

  /**
   * 验证JWT token并获取用户信息
   */
  async verifyToken(token: string): Promise<User | null> {
    try {
      const payload = verifyJWT(token);

      // 获取用户信息
      const user = await prisma.user.findUnique({
        where: {
          id: payload.userId,
          isActive: true,
        },
      });

      const sanitizedUser = user ? this.sanitizeUser(user) : null;
      return sanitizedUser;
    } catch (error) {
      console.error('Token验证失败:', error);
      return null;
    }
  }

  /**
   * 用户登出
   */
  async logout(token: string): Promise<{ success: boolean; message: string }> {
    try {
      const payload = verifyJWT(token);

      // 撤销用户的所有会话（简化实现）
      await prisma.userSession.updateMany({
        where: {
          userId: payload.userId,
          isRevoked: false,
        },
        data: {
          isRevoked: true,
        },
      });

      return { success: true, message: '登出成功' };
    } catch (error) {
      console.error('登出失败:', error);
      return { success: false, message: '登出失败' };
    }
  }

  /**
   * 获取用户资料
   */
  async getUserProfile(userId: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId, isActive: true },
    });

    return user ? this.sanitizeUser(user) : null;
  }

  /**
   * 更新用户资料
   */
  async updateUserProfile(userId: string, data: UserUpdateRequest): Promise<User> {
    // 验证输入数据
    const validatedData = userUpdateSchema.parse(data);

    // 如果要更新邮箱，检查是否已被其他用户使用
    if (validatedData.email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: validatedData.email,
          id: { not: userId },
        },
      });
      if (existingUser) {
        throw new Error('邮箱已被其他用户使用');
      }
    }

    // 更新用户信息
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(validatedData.email && { email: validatedData.email }),
        ...(validatedData.avatar !== undefined && { avatar: validatedData.avatar }),
        ...(validatedData.bio !== undefined && { bio: validatedData.bio }),
        ...(validatedData.role && { role: validatedData.role }),
        updatedAt: new Date(),
      },
    });

    return this.sanitizeUser(updatedUser);
  }

  /**
   * 修改密码
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<{ success: boolean; message: string }> {
    // 获取用户当前密码哈希
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('用户不存在');
    }

    // 验证当前密码
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      throw new Error('当前密码错误');
    }

    // 加密新密码
    const newPasswordHash = await bcrypt.hash(newPassword, this.saltRounds);

    // 更新密码
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });

    // 撤销所有现有会话，强制重新登录
    await prisma.userSession.updateMany({
      where: { userId },
      data: { isRevoked: true },
    });

    return { success: true, message: '密码修改成功，请重新登录' };
  }

  /**
   * 重置密码（简化版：用户名+邮箱验证）
   */
  async resetPassword(data: PasswordResetRequest): Promise<{ success: boolean; message: string }> {
    // 验证输入数据
    const validatedData = passwordResetSchema.parse(data);

    // 查找用户（必须同时匹配用户名和邮箱）
    const user = await prisma.user.findFirst({
      where: {
        username: validatedData.username,
        email: validatedData.email,
        isActive: true,
      },
    });

    if (!user) {
      throw new Error('用户名或邮箱不匹配，请检查输入');
    }

    // 加密新密码
    const newPasswordHash = await bcrypt.hash(validatedData.newPassword, this.saltRounds);

    // 更新密码
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newPasswordHash,
        updatedAt: new Date(),
      },
    });

    // 撤销所有现有会话，强制重新登录
    await prisma.userSession.updateMany({
      where: { userId: user.id },
      data: { isRevoked: true },
    });

    return { success: true, message: '密码重置成功，请使用新密码登录' };
  }

  /**
   * 创建用户会话记录
   */
  private async createSession(
    userId: string,
    token: string,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<UserSession> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7天后过期

    // 生成唯一的tokenHash
    const tokenHash = bcrypt.hashSync(token + Date.now().toString(), 10);

    return await prisma.userSession.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
        isRevoked: false,
        userAgent: userAgent || null,
        ipAddress: ipAddress || null,
      },
    });
  }

  /**
   * 创建默认工作区
   */
  private async createDefaultWorkspace(userId: string): Promise<void> {
    await prisma.workspace.create({
      data: {
        name: '我的工作区',
        description: '默认工作区',
        ownerId: userId,
        isDefault: true,
      },
    });
  }

  /**
   * 清理用户敏感信息
   */
  private sanitizeUser(user: any): User {
    if (!user) {
      return {} as User;
    }

    const { passwordHash, ...sanitizedUser } = user;
    return sanitizedUser;
  }
}

// 导出服务实例
export const authService = new AuthService();
