'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Plus, Trash2, ExternalLink, GripVertical } from 'lucide-react';
import { AddFeaturesToSprintModal } from './add-features-to-sprint-modal';
import { useRemoveFeatureFromSprint } from '@/hooks/useSprints';
import Link from 'next/link';

interface SprintBacklogTableProps {
    sprintId: string;
    projectId: string;
    features: any[];
    isProtected: boolean;
}

export function SprintBacklogTable({
    sprintId,
    projectId,
    features,
    isProtected
}: SprintBacklogTableProps) {
    const [modalOpen, setModalOpen] = useState(false);
    const removeFeature = useRemoveFeatureFromSprint(sprintId);

    const handleRemoveFeature = async (featureId: string) => {
        if (!confirm('Remover esta feature do sprint?')) return;

        try {
            await removeFeature.mutateAsync({
                featureId,
                force_override: isProtected
            });
        } catch (error: any) {
            if (error?.code === 'SPRINT_PROTECTED') {
                if (confirm('Sprint protegido. Confirma remoção? (será auditado)')) {
                    await removeFeature.mutateAsync({
                        featureId,
                        force_override: true
                    });
                }
            } else {
                alert(`Erro: ${error?.message || 'Falha ao remover feature'}`);
            }
        }
    };

    // Status colors
    const statusColors: Record<string, string> = {
        backlog: 'bg-gray-100 text-gray-700',
        todo: 'bg-blue-100 text-blue-700',
        'in-progress': 'bg-yellow-100 text-yellow-700',
        'in-review': 'bg-purple-100 text-purple-700',
        done: 'bg-green-100 text-green-700',
        cancelled: 'bg-red-100 text-red-700',
    };

    // Calcular totais
    const totalStoryPoints = features.reduce((sum, f) => sum + (f.story_points || 0), 0);
    const completedStoryPoints = features
        .filter(f => f.status === 'done')
        .reduce((sum, f) => sum + (f.story_points || 0), 0);

    return (
        <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-lg font-semibold">Sprint Backlog</h2>
                    <p className="text-sm text-muted-foreground">
                        {features.length} {features.length === 1 ? 'feature' : 'features'} • {completedStoryPoints}/{totalStoryPoints} story points concluídos
                    </p>
                </div>
                <Button onClick={() => setModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar Features
                </Button>
            </div>

            {features.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground mb-4">
                        Nenhuma feature adicionada ao sprint ainda.
                    </p>
                    <Button variant="outline" onClick={() => setModalOpen(true)}>
                        <Plus className="h-4 w-4 mr-1" />
                        Adicionar Features
                    </Button>
                </div>
            ) : (
                <div className="border rounded-lg overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12"></TableHead>
                                <TableHead>Código</TableHead>
                                <TableHead>Nome</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-center">Story Points</TableHead>
                                <TableHead className="text-center">DoD</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {features.map((feature) => (
                                <TableRow key={feature.id}>
                                    <TableCell>
                                        <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="font-mono">
                                            {feature.code}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Link
                                            href={`/projects/${projectId}/features/${feature.id}`}
                                            className="hover:underline font-medium"
                                        >
                                            {feature.name}
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="secondary"
                                            className={statusColors[feature.status] || statusColors.backlog}
                                        >
                                            {feature.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center font-medium">
                                        {feature.story_points || 0}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <span className="text-sm text-muted-foreground">
                                            {feature.dod_progress || 0}%
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                asChild
                                            >
                                                <Link href={`/projects/${projectId}/features/${feature.id}`}>
                                                    <ExternalLink className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleRemoveFeature(feature.id)}
                                                disabled={removeFeature.isPending}
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            {/* Modal para adicionar features */}
            <AddFeaturesToSprintModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                sprintId={sprintId}
                projectId={projectId}
            />
        </Card>
    );
}
