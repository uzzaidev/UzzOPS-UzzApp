'use client';

import Link from 'next/link';
import { useMemo, useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
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
  const [nextStepsDraft, setNextStepsDraft] = useState('');
  const [checklistDraft, setChecklistDraft] = useState('');

  const normalizedNextSteps = useMemo(
    () => JSON.stringify(asArray(contact?.proximos_passos_json), null, 2),
    [contact?.proximos_passos_json]
  );
  const normalizedChecklist = useMemo(
    () => JSON.stringify(asArray(contact?.quality_checklist), null, 2),
    [contact?.quality_checklist]
  );

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
        <Card title="Objecoes">
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
                      <Badge variant="outline" className={objectionStatusClass(asText(obj?.status))}>
                        {asText(obj?.status)}
                      </Badge>
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
              <Button size="sm" variant="outline" onClick={startEdit}>Editar</Button>
            )
          }
        >
          {!editing ? (
            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-500">Proximos passos</p>
                <ul className="mt-1 list-disc pl-5 text-sm">
                  {asArray(contact.proximos_passos_json).map((x, i) => (
                    <li key={i}>{renderListItem(x, ['acao', 'responsavel', 'prazo', 'canal'])}</li>
                  ))}
                  {asArray(contact.proximos_passos_json).length === 0 && <li>-</li>}
                </ul>
              </div>
              <div>
                <p className="text-xs text-slate-500">Checklist</p>
                <ul className="mt-1 list-disc pl-5 text-sm">
                  {asArray(contact.quality_checklist).map((x, i) => (
                    <li key={i}>{renderListItem(x, ['item', 'done'])}</li>
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
        <Card title="Dores">
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
                      <Badge variant="outline" className={urgencyClass(asText(obj?.urgencia))}>
                        {asText(obj?.urgencia)}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-slate-600">{asText(obj?.descricao ?? x)}</p>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card title="Insights">
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
                      <Badge variant="outline" className={insightTypeClass(asText(obj?.tipo))}>
                        {asText(obj?.tipo)}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-slate-600">{asText(obj?.descricao ?? x)}</p>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      <Card title="Riscos">
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
                    <Badge
                      variant="outline"
                      className={riskClass(asText(obj?.severidade ?? obj?.impacto))}
                    >
                      {asText(obj?.severidade ?? obj?.impacto)}
                    </Badge>
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
