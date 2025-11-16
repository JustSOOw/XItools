/**
 * 团队服务
 *
 * 处理团队的创建、更新、查询、成员管理等核心业务逻辑
 */

import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import {
  TeamDTO,
  TeamDetailDTO,
  TeamMemberDTO,
  TeamInvitationDTO,
  TeamInvitationDetailDTO,
  CreateTeamInput,
  UpdateTeamInput,
  InviteMembersInput,
  TeamError,
  TeamErrorCode,
  InvitationStatus,
  TeamMemberStatus,
  TeamRole,
} from '../types/teamTypes';
import {
  sendTeamInvitationEmail,
  sendInvitationAcceptedEmail,
} from './emailService';

const prisma = new PrismaClient();

/**
 * 团队服务类
 */
export class TeamService {
  /**
   * 创建团队
   * 注意:一个用户只能创建一个团队
   */
  async createTeam(userId: string, data: CreateTeamInput): Promise<TeamDTO> {
    // 检查用户是否已经创建了团队
    const existingOwnedTeam = await prisma.team.findUnique({
      where: { ownerId: userId },
    });

    if (existingOwnedTeam) {
      throw new TeamError(
        TeamErrorCode.USER_ALREADY_IN_TEAM,
        '您已经创建了一个团队，不能创建多个团队',
        400
      );
    }

    // 检查用户是否已经加入了其他团队
    const existingMembership = await prisma.teamMember.findUnique({
      where: { userId },
    });

    if (existingMembership) {
      throw new TeamError(
        TeamErrorCode.USER_ALREADY_IN_TEAM,
        '您已经加入了一个团队，不能创建新团队',
        400
      );
    }

    // 创建团队
    const team = await prisma.team.create({
      data: {
        name: data.name,
        description: data.description,
        avatar: data.avatar,
        ownerId: userId,
      },
    });

    return team;
  }

  /**
   * 获取团队详情
   */
  async getTeamById(teamId: string): Promise<TeamDetailDTO | null> {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    if (!team) {
      return null;
    }

    return {
      ...team,
      memberCount: team.members.length,
      members: team.members.map((m) => ({
        id: m.id,
        role: m.role as TeamRole,
        status: m.status as TeamMemberStatus,
        userId: m.userId,
        teamId: m.teamId,
        joinedAt: m.joinedAt,
        user: m.user,
      })),
    };
  }

