'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Megaphone, Plus, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  useBatchCreatePublications,
  useCreateMarketingContent,
  useMarketingContent,
  useTenantProjects,
  type MarketingChannel,
  type MarketingContentStatus,
  type MarketingContentType,
} from '@/hooks/useMarketing';

const statuses: MarketingContentStatus[] = [
  'idea',
  'briefing',
  'production',
  'review',
  'approved',
  'done',
];

const statusLabels: Record<string, string> = {
  idea: 'Ideia',
  briefing: 'Briefing',
  production: 'Producao',
  review: 'Revisao',
  approved: 'Aprovado',
  done: 'Concluido',
  archived: 'Arquivado',
};

const channels: MarketingChannel[] = ['instagram', 'linkedin', 'site', 'tiktok', 'youtube', 'whatsapp'];

export function MarketingContentBoard({ projectId }: { projectId: string }) {
  const [search, setSearch] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<MarketingContentType>('feed');
  const [newBrief, setNewBrief] = useState('');
  const [newProjectScope, setNewProjectScope] = useState<string>('current');
  const [selectedContentId, setSelectedContentId] = useState<string>('');
  const [batchDate, setBatchDate] = useState(new Date().toISOString().slice(0, 10));
  const [batchChannels, setBatchChannels] = useState<MarketingChannel[]>(['instagram']);

  const contentQuery = useMarketingContent({
    project_id: projectId,
    search: search || undefined,
  });
  const createContent = useCreateMarketingContent(projectId);
  const createBatch = useBatchCreatePublications();
  const projectsQuery = useTenantProjects();

  const grouped = useMemo(() => {
    const map = new Map<string, any[]>();
    statuses.forEach((status) => map.set(status, []));
    for (const item of contentQuery.data ?? []) {
      const bucket = map.get(item.status) ?? [];
      bucket.push(item);
      map.set(item.status, bucket);
    }
    return map;
  }, [contentQuery.data]);

  function toggleChannel(channel: MarketingChannel, checked: boolean) {
    setBatchChannels((prev) =>
      checked ? Array.from(new Set([...prev, channel])) : prev.filter((v) => v !== channel)
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-uzzai-primary/10">
            <Megaphone className="h-5 w-5 text-uzzai-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Conteudos</h2>
            <p className="text-sm text-gray-500">Kanban por status + publicacao em lote</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/projects/${projectId}/marketing`}>Voltar ao calendario</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/projects/${projectId}/marketing/acervo`}>Acervo</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/projects/${projectId}/marketing/campanhas`}>Campanhas</Link>
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-1 h-4 w-4" /> Novo conteudo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo conteudo</DialogTitle>
                <DialogDescription>Cria um content_piece para planejamento editorial.</DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label>Titulo</Label>
                  <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
                </div>
                <div>
                  <Label>Tipo</Label>
                  <Select value={newType} onValueChange={(v) => setNewType(v as MarketingContentType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="feed">Feed</SelectItem>
                      <SelectItem value="reels">Reels</SelectItem>
                      <SelectItem value="carrossel">Carrossel</SelectItem>
                      <SelectItem value="stories">Stories</SelectItem>
                      <SelectItem value="artigo">Artigo</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Projeto</Label>
                  <Select value={newProjectScope} onValueChange={setNewProjectScope}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="current">Projeto atual</SelectItem>
                      <SelectItem value="global">Global (sem projeto)</SelectItem>
                      {(projectsQuery.data ?? []).map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.code} - {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Brief</Label>
                  <Textarea value={newBrief} onChange={(e) => setNewBrief(e.target.value)} rows={4} />
                </div>
                <Button
                  className="w-full"
                  disabled={createContent.isPending || !newTitle.trim()}
                  onClick={() =>
                    createContent.mutate({
                      title: newTitle.trim(),
                      content_type: newType,
                      brief: newBrief || null,
                      project_id:
                        newProjectScope === 'global'
                          ? null
                          : newProjectScope === 'current'
                            ? projectId
                            : newProjectScope,
                    })
                  }
                >
                  {createContent.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Salvar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Publicacao em lote</CardTitle>
          <CardDescription>Cria publicacoes para varios canais em um unico passo.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Conteudo</Label>
              <Select value={selectedContentId} onValueChange={setSelectedContentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {(contentQuery.data ?? []).map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.code} - {item.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Data</Label>
              <Input type="date" value={batchDate} onChange={(e) => setBatchDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Canais</Label>
              <div className="grid grid-cols-2 gap-2 rounded-md border p-2">
                {channels.map((channel) => (
                  <label key={channel} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={batchChannels.includes(channel)}
                      onCheckedChange={(checked) => toggleChannel(channel, Boolean(checked))}
                    />
                    {channel}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <Button
            disabled={createBatch.isPending || !selectedContentId || batchChannels.length === 0}
            onClick={() =>
              createBatch.mutate({
                contentId: selectedContentId,
                payload: {
                  channels: batchChannels,
                  scheduled_date: batchDate,
                  status: 'scheduled',
                },
              })
            }
          >
            {createBatch.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Criar publicacoes
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <Input
          placeholder="Buscar por codigo, titulo ou topico..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {contentQuery.isLoading ? (
          <div className="flex h-24 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-uzzai-primary" />
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {statuses.map((status) => (
              <Card key={status}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{statusLabels[status]}</CardTitle>
                  <CardDescription>{grouped.get(status)?.length ?? 0} itens</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {(grouped.get(status) ?? []).map((item) => (
                    <div key={item.id} className="rounded-md border p-2">
                      <p className="text-xs text-muted-foreground">{item.code}</p>
                      <p className="text-sm font-medium">{item.title}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge variant="outline">{item.content_type}</Badge>
                        <Badge variant="outline">{statusLabels[item.status] ?? item.status}</Badge>
                        {item.project?.name ? <Badge variant="outline">{item.project.name}</Badge> : null}
                      </div>
                      <div className="mt-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/projects/${projectId}/marketing/conteudos/${item.id}`}>Detalhe</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
