/*
 * @Author: XItools Team
 * @Date: 2025-06-30 15:00:00
 * @LastEditors: XItools Team
 * @LastEditTime: 2025-06-30 15:00:00
 * @FilePath: \XItools\frontend\src\services\authService.ts
 * @Description: 用户认证服务
 * 
 * Copyright (c) 2025 by XItools Team, All Rights Reserved. 
 */

import axios, { AxiosResponse } from 'axios';
import { getBackendUrl } from '../utils/env';
import {
  User,
  UserRegisterRequest,
  UserLoginRequest,
  UserUpdateRequest,
  PasswordChangeRequest,
  AuthResponse,
  AuthErrorResponse,
  UserInfoResponse,
  JWTPayload
} from '../types/User';

const API_BASE_URL = getBackendUrl();

/**
 * 用户认证服务类
 */
class AuthService {
  private baseURL = `${API_BASE_URL}/api`;
  private tokenKey = 'xi-auth-token';
  private userKey = 'xi-user-info';

  /**
   * 用户注册
   */
  async register(userData: UserRegisterRequest): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<AuthResponse> = await axios.post(
        `${this.baseURL}/auth/register`,
        userData
      );
      
      if (response.data.success) {
        // 注册成功后自动保存token和用户信息
        this.saveAuthData(response.data.data.token, response.data.data.user);
      }
      