  /**
   * 获取用户的团队(创建的或加入的)
   */
  async getMyTeam(userId: string): Promise<TeamDetailDTO | null> {
    // 首先检查用户是否创建了团队
    let team = await prisma.team.findUnique({
      where: { ownerId: userId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    // 如果用户没有创建团队，检查是否加入了团队
    if (!team) {
      const membership = await prisma.teamMember.findUnique({
        where: { userId },
        include: {
          team: {
            include: {
              members: {
                include: {
                  user: {
                    select: {
                      id: true,
                      username: true,
                      email: true,
                      avatar: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (membership) {
        team = membership.team;
      }
    }

    if (!team) {
      return null;
    }

    return {
      ...team,
      memberCount: team.members.length,
      members: team.members.map((m) => ({
        id: m.id,
        role: m.role as TeamRole,
        status: m.status as TeamMemberStatus,
        userId: m.userId,
        teamId: m.teamId,
        joinedAt: m.joinedAt,
        user: m.user,
      })),
    };
  }

  /**
   * 更新团队信息
   * 只有团队所有者可以更新
   */
  async updateTeam(
    teamId: string,
    userId: string,
    data: UpdateTeamInput
  ): Promise<TeamDTO> {
    // 检查团队是否存在且用户是否为所有者
    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      throw new TeamError(TeamErrorCode.TEAM_NOT_FOUND, '团队不存在', 404);
    }

    if (team.ownerId !== userId) {
      throw new TeamError(
        TeamErrorCode.NOT_TEAM_OWNER,
        '只有团队创建者可以更新团队信息',
        403
      );
    }

    // 更新团队
    const updatedTeam = await prisma.team.update({
      where: { id: teamId },
      data: {
        name: data.name,
        description: data.description,
        avatar: data.avatar,
      },
    });

    return updatedTeam;
  }

  /**
   * 解散团队
   * 只有团队所有者可以解散
   * 解散团队会删除所有相关数据
   */
  async dissolveTeam(teamId: string, userId: string): Promise<void> {
    // 检查团队是否存在且用户是否为所有者
    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      throw new TeamError(TeamErrorCode.TEAM_NOT_FOUND, '团队不存在', 404);
    }

    if (team.ownerId !== userId) {
      throw new TeamError(
        TeamErrorCode.NOT_TEAM_OWNER,
        '只有团队创建者可以解散团队',
        403
      );
    }

    // 删除团队(级联删除成员、邀请、工作区等)
    await prisma.team.delete({
      where: { id: teamId },
    });
  }

  /**
   * 退出团队
   * 用户可以退出自己加入的团队
   * 团队所有者不能退出,只能解散团队
   */
  async leaveTeam(teamId: string, userId: string): Promise<void> {
    // 检查团队是否存在
    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      throw new TeamError(TeamErrorCode.TEAM_NOT_FOUND, '团队不存在', 404);
    }

    // 检查用户是否为团队所有者
    if (team.ownerId === userId) {
      throw new TeamError(
        TeamErrorCode.CANNOT_REMOVE_OWNER,
        '团队创建者不能退出团队，请先解散团队或转让所有权',
        400
      );
    }

    // 查找成员记录
    const membership = await prisma.teamMember.findFirst({
      where: {
        teamId,
        userId,
      },
    });

    if (!membership) {
      throw new TeamError(
        TeamErrorCode.USER_NOT_IN_TEAM,
        '您不是该团队的成员',
        400
      );
    }

    // 删除成员记录
    await prisma.teamMember.delete({
      where: { id: membership.id },
    });
  }

  /**
   * 检查用户是否为团队所有者
   */
  async checkTeamOwnership(teamId: string, userId: string): Promise<boolean> {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    return team?.ownerId === userId;
  }

  /**
   * 检查用户是否为团队成员(包括所有者)
   */
  async checkTeamMembership(teamId: string, userId: string): Promise<boolean> {
    // 检查是否为所有者
    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (team?.ownerId === userId) {
      return true;
    }

    // 检查是否为成员
    const membership = await prisma.teamMember.findFirst({
      where: {
        teamId,
        userId,
      },
    });

    return !!membership;
  }

  /**
   * 获取团队成员列表
   */
  async getTeamMembers(teamId: string): Promise<TeamMemberDTO[]> {
    const members = await prisma.teamMember.findMany({
      where: { teamId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    return members.map((m) => ({
      id: m.id,
      role: m.role as TeamRole,
      status: m.status as TeamMemberStatus,
      userId: m.userId,
      teamId: m.teamId,
      joinedAt: m.joinedAt,
      user: m.user,
    }));
  }

  /**
   * 移除团队成员
   * 只有团队所有者可以移除成员
   * 不能移除所有者自己
   */
  async removeMember(
    teamId: string,
    memberId: string,
    operatorId: string
  ): Promise<void> {
    // 检查操作者是否为团队所有者
    const isOwner = await this.checkTeamOwnership(teamId, operatorId);
    if (!isOwner) {
      throw new TeamError(
        TeamErrorCode.NOT_TEAM_OWNER,
        '只有团队创建者可以移除成员',
        403
      );
    }

    // 查找成员记录
    const member = await prisma.teamMember.findUnique({
      where: { id: memberId },
    });

    if (!member) {
      throw new TeamError(TeamErrorCode.USER_NOT_IN_TEAM, '成员不存在', 404);
    }

    // 检查成员是否属于该团队
    if (member.teamId !== teamId) {
      throw new TeamError(
        TeamErrorCode.USER_NOT_IN_TEAM,
        '该成员不属于这个团队',
        400
      );
    }

    // 删除成员记录
    await prisma.teamMember.delete({
      where: { id: memberId },
    });

    // 发送通知邮件给被移除的成员
    try {
      const team = await prisma.team.findUnique({
        where: { id: teamId },
        select: { name: true },
      });

      const removedUser = await prisma.user.findUnique({
        where: { id: member.userId },
        select: { email: true, username: true },
      });

      if (team && removedUser) {
        // TODO: 创建邮件发送函数 sendMemberRemovedEmail
        console.log(
          `[TeamService] 成员 ${removedUser.username} 已从团队 ${team.name} 中移除`
        );
        // await sendMemberRemovedEmail({
        //   to: removedUser.email,
        //   username: removedUser.username,
        //   teamName: team.name
        // });
      }
    } catch (error) {
      console.error('[TeamService] 发送成员移除通知失败:', error);
      // 不中断流程
    }
  }

  /**
   * 获取成员的项目权限列表
   */
  async getMemberPermissions(memberId: string): Promise<
    Array<{
      projectId: string;
      projectName: string;
      permission: string;
      grantedAt: Date;
    }>
  > {
    const member = await prisma.teamMember.findUnique({
      where: { id: memberId },
    });

    if (!member) {
      throw new TeamError(TeamErrorCode.USER_NOT_IN_TEAM, '成员不存在', 404);
    }

    const permissions = await prisma.projectPermission.findMany({
      where: { memberId },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return permissions.map((p) => ({
      projectId: p.projectId,
      projectName: p.project.name,
      permission: p.permission,
      grantedAt: p.createdAt,
    }));
  }

  /**
   * 生成邀请码
   */
  private generateInviteCode(teamId: string, email: string): string {
    const timestamp = Date.now().toString(36);
    const random = crypto.randomBytes(16).toString('hex');
    const signature = this.createSignature(teamId, email, timestamp);

    return `${timestamp}-${random}-${signature}`;
  }

  /**
   * 创建邀请码签名
   */
  private createSignature(
    teamId: string,
    email: string,
    timestamp: string
  ): string {
    const secret = process.env.INVITE_SECRET || 'default-secret';
    const data = `${teamId}:${email}:${timestamp}`;
    return crypto
      .createHmac('sha256', secret)
      .update(data)
      .digest('hex')
      .slice(0, 16);
  }

  /**
   * 发送团队邀请
   * 只有团队所有者可以邀请成员
   */
  async inviteMembers(
    teamId: string,
    inviterId: string,
    data: InviteMembersInput
  ): Promise<TeamInvitationDTO[]> {
    // 检查操作者是否为团队所有者
    const isOwner = await this.checkTeamOwnership(teamId, inviterId);
    if (!isOwner) {
      throw new TeamError(
        TeamErrorCode.NOT_TEAM_OWNER,
        '只有团队创建者可以邀请成员',
        403
      );
    }

    // 检查团队是否存在
    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      throw new TeamError(TeamErrorCode.TEAM_NOT_FOUND, '团队不存在', 404);
    }

    // 创建邀请记录
    const invitations: TeamInvitationDTO[] = [];
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7天后过期

    for (const email of data.emails) {
      // 检查邮箱是否已经被邀请(待处理状态)
      const existingInvitation = await prisma.teamInvitation.findFirst({
        where: {
          teamId,
          invitedEmail: email,
          status: InvitationStatus.PENDING,
        },
      });

      if (existingInvitation) {
        continue; // 跳过已存在的待处理邀请
      }

      // 检查用户是否已经存在
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      // 如果用户已经在团队中，跳过
      if (existingUser) {
        const isMember = await this.checkTeamMembership(
          teamId,
          existingUser.id
        );
        if (isMember) {
          continue;
        }
      }

      // 生成邀请码
      const inviteCode = this.generateInviteCode(teamId, email);

      // 创建邀请
      const invitation = await prisma.teamInvitation.create({
        data: {
          inviteCode,
          invitedEmail: email,
          status: InvitationStatus.PENDING,
          expiresAt,
          teamId,
          inviterId,
          invitedUserId: existingUser?.id,
        },
      });

      invitations.push(invitation as TeamInvitationDTO);
    }

    // 发送邀请邮件
    if (invitations.length > 0) {
      // 获取邀请者信息
      const inviter = await prisma.user.findUnique({
        where: { id: inviterId },
        select: {
          username: true,
        },
      });

      const inviterName = inviter?.username || '团队管理员';

      // 为每个邀请发送邮件
      for (const invitation of invitations) {
        try {
          // 构建邀请链接（前端接受邀请页面的URL）
          const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
          const inviteLink = `${baseUrl}/invite/${invitation.inviteCode}`;

          await sendTeamInvitationEmail({
            to: invitation.invitedEmail,
            teamName: team.name,
            teamDescription: team.description || undefined,
            inviterName,
            inviteLink,
            expiresAt: invitation.expiresAt,
          });

          console.log(`[TeamService] 邀请邮件已发送到 ${invitation.invitedEmail}`);
        } catch (error) {
          console.error(
            `[TeamService] 发送邀请邮件失败 (${invitation.invitedEmail}):`,
            error
          );
          // 不中断流程，继续处理其他邮件
        }
      }
    }

    return invitations;
  }

  /**
   * 通过邀请码获取邀请详情
   */
  async getInvitationByCode(
    inviteCode: string
  ): Promise<TeamInvitationDetailDTO | null> {
    const invitation = await prisma.teamInvitation.findUnique({
      where: { inviteCode },
      include: {
        team: {
          select: {
            id: true,
            name: true,
            description: true,
            avatar: true,
          },
        },
        inviter: {
          select: {
            id: true,
            username: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    if (!invitation) {
      return null;
    }

    return invitation as TeamInvitationDetailDTO;
  }

  /**
   * 接受邀请
   */
  async acceptInvitation(
    invitationId: string,
    userId: string
  ): Promise<void> {
    // 获取邀请信息
    const invitation = await prisma.teamInvitation.findUnique({
      where: { id: invitationId },
    });

    if (!invitation) {
      throw new TeamError(
        TeamErrorCode.INVALID_INVITATION,
        '邀请不存在',
        404
      );
    }

    // 检查邀请状态
    if (invitation.status !== InvitationStatus.PENDING) {
      throw new TeamError(
        TeamErrorCode.INVITATION_ALREADY_ACCEPTED,
        '邀请已被处理',
        400
      );
    }

    // 检查邀请是否过期
    if (invitation.expiresAt < new Date()) {
      // 更新邀请状态为过期
      await prisma.teamInvitation.update({
        where: { id: invitationId },
        data: { status: InvitationStatus.EXPIRED },
      });

      throw new TeamError(
        TeamErrorCode.INVITATION_EXPIRED,
        '邀请已过期',
        400
      );
    }

    // 检查用户是否已经在其他团队
    const existingMembership = await prisma.teamMember.findUnique({
      where: { userId },
    });

    if (existingMembership) {
      throw new TeamError(
        TeamErrorCode.USER_ALREADY_IN_TEAM,
        '您已经加入了一个团队，不能加入多个团队',
        400
      );
    }

    // 检查用户是否已经创建了团队
    const ownedTeam = await prisma.team.findUnique({
      where: { ownerId: userId },
    });

    if (ownedTeam) {
      throw new TeamError(
        TeamErrorCode.USER_ALREADY_IN_TEAM,
        '您已经创建了一个团队，不能加入其他团队',
        400
      );
    }

    // 创建成员记录并更新邀请状态(事务)
    await prisma.$transaction([
      prisma.teamMember.create({
        data: {
          teamId: invitation.teamId,
          userId,
          role: TeamRole.MEMBER,
          status: TeamMemberStatus.ACTIVE,
        },
      }),
      prisma.teamInvitation.update({
        where: { id: invitationId },
        data: {
          status: InvitationStatus.ACCEPTED,
          acceptedAt: new Date(),
          invitedUserId: userId,
        },
      }),
    ]);

    // 发送通知邮件给团队所有者
    try {
      // 获取团队和新成员信息
      const team = await prisma.team.findUnique({
        where: { id: invitation.teamId },
        include: {
          owner: {
            select: {
              email: true,
            },
          },
        },
      });

      const newMember = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          username: true,
          email: true,
        },
      });

      if (team && newMember) {
        await sendInvitationAcceptedEmail({
          to: team.owner.email,
          teamName: team.name,
          memberName: newMember.username,
          memberEmail: newMember.email,
        });

        console.log(
          `[TeamService] 已通知团队所有者 ${team.owner.email}，新成员 ${newMember.username} 加入团队`
        );
      }
    } catch (error) {
      console.error('[TeamService] 发送团队成员加入通知邮件失败:', error);
      // 不中断流程，邮件发送失败不影响加入团队
    }
  }

  /**
   * 拒绝邀请
   */
  async rejectInvitation(
    invitationId: string,
    userId: string
  ): Promise<void> {
    // 获取邀请信息
    const invitation = await prisma.teamInvitation.findUnique({
      where: { id: invitationId },
    });

    if (!invitation) {
      throw new TeamError(
        TeamErrorCode.INVALID_INVITATION,
        '邀请不存在',
        404
      );
    }

    // 检查邀请状态
    if (invitation.status !== InvitationStatus.PENDING) {
      throw new TeamError(
        TeamErrorCode.INVITATION_ALREADY_ACCEPTED,
        '邀请已被处理',
        400
      );
    }

    // 更新邀请状态
    await prisma.teamInvitation.update({
      where: { id: invitationId },
      data: {
        status: InvitationStatus.REJECTED,
        rejectedAt: new Date(),
        invitedUserId: userId,
      },
    });
  }

  /**
   * 撤销邀请
   * 只有团队所有者可以撤销邀请
   */
  async cancelInvitation(
    invitationId: string,
    userId: string
  ): Promise<void> {
    // 获取邀请信息
    const invitation = await prisma.teamInvitation.findUnique({
      where: { id: invitationId },
      include: {
        team: true,
      },
    });

    if (!invitation) {
      throw new TeamError(
        TeamErrorCode.INVALID_INVITATION,
        '邀请不存在',
        404
      );
    }

    // 检查操作者是否为团队所有者
    if (invitation.team.ownerId !== userId) {
      throw new TeamError(
        TeamErrorCode.NOT_TEAM_OWNER,
        '只有团队创建者可以撤销邀请',
        403
      );
    }

    // 检查邀请状态
    if (invitation.status !== InvitationStatus.PENDING) {
      throw new TeamError(
        TeamErrorCode.INVITATION_ALREADY_ACCEPTED,
        '邀请已被处理，无法撤销',
        400
      );
    }

    // 更新邀请状态
    await prisma.teamInvitation.update({
      where: { id: invitationId },
      data: {
        status: InvitationStatus.CANCELLED,
        cancelledAt: new Date(),
      },
    });
  }

  /**
   * 获取团队的所有邀请
   * 只有团队所有者可以查看
   */
  async getTeamInvitations(
    teamId: string,
    userId: string
  ): Promise<TeamInvitationDTO[]> {
    // 检查操作者是否为团队所有者
    const isOwner = await this.checkTeamOwnership(teamId, userId);
    if (!isOwner) {
      throw new TeamError(
        TeamErrorCode.NOT_TEAM_OWNER,
        '只有团队创建者可以查看邀请列表',
        403
      );
    }

    const invitations = await prisma.teamInvitation.findMany({
      where: { teamId },
      orderBy: { createdAt: 'desc' },
    });

    return invitations as TeamInvitationDTO[];
  }

  /**
   * 获取用户收到的待处理邀请
   */
  async getPendingInvitations(userId: string): Promise<TeamInvitationDetailDTO[]> {
    // 获取用户的邮箱
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return [];
    }

    // 查找待处理的邀请
    const invitations = await prisma.teamInvitation.findMany({
      where: {
        invitedEmail: user.email,
        status: InvitationStatus.PENDING,
        expiresAt: {
          gte: new Date(), // 未过期
        },
      },
      include: {
        team: {
          select: {
            id: true,
            name: true,
            description: true,
            avatar: true,
          },
        },
        inviter: {
          select: {
            id: true,
            username: true,
            email: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return invitations as TeamInvitationDetailDTO[];
  }

  /**
   * 清理过期邀请(定时任务调用)
   */
  async expireOldInvitations(): Promise<number> {
    const result = await prisma.teamInvitation.updateMany({
      where: {
        status: InvitationStatus.PENDING,
        expiresAt: {
          lt: new Date(),
        },
      },
      data: {
        status: InvitationStatus.EXPIRED,
      },
    });

    return result.count;
  }
}

// 导出单例
export const teamService = new TeamService();
