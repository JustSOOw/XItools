/**
 * 接受团队邀请页面
 *
 * 支持两种 URL 格式：
 * - /invite/:inviteCode (邮件中的链接)
 * - /accept-invitation?code=xxx (旧格式，保持兼容)
 */

import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate, Navigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import { LoginStatus } from '../types/User';
import { TeamInvitationDetail } from '../types/teamTypes';
import invitationService from '../services/invitationService';
import Button from '../components/Button';
import { useTranslation } from 'react-i18next';
import TeamAvatar from '../components/team/TeamAvatar';

type InvitationStatus = 'loading' | 'verifying' | 'success' | 'error' | 'expired';

const AcceptInvitation: React.FC = () => {
    const { inviteCode: pathCode } = useParams<{ inviteCode: string }>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { user, loginStatus } = useUserStore();
    const isAuthenticated = loginStatus === LoginStatus.LOGGED_IN && !!user;

    // 优先使用路径参数，其次使用查询参数
    const inviteCode = pathCode || searchParams.get('code');

    const [status, setStatus] = useState<InvitationStatus>('loading');
    const [invitation, setInvitation] = useState<TeamInvitationDetail | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // 验证邀请码
    useEffect(() => {
        if (!inviteCode) {
            setStatus('error');
            setError(t('team:invitation.missingCode', { defaultValue: '邀请链接缺少代码。' }));
            return;
        }

        // 如果未登录，不进行验证（会重定向到登录页）
        if (!isAuthenticated) {
            return;
        }

        const verifyCode = async () => {
            setStatus('loading');
            try {
                const invitationData = await invitationService.verifyInviteCode(inviteCode);
                setInvitation(invitationData);

                // 检查邀请是否过期
                if (new Date(invitationData.expiresAt) < new Date()) {
                    setStatus('expired');
                    return;
                }

                setStatus('verifying');
            } catch (err: any) {
                setStatus('error');
                setError(err.message || t('team:invitation.invalid', { defaultValue: '邀请无效或已过期' }));
            }
        };

        verifyCode();
    }, [inviteCode, isAuthenticated, t]);

    // 如果未登录，重定向到登录页
    if (!isAuthenticated) {
        const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
        return <Navigate to={`/auth?returnUrl=${returnUrl}`} />;
    }

    // 没有邀请码
    if (!inviteCode) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-500 mb-2">
                        {t('team:invitation.invalid', { defaultValue: '邀请无效或已过期' })}
                    </h1>
                    <p className="text-text-secondary">
                        {t('team:invitation.missingCode', { defaultValue: '邀请链接缺少代码。' })}
                    </p>
                    <Button className="mt-4" onClick={() => navigate('/')}>
                        {t('common:actions.goHome', { defaultValue: '返回首页' })}
                    </Button>
                </div>
            </div>
        );
    }

    const handleAccept = async () => {
        if (!invitation) return;

        setIsProcessing(true);
        try {
            await invitationService.acceptInvitation(invitation.id);
            setStatus('success');
            setTimeout(() => {
                navigate('/');
            }, 2000);
        } catch (err: any) {
            setStatus('error');
            setError(err.message || t('team:invitation.acceptFailed', { defaultValue: '接受邀请失败' }));
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!invitation) return;

        setIsProcessing(true);
        try {
            await invitationService.rejectInvitation(invitation.id);
            navigate('/');
        } catch (err: any) {
            setError(err.message || t('team:invitation.rejectFailed', { defaultValue: '拒绝邀请失败' }));
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="max-w-md w-full bg-surface border border-border rounded-xl shadow-lg p-8 text-center">
                {/* 加载状态 */}
                {status === 'loading' && (
                    <>
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-primary animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                        </div>
                        <h1 className="text-xl font-bold text-text-primary mb-2">
                            {t('team:invitation.verifying', { defaultValue: '正在验证邀请...' })}
                        </h1>
                    </>
                )}

                {/* 验证成功，显示邀请详情 */}
                {status === 'verifying' && invitation && (
                    <>
                        <div className="mb-6">
                            <TeamAvatar
                                name={invitation.team.name}
                                avatarUrl={invitation.team.avatar}
                                size="xl"
                                className="mx-auto"
                            />
                        </div>

                        <h1 className="text-2xl font-bold text-text-primary mb-2">
                            {t('team:invitation.title', { defaultValue: '团队邀请' })}
                        </h1>

                        <p className="text-text-secondary mb-2">
                            <span className="font-medium text-primary">{invitation.inviter.username}</span>
                            {' '}
                            {t('team:invitation.invitedYou', { defaultValue: '邀请您加入团队' })}
                        </p>

                        <div className="bg-surface-hover rounded-lg p-4 mb-6">
                            <h2 className="text-lg font-semibold text-text-primary mb-1">
                                {invitation.team.name}
                            </h2>
                            {invitation.team.description && (
                                <p className="text-sm text-text-secondary">
                                    {invitation.team.description}
                                </p>
                            )}
                        </div>

                        <div className="flex gap-3 justify-center">
                            <Button
                                variant="ghost"
                                onClick={handleReject}
                                disabled={isProcessing}
                            >
                                {t('team:action.decline', { defaultValue: '拒绝' })}
                            </Button>
                            <Button
                                variant="primary"
                                onClick={handleAccept}
                                isLoading={isProcessing}
                            >
                                {t('team:action.accept', { defaultValue: '接受邀请' })}
                            </Button>
                        </div>
                    </>
                )}

                {/* 接受成功 */}
                {status === 'success' && (
                    <>
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>

                        <h1 className="text-2xl font-bold text-text-primary mb-2">
                            {t('team:invitation.welcome', { defaultValue: '欢迎加入！' })}
                        </h1>
                        <p className="text-text-secondary">
                            {t('team:invitation.redirecting', { defaultValue: '您已成功加入团队。正在跳转...' })}
                        </p>
                    </>
                )}

                {/* 邀请过期 */}
                {status === 'expired' && (
                    <>
                        <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>

                        <h1 className="text-2xl font-bold text-text-primary mb-2">
                            {t('team:invitation.expired', { defaultValue: '邀请已过期' })}
                        </h1>
                        <p className="text-text-secondary mb-4">
                            {t('team:invitation.expiredMessage', { defaultValue: '此邀请链接已过期，请联系团队管理员重新发送邀请。' })}
                        </p>
                        <Button onClick={() => navigate('/')}>
                            {t('common:actions.goHome', { defaultValue: '返回首页' })}
                        </Button>
                    </>
                )}

                {/* 错误状态 */}
                {status === 'error' && (
                    <>
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>

                        <h1 className="text-2xl font-bold text-text-primary mb-2">
                            {t('error:title', { defaultValue: '出错了' })}
                        </h1>
                        <p className="text-text-secondary mb-4">
                            {error || t('team:invitation.invalid', { defaultValue: '邀请无效或已过期。' })}
                        </p>
                        <Button onClick={() => navigate('/')}>
                            {t('common:actions.goHome', { defaultValue: '返回首页' })}
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
};

export default AcceptInvitation;
