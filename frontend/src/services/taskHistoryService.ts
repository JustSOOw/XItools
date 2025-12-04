/**
 * 任务历史服务
 *
 * 获取任务的变更历史记录
 */

import { apiService as api } from '../utils/apiClient';
import { TaskHistory, TaskHistoryResponse, TaskHistoryAction } from '../types/taskHistoryTypes';

export interface GetTaskHistoryParams {
    page?: number;
    pageSize?: number;
    action?: TaskHistoryAction;
}

class TaskHistoryService {
    /**
     * 获取任务历史记录
     */
    async getTaskHistory(taskId: string, params: GetTaskHistoryParams = {}): Promise<TaskHistoryResponse> {
        const { page = 1, pageSize = 20, action } = params;

        const queryParams = new URLSearchParams({
            page: String(page),
            pageSize: String(pageSize),
        });

        if (action) {
            queryParams.append('action', action);
        }

        const response = await api.get<TaskHistoryResponse>(
            `/tasks/${taskId}/history?${queryParams.toString()}`
        );

        return response;
    }
}

export const taskHistoryService = new TaskHistoryService();
export default taskHistoryService;
