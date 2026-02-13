'use client';

import { useState, useTransition } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useUpdateFeature } from '@/hooks/useFeatures';
import type { Feature } from '@/types';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DoDSectionProps {
    feature: Feature;
    editable?: boolean;
}

const DOD_CRITERIA = [
    { key: 'dod_functional', label: 'Funcionalidade implementada', icon: '⚙️' },
    { key: 'dod_tests', label: 'Testes escritos e passando', icon: '🧪' },
    { key: 'dod_code_review', label: 'Code review aprovado', icon: '👀' },
    { key: 'dod_documentation', label: 'Documentação atualizada', icon: '📝' },
    { key: 'dod_deployed', label: 'Deploy realizado', icon: '🚀' },
    { key: 'dod_user_acceptance', label: 'User acceptance OK', icon: '✅' },
] as const;

export function DoDSection({ feature, editable = true }: DoDSectionProps) {
    const updateFeature = useUpdateFeature();
    const [isPending, startTransition] = useTransition();
    const [updatingField, setUpdatingField] = useState<string | null>(null);

    const handleCheckboxChange = async (field: string, checked: boolean) => {
        if (!editable) return;

        setUpdatingField(field);

        try {
            await updateFeature.mutateAsync({
                id: feature.id,
                data: {
                    [field]: checked,
                },
            });
        } catch (error) {
            console.error('Erro ao atualizar DoD:', error);
        } finally {
            setUpdatingField(null);
        }
    };

    const progress = feature.dod_progress || 0;
    const isComplete = progress === 100;

    return (
        <div className="space-y-4">
            {/* Progress Bar */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <CheckCircle2
                            className={cn('w-5 h-5', isComplete ? 'text-green-600' : 'text-gray-400')}
                        />
                        <span className="text-sm font-medium">
                            Progresso: {progress}%
                        </span>
                    </div>
                    {isComplete && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                            DoD Completo ✓
                        </span>
                    )}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className={cn(
                            'h-2 rounded-full transition-all duration-300',
                            isComplete ? 'bg-green-600' : 'bg-uzzai-primary'
                        )}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Checkboxes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {DOD_CRITERIA.map((criterion) => {
                    const isChecked = feature[criterion.key as keyof Feature] as boolean;
                    const isUpdating = updatingField === criterion.key;

                    return (
                        <div
                            key={criterion.key}
                            className={cn(
                                'flex items-start space-x-3 p-3 rounded-lg border transition-colors',
                                isChecked ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200',
                                editable && 'hover:bg-gray-100'
                            )}
                        >
                            <div className="flex items-center h-5 mt-0.5">
                                {isUpdating ? (
                                    <Loader2 className="w-4 h-4 animate-spin text-uzzai-primary" />
                                ) : (
                                    <Checkbox
                                        id={`${feature.id}-${criterion.key}`}
                                        checked={isChecked}
                                        onCheckedChange={(checked) =>
                                            handleCheckboxChange(criterion.key, checked as boolean)
                                        }
                                        disabled={!editable || updateFeature.isPending}
                                    />
                                )}
                            </div>
                            <div className="flex-1">
                                <Label
                                    htmlFor={`${feature.id}-${criterion.key}`}
                                    className={cn(
                                        'text-sm font-medium cursor-pointer',
                                        !editable && 'cursor-default'
                                    )}
                                >
                                    <span className="mr-2">{criterion.icon}</span>
                                    {criterion.label}
                                </Label>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Info Footer */}
            {Array.isArray(feature.dod_custom_items) && feature.dod_custom_items.length > 0 && (
                <div className="space-y-2 rounded-lg border border-dashed p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        DoD personalizado
                    </p>
                    <ul className="space-y-1 text-sm">
                        {feature.dod_custom_items.map((item, index) => (
                            <li key={`${item}-${index}`} className="text-muted-foreground">
                                • {item}
                            </li>
                        ))}
                    </ul>
                    <p className="text-xs text-muted-foreground">
                        Critérios personalizados não entram no cálculo automático do percentual DoD.
                    </p>
                </div>
            )}

            {!isComplete && editable && (
                <p className="text-xs text-muted-foreground">
                    💡 Marque todos os critérios para marcar a feature como "Done"
                </p>
            )}
        </div>
    );
}
