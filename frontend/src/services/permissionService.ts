/**
 * 项目权限服务
 *
 * 提供项目权限设置、查询、更新等API调用
 */

import { apiService } from '../utils/apiClient';
import { log } from '../utils/env';
import { BaseApiService } from './BaseApiService';
import {
  ProjectPermission,
  ProjectPermissionDetail,
  SetProjectPermissionInput,
  UpdateProjectPermissionInput,
} from '../types/permissionTypes';

/**
 * 权限服务类
 */
class PermissionService extends BaseApiService {
  /**
   * 设置项目权限
   * POST /api/projects/:projectId/permissions
   */
  async setProjectPermission(
    projectId: string,
    data: SetProjectPermissionInput
  ): Promise<ProjectPermission> {
    try {
      log.debug('设置项目权限:', { projectId, data });
      const permission = await apiService.post<ProjectPermission>(
        `/projects/${projectId}/permissions`,
        data
      );
      log.debug('设置权限成功');
      return permission;
    } catch (error) {
      log.error('设置项目权限失败:', error);
      throw error;
    }
  }

  /**
   * 更新项目权限
   * PUT /api/projects/:projectId/permissions/:permissionId
   */
  async updateProjectPermission(
    projectId: string,
    permissionId: string,
    data: UpdateProjectPermissionInput
  ): Promise<ProjectPermission> {
    try {
      log.debug('更新项目权限:', { projectId, permissionId, data });
      const permission = await apiService.put<ProjectPermission>(
        `/projects/${projectId}/permissions/${permissionId}`,
        data
      );
      log.debug('更新权限成功');
      return permission;
    } catch (error) {
      log.error('更新项目权限失败:', error);
      throw error;
    }
  }

  /**
   * 删除项目权限
   * DELETE /api/projects/:projectId/permissions/:permissionId
   */
  async deleteProjectPermission(projectId: string, permissionId: string): Promise<void> {
    try {
      log.debug('删除项目权限:', { projectId, permissionId });
      await apiService.delete(`/projects/${projectId}/permissions/${permissionId}`);
      log.debug('删除权限成功');
    } catch (error) {
      log.error('删除项目权限失败:', error);
      throw error;
    }
  }

  /**
   * 获取项目的权限列表
   * GET /api/projects/:projectId/permissions
   */
  async getProjectPermissions(projectId: string): Promise<ProjectPermissionDetail[]> {
    try {
      log.debug('获取项目权限列表:', projectId);
      const permissions = await apiService.get<ProjectPermissionDetail[]>(
        `/projects/${projectId}/permissions`
      );
      log.debug('获取权限列表成功:', permissions.length);
      return permissions;
    } catch (error) {
      log.error('获取项目权限列表失败:', error);

      // 如果服务器不可用，返回空数组
      if (this.isServerUnavailableError(error)) {
        return [];
      }

      throw error;
    }
  }
}

// 导出单例
export const permissionService = new PermissionService();
export default permissionService;
