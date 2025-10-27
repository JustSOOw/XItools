/**
 * 用户认证服务
 *
 * 提供用户注册、登录、密码验证、会话管理等核心认证功能
 */

import crypto from 'crypto';
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
  passwordResetInitSchema,
  PasswordResetInitRequest,
  passwordResetSchema,
  PasswordResetRequest,
  registerVerificationInitSchema,
  RegisterVerificationInitRequest,
  AuthError,
  AuthErrorCode,
} from '../types/userTypes';
import { generateJWT, verifyJWT, JWTPayload } from '../utils/jwtUtils';
import { sendPasswordResetCodeEmail, sendRegisterVerificationCodeEmail } from './emailService';

const prisma = new PrismaClient();

/**
 * 认证服务类
 */
export class AuthService {
  private readonly saltRounds = 12; // bcrypt盐轮数
  private readonly resetTokenTTLMinutes = 15; // 验证码有效分钟数
  private readonly resetTokenMaxAttempts = 5; // 验证码最大尝试次数
  private readonly resetTokenResendIntervalSeconds = 60; // 重发冷却秒数
  private readonly registerTokenTTLMinutes = 15; // 注册验证码有效分钟数
  private readonly registerTokenMaxAttempts = 5; // 注册验证码最大尝试次数
  private readonly registerTokenResendIntervalSeconds = 60; // 注册验证码重发冷却秒数

  /**
   * 发送注册验证码
   */
  async requestRegisterVerification(
    data: RegisterVerificationInitRequest,
    meta?: { userAgent?: string; ipAddress?: string },
  ): Promise<{ success: boolean; message: string; data: { expiresAt: Date; maskedEmail: string } }> {
    const validatedData = registerVerificationInitSchema.parse(data);

    // 检查邮箱是否已被注册
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      throw new Error('该邮箱已被注册，请直接登录或使用其他邮箱');
    }

    const now = new Date();

    // 标记过期的验证码为已使用
    await prisma.registerVerificationToken.updateMany({
      where: {
        email: validatedData.email,
        isUsed: false,
        expiresAt: { lt: now },
      },
      data: {
        isUsed: true,
        consumedAt: now,
      },
    });

