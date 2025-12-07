import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTeamStore } from '../../store/teamStore';
import { useI18n } from '../../hooks/useI18n';
import { toast } from '../ui/Toast';
import Portal from '../Portal';

interface CreateTeamDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

const CreateTeamDialog: React.FC<CreateTeamDialogProps> = ({ isOpen, onClose }) => {
    const { t } = useI18n();
    const navigate = useNavigate();
    const { createTeam } = useTeamStore();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setIsLoading(true);
        try {
            const newTeam = await createTeam({ name, description });
            toast.success(t('team:action.createSuccess', { defaultValue: '团队创建成功' }));
            onClose();
            setName('');
            setDescription('');
            navigate(`/team/settings?teamId=${newTeam.id}`);
        } catch (error) {
            console.error('Failed to create team:', error);
            toast.error(t('team:action.createFailed', { defaultValue: '创建团队失败，请重试' }));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Portal>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <div className="bg-surface w-full max-w-md rounded-xl shadow-2xl border border-border p-6 animate-in fade-in zoom-in duration-200">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-text-primary">
                            {t('team:action.create', { defaultValue: '创建团队' })}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-text-tertiary hover:text-text-primary transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">
                                    {t('team:info.name', { defaultValue: '团队名称' })} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                    placeholder={t('team:info.namePlaceholder', { defaultValue: '请输入团队名称' })}
                                    required
                                    maxLength={50}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">
                                    {t('team:info.description', { defaultValue: '团队描述' })}
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none h-24"
                                    placeholder={t('team:info.descriptionPlaceholder', { defaultValue: '请输入团队描述（可选）' })}
                                    maxLength={200}
                                />
                            </div>

                            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-sm text-blue-600 dark:text-blue-400">
                                <p>ℹ️ {t('team:create.note1', { defaultValue: '创建团队后，将自动创建团队工作区' })}</p>
                                <p>ℹ️ {t('team:create.note2', { defaultValue: '您将成为团队管理员，拥有所有权限' })}</p>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-text-secondary hover:bg-surface-hover rounded-lg transition-colors"
                            >
                                {t('common:actions.cancel', { defaultValue: '取消' })}
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading || !name.trim()}
                                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isLoading ? t('common:status.processing', { defaultValue: '处理中...' }) : t('team:action.create', { defaultValue: '创建团队' })}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Portal>
    );
};

export default CreateTeamDialog;
