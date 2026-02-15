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
  useUpdateMarketingCampaign,
  useUpdateMarketingChannel,
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
  const updateCampaign = useUpdateMarketingCampaign();
  const createChannel = useCreateMarketingChannel();
  const updateChannel = useUpdateMarketingChannel();
  const channelsQuery = useMarketingChannels();
  const projectsQuery = useTenantProjects();
  const [editCampaignId, setEditCampaignId] = useState<string | null>(null);
  const [campaignDraft, setCampaignDraft] = useState({
    name: '',
    description: '',
    objective: '',
    status: 'draft' as 'active' | 'draft' | 'completed' | 'archived',
  });
  const [editChannelId, setEditChannelId] = useState<string | null>(null);
  const [channelDraft, setChannelDraft] = useState({
    name: '',
    profile_url: '',
  });

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
                <div className="pt-1">
                  <Dialog
                    open={editCampaignId === campaign.id}
                    onOpenChange={(open) => setEditCampaignId(open ? campaign.id : null)}
                  >
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setCampaignDraft({
                            name: campaign.name ?? '',
                            description: campaign.description ?? '',
                            objective: campaign.objective ?? '',
                            status: (campaign.status as any) ?? 'draft',
                          });
                          setEditCampaignId(campaign.id);
                        }}
                      >
                        Editar
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Editar campanha</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-2">
                        <Input
                          placeholder="Nome"
                          value={campaignDraft.name}
                          onChange={(e) => setCampaignDraft((p) => ({ ...p, name: e.target.value }))}
                        />
                        <Input
                          placeholder="Objetivo"
                          value={campaignDraft.objective}
                          onChange={(e) => setCampaignDraft((p) => ({ ...p, objective: e.target.value }))}
                        />
                        <Select
                          value={campaignDraft.status}
                          onValueChange={(v) =>
                            setCampaignDraft((p) => ({
                              ...p,
                              status: v as 'active' | 'draft' | 'completed' | 'archived',
                            }))
                          }
                        >
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="draft">draft</SelectItem>
                            <SelectItem value="active">active</SelectItem>
                            <SelectItem value="completed">completed</SelectItem>
                            <SelectItem value="archived">archived</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          placeholder="Descricao"
                          value={campaignDraft.description}
                          onChange={(e) => setCampaignDraft((p) => ({ ...p, description: e.target.value }))}
                        />
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setEditCampaignId(null)}>Cancelar</Button>
                          <Button
                            disabled={updateCampaign.isPending || !campaignDraft.name.trim()}
                            onClick={() =>
                              updateCampaign.mutate(
                                {
                                  id: campaign.id,
                                  payload: {
                                    name: campaignDraft.name.trim(),
                                    objective: campaignDraft.objective.trim() || null,
                                    description: campaignDraft.description.trim() || null,
                                    status: campaignDraft.status,
                                  },
                                },
                                { onSuccess: () => setEditCampaignId(null) }
                              )
                            }
                          >
                            {updateCampaign.isPending ? 'Salvando...' : 'Salvar'}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
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
                <div className="mt-2 flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      updateChannel.mutate({
                        id: channel.id,
                        payload: { is_active: !channel.is_active },
                      })
                    }
                  >
                    {channel.is_active ? 'Desativar' : 'Ativar'}
                  </Button>
                  <Dialog
                    open={editChannelId === channel.id}
                    onOpenChange={(open) => setEditChannelId(open ? channel.id : null)}
                  >
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setChannelDraft({
                            name: channel.name ?? '',
                            profile_url: channel.profile_url ?? '',
                          });
                          setEditChannelId(channel.id);
                        }}
                      >
                        Editar
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Editar canal</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-2">
                        <Input
                          placeholder="Nome"
                          value={channelDraft.name}
                          onChange={(e) => setChannelDraft((p) => ({ ...p, name: e.target.value }))}
                        />
                        <Input
                          placeholder="URL do perfil"
                          value={channelDraft.profile_url}
                          onChange={(e) => setChannelDraft((p) => ({ ...p, profile_url: e.target.value }))}
                        />
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setEditChannelId(null)}>Cancelar</Button>
                          <Button
                            disabled={updateChannel.isPending || !channelDraft.name.trim()}
                            onClick={() =>
                              updateChannel.mutate(
                                {
                                  id: channel.id,
                                  payload: {
                                    name: channelDraft.name.trim(),
                                    profile_url: channelDraft.profile_url.trim() || null,
                                  },
                                },
                                { onSuccess: () => setEditChannelId(null) }
                              )
                            }
                          >
                            {updateChannel.isPending ? 'Salvando...' : 'Salvar'}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
