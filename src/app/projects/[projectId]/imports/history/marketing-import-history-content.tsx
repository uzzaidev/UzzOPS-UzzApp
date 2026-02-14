'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type ImportHistoryItem = {
  id: string;
  original_filename: string;
  parse_status: string;
  items_total: number;
  items_created: number;
  items_updated: number;
  items_skipped: number;
  items_failed: number;
  created_by_name: string | null;
  created_at: string;
  completed_at: string | null;
};

export function MarketingImportHistoryContent({ projectId }: { projectId: string }) {
  const [items, setItems] = useState<ImportHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams({
        limit: '100',
        offset: '0',
        project_id: projectId,
      });
      const res = await fetch(`/api/import/history?${query.toString()}`, {
        credentials: 'include',
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error ?? 'Falha ao carregar historico.');
      setItems((body?.data?.items ?? []) as ImportHistoryItem[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar historico.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [projectId]);

  const completedCount = useMemo(
    () => items.filter((item) => item.parse_status === 'completed').length,
    [items]
  );

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Historico de Imports MD</h1>
          <p className="text-sm text-muted-foreground">
            Projeto {projectId} · total {items.length} · concluidos {completedCount}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={load} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Atualizar
          </Button>
          <Link href={`/projects/${projectId}/features`}>
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </Link>
        </div>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="overflow-hidden rounded border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-3 py-2 text-left">Arquivo</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left">Resumo</th>
              <th className="px-3 py-2 text-left">Criado em</th>
              <th className="px-3 py-2 text-left">Autor</th>
              <th className="px-3 py-2 text-left">Acoes</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="px-3 py-2">{item.original_filename}</td>
                <td className="px-3 py-2">
                  <Badge variant="outline">{item.parse_status}</Badge>
                </td>
                <td className="px-3 py-2">
                  C:{item.items_created} U:{item.items_updated} S:{item.items_skipped} F:{item.items_failed}
                </td>
                <td className="px-3 py-2">{new Date(item.created_at).toLocaleString('pt-BR')}</td>
                <td className="px-3 py-2">{item.created_by_name || '-'}</td>
                <td className="px-3 py-2">
                  <a className="underline" href={`/api/import/md/${item.id}`} target="_blank" rel="noreferrer">
                    detalhe json
                  </a>
                </td>
              </tr>
            ))}
            {!loading && items.length === 0 ? (
              <tr>
                <td className="px-3 py-4 text-muted-foreground" colSpan={6}>
                  Nenhum import encontrado para este projeto.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

