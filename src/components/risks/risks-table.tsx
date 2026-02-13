'use client';

import { useState } from 'react';
import { useRisks } from '@/hooks/useRisks';
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
import { Loader2, Search, Plus, Edit, Trash, AlertTriangle } from 'lucide-react';
import type { Risk } from '@/types';
import { CreateRiskModal } from './create-risk-modal';
import { EditRiskModal } from './edit-risk-modal';
import { DeleteRiskDialog } from './delete-risk-dialog';

interface RisksTableProps {
  projectId?: string;
}

const statusColors: Record<string, string> = {
  identified: 'bg-gray-100 text-gray-800 border-gray-300',
  analyzing: 'bg-blue-100 text-blue-800 border-blue-300',
  mitigated: 'bg-green-100 text-green-800 border-green-300',
  accepted: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  resolved: 'bg-purple-100 text-purple-800 border-purple-300',
};

const statusLabels: Record<string, string> = {
  identified: 'Identificado',
  analyzing: 'Analisando',
  mitigated: 'Mitigado',
  accepted: 'Aceito',
  resolved: 'Resolvido',
};

const severityColors: Record<string, string> = {
  Crítico: 'bg-red-500 text-white',
  Alto: 'bg-orange-500 text-white',
  Médio: 'bg-yellow-500 text-white',
  Baixo: 'bg-green-500 text-white',
};

export function RisksTable({ projectId }: RisksTableProps) {
  const [search, setSearch] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    severity: '',
  });

  const { data, isLoading, error } = useRisks({
    project_id: projectId,
    search,
    status: filters.status,
    severity: filters.severity,
  });

  const risks = data?.data || [];

  const handleEdit = (risk: Risk) => {
    setSelectedRisk(risk);
    setIsEditModalOpen(true);
  };

  const handleDelete = (risk: Risk) => {
    setSelectedRisk(risk);
    setIsDeleteDialogOpen(true);
  };

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
        <p className="text-red-600">Erro ao carregar riscos.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1 w-full sm:max-w-sm">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar riscos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-uzzai-primary hover:bg-uzzai-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Risco
          </Button>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-3">
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-3 py-2 border rounded-lg text-sm"
          >
            <option value="">Todos os Status</option>
            <option value="identified">Identificado</option>
            <option value="analyzing">Analisando</option>
            <option value="mitigated">Mitigado</option>
            <option value="accepted">Aceito</option>
            <option value="resolved">Resolvido</option>
          </select>

          <select
            value={filters.severity}
            onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
            className="px-3 py-2 border rounded-lg text-sm"
          >
            <option value="">Todos os Níveis</option>
            <option value="Crítico">Crítico</option>
            <option value="Alto">Alto</option>
            <option value="Médio">Médio</option>
            <option value="Baixo">Baixo</option>
          </select>

          {(filters.status || filters.severity || search) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFilters({ status: '', severity: '' });
                setSearch('');
              }}
            >
              Limpar filtros
            </Button>
          )}
        </div>

        {/* Tabela */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="w-[100px]">Código</TableHead>
                <TableHead>Título</TableHead>
                <TableHead className="w-[120px]">GUT Score</TableHead>
                <TableHead className="w-[100px]">Nível</TableHead>
                <TableHead className="w-[150px]">Status</TableHead>
                <TableHead className="w-[120px] text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {risks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-gray-500">
                    {search || filters.status || filters.severity
                      ? 'Nenhum risco encontrado com os filtros aplicados.'
                      : 'Nenhum risco cadastrado. Clique em "Novo Risco" para começar.'}
                  </TableCell>
                </TableRow>
              ) : (
                risks.map((risk) => (
                  <TableRow key={risk.id} className="hover:bg-gray-50">
                    <TableCell className="font-mono text-sm">{risk.public_id}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">{risk.title}</p>
                        {risk.description && (
                          <p className="text-sm text-gray-500 line-clamp-1 mt-0.5">
                            {risk.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-gray-900">
                          {risk.gut_score}
                        </span>
                        <div className="text-xs text-gray-500">
                          <div>G:{risk.gut_g}</div>
                          <div>U:{risk.gut_u}</div>
                          <div>T:{risk.gut_t}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={severityColors[risk.severity_label || 'Baixo']}>
                        {risk.severity_label || 'Baixo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={statusColors[risk.status || 'identified']}
                      >
                        {statusLabels[risk.status || 'identified']}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(risk)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(risk)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
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

        {/* Contador */}
        {risks.length > 0 && (
          <div className="text-sm text-gray-500">
            {risks.length} {risks.length === 1 ? 'risco encontrado' : 'riscos encontrados'}
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateRiskModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        projectId={projectId}
      />

      {selectedRisk && (
        <>
          <EditRiskModal
            open={isEditModalOpen}
            onOpenChange={setIsEditModalOpen}
            risk={selectedRisk}
          />
          <DeleteRiskDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            risk={selectedRisk}
          />
        </>
      )}
    </>
  );
}
