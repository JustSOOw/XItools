import React, { useState } from 'react';
import { useTeamStore } from '../../store/teamStore';
import { useI18n } from '../../hooks/useI18n';
import Modal from '../Modal';
import Button from '../Button';

interface InvitationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    teamId: string;
}

const InvitationDialog: React.FC<InvitationDialogProps> = ({ isOpen, onClose, teamId }) => {
    const { t } = useI18n();
    const { sendInvitations, isLoading } = useTeamStore();
    const [emails, setEmails] = useState('');
    const [role, setRole] = useState<'admin' | 'member' | 'guest'>('member');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const emailList = emails
            .split(/[,\n]/)
            .map((e) => e.trim())
            .filter((e) => e);

        if (emailList.length === 0) return;

        try {
            await sendInvitations(teamId, emailList, role);
            onClose();
            setEmails('');
        } catch (error) {
            console.error('Failed to send invitations', error);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={t('team:action.invite', { defaultValue: '邀请成员' })}
            size="md"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                        {t('team:invitation.emailAddresses', { defaultValue: '邮箱地址' })}
                    </label>
                    <textarea
                        value={emails}
                        onChange={(e) => setEmails(e.target.value)}
                        placeholder="alice@example.com, bob@example.com"
                        className="w-full h-32 px-3 py-2 bg-surface border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none resize-none"
                    />
                    <p className="mt-1 text-xs text-text-secondary">
                        {t('team:invitation.emailHelp', { defaultValue: '使用逗号或换行分隔多个邮箱' })}
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                        {t('team:invitation.defaultRole', { defaultValue: '默认角色' })}
                    </label>
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value as any)}
                        className="w-full px-3 py-2 bg-surface border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                    >
                        <option value="admin">{t('team:role.admin', { defaultValue: '管理员' })}</option>
                        <option value="member">{t('team:role.member', { defaultValue: '成员' })}</option>
                        <option value="guest">{t('team:role.viewer', { defaultValue: '访客' })}</option>
                    </select>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <Button variant="ghost" onClick={onClose} type="button">
                        {t('common:actions.cancel')}
                    </Button>
                    <Button variant="primary" type="submit" isLoading={isLoading}>
                        {t('team:action.sendInvite', { defaultValue: '发送邀请' })}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default InvitationDialog;
