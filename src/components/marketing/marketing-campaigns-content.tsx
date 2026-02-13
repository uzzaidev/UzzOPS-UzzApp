'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft, Loader2, Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  useCreateMarketingCampaign,
  useCreateMarketingChannel,
  useMarketingCampaigns,
  useMarketingChannels,
  useTenantProjects,
} from '@/hooks/useMarketing';

export function MarketingCampaignsContent({ projectId }: { projectId: string }) {
  const [search, setSearch] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState<'active' | 'draft' | 'completed' | 'archived'>('draft');
  const [scopeProjectId, setScopeProjectId] = useState<string>('current');
  const [channelName, setChannelName] = useState('');
  const [channelPlatform, setChannelPlatform] = useState<'instagram' | 'linkedin' | 'tiktok' | 'youtube' | 'site' | 'whatsapp' | 'other'>('instagram');

  const campaignsQuery = useMarketingCampaigns({
    project_id: projectId,
    search: search || undefined,
  });
  const createCampaign = useCreateMarketingCampaign();
  const createChannel = useCreateMarketingChannel();
  const channelsQuery = useMarketingChannels();
  const projectsQuery = useTenantProjects();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Link href={`/projects/${projectId}/marketing`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-1 h-4 w-4" /> Voltar ao marketing
          </Link>
          <h2 className="text-2xl font-bold">Campanhas</h2>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-1 h-4 w-4" /> Nova campanha
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova campanha</DialogTitle>
              <DialogDescription>Cadastro rapido de campanha editorial.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Nome</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <Label>Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">draft</SelectItem>
                    <SelectItem value="active">active</SelectItem>
                    <SelectItem value="completed">completed</SelectItem>
                    <SelectItem value="archived">archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Projeto</Label>
                <Select value={scopeProjectId} onValueChange={setScopeProjectId}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current">Projeto atual</SelectItem>
                    <SelectItem value="global">Global</SelectItem>
                    {(projectsQuery.data ?? []).map((project) => (
                      <SelectItem key={project.id} value={project.id}>{project.code} - {project.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                className="w-full"
                disabled={createCampaign.isPending || !name.trim()}
                onClick={() =>
                  createCampaign.mutate({
                    name: name.trim(),
                    status,
                    project_id:
                      scopeProjectId === 'global' ? null : scopeProjectId === 'current' ? projectId : scopeProjectId,
                  })
                }
              >
                {createCampaign.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Salvar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Input
        placeholder="Buscar campanha..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {campaignsQuery.isLoading ? (
        <div className="flex h-24 items-center justify-center">
          <Loader2 className="h-7 w-7 animate-spin text-uzzai-primary" />
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {(campaignsQuery.data ?? []).map((campaign) => (
            <Card key={campaign.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{campaign.name}</CardTitle>
                <CardDescription>{campaign.project?.name ?? 'Global'}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{campaign.status}</Badge>
                  <Badge variant="outline">{campaign.objective ?? '-'}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{campaign.description ?? 'Sem descricao'}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Canais</CardTitle>
          <CardDescription>Configuracao de canais de publicacao.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <Input placeholder="Nome do canal" value={channelName} onChange={(e) => setChannelName(e.target.value)} />
            <Select value={channelPlatform} onValueChange={(v) => setChannelPlatform(v as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="instagram">instagram</SelectItem>
                <SelectItem value="linkedin">linkedin</SelectItem>
                <SelectItem value="tiktok">tiktok</SelectItem>
                <SelectItem value="youtube">youtube</SelectItem>
                <SelectItem value="site">site</SelectItem>
                <SelectItem value="whatsapp">whatsapp</SelectItem>
                <SelectItem value="other">other</SelectItem>
              </SelectContent>
            </Select>
            <Button
              disabled={createChannel.isPending || !channelName.trim()}
              onClick={() =>
                createChannel.mutate({
                  name: channelName.trim(),
                  platform: channelPlatform,
                })
              }
            >
              {createChannel.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Criar canal
            </Button>
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            {(channelsQuery.data ?? []).map((channel) => (
              <div key={channel.id} className="rounded border p-2">
                <p className="text-sm font-medium">{channel.name}</p>
                <div className="mt-1 flex gap-2">
                  <Badge variant="outline">{channel.platform}</Badge>
                  <Badge variant="outline">{channel.is_active ? 'ativo' : 'inativo'}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
