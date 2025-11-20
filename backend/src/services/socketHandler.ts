import { Server, Socket } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import { notificationService } from './notificationService.js';

const prisma = new PrismaClient();

/**
 * 设置 Socket.IO 连接处理器
 * 用于通知系统的实时推送
 */
export function setupSocketHandlers(io: Server): void {
  io.on('connection', async (socket: Socket) => {
    console.log(`Socket.IO 连接建立: ${socket.id}`);

    // 从握手信息中获取用户ID (假设前端在连接时提供)
    const userId = socket.handshake.auth?.userId as string | undefined;

    if (!userId) {
      console.warn(`Socket ${socket.id} 连接时未提供 userId`);
      // 不拒绝连接，允许匿名连接（用于看板等功能）
    } else {
      // 加入用户个人房间
      socket.join(`user:${userId}`);
      console.log(`用户 ${userId} 加入个人房间: user:${userId}`);

      // 查询用户是否在团队中，如果在则加入团队房间
      try {
        const teamMember = await prisma.teamMember.findUnique({
          where: { userId },
          include: { team: true },
        });

        if (teamMember && teamMember.team.isActive) {
          socket.join(`team:${teamMember.teamId}`);
          console.log(`用户 ${userId} 加入团队房间: team:${teamMember.teamId}`);

          // 发送当前未读通知数量
          const unreadCount = await notificationService.getUnreadCount(userId);
          socket.emit('notification:unread_count', unreadCount);
        }
      } catch (error) {
        console.error(`查询用户团队信息失败: ${error}`);
      }
    }

    // 监听加入看板事件（保留现有功能）
    socket.on('join_board', (boardId: string) => {
      console.log(`Socket ${socket.id} 加入看板房间: board:${boardId}`);
      socket.join(`board:${boardId}`);
    });

    // 监听离开看板事件（保留现有功能）
    socket.on('leave_board', (boardId: string) => {
      console.log(`Socket ${socket.id} 离开看板房间: board:${boardId}`);
      socket.leave(`board:${boardId}`);
    });

    // 监听加入工作区事件
    socket.on('join_workspace', (workspaceId: string) => {
      console.log(`Socket ${socket.id} 加入工作区房间: workspace:${workspaceId}`);
      socket.join(`workspace:${workspaceId}`);
    });

    // 监听离开工作区事件
    socket.on('leave_workspace', (workspaceId: string) => {
      console.log(`Socket ${socket.id} 离开工作区房间: workspace:${workspaceId}`);
      socket.leave(`workspace:${workspaceId}`);
    });

    // 监听断开连接事件
    socket.on('disconnect', () => {
      console.log(`Socket.IO 连接断开: ${socket.id}`);
    });

    // 监听错误事件
    socket.on('error', (error: Error) => {
      console.error(`Socket ${socket.id} 错误:`, error);
    });
  });

  console.log('Socket.IO 处理器已设置');
}
