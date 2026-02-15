'use client';

import Link from 'next/link';
import { useMemo, useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScoreRadarChart } from '@/components/clients/score-radar-chart';
import { MarkdownRenderer } from '@/components/shared/markdown-renderer';
import { useClientContact, useUpdateClientContact } from '@/hooks/useClients';
import { dealOutcomeLabel, funnelLabel, negotiationLabel, priorityLabel, sentimentLabel } from '@/lib/crm/labels';

function asText(v: unknown) {
  if (v == null) return '-';
  const s = String(v).trim();
  return s || '-';
}

function asArray(v: unknown): unknown[] {
  return Array.isArray(v) ? v : [];
}

function asObject(v: unknown): Record<string, unknown> | null {
  if (v && typeof v === 'object' && !Array.isArray(v)) return v as Record<string, unknown>;
  return null;
}

function money(v: unknown) {
  if (typeof v !== 'number') return '-';
  return `R$ ${v.toFixed(2)}`;
}

function renderListItem(item: unknown, preferred: string[]) {
  if (item == null) return '-';
  if (typeof item !== 'object' || Array.isArray(item)) return asText(item);
  const obj = item as Record<string, unknown>;
  const parts = preferred
    .map((key) => {
      const value = asText(obj[key]);
      return value === '-' ? null : `${key}: ${value}`;
    })
    .filter(Boolean);
  return parts.length ? parts.join(' | ') : JSON.stringify(obj);
}

function insightTypeClass(value: string) {
  const key = value.trim().toLowerCase();
  if (key === 'critico') return 'bg-rose-50 text-rose-700 border-rose-200';
  if (key === 'vendas') return 'bg-blue-50 text-blue-700 border-blue-200';
  if (key === 'produto') return 'bg-indigo-50 text-indigo-700 border-indigo-200';
  return 'bg-slate-50 text-slate-700 border-slate-200';
}

function objectionStatusClass(value: string) {
  const key = value.trim().toLowerCase();
  if (key === 'resolvida') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (key.includes('parcial')) return 'bg-amber-50 text-amber-700 border-amber-200';
  if (key === 'nao resolvida') return 'bg-red-50 text-red-700 border-red-200';
  return 'bg-slate-50 text-slate-700 border-slate-200';
}

function urgencyClass(value: string) {
  const key = value.trim().toLowerCase();
  if (key === 'alta') return 'bg-red-50 text-red-700 border-red-200';
  if (key === 'media') return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-slate-50 text-slate-700 border-slate-200';
}

function riskClass(value: string) {
  const key = value.trim().toLowerCase();
  if (key.includes('alta') || key.includes('alto') || key === '12') {
    return 'bg-red-50 text-red-700 border-red-200';
  }
  if (key.includes('media') || key.includes('medio') || key === '8' || key === '6') {
    return 'bg-amber-50 text-amber-700 border-amber-200';
  }
  return 'bg-slate-50 text-slate-700 border-slate-200';
}

function sentimentClass(value: string) {
  const key = value.trim().toLowerCase();
  if (key === 'positivo') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (key === 'negativo') return 'bg-red-50 text-red-700 border-red-200';
  return 'bg-amber-50 text-amber-700 border-amber-200';
}

const ARRAY_ITEM_TEMPLATES: Record<
  | 'dores_json'
  | 'objecoes_json'
  | 'insights_json'
  | 'riscos_json'
  | 'proximos_passos_json'
  | 'quality_checklist',
  Record<string, unknown>
> = {
  dores_json: {
    dor: 'Nova dor',
    descricao: '',
    urgencia: 'media',
  },
  objecoes_json: {
    codigo: '',
    objecao: 'Nova objecao',
    tipo: '',
    status: 'Nao Resolvida',
  },
  insights_json: {
    titulo: 'Novo insight',
    descricao: '',
    tipo: 'geral',
  },
  riscos_json: {
    risco: 'Novo risco',
    probabilidade: '',
    impacto: '',
    severidade: 'media',
    mitigacao: '',
  },
  proximos_passos_json: {
    acao: 'Nova acao',
    responsavel: '',
    prazo: '',
    canal: '',
  },
  quality_checklist: {
    item: 'Novo item de checklist',
    done: false,
  },
};

type Props = {
  projectId: string;
  clientId: string;
  contactId: string;
};

