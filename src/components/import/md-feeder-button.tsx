'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Upload, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

type PreviewItem = {
  index: number;
  item_type: string;
  validation_status: string;
  action: 'create' | 'update' | 'skip' | 'add_observation' | null;
  entity_code: string | null;
  summary: string;
  validation_errors: string[];
};

type UploadResponse = {
  import_id: string;
  parse_status: string;
  preview: {
    items_total: number;
    items_valid: number;
    items_update: number;
    items_observation: number;
    items_skip: number;
    items_invalid: number;
    items: PreviewItem[];
    errors: string[];
  };
};

type ConfirmResponse = {
  import_id: string;
  parse_status: string;
  items_created: number;
  items_updated: number;
  items_skipped: number;
  items_failed: number;
  results: Array<{ index: number; status: string; message: string; entityCode: string | null }>;
};

type OverrideAction = 'skip' | 'create' | 'update' | 'add_observation';

function getAllowedActions(item: PreviewItem): OverrideAction[] {
  if (!item.action) return ['skip'];
  if (item.action === 'add_observation') return ['add_observation', 'skip'];
  const updateTypes = new Set([
    'bug_resolution',
    'spike_result',
    'sprint_update',
    'planning_result',
    'baseline_metric',
  ]);
  if (updateTypes.has(item.item_type)) return ['update', 'skip'];
  return ['create', 'skip'];
}

