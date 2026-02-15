'use client';

import { useMemo, useState } from 'react';
import { useFeatures } from '@/hooks/useFeatures';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Search, Plus, Eye, Edit, Trash } from 'lucide-react';
import Link from 'next/link';
import type { Feature } from '@/types';
import { CreateFeatureModal } from './create-feature-modal';
import { EditFeatureModal } from './edit-feature-modal';
import { DeleteFeatureDialog } from './delete-feature-dialog';

interface FeaturesTableProps {
  projectId?: string;
}

type ViewMode = 'all' | 'feature' | 'bug';

const statusColors: Record<string, string> = {
  backlog: 'bg-gray-100 text-gray-800 border-gray-300',
  todo: 'bg-blue-100 text-blue-800 border-blue-300',
  in_progress: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  review: 'bg-purple-100 text-purple-800 border-purple-300',
  testing: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  done: 'bg-green-100 text-green-800 border-green-300',
  blocked: 'bg-red-100 text-red-800 border-red-300',
};

const priorityColors: Record<string, string> = {
  P0: 'bg-red-500 text-white',
  P1: 'bg-orange-500 text-white',
  P2: 'bg-blue-500 text-white',
  P3: 'bg-gray-500 text-white',
};

const versionColors: Record<string, string> = {
  MVP: 'bg-uzzai-primary text-white',
  V1: 'bg-uzzai-secondary text-white',
  V2: 'bg-uzzai-warning text-white',
  V3: 'bg-purple-500 text-white',
  V4: 'bg-pink-500 text-white',
};

