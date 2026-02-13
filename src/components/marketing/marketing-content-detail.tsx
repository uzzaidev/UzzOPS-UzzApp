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
import {
  useApproveMarketingAsset,
  useBatchCreatePublications,
  useDeleteMarketingAsset,
  useMarketingAssets,
  useMarketingContentById,
  useMarketingPublications,
  useUploadMarketingAsset,
  type MarketingChannel,
} from '@/hooks/useMarketing';

const channels: MarketingChannel[] = ['instagram', 'linkedin', 'site', 'tiktok', 'youtube', 'whatsapp'];

export function MarketingContentDetail({ projectId, contentId }: { projectId: string; contentId: string }) {
  const contentQuery = useMarketingContentById(contentId);
  const publicationsQuery = useMarketingPublications({ content_piece_id: contentId });
  const assetsQuery = useMarketingAssets({ content_piece_id: contentId });

  const uploadAsset = useUploadMarketingAsset();
  const deleteAsset = useDeleteMarketingAsset();
  const approveAsset = useApproveMarketingAsset();
  const batchPublication = useBatchCreatePublications();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [batchDate, setBatchDate] = useState(new Date().toISOString().slice(0, 10));
  const [batchChannels, setBatchChannels] = useState<MarketingChannel[]>(['instagram']);

  const content = contentQuery.data;

  function toggleChannel(channel: MarketingChannel, checked: boolean) {
    setBatchChannels((prev) =>
      checked ? Array.from(new Set([...prev, channel])) : prev.filter((v) => v !== channel)
    );
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
        <Button
          variant="outline"
          onClick={() =>
            window.open(`/api/marketing/content/${contentId}/assets/export`, '_blank')
          }
        >
          <Download className="mr-2 h-4 w-4" /> Exportar ZIP
        </Button>
      </div>

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