      return response.data;
    } catch (error: any) {
      console.error('用户注册失败:', error);
      
      if (error.response?.data) {
        throw new Error(error.response.data.error || '注册失败');
      }
      throw new Error('网络错误，请稍后重试');
    }
  }

  /**
   * 用户登录
   */
  async login(loginData: UserLoginRequest): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<AuthResponse> = await axios.post(
        `${this.baseURL}/auth/login`,
        loginData
      );
      
      if (response.data.success) {
        // 登录成功后保存token和用户信息
        this.saveAuthData(response.data.data.token, response.data.data.user);
      }
      
      return response.data;
    } catch (error: any) {
      console.error('用户登录失败:', error);
      
      if (error.response?.data) {
        throw new Error(error.response.data.error || '登录失败');
      }
      throw new Error('网络错误，请稍后重试');
    }
  }

  /**
   * 用户登出
   */
  async logout(): Promise<void> {
    try {
      // 调用后端登出API（如果有的话）
      const token = this.getToken();
      if (token) {
        await axios.post(
          `${this.baseURL}/auth/logout`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
      }
    } catch (error) {
      console.warn('后端登出失败:', error);
      // 即使后端登出失败，也要清除本地数据
    } finally {
      // 清除本地存储的认证数据
      this.clearAuthData();
    }
  }

  /**
   * 获取当前用户信息
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const token = this.getToken();
      if (!token) {
        return null;
      }

      const response: AxiosResponse<UserInfoResponse> = await axios.get(
        `${this.baseURL}/auth/me`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        // 后端返回的格式是 { success: true, data: { user: User } }
        const user = response.data.data.user;

        // 更新本地存储的用户信息
        this.saveUser(user);
        return user;
      }

      return null;
    } catch (error: any) {
      console.error('获取用户信息失败:', error);
      
      // 如果是401错误，说明token已过期
      if (error.response?.status === 401) {
        this.clearAuthData();
      }
      
      return null;
    }
  }

  /**
   * 更新用户信息
   */
  async updateUser(updateData: UserUpdateRequest): Promise<User> {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('用户未登录');
      }

      const response: AxiosResponse<UserInfoResponse> = await axios.put(
        `${this.baseURL}/auth/profile`,
        updateData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        // 后端返回的格式是 { success: true, data: { user: User } }
        const user = response.data.data.user;

        // 更新本地存储的用户信息
        this.saveUser(user);
        return user;
      }

      throw new Error('更新用户信息失败');
    } catch (error: any) {
      console.error('更新用户信息失败:', error);
      
      if (error.response?.data) {
        throw new Error(error.response.data.error || '更新失败');
      }
      throw new Error('网络错误，请稍后重试');
    }
  }

  /**
   * 修改密码
   */
  async changePassword(passwordData: PasswordChangeRequest): Promise<void> {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('用户未登录');
      }

      await axios.post(
        `${this.baseURL}/auth/change-password`,
        passwordData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
    } catch (error: any) {
      console.error('修改密码失败:', error);
      
      if (error.response?.data) {
        throw new Error(error.response.data.error || '修改密码失败');
      }
      throw new Error('网络错误，请稍后重试');
    }
  }

  /**
   * 验证token是否有效
   */
  async verifyToken(token?: string): Promise<boolean> {
    try {
      const authToken = token || this.getToken();
      if (!authToken) {
        return false;
      }

      const response = await axios.get(
        `${this.baseURL}/auth/verify`,
        {
          headers: { Authorization: `Bearer ${authToken}` }
        }
      );

      return response.data.success;
    } catch (error) {
      console.warn('Token验证失败:', error);
      return false;
    }
  }

  /**
   * 检查token是否即将过期（30分钟内）
   */
  isTokenExpiringSoon(): boolean {
    const token = this.getToken();
    if (!token) {
      return true;
    }

    try {
      const payload = this.decodeToken(token);
      const now = Math.floor(Date.now() / 1000);
      const expiresIn = payload.exp - now;
      
      // 如果30分钟内过期，返回true
      return expiresIn < 30 * 60;
    } catch (error) {
      console.warn('解析token失败:', error);
      return true;
    }
  }

  /**
   * 刷新token（如果后端支持）
   */
  async refreshToken(): Promise<string | null> {
    try {
      const token = this.getToken();
      if (!token) {
        return null;
      }

      const response: AxiosResponse<{ token: string }> = await axios.post(
        `${this.baseURL}/auth/refresh`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.token) {
        this.saveToken(response.data.token);
        return response.data.token;
      }

      return null;
    } catch (error) {
      console.warn('刷新token失败:', error);
      return null;
    }
  }

  /**
   * 获取存储的token
   */
  getToken(): string | null {
    try {
      return localStorage.getItem(this.tokenKey);
    } catch (error) {
      console.warn('获取token失败:', error);
      return null;
    }
  }

  /**
   * 获取存储的用户信息
   * 合并localStorage中的基本信息和sessionStorage中的头像数据
   */
  getStoredUser(): User | null {
    try {
      const userStr = localStorage.getItem(this.userKey);
      if (!userStr) {
        return null;
      }

      const user = JSON.parse(userStr);

      // 尝试获取头像数据
      try {
        const avatar = sessionStorage.getItem(`${this.userKey}-avatar`);
        if (avatar) {
          user.avatar = avatar;
        }
      } catch (avatarError) {
        console.warn('获取头像数据失败:', avatarError);
        // 头像获取失败不影响用户基本信息的返回
      }

      return user;
    } catch (error) {
      console.warn('获取用户信息失败:', error);
      return null;
    }
  }

  /**
   * 保存认证数据
   */
  private saveAuthData(token: string, user: User): void {
    try {
      localStorage.setItem(this.tokenKey, token);
      localStorage.setItem(this.userKey, JSON.stringify(user));
    } catch (error) {
      console.error('保存认证数据失败:', error);
    }
  }

  /**
   * 保存token
   */
  private saveToken(token: string): void {
    try {
      localStorage.setItem(this.tokenKey, token);
    } catch (error) {
      console.error('保存token失败:', error);
    }
  }

  /**
   * 保存用户信息
   * 为了避免localStorage容量限制，将头像数据分离存储
   */
  private saveUser(user: User): void {
    try {
      // 创建用户信息副本，不包含头像数据
      const { avatar, ...userWithoutAvatar } = user;

      // 保存基本用户信息到localStorage
      localStorage.setItem(this.userKey, JSON.stringify(userWithoutAvatar));

      // 头像数据单独存储到sessionStorage（会话级别存储，容量更大）
      if (avatar) {
        try {
          sessionStorage.setItem(`${this.userKey}-avatar`, avatar);
        } catch (avatarError) {
          console.warn('头像数据过大，跳过本地存储:', avatarError);
          // 头像存储失败不影响用户基本信息的保存
        }
      }
    } catch (error) {
      console.error('保存用户信息失败:', error);
      // 如果基本信息也无法保存，尝试清理旧数据后重试
      try {
        this.clearAuthData();
        const { avatar, ...userWithoutAvatar } = user;
        localStorage.setItem(this.userKey, JSON.stringify(userWithoutAvatar));
      } catch (retryError) {
        console.error('重试保存用户信息也失败:', retryError);
      }
    }
  }

  /**
   * 清除认证数据
   * 同时清理localStorage和sessionStorage中的用户数据
   */
  private clearAuthData(): void {
    try {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userKey);

      // 清理头像数据
      try {
        sessionStorage.removeItem(`${this.userKey}-avatar`);
      } catch (avatarError) {
        console.warn('清理头像数据失败:', avatarError);
      }
    } catch (error) {
      console.error('清除认证数据失败:', error);
    }
  }

  /**
   * 解码JWT token
   */
  private decodeToken(token: string): JWTPayload {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload);
  }
}

// 导出单例实例
export const authService = new AuthService();
export default authService;
