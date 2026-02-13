'use client';

import { useState } from 'react';
import { useSprints } from '@/hooks/useSprints';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, Calendar, Edit, Trash, Plus, ListPlus, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Sprint } from '@/types';
import { CreateSprintModal } from './create-sprint-modal';
import { EditSprintModal } from './edit-sprint-modal';
import { DeleteSprintDialog } from './delete-sprint-dialog';
import { AddFeaturesToSprintModal } from './add-features-to-sprint-modal';
import Link from 'next/link';

interface SprintsTableProps {
    projectId?: string;
}

const statusColors: Record<string, string> = {
    planned: 'bg-blue-100 text-blue-800 border-blue-300',
    active: 'bg-green-100 text-green-800 border-green-300',
    completed: 'bg-gray-100 text-gray-600 border-gray-300',
    cancelled: 'bg-red-100 text-red-800 border-red-300',
};

const statusLabels: Record<string, string> = {
    planned: 'Planejado',
    active: 'Ativo',
    completed: 'Concluído',
    cancelled: 'Cancelado',
};

export function SprintsTable({ projectId }: SprintsTableProps) {
    const { data, isLoading, error } = useSprints(projectId);
    const [search, setSearch] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isAddFeaturesModalOpen, setIsAddFeaturesModalOpen] = useState(false);
    const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>('');

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-uzzai-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-6">
                    <p className="text-red-600">Erro ao carregar sprints.</p>
                </CardContent>
            </Card>
        );
    }

    const sprints = data?.data || [];

    // Filtros
    const filteredSprints = sprints.filter((sprint) => {
        const matchesSearch =
            sprint.code.toLowerCase().includes(search.toLowerCase()) ||
            sprint.name.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = !statusFilter || sprint.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="w-5 h-5" />
                            Sprints ({filteredSprints.length})
                        </CardTitle>
                        <Button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="bg-uzzai-primary hover:bg-uzzai-primary/90"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Novo Sprint
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Filtros */}
                    <div className="flex gap-4">
                        <Input
                            placeholder="Buscar por código ou nome..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="max-w-sm"
                        />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-2 border rounded-md"
                        >
                            <option value="">Todos os status</option>
                            <option value="planned">Planejado</option>
                            <option value="active">Ativo</option>
                            <option value="completed">Concluído</option>
                            <option value="cancelled">Cancelado</option>
                        </select>
                    </div>

                    {/* Tabela */}
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Código</TableHead>
                                <TableHead>Nome</TableHead>
                                <TableHead>Objetivo</TableHead>
                                <TableHead>Período</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Velocity</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredSprints.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center text-gray-500">
                                        {search || statusFilter
                                            ? 'Nenhum sprint encontrado com os filtros aplicados'
                                            : 'Nenhum sprint cadastrado ainda'}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredSprints.map((sprint) => (
                                    <TableRow key={sprint.id}>
                                        <TableCell className="font-medium">{sprint.code}</TableCell>
                                        <TableCell>
                                            <Link
                                                href={`/projects/${projectId}/sprints/${sprint.id}`}
                                                className="hover:underline hover:text-uzzai-primary font-medium"
                                            >
                                                {sprint.name}
                                            </Link>
                                        </TableCell>
                                        <TableCell className="max-w-xs truncate">
                                            {sprint.goal || '-'}
                                        </TableCell>
                                        <TableCell>
                                            {format(new Date(sprint.start_date), 'dd/MM/yy', { locale: ptBR })}
                                            {' - '}
                                            {format(new Date(sprint.end_date), 'dd/MM/yy', { locale: ptBR })}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={statusColors[sprint.status]}>
                                                {statusLabels[sprint.status]}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {sprint.velocity_target ? (
                                                <span className="text-sm">
                                                    {sprint.velocity_actual || 0} / {sprint.velocity_target} pts
                                                </span>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                    asChild
                                                    title="Ver Detalhes"
                                                >
                                                    <Link href={`/projects/${projectId}/sprints/${sprint.id}`}>
                                                        <ExternalLink className="w-4 h-4" />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                                                    onClick={() => {
                                                        setSelectedSprint(sprint);
                                                        setIsAddFeaturesModalOpen(true);
                                                    }}
                                                    title="Adicionar Features"
                                                >
                                                    <ListPlus className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0"
                                                    onClick={() => {
                                                        setSelectedSprint(sprint);
                                                        setIsEditModalOpen(true);
                                                    }}
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                                    onClick={() => {
                                                        setSelectedSprint(sprint);
                                                        setIsDeleteDialogOpen(true);
                                                    }}
                                                >
                                                    <Trash className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Modals */}
            <CreateSprintModal
                open={isCreateModalOpen}
                onOpenChange={setIsCreateModalOpen}
                projectId={projectId}
            />

            <EditSprintModal
                open={isEditModalOpen}
                onOpenChange={setIsEditModalOpen}
                sprint={selectedSprint}
            />

            <DeleteSprintDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                sprint={selectedSprint}
            />

            {selectedSprint && (
                <AddFeaturesToSprintModal
                    open={isAddFeaturesModalOpen}
                    onOpenChange={setIsAddFeaturesModalOpen}
                    sprintId={selectedSprint.id}
                    projectId={projectId || ''}
                />
            )}
        </div>
    );
}
