/*
 * @Author: XItools Team
 * @Date: 2025-06-30 15:00:00
 * @LastEditors: XItools Team
 * @LastEditTime: 2025-06-30 15:00:00
 * @FilePath: \XItools\frontend\src\store\userStore.ts
 * @Description: 用户状态管理
 * 
 * Copyright (c) 2025 by XItools Team, All Rights Reserved. 
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../services/authService';
import {
  User,
  UserRegisterRequest,
  UserLoginRequest,
  UserUpdateRequest,
  PasswordChangeRequest,
  LoginStatus
} from '../types/User';

// 用户状态接口
interface UserState {
  // 当前用户信息
  user: User | null;
  // 登录状态
  loginStatus: LoginStatus;
  // 是否正在加载
  isLoading: boolean;
  // 错误信息
  error: string | null;
  // 是否记住登录状态
  rememberMe: boolean;
  // 最后登录时间
  lastLoginTime: string | null;
  
  // 操作方法
  register: (userData: UserRegisterRequest) => Promise<void>;
  login: (loginData: UserLoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updateData: UserUpdateRequest) => Promise<void>;
  changePassword: (passwordData: PasswordChangeRequest) => Promise<void>;
  refreshUserInfo: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  clearError: () => void;
  setRememberMe: (remember: boolean) => void;
  
  // 内部方法
  setUser: (user: User | null) => void;
  setLoginStatus: (status: LoginStatus) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

// Token刷新定时器
let tokenRefreshTimer: NodeJS.Timeout | null = null;

// 创建用户状态存储
export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // 初始状态
      user: null,
      loginStatus: LoginStatus.LOGGED_OUT,
      isLoading: false,
      error: null,
      rememberMe: false,
      lastLoginTime: null,

      // 用户注册
      register: async (userData: UserRegisterRequest) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await authService.register(userData);
          
          if (response.success) {
            set({
              user: response.data.user,
              loginStatus: LoginStatus.LOGGED_IN,
              lastLoginTime: new Date().toISOString(),
              isLoading: false
            });
            
            // 启动token刷新定时器
            startTokenRefreshTimer();
          }
        } catch (error: any) {
          set({
            error: error.message || '注册失败',
            loginStatus: LoginStatus.ERROR,
            isLoading: false
          });
          throw error;
        }
      },

      // 用户登录
      login: async (loginData: UserLoginRequest) => {
        set({ isLoading: true, error: null, loginStatus: LoginStatus.LOGGING_IN });
        
        try {
          const response = await authService.login(loginData);
          
          if (response.success) {
            set({
              user: response.data.user,
              loginStatus: LoginStatus.LOGGED_IN,
              rememberMe: loginData.rememberMe || false,
              lastLoginTime: new Date().toISOString(),
              isLoading: false
            });
            
            // 启动token刷新定时器
            startTokenRefreshTimer();
          }
        } catch (error: any) {
          set({
            error: error.message || '登录失败',
            loginStatus: LoginStatus.ERROR,
            isLoading: false
          });
          throw error;
        }
      },

      // 用户登出
      logout: async () => {
        set({ isLoading: true });

        try {
          await authService.logout();
        } catch (error) {
          console.warn('登出时发生错误:', error);
        } finally {
          // 停止token刷新定时器
          stopTokenRefreshTimer();

          try {
            // 注意：不要在登出时清除记住我的登录信息
            // 记住我功能应该在用户主动取消勾选时才清除

            // 清除状态
            set({
              user: null,
              loginStatus: LoginStatus.LOGGED_OUT,
              isLoading: false,
              error: null,
              rememberMe: false,
              lastLoginTime: null
            });
          } catch (storageError) {
            // 如果localStorage存储失败，直接清除localStorage中的用户数据
            console.warn('清除用户状态时存储空间不足，尝试清理localStorage:', storageError);

            try {
              // 清除用户相关的localStorage数据
              localStorage.removeItem('xi-user-storage');
              localStorage.removeItem('xi-auth-token');
              localStorage.removeItem('xi-refresh-token');
              // 注意：不清除 xi-remember-me，保持记住我功能

              // 清除其他可能的XItools相关数据（但保留记住我功能）
              Object.keys(localStorage).forEach(key => {
                if ((key.startsWith('xi-') || key.startsWith('xitools-')) && key !== 'xi-remember-me') {
                  localStorage.removeItem(key);
                }
              });

              // 再次尝试设置状态
              set({
                user: null,
                loginStatus: LoginStatus.LOGGED_OUT,
                isLoading: false,
                error: null,
                rememberMe: false,
                lastLoginTime: null
              });

              console.log('localStorage清理完成，用户状态已重置');
            } catch (cleanupError) {
              console.error('清理localStorage失败:', cleanupError);
              // 强制刷新页面作为最后手段
              window.location.reload();
            }
          }
        }
      },

      // 更新用户资料
      updateProfile: async (updateData: UserUpdateRequest) => {
        set({ isLoading: true, error: null });
        
        try {
          const updatedUser = await authService.updateUser(updateData);
          set({
            user: updatedUser,
            isLoading: false
          });
        } catch (error: any) {
          set({
            error: error.message || '更新资料失败',
            isLoading: false
          });
          throw error;
        }
      },

      // 修改密码
      changePassword: async (passwordData: PasswordChangeRequest) => {
        set({ isLoading: true, error: null });
        
        try {
          await authService.changePassword(passwordData);
          set({ isLoading: false });
        } catch (error: any) {
          set({
            error: error.message || '修改密码失败',
            isLoading: false
          });
          throw error;
        }
      },

      // 刷新用户信息
      refreshUserInfo: async () => {
        try {
          const user = await authService.getCurrentUser();
          if (user) {
            set({ user });
          } else {
            // 如果获取用户信息失败，可能是token过期
            set({
              user: null,
              loginStatus: LoginStatus.TOKEN_EXPIRED
            });
          }
        } catch (error) {
          console.error('刷新用户信息失败:', error);
          set({
            user: null,
            loginStatus: LoginStatus.TOKEN_EXPIRED
          });
        }
      },

      // 检查认证状态
      checkAuthStatus: async () => {
        const token = authService.getToken();
        let storedUser = authService.getStoredUser();
        const currentState = get();

        if (!token) {
          // 如果没有token但有持久化的用户状态（记住我功能），清除状态
          if (currentState.user && currentState.rememberMe) {
            console.log('Token已过期，清除记住的用户状态');
          }
          set({
            user: null,
            loginStatus: LoginStatus.LOGGED_OUT
          });
          return;
        }

        // 验证token是否有效
        const isValid = await authService.verifyToken(token);

        if (!isValid) {
          // Token无效，清除所有状态
          set({
            user: null,
            loginStatus: LoginStatus.TOKEN_EXPIRED,
            rememberMe: false // 清除记住我状态
          });
          return;
        }

        // Token有效，优先使用持久化的用户信息（如果有记住我状态）
        if (currentState.rememberMe && currentState.user && currentState.loginStatus === LoginStatus.LOGGED_IN) {
          console.log('使用记住的用户状态');
          set({
            user: currentState.user,
            loginStatus: LoginStatus.LOGGED_IN
          });

          // 启动token刷新定时器
          startTokenRefreshTimer();

          // 异步更新用户信息，但不阻塞界面显示
          authService.getCurrentUser().then(currentUser => {
            if (currentUser) {
              set({ user: currentUser });
            }
          }).catch(error => {
            console.warn('异步更新用户信息失败:', error);
          });

          return;
        }

        // Token有效但没有记住的状态，从服务器获取用户信息
        try {
          const currentUser = await authService.getCurrentUser();

          if (currentUser) {
            set({
              user: currentUser,
              loginStatus: LoginStatus.LOGGED_IN
            });

            // 启动token刷新定时器
            startTokenRefreshTimer();
          } else {
            // 如果服务器无法获取用户信息，但本地有存储的用户信息，则使用本地信息
            if (storedUser && storedUser.id) {
              set({
                user: storedUser,
                loginStatus: LoginStatus.LOGGED_IN
              });

              // 启动token刷新定时器
              startTokenRefreshTimer();
            } else {
              set({
                user: null,
                loginStatus: LoginStatus.LOGGED_OUT
              });
            }
          }
        } catch (error) {
          console.error('获取用户信息失败:', error);

          // 如果网络错误但本地有用户信息，则使用本地信息
          if (storedUser && storedUser.id) {
            set({
              user: storedUser,
              loginStatus: LoginStatus.LOGGED_IN
            });

            // 启动token刷新定时器
            startTokenRefreshTimer();
          } else {
            set({
              user: null,
              loginStatus: LoginStatus.LOGGED_OUT
            });
          }
        }
      },

      // 清除错误
      clearError: () => {
        set({ error: null });
      },

      // 设置记住登录状态
      setRememberMe: (remember: boolean) => {
        set({ rememberMe: remember });
      },

      // 内部方法
      setUser: (user: User | null) => {
        set({ user });
      },

      setLoginStatus: (status: LoginStatus) => {
        set({ loginStatus: status });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error });
      },
    }),
    {
      name: 'xi-user-storage',
      // 自定义storage，添加错误处理
      storage: {
        getItem: (name: string) => {
          try {
            return localStorage.getItem(name);
          } catch (error) {
            console.warn('读取localStorage失败:', error);
            return null;
          }
        },
        setItem: (name: string, value: string) => {
          try {
            localStorage.setItem(name, value);
          } catch (error) {
            console.warn('写入localStorage失败:', error);

            // 如果是存储空间不足，尝试清理
            if (error instanceof DOMException && error.name === 'QuotaExceededError') {
              console.log('存储空间不足，开始清理...');
              cleanupLocalStorage();

              // 清理后再次尝试
              try {
                localStorage.setItem(name, value);
                console.log('清理后成功写入localStorage');
              } catch (retryError) {
                console.error('清理后仍然无法写入localStorage:', retryError);
                // 如果还是失败，只保留最基本的数据
                try {
                  localStorage.removeItem(name);
                  const minimalData = JSON.stringify({ rememberMe: false, lastLoginTime: null });
                  localStorage.setItem(name, minimalData);
                  console.log('保存最小化数据成功');
                } catch (finalError) {
                  console.error('最终写入失败，localStorage可能已满:', finalError);
                }
              }
            }
          }
        },
        removeItem: (name: string) => {
          try {
            localStorage.removeItem(name);
          } catch (error) {
            console.warn('删除localStorage项目失败:', error);
          }
        }
      },
      // 根据rememberMe状态决定持久化内容
      partialize: (state) => {
        const baseState = {
          rememberMe: state.rememberMe,
          lastLoginTime: state.lastLoginTime,
        };

        // 如果用户选择了"记住我"，则持久化用户信息和登录状态
        if (state.rememberMe && state.user && state.loginStatus === LoginStatus.LOGGED_IN) {
          return {
            ...baseState,
            user: state.user,
            loginStatus: state.loginStatus,
          };
        }

        return baseState;
      },
      // 恢复状态后不自动检查认证状态，由AppRouter统一管理
      onRehydrateStorage: () => (state) => {
        // 不执行任何操作，避免与AppRouter的认证初始化冲突
        console.log('Store rehydrated, auth status will be handled by AppRouter');
      },
    }
  )
);

// Token刷新定时器管理
function startTokenRefreshTimer() {
  // 清除现有定时器
  stopTokenRefreshTimer();
  
  // 每25分钟检查一次token是否需要刷新
  tokenRefreshTimer = setInterval(async () => {
    const store = useUserStore.getState();
    
    if (store.loginStatus === LoginStatus.LOGGED_IN) {
      // 检查token是否即将过期
      if (authService.isTokenExpiringSoon()) {
        try {
          const newToken = await authService.refreshToken();
          if (!newToken) {
            // 刷新失败，设置为过期状态
            store.setLoginStatus(LoginStatus.TOKEN_EXPIRED);
          }
        } catch (error) {
          console.error('自动刷新token失败:', error);
          store.setLoginStatus(LoginStatus.TOKEN_EXPIRED);
        }
      }
    }
  }, 25 * 60 * 1000); // 25分钟
}

function stopTokenRefreshTimer() {
  if (tokenRefreshTimer) {
    clearInterval(tokenRefreshTimer);
    tokenRefreshTimer = null;
  }
}



// 导出辅助函数
export const userStoreHelpers = {
  // 检查用户是否已登录
  isLoggedIn: () => {
    const state = useUserStore.getState();
    return state.loginStatus === LoginStatus.LOGGED_IN && state.user !== null;
  },
  
  // 检查用户是否有特定角色
  hasRole: (role: string) => {
    const state = useUserStore.getState();
    return state.user?.role === role;
  },
  
  // 获取当前用户ID
  getCurrentUserId: () => {
    const state = useUserStore.getState();
    return state.user?.id || null;
  },
  
  // 获取当前用户名
  getCurrentUsername: () => {
    const state = useUserStore.getState();
    return state.user?.username || null;
  },
};

export default useUserStore;
