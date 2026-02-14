'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MarkdownRenderer } from '@/components/shared/markdown-renderer';
import { ContactTimeline } from '@/components/clients/contact-timeline';
import { ScoreRadarChart } from '@/components/clients/score-radar-chart';
import { BANTFITEvolution } from '@/components/clients/bant-fit-evolution';
import { IcpBadge } from '@/components/clients/icp-badge';
import { ProbabilityGauge } from '@/components/clients/probability-gauge';
import { LeadVolumeMeter } from '@/components/clients/lead-volume-meter';
import { StakeholderCard } from '@/components/clients/stakeholder-card';
import { useClient, useClientContacts } from '@/hooks/useClients';
import { dealOutcomeLabel, funnelLabel, negotiationLabel, priorityLabel, sentimentLabel, statusLabel } from '@/lib/crm/labels';

function money(v: unknown) {
  if (typeof v !== 'number') return '-';
  return `R$ ${v.toFixed(2)}`;
}

function asText(v: unknown) {
  if (v == null) return '-';
  const s = String(v).trim();
  return s || '-';
}

function asObject(v: unknown): Record<string, unknown> | null {
  if (v && typeof v === 'object' && !Array.isArray(v)) return v as Record<string, unknown>;
  return null;
}

function asArray(v: unknown): unknown[] {
  return Array.isArray(v) ? v : [];
}

function formatDate(v: unknown) {
  const s = asText(v);
  if (s === '-') return s;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const [y, m, d] = s.split('-');
  return `${d}/${m}/${y}`;
}

function isOverdueDate(v: unknown) {
  const s = asText(v);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  return s < new Date().toISOString().slice(0, 10);
}

function preview(v: unknown, max = 180) {
  const s = asText(v);
  if (s === '-') return s;
  return s.length > max ? `${s.slice(0, max)}...` : s;
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
  return parts.length ? parts.join(' | ') : '-';
}

function sentimentClass(value: string) {
  const key = value.trim().toLowerCase();
  if (key === 'positivo') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (key === 'negativo') return 'bg-red-50 text-red-700 border-red-200';
  return 'bg-amber-50 text-amber-700 border-amber-200';
}