export function FeaturesTable({ projectId }: FeaturesTableProps) {
  const [search, setSearch] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [filters, setFilters] = useState({
    version: '',
    status: '',
    priority: '',
    dodFilter: '',
  });

  const apiItemType = viewMode === 'all' ? '' : viewMode;
  const { data, isLoading, error } = useFeatures({
    projectId,
    search,
    version: filters.version,
    status: filters.status,
    priority: filters.priority,
    itemType: apiItemType,
  });

  const allFeatures = data?.data || [];
  const counts = useMemo(() => {
    const featuresCount = allFeatures.filter((item) => item.work_item_type === 'feature').length;
    const bugsCount = allFeatures.filter((item) => item.work_item_type === 'bug').length;
    return {
      all: allFeatures.length,
      feature: featuresCount,
      bug: bugsCount,
      openBugs: allFeatures.filter((item) => item.work_item_type === 'bug' && item.status !== 'done').length,
    };
  }, [allFeatures]);

  const rows = allFeatures.filter((item) => {
    if (filters.dodFilter === 'complete') return item.dod_progress === 100;
    if (filters.dodFilter === 'incomplete') return item.dod_progress !== 100;
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-uzzai-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-red-600">Erro ao carregar itens.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-4">
        <div className="rounded-lg border p-3">
          <p className="text-xs text-muted-foreground">Total de itens</p>
          <p className="text-2xl font-semibold">{counts.all}</p>
        </div>
        <div className="rounded-lg border p-3">
          <p className="text-xs text-muted-foreground">Features</p>
          <p className="text-2xl font-semibold">{counts.feature}</p>
        </div>
        <div className="rounded-lg border p-3">
          <p className="text-xs text-muted-foreground">Bugs</p>
          <p className="text-2xl font-semibold">{counts.bug}</p>
        </div>
        <div className="rounded-lg border p-3">
          <p className="text-xs text-muted-foreground">Bugs abertos</p>
          <p className="text-2xl font-semibold text-red-600">{counts.openBugs}</p>
        </div>
      </div>

      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)}>
          <TabsList>
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="feature">Features</TabsTrigger>
            <TabsTrigger value="bug">Bugs</TabsTrigger>
          </TabsList>
        </Tabs>

        <Button className="bg-uzzai-primary hover:bg-uzzai-primary/90" onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {viewMode === 'bug' ? 'Novo Bug' : 'Novo Item'}
        </Button>
      </div>

      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="max-w-md flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Buscar por nome, codigo ou descricao..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={filters.version}
            onChange={(e) => setFilters({ ...filters, version: e.target.value })}
            className="rounded-lg border px-3 py-2 text-sm"
          >
            <option value="">Todas versoes</option>
            <option value="MVP">MVP</option>
            <option value="V1">V1</option>
            <option value="V2">V2</option>
            <option value="V3">V3</option>
            <option value="V4">V4</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="rounded-lg border px-3 py-2 text-sm"
          >
            <option value="">Todos status</option>
            <option value="backlog">Backlog</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="review">Review</option>
            <option value="testing">Testing</option>
            <option value="done">Done</option>
            <option value="blocked">Blocked</option>
          </select>

          <select
            value={filters.priority}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
            className="rounded-lg border px-3 py-2 text-sm"
          >
            <option value="">Todas prioridades</option>
            <option value="P0">P0 - Critico</option>
            <option value="P1">P1 - Alto</option>
            <option value="P2">P2 - Medio</option>
            <option value="P3">P3 - Baixo</option>
          </select>

          <select
            value={filters.dodFilter}
            onChange={(e) => setFilters({ ...filters, dodFilter: e.target.value })}
            className="rounded-lg border px-3 py-2 text-sm"
          >
            <option value="">Todos DoD</option>
            <option value="complete">DoD 100%</option>
            <option value="incomplete">DoD &lt; 100%</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-[100px]">Codigo</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead className="w-[90px]">Tipo</TableHead>
              <TableHead className="w-[80px]">Versao</TableHead>
              <TableHead className="w-[120px]">Status</TableHead>
              <TableHead className="w-[80px]">Prioridade</TableHead>
              <TableHead className="w-[100px]">DoD</TableHead>
              <TableHead className="w-[150px]">Responsaveis</TableHead>
              <TableHead className="w-[180px] text-right">Acoes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="py-8 text-center text-gray-500">
                  Nenhum item encontrado.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((feature: Feature) => (
                <TableRow key={feature.id} className="hover:bg-gray-50">
                  <TableCell className="font-mono text-sm font-medium">{feature.code}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-gray-900">{feature.name}</p>
                      {feature.description && (
                        <p className="line-clamp-1 text-sm text-gray-500">{feature.description}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{feature.work_item_type === 'bug' ? 'Bug' : 'Feature'}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={versionColors[feature.version] || 'bg-gray-500'}>{feature.version}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColors[feature.status] || 'bg-gray-100'}>
                      {feature.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={priorityColors[feature.priority] || 'bg-gray-500'}>{feature.priority}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        feature.dod_progress === 100
                          ? 'bg-green-100 text-green-800 border-green-300'
                          : feature.dod_progress >= 50
                            ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                            : 'bg-gray-100 text-gray-600 border-gray-300'
                      }
                    >
                      {feature.dod_progress}% DoD
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {feature.responsible && feature.responsible.length > 0 ? (
                        feature.responsible.slice(0, 2).map((person, i) => (
                          <Badge key={`${person}-${i}`} variant="outline" className="text-xs">
                            {person}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                      {feature.responsible && feature.responsible.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{feature.responsible.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
                        <Link href={`/projects/${projectId}/features/${feature.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1"
                        onClick={() => {
                          setSelectedFeature(feature);
                          setIsEditModalOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        onClick={() => {
                          setSelectedFeature(feature);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-600">
        <p>
          {rows.length} {rows.length === 1 ? 'item' : 'itens'} encontrado
          {rows.length !== 1 ? 's' : ''}
        </p>
      </div>

      <CreateFeatureModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        projectId={projectId}
        initialItemType={viewMode === 'bug' ? 'bug' : 'feature'}
      />
      <EditFeatureModal open={isEditModalOpen} onOpenChange={setIsEditModalOpen} feature={selectedFeature} />
      <DeleteFeatureDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen} feature={selectedFeature} />
    </div>
  );
}
