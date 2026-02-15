'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Copy,
  FileText,
  Flag,
  Plus,
  ShieldAlert,
  Target,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { KpiCard } from '@/components/dashboard/kpi-card';
import { useSprints, useSprintFeatures } from '@/hooks/useSprints';
import { useFeatures } from '@/hooks/useFeatures';
import { useRisks } from '@/hooks/useRisks';
import { useDailyLogs } from '@/hooks/useDailyLogs';
import { useRetrospectiveActions } from '@/hooks/useRetrospectives';
import {
  useCronogramasChangelog,
  useCronogramasCharters,
  useCronogramaManualMutation,
  useCronogramasDecisionLog,
  useCronogramasForecasts,
  useCronogramasHypotheses,
  useCronogramasOverview,
  useCronogramasPilots,
  useCronogramasRoadmapItems,
  useCronogramasRoadmaps,
} from '@/hooks/useCronogramas';
import { CreateSprintModal } from '@/components/sprints/create-sprint-modal';
import { MdFeederButton } from '@/components/import/md-feeder-button';
import { toast } from 'sonner';

type Props = {
  projectId: string;
};

type TimelineEvent = {
  id: string;
  date: string;
  kind: 'sprint' | 'daily' | 'risk' | 'retro';
  title: string;
  detail: string;
  tone: string;
};

type ReleaseSummary = {
  key: string;
  label: string;
  sprintCount: number;
  activeCount: number;
  completedCount: number;
  avgVelocityTarget: number;
  avgVelocityActual: number;
  progress: number;
  criticalRisks: number;
};

type TimelinePeriod = 'current_quarter' | 'last_90_days' | 'year_to_date' | 'all';

type DateRange = {
  from: string;
  to: string;
};

function pct(done: number, total: number) {
  if (!total) return 0;
  return Math.round((done / total) * 100);
}

function progressTone(value: number) {
  if (value >= 80) return 'bg-emerald-500';
  if (value >= 60) return 'bg-amber-500';
  return 'bg-rose-500';
}

function formatDate(value: string | null | undefined) {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('pt-BR');
}

function asText(value: unknown): string {
  if (value == null) return '-';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return '-';
}

function sprintStatusLabel(status: string) {
  if (status === 'active') return 'Ativo';
  if (status === 'planned') return 'Planejado';
  if (status === 'completed') return 'Concluido';
  if (status === 'cancelled') return 'Cancelado';
  return status;
}

function sprintStatusClass(status: string) {
  if (status === 'active') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (status === 'planned') return 'bg-blue-50 text-blue-700 border-blue-200';
  if (status === 'completed') return 'bg-slate-100 text-slate-700 border-slate-200';
  if (status === 'cancelled') return 'bg-rose-50 text-rose-700 border-rose-200';
  return 'bg-slate-100 text-slate-700 border-slate-200';
}

function quarterKeyFromDate(value: string | null | undefined) {
  if (!value) return 'sem-data';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return 'sem-data';
  const q = Math.floor(d.getMonth() / 3) + 1;
  return `${d.getFullYear()}-Q${q}`;
}

function quarterLabel(key: string) {
  if (key === 'sem-data') return 'Sem data';
  const [year, quarter] = key.split('-');
  return `${quarter} ${year}`;
}

function getCurrentQuarterRange(refDate: Date): DateRange {
  const year = refDate.getFullYear();
  const month = refDate.getMonth();
  const quarterStartMonth = Math.floor(month / 3) * 3;
  const from = new Date(year, quarterStartMonth, 1);
  const to = new Date(year, quarterStartMonth + 3, 0);
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}

function getTimelineDateRange(period: TimelinePeriod, todayIso: string): DateRange | null {
  const refDate = new Date(`${todayIso}T00:00:00`);
  if (Number.isNaN(refDate.getTime())) return null;

  if (period === 'all') return null;
  if (period === 'current_quarter') return getCurrentQuarterRange(refDate);

  if (period === 'year_to_date') {
    const from = new Date(refDate.getFullYear(), 0, 1);
    return {
      from: from.toISOString().slice(0, 10),
      to: todayIso,
    };
  }

  const from = new Date(refDate);
  from.setDate(from.getDate() - 90);
  return {
    from: from.toISOString().slice(0, 10),
    to: todayIso,
  };
}

