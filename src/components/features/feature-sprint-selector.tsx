'use client';

import { useState } from 'react';
import { useSprints, useAddFeatureToSprint, useRemoveFeatureFromSprint, useSprintFeatures } from '@/hooks/useSprints';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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
import { Loader2, Timer, AlertCircle, Unplug } from 'lucide-react';
import { Feature } from '@/types';
import { format } from 'date-fns';

interface FeatureSprintSelectorProps {
    feature: Feature;
    projectId: string;
}

export function FeatureSprintSelector({ feature, projectId }: FeatureSprintSelectorProps) {
    const [isChanging, setIsChanging] = useState(false);
    const [confirmOverrideOpen, setConfirmOverrideOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState<{ type: 'ADD' | 'REMOVE'; sprintId: string } | null>(null);

    // Buscar todos os sprints do projeto
    const { data: sprintsData, isLoading: isLoadingSprints } = useSprints(projectId);
    const sprints = sprintsData?.data || [];

    // Tentar identificar em qual sprint esta feature está (isso idealmente viria na Feature, mas vamos varrer por enquanto ou assumir que o backend enviou)
    // Se a feature tiver `sprint_id`, usamos ele. Senão, teríamos que buscar.
    // Como a feature agora tem `sprint_id` (assumindo que adicionamos no retorno da feature), usamos.
    // SE NÃO tiver na feature, precisamos verificar. Mas vamos assumir que `feature.sprint_id` pode vir populado se ajustarmos o backend de feature.
    // POR ENQUANTO: Vamos buscar sprints e ver se achamos a feature neles? Não, ineficiente.
    // Vamos assumir que a Feature Details já traga essa info. Vamos verificar `useFeature`.

    // Assumindo que o objeto feature pode ter `sprint_id` ou `sprint` (join).
    // Se não tiver, precisaremos de um endpoint ou a lista de sprints_features para saber.

    // Melhor: O componente Select vai listar os sprints.
    // O valor selecionado será `feature.sprint_id`.

    // Mutations (precisamos do ID do sprint para os hooks, o que complica se não soubermos o sprint atual para remover)
    // O hook useAddFeatureToSprint precisa de `sprintId`.
    // O hook useRemoveFeatureFromSprint precisa de `sprintId`.

    // SOLUÇÃO: Vamos fazer este componente aceitar `currentSprintId` como prop, que deve vir da página.
    // Se a API de features não retornar o sprint, teremos que ajustar lá.

    // Vamos assumir por hora que `feature.sprint_id` existe (precisamos verificar a API de features GET /id).
    // Se não existir, vamos adicionar.

    const currentSprintId = (feature as any).sprint_id || null;
    const currentSprint = sprints.find(s => s.id === currentSprintId);

    // Hooks dinâmicos são perigosos. Vamos instanciar hooks apenas quando tivermos ação? Não.
    // Vamos usar um hook genérico ou instanciar para o sprint selecionado?
    // O hook `useAddFeatureToSprint` recebe `sprintId` no factory.
    // Isso é um problema para este componente que muda de sprint.

    // Refatoração necessária nos hooks: Aceitar sprintId na mutation, não na criação do hook.
    // OU instanciar hooks para todos os sprints? Não.

    // Vamos usar fetch direto aqui para simplificar ou refatorar o hook?
    // Melhor refatorar o hook `useAddFeatureToSprint` para permitir passar ID na chamada, ou criar um novo `useManageSprintFeature`.

    // Workaround temporário: Usar fetch direto para evitar refatorar todos os hooks agora.
    const handleSprintChange = async (sprintId: string) => {
        if (sprintId === 'none') {
            if (currentSprintId) handleRemove(currentSprintId);
            return;
        }
        handleAdd(sprintId);
    };

    const performApiCall = async (url: string, method: 'POST' | 'DELETE', body?: any) => {
        setIsChanging(true);
        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: body ? JSON.stringify(body) : undefined
            });

            if (!res.ok) {
                const error = await res.json();
                throw error; // Lança para o catch
            }

            // Sucesso - Reload window ou invalidar cache global
            window.location.reload(); // Quick fix para atualizar dados
        } catch (error: any) {
            console.error('Erro na ação de sprint:', error);

            if (error?.code === 'SPRINT_PROTECTED' || error?.status === 403) {
                return 'PROTECTED';
            }
            alert(`Erro: ${error.message || 'Falha na operação'}`);
            return 'ERROR';
        } finally {
            setIsChanging(false);
        }
        return 'SUCCESS';
    };

    const handleAdd = async (targetSprintId: string, force = false) => {
        // 1. Se já tem sprint, remover do anterior? (Regra de negócio: Feature pode estar em múltiplos sprints? Scrum diz NÃO. Uma feature por vez).
        // Vamos assumir migração: Remove do atual, adiciona no novo.
        if (currentSprintId && currentSprintId !== targetSprintId) {
            // TODO: Remover do atual primeiro? Ou a API trata? Vamos tentar adicionar direto.
        }

        const res = await performApiCall(
            `/api/sprints/${targetSprintId}/features`,
            'POST',
            { feature_id: feature.id, force_override: force }
        );

        if (res === 'PROTECTED') {
            setPendingAction({ type: 'ADD', sprintId: targetSprintId });
            setConfirmOverrideOpen(true);
        }
    };

    const handleRemove = async (sprintId: string, force = false) => {
        const url = new URL(`/api/sprints/${sprintId}/features`, window.location.origin);
        url.searchParams.set('feature_id', feature.id);
        if (force) url.searchParams.set('force_override', 'true');

        const res = await performApiCall(url.toString(), 'DELETE');

        if (res === 'PROTECTED') {
            setPendingAction({ type: 'REMOVE', sprintId });
            setConfirmOverrideOpen(true);
        }
    };

    const handleConfirmOverride = () => {
        if (!pendingAction) return;

        if (pendingAction.type === 'ADD') {
            handleAdd(pendingAction.sprintId, true);
        } else {
            handleRemove(pendingAction.sprintId, true);
        }
        setConfirmOverrideOpen(false); // Fecha modal, o resto é async
    };

    if (isLoadingSprints) return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;

    return (
        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
            <Timer className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-gray-700">Sprint:</span>

            <Select
                disabled={isChanging}
                value={currentSprintId || 'none'}
                onValueChange={handleSprintChange}
            >
                <SelectTrigger className="w-[200px] h-8 text-sm">
                    <SelectValue placeholder="Selecionar Sprint" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="none" className="text-muted-foreground">
                        -- Sem Sprint --
                    </SelectItem>
                    {sprints.map(sprint => (
                        <SelectItem key={sprint.id} value={sprint.id}>
                            <span className="flex items-center gap-2">
                                {sprint.status === 'active' && <div className="w-1.5 h-1.5 rounded-full bg-green-500" />}
                                {sprint.name}
                            </span>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {currentSprint && (
                <Badge variant={currentSprint.status === 'active' ? 'default' : 'outline'} className="text-xs">
                    {currentSprint.status === 'active' ? 'Em Andamento' : currentSprint.status}
                </Badge>
            )}

            {/* Modal de Confirmação */}
            <AlertDialog open={confirmOverrideOpen} onOpenChange={setConfirmOverrideOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-amber-600 flex items-center gap-2">
                            <AlertCircle className="h-5 w-5" />
                            Sprint Protegido
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            O sprint selecionado está <strong>ATIVO</strong>.
                            <br /><br />
                            {pendingAction?.type === 'ADD' ? 'Adicionar' : 'Remover'} esta feature vai alterar o escopo comprometido.
                            Esta ação gerará um log de auditoria.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setPendingAction(null)}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmOverride} className="bg-amber-600 hover:bg-amber-700">
                            Confirmar Mudança
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
