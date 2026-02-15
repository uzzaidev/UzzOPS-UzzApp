'use client';

import { useState } from 'react';

import { useTeam, useUpdateMember, useDeactivateMember } from '@/hooks/useTeam';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { CheckCircle2, Clock, MoreHorizontal, ShieldCheck, UserX, XCircle } from 'lucide-react';
import type { TeamMemberFull } from '@/types';
import { toast } from 'sonner';

const STATUS_CONFIG = {
  active:   { label: 'Ativo',     icon: CheckCircle2, className: 'bg-green-100 text-green-700' },
  pending:  { label: 'Pendente',  icon: Clock,        className: 'bg-amber-100 text-amber-700' },
  inactive: { label: 'Inativo',   icon: XCircle,      className: 'bg-gray-100 text-gray-500' },
};

const PERMISSION_CONFIG = {
  admin:  { label: 'Admin',  className: 'bg-purple-100 text-purple-700' },
  member: { label: 'Membro', className: 'bg-blue-100 text-blue-700' },
};

function MemberRow({ member }: { member: TeamMemberFull }) {
  const updateMember = useUpdateMember();
  const deactivate = useDeactivateMember();
  const [editOpen, setEditOpen] = useState(false);
  const [draft, setDraft] = useState({
    name: member.name ?? '',
    role: member.role ?? '',
    department: member.department ?? '',
    allocation_percent: member.allocation_percent == null ? '' : String(member.allocation_percent),
  });

  const statusCfg = STATUS_CONFIG[member.status] ?? STATUS_CONFIG.active;
  const StatusIcon = statusCfg.icon;
  const permCfg = PERMISSION_CONFIG[member.permission_level] ?? PERMISSION_CONFIG.member;

  const handleApprove = () => {
    updateMember.mutate(
      { memberId: member.id, updates: { status: 'active' } },
      { onSuccess: () => toast.success(`${member.name} aprovado!`),
        onError: () => toast.error('Erro ao aprovar membro') }
    );
  };

  const handleToggleAdmin = () => {
    const newLevel = member.permission_level === 'admin' ? 'member' : 'admin';
    updateMember.mutate(
      { memberId: member.id, updates: { permission_level: newLevel } },
      { onSuccess: () => toast.success(`Permissão atualizada`),
        onError: () => toast.error('Erro ao alterar permissão') }
    );
  };

  const handleDeactivate = () => {
    deactivate.mutate(member.id, {
      onSuccess: () => toast.success(`${member.name} desativado`),
      onError: () => toast.error('Erro ao desativar membro'),
    });
  };

  const handleReactivate = () => {
    updateMember.mutate(
      { memberId: member.id, updates: { status: 'active' } },
      { onSuccess: () => toast.success(`${member.name} reativado`),
        onError: () => toast.error('Erro ao reativar') }
    );
  };

  const handleSaveEdit = () => {
    const allocation =
      draft.allocation_percent.trim() === '' ? undefined : Number(draft.allocation_percent);
    if (allocation != null && (Number.isNaN(allocation) || allocation < 0 || allocation > 100)) {
      toast.error('Alocacao deve ser um numero entre 0 e 100.');
      return;
    }

    updateMember.mutate(
      {
        memberId: member.id,
        updates: {
          name: draft.name.trim(),
          role: draft.role.trim(),
          department: draft.department.trim() || null,
          allocation_percent: allocation,
        },
      },
      {
        onSuccess: () => {
          toast.success('Membro atualizado.');
          setEditOpen(false);
        },
        onError: () => toast.error('Erro ao atualizar membro'),
      }
    );
  };

  return (
    <TableRow className={member.status === 'inactive' ? 'opacity-50' : ''}>
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-uzzai-primary/10 flex items-center justify-center flex-shrink-0 text-sm font-semibold text-uzzai-primary">
            {member.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-sm">{member.name}</p>
            <p className="text-xs text-muted-foreground">{member.email}</p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div>
          <p className="text-sm">{member.role}</p>
          {member.department && (
            <p className="text-xs text-muted-foreground">{member.department}</p>
          )}
        </div>
      </TableCell>
      <TableCell>
        <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${permCfg.className}`}>
          {member.permission_level === 'admin' && <ShieldCheck className="h-3 w-3" />}
          {permCfg.label}
        </span>
      </TableCell>
      <TableCell>
        <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${statusCfg.className}`}>
          <StatusIcon className="h-3 w-3" />
          {statusCfg.label}
        </span>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {member.user_id ? (
          <span className="text-green-600 text-xs">✅ Vinculado</span>
        ) : (
          <span className="text-gray-400 text-xs">⚪ Sem login</span>
        )}
      </TableCell>
      <TableCell>
        <div className="flex items-center justify-end gap-1">
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">Editar</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editar membro</DialogTitle>
              </DialogHeader>
              <div className="grid gap-2">
                <Input
                  placeholder="Nome"
                  value={draft.name}
                  onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))}
                />
                <Input
                  placeholder="Cargo"
                  value={draft.role}
                  onChange={(e) => setDraft((p) => ({ ...p, role: e.target.value }))}
                />
                <Input
                  placeholder="Departamento"
                  value={draft.department}
                  onChange={(e) => setDraft((p) => ({ ...p, department: e.target.value }))}
                />
                <Input
                  placeholder="Alocacao (%)"
                  value={draft.allocation_percent}
                  onChange={(e) => setDraft((p) => ({ ...p, allocation_percent: e.target.value }))}
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setEditOpen(false)}>Cancelar</Button>
                  <Button onClick={handleSaveEdit} disabled={updateMember.isPending}>
                    {updateMember.isPending ? 'Salvando...' : 'Salvar'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {member.status === 'pending' && (
                <DropdownMenuItem onClick={handleApprove} className="text-green-600">
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Aprovar acesso
                </DropdownMenuItem>
              )}
              {member.status === 'inactive' && (
                <DropdownMenuItem onClick={handleReactivate} className="text-blue-600">
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Reativar
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={handleToggleAdmin}>
                <ShieldCheck className="mr-2 h-4 w-4" />
                {member.permission_level === 'admin' ? 'Remover admin' : 'Tornar admin'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {member.status !== 'inactive' && (
                <DropdownMenuItem onClick={handleDeactivate} className="text-destructive">
                  <UserX className="mr-2 h-4 w-4" />
                  Desativar
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
}

interface Props {
  projectId: string;
}

export function TeamPageContent({ projectId }: Props) {
  const { data: members, isLoading, error } = useTeam(projectId);

  const pending = members?.filter((m) => m.status === 'pending') ?? [];
  const active = members?.filter((m) => m.status === 'active') ?? [];
  const inactive = members?.filter((m) => m.status === 'inactive') ?? [];

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
      </div>
    );
  }

  if (error) {
    return <p className="text-destructive">Erro ao carregar equipe.</p>;
  }

  const sorted = [...pending, ...active, ...inactive];

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex gap-4">
        <div className="flex items-center gap-2 text-sm">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          <span>{active.length} ativos</span>
        </div>
        {pending.length > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="font-medium text-amber-700">{pending.length} aguardando aprovação</span>
          </div>
        )}
        {inactive.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-gray-400" />
            <span>{inactive.length} inativos</span>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Membro</TableHead>
              <TableHead>Cargo</TableHead>
              <TableHead>Permissão</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Login</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  Nenhum membro encontrado.
                </TableCell>
              </TableRow>
            ) : (
              sorted.map((member) => (
                <MemberRow key={member.id} member={member} />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-muted-foreground">
        Novos membros se registram em <strong>/register</strong> e aparecem aqui como &quot;Pendente&quot; até aprovação.
      </p>
    </div>
  );
}
