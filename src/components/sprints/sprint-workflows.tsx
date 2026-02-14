'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Play, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { useUpdateSprint } from '@/hooks/useSprints';
import { useRouter } from 'next/navigation';

interface SprintWorkflowsProps {
    sprint: any;
}

export function SprintWorkflows({ sprint }: SprintWorkflowsProps) {
    const [startDialogOpen, setStartDialogOpen] = useState(false);
    const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

    const updateSprint = useUpdateSprint();
    const router = useRouter();

    // START SPRINT
    const handleStartSprint = async () => {
        try {
            await updateSprint.mutateAsync({
                id: sprint.id,
                data: {
                    status: 'active',
                    is_protected: true,
                    started_at: new Date().toISOString()
                } as any
            });
            setStartDialogOpen(false);
            router.refresh();
        } catch (error) {
            console.error('Error starting sprint:', error);
            alert('Falha ao iniciar sprint');
        }
    };

    // COMPLETE SPRINT
    const handleCompleteSprint = async () => {
        try {
            await updateSprint.mutateAsync({
                id: sprint.id,
                data: {
                    status: 'completed',
                    completed_at: new Date().toISOString()
                } as any
            });
            setCompleteDialogOpen(false);
            router.refresh();
        } catch (error) {
            console.error('Error completing sprint:', error);
            alert('Falha ao concluir sprint');
        }
    };

    // CANCEL SPRINT
    const handleCancelSprint = async () => {
        // TODO: Adicionar campo de justificativa
        try {
            await updateSprint.mutateAsync({
                id: sprint.id,
                data: {
                    status: 'completed', // Ou criar um status 'cancelled'
                    completed_at: new Date().toISOString()
                } as any
            });
            setCancelDialogOpen(false);
            router.refresh();
        } catch (error) {
            console.error('Error cancelling sprint:', error);
            alert('Falha ao cancelar sprint');
        }
    };

    // Determinar quais botões mostrar baseado no status
    const showStartButton = sprint.status === 'planned';
    const showCompleteButton = sprint.status === 'active';
    const showCancelButton = sprint.status === 'planned' || sprint.status === 'active';

    if (!showStartButton && !showCompleteButton && !showCancelButton) {
        return null; // Não mostrar card se sprint já foi concluído
    }

    return (
        <>
            <Card className="p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-blue-500" />
                        <div>
                            <p className="font-medium">Workflows do Sprint</p>
                            <p className="text-sm text-muted-foreground">
                                {sprint.status === 'planned' && 'Inicie o sprint para ativar a proteção de escopo'}
                                {sprint.status === 'active' && 'Sprint em andamento - conclua quando todas as features estiverem prontas'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {showStartButton && (
                            <Button onClick={() => setStartDialogOpen(true)}>
                                <Play className="h-4 w-4 mr-1" />
                                Iniciar Sprint
                            </Button>
                        )}
                        {showCompleteButton && (
                            <Button onClick={() => setCompleteDialogOpen(true)}>
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                Concluir Sprint
                            </Button>
                        )}
                        {showCancelButton && (
                            <Button
                                variant="outline"
                                onClick={() => setCancelDialogOpen(true)}
                                className="text-red-600 hover:text-red-700"
                            >
                                <XCircle className="h-4 w-4 mr-1" />
                                Cancelar Sprint
                            </Button>
                        )}
                    </div>
                </div>
            </Card>

            {/* Dialog: Start Sprint */}
            <AlertDialog open={startDialogOpen} onOpenChange={setStartDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Iniciar Sprint?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Ao iniciar o sprint:
                            <ul className="list-disc list-inside mt-2 space-y-1">
                                <li>O escopo será <strong>protegido</strong> (mudanças requerem confirmação)</li>
                                <li>O status mudará para <strong>Ativo</strong></li>
                                <li>A data de início será registrada</li>
                            </ul>
                            <p className="mt-4 text-amber-600 font-medium">
                                ⚠️ Certifique-se de que todas as features necessárias foram adicionadas ao sprint.
                            </p>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleStartSprint} disabled={updateSprint.isPending}>
                            Iniciar Sprint
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Dialog: Complete Sprint */}
            <AlertDialog open={completeDialogOpen} onOpenChange={setCompleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Concluir Sprint?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Ao concluir o sprint:
                            <ul className="list-disc list-inside mt-2 space-y-1">
                                <li>O status mudará para <strong>Concluído</strong></li>
                                <li>A data de conclusão será registrada</li>
                                <li>Velocity será calculada automaticamente</li>
                            </ul>
                            <p className="mt-4 text-blue-600 font-medium">
                                💡 Não esqueça de fazer a Sprint Review e Retrospective!
                            </p>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleCompleteSprint} disabled={updateSprint.isPending}>
                            Concluir Sprint
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Dialog: Cancel Sprint */}
            <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-red-600">Cancelar Sprint?</AlertDialogTitle>
                        <AlertDialogDescription>
                            <p className="text-red-600 font-medium mb-2">
                                ⚠️ Esta ação não pode ser desfeita!
                            </p>
                            Ao cancelar o sprint:
                            <ul className="list-disc list-inside mt-2 space-y-1">
                                <li>O sprint será marcado como concluído</li>
                                <li>Features permanecerão vinculadas (você pode removê-las manualmente)</li>
                                <li>Esta ação será registrada no histórico</li>
                            </ul>
                            <p className="mt-4 text-sm text-muted-foreground">
                                Motivos comuns: escopo mal definido, mudança de prioridades, sprint planejado incorretamente.
                            </p>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Voltar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleCancelSprint}
                            disabled={updateSprint.isPending}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Sim, Cancelar Sprint
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
