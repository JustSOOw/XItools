import { BoardColumn } from '../store/taskStore';
import { apiService, ApiError } from '../utils/apiClient';
import { log } from '../utils/env';

export interface CreateColumnRequest {
  name: string;
  order: number;
  color?: string;
  isDefault?: boolean;
  boardId: string;
}

export interface UpdateColumnRequest {
  name?: string;
  order?: number;
  color?: string;
  isDefault?: boolean;
}

// 保持向后兼容
export type CreateColumnData = CreateColumnRequest;
export type UpdateColumnData = UpdateColumnRequest;

/**
 * 前端列管理服务
 */
class ColumnService {
  /**
   * 获取指定看板的所有列
   * @param boardId 看板ID
   */
  async getColumnsByBoard(boardId: string): Promise<BoardColumn[]> {
    try {
      log.debug('开始获取看板列数据:', boardId);

      const columns = await apiService.get<BoardColumn[]>(`/boards/${boardId}/columns`);

      log.debug('获取看板列数据成功:', columns.length);
      return columns;
    } catch (error) {
      log.error('获取看板列数据失败:', error);

      // 如果是服务器错误，返回空数组而不是抛出错误
      if (error instanceof ApiError && error.status >= 500) {
        log.warn('后端服务不可用，返回空列数组');
        return [];
      }

      throw error;
    }
  }

  /**
   * 获取所有列
   */
  async getAllColumns(): Promise<BoardColumn[]> {
    try {
      return await apiService.get<BoardColumn[]>('/columns');
    } catch (error) {
      log.error('获取列列表失败:', error);
      throw error;
    }
  }

  /**
   * 获取单个列
   */
  async getColumnById(id: string): Promise<BoardColumn> {
    try {
      return await apiService.get<BoardColumn>(`/columns/${id}`);
    } catch (error) {
      log.error('获取列详情失败:', error);
      throw error;
    }
  }

  /**
   * 创建新列
   */
  async createColumn(data: CreateColumnRequest): Promise<BoardColumn> {
    try {
      return await apiService.post<BoardColumn>('/columns', data);
    } catch (error) {
      log.error('创建列失败:', error);
      throw error;
    }
  }

  /**
   * 更新列
   */
  async updateColumn(id: string, data: UpdateColumnRequest): Promise<BoardColumn> {
    try {
      return await apiService.put<BoardColumn>(`/columns/${id}`, data);
    } catch (error) {
      log.error('更新列失败:', error);
      throw error;
    }
  }

  /**
   * 删除列
   */
  async deleteColumn(id: string): Promise<void> {
    try {
      await apiService.delete(`/columns/${id}`);
    } catch (error) {
      log.error('删除列失败:', error);
      throw error;
    }
  }

  /**
   * 重新排序列
   */
  async reorderColumns(columnIds: string[]): Promise<BoardColumn[]> {
    try {
      return await apiService.post<BoardColumn[]>('/columns/reorder', { columnIds });
    } catch (error) {
      log.error('重新排序列失败:', error);
      throw error;
    }
  }

  /**
   * 初始化默认列
   */
  async initializeDefaultColumns(boardId?: string): Promise<BoardColumn[]> {
    try {
      return await apiService.post<BoardColumn[]>('/columns/initialize', { boardId });
    } catch (error) {
      log.error('初始化默认列失败:', error);
      throw error;
    }
  }
}

export const columnService = new ColumnService();
export default columnService;