export function CronogramasPageContent({ projectId }: Props) {
  const [isCreateSprintOpen, setIsCreateSprintOpen] = useState(false);
  const [timelinePeriod, setTimelinePeriod] = useState<TimelinePeriod>('current_quarter');
  const [manualSection, setManualSection] = useState<
    'charters' | 'roadmaps' | 'roadmap-items' | 'hypotheses' | 'decision-log' | 'forecasts' | 'pilots' | 'changelog'
  >('charters');
  const [manualMethod, setManualMethod] = useState<'POST' | 'PATCH'>('POST');
  const [manualId, setManualId] = useState('');
  const [manualPayloadText, setManualPayloadText] = useState(
    JSON.stringify(
      {
        version: 1,
        status: 'active',
        vision_outcome: 'Descreva o outcome principal',
      },
      null,
      2
    )
  );

  const { data: sprintsData, isLoading: loadingSprints } = useSprints(projectId);
  const { data: featuresData, isLoading: loadingFeatures } = useFeatures({ projectId });
  const { data: risksData, isLoading: loadingRisks } = useRisks({ project_id: projectId });
  const { data: retrosData, isLoading: loadingRetros } = useRetrospectiveActions(undefined, projectId);
  const { data: governanceOverview, isLoading: loadingGovernance } = useCronogramasOverview(projectId);
  const { data: governanceCharters, isLoading: loadingGovernanceCharters } = useCronogramasCharters(projectId);
  const { data: governanceRoadmaps, isLoading: loadingGovernanceRoadmaps } = useCronogramasRoadmaps(projectId);
  const { data: governanceRoadmapItems, isLoading: loadingGovernanceRoadmapItems } =
    useCronogramasRoadmapItems(projectId);
  const { data: governanceHypotheses, isLoading: loadingGovernanceHypotheses } =
    useCronogramasHypotheses(projectId);
  const { data: governanceDecisions, isLoading: loadingGovernanceDecisions } = useCronogramasDecisionLog(projectId);
  const { data: governanceForecasts, isLoading: loadingGovernanceForecasts } = useCronogramasForecasts(projectId);
  const { data: governancePilots, isLoading: loadingGovernancePilots } = useCronogramasPilots(projectId);
  const { data: governanceChangelog, isLoading: loadingGovernanceChangelog } =
    useCronogramasChangelog(projectId);
  const manualMutation = useCronogramaManualMutation(projectId);

  const sprints = sprintsData?.data ?? [];
  const features = featuresData?.data ?? [];
  const risks = risksData?.data ?? [];
  const retros = retrosData ?? [];

  const activeSprint = sprints.find((s) => s.status === 'active') ?? null;
  const nextSprint =
    sprints
      .filter((s) => s.status === 'planned')
      .sort((a, b) => String(a.start_date).localeCompare(String(b.start_date)))[0] ?? null;

  const { data: activeSprintFeaturesData, isLoading: loadingActiveSprintFeatures } = useSprintFeatures(
    activeSprint?.id
  );
  const { data: dailyLogs, isLoading: loadingDailies } = useDailyLogs(projectId, activeSprint?.id);
  const { data: allDailyLogs, isLoading: loadingAllDailies } = useDailyLogs(projectId);

  const sprintFeatures = (activeSprintFeaturesData?.data ?? []) as Array<{
    status?: string;
    story_points?: number | null;
  }>;

  const sprintPointsTotal = sprintFeatures.reduce((sum, item) => sum + (item.story_points ?? 0), 0);
  const sprintPointsDone = sprintFeatures
    .filter((item) => item.status === 'done')
    .reduce((sum, item) => sum + (item.story_points ?? 0), 0);
  const sprintProgress = pct(sprintPointsDone, sprintPointsTotal);

  const totalFeatures = features.length;
  const doneFeatures = features.filter((f) => f.status === 'done').length;
  const blockedFeatures = features.filter((f) => f.status === 'blocked').length;
  const moscowMust = features.filter((f) => f.moscow === 'Must').length;
  const spikes = features.filter((f) => f.is_spike).length;
  const criticalRisks = risks.filter((r) => (r.gut_score ?? 0) >= 100).length;
  const retrosPending = retros.filter((r) => r.status === 'pending').length;
  const retrosInProgress = retros.filter((r) => r.status === 'in_progress').length;

  const dailiesThisSprint = dailyLogs ?? [];
  const dailiesAll = (allDailyLogs ?? []) as Array<Record<string, any>>;
  const dailiesCount = dailiesThisSprint.length;
  const today = new Date().toISOString().slice(0, 10);

  const nextSprintCode = useMemo(() => {
    const numbers = sprints
      .map((s) => {
        const m = String(s.code ?? '').match(/^SP(\d+)$/i);
        return m ? Number(m[1]) : null;
      })
      .filter((n): n is number => n != null);

    const max = numbers.length ? Math.max(...numbers) : 0;
    return `SP${String(max + 1).padStart(3, '0')}`;
  }, [sprints]);

  const methodologyStage = useMemo(() => {
    if (activeSprint) return 'Execucao do Sprint';
    if (nextSprint) return 'Planejamento de Sprint';
    if (totalFeatures > 0) return 'Refino de Backlog';
    return 'Descoberta Inicial';
  }, [activeSprint, nextSprint, totalFeatures]);

  const mdPlanningTemplate = useMemo(() => {
    const sprintGoalSuggestion =
      criticalRisks > 0
        ? 'Reduzir riscos criticos e estabilizar entregas do sprint com foco em desbloqueios.'
        : 'Entregar incremento verificavel com foco em features Must e qualidade DoD.';

    return `---
template: uzzops-feeder
version: "1.0"
project: "${projectId}"
date: "${today}"
author: "Time UzzOPS"
source: "cronogramas-planejamento-ativo"
---

## sprint
code: ${nextSprintCode}
name: Sprint ${nextSprintCode.replace('SP', '')} - Planejamento Operacional
sprint_goal: ${sprintGoalSuggestion}
start_date: ${today}
end_date: [definir]
duration_weeks: 2
status: planned
velocity_target: ${Math.max(20, sprintPointsTotal || 20)}

## planning_result
session_date: ${today}
items:
  - code: [feature_code]
    story_points: [1|2|3|5|8|13]
    business_value: [1-10]
    work_effort: [1-10]
    consensus: unanimous

## risk
title: [risco principal do sprint]
description: [descricao]
gut_g: 3
gut_u: 3
gut_t: 3
status: identified
mitigation_plan: [plano de mitigacao]
owner: [responsavel]
`;
  }, [criticalRisks, nextSprintCode, projectId, sprintPointsTotal, today]);

  const manualPayloadSamples = useMemo(
    () => ({
      charters: {
        version: 1,
        status: 'active',
        vision_outcome: 'Descreva o outcome principal',
      },
      roadmaps: {
        code: 'ROADMAP-001',
        name: 'Roadmap principal',
        status: 'active',
        planning_model: 'scrum',
      },
      'roadmap-items': {
        roadmap_id: 'UUID_DO_ROADMAP',
        item_type: 'outcome',
        title: 'Novo outcome',
        status: 'planned',
      },
      hypotheses: {
        title: 'Hipotese de valor',
        statement: 'Se [condicao], entao [resultado].',
        risk_type: 'value',
        status: 'in_test',
      },
      'decision-log': {
        title: 'Decisao tecnica',
        category: 'technical',
        decision_text: 'Descricao da decisao',
        status: 'active',
      },
      forecasts: {
        label: 'Forecast Release X',
        forecast_model: 'monte_carlo',
        unit: 'story_points',
      },
      pilots: {
        name: 'Piloto 3 Escritorios',
        pilot_goal: 'Validar MVP em ambiente real',
        status: 'running',
      },
      changelog: {
        change_type: 'feature',
        title: 'Nova funcionalidade',
        summary: 'Resumo da entrega',
        visibility: 'internal',
      },
    }),
    []
  );

  const timelineDateRange = useMemo(() => getTimelineDateRange(timelinePeriod, today), [timelinePeriod, today]);

  const timelineEvents = useMemo(() => {
    const sprintEvents: TimelineEvent[] = sprints.flatMap((s) => [
      {
        id: `sprint-start-${s.id}`,
        date: String(s.start_date),
        kind: 'sprint',
        title: `${s.code} inicio`,
        detail: s.name,
        tone: 'bg-blue-100 text-blue-700 border-blue-200',
      },
      {
        id: `sprint-end-${s.id}`,
        date: String(s.end_date),
        kind: 'sprint',
        title: `${s.code} fim`,
        detail: sprintStatusLabel(s.status),
        tone:
          s.status === 'completed'
            ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
            : 'bg-slate-100 text-slate-700 border-slate-200',
      },
    ]);

    const dailyEvents: TimelineEvent[] = dailiesAll.slice(0, 80).map((d) => ({
      id: `daily-${d.id}`,
      date: String(d.log_date),
      kind: 'daily',
      title: `Daily ${formatDate(d.log_date)}`,
      detail: d.team_member?.name ?? 'Registro diario',
      tone: 'bg-amber-100 text-amber-700 border-amber-200',
    }));

    const riskEvents: TimelineEvent[] = risks
      .filter((r) => (r.gut_score ?? 0) >= 100)
      .map((r) => ({
        id: `risk-${r.id}`,
        date: String(r.updated_at ?? r.created_at ?? today).slice(0, 10),
        kind: 'risk',
        title: `Risco critico (${r.gut_score})`,
        detail: r.title,
        tone: 'bg-rose-100 text-rose-700 border-rose-200',
      }));

    const retroEvents: TimelineEvent[] = retros
      .filter((r) => !!r.due_date)
      .map((r) => ({
        id: `retro-${r.id}`,
        date: String(r.due_date),
        kind: 'retro',
        title: `Retro action (${r.status})`,
        detail: r.action_text,
        tone: 'bg-violet-100 text-violet-700 border-violet-200',
      }));

    return [...sprintEvents, ...dailyEvents, ...riskEvents, ...retroEvents]
      .filter((e) => !!e.date && /^\d{4}-\d{2}-\d{2}/.test(e.date))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [sprints, dailiesAll, risks, retros, today]);

  const filteredTimelineEvents = useMemo(() => {
    if (!timelineDateRange) return timelineEvents;
    return timelineEvents.filter((event) => event.date >= timelineDateRange.from && event.date <= timelineDateRange.to);
  }, [timelineEvents, timelineDateRange]);

  const upcomingEvents = filteredTimelineEvents.filter((e) => e.date >= today).slice(0, 12);
  const recentEvents = filteredTimelineEvents.filter((e) => e.date < today).slice(-12).reverse();

  const filteredSprintsForRelease = useMemo(() => {
    if (!timelineDateRange) return sprints;
    return sprints.filter((sprint) => {
      const start = String(sprint.start_date ?? '');
      if (!/^\d{4}-\d{2}-\d{2}/.test(start)) return false;
      return start >= timelineDateRange.from && start <= timelineDateRange.to;
    });
  }, [sprints, timelineDateRange]);

  const releaseSummaries = useMemo<ReleaseSummary[]>(() => {
    const grouped = new Map<
      string,
      {
        sprints: typeof sprints;
      }
    >();

    for (const sprint of filteredSprintsForRelease) {
      const key = quarterKeyFromDate(sprint.start_date);
      const existing = grouped.get(key);
      if (existing) {
        existing.sprints.push(sprint);
      } else {
        grouped.set(key, { sprints: [sprint] });
      }
    }

    return Array.from(grouped.entries())
      .map(([key, value]) => {
        const list = value.sprints;
        const sprintCount = list.length;
        const activeCount = list.filter((s) => s.status === 'active').length;
        const completedCount = list.filter((s) => s.status === 'completed').length;
        const targetSum = list.reduce((sum, s) => sum + (s.velocity_target ?? 0), 0);
        const actualSum = list.reduce((sum, s) => sum + (s.velocity_actual ?? 0), 0);
        const avgVelocityTarget = sprintCount ? Math.round(targetSum / sprintCount) : 0;
        const avgVelocityActual = sprintCount ? Math.round(actualSum / sprintCount) : 0;
        const progress = sprintCount ? Math.round((completedCount / sprintCount) * 100) : 0;

        const criticalRisksInQuarter = risks.filter((r) => {
          if ((r.gut_score ?? 0) < 100) return false;
          return quarterKeyFromDate(String(r.updated_at ?? r.created_at ?? '')) === key;
        }).length;

        return {
          key,
          label: quarterLabel(key),
          sprintCount,
          activeCount,
          completedCount,
          avgVelocityTarget,
          avgVelocityActual,
          progress,
          criticalRisks: criticalRisksInQuarter,
        } satisfies ReleaseSummary;
      })
      .sort((a, b) => a.key.localeCompare(b.key))
      .reverse();
  }, [filteredSprintsForRelease, risks]);

  const loading =
    loadingSprints ||
    loadingFeatures ||
    loadingRisks ||
    loadingRetros ||
    loadingActiveSprintFeatures ||
    loadingDailies ||
    loadingAllDailies ||
    loadingGovernance ||
    loadingGovernanceCharters ||
    loadingGovernanceRoadmaps ||
    loadingGovernanceRoadmapItems ||
    loadingGovernanceHypotheses ||
    loadingGovernanceDecisions ||
    loadingGovernanceForecasts ||
    loadingGovernancePilots ||
    loadingGovernanceChangelog;

  const governanceCounts = (governanceOverview as any)?.data?.counts ?? {};
  const decisionItems = ((governanceDecisions as any)?.data ?? []) as Array<Record<string, any>>;
  const forecastItems = ((governanceForecasts as any)?.data ?? []) as Array<Record<string, any>>;
  const pilotPrograms = (((governancePilots as any)?.data?.programs ?? []) as Array<Record<string, any>>);
  const charterItems = ((governanceCharters as any)?.data ?? []) as Array<Record<string, any>>;
  const roadmapItemsAll = ((governanceRoadmaps as any)?.data ?? []) as Array<Record<string, any>>;
  const roadmapLineItems = ((governanceRoadmapItems as any)?.data ?? []) as Array<Record<string, any>>;
  const hypothesisItems = ((governanceHypotheses as any)?.data ?? []) as Array<Record<string, any>>;
  const changelogItems = ((governanceChangelog as any)?.data ?? []) as Array<Record<string, any>>;
  const pilotOffices = (((governancePilots as any)?.data?.offices ?? []) as Array<Record<string, any>>);

  const resetManualPayload = () => {
    setManualPayloadText(JSON.stringify(manualPayloadSamples[manualSection], null, 2));
  };

  const prepareInlineEdit = (
    section: 'charters' | 'roadmaps' | 'roadmap-items' | 'hypotheses' | 'decision-log' | 'forecasts' | 'pilots' | 'changelog',
    item: Record<string, unknown>
  ) => {
    const idValue = typeof item.id === 'string' ? item.id : '';
    setManualSection(section);
    setManualMethod('PATCH');
    setManualId(idValue);
    setManualPayloadText(JSON.stringify(item, null, 2));
    toast.info('Item carregado no editor manual abaixo. Ajuste e clique em Executar.');
  };

  const submitManualPayload = async () => {
    try {
      const parsed = JSON.parse(manualPayloadText) as Record<string, unknown>;
      if (manualMethod === 'PATCH') {
        if (!manualId.trim() && typeof parsed.id !== 'string') {
          toast.error('Informe o id para editar (campo ID ou payload.id).');
          return;
        }
        if (!parsed.id && manualId.trim()) parsed.id = manualId.trim();
      }

      await manualMutation.mutateAsync({
        section: manualSection,
        method: manualMethod,
        payload: parsed,
      });
      toast.success(`Operacao ${manualMethod} executada em ${manualSection}.`);
      if (manualMethod === 'POST') {
        setManualId('');
      }
    } catch (error) {
      if (error instanceof SyntaxError) {
        toast.error('JSON invalido no payload.');
        return;
      }
      const message = error instanceof Error ? error.message : 'Falha na operacao manual';
      toast.error(message);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-96 rounded-lg" />
        <Skeleton className="h-24 rounded-lg" />
        <Skeleton className="h-96 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Cronogramas</h1>
        <p className="text-sm text-slate-500">
          Planejamento operacional integrado com sprint, backlog, riscos e rituais Scrum.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        <KpiCard
          title="Sprint atual"
          value={activeSprint?.code ?? '-'}
          subtitle={
            activeSprint
              ? `${formatDate(activeSprint.start_date)} a ${formatDate(activeSprint.end_date)}`
              : 'Sem sprint ativo'
          }
          icon={CalendarDays}
          accent="border-blue-200"
          tone="text-blue-700"
        />
        <KpiCard
          title="Progresso sprint"
          value={`${sprintProgress}%`}
          subtitle={`${sprintPointsDone}/${sprintPointsTotal} pts`}
          icon={Target}
          accent="border-slate-200"
        />
        <KpiCard
          title="Backlog"
          value={`${doneFeatures}/${totalFeatures}`}
          subtitle={`${blockedFeatures} blocked`}
          icon={CheckCircle2}
          accent={blockedFeatures > 0 ? 'border-rose-200' : 'border-emerald-200'}
          tone={blockedFeatures > 0 ? 'text-rose-700' : 'text-emerald-700'}
        />
        <KpiCard
          title="Riscos criticos"
          value={String(criticalRisks)}
          subtitle="GUT >= 100"
          icon={ShieldAlert}
          accent={criticalRisks > 0 ? 'border-rose-200' : 'border-slate-200'}
          tone={criticalRisks > 0 ? 'text-rose-700' : 'text-slate-700'}
        />
        <KpiCard
          title="Retros pendentes"
          value={String(retrosPending)}
          subtitle={`${retrosInProgress} em progresso`}
          icon={Clock3}
          accent={retrosPending > 0 ? 'border-amber-200' : 'border-slate-200'}
          tone={retrosPending > 0 ? 'text-amber-700' : 'text-slate-700'}
        />
        <KpiCard
          title="Dailies"
          value={String(dailiesCount)}
          subtitle="registros no sprint"
          icon={CalendarClock}
          accent="border-slate-200"
        />
        <KpiCard
          title="Decisions (gov.)"
          value={String(governanceCounts.decisions ?? 0)}
          subtitle={`${governanceCounts.adrs ?? 0} ADRs`}
          icon={FileText}
          accent="border-slate-200"
        />
        <KpiCard
          title="Forecasts"
          value={String(governanceCounts.forecasts ?? 0)}
          subtitle={`${governanceCounts.hypotheses ?? 0} hipóteses`}
          icon={Target}
          accent="border-slate-200"
        />
      </div>

      <Tabs defaultValue="visao-geral" className="space-y-3">
        <TabsList>
          <TabsTrigger value="visao-geral">Visao Geral</TabsTrigger>
          <TabsTrigger value="linha-cronologica">Linha Cronologica</TabsTrigger>
          <TabsTrigger value="planejamento-ativo">Planejamento Ativo</TabsTrigger>
          <TabsTrigger value="rituais">Rituais</TabsTrigger>
          <TabsTrigger value="metodologia">Metodologia</TabsTrigger>
          <TabsTrigger value="governanca">Governança</TabsTrigger>
        </TabsList>

        <TabsContent value="visao-geral" className="space-y-4">
          <div className="grid gap-4 xl:grid-cols-3">
            <Card className="xl:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Linha do tempo de sprints</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {sprints.length === 0 ? (
                  <p className="text-sm text-slate-500">Nenhum sprint cadastrado.</p>
                ) : (
                  sprints
                    .slice()
                    .sort((a, b) => String(b.start_date).localeCompare(String(a.start_date)))
                    .slice(0, 8)
                    .map((sprint) => (
                      <div key={sprint.id} className="rounded-md border bg-slate-50 p-3">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium text-slate-900">
                            {sprint.code} - {sprint.name}
                          </p>
                          <Badge variant="outline" className={sprintStatusClass(sprint.status)}>
                            {sprintStatusLabel(sprint.status)}
                          </Badge>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                          {formatDate(sprint.start_date)} a {formatDate(sprint.end_date)}
                        </p>
                        <p className="mt-1 text-xs text-slate-600">
                          Velocity: {sprint.velocity_actual ?? 0}/{sprint.velocity_target ?? 0}
                        </p>
                      </div>
                    ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Saude do backlog</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <MetricRow label="Total de features" value={String(totalFeatures)} />
                <MetricRow label="Concluidas" value={String(doneFeatures)} />
                <MetricRow label="Must (MoSCoW)" value={String(moscowMust)} />
                <MetricRow label="Spikes" value={String(spikes)} />
                <MetricRow
                  label="Blocked"
                  value={String(blockedFeatures)}
                  tone={blockedFeatures > 0 ? 'text-rose-700' : undefined}
                />

                <div>
                  <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                    <span>Progresso geral</span>
                    <span>{pct(doneFeatures, totalFeatures)}%</span>
                  </div>
                  <div className="h-2 rounded bg-slate-100">
                    <div
                      className={`h-2 rounded ${progressTone(pct(doneFeatures, totalFeatures))}`}
                      style={{ width: `${pct(doneFeatures, totalFeatures)}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="linha-cronologica" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Filtro de período da timeline</CardTitle>
              <Badge variant="outline">
                {timelineDateRange
                  ? `${formatDate(timelineDateRange.from)} a ${formatDate(timelineDateRange.to)}`
                  : 'Período completo'}
              </Badge>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button
                variant={timelinePeriod === 'current_quarter' ? 'default' : 'outline'}
                onClick={() => setTimelinePeriod('current_quarter')}
                className={timelinePeriod === 'current_quarter' ? 'bg-uzzai-primary hover:bg-uzzai-primary/90' : ''}
              >
                Trimestre atual
              </Button>
              <Button
                variant={timelinePeriod === 'last_90_days' ? 'default' : 'outline'}
                onClick={() => setTimelinePeriod('last_90_days')}
                className={timelinePeriod === 'last_90_days' ? 'bg-uzzai-primary hover:bg-uzzai-primary/90' : ''}
              >
                Últimos 90 dias
              </Button>
              <Button
                variant={timelinePeriod === 'year_to_date' ? 'default' : 'outline'}
                onClick={() => setTimelinePeriod('year_to_date')}
                className={timelinePeriod === 'year_to_date' ? 'bg-uzzai-primary hover:bg-uzzai-primary/90' : ''}
              >
                Ano até hoje
              </Button>
              <Button
                variant={timelinePeriod === 'all' ? 'default' : 'outline'}
                onClick={() => setTimelinePeriod('all')}
                className={timelinePeriod === 'all' ? 'bg-uzzai-primary hover:bg-uzzai-primary/90' : ''}
              >
                Tudo
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Fase metodologica atual</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-3">
              <MetricRow label="Etapa atual" value={methodologyStage} />
              <MetricRow label="Sprint ativo" value={activeSprint?.code ?? 'Nenhum'} />
              <MetricRow
                label="Proximo marco"
                value={nextSprint ? `${nextSprint.code} (${formatDate(nextSprint.start_date)})` : 'Definir proximo sprint'}
              />
            </CardContent>
          </Card>

          <div className="grid gap-4 xl:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Proximos marcos</CardTitle>
                <Badge variant="outline">{upcomingEvents.length}</Badge>
              </CardHeader>
              <CardContent className="space-y-2">
                {upcomingEvents.length === 0 ? (
                  <p className="text-sm text-slate-500">Nenhum marco futuro encontrado.</p>
                ) : (
                  upcomingEvents.map((event) => <TimelineRow key={event.id} event={event} />)
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Historico recente</CardTitle>
                <Badge variant="outline">{recentEvents.length}</Badge>
              </CardHeader>
              <CardContent className="space-y-2">
                {recentEvents.length === 0 ? (
                  <p className="text-sm text-slate-500">Sem eventos historicos relevantes.</p>
                ) : (
                  recentEvents.map((event) => <TimelineRow key={event.id} event={event} />)
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Timeline por release (trimestre)</CardTitle>
              <Badge variant="outline">{releaseSummaries.length} release(s)</Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              {releaseSummaries.length === 0 ? (
                <p className="text-sm text-slate-500">Sem sprints para consolidar por release.</p>
              ) : (
                releaseSummaries.map((release) => (
                  <div key={release.key} className="rounded-md border bg-slate-50 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-900">{release.label}</p>
                      <Badge
                        variant="outline"
                        className={
                          release.criticalRisks > 0
                            ? 'border-rose-200 bg-rose-50 text-rose-700'
                            : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        }
                      >
                        riscos críticos: {release.criticalRisks}
                      </Badge>
                    </div>
                    <div className="mt-2 grid gap-2 text-xs md:grid-cols-5">
                      <MetricRow label="Sprints" value={String(release.sprintCount)} />
                      <MetricRow label="Ativos" value={String(release.activeCount)} />
                      <MetricRow label="Concluídos" value={String(release.completedCount)} />
                      <MetricRow label="Vel alvo médio" value={String(release.avgVelocityTarget)} />
                      <MetricRow label="Vel real média" value={String(release.avgVelocityActual)} />
                    </div>
                    <div className="mt-3">
                      <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                        <span>Conclusão da release</span>
                        <span>{release.progress}%</span>
                      </div>
                      <div className="h-2 rounded bg-slate-200">
                        <div
                          className={`h-2 rounded ${progressTone(release.progress)}`}
                          style={{ width: `${release.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="planejamento-ativo" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Acao imediata de planejamento</CardTitle>
              <div className="flex items-center gap-2">
                <MdFeederButton
                  projectId={projectId}
                  initialMarkdown={mdPlanningTemplate}
                  triggerLabel="Enviar para MD Feeder"
                />
                <Button
                  onClick={() => setIsCreateSprintOpen(true)}
                  className="bg-uzzai-primary hover:bg-uzzai-primary/90"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Novo sprint
                </Button>
              </div>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-3">
              <MetricRow label="Codigo sugerido" value={nextSprintCode} />
              <MetricRow
                label="Meta de velocity sugerida"
                value={String(Math.max(20, sprintPointsTotal || 20))}
              />
              <MetricRow
                label="Features blocked"
                value={String(blockedFeatures)}
                tone={blockedFeatures > 0 ? 'text-rose-700' : undefined}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Template MD para Sprint Planning</CardTitle>
              <Button
                variant="outline"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(mdPlanningTemplate);
                    toast.success('Template de planejamento copiado.');
                  } catch {
                    toast.error('Nao foi possivel copiar o template.');
                  }
                }}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copiar template
              </Button>
            </CardHeader>
            <CardContent>
              <pre className="max-h-80 overflow-auto rounded-md border bg-slate-950 p-3 text-xs text-slate-100">
                {mdPlanningTemplate}
              </pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recomendacao tatica desta semana</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-700">
              <p>
                1. Fechar primeiro os itens <strong>blocked</strong> para preservar previsibilidade.
              </p>
              <p>
                2. Garantir Sprint Goal curto e mensuravel antes de puxar novas features.
              </p>
              <p>
                3. Priorizar features <strong>Must</strong> com maior risco de atraso.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rituais" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Checklist operacional do sprint</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 md:grid-cols-2">
              <ChecklistItem
                label="Sprint ativo definido"
                done={!!activeSprint}
                detail={activeSprint ? `${activeSprint.code} em execucao` : 'Crie/ative um sprint'}
              />
              <ChecklistItem
                label="Sprint goal definido"
                done={!!activeSprint?.goal}
                detail={activeSprint?.goal ? 'Goal registrado' : 'Preencher goal do sprint'}
              />
              <ChecklistItem
                label="Daily registrada no sprint"
                done={dailiesCount > 0}
                detail={`${dailiesCount} registro(s)`}
              />
              <ChecklistItem
                label="Riscos criticos sob controle"
                done={criticalRisks === 0}
                detail={
                  criticalRisks === 0
                    ? 'Sem riscos criticos'
                    : `${criticalRisks} risco(s) critico(s)`
                }
              />
              <ChecklistItem
                label="Retros sem acumulo"
                done={retrosPending === 0}
                detail={
                  retrosPending === 0
                    ? 'Sem pendencias'
                    : `${retrosPending} acao(oes) pendente(s)`
                }
              />
              <ChecklistItem
                label="Proximo sprint planejado"
                done={!!nextSprint}
                detail={
                  nextSprint
                    ? `${nextSprint.code} (${formatDate(nextSprint.start_date)})`
                    : 'Sem sprint planejado'
                }
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Acoes rapidas</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 md:grid-cols-3">
              <QuickLink href={`/projects/${projectId}/sprints`} label="Planejar sprint" />
              <QuickLink href={`/projects/${projectId}/daily`} label="Registrar daily" />
              <QuickLink href={`/projects/${projectId}/risks`} label="Gerenciar riscos" />
              <QuickLink href={`/projects/${projectId}/features`} label="Refinar backlog" />
              <QuickLink href={`/projects/${projectId}/progress`} label="Ver progresso" />
              <QuickLink href={`/projects/${projectId}/imports/history`} label="Historico de imports MD" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metodologia" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Cadencia Scrum (saude metodologica)</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 md:grid-cols-2">
              <ChecklistItem
                label="Planning ativo"
                done={!!nextSprint || !!activeSprint}
                detail={
                  nextSprint
                    ? `Sprint planejado: ${nextSprint.code}`
                    : activeSprint
                      ? `Em execucao: ${activeSprint.code}`
                      : 'Sem sprint planejado'
                }
              />
              <ChecklistItem
                label="Daily em andamento"
                done={dailiesCount >= 3}
                detail={`${dailiesCount} daily(s) no sprint atual`}
              />
              <ChecklistItem
                label="Review com resultado"
                done={sprints.some((s) => s.status === 'completed' && (s.velocity_actual ?? 0) > 0)}
                detail="Existe sprint concluido com velocity registrada"
              />
              <ChecklistItem
                label="Retro com follow-up"
                done={retrosPending + retrosInProgress <= 5}
                detail={`${retrosPending + retrosInProgress} acao(oes) abertas`}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Governança operacional (novo)</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-3">
              <MetricRow label="Charters" value={String(governanceCounts.charters ?? 0)} />
              <MetricRow label="Roadmaps" value={String(governanceCounts.roadmaps ?? 0)} />
              <MetricRow label="Roadmap items" value={String(governanceCounts.roadmap_items ?? 0)} />
              <MetricRow label="Hypotheses" value={String(governanceCounts.hypotheses ?? 0)} />
              <MetricRow label="Experimentos" value={String(governanceCounts.experiments ?? 0)} />
              <MetricRow label="Decision log" value={String(governanceCounts.decisions ?? 0)} />
              <MetricRow label="ADRs" value={String(governanceCounts.adrs ?? 0)} />
              <MetricRow label="Forecasts" value={String(governanceCounts.forecasts ?? 0)} />
              <MetricRow label="Pilotos" value={String(governanceCounts.pilots ?? 0)} />
            </CardContent>
          </Card>

          <div className="grid gap-4 xl:grid-cols-3">
            <Card className="xl:col-span-1">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Decisões recentes</CardTitle>
                <Badge variant="outline">{decisionItems.length}</Badge>
              </CardHeader>
              <CardContent className="space-y-2">
                {decisionItems.length === 0 ? (
                  <p className="text-sm text-slate-500">Sem decisões registradas.</p>
                ) : (
                  decisionItems.slice(0, 5).map((d) => (
                    <div key={String(d.id)} className="rounded-md border bg-slate-50 p-3">
                      <p className="text-sm font-medium text-slate-900">{String(d.title ?? '-')}</p>
                      <p className="mt-1 text-xs text-slate-600">
                        {String(d.category ?? '-')} | {formatDate(String(d.decision_date ?? ''))}
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="xl:col-span-1">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Forecasts recentes</CardTitle>
                <Badge variant="outline">{forecastItems.length}</Badge>
              </CardHeader>
              <CardContent className="space-y-2">
                {forecastItems.length === 0 ? (
                  <p className="text-sm text-slate-500">Sem forecasts registrados.</p>
                ) : (
                  forecastItems.slice(0, 5).map((f) => (
                    <div key={String(f.id)} className="rounded-md border bg-slate-50 p-3">
                      <p className="text-sm font-medium text-slate-900">{String(f.label ?? '-')}</p>
                      <p className="mt-1 text-xs text-slate-600">
                        {String(f.forecast_model ?? '-')} | {formatDate(String(f.generated_at ?? ''))}
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="xl:col-span-1">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Pilotos</CardTitle>
                <Badge variant="outline">{pilotPrograms.length}</Badge>
              </CardHeader>
              <CardContent className="space-y-2">
                {pilotPrograms.length === 0 ? (
                  <p className="text-sm text-slate-500">Sem programas de piloto.</p>
                ) : (
                  pilotPrograms.slice(0, 5).map((p) => (
                    <div key={String(p.id)} className="rounded-md border bg-slate-50 p-3">
                      <p className="text-sm font-medium text-slate-900">{String(p.name ?? '-')}</p>
                      <p className="mt-1 text-xs text-slate-600">
                        {String(p.status ?? '-')} | {formatDate(String(p.start_date ?? ''))}
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Base metodologica aplicada</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <DocRef
                title="Metodologia completa"
                path="docs/METODOLOGIA_CRONOGRAMA_UZZOPS.md"
                description="Principios, camadas de planejamento, DoD, forecast, rituais e gestao de riscos."
              />
              <DocRef
                title="Guia pratico operacional"
                path="docs/GUIA_PRATICO_CRONOGRAMA_UZZOPS.md"
                description="Playbook de execucao diaria: planning, daily, review e retrospective."
              />
              <DocRef
                title="Integracao metodologia x sistema"
                path="docs/INTEGRACAO_CRONOGRAMA_UZZOPS.md"
                description="Mapeia cada conceito da metodologia para funcionalidades reais do UzzOPS."
              />
              <DocRef
                title="Indice e navegacao dos guias"
                path="docs/INDICE_CRONOGRAMA_UZZOPS.md"
                description="Roteiro recomendado de leitura e adocao no time."
              />
              <DocRef
                title="Playbooks de pesquisa"
                path="docs/deep-research-report (1).md + docs/deep-research-report.md"
                description="Base estrategica e operacional para evolucao continua do modelo."
              />
              <DocRef
                title="Integração viva no sistema"
                path="api/projects/[id]/cronogramas/* + database/migrations/027_cronogramas_governance_platform.sql"
                description="Camada real de governança: charter, OST, roadmap, hipóteses, decisão, forecast, piloto e changelog."
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="governanca" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Governança de cronograma e produto</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
              <MetricRow label="Charters" value={String(governanceCounts.charters ?? charterItems.length)} />
              <MetricRow label="Roadmaps" value={String(governanceCounts.roadmaps ?? roadmapItemsAll.length)} />
              <MetricRow label="Roadmap Items" value={String(governanceCounts.roadmap_items ?? roadmapLineItems.length)} />
              <MetricRow label="Hipóteses" value={String(governanceCounts.hypotheses ?? hypothesisItems.length)} />
              <MetricRow label="Decisões" value={String(governanceCounts.decisions ?? decisionItems.length)} />
              <MetricRow label="Changelog" value={String(governanceCounts.changelog ?? changelogItems.length)} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Editor manual (sem MD Feeder)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-slate-600">
                Permite criar e editar manualmente qualquer seção da governança. Em `PATCH`, use o campo ID ou inclua
                `id` no JSON.
              </p>
              <div className="grid gap-2 md:grid-cols-3">
                <label className="text-sm">
                  <span className="mb-1 block text-xs text-slate-600">Seção</span>
                  <select
                    value={manualSection}
                    onChange={(e) =>
                      setManualSection(
                        e.target.value as
                          | 'charters'
                          | 'roadmaps'
                          | 'roadmap-items'
                          | 'hypotheses'
                          | 'decision-log'
                          | 'forecasts'
                          | 'pilots'
                          | 'changelog'
                      )
                    }
                    className="w-full rounded-md border border-slate-300 bg-white px-2 py-2 text-sm"
                  >
                    <option value="charters">charters</option>
                    <option value="roadmaps">roadmaps</option>
                    <option value="roadmap-items">roadmap-items</option>
                    <option value="hypotheses">hypotheses</option>
                    <option value="decision-log">decision-log</option>
                    <option value="forecasts">forecasts</option>
                    <option value="pilots">pilots</option>
                    <option value="changelog">changelog</option>
                  </select>
                </label>

                <label className="text-sm">
                  <span className="mb-1 block text-xs text-slate-600">Método</span>
                  <select
                    value={manualMethod}
                    onChange={(e) => setManualMethod(e.target.value as 'POST' | 'PATCH')}
                    className="w-full rounded-md border border-slate-300 bg-white px-2 py-2 text-sm"
                  >
                    <option value="POST">POST (criar)</option>
                    <option value="PATCH">PATCH (editar)</option>
                  </select>
                </label>

                <label className="text-sm">
                  <span className="mb-1 block text-xs text-slate-600">ID (somente PATCH)</span>
                  <input
                    value={manualId}
                    onChange={(e) => setManualId(e.target.value)}
                    placeholder="uuid do registro"
                    className="w-full rounded-md border border-slate-300 bg-white px-2 py-2 text-sm"
                  />
                </label>
              </div>

              <label className="text-sm">
                <span className="mb-1 block text-xs text-slate-600">Payload JSON</span>
                <textarea
                  value={manualPayloadText}
                  onChange={(e) => setManualPayloadText(e.target.value)}
                  className="h-52 w-full rounded-md border border-slate-300 bg-white p-3 font-mono text-xs"
                  spellCheck={false}
                />
              </label>

              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" size="sm" onClick={resetManualPayload}>
                  Carregar exemplo da seção
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={submitManualPayload}
                  disabled={manualMutation.isPending}
                >
                  {manualMutation.isPending ? 'Salvando...' : 'Executar'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="charter" className="space-y-3">
            <TabsList>
              <TabsTrigger value="charter">Charter</TabsTrigger>
              <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
              <TabsTrigger value="hipoteses">Hipóteses</TabsTrigger>
              <TabsTrigger value="decisoes">Decisões/ADR</TabsTrigger>
              <TabsTrigger value="forecast">Forecast</TabsTrigger>
              <TabsTrigger value="pilotos">Pilotos</TabsTrigger>
              <TabsTrigger value="changelog">Changelog</TabsTrigger>
            </TabsList>

            <TabsContent value="charter">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">Product Charters</CardTitle>
                  <Badge variant="outline">{charterItems.length}</Badge>
                </CardHeader>
                <CardContent className="space-y-2">
                  {charterItems.length === 0 ? (
                    <p className="text-sm text-slate-500">Nenhum charter registrado.</p>
                  ) : (
                    charterItems.slice(0, 10).map((c) => (
                      <div key={String(c.id)} className="rounded-md border bg-slate-50 p-3">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-slate-900">Versão {String(c.version ?? '-')}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{String(c.status ?? '-')}</Badge>
                            <Button type="button" variant="outline" size="sm" onClick={() => prepareInlineEdit('charters', c)}>
                              Editar
                            </Button>
                          </div>
                        </div>
                        <p className="mt-1 text-xs text-slate-600">{asText(c.vision_outcome)}</p>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="roadmap">
              <div className="grid gap-4 xl:grid-cols-2">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-base">Roadmaps</CardTitle>
                    <Badge variant="outline">{roadmapItemsAll.length}</Badge>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {roadmapItemsAll.length === 0 ? (
                      <p className="text-sm text-slate-500">Nenhum roadmap registrado.</p>
                    ) : (
                      roadmapItemsAll.slice(0, 10).map((r) => (
                        <div key={String(r.id)} className="rounded-md border bg-slate-50 p-3">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-semibold text-slate-900">{asText(r.name)}</p>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{asText(r.status)}</Badge>
                              <Button type="button" variant="outline" size="sm" onClick={() => prepareInlineEdit('roadmaps', r)}>
                                Editar
                              </Button>
                            </div>
                          </div>
                          <p className="mt-1 text-xs text-slate-600">
                            {asText(r.planning_model)} | {formatDate(asText(r.horizon_start))} a {formatDate(asText(r.horizon_end))}
                          </p>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-base">Roadmap Items</CardTitle>
                    <Badge variant="outline">{roadmapLineItems.length}</Badge>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {roadmapLineItems.length === 0 ? (
                      <p className="text-sm text-slate-500">Nenhum item de roadmap registrado.</p>
                    ) : (
                      roadmapLineItems.slice(0, 12).map((i) => (
                        <div key={String(i.id)} className="rounded-md border bg-slate-50 p-3">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-semibold text-slate-900">{asText(i.code) || asText(i.title)}</p>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{asText(i.status)}</Badge>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => prepareInlineEdit('roadmap-items', i)}
                              >
                                Editar
                              </Button>
                            </div>
                          </div>
                          <p className="mt-1 text-xs text-slate-600">
                            {asText(i.item_type)} | {formatDate(asText(i.planned_start))} a {formatDate(asText(i.planned_end))}
                          </p>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="hipoteses">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">Hipóteses do projeto</CardTitle>
                  <Badge variant="outline">{hypothesisItems.length}</Badge>
                </CardHeader>
                <CardContent className="space-y-2">
                  {hypothesisItems.length === 0 ? (
                    <p className="text-sm text-slate-500">Nenhuma hipótese registrada.</p>
                  ) : (
                    hypothesisItems.slice(0, 15).map((h) => (
                      <div key={String(h.id)} className="rounded-md border bg-slate-50 p-3">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-slate-900">{asText(h.title)}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{asText(h.status)}</Badge>
                            <Button type="button" variant="outline" size="sm" onClick={() => prepareInlineEdit('hypotheses', h)}>
                              Editar
                            </Button>
                          </div>
                        </div>
                        <p className="mt-1 text-xs text-slate-600">
                          risco: {asText(h.risk_type)} | confianca: {asText(h.confidence_before)} {'->'} {asText(h.confidence_after)}
                        </p>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="decisoes">
              <div className="grid gap-4 xl:grid-cols-2">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-base">Decision Log</CardTitle>
                    <Badge variant="outline">{decisionItems.length}</Badge>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {decisionItems.length === 0 ? (
                      <p className="text-sm text-slate-500">Nenhuma decisão registrada.</p>
                    ) : (
                      decisionItems.slice(0, 15).map((d) => (
                        <div key={String(d.id)} className="rounded-md border bg-slate-50 p-3">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-semibold text-slate-900">{asText(d.title)}</p>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{asText(d.status)}</Badge>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => prepareInlineEdit('decision-log', d)}
                              >
                                Editar
                              </Button>
                            </div>
                          </div>
                          <p className="mt-1 text-xs text-slate-600">
                            {asText(d.category)} | {formatDate(asText(d.decision_date))}
                          </p>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-base">ADRs recentes</CardTitle>
                    <Badge variant="outline">{String(governanceCounts.adrs ?? 0)}</Badge>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {(((governanceOverview as any)?.data?.latest?.adrs ?? []) as Array<Record<string, any>>).length === 0 ? (
                      <p className="text-sm text-slate-500">Nenhum ADR registrado.</p>
                    ) : (
                      (((governanceOverview as any)?.data?.latest?.adrs ?? []) as Array<Record<string, any>>)
                        .slice(0, 10)
                        .map((a) => (
                          <div key={String(a.id)} className="rounded-md border bg-slate-50 p-3">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm font-semibold text-slate-900">{asText(a.adr_code)}</p>
                              <Badge variant="outline">{asText(a.status)}</Badge>
                            </div>
                            <p className="mt-1 text-xs text-slate-600">{formatDate(asText(a.created_at))}</p>
                          </div>
                        ))
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="forecast">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">Forecasts</CardTitle>
                  <Badge variant="outline">{forecastItems.length}</Badge>
                </CardHeader>
                <CardContent className="space-y-2">
                  {forecastItems.length === 0 ? (
                    <p className="text-sm text-slate-500">Nenhum forecast registrado.</p>
                  ) : (
                    forecastItems.slice(0, 12).map((f) => (
                      <div key={String(f.id)} className="rounded-md border bg-slate-50 p-3">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-slate-900">{asText(f.label)}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{asText(f.forecast_model)}</Badge>
                            <Button type="button" variant="outline" size="sm" onClick={() => prepareInlineEdit('forecasts', f)}>
                              Editar
                            </Button>
                          </div>
                        </div>
                        <p className="mt-1 text-xs text-slate-600">{formatDate(asText(f.generated_at))}</p>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pilotos">
              <div className="grid gap-4 xl:grid-cols-2">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-base">Programas de piloto</CardTitle>
                    <Badge variant="outline">{pilotPrograms.length}</Badge>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {pilotPrograms.length === 0 ? (
                      <p className="text-sm text-slate-500">Nenhum programa de piloto.</p>
                    ) : (
                      pilotPrograms.slice(0, 10).map((p) => (
                        <div key={String(p.id)} className="rounded-md border bg-slate-50 p-3">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-semibold text-slate-900">{asText(p.name)}</p>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{asText(p.status)}</Badge>
                              <Button type="button" variant="outline" size="sm" onClick={() => prepareInlineEdit('pilots', p)}>
                                Editar
                              </Button>
                            </div>
                          </div>
                          <p className="mt-1 text-xs text-slate-600">
                            {formatDate(asText(p.start_date))} a {formatDate(asText(p.end_date))}
                          </p>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-base">Escritórios piloto</CardTitle>
                    <Badge variant="outline">{pilotOffices.length}</Badge>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {pilotOffices.length === 0 ? (
                      <p className="text-sm text-slate-500">Nenhum escritório piloto.</p>
                    ) : (
                      pilotOffices.slice(0, 10).map((o) => (
                        <div key={String(o.id)} className="rounded-md border bg-slate-50 p-3">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-semibold text-slate-900">{asText(o.office_name)}</p>
                            <Badge variant="outline">{asText(o.status)}</Badge>
                          </div>
                          <p className="mt-1 text-xs text-slate-600">{asText(o.contact_name)} | {asText(o.contact_email)}</p>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="changelog">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">Product Changelog</CardTitle>
                  <Badge variant="outline">{changelogItems.length}</Badge>
                </CardHeader>
                <CardContent className="space-y-2">
                  {changelogItems.length === 0 ? (
                    <p className="text-sm text-slate-500">Nenhum changelog registrado.</p>
                  ) : (
                    changelogItems.slice(0, 20).map((c) => (
                      <div key={String(c.id)} className="rounded-md border bg-slate-50 p-3">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-slate-900">{asText(c.title)}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{asText(c.change_type)}</Badge>
                            <Button type="button" variant="outline" size="sm" onClick={() => prepareInlineEdit('changelog', c)}>
                              Editar
                            </Button>
                          </div>
                        </div>
                        <p className="mt-1 text-xs text-slate-600">
                          {formatDate(asText(c.change_date))} | {asText(c.visibility)}
                        </p>
                        <p className="mt-1 text-xs text-slate-600">{asText(c.summary)}</p>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>

      <CreateSprintModal
        open={isCreateSprintOpen}
        onOpenChange={setIsCreateSprintOpen}
        projectId={projectId}
      />
    </div>
  );
}

function TimelineRow({ event }: { event: TimelineEvent }) {
  return (
    <div className="rounded-md border bg-slate-50 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-sm font-medium text-slate-900">
          <Flag className="h-4 w-4 text-slate-500" />
          {event.title}
        </p>
        <Badge variant="outline" className={event.tone}>
          {formatDate(event.date)}
        </Badge>
      </div>
      <p className="mt-1 text-xs text-slate-600">{event.detail}</p>
    </div>
  );
}

function MetricRow({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="flex items-center justify-between rounded border bg-slate-50 px-2 py-1.5 text-sm">
      <span className="text-slate-600">{label}</span>
      <span className={`font-semibold text-slate-900 ${tone ?? ''}`}>{value}</span>
    </div>
  );
}

function ChecklistItem({ label, done, detail }: { label: string; done: boolean; detail: string }) {
  return (
    <div
      className={`rounded-md border p-3 ${
        done ? 'border-emerald-200 bg-emerald-50/50' : 'border-amber-200 bg-amber-50/50'
      }`}
    >
      <div className="flex items-center gap-2">
        {done ? (
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
        ) : (
          <AlertTriangle className="h-4 w-4 text-amber-600" />
        )}
        <p className="text-sm font-medium text-slate-900">{label}</p>
      </div>
      <p className="mt-1 text-xs text-slate-600">{detail}</p>
    </div>
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="rounded-md border bg-slate-50 px-3 py-2 text-sm text-slate-800 hover:border-uzzai-primary hover:text-uzzai-primary"
    >
      {label}
    </Link>
  );
}

function DocRef({ title, path, description }: { title: string; path: string; description: string }) {
  return (
    <div className="rounded-md border bg-slate-50 p-3">
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-slate-600" />
        <p className="text-sm font-medium text-slate-900">{title}</p>
      </div>
      <p className="mt-1 text-xs text-slate-600">{description}</p>
      <code className="mt-2 block rounded bg-white px-2 py-1 text-[11px] text-slate-700">{path}</code>
    </div>
  );
}
