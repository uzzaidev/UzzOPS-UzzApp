'use client';

import Link from 'next/link';
import { useMemo, useRef, useState } from 'react';
import { ArrowLeft, Loader2, Upload } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  useApproveMarketingAsset,
  useDeleteMarketingAsset,
  useMarketingAssets,
  useMarketingContent,
  useUploadMarketingAsset,
  type MarketingAssetType,
} from '@/hooks/useMarketing';

const assetTypes: MarketingAssetType[] = [
  'image',
  'video',
  'carousel_slide',
  'caption',
  'copy',
  'audio',
  'reference',
  'document',
];

export function MarketingAssetsContent({ projectId }: { projectId: string }) {
  const [contentPieceId, setContentPieceId] = useState<string>('all');
  const [assetType, setAssetType] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [approvedFilter, setApprovedFilter] = useState<string>('all');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadType, setUploadType] = useState<MarketingAssetType>('image');
  const [uploadContentId, setUploadContentId] = useState<string>('global');
  const [uploadCaptionChannel, setUploadCaptionChannel] = useState<string>('none');
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const contentQuery = useMarketingContent({ project_id: projectId });
  const assetsQuery = useMarketingAssets({
    project_id: projectId,
    content_piece_id: contentPieceId === 'all' ? undefined : contentPieceId,
    asset_type: assetType === 'all' ? undefined : assetType,
    approved:
      approvedFilter === 'all' ? undefined : approvedFilter === 'approved' ? true : false,
    search: search || undefined,
  });
  const uploadAsset = useUploadMarketingAsset();
  const deleteAsset = useDeleteMarketingAsset();
  const approveAsset = useApproveMarketingAsset();

  const groupedByType = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of assetsQuery.data ?? []) {
      map.set(item.asset_type, (map.get(item.asset_type) ?? 0) + 1);
    }
    return map;
  }, [assetsQuery.data]);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <Link href={`/projects/${projectId}/marketing`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-1 h-4 w-4" /> Voltar ao marketing
        </Link>
        <h2 className="text-2xl font-bold">Acervo de conteudo</h2>
        <p className="text-sm text-muted-foreground">Galeria de assets com upload e filtros.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload</CardTitle>
          <CardDescription>Associe o arquivo a um conteudo ou deixe como global.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-4">
          <div className="space-y-2 md:col-span-2">
            <Label>Arquivo</Label>
            <div
              role="button"
              tabIndex={0}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (file) setUploadFile(file);
              }}
              className="flex min-h-20 cursor-pointer items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground hover:bg-muted/40"
            >
              {uploadFile ? uploadFile.name : 'Arraste arquivo aqui ou clique para selecionar'}
            </div>
            <Input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
            />
          </div>
          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select value={uploadType} onValueChange={(v) => setUploadType(v as MarketingAssetType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {assetTypes.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Conteudo</Label>
            <Select value={uploadContentId} onValueChange={setUploadContentId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="global">Global</SelectItem>
                {(contentQuery.data ?? []).map((item) => (
                  <SelectItem key={item.id} value={item.id}>{item.code} - {item.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Canal (copy/legenda)</Label>
            <Select value={uploadCaptionChannel} onValueChange={setUploadCaptionChannel}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nao se aplica</SelectItem>
                <SelectItem value="instagram">instagram</SelectItem>
                <SelectItem value="linkedin">linkedin</SelectItem>
                <SelectItem value="site">site</SelectItem>
                <SelectItem value="tiktok">tiktok</SelectItem>
                <SelectItem value="youtube">youtube</SelectItem>
                <SelectItem value="whatsapp">whatsapp</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-4">
            <Button
              disabled={!uploadFile || uploadAsset.isPending}
              onClick={() =>
                uploadFile &&
                uploadAsset.mutate({
                  file: uploadFile,
                  asset_type: uploadType,
                  content_piece_id: uploadContentId === 'global' ? null : uploadContentId,
                  caption_channel: uploadCaptionChannel === 'none' ? null : (uploadCaptionChannel as any),
                })
              }
            >
              {uploadAsset.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              Enviar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <Input
            placeholder="Buscar por arquivo/conteudo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select value={contentPieceId} onValueChange={setContentPieceId}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos conteudos</SelectItem>
              {(contentQuery.data ?? []).map((item) => (
                <SelectItem key={item.id} value={item.id}>{item.code} - {item.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={assetType} onValueChange={setAssetType}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos tipos</SelectItem>
              {assetTypes.map((type) => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={approvedFilter} onValueChange={setApprovedFilter}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos status</SelectItem>
              <SelectItem value="approved">Aprovados</SelectItem>
              <SelectItem value="pending">Pendentes</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        {assetTypes.map((type) => (
          <Badge key={type} variant="outline">
            {type}: {groupedByType.get(type) ?? 0}
          </Badge>
        ))}
      </div>

      {assetsQuery.isLoading ? (
        <div className="flex h-28 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-uzzai-primary" />
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {(assetsQuery.data ?? []).map((asset) => (
            <Card key={asset.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{asset.file_name}</CardTitle>
                <CardDescription>{asset.content_piece?.title ?? 'Global'}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{asset.asset_type}</Badge>
                  <Badge variant="outline">{asset.is_approved ? 'aprovado' : 'pendente'}</Badge>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setSelectedAssetId(asset.id)}>
                    Preview
                  </Button>
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
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selectedAssetId} onOpenChange={(open) => !open && setSelectedAssetId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Preview do asset</DialogTitle>
          </DialogHeader>
          {(() => {
            const asset = (assetsQuery.data ?? []).find((item) => item.id === selectedAssetId);
            if (!asset) return null;

            if (asset.download_url && (asset.mime_type ?? '').startsWith('image/')) {
              return (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={asset.download_url} alt={asset.file_name} className="max-h-[70vh] w-full rounded object-contain" />
              );
            }
            if (asset.download_url && (asset.mime_type ?? '').startsWith('video/')) {
              return (
                <video controls className="max-h-[70vh] w-full rounded">
                  <source src={asset.download_url} type={asset.mime_type ?? 'video/mp4'} />
                </video>
              );
            }
            return (
              <div className="space-y-2 text-sm">
                <p><strong>Arquivo:</strong> {asset.file_name}</p>
                <p><strong>Tipo:</strong> {asset.asset_type}</p>
                <p><strong>MIME:</strong> {asset.mime_type ?? '-'}</p>
                {asset.download_url ? (
                  <a className="text-primary underline" href={asset.download_url} target="_blank" rel="noreferrer">
                    Abrir arquivo
                  </a>
                ) : null}
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
