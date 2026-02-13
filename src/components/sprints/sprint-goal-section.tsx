'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Target, Edit2, Save, X } from 'lucide-react';
import { useUpdateSprint } from '@/hooks/useSprints';

interface SprintGoalSectionProps {
    sprint: any;
}

export function SprintGoalSection({ sprint }: SprintGoalSectionProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [goalValue, setGoalValue] = useState(sprint.sprint_goal || '');

    const updateSprint = useUpdateSprint();

    const handleSave = async () => {
        try {
            await updateSprint.mutateAsync({
                id: sprint.id,
                data: { sprint_goal: goalValue }
            });
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating sprint goal:', error);
            alert('Falha ao atualizar Sprint Goal');
        }
    };

    const handleCancel = () => {
        setGoalValue(sprint.sprint_goal || '');
        setIsEditing(false);
    };

    return (
        <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    <h2 className="text-lg font-semibold">Sprint Goal</h2>
                </div>
                {!isEditing && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                        disabled={sprint.status === 'completed'}
                    >
                        <Edit2 className="h-4 w-4 mr-1" />
                        Editar
                    </Button>
                )}
            </div>

            {isEditing ? (
                <div className="space-y-3">
                    <Textarea
                        value={goalValue}
                        onChange={(e) => setGoalValue(e.target.value)}
                        placeholder="Digite o objetivo do sprint (mínimo 10 caracteres)..."
                        rows={3}
                        className="resize-none"
                    />
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            onClick={handleSave}
                            disabled={updateSprint.isPending || goalValue.trim().length < 10}
                        >
                            <Save className="h-4 w-4 mr-1" />
                            Salvar
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancel}
                            disabled={updateSprint.isPending}
                        >
                            <X className="h-4 w-4 mr-1" />
                            Cancelar
                        </Button>
                    </div>
                    {goalValue.trim().length < 10 && goalValue.trim().length > 0 && (
                        <p className="text-sm text-red-500">
                            Sprint Goal deve ter no mínimo 10 caracteres
                        </p>
                    )}
                </div>
            ) : (
                <p className="text-muted-foreground whitespace-pre-wrap">
                    {sprint.sprint_goal || 'Nenhum objetivo definido para este sprint.'}
                </p>
            )}
        </Card>
    );
}
