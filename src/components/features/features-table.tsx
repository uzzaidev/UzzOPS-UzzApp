'use client';

import { useState } from 'react';
import { useFeatures } from '@/hooks/useFeatures';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Search, Plus, Eye, Edit, Trash } from 'lucide-react';
import Link from 'next/link';
import type { Feature } from '@/types';

interface FeaturesTableProps {
  projectId?: string;
}

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
  const [filters, setFilters] = useState({
    version: '',
    status: '',
    priority: '',
  });

  const { data, isLoading, error } = useFeatures({
    projectId,
    search,
    ...filters,
  });

  const features = data?.data || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-uzzai-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
        <p className="text-red-600">Erro ao carregar features.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtros e Busca */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar por nome, código ou descrição..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <select
            value={filters.version}
            onChange={(e) => setFilters({ ...filters, version: e.target.value })}
            className="px-3 py-2 border rounded-lg text-sm"
          >
            <option value="">Todas versões</option>
            <option value="MVP">MVP</option>
            <option value="V1">V1</option>
            <option value="V2">V2</option>
            <option value="V3">V3</option>
            <option value="V4">V4</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-3 py-2 border rounded-lg text-sm"
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
            className="px-3 py-2 border rounded-lg text-sm"
          >
            <option value="">Todas prioridades</option>
            <option value="P0">P0 - Crítico</option>
            <option value="P1">P1 - Alto</option>
            <option value="P2">P2 - Médio</option>
            <option value="P3">P3 - Baixo</option>
          </select>

          <Button className="bg-uzzai-primary hover:bg-uzzai-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Nova Feature
          </Button>
        </div>
      </div>

      {/* Tabela */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-[100px]">Código</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead className="w-[80px]">Versão</TableHead>
              <TableHead className="w-[120px]">Status</TableHead>
              <TableHead className="w-[80px]">Prioridade</TableHead>
              <TableHead className="w-[100px]">DoD</TableHead>
              <TableHead className="w-[150px]">Responsáveis</TableHead>
              <TableHead className="w-[120px] text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {features.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  Nenhuma feature encontrada.
                </TableCell>
              </TableRow>
            ) : (
              features.map((feature: Feature) => (
                <TableRow key={feature.id} className="hover:bg-gray-50">
                  <TableCell className="font-mono text-sm font-medium">
                    {feature.code}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-gray-900">{feature.name}</p>
                      {feature.description && (
                        <p className="text-sm text-gray-500 line-clamp-1">
                          {feature.description}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={versionColors[feature.version] || 'bg-gray-500'}>
                      {feature.version}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={statusColors[feature.status] || 'bg-gray-100'}
                    >
                      {feature.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={priorityColors[feature.priority] || 'bg-gray-500'}>
                      {feature.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${feature.dod_progress || 0}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-600">
                        {feature.dod_progress || 0}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {feature.responsible && feature.responsible.length > 0 ? (
                        feature.responsible.slice(0, 2).map((person, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
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
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="h-8 w-8 p-0"
                      >
                        <Link href={`/features/${feature.id}`}>
                          <Eye className="w-4 h-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
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
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <p>
          {features.length} {features.length === 1 ? 'feature' : 'features'} encontrada
          {features.length !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
}
