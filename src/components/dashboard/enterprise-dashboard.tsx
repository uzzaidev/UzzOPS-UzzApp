'use client';

import Link from 'next/link';
import { AlertTriangle, BarChart3, Flame, Megaphone, ShieldCheck, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { KpiCard } from '@/components/dashboard/kpi-card';
import { ActivityFeed } from '@/components/dashboard/activity-feed';
import { useEnterpriseDashboard, useProjectActivityFeed } from '@/hooks/useDashboard';

function money(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function barColor(pct: number) {
  if (pct >= 80) return 'bg-emerald-500';
  if (pct >= 60) return 'bg-amber-500';
  return 'bg-rose-500';
}

function Bar({ pct }: { pct: number }) {
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <div className="h-2 rounded bg-slate-100">
      <div className={`h-2 rounded ${barColor(clamped)}`} style={{ width: `${clamped}%` }} />
    </div>
  );
}

export function EnterpriseDashboard({ projectId }: { projectId: string }) {
  const { data, isLoading, error } = useEnterpriseDashboard(projectId);
  const { data: feed, isLoading: loadingFeed } = useProjectActivityFeed(projectId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-lg" />
      </div>
    );
  }

  if (error || !data) {
    return <p className="text-sm text-destructive">Erro ao carregar dashboard enterprise.</p>;
  }

  const healthTone =
    data.kpis.health_score >= 75
      ? { tone: 'text-emerald-700', accent: 'border-emerald-200' }
      : data.kpis.health_score >= 50
        ? { tone: 'text-amber-700', accent: 'border-amber-200' }
      : { tone: 'text-rose-700', accent: 'border-rose-200' };
  const healthLabel =
    data.kpis.health_score >= 75 ? 'Healthy' : data.kpis.health_score >= 50 ? 'Atenção' : 'Crítico';

  const featureStatus = data.development.feature_status_counts;
  const orderedPipelineKeys = ['idea', 'briefing', 'production', 'review', 'approved', 'done'];
  const funnelKeys = ['lead-novo', 'qualificado', 'proposta', 'negociacao', 'fechado', 'stand-by'];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Command Center</h1>
        <p className="text-sm text-slate-500">
          Visao executiva unificada de desenvolvimento, marketing e CRM.
        </p>
      </div>

      <div className="sticky top-2 z-20 -mx-2 rounded-lg border border-slate-200 bg-white/95 p-2 shadow-sm backdrop-blur">
        <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        <KpiCard
          title="Saude"
          value={`${data.kpis.health_score}/100`}
          subtitle={data.kpis.health_status}
          badge={healthLabel}
          icon={ShieldCheck}
          tone={healthTone.tone}
          accent={healthTone.accent}
        />
        <KpiCard
          title="Sprint"
          value={`${data.kpis.sprint_progress}%`}
          subtitle="progresso atual"
          badge={data.development.current_sprint ? 'ativa' : 'sem sprint'}
          icon={Target}
          tone="text-blue-700"
          accent="border-blue-200"
        />
        <KpiCard
          title="Features"
          value={`${data.kpis.features_done}/${data.kpis.total_features}`}
          subtitle={`${data.kpis.features_in_progress} em progresso`}
          badge={`${data.kpis.blocked_features} blocked`}
          icon={BarChart3}
          tone="text-slate-900"
          accent="border-slate-200"
        />
        <KpiCard
          title="Riscos"
          value={String(data.kpis.critical_risks)}
          subtitle="criticos (GUT >= 100)"
          badge={data.kpis.critical_risks > 0 ? 'urgente' : 'ok'}
          icon={AlertTriangle}
          tone={data.kpis.critical_risks > 0 ? 'text-rose-700' : 'text-emerald-700'}
          accent={data.kpis.critical_risks > 0 ? 'border-rose-200' : 'border-emerald-200'}
        />
        <KpiCard
          title="Marketing"
          value={`${data.kpis.posts_current}/${data.kpis.posts_target}`}
          subtitle="posts no mes"
          badge={`${data.marketing.posts_progress}%`}
          icon={Megaphone}
          tone="text-fuchsia-700"
          accent="border-fuchsia-200"
        />
        <KpiCard
          title="CRM"
          value={`${data.kpis.active_leads}`}
          subtitle={`${data.kpis.hot_leads} hot leads`}
          badge={money(data.kpis.pipeline_value)}
          icon={Flame}
          tone="text-emerald-700"
          accent="border-emerald-200"
        />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        <Card className="xl:col-span-5">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Desenvolvimento</CardTitle>
            <Link href={`/projects/${projectId}/progress`} className="text-xs text-uzzai-primary underline">
              Ver tudo
            </Link>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="rounded border bg-slate-50 p-3">
              <p className="font-medium text-slate-900">
                Sprint: {String((data.development.current_sprint?.name as string) ?? 'Sem sprint ativo')}
              </p>
              <p className="text-xs text-slate-500">
                Pontos: {data.development.sprint_points_done}/{data.development.sprint_points_total}
              </p>
              <div className="mt-2">
                <Bar pct={data.kpis.sprint_progress} />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium uppercase text-slate-500">Feature pipeline</p>
              {Object.entries(featureStatus).map(([key, value]) => {
                const total = Math.max(1, data.kpis.total_features);
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="capitalize text-slate-600">{key.replace('_', ' ')}</span>
                      <span className="font-medium text-slate-800">{value}</span>
                    </div>
                    <Bar pct={(100 * value) / total} />
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <InfoBox label="MVP progress" value={`${data.development.mvp_progress}%`} />
              <InfoBox label="DoD medio" value={`${data.development.dod_average}%`} />
              <InfoBox
                label="Retro"
                value={`${data.development.retros.done} done / ${data.development.retros.pending} pend`}
              />
              <InfoBox label="Spikes" value={`${data.development.spikes.active} ativos`} />
            </div>

            {data.development.impediments_open > 0 ? (
              <div className="rounded border border-amber-200 bg-amber-50 p-2 text-xs text-amber-800">
                {data.development.impediments_open} impedimento(s) aberto(s) nas dailies recentes.
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="xl:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Marketing</CardTitle>
            <Link href={`/projects/${projectId}/marketing`} className="text-xs text-uzzai-primary underline">
              Ver tudo
            </Link>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="rounded border bg-slate-50 p-3">
              <p className="font-medium text-slate-900">
                Posts: {data.marketing.posts_current}/{data.marketing.posts_target}
              </p>
              <p className="text-xs text-slate-500">Meta mensal</p>
              <div className="mt-2">
                <Bar pct={data.marketing.posts_progress} />
              </div>
            </div>

            <div>
              <p className="text-xs font-medium uppercase text-slate-500">Pipeline de conteudo</p>
              <div className="mt-2 space-y-2">
                {orderedPipelineKeys.map((key) => {
                  const value = data.marketing.content_pipeline[key] ?? 0;
                  const total = Math.max(
                    1,
                    Object.values(data.marketing.content_pipeline).reduce((a, b) => a + b, 0)
                  );
                  return (
                    <div key={key}>
                      <div className="flex items-center justify-between text-xs">
                        <span className="capitalize text-slate-600">{key}</span>
                        <span className="font-medium text-slate-800">{value}</span>
                      </div>
                      <Bar pct={(100 * value) / total} />
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-xs font-medium uppercase text-slate-500">Proximas publicacoes</p>
              <div className="mt-2 space-y-2">
                {data.marketing.next_publications.length === 0 ? (
                  <p className="text-xs text-slate-500">Sem publicacoes agendadas.</p>
                ) : (
                  data.marketing.next_publications.map((pub) => (
                    <div key={pub.id} className="rounded border bg-slate-50 p-2">
                      <p className="text-xs font-medium text-slate-900">{pub.title}</p>
                      <p className="text-[11px] text-slate-500">
                        {pub.channel} | {pub.scheduled_date ?? '-'}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <InfoBox label="On-time rate" value={`${data.marketing.publication_on_time_rate}%`} />
          </CardContent>
        </Card>

        <Card className="xl:col-span-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">CRM & Pipeline</CardTitle>
            <Link href={`/projects/${projectId}/clients`} className="text-xs text-uzzai-primary underline">
              Ver tudo
            </Link>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <p className="text-xs font-medium uppercase text-slate-500">Funil</p>
              <div className="mt-2 space-y-2">
                {funnelKeys.map((key) => {
                  const value = data.crm.funnel[key] ?? 0;
                  const total = Math.max(1, Object.values(data.crm.funnel).reduce((a, b) => a + b, 0));
                  return (
                    <div key={key}>
                      <div className="flex items-center justify-between text-xs">
                        <span className="capitalize text-slate-600">{key.replace('-', ' ')}</span>
                        <span className="font-medium text-slate-800">{value}</span>
                      </div>
                      <Bar pct={(100 * value) / total} />
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-xs font-medium uppercase text-slate-500">Hot leads</p>
              <div className="mt-2 space-y-2">
                {data.crm.hot_leads.length === 0 ? (
                  <p className="text-xs text-slate-500">Sem hot leads.</p>
                ) : (
                  data.crm.hot_leads.map((lead) => (
                    <Link
                      key={lead.id}
                      href={`/projects/${projectId}/clients/${lead.id}`}
                      className="block rounded border bg-slate-50 p-2 hover:border-emerald-300"
                    >
                      <p className="text-xs font-medium text-slate-900">{lead.name}</p>
                      <p className="text-[11px] text-slate-500">
                        {lead.stage} | {lead.closing_probability}%
                      </p>
                    </Link>
                  ))
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <InfoBox label="Pipeline potencial" value={money(data.crm.revenue_summary.potential_total)} />
              <InfoBox label="MRR potencial" value={money(data.crm.revenue_summary.mrr_total)} />
            </div>

            {data.crm.overdue_actions > 0 ? (
              <div className="rounded border border-rose-200 bg-rose-50 p-2 text-xs text-rose-700">
                {data.crm.overdue_actions} acao(oes) vencida(s) no CRM.
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Atividade Recente</CardTitle>
          <Link href={`/projects/${projectId}/progress`} className="text-xs text-uzzai-primary underline">
            Ver tudo
          </Link>
        </CardHeader>
        <CardContent>
          {loadingFeed ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-md" />
              ))}
            </div>
          ) : (
            <ActivityFeed items={feed ?? []} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border bg-slate-50 p-2">
      <p className="text-[11px] uppercase tracking-wide text-slate-500">{label}</p>
      <p className="text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}
