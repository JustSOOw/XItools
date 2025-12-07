/*
 * @Author: wang22338014 wang22338014@gmail.com
 * @Date: 2025-11-22 17:51:21
 * @LastEditors: wang22338014 wang22338014@gmail.com
 * @LastEditTime: 2025-11-25 22:23:05
 * @FilePath: /XItools/frontend/src/components/team/InvitationDialog.tsx
 * @Description: 
 * 
 * Copyright (c) 2025 by Furdow, All Rights Reserved. 
 */
import React, { useState } from 'react';
import { useTeamStore } from '../../store/teamStore';
import { useI18n } from '../../hooks/useI18n';
import Modal from '../Modal';
import Button from '../Button';

export interface InvitationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    teamId: string;
}

const InvitationDialog: React.FC<InvitationDialogProps> = ({ isOpen, onClose, teamId }) => {
    const { t } = useI18n();
    const { sendInvitations, isLoading } = useTeamStore();
    const [emails, setEmails] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const emailList = emails
            .split(/[,\n]/)
            .map((e) => e.trim())
            .filter((e) => e);

        if (emailList.length === 0) return;

        try {
            await sendInvitations(teamId, emailList);
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