function statusClass(value: string) {
  if (value === 'active') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (value === 'paused') return 'bg-amber-50 text-amber-700 border-amber-200';
  if (value === 'churned') return 'bg-slate-100 text-slate-700 border-slate-200';
  return 'bg-blue-50 text-blue-700 border-blue-200';
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

type Props = {
  projectId: string;
  clientId: string;
};

export function ClientDetailsContent({ projectId, clientId }: Props) {
  const { data: client, isLoading, error } = useClient(clientId);
  const { data: contacts, isLoading: contactsLoading } = useClientContacts(projectId, clientId);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);

  const sortedContacts = useMemo(() => {
    return [...(contacts ?? [])].sort((a: any, b: any) => {
      const seqDiff = Number(b.interaction_sequence ?? 0) - Number(a.interaction_sequence ?? 0);
      if (seqDiff !== 0) return seqDiff;
      return String(b.data_contato ?? '').localeCompare(String(a.data_contato ?? ''));
    });
  }, [contacts]);

  useEffect(() => {
    if (!selectedContactId && sortedContacts.length > 0) {
      setSelectedContactId(String((sortedContacts[0] as any).id));
    }
  }, [selectedContactId, sortedContacts]);

  const selectedContact = useMemo(() => {
    if (!selectedContactId) return sortedContacts[0] ?? null;
    return (sortedContacts.find((c: any) => String(c.id) === selectedContactId) ?? sortedContacts[0] ?? null) as any;
  }, [selectedContactId, sortedContacts]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-24 rounded-lg" />
        <Skeleton className="h-40 rounded-lg" />
      </div>
    );
  }

  if (error || !client) {
    return <p className="text-sm text-destructive">Erro ao carregar cliente.</p>;
  }

  const dashboardExec = asObject(selectedContact?.dashboard_exec) ?? {};
  const bantScores = asObject(selectedContact?.bant_scores) ?? {};
  const fitScores = asObject(selectedContact?.fit_scores) ?? {};

  return (
    <div className="space-y-6 pb-6">
      <div className="sticky top-0 z-10 rounded-lg border bg-white/95 p-4 backdrop-blur">
        <div className="flex flex-col items-start justify-between gap-4 lg:flex-row">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">{client.name}</h1>
              <IcpBadge icp={client.icp_classification} />
              <Badge variant="outline" className={statusClass(asText(client.status))}>
                {statusLabel(asText(client.status))}
              </Badge>
              <Badge variant="outline" className={sentimentClass(asText(client.general_sentiment))}>
                {sentimentLabel(asText(client.general_sentiment))}
              </Badge>
            </div>
            <p className="text-sm text-gray-500">
              {asText(client.company)} | {asText(client.main_contact_name)} ({asText(client.main_contact_role)})
            </p>
            <p className="text-xs text-gray-500">
              Ultimo contato: {formatDate(client.last_contact_date)} | Produto: {asText(client.product_focus)}
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Button asChild size="sm" variant="outline">
                <Link href={`/projects/${projectId}/crm-dashboard`}>Abrir dashboard CRM</Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link href={`/projects/${projectId}/imports`}>Registrar novo contato (MD)</Link>
              </Button>
              {selectedContact ? (
                <Button asChild size="sm">
                  <Link href={`/projects/${projectId}/clients/${clientId}/contacts/${selectedContact.id}`}>
                    Abrir ATA selecionada
                  </Link>
                </Button>
              ) : null}
            </div>
          </div>
          <div className="flex w-full items-center justify-between gap-3 lg:w-auto lg:justify-end">
            <ProbabilityGauge value={client.closing_probability} />
            <Link href={`/projects/${projectId}/clients`} className="text-sm text-uzzai-primary underline">
              Voltar para clientes
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg border bg-white p-4 md:col-span-1">
          <p className="text-xs text-gray-500">Status</p>
          <Badge variant="outline" className={`mt-2 ${statusClass(asText(client.status))}`}>{statusLabel(asText(client.status))}</Badge>
          <p className="mt-4 text-xs text-gray-500">Plano</p>
          <p className="text-sm font-medium">{asText(client.plan)}</p>
          <p className="mt-4 text-xs text-gray-500">Funil</p>
          <p className="text-sm font-medium">{funnelLabel(asText(client.funnel_stage))}</p>
          <p className="mt-4 text-xs text-gray-500">Negociacao</p>
          <p className="text-sm font-medium">{negotiationLabel(asText(client.negotiation_status))}</p>
        </div>

        <div className="rounded-lg border bg-white p-4 md:col-span-1">
          <p className="text-xs text-gray-500">Probabilidade</p>
          <p className="text-sm font-medium">
            {client.closing_probability == null ? '-' : `${client.closing_probability}%`}
          </p>
          <p className="mt-4 text-xs text-gray-500">Valor potencial</p>
          <p className="text-sm font-medium">{money(client.potential_value)}</p>
          <p className="mt-4 text-xs text-gray-500">Mensalidade</p>
          <p className="text-sm font-medium">{money(client.monthly_fee_value)}</p>
          <p className="mt-4 text-xs text-gray-500">Setup</p>
          <p className="text-sm font-medium">{money(client.setup_fee_value)}</p>
        </div>

        <div className="rounded-lg border bg-white p-4 md:col-span-1">
          <p className="text-xs text-gray-500">Contato principal</p>
          <p className="text-sm font-medium">{asText(client.main_contact_name)}</p>
          <p className="text-xs text-gray-500 mt-4">Cargo</p>
          <p className="text-sm font-medium">{asText(client.main_contact_role)}</p>
          <p className="text-xs text-gray-500 mt-4">Email</p>
          <p className="text-sm font-medium">{asText(client.email)}</p>
          <p className="text-xs text-gray-500 mt-4">Telefone</p>
          <p className="text-sm font-medium">{asText(client.phone)}</p>
        </div>

        <div className="rounded-lg border bg-slate-50 p-4 md:col-span-1">
          <p className="text-xs text-gray-500">CRM estrategico</p>
          <p className="mt-2 text-xs text-gray-500">ICP / Origem</p>
          <p className="text-sm font-medium">{asText(client.icp_classification)} / {asText(client.lead_source)}</p>
          <div className="mt-3">
            <LeadVolumeMeter value={client.lead_daily_volume} />
          </div>
          <p className="mt-2 text-xs text-gray-500">Ultimo contato</p>
          <p className="text-sm font-medium">{formatDate(client.last_contact_date)}</p>
          <p className="mt-2 text-xs text-gray-500">Contexto</p>
          <p className="text-sm">{preview(client.business_context, 140)}</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="rounded-lg border bg-white p-4 lg:col-span-3">
          <h2 className="text-lg font-semibold">Historico de contatos</h2>
          {contactsLoading ? (
            <Skeleton className="h-24 mt-3 rounded-lg" />
          ) : (
            <ContactTimeline
              contacts={sortedContacts as Array<Record<string, unknown>>}
              selectedId={selectedContact ? String(selectedContact.id) : null}
              onSelect={setSelectedContactId}
            />
          )}
        </div>

        <div className="rounded-lg border bg-white p-4 lg:col-span-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Detalhe do contato</h2>
            {selectedContact ? (
              <Link
                href={`/projects/${projectId}/clients/${clientId}/contacts/${selectedContact.id}`}
                className="text-xs text-uzzai-primary underline"
              >
                Ver ATA completa
              </Link>
            ) : null}
          </div>

          {!selectedContact ? (
            <p className="text-sm text-gray-500 mt-3">Selecione um contato no historico.</p>
          ) : (
            <Tabs defaultValue="historico" className="mt-3">
              <TabsList className="w-full justify-start overflow-x-auto whitespace-nowrap">
                <TabsTrigger value="historico">Historico</TabsTrigger>
                <TabsTrigger value="analise">Analise</TabsTrigger>
                <TabsTrigger value="inteligencia">Inteligencia</TabsTrigger>
                <TabsTrigger value="empresa">Empresa</TabsTrigger>
              </TabsList>

              <TabsContent value="historico" className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-md border bg-amber-50 p-3">
                    <p className="text-xs text-gray-500">Leitura gerencial: desfecho</p>
                    <p className="text-sm font-semibold">
                      {dealOutcomeLabel(asText(selectedContact.deal_outcome ?? dashboardExec.deal_outcome ?? selectedContact.status_negociacao))}
                    </p>
                    <p className="mt-2 text-xs text-gray-500">Motivo</p>
                    <p className="text-sm">{asText(dashboardExec.deal_outcome_reason)}</p>
                    <p className="mt-2 text-xs text-gray-500">Resumo da decisao</p>
                    <p className="text-sm">{asText(dashboardExec.decision_summary)}</p>
                  </div>
                  <div className="rounded-md border bg-blue-50 p-3">
                    <p className="text-xs text-gray-500">Leitura gerencial: estrategia</p>
                    <p className="text-xs text-gray-500 mt-1">Proxima estrategia</p>
                    <p className="text-sm">{asText(dashboardExec.next_strategy)}</p>
                    <p className="mt-2 text-xs text-gray-500">Justificativa da probabilidade</p>
                    <p className="text-sm">{asText(dashboardExec.probability_justification)}</p>
                    <p className="mt-2 text-xs text-gray-500">Concorrente</p>
                    <p className="text-sm">{asText(dashboardExec.competitor)}</p>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <MetaBox label="Tipo/Subtipo" value={`${asText(selectedContact.contact_type)} / ${asText(selectedContact.contact_subtype)}`} />
                  <MetaBox label="Status / Canal" value={`${asText(selectedContact.status)} / ${asText(selectedContact.canal)}`} />
                  <MetaBox label="Probabilidade / Prioridade" value={`${selectedContact.probabilidade_fechamento == null ? '-' : `${selectedContact.probabilidade_fechamento}%`} / ${priorityLabel(asText(selectedContact.prioridade))}`} />
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-md border p-3">
                    <p className="text-xs text-gray-500">Objecoes</p>
                    {asArray(selectedContact.objecoes_json).length === 0 ? (
                      <p className="text-sm">-</p>
                    ) : (
                      <ul className="mt-2 list-disc pl-5 text-sm space-y-2">
                        {asArray(selectedContact.objecoes_json).slice(0, 8).map((x, i) => (
                          <li key={i}>{renderListItem(x, ['codigo', 'objecao', 'tipo', 'status'])}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="rounded-md border p-3">
                    <p className="text-xs text-gray-500">Proximos passos</p>
                    {asArray(selectedContact.proximos_passos_json).length === 0 ? (
                      <p className="text-sm">-</p>
                    ) : (
                      <ul className="mt-2 list-disc pl-5 text-sm space-y-2">
                        {asArray(selectedContact.proximos_passos_json).slice(0, 8).map((x, i) => (
                          <li key={i}>{renderListItem(x, ['acao', 'responsavel', 'prazo', 'canal'])}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                <div className="rounded-md border bg-gray-50 p-3">
                  <p className="text-xs text-gray-500">Ata completa (summary_md)</p>
                  {asText(selectedContact.summary_md) === '-' ? (
                    <p className="mt-2 text-sm">-</p>
                  ) : (
                    <div className="mt-2 rounded-md border bg-white p-3">
                      <MarkdownRenderer content={String(selectedContact.summary_md)} />
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="analise" className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-md border p-3">
                    <p className="text-xs text-gray-500">BANT</p>
                    <p className="text-sm">Budget: {asText(bantScores.budget)} | Authority: {asText(bantScores.authority)}</p>
                    <p className="text-sm">Need: {asText(bantScores.need)} | Timeline: {asText(bantScores.timeline)}</p>
                    <p className="text-sm font-medium mt-1">Total: {asText(bantScores.total)}</p>
                    <ScoreRadarChart
                      values={bantScores}
                      keys={['budget', 'authority', 'need', 'timeline']}
                      labels={{
                        budget: 'Budget',
                        authority: 'Authority',
                        need: 'Need',
                        timeline: 'Timeline',
                      }}
                      color="#2563eb"
                    />
                  </div>
                  <div className="rounded-md border p-3">
                    <p className="text-xs text-gray-500">Fit</p>
                    <p className="text-sm">Produto: {asText(fitScores.produto)} | Mercado: {asText(fitScores.mercado)}</p>
                    <p className="text-sm">Financeiro: {asText(fitScores.financeiro)} | Cultural: {asText(fitScores.cultural)}</p>
                    <p className="text-sm">Tecnico: {asText(fitScores.tecnico)} | Total: {asText(fitScores.total)}</p>
                    <ScoreRadarChart
                      values={fitScores}
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
                  </div>
                </div>

                <BANTFITEvolution contacts={sortedContacts as Array<Record<string, unknown>>} />

                <div className="rounded-md border p-3">
                  <p className="text-xs text-gray-500">Insights</p>
                  {asArray(selectedContact.insights_json).length === 0 ? (
                    <p className="text-sm">-</p>
                  ) : (
                    <div className="mt-2 grid gap-2 md:grid-cols-2">
                      {asArray(selectedContact.insights_json).slice(0, 6).map((x, i) => {
                        const obj = asObject(x);
                        return (
                          <div key={i} className="rounded border bg-gray-50 p-2 text-sm">
                            <p className="font-medium">{asText(obj?.titulo ?? `Insight ${i + 1}`)}</p>
                            <p className="text-xs text-gray-500 mt-1">Tipo: {asText(obj?.tipo)}</p>
                            <p className="mt-1">{asText(obj?.descricao ?? x)}</p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="inteligencia" className="space-y-4">
                <div className="grid gap-3 lg:grid-cols-3">
                  <div className="rounded-md border p-3">
                    <p className="text-xs text-gray-500">Dores</p>
                    {asArray(selectedContact.dores_json).length === 0 ? (
                      <p className="mt-2 text-sm">-</p>
                    ) : (
                      <div className="mt-2 space-y-2">
                        {asArray(selectedContact.dores_json).slice(0, 8).map((x, i) => {
                          const obj = asObject(x);
                          return (
                            <div key={i} className="rounded border bg-gray-50 p-2 text-sm">
                              <div className="flex items-center justify-between gap-2">
                                <p className="font-medium">{asText(obj?.dor ?? `Dor ${i + 1}`)}</p>
                                <Badge variant="outline" className={urgencyClass(asText(obj?.urgencia))}>
                                  {asText(obj?.urgencia)}
                                </Badge>
                              </div>
                              <p className="mt-1 text-xs text-gray-600">{asText(obj?.descricao ?? x)}</p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="rounded-md border p-3">
                    <p className="text-xs text-gray-500">Objecoes</p>
                    {asArray(selectedContact.objecoes_json).length === 0 ? (
                      <p className="mt-2 text-sm">-</p>
                    ) : (
                      <div className="mt-2 space-y-2">
                        {asArray(selectedContact.objecoes_json).slice(0, 8).map((x, i) => {
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
                              <p className="mt-1 text-xs text-gray-600">Tipo: {asText(obj?.tipo)}</p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="rounded-md border p-3">
                    <p className="text-xs text-gray-500">Insights</p>
                    {asArray(selectedContact.insights_json).length === 0 ? (
                      <p className="mt-2 text-sm">-</p>
                    ) : (
                      <div className="mt-2 space-y-2">
                        {asArray(selectedContact.insights_json).slice(0, 8).map((x, i) => {
                          const obj = asObject(x);
                          return (
                            <div key={i} className="rounded border bg-gray-50 p-2 text-sm">
                              <div className="flex items-center justify-between gap-2">
                                <p className="font-medium">{asText(obj?.titulo ?? `Insight ${i + 1}`)}</p>
                                <Badge variant="outline" className={insightTypeClass(asText(obj?.tipo))}>
                                  {asText(obj?.tipo)}
                                </Badge>
                              </div>
                              <p className="mt-1 text-xs text-gray-600">{asText(obj?.descricao ?? x)}</p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-md border p-3">
                  <p className="text-xs text-gray-500">Riscos</p>
                  {asArray(selectedContact.riscos_json).length === 0 ? (
                    <p className="mt-2 text-sm">-</p>
                  ) : (
                    <div className="mt-2 grid gap-2 md:grid-cols-2">
                      {asArray(selectedContact.riscos_json).slice(0, 8).map((x, i) => {
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
                            <p className="mt-1 text-xs text-gray-600">
                              Probabilidade: {asText(obj?.probabilidade)} | Impacto: {asText(obj?.impacto)}
                            </p>
                            <p className="mt-1 text-xs text-gray-600">Mitigacao: {asText(obj?.mitigacao ?? x)}</p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="empresa" className="space-y-4">
                <div className="rounded-md border p-3">
                  <p className="text-xs text-gray-500">Business context</p>
                  <p className="mt-1 text-sm whitespace-pre-wrap">{asText(client.business_context)}</p>
                </div>

                <div className="rounded-md border p-3">
                  <p className="text-xs text-gray-500">Stakeholders</p>
                  {asArray(client.stakeholders_json).length === 0 ? (
                    <p className="text-sm">-</p>
                  ) : (
                    <div className="mt-2 grid gap-2 md:grid-cols-2">
                      {asArray(client.stakeholders_json).map((x, i) => {
                        const obj = asObject(x);
                        return obj ? <StakeholderCard key={i} stakeholder={obj} /> : null;
                      })}
                    </div>
                  )}
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <MetaBox label="Segmento / Porte" value={`${asText(client.segment)} / ${asText(client.company_size)}`} />
                  <MetaBox label="Cidade / Estado" value={`${asText(client.city)} / ${asText(client.state)}`} />
                  <MetaBox label="Contato principal" value={`${asText(client.main_contact_name)} (${asText(client.main_contact_role)})`} />
                  <MetaBox label="Tags" value={Array.isArray(client.tags) && client.tags.length > 0 ? client.tags.join(', ') : '-'} />
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>

        <div className="space-y-4 lg:col-span-3">
          <div className="sticky top-20 space-y-4">
            <div className="rounded-lg border bg-white p-4">
              <h3 className="text-sm font-semibold text-gray-900">Acoes rapidas</h3>
              <div className="mt-2 grid gap-2">
                <Button asChild size="sm" variant="outline" className="justify-start">
                  <Link href={`/projects/${projectId}/clients`}>Voltar para pipeline/lista</Link>
                </Button>
                <Button asChild size="sm" variant="outline" className="justify-start">
                  <Link href={`/projects/${projectId}/crm-dashboard`}>Ver visao executiva (CRM)</Link>
                </Button>
                <Button asChild size="sm" variant="outline" className="justify-start">
                  <Link href={`/projects/${projectId}/imports`}>Importar nova ATA via MD</Link>
                </Button>
                {selectedContact ? (
                  <Button asChild size="sm" className="justify-start">
                    <Link href={`/projects/${projectId}/clients/${clientId}/contacts/${selectedContact.id}`}>
                      Abrir ATA selecionada
                    </Link>
                  </Button>
                ) : null}
              </div>
            </div>

            <div className="rounded-lg border bg-white p-4">
              <h3 className="text-sm font-semibold text-gray-900">Proximas acoes</h3>
              {asArray(selectedContact?.proximos_passos_json).length === 0 ? (
                <p className="mt-2 text-sm text-gray-500">Nenhuma acao registrada.</p>
              ) : (
                <ul className="mt-2 space-y-2">
                  {asArray(selectedContact?.proximos_passos_json).slice(0, 6).map((x, i) => {
                    const obj = asObject(x);
                    const prazo = asText(obj?.prazo);
                    const overdue = isOverdueDate(prazo);
                    return (
                      <li key={i} className="rounded border bg-gray-50 p-2">
                        <p className="text-sm font-medium">{asText(obj?.acao ?? `Acao ${i + 1}`)}</p>
                        <p className="mt-1 text-xs text-gray-600">
                          {asText(obj?.responsavel)} | {formatDate(prazo)}
                        </p>
                        {overdue ? (
                          <Badge variant="outline" className="mt-1 bg-red-50 text-red-700 border-red-200">
                            Acao vencida
                          </Badge>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="rounded-lg border bg-white p-4">
              <h3 className="text-sm font-semibold text-gray-900">Financeiro</h3>
              <p className="mt-2 text-xs text-gray-500">Pipeline</p>
              <p className="text-sm font-medium">{money(client.potential_value)}</p>
              <p className="mt-2 text-xs text-gray-500">Mensalidade</p>
              <p className="text-sm font-medium">{money(client.monthly_fee_value)}</p>
              <p className="mt-2 text-xs text-gray-500">Setup</p>
              <p className="text-sm font-medium">{money(client.setup_fee_value)}</p>
            </div>

            <div className="rounded-lg border bg-white p-4">
              <h3 className="text-sm font-semibold text-gray-900">Snapshot BANT/FIT</h3>
              <p className="mt-2 text-xs text-gray-500">BANT total</p>
              <p className="text-sm font-medium">{asText(bantScores.total)} / 20</p>
              <p className="mt-2 text-xs text-gray-500">FIT total</p>
              <p className="text-sm font-medium">{asText(fitScores.total)} / 25</p>
              <div className="mt-3 grid gap-2">
                <div>
                  <p className="text-xs text-gray-500">BANT</p>
                  <div className="h-2 rounded bg-gray-100">
                    <div
                      className="h-2 rounded bg-blue-500"
                      style={{
                        width: `${Math.max(
                          0,
                          Math.min(100, ((Number(bantScores.total) || 0) / 20) * 100)
                        )}%`,
                      }}
                    />
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500">FIT</p>
                  <div className="h-2 rounded bg-gray-100">
                    <div
                      className="h-2 rounded bg-violet-500"
                      style={{
                        width: `${Math.max(
                          0,
                          Math.min(100, ((Number(fitScores.total) || 0) / 25) * 100)
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetaBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border p-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-medium mt-1">{value}</p>
    </div>
  );
}
