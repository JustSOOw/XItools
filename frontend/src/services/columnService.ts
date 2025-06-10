import axios from 'axios';
import { BoardColumn } from '../store/taskStore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export interface CreateColumnData {
  name: string;
  order: number;
  color?: string;
  isDefault?: boolean;
}

export interface UpdateColumnData {
  name?: string;
  order?: number;
  color?: string;
  isDefault?: boolean;
}

/**
 * 前端列管理服务
 */
class ColumnService {
  private baseURL = `${API_BASE_URL}/api`;

  /**
   * 获取所有列
   */
  async getAllColumns(): Promise<BoardColumn[]> {
    try {
      const response = await axios.get(`${this.baseURL}/columns`);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.error || '获取列列表失败');
    } catch (error) {
      console.error('获取列列表失败:', error);
      throw error;
    }
  }

  /**
   * 获取单个列
   */
  async getColumnById(id: string): Promise<BoardColumn> {
    try {
      const response = await axios.get(`${this.baseURL}/columns/${id}`);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.error || '获取列详情失败');
    } catch (error: any) {
      console.error('获取列详情失败:', error);
      // 正确提取axios错误响应中的错误信息
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error(error.message || '获取列详情失败');
    }
  }

  /**
   * 创建新列
   */
  async createColumn(data: CreateColumnData): Promise<BoardColumn> {
    try {
      const response = await axios.post(`${this.baseURL}/columns`, data);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.error || '创建列失败');
    } catch (error: any) {
      console.error('创建列失败:', error);
      // 正确提取axios错误响应中的错误信息
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error(error.message || '创建列失败');
    }
  }

  /**
   * 更新列
   */
  async updateColumn(id: string, data: UpdateColumnData): Promise<BoardColumn> {
    try {
      const response = await axios.put(`${this.baseURL}/columns/${id}`, data);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.error || '更新列失败');
    } catch (error: any) {
      console.error('更新列失败:', error);
      // 正确提取axios错误响应中的错误信息
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error(error.message || '更新列失败');
    }
  }

  /**
   * 删除列
   */
  async deleteColumn(id: string): Promise<void> {
    try {
      const response = await axios.delete(`${this.baseURL}/columns/${id}`);
      if (!response.data.success) {
        throw new Error(response.data.error || '删除列失败');
      }
    } catch (error: any) {
      console.error('删除列失败:', error);
      // 正确提取axios错误响应中的错误信息
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error(error.message || '删除列失败');
    }
  }

  /**
   * 重新排序列
   */
  async reorderColumns(columnIds: string[]): Promise<BoardColumn[]> {
    try {
      const response = await axios.post(`${this.baseURL}/columns/reorder`, {
        columnIds
      });
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.error || '重新排序列失败');
    } catch (error: any) {
      console.error('重新排序列失败:', error);
      // 正确提取axios错误响应中的错误信息
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error(error.message || '重新排序列失败');
    }
  }

  /**
   * 初始化默认列
   */
  async initializeDefaultColumns(): Promise<BoardColumn[]> {
    try {
      const response = await axios.post(`${this.baseURL}/columns/initialize`);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.error || '初始化默认列失败');
    } catch (error: any) {
      console.error('初始化默认列失败:', error);
      // 正确提取axios错误响应中的错误信息
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error(error.message || '初始化默认列失败');
    }
  }
}

export const columnService = new ColumnService();
export default columnService;
