'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft, Download, Loader2, Upload } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  useApproveMarketingAsset,
  useBatchCreatePublications,
  useDeleteMarketingAsset,
  useMarketingAssets,
  useMarketingContentById,
  useMarketingPublications,
  useUpdateMarketingContent,
  useUploadMarketingAsset,
  type MarketingChannel,
  type MarketingContentStatus,
  type MarketingContentType,
} from '@/hooks/useMarketing';

const channels: MarketingChannel[] = ['instagram', 'linkedin', 'site', 'tiktok', 'youtube', 'whatsapp'];

const statuses: MarketingContentStatus[] = [
  'idea',
  'briefing',
  'production',
  'review',
  'approved',
  'done',
  'archived',
];

const types: MarketingContentType[] = ['feed', 'reels', 'carrossel', 'stories', 'artigo', 'video'];

export function MarketingContentDetail({ projectId, contentId }: { projectId: string; contentId: string }) {
  const contentQuery = useMarketingContentById(contentId);
  const publicationsQuery = useMarketingPublications({ content_piece_id: contentId });
  const assetsQuery = useMarketingAssets({ content_piece_id: contentId });

  const uploadAsset = useUploadMarketingAsset();
  const deleteAsset = useDeleteMarketingAsset();
  const approveAsset = useApproveMarketingAsset();
  const batchPublication = useBatchCreatePublications();
  const updateContent = useUpdateMarketingContent();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [batchDate, setBatchDate] = useState(new Date().toISOString().slice(0, 10));
  const [batchChannels, setBatchChannels] = useState<MarketingChannel[]>(['instagram']);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editType, setEditType] = useState<MarketingContentType>('feed');
  const [editStatus, setEditStatus] = useState<MarketingContentStatus>('idea');
  const [editTopic, setEditTopic] = useState('');
  const [editObjective, setEditObjective] = useState('');
  const [editBrief, setEditBrief] = useState('');
  const [editCaptionBase, setEditCaptionBase] = useState('');
  const [editCta, setEditCta] = useState('');
  const [editHashtags, setEditHashtags] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editNotes, setEditNotes] = useState('');

  const content = contentQuery.data;

  function toggleChannel(channel: MarketingChannel, checked: boolean) {
    setBatchChannels((prev) =>
      checked ? Array.from(new Set([...prev, channel])) : prev.filter((v) => v !== channel)
    );
  }

  function openEditModal() {
    if (!content) return;
    setEditTitle(content.title ?? '');
    setEditType(content.content_type);
    setEditStatus(content.status);
    setEditTopic(content.topic ?? '');
    setEditObjective(content.objective ?? '');
    setEditBrief(content.brief ?? '');
    setEditCaptionBase(content.caption_base ?? '');
    setEditCta(content.cta ?? '');
    setEditHashtags((content.hashtags ?? []).join(', '));
    setEditDueDate(content.due_date ? String(content.due_date).slice(0, 10) : '');
    setEditNotes(content.notes ?? '');
    setIsEditOpen(true);
  }

  if (contentQuery.isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-uzzai-primary" />
      </div>
    );
  }

  if (!content) {
    return <p className="text-sm text-muted-foreground">Conteudo nao encontrado.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Link href={`/projects/${projectId}/marketing/conteudos`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-1 h-4 w-4" /> Voltar
          </Link>
          <h2 className="text-2xl font-bold">{content.code} - {content.title}</h2>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{content.content_type}</Badge>
            <Badge variant="outline">{content.status}</Badge>
            {content.project?.name ? <Badge variant="outline">{content.project.name}</Badge> : <Badge variant="outline">Global</Badge>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={openEditModal}>
            Editar conteudo
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              window.open(`/api/marketing/content/${contentId}/assets/export`, '_blank')
            }
          >
            <Download className="mr-2 h-4 w-4" /> Exportar ZIP
          </Button>
        </div>
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar conteudo</DialogTitle>
            <DialogDescription>Atualize os dados principais e de planejamento editorial.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Titulo</Label>
              <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <Label>Tipo</Label>
                <Select value={editType} onValueChange={(v) => setEditType(v as MarketingContentType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {types.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={editStatus} onValueChange={(v) => setEditStatus(v as MarketingContentStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <Label>Topico</Label>
                <Input value={editTopic} onChange={(e) => setEditTopic(e.target.value)} />
              </div>
              <div>
                <Label>Objetivo</Label>
                <Input value={editObjective} onChange={(e) => setEditObjective(e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Brief</Label>
              <Textarea value={editBrief} onChange={(e) => setEditBrief(e.target.value)} rows={4} />
            </div>
            <div>
              <Label>Caption base</Label>
              <Textarea value={editCaptionBase} onChange={(e) => setEditCaptionBase(e.target.value)} rows={3} />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <Label>CTA</Label>
                <Input value={editCta} onChange={(e) => setEditCta(e.target.value)} />
              </div>
              <div>
                <Label>Data limite</Label>
                <Input type="date" value={editDueDate} onChange={(e) => setEditDueDate(e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Hashtags (separadas por virgula)</Label>
              <Input value={editHashtags} onChange={(e) => setEditHashtags(e.target.value)} />
            </div>
            <div>
              <Label>Notas</Label>
              <Textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)} rows={3} />
            </div>
            <Button
              className="w-full"
              disabled={updateContent.isPending || !editTitle.trim()}
              onClick={() =>
                updateContent.mutate(
                  {
                    id: contentId,
                    payload: {
                      title: editTitle.trim(),
                      content_type: editType,
                      status: editStatus,
                      topic: editTopic.trim() || null,
                      objective: editObjective.trim() || null,
                      brief: editBrief.trim() || null,
                      caption_base: editCaptionBase.trim() || null,
                      cta: editCta.trim() || null,
                      due_date: editDueDate || null,
                      hashtags: editHashtags
                        .split(',')
                        .map((tag) => tag.trim())
                        .filter(Boolean),
                      notes: editNotes.trim() || null,
                    },
                  },
                  {
                    onSuccess: () => setIsEditOpen(false),
                  }
                )
              }
            >
              {updateContent.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Salvar alteracoes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informacoes</CardTitle>
            <CardDescription>Briefing e definicao do conteudo.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><span className="text-muted-foreground">Topico:</span> {content.topic ?? '-'}</p>
            <p><span className="text-muted-foreground">Objetivo:</span> {content.objective ?? '-'}</p>
            <p><span className="text-muted-foreground">Brief:</span> {content.brief ?? '-'}</p>
            <p><span className="text-muted-foreground">Caption base:</span> {content.caption_base ?? '-'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Publicacao em lote</CardTitle>
            <CardDescription>Criar publicacoes por canal para este conteudo.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Data</Label>
              <Input type="date" value={batchDate} onChange={(e) => setBatchDate(e.target.value)} />
            </div>
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
            <Button
              disabled={batchPublication.isPending || batchChannels.length === 0}
              onClick={() =>
                batchPublication.mutate({
                  contentId,
                  payload: { channels: batchChannels, scheduled_date: batchDate, status: 'scheduled' },
                })
              }
            >
              {batchPublication.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Criar publicacoes
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Publicacoes vinculadas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {(publicationsQuery.data ?? []).map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded border px-3 py-2 text-sm">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{item.channel}</Badge>
                <span>{item.scheduled_date}</span>
              </div>
              <Badge variant="outline">{item.status}</Badge>
            </div>
          ))}
          {(publicationsQuery.data ?? []).length === 0 ? <p className="text-sm text-muted-foreground">Sem publicacoes.</p> : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Assets do conteudo</CardTitle>
          <CardDescription>Upload rapido e gestao dos arquivos do acervo.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2 md:flex-row">
            <Input type="file" onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)} />
            <Button
              disabled={!selectedFile || uploadAsset.isPending}
              onClick={() =>
                selectedFile &&
                uploadAsset.mutate({
                  file: selectedFile,
                  content_piece_id: contentId,
                  asset_type: selectedFile.type.startsWith('image/')
                    ? 'image'
                    : selectedFile.type.startsWith('video/')
                      ? 'video'
                      : 'document',
                })
              }
            >
              {uploadAsset.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              Upload
            </Button>
          </div>

          <div className="grid gap-2 md:grid-cols-2">
            {(assetsQuery.data ?? []).map((asset) => (
              <div key={asset.id} className="rounded border p-3">
                <p className="text-sm font-medium">{asset.file_name}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{asset.asset_type}</Badge>
                  <Badge variant="outline">{asset.is_approved ? 'aprovado' : 'pendente'}</Badge>
                </div>
                <div className="mt-3 flex gap-2">
                  {asset.download_url ? (
                    <Button variant="outline" size="sm" asChild>
                      <a href={asset.download_url} target="_blank" rel="noreferrer">Abrir</a>
                    </Button>
                  ) : null}
                  <Button variant="outline" size="sm" onClick={() => approveAsset.mutate(asset.id)}>
                    Aprovar
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => deleteAsset.mutate(asset.id)}>
                    Excluir
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
