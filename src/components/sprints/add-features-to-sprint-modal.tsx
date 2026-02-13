'use client';

import { useState } from 'react';
import { useFeatures } from '@/hooks/useFeatures';
import { useAddFeatureToSprint, useRemoveFeatureFromSprint, useSprintFeatures } from '@/hooks/useSprints';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Search, Plus, Trash2, AlertCircle, GripVertical } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AddFeaturesToSprintModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    sprintId: string;
    projectId: string;
}

export function AddFeaturesToSprintModal({
    open,
    onOpenChange,
    sprintId,
    projectId,
}: AddFeaturesToSprintModalProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [confirmOverrideOpen, setConfirmOverrideOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState<{ type: 'ADD' | 'REMOVE'; featureId: string } | null>(null);

    // Queries
    const { data: allFeaturesData, isLoading: isLoadingAll } = useFeatures({ projectId: projectId || undefined });
    const { data: sprintFeaturesData, isLoading: isLoadingSprint } = useSprintFeatures(sprintId);

    // Mutations
    const addFeature = useAddFeatureToSprint(sprintId);
    const removeFeature = useRemoveFeatureFromSprint(sprintId);

    const allFeatures = allFeaturesData?.data || [];
    const linkedFeatures = sprintFeaturesData?.data || [];
    const linkedFeatureIds = linkedFeatures.map((f: any) => f.id);

    // Filtrar features disponíveis (não vinculadas ainda)
    const availableFeatures = allFeatures.filter(
        (f) => !linkedFeatureIds.includes(f.id)
    );

    // Filtrar por busca
    const filteredAvailable = searchQuery
        ? availableFeatures.filter(
            (f) =>
                f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                f.code.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : availableFeatures;

    const handleAction = async (type: 'ADD' | 'REMOVE', featureId: string, force = false) => {
        if (!sprintId) {
            console.error('[Modal] Missing sprintId');
            alert('Erro: Sprint ID não encontrado');
            return;
        }

        if (!featureId) {
            console.error('[Modal] Missing featureId');
            alert('Erro: Feature ID não encontrado');
            return;
        }

        console.log('[Modal] handleAction called:', {
            type,
            featureId,
            sprintId,
            force,
            timestamp: new Date().toISOString()
        });

        try {
            if (type === 'ADD') {
                console.log('[Modal] Calling addFeature.mutateAsync with:', {
                    feature_id: featureId,
                    force_override: force
                });
                await addFeature.mutateAsync({ feature_id: featureId, force_override: force });
                console.log('[Modal] Feature added successfully');
            } else {
                console.log('[Modal] Calling removeFeature.mutateAsync with:', {
                    featureId,
                    force_override: force
                });
                await removeFeature.mutateAsync({ featureId: featureId, force_override: force });
                console.log('[Modal] Feature removed successfully');
            }

            // Sucesso - Limpar estados se necessário
            if (force) {
                setConfirmOverrideOpen(false);
                setPendingAction(null);
            }
        } catch (error: any) {
            console.error(`[Modal] Erro ao ${type} feature:`, {
                error,
                type: typeof error,
                keys: error ? Object.keys(error) : [],
                message: error?.message,
                code: error?.code,
                status: error?.status,
                details: error?.details
            });

            // Interceptar proteção de escopo
            if (error?.code === 'SPRINT_PROTECTED' || error?.status === 403) {
                console.log('[Modal] Sprint protegido detectado, abrindo confirmação');
                setPendingAction({ type, featureId });
                setConfirmOverrideOpen(true);
            } else {
                const msg = error?.message || error?.details?.error || error?.details?.message || JSON.stringify(error) || 'Erro desconhecido';
                console.error('[Modal] Showing error alert:', msg);
                alert(`Falha ao ${type === 'ADD' ? 'adicionar' : 'remover'}: ${msg}`);
            }
        }
    };

    const handleConfirmOverride = () => {
        if (!pendingAction) return;
        handleAction(pendingAction.type, pendingAction.featureId, true);
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-0 gap-0">
                    <DialogHeader className="p-6 pb-2">
                        <DialogTitle>Gerenciar Features do Sprint</DialogTitle>
                        <DialogDescription>
                            Organize o backlog deste sprint adicionando ou removendo features.
                        </DialogDescription>
                    </DialogHeader>

                    <Tabs defaultValue="sprint_backlog" className="flex-1 flex flex-col overflow-hidden">
                        <div className="px-6 border-b">
                            <TabsList className="w-full justify-start rounded-none h-12 bg-transparent p-0 space-x-6">
                                <TabsTrigger
                                    value="sprint_backlog"
                                    className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-0 pb-3"
                                >
                                    Sprint Backlog
                                    <Badge variant="secondary" className="ml-2 text-xs">{linkedFeatures.length}</Badge>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="available"
                                    className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-0 pb-3"
                                >
                                    Adicionar Features
                                    <Badge variant="outline" className="ml-2 text-xs">{availableFeatures.length}</Badge>
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        {/* --- ABA 1: SPRINT BACKLOG (LINKED) --- */}
                        <TabsContent value="sprint_backlog" className="flex-1 overflow-hidden flex flex-col p-0 data-[state=inactive]:hidden">
                            <ScrollArea className="flex-1 p-6">
                                {isLoadingSprint ? (
                                    <div className="flex justify-center py-8"><Loader2 className="animate-spin text-muted-foreground" /></div>
                                ) : linkedFeatures.length === 0 ? (
                                    <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                                        Sprint vazio. Vá para a aba "Adicionar Features" para começar.
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {linkedFeatures.map((feature: any) => (
                                            <div key={feature.id} className="flex items-center justify-between p-3 bg-white border rounded-lg shadow-sm group">
                                                <div className="flex items-center gap-3">
                                                    <GripVertical className="h-4 w-4 text-gray-300 cursor-move" />
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <Badge variant="secondary" className="font-mono">{feature.code}</Badge>
                                                            <span className="font-medium text-sm">{feature.name}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Badge variant="outline" className="text-[10px]">{feature.status}</Badge>
                                                            {feature.story_points > 0 && (
                                                                <span className="text-xs text-muted-foreground">{feature.story_points} pts</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                    disabled={removeFeature.isPending}
                                                    onClick={() => {
                                                        console.log('[Modal] Removing feature:', {
                                                            feature_id: feature.id,
                                                            sprint_feature_id: feature.sprint_feature_id,
                                                            feature
                                                        });
                                                        handleAction('REMOVE', feature.id); // Sempre usa feature.id, não sprint_feature_id
                                                    }}
                                                >
                                                    {removeFeature.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </ScrollArea>
                        </TabsContent>

                        {/* --- ABA 2: AVAILABLE FEATURES --- */}
                        <TabsContent value="available" className="flex-1 overflow-hidden flex flex-col p-0 data-[state=inactive]:hidden">
                            <div className="p-4 border-b bg-gray-50/50">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Buscar features..."
                                        className="pl-9 bg-white"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>
                            <ScrollArea className="flex-1 p-6">
                                {isLoadingAll ? (
                                    <div className="flex justify-center py-8"><Loader2 className="animate-spin text-muted-foreground" /></div>
                                ) : filteredAvailable.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        Nenhuma feature encontrada.
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {filteredAvailable.map((feature) => (
                                            <div key={feature.id} className="flex items-center justify-between p-3 bg-white border rounded-lg hover:border-primary/50 transition-colors">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline">{feature.code}</Badge>
                                                        <span className="font-medium">{feature.name}</span>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground line-clamp-1">{feature.description}</p>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleAction('ADD', feature.id)}
                                                    disabled={addFeature.isPending}
                                                >
                                                    <Plus className="h-4 w-4 mr-1" />
                                                    Adicionar
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </ScrollArea>
                        </TabsContent>
                    </Tabs>
                </DialogContent>
            </Dialog>

            <AlertDialog open={confirmOverrideOpen} onOpenChange={setConfirmOverrideOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-amber-600 flex items-center gap-2">
                            <AlertCircle className="h-5 w-5" />
                            Atenção: Sprint Protegido
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Este sprint está <strong>ATIVO</strong> e seu escopo está protegido.
                            <br /><br />
                            {pendingAction?.type === 'ADD'
                                ? 'Adicionar uma nova feature '
                                : 'Remover esta feature '}
                            pode impactar a meta do sprint.
                            <br /><br />
                            Esta ação será auditada. Deseja continuar?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setPendingAction(null)}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmOverride}
                            className="bg-amber-600 hover:bg-amber-700"
                        >
                            Confirmar Mudança
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
