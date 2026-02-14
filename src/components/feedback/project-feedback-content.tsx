'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MessageSquareWarning } from 'lucide-react';
import { tenantFetch } from '@/lib/api-client';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

type FeedbackItem = {
  id: string;
  title: string;
  description: string | null;
  type: 'bug' | 'sugestao' | 'elogio' | 'outro';
  priority: 'critica' | 'alta' | 'media' | 'baixa';
  status: 'novo' | 'em-analise' | 'resolvido' | 'descartado';
  user_name: string | null;
  user_email: string | null;
  screenshot_url: string | null;
  page_url: string | null;
  created_at: string;
};

function typeClass(type: string) {
  if (type === 'bug') return 'bg-red-50 text-red-700 border-red-200';
  if (type === 'elogio') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (type === 'sugestao') return 'bg-blue-50 text-blue-700 border-blue-200';
  return 'bg-slate-50 text-slate-700 border-slate-200';
}

function priorityClass(priority: string) {
  if (priority === 'critica') return 'bg-red-50 text-red-700 border-red-200';
  if (priority === 'alta') return 'bg-amber-50 text-amber-700 border-amber-200';
  if (priority === 'media') return 'bg-blue-50 text-blue-700 border-blue-200';
  return 'bg-slate-50 text-slate-700 border-slate-200';
}

function statusClass(status: string) {
  if (status === 'novo') return 'bg-sky-50 text-sky-700 border-sky-200';
  if (status === 'em-analise') return 'bg-amber-50 text-amber-700 border-amber-200';
  if (status === 'resolvido') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  return 'bg-slate-50 text-slate-700 border-slate-200';
}

function formatDate(s: string) {
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleString('pt-BR');
}

export function ProjectFeedbackContent({ projectId }: { projectId: string }) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | FeedbackItem['status']>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | FeedbackItem['type']>('all');
  const [expandedPreviewId, setExpandedPreviewId] = useState<string | null>(null);

  const feedbackQuery = useQuery({
    queryKey: ['project-feedback', projectId],
    queryFn: async () => {
      const res = await tenantFetch(`/api/projects/${projectId}/feedback`);
      if (!res.ok) throw new Error('Falha ao carregar feedbacks');
      const body = await res.json();
      return (body?.data ?? []) as FeedbackItem[];
    },
    enabled: !!projectId,
  });

  const filtered = useMemo(() => {
    const items = feedbackQuery.data ?? [];
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      const textOk = !q || [item.title, item.description, item.user_name, item.user_email].filter(Boolean).some((v) => String(v).toLowerCase().includes(q));
      const statusOk = statusFilter === 'all' || item.status === statusFilter;
      const typeOk = typeFilter === 'all' || item.type === typeFilter;
      return textOk && statusOk && typeOk;
    });
  }, [feedbackQuery.data, query, statusFilter, typeFilter]);

  if (feedbackQuery.isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((n) => (
          <Skeleton key={n} className="h-24 rounded-lg" />
        ))}
      </div>
    );
  }

  if (feedbackQuery.error) {
    return <p className="text-sm text-destructive">Erro ao carregar feedbacks.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-white p-3">
        <div className="grid gap-2 md:grid-cols-4">
          <input
            className="h-10 rounded-md border px-3 text-sm"
            placeholder="Buscar por titulo/descricao/usuario..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select
            className="h-10 rounded-md border px-3 text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | FeedbackItem['status'])}
          >
            <option value="all">Status: todos</option>
            <option value="novo">Novo</option>
            <option value="em-analise">Em analise</option>
            <option value="resolvido">Resolvido</option>
            <option value="descartado">Descartado</option>
          </select>
          <select
            className="h-10 rounded-md border px-3 text-sm"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as 'all' | FeedbackItem['type'])}
          >
            <option value="all">Tipo: todos</option>
            <option value="bug">Bug</option>
            <option value="sugestao">Sugestao</option>
            <option value="elogio">Elogio</option>
            <option value="outro">Outro</option>
          </select>
          <div className="flex items-center justify-end text-xs text-slate-500">
            {filtered.length} feedback(s)
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed bg-slate-50 p-8 text-center">
          <MessageSquareWarning className="mx-auto mb-2 h-5 w-5 text-slate-400" />
          <p className="text-sm text-slate-500">Nenhum feedback encontrado.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((item) => (
            <div key={item.id} className="rounded-lg border bg-white p-4">
              <div className="grid gap-4 md:grid-cols-12">
                <div className="md:col-span-8">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                    <Badge variant="outline" className={typeClass(item.type)}>{item.type}</Badge>
                    <Badge variant="outline" className={priorityClass(item.priority)}>{item.priority}</Badge>
                    <Badge variant="outline" className={statusClass(item.status)}>{item.status}</Badge>
                  </div>
                  {item.description ? <p className="mt-2 text-sm text-slate-700">{item.description}</p> : null}
                  <p className="mt-2 text-xs text-slate-500">
                    Por: <span className="font-medium">{item.user_name ?? '-'}</span> ({item.user_email ?? '-'})
                  </p>
                  <p className="text-xs text-slate-500">Em: {formatDate(item.created_at)}</p>

                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    {item.page_url ? (
                      <a
                        className="text-xs text-uzzai-primary underline"
                        href={item.page_url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Pagina reportada
                      </a>
                    ) : null}
                    {item.screenshot_url ? (
                      <>
                        <button
                          type="button"
                          className="text-xs text-uzzai-primary underline"
                          onClick={() =>
                            setExpandedPreviewId((prev) => (prev === item.id ? null : item.id))
                          }
                        >
                          {expandedPreviewId === item.id ? 'Fechar preview' : 'Abrir preview'}
                        </button>
                        <a
                          className="text-xs text-uzzai-primary underline"
                          href={item.screenshot_url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Abrir original
                        </a>
                      </>
                    ) : null}
                  </div>
                </div>

                {item.screenshot_url ? (
                  <div className="md:col-span-4">
                    <div className="h-28 w-full overflow-hidden rounded border bg-slate-50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.screenshot_url}
                        alt={`Preview do feedback ${item.title}`}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  </div>
                ) : null}
              </div>

              {item.screenshot_url && expandedPreviewId === item.id ? (
                <div className="mt-3 rounded-md border bg-slate-50 p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.screenshot_url}
                    alt={`Preview ampliado do feedback ${item.title}`}
                    className="max-h-[60vh] w-full rounded object-contain"
                    loading="lazy"
                  />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