    // 检查是否有未过期的验证码（防止重复发送）
    const lastToken = await prisma.registerVerificationToken.findFirst({
      where: {
        email: validatedData.email,
        isUsed: false,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (lastToken) {
      const lastCreatedAt = new Date(lastToken.createdAt ?? now);
      const elapsedMs = now.getTime() - lastCreatedAt.getTime();
      const cooldownMs = this.registerTokenResendIntervalSeconds * 1000;

      if (elapsedMs < cooldownMs) {
        const secondsLeft = Math.max(1, Math.ceil((cooldownMs - elapsedMs) / 1000));
        throw new Error('验证码已发送，请 ' + secondsLeft + ' 秒后再试');
      }
    }

    // 生成6位数验证码
    const verificationCode = this.generateVerificationCode();
    const expiresAt = new Date(now.getTime() + this.registerTokenTTLMinutes * 60 * 1000);

    // 保存验证码（哈希后）
    await prisma.registerVerificationToken.create({
      data: {
        email: validatedData.email,
        codeHash: this.hashVerificationCode(verificationCode),
        expiresAt,
        ipAddress: meta?.ipAddress ?? null,
        userAgent: meta?.userAgent ?? null,
      },
    });

    // 开发环境下打印验证码到控制台
    if (process.env.NODE_ENV !== 'production') {
      console.info('[RegisterVerification] Verification code for ' + validatedData.email + ': ' + verificationCode);
    }

    // 发送邮件
    await sendRegisterVerificationCodeEmail({
      to: validatedData.email,
      code: verificationCode,
      expiresAt,
    });

    return {
      success: true,
      message: '验证码已发送，请检查您的邮箱。',
      data: {
        expiresAt,
        maskedEmail: this.maskEmail(validatedData.email),
      },
    };
  }

  /**
   * 用户注册（需要验证码）
   */
  async register(
    data: UserRegisterRequest,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<AuthResponse> {
    // 验证输入数据
    const validatedData = userRegisterSchema.parse(data);

    const now = new Date();

    // 验证邮箱验证码
    const activeToken = await prisma.registerVerificationToken.findFirst({
      where: {
        email: validatedData.email,
        isUsed: false,
        expiresAt: { gt: now },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!activeToken) {
      throw new AuthError(
        AuthErrorCode.INVALID_CREDENTIALS,
        '验证码无效或已过期，请重新获取验证码',
        400
      );
    }

    // 验证验证码
    const providedHash = this.hashVerificationCode(validatedData.verificationCode);

    if (providedHash !== activeToken.codeHash) {
      const nextAttempts = activeToken.attemptCount + 1;
      const shouldLock = nextAttempts >= this.registerTokenMaxAttempts;

      await prisma.registerVerificationToken.update({
        where: { id: activeToken.id },
        data: {
          attemptCount: nextAttempts,
          ...(shouldLock ? { isUsed: true, consumedAt: now } : {}),
        },
      });

      if (shouldLock) {
        throw new AuthError(
          AuthErrorCode.RATE_LIMITED,
          '验证码尝试次数过多，请重新获取验证码',
          429
        );
      }

      throw new AuthError(AuthErrorCode.INVALID_CREDENTIALS, '验证码不正确，请重新输入', 400);
    }

    // 标记验证码为已使用
    await prisma.registerVerificationToken.update({
      where: { id: activeToken.id },
      data: {
        isUsed: true,
        consumedAt: now,
      },
    });

    // 检查用户名是否已存在
    const existingUsername = await prisma.user.findUnique({
      where: { username: validatedData.username },
    });
    if (existingUsername) {
      throw new AuthError(AuthErrorCode.USERNAME_TAKEN, '用户名已存在', 400);
    }

    // 检查邮箱是否已存在
    const existingEmail = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });
    if (existingEmail) {
      throw new AuthError(AuthErrorCode.EMAIL_TAKEN, '邮箱已被注册', 400);
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

    // 撤销该邮箱的所有未使用验证码
    await prisma.registerVerificationToken.updateMany({
      where: {
        email: validatedData.email,
        isUsed: false,
      },
      data: {
        isUsed: true,
        consumedAt: now,
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

    // 查找用户(支持用户名或邮箱登录)
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ username: validatedData.identifier }, { email: validatedData.identifier }],
        isActive: true,
      },
    });

    if (!user) {
      throw new AuthError(AuthErrorCode.USER_NOT_FOUND, '用户不存在或账户已被禁用', 401);
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(validatedData.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AuthError(AuthErrorCode.INVALID_CREDENTIALS, '密码错误', 401);
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
   * 请求密码重置验证码（用户名 + 邮箱验证）
   */
  async requestPasswordReset(
    data: PasswordResetInitRequest,
    meta?: { userAgent?: string; ipAddress?: string },
  ): Promise<{ success: boolean; message: string; data: { expiresAt: Date; maskedEmail: string } }> {
    const validatedData = passwordResetInitSchema.parse(data);

    const user = await prisma.user.findFirst({
      where: {
        username: validatedData.username,
        email: validatedData.email,
        isActive: true,
      },
    });

    if (!user) {
      throw new Error('用户名与邮箱不匹配或账号已被禁用');
    }

    const now = new Date();

    // 标记过期的验证码为已使用
    await prisma.passwordResetToken.updateMany({
      where: {
        userId: user.id,
        isUsed: false,
        expiresAt: { lt: now },
      },
      data: {
        isUsed: true,
        consumedAt: now,
      },
    });

    // 检查是否有未过期的验证码（防止重复发送）
    const lastToken = await prisma.passwordResetToken.findFirst({
      where: {
        userId: user.id,
        isUsed: false,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (lastToken) {
      const lastCreatedAt = new Date(lastToken.createdAt ?? now);
      const elapsedMs = now.getTime() - lastCreatedAt.getTime();
      const cooldownMs = this.resetTokenResendIntervalSeconds * 1000;

      if (elapsedMs < cooldownMs) {
        const secondsLeft = Math.max(1, Math.ceil((cooldownMs - elapsedMs) / 1000));
        throw new Error('验证码已发送，请 ' + secondsLeft + ' 秒后再试');
      }
    }

    // 生成6位数验证码
    const verificationCode = this.generateVerificationCode();
    const expiresAt = new Date(now.getTime() + this.resetTokenTTLMinutes * 60 * 1000);

    // 保存验证码（哈希后）
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        codeHash: this.hashVerificationCode(verificationCode),
        expiresAt,
        ipAddress: meta?.ipAddress ?? null,
        userAgent: meta?.userAgent ?? null,
      },
    });

    // 开发环境下打印验证码到控制台
    if (process.env.NODE_ENV !== 'production') {
      console.info('[PasswordReset] Verification code for ' + user.email + ': ' + verificationCode);
    }

    // 发送邮件
    await sendPasswordResetCodeEmail({
      to: user.email,
      username: user.username,
      code: verificationCode,
      expiresAt,
    });

    return {
      success: true,
      message: '验证码已发送，请检查您的邮箱。',
      data: {
        expiresAt,
        maskedEmail: this.maskEmail(user.email),
      },
    };
  }

  /**
   * 重置密码（用户名 + 邮箱 + 验证码验证）
   */
  async resetPassword(data: PasswordResetRequest): Promise<{ success: boolean; message: string }> {
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
      throw new Error('用户名与邮箱不匹配或账号已被禁用');
    }

    const now = new Date();

    // 查找有效的验证码
    const activeToken = await prisma.passwordResetToken.findFirst({
      where: {
        userId: user.id,
        isUsed: false,
        expiresAt: { gt: now },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!activeToken) {
      throw new Error('验证码无效或已过期，请重新获取验证码');
    }

    // 验证验证码
    const providedHash = this.hashVerificationCode(validatedData.verificationCode);

    if (providedHash !== activeToken.codeHash) {
      const nextAttempts = activeToken.attemptCount + 1;
      const shouldLock = nextAttempts >= this.resetTokenMaxAttempts;

      await prisma.passwordResetToken.update({
        where: { id: activeToken.id },
        data: {
          attemptCount: nextAttempts,
          ...(shouldLock ? { isUsed: true, consumedAt: now } : {}),
        },
      });

      if (shouldLock) {
        throw new Error('验证码尝试次数过多，请重新获取验证码');
      }

      throw new Error('验证码不正确，请重新输入');
    }

    // 标记验证码为已使用
    await prisma.passwordResetToken.update({
      where: { id: activeToken.id },
      data: {
        isUsed: true,
        consumedAt: now,
      },
    });

    // 加密新密码
    const newPasswordHash = await bcrypt.hash(validatedData.newPassword, this.saltRounds);

    // 更新密码
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newPasswordHash,
        updatedAt: now,
      },
    });

    // 撤销该用户的所有未使用验证码
    await prisma.passwordResetToken.updateMany({
      where: {
        userId: user.id,
        isUsed: false,
      },
      data: {
        isUsed: true,
        consumedAt: now,
      },
    });

    // 撤销所有现有会话，强制重新登录
    await prisma.userSession.updateMany({
      where: { userId: user.id },
      data: { isRevoked: true },
    });

    return { success: true, message: '密码重置成功，请使用新密码登录。' };
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

  /**
   * 生成六位数验证码
   */
  private generateVerificationCode(): string {
    return String(crypto.randomInt(100000, 1000000));
  }

  /**
   * 哈希化验证码以避免明文存储
   */
  private hashVerificationCode(code: string): string {
    return crypto.createHash('sha256').update(code.trim()).digest('hex');
  }

  /**
   * 屏蔽邮箱部分字符用于界面展示
   */
  private maskEmail(email: string): string {
    const parts = email.split('@');
    const localPart = parts[0] || '';
    const domain = parts[1] || '';
    if (!domain) {
      return email.replace(/.(?=.{0,2}$)/g, '*');
    }

    if (localPart.length <= 2) {
      return localPart.padEnd(2, '*') + '@' + domain;
    }

    const visible = localPart.slice(0, 2);
    const masked = '*'.repeat(Math.max(1, localPart.length - 2));
    return visible + masked + '@' + domain;
  }
}

// 导出服务实例
export const authService = new AuthService();
