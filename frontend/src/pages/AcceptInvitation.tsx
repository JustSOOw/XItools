import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Navigate } from 'react-router-dom';
import { useTeamStore } from '../store/teamStore';
import { useUserStore } from '../store/userStore';
import { LoginStatus } from '../types/User';
import Button from '../components/Button';
import { useTranslation } from 'react-i18next';

const AcceptInvitation: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('code');
    const { acceptInvitation, isLoading, error } = useTeamStore();
    const { user, loginStatus } = useUserStore();
    const isAuthenticated = loginStatus === LoginStatus.LOGGED_IN && !!user;
    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
    const { t } = useTranslation();

    useEffect(() => {
        if (!token) {
            setStatus('error');
            return;
        }

        // If not authenticated, redirect to login with return url
        if (!isAuthenticated) {
            // This logic might need to be handled by a route guard, but doing it here for simplicity
            return;
        }

        // Auto verify or wait for user confirmation?
        // Design says: Show details then click accept.
        // For now, let's simulate fetching invitation details
        setStatus('verifying');

    }, [token, isAuthenticated]);

    if (!isAuthenticated) {
        return <Navigate to={`/auth/login?returnUrl=${encodeURIComponent(window.location.pathname + window.location.search)}`} />;
    }

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-500 mb-2">{t('team:invitation.invalid', { defaultValue: '邀请无效或已过期' })}</h1>
                    <p className="text-text-secondary">{t('team:invitation.missingCode', { defaultValue: '邀请链接缺少代码。' })}</p>
                    <Button className="mt-4" onClick={() => navigate('/')}>{t('common:actions.goHome', { defaultValue: '返回首页' })}</Button>
                </div>
            </div>
        );
    }

    const handleAccept = async () => {
        try {
            await acceptInvitation(token);
            setStatus('success');
            setTimeout(() => {
                navigate('/');
            }, 2000);
        } catch (err) {
            setStatus('error');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="max-w-md w-full bg-surface border border-border rounded-xl shadow-lg p-8 text-center">
                {status === 'verifying' && (
                    <>
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-text-primary mb-2">{t('team:invitation.title', { defaultValue: '团队邀请' })}</h1>
                        <p className="text-text-secondary mb-8">
                            {t('team:invitation.description', { defaultValue: '邀请您加入团队' })}
                        </p>

                        <div className="flex gap-3 justify-center">
                            <Button variant="ghost" onClick={() => navigate('/')}>{t('team:action.decline', { defaultValue: '拒绝邀请' })}</Button>
                            <Button variant="primary" onClick={handleAccept} isLoading={isLoading}>
                                {t('team:action.accept', { defaultValue: '接受邀请' })}
                            </Button>
                        </div>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>

                        <h1 className="text-2xl font-bold text-text-primary mb-2">{t('team:invitation.welcome', { defaultValue: '欢迎加入' })}</h1>
                        <p className="text-text-secondary">
                            {t('team:invitation.redirecting', { defaultValue: '您已成功加入团队。正在跳转...' })}
                        </p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>

                        <h1 className="text-2xl font-bold text-text-primary mb-2">{t('error:title', { defaultValue: '错误' })}</h1>
                        <p className="text-text-secondary mb-4">
                            {error || t('team:invitation.invalid', { defaultValue: '接受邀请失败。邀请可能已过期或无效。' })}
                        </p>
                        <Button onClick={() => navigate('/')}>{t('common:actions.goHome', { defaultValue: '返回首页' })}</Button>
                    </>
                )
                }
            </div >
        </div >
    );
};

export default AcceptInvitation;