type HistoryItem = {
  id: string;
  project_id: string | null;
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

type MdFeederButtonProps = {
  projectId?: string;
  initialMarkdown?: string;
  triggerLabel?: string;
};

export function MdFeederButton({ projectId, initialMarkdown, triggerLabel }: MdFeederButtonProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<'upload' | 'preview' | 'result'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadData, setUploadData] = useState<UploadResponse | null>(null);
  const [resultData, setResultData] = useState<ConfirmResponse | null>(null);
  const [contextCopied, setContextCopied] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [itemOverrides, setItemOverrides] = useState<Record<number, OverrideAction>>({});

  const sortedItems = useMemo(
    () => [...(uploadData?.preview.items ?? [])].sort((a, b) => a.index - b.index),
    [uploadData]
  );

  function reset() {
    setStep('upload');
    setFile(null);
    setIsLoading(false);
    setError(null);
    setUploadData(null);
    setResultData(null);
    setContextCopied(false);
    setFileInputKey((v) => v + 1);
    setHistoryError(null);
    setItemOverrides({});
  }

  async function loadHistory() {
    setIsHistoryLoading(true);
    setHistoryError(null);
    try {
      const query = new URLSearchParams({ limit: '5', offset: '0' });
      if (projectId) query.set('project_id', projectId);
      const res = await fetch(`/api/import/history?${query.toString()}`, {
        credentials: 'include',
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error ?? 'Falha ao carregar historico.');
      setHistoryItems((body?.data?.items ?? []) as HistoryItem[]);
    } catch (e) {
      setHistoryError(e instanceof Error ? e.message : 'Erro ao carregar historico.');
    } finally {
      setIsHistoryLoading(false);
    }
  }

  useEffect(() => {
    if (!open || step !== 'upload') return;
    void loadHistory();
  }, [open, step, projectId]);

  useEffect(() => {
    if (!open || step !== 'upload' || !initialMarkdown) return;
    if (file) return;
    const stamp = new Date().toISOString().slice(0, 10);
    const generated = new File([initialMarkdown], `planejamento-${stamp}.md`, {
      type: 'text/markdown',
    });
    setFile(generated);
  }, [open, step, initialMarkdown, file]);

  async function handleParse() {
    if (!file) return;
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (projectId) formData.append('project_id', projectId);

      const res = await fetch('/api/import/md/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error ?? 'Falha ao fazer parse do arquivo.');
      setUploadData(body as UploadResponse);
      setItemOverrides({});
      setStep('preview');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao processar arquivo.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCopyRepoContext() {
    if (!projectId) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/repo-context?format=llm`, {
        credentials: 'include',
      });
      const text = await res.text();
      if (!res.ok) throw new Error(text || 'Falha ao gerar contexto.');
      await navigator.clipboard.writeText(text);
      setContextCopied(true);
      setTimeout(() => setContextCopied(false), 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao copiar contexto.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleConfirm() {
    if (!uploadData) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/import/md/${uploadData.import_id}/confirm`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_overrides: Object.fromEntries(
            Object.entries(itemOverrides).map(([k, action]) => [k, { action }])
          ),
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error ?? 'Falha ao confirmar import.');
      setResultData(body as ConfirmResponse);
      setStep('result');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao confirmar import.');
    } finally {
      setIsLoading(false);
    }
  }

  const hasGlobalParseErrors = (uploadData?.preview.errors.length ?? 0) > 0;
  const hasInvalidItems = (uploadData?.preview.items_invalid ?? 0) > 0;

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Upload className="mr-2 h-4 w-4" />
          {triggerLabel ?? 'Importar MD'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>MD Feeder</DialogTitle>
          <DialogDescription>
            Upload de arquivo .md estruturado para criar/atualizar itens do projeto.
          </DialogDescription>
        </DialogHeader>

        {step === 'upload' ? (
          <div className="space-y-4">
            <Input
              key={fileInputKey}
              type="file"
              accept=".md,text/markdown"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            {file ? (
              <p className="text-xs text-emerald-700">
                Arquivo selecionado: <strong>{file.name}</strong>
              </p>
            ) : null}
            <div className="text-xs text-muted-foreground">
              Aceita apenas <code>.md</code> (max 500KB) com frontmatter <code>template: uzzops-feeder</code>.
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <a href="/api/import/templates/master" target="_blank" rel="noreferrer">
                <Button type="button" variant="outline" size="sm">Baixar template master</Button>
              </a>
              <a href="/api/import/templates/feature" target="_blank" rel="noreferrer">
                <Button type="button" variant="outline" size="sm">Template feature</Button>
              </a>
              <a href="/api/import/templates/risk" target="_blank" rel="noreferrer">
                <Button type="button" variant="outline" size="sm">Template risk</Button>
              </a>
              <a href="/api/import/templates/marketing_post" target="_blank" rel="noreferrer">
                <Button type="button" variant="outline" size="sm">Template marketing_post</Button>
              </a>
            </div>
            {projectId ? (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleCopyRepoContext} disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Copiar contexto para IA
                </Button>
                {contextCopied ? <span className="text-xs text-green-700">Contexto copiado.</span> : null}
              </div>
            ) : null}
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <div className="rounded border p-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-medium">Historico recente</p>
                <Button variant="ghost" size="sm" onClick={loadHistory} disabled={isHistoryLoading}>
                  {isHistoryLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Atualizar'}
                </Button>
              </div>
              {historyError ? <p className="text-xs text-red-600">{historyError}</p> : null}
              {!historyError && historyItems.length === 0 ? (
                <p className="text-xs text-muted-foreground">Nenhum import recente encontrado.</p>
              ) : null}
              <div className="space-y-1">
                {historyItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded border px-2 py-1 text-xs">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{item.original_filename}</p>
                      <p className="text-muted-foreground">
                        {item.parse_status} - C:{item.items_created} U:{item.items_updated} S:{item.items_skipped} F:{item.items_failed}
                      </p>
                    </div>
                    <span className="ml-2 whitespace-nowrap text-muted-foreground">
                      {new Date(item.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={handleParse} disabled={!file || isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Fazer parse
              </Button>
            </div>
          </div>
        ) : null}

        {step === 'preview' && uploadData ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2 md:grid-cols-6">
              <Badge variant="outline">Total: {uploadData.preview.items_total}</Badge>
              <Badge variant="outline">Validos: {uploadData.preview.items_valid}</Badge>
              <Badge variant="outline">Update: {uploadData.preview.items_update}</Badge>
              <Badge variant="outline">Observacao: {uploadData.preview.items_observation}</Badge>
              <Badge variant="outline">Skip: {uploadData.preview.items_skip}</Badge>
              <Badge variant="outline">Invalidos: {uploadData.preview.items_invalid}</Badge>
            </div>

            {uploadData.preview.errors.length > 0 ? (
              <div className="rounded border border-yellow-300 bg-yellow-50 p-3 text-sm">
                {uploadData.preview.errors.map((e, i) => (
                  <p key={i} className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-700" />
                    {e}
                  </p>
                ))}
              </div>
            ) : null}

            <div className="max-h-[45vh] overflow-auto rounded border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-2 py-2 text-left">#</th>
                    <th className="px-2 py-2 text-left">Tipo</th>
                    <th className="px-2 py-2 text-left">Codigo</th>
                    <th className="px-2 py-2 text-left">Resumo</th>
                    <th className="px-2 py-2 text-left">Acao</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedItems.map((item) => (
                  <tr key={item.index} className="border-t">
                      <td className="px-2 py-2">{item.index}</td>
                      <td className="px-2 py-2">{item.item_type}</td>
                      <td className="px-2 py-2">{item.entity_code ?? '-'}</td>
                      <td className="px-2 py-2">
                        {item.summary}
                        {item.validation_errors.length > 0 ? (
                          <p className="mt-1 text-xs text-red-600">{item.validation_errors.join('; ')}</p>
                        ) : null}
                      </td>
                      <td className="px-2 py-2">
                        {item.action ? (
                          (() => {
                            const allowed = getAllowedActions(item);
                            const current = itemOverrides[item.index] ?? item.action;
                            const value = allowed.includes(current as OverrideAction)
                              ? current
                              : allowed[0];
                            return (
                          <select
                            className="rounded border px-1 py-0.5 text-xs"
                            value={value}
                            onChange={(e) =>
                              setItemOverrides((prev) => ({
                                ...prev,
                                [item.index]: e.target.value as OverrideAction,
                              }))
                            }
                          >
                            {allowed.map((action) => (
                              <option key={action} value={action}>
                                {action}
                              </option>
                            ))}
                          </select>
                            );
                          })()
                        ) : (
                          'erro'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setStep('upload')}>Voltar</Button>
              <Button onClick={handleConfirm} disabled={isLoading || hasGlobalParseErrors || hasInvalidItems}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Confirmar import
              </Button>
            </div>
            {hasGlobalParseErrors || hasInvalidItems ? (
              <p className="text-xs text-red-600">
                Corrija os erros do arquivo antes de confirmar o import.
              </p>
            ) : null}
          </div>
        ) : null}

        {step === 'result' && resultData ? (
          <div className="space-y-4">
            <div className="rounded border border-green-300 bg-green-50 p-3 text-sm text-green-800">
              <p className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Import finalizado com status <strong>{resultData.parse_status}</strong>
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              <Badge variant="outline">Criados: {resultData.items_created}</Badge>
              <Badge variant="outline">Atualizados: {resultData.items_updated}</Badge>
              <Badge variant="outline">Pulados: {resultData.items_skipped}</Badge>
              <Badge variant="outline">Falhas: {resultData.items_failed}</Badge>
            </div>
            <div className="max-h-[35vh] overflow-auto rounded border p-2 text-sm">
              {resultData.results.map((r) => (
                <p key={r.index} className="border-b py-1 last:border-b-0">
                  #{r.index} - {r.status} - {r.message}
                </p>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              {projectId ? (
                <Link href={`/projects/${projectId}/imports/history`}>
                  <Button variant="outline">Ver historico</Button>
                </Link>
              ) : null}
              <Button
                onClick={() => {
                  reset();
                  setOpen(false);
                }}
              >
                Fechar
              </Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