export function ContactDetailContent({ projectId, clientId, contactId }: Props) {
  const { data, isLoading, error } = useClientContact(contactId);
  const updateContact = useUpdateClientContact(projectId, clientId, contactId);
  const contact = data as any;
  const clientName = asText(contact?.client?.name);

  const [editing, setEditing] = useState(false);
  const [metaEditOpen, setMetaEditOpen] = useState(false);
  const [arrayEditOpen, setArrayEditOpen] = useState(false);
  const [arrayEditField, setArrayEditField] = useState<
    'dores_json' | 'objecoes_json' | 'insights_json' | 'riscos_json' | null
  >(null);
  const [arrayEditTitle, setArrayEditTitle] = useState('');
  const [arrayEditDraft, setArrayEditDraft] = useState('[]');
  const [nextStepsDraft, setNextStepsDraft] = useState('');
  const [checklistDraft, setChecklistDraft] = useState('');
  const [metaDraft, setMetaDraft] = useState({
    title: '',
    status: 'realizado',
    sentimento_geral: 'Neutro',
    canal: 'videochamada',
    probabilidade_fechamento: '',
    summary_md: '',
  });

  const normalizedNextSteps = useMemo(
    () => JSON.stringify(asArray(contact?.proximos_passos_json), null, 2),
    [contact?.proximos_passos_json]
  );
  const normalizedChecklist = useMemo(
    () => JSON.stringify(asArray(contact?.quality_checklist), null, 2),
    [contact?.quality_checklist]
  );

  const openArrayEditor = (
    field: 'dores_json' | 'objecoes_json' | 'insights_json' | 'riscos_json',
    title: string
  ) => {
    setArrayEditField(field);
    setArrayEditTitle(title);
    setArrayEditDraft(JSON.stringify(asArray(contact?.[field]), null, 2));
    setArrayEditOpen(true);
  };

  const updateArrayField = async (
    field:
      | 'dores_json'
      | 'objecoes_json'
      | 'insights_json'
      | 'riscos_json'
      | 'proximos_passos_json'
      | 'quality_checklist',
    title: string,
    nextValue: unknown[]
  ) => {
    try {
      await updateContact.mutateAsync({ [field]: nextValue });
      toast.success(`${title} atualizado com sucesso.`);
    } catch {
      toast.error(`Falha ao atualizar ${title.toLowerCase()}.`);
    }
  };

  const addArrayItem = async (
    field:
      | 'dores_json'
      | 'objecoes_json'
      | 'insights_json'
      | 'riscos_json'
      | 'proximos_passos_json'
      | 'quality_checklist',
    title: string
  ) => {
    const current = asArray(contact?.[field]);
    const nextValue = [...current, ARRAY_ITEM_TEMPLATES[field]];
    await updateArrayField(field, title, nextValue);
  };

  const removeArrayItem = async (
    field:
      | 'dores_json'
      | 'objecoes_json'
      | 'insights_json'
      | 'riscos_json'
      | 'proximos_passos_json'
      | 'quality_checklist',
    title: string,
    index: number
  ) => {
    const current = asArray(contact?.[field]);
    const nextValue = current.filter((_, i) => i !== index);
    await updateArrayField(field, title, nextValue);
  };

  const saveArrayEdit = async () => {
    if (!arrayEditField) return;
    try {
      const parsed = JSON.parse(arrayEditDraft);
      if (!Array.isArray(parsed)) {
        toast.error('O campo precisa ser um array JSON.');
        return;
      }
      await updateContact.mutateAsync({ [arrayEditField]: parsed });
      toast.success(`${arrayEditTitle} atualizado com sucesso.`);
      setArrayEditOpen(false);
      setArrayEditField(null);
    } catch {
      toast.error('Falha ao salvar. Verifique o JSON informado.');
    }
  };

  if (isLoading) return <Skeleton className="h-40 rounded-lg" />;
  if (error || !contact) return <p className="text-sm text-destructive">Erro ao carregar ATA.</p>;

  const dashboard = asObject(contact.dashboard_exec) ?? {};
  const bant = asObject(contact.bant_scores) ?? {};
  const fit = asObject(contact.fit_scores) ?? {};

  const startEdit = () => {
    setNextStepsDraft(normalizedNextSteps);
    setChecklistDraft(normalizedChecklist);
    setEditing(true);
  };

  const saveEdit = async () => {
    try {
      const parsedNextSteps = JSON.parse(nextStepsDraft);
      const parsedChecklist = JSON.parse(checklistDraft);
      if (!Array.isArray(parsedNextSteps) || !Array.isArray(parsedChecklist)) {
        toast.error('Proximos passos e checklist devem ser arrays JSON.');
        return;
      }
      await updateContact.mutateAsync({
        proximos_passos_json: parsedNextSteps,
        quality_checklist: parsedChecklist,
      });
      toast.success('ATA atualizada com sucesso.');
      setEditing(false);
    } catch {
      toast.error('Falha ao salvar. Verifique o JSON informado.');
    }
  };

  const startMetaEdit = () => {
    setMetaDraft({
      title: asText(contact.title) === '-' ? '' : asText(contact.title),
      status: asText(contact.status) === '-' ? 'realizado' : asText(contact.status),
      sentimento_geral: asText(contact.sentimento_geral) === '-' ? 'Neutro' : asText(contact.sentimento_geral),
      canal: asText(contact.canal) === '-' ? 'videochamada' : asText(contact.canal),
      probabilidade_fechamento:
        contact.probabilidade_fechamento == null ? '' : String(contact.probabilidade_fechamento),
      summary_md: asText(contact.summary_md) === '-' ? '' : asText(contact.summary_md),
    });
    setMetaEditOpen(true);
  };

  const saveMetaEdit = async () => {
    try {
      const probabilityValue =
        metaDraft.probabilidade_fechamento === '' ? null : Number(metaDraft.probabilidade_fechamento);
      if (probabilityValue != null && (Number.isNaN(probabilityValue) || probabilityValue < 0 || probabilityValue > 100)) {
        toast.error('Probabilidade deve ser um numero entre 0 e 100.');
        return;
      }

      await updateContact.mutateAsync({
        title: metaDraft.title.trim() || null,
        status: metaDraft.status as 'rascunho' | 'realizado' | 'agendado' | 'cancelado',
        sentimento_geral: metaDraft.sentimento_geral as 'Positivo' | 'Neutro' | 'Negativo',
        canal: metaDraft.canal as 'presencial' | 'videochamada' | 'telefone' | 'whatsapp' | 'email',
        probabilidade_fechamento: probabilityValue,
        summary_md: metaDraft.summary_md.trim() || null,
      });
      toast.success('Contato atualizado com sucesso.');
      setMetaEditOpen(false);
    } catch {
      toast.error('Falha ao salvar contato.');
    }
  };

  return (
    <div className="space-y-4 pb-6">
      <div className="sticky top-0 z-10 rounded-lg border bg-white/95 p-3 backdrop-blur">
        <div className="flex flex-col items-start justify-between gap-3 lg:flex-row">
          <div>
            <Link href={`/projects/${projectId}/clients/${clientId}`} className="text-sm text-uzzai-primary underline">
              {'<-'} Voltar para cliente
            </Link>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">{clientName}</h1>
            <p className="text-sm text-slate-500">
              {asText(contact.contact_subtype)} | {asText(contact.data_contato)} | {asText(contact.canal)}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Button size="sm" variant="outline" onClick={startMetaEdit}>Editar contato</Button>
              <Button asChild size="sm" variant="outline">
                <Link href={`/projects/${projectId}/clients/${clientId}`}>Voltar ao perfil</Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link href={`/projects/${projectId}/crm-dashboard`}>Abrir dashboard CRM</Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link href={`/projects/${projectId}/imports`}>Importar nova ATA</Link>
              </Button>
            </div>
          </div>
          <div className="flex w-full flex-row items-center gap-2 lg:w-auto lg:flex-col lg:items-end">
            <Badge variant="outline">{asText(contact.status)}</Badge>
            <Badge variant="outline" className={sentimentClass(asText(contact.sentimento_geral))}>
              {sentimentLabel(asText(contact.sentimento_geral))}
            </Badge>
          </div>
        </div>
      </div>

      <Dialog open={metaEditOpen} onOpenChange={setMetaEditOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar contato</DialogTitle>
          </DialogHeader>
          <div className="grid gap-2">
            <Input
              placeholder="Título"
              value={metaDraft.title}
              onChange={(e) => setMetaDraft((p) => ({ ...p, title: e.target.value }))}
            />
            <div className="grid grid-cols-3 gap-2">
              <select
                className="h-10 rounded-md border px-3 text-sm"
                value={metaDraft.status}
                onChange={(e) => setMetaDraft((p) => ({ ...p, status: e.target.value }))}
              >
                <option value="rascunho">rascunho</option>
                <option value="realizado">realizado</option>
                <option value="agendado">agendado</option>
                <option value="cancelado">cancelado</option>
              </select>
              <select
                className="h-10 rounded-md border px-3 text-sm"
                value={metaDraft.sentimento_geral}
                onChange={(e) => setMetaDraft((p) => ({ ...p, sentimento_geral: e.target.value }))}
              >
                <option value="Positivo">Positivo</option>
                <option value="Neutro">Neutro</option>
                <option value="Negativo">Negativo</option>
              </select>
              <select
                className="h-10 rounded-md border px-3 text-sm"
                value={metaDraft.canal}
                onChange={(e) => setMetaDraft((p) => ({ ...p, canal: e.target.value }))}
              >
                <option value="presencial">presencial</option>
                <option value="videochamada">videochamada</option>
                <option value="telefone">telefone</option>
                <option value="whatsapp">whatsapp</option>
                <option value="email">email</option>
              </select>
            </div>
            <Input
              placeholder="Probabilidade de fechamento (0-100)"
              value={metaDraft.probabilidade_fechamento}
              onChange={(e) => setMetaDraft((p) => ({ ...p, probabilidade_fechamento: e.target.value }))}
            />
            <Textarea
              rows={8}
              placeholder="Resumo MD (summary_md)"
              value={metaDraft.summary_md}
              onChange={(e) => setMetaDraft((p) => ({ ...p, summary_md: e.target.value }))}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setMetaEditOpen(false)}>Cancelar</Button>
              <Button onClick={saveMetaEdit} disabled={updateContact.isPending}>
                {updateContact.isPending ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={arrayEditOpen}
        onOpenChange={(open) => {
          setArrayEditOpen(open);
          if (!open) setArrayEditField(null);
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar {arrayEditTitle}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <p className="text-xs text-slate-500">Informe um array JSON valido.</p>
            <Textarea
              rows={14}
              value={arrayEditDraft}
              onChange={(e) => setArrayEditDraft(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setArrayEditOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={saveArrayEdit} disabled={updateContact.isPending}>
                {updateContact.isPending ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card title="Desfecho">
          <p className="font-semibold">{dealOutcomeLabel(asText(contact.deal_outcome ?? dashboard.deal_outcome))}</p>
          <p className="mt-2 text-sm">{asText(dashboard.deal_outcome_reason)}</p>
          <p className="mt-2 text-xs text-slate-500">Funil: {funnelLabel(asText(contact.estagio_funil))}</p>
        </Card>
        <Card title="Probabilidade / Valor">
          <p>{contact.probabilidade_fechamento == null ? '-' : `${contact.probabilidade_fechamento}%`}</p>
          <p className="mt-1">{money(contact.valor_potencial)}</p>
        </Card>
        <Card title="Responsaveis">
          <p>Vendas: {asText(contact.owner_sales?.name ?? contact.responsavel_vendas_nome)}</p>
          <p>Followup: {asText(contact.owner_followup?.name ?? contact.responsavel_followup_nome)}</p>
          <p>Tecnico: {asText(contact.owner_tech?.name ?? contact.responsavel_tecnico_nome)}</p>
        </Card>
        <Card title="Resumo executivo">
          <p>Negociacao: {negotiationLabel(asText(contact.status_negociacao))}</p>
          <p className="mt-1">Prioridade: {priorityLabel(asText(contact.prioridade))}</p>
          <p className="mt-1">Probabilidade: {contact.probabilidade_fechamento == null ? '-' : `${contact.probabilidade_fechamento}%`}</p>
        </Card>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Card title="BANT">
          <p>Budget: {asText(bant.budget)} | Authority: {asText(bant.authority)}</p>
          <p>Need: {asText(bant.need)} | Timeline: {asText(bant.timeline)}</p>
          <p className="font-medium">Total: {asText(bant.total)}</p>
          <ScoreRadarChart
            values={bant}
            keys={['budget', 'authority', 'need', 'timeline']}
            labels={{
              budget: 'Budget',
              authority: 'Authority',
              need: 'Need',
              timeline: 'Timeline',
            }}
            color="#2563eb"
          />
        </Card>
        <Card title="FIT">
          <p>Produto: {asText(fit.produto)} | Mercado: {asText(fit.mercado)}</p>
          <p>Financeiro: {asText(fit.financeiro)} | Cultural: {asText(fit.cultural)}</p>
          <p>Tecnico: {asText(fit.tecnico)} | Total: {asText(fit.total)}</p>
          <ScoreRadarChart
            values={fit}
            keys={['produto', 'mercado', 'financeiro', 'cultural', 'tecnico']}
            labels={{
              produto: 'Produto',
              mercado: 'Mercado',
              financeiro: 'Financeiro',
              cultural: 'Cultural',
              tecnico: 'Tecnico',
            }}
            color="#7c3aed"
          />
        </Card>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Card
          title="Objecoes"
          action={
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={updateContact.isPending}
                onClick={() => addArrayItem('objecoes_json', 'Objecoes')}
              >
                + Item
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => openArrayEditor('objecoes_json', 'Objecoes')}
              >
                Editar JSON
              </Button>
            </div>
          }
        >
          {asArray(contact.objecoes_json).length === 0 ? (
            <p className="text-sm">-</p>
          ) : (
            <div className="space-y-2">
              {asArray(contact.objecoes_json).map((x, i) => {
                const obj = asObject(x);
                return (
                  <div key={i} className="rounded border bg-gray-50 p-2 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium">{asText(obj?.codigo ?? `Objecao ${i + 1}`)}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={objectionStatusClass(asText(obj?.status))}>
                          {asText(obj?.status)}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 px-2"
                          disabled={updateContact.isPending}
                          onClick={() => removeArrayItem('objecoes_json', 'Objecoes', i)}
                        >
                          -
                        </Button>
                      </div>
                    </div>
                    <p className="mt-1">{asText(obj?.objecao ?? x)}</p>
                    <p className="mt-1 text-xs text-slate-600">Tipo: {asText(obj?.tipo)}</p>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
        <Card
          title="Proximos passos e checklist"
          action={
            editing ? (
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setEditing(false)}>Cancelar</Button>
                <Button size="sm" onClick={saveEdit} disabled={updateContact.isPending}>
                  {updateContact.isPending ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            ) : (
              <Button size="sm" variant="outline" onClick={startEdit}>Editar JSON</Button>
            )
          }
        >
          {!editing ? (
            <div className="space-y-4">
              <div>
                <div className="mb-1 flex items-center justify-between gap-2">
                  <p className="text-xs text-slate-500">Proximos passos</p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 px-2"
                    disabled={updateContact.isPending}
                    onClick={() => addArrayItem('proximos_passos_json', 'Proximos passos')}
                  >
                    + Item
                  </Button>
                </div>
                <ul className="mt-1 list-disc pl-5 text-sm">
                  {asArray(contact.proximos_passos_json).map((x, i) => (
                    <li key={i} className="flex items-start justify-between gap-2">
                      <span>{renderListItem(x, ['acao', 'responsavel', 'prazo', 'canal'])}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 px-2"
                        disabled={updateContact.isPending}
                        onClick={() => removeArrayItem('proximos_passos_json', 'Proximos passos', i)}
                      >
                        -
                      </Button>
                    </li>
                  ))}
                  {asArray(contact.proximos_passos_json).length === 0 && <li>-</li>}
                </ul>
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between gap-2">
                  <p className="text-xs text-slate-500">Checklist</p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 px-2"
                    disabled={updateContact.isPending}
                    onClick={() => addArrayItem('quality_checklist', 'Checklist')}
                  >
                    + Item
                  </Button>
                </div>
                <ul className="mt-1 list-disc pl-5 text-sm">
                  {asArray(contact.quality_checklist).map((x, i) => (
                    <li key={i} className="flex items-start justify-between gap-2">
                      <span>{renderListItem(x, ['item', 'done'])}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 px-2"
                        disabled={updateContact.isPending}
                        onClick={() => removeArrayItem('quality_checklist', 'Checklist', i)}
                      >
                        -
                      </Button>
                    </li>
                  ))}
                  {asArray(contact.quality_checklist).length === 0 && <li>-</li>}
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <p className="mb-1 text-xs text-slate-500">proximos_passos_json</p>
                <Textarea rows={8} value={nextStepsDraft} onChange={(e) => setNextStepsDraft(e.target.value)} />
              </div>
              <div>
                <p className="mb-1 text-xs text-slate-500">quality_checklist</p>
                <Textarea rows={8} value={checklistDraft} onChange={(e) => setChecklistDraft(e.target.value)} />
              </div>
            </div>
          )}
        </Card>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Card
          title="Dores"
          action={
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={updateContact.isPending}
                onClick={() => addArrayItem('dores_json', 'Dores')}
              >
                + Item
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => openArrayEditor('dores_json', 'Dores')}
              >
                Editar JSON
              </Button>
            </div>
          }
        >
          {asArray(contact.dores_json).length === 0 ? (
            <p className="text-sm">-</p>
          ) : (
            <div className="space-y-2">
              {asArray(contact.dores_json).map((x, i) => {
                const obj = asObject(x);
                return (
                  <div key={i} className="rounded border bg-gray-50 p-2 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium">{asText(obj?.dor ?? `Dor ${i + 1}`)}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={urgencyClass(asText(obj?.urgencia))}>
                          {asText(obj?.urgencia)}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 px-2"
                          disabled={updateContact.isPending}
                          onClick={() => removeArrayItem('dores_json', 'Dores', i)}
                        >
                          -
                        </Button>
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-slate-600">{asText(obj?.descricao ?? x)}</p>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card
          title="Insights"
          action={
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={updateContact.isPending}
                onClick={() => addArrayItem('insights_json', 'Insights')}
              >
                + Item
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => openArrayEditor('insights_json', 'Insights')}
              >
                Editar JSON
              </Button>
            </div>
          }
        >
          {asArray(contact.insights_json).length === 0 ? (
            <p className="text-sm">-</p>
          ) : (
            <div className="space-y-2">
              {asArray(contact.insights_json).map((x, i) => {
                const obj = asObject(x);
                return (
                  <div key={i} className="rounded border bg-gray-50 p-2 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium">{asText(obj?.titulo ?? `Insight ${i + 1}`)}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={insightTypeClass(asText(obj?.tipo))}>
                          {asText(obj?.tipo)}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 px-2"
                          disabled={updateContact.isPending}
                          onClick={() => removeArrayItem('insights_json', 'Insights', i)}
                        >
                          -
                        </Button>
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-slate-600">{asText(obj?.descricao ?? x)}</p>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      <Card
        title="Riscos"
        action={
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={updateContact.isPending}
              onClick={() => addArrayItem('riscos_json', 'Riscos')}
            >
              + Item
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => openArrayEditor('riscos_json', 'Riscos')}
            >
              Editar JSON
            </Button>
          </div>
        }
      >
        {asArray(contact.riscos_json).length === 0 ? (
          <p className="text-sm">-</p>
        ) : (
          <div className="grid gap-2 md:grid-cols-2">
            {asArray(contact.riscos_json).map((x, i) => {
              const obj = asObject(x);
              return (
                <div key={i} className="rounded border bg-gray-50 p-2 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium">{asText(obj?.risco ?? `Risco ${i + 1}`)}</p>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={riskClass(asText(obj?.severidade ?? obj?.impacto))}
                      >
                        {asText(obj?.severidade ?? obj?.impacto)}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 px-2"
                        disabled={updateContact.isPending}
                        onClick={() => removeArrayItem('riscos_json', 'Riscos', i)}
                      >
                        -
                      </Button>
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-slate-600">
                    Probabilidade: {asText(obj?.probabilidade)} | Impacto: {asText(obj?.impacto)}
                  </p>
                  <p className="mt-1 text-xs text-slate-600">Mitigacao: {asText(obj?.mitigacao ?? x)}</p>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Card title="ATA completa (summary_md)">
        {asText(contact.summary_md) === '-' ? (
          <p className="text-sm">-</p>
        ) : (
          <MarkdownRenderer content={String(contact.summary_md)} />
        )}
      </Card>
    </div>
  );
}

function Card({
  title,
  children,
  action,
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-lg border bg-white p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-slate-500">{title}</p>
        {action}
      </div>
      <div className="mt-2 text-sm text-slate-800">{children}</div>
    </div>
  );
}
