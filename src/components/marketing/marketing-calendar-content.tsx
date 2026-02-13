'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, type ComponentType } from 'react';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Megaphone,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CheckCircle2,
  XCircle,
  Download,
  Instagram,
  Linkedin,
  Globe,
  Music2,
  Youtube,
  MessageCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  useCreateMarketingPublication,
  useMarketingDashboard,
  useMarketingPublications,
  useMarketingStats,
  useUpdateMarketingPublication,
  type MarketingChannel,
  type MarketingContentType,
  type MarketingPublication,
} from '@/hooks/useMarketing';

interface Props {
  projectId: string;
}

const typeColors: Record<string, string> = {
  reels: 'bg-blue-100 text-blue-800 border-blue-200',
  feed: 'bg-purple-100 text-purple-800 border-purple-200',
  carrossel: 'bg-green-100 text-green-800 border-green-200',
  stories: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  artigo: 'bg-slate-100 text-slate-800 border-slate-200',
  video: 'bg-red-100 text-red-800 border-red-200',
};

const channelBadge: Record<string, string> = {
  instagram: 'In',
  linkedin: 'Li',
  site: 'Si',
  tiktok: 'Tk',
  youtube: 'Yt',
  whatsapp: 'Wa',
};

const channelColors: Record<string, string> = {
  instagram: 'border-pink-200 bg-pink-50 text-pink-700',
  linkedin: 'border-blue-200 bg-blue-50 text-blue-700',
  site: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  tiktok: 'border-slate-200 bg-slate-100 text-slate-700',
  youtube: 'border-red-200 bg-red-50 text-red-700',
  whatsapp: 'border-green-200 bg-green-50 text-green-700',
};

const channelIcons: Record<string, ComponentType<{ className?: string }>> = {
  instagram: Instagram,
  linkedin: Linkedin,
  site: Globe,
  tiktok: Music2,
  youtube: Youtube,
  whatsapp: MessageCircle,
};

export function MarketingCalendarContent({ projectId }: Props) {
  const [monthDate, setMonthDate] = useState(new Date());
  const [channel, setChannel] = useState<string>('all');
  const [contentType, setContentType] = useState<string>('all');
  const [status, setStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [search, setSearch] = useState('');
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [selectedPublication, setSelectedPublication] = useState<MarketingPublication | null>(null);
  const [editDate, setEditDate] = useState('');
  const [editStatus, setEditStatus] = useState<'idea' | 'draft' | 'scheduled' | 'published' | 'cancelled'>('scheduled');
  const [editExternalUrl, setEditExternalUrl] = useState('');

  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<MarketingContentType>('feed');
  const [newChannel, setNewChannel] = useState<MarketingChannel>('instagram');
  const [newDate, setNewDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const monthStart = startOfMonth(monthDate);
  const monthEnd = endOfMonth(monthDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const monthKey = format(monthDate, 'yyyy-MM');
  const from = format(monthStart, 'yyyy-MM-dd');
  const to = format(monthEnd, 'yyyy-MM-dd');

  const publicationsQuery = useMarketingPublications({
    from,
    to,
    channel: channel === 'all' ? undefined : channel,
    status: status === 'all' ? undefined : status,
    content_type: contentType === 'all' ? undefined : contentType,
    search: search || undefined,
    project_id: projectId,
  });
  const statsQuery = useMarketingStats(monthKey, projectId);
  const dashboardQuery = useMarketingDashboard(monthKey, projectId);
  const createPublication = useCreateMarketingPublication(projectId);
  const updatePublication = useUpdateMarketingPublication();

  const publications = publicationsQuery.data ?? [];
  const grouped = useMemo(() => {
    const map = new Map<string, MarketingPublication[]>();
    for (const item of publications) {
      const key = item.scheduled_date;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    }
    return map;
  }, [publications]);

  function movePublicationToDate(id: string, scheduledDate: string) {
    updatePublication.mutate({
      id,
      payload: { scheduled_date: scheduledDate, status: 'scheduled' },
    });
  }

  useEffect(() => {
    if (!selectedPublication) return;
    setEditDate(selectedPublication.scheduled_date);
    setEditStatus(selectedPublication.status);
    setEditExternalUrl(selectedPublication.external_url ?? '');
  }, [selectedPublication]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-2xl font-bold">{statsQuery.data?.total ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground">Agendados</p>
            <p className="text-2xl font-bold">{statsQuery.data?.scheduled ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground">Publicados</p>
            <p className="text-2xl font-bold">{statsQuery.data?.published ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground">Cancelados</p>
            <p className="text-2xl font-bold">{statsQuery.data?.cancelled ?? 0}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground">Posts vs mes anterior</p>
            <p className="text-2xl font-bold">
              {dashboardQuery.data?.posts_delta_pct == null ? '-' : `${dashboardQuery.data.posts_delta_pct}%`}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground">Taxa publicado no prazo</p>
            <p className="text-2xl font-bold">
              {dashboardQuery.data?.publication_on_time_rate == null ? '-' : `${dashboardQuery.data.publication_on_time_rate}%`}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground">Assets no acervo (mesmo filtro)</p>
            <p className="text-2xl font-bold">
              {Object.values(dashboardQuery.data?.assets_by_type ?? {}).reduce((sum, count) => sum + count, 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-uzzai-primary" /> Calendario Editorial
              </CardTitle>
              <CardDescription>Planejamento mensal por canal e tipo</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  const params = new URLSearchParams({ month: monthKey, project_id: projectId });
                  window.open(`/api/marketing/publications/export?${params.toString()}`, '_blank');
                }}
              >
                <Download className="mr-2 h-4 w-4" /> Exportar CSV
              </Button>
              <Button variant="outline" asChild>
                <Link href={`/projects/${projectId}/marketing/conteudos`}>Conteudos</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href={`/projects/${projectId}/marketing/acervo`}>Acervo</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href={`/projects/${projectId}/marketing/campanhas`}>Campanhas</Link>
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>+ Nova Publicacao</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Nova Publicacao</DialogTitle>
                    <DialogDescription>Cria um conteudo simples e agenda no calendario.</DialogDescription>
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
                      <Label>Canal</Label>
                      <Select value={newChannel} onValueChange={(v) => setNewChannel(v as MarketingChannel)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="instagram">Instagram</SelectItem>
                          <SelectItem value="linkedin">LinkedIn</SelectItem>
                          <SelectItem value="site">Site</SelectItem>
                          <SelectItem value="tiktok">TikTok</SelectItem>
                          <SelectItem value="youtube">YouTube</SelectItem>
                          <SelectItem value="whatsapp">WhatsApp</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Data</Label>
                      <Input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
                    </div>
                    <Button
                      className="w-full"
                      disabled={createPublication.isPending || !newTitle.trim()}
                      onClick={() =>
                        createPublication.mutate({
                          title: newTitle.trim(),
                          content_type: newType,
                          channel: newChannel,
                          scheduled_date: newDate,
                          status: 'scheduled',
                        })
                      }
                    >
                      {createPublication.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      Salvar
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => setMonthDate((d) => subMonths(d, 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <p className="min-w-52 text-center text-sm font-medium">
                {format(monthDate, "MMMM 'de' yyyy", { locale: ptBR })}
              </p>
              <Button variant="outline" size="icon" onClick={() => setMonthDate((d) => addMonths(d, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-col gap-2 md:flex-row">
              <Input placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} />
              <Select value={channel} onValueChange={setChannel}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Canal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos canais</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="site">Site</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                </SelectContent>
              </Select>
              <Select value={contentType} onValueChange={setContentType}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos tipos</SelectItem>
                  <SelectItem value="feed">Feed</SelectItem>
                  <SelectItem value="reels">Reels</SelectItem>
                  <SelectItem value="carrossel">Carrossel</SelectItem>
                  <SelectItem value="stories">Stories</SelectItem>
                  <SelectItem value="artigo">Artigo</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                </SelectContent>
              </Select>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos status</SelectItem>
                  <SelectItem value="idea">Ideia</SelectItem>
                  <SelectItem value="draft">Rascunho</SelectItem>
                  <SelectItem value="scheduled">Agendado</SelectItem>
                  <SelectItem value="published">Publicado</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center rounded-md border p-1">
                <Button
                  variant={viewMode === 'calendar' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('calendar')}
                >
                  Calendario
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  Lista
                </Button>
              </div>
            </div>
          </div>

          {publicationsQuery.isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-uzzai-primary" />
            </div>
          ) : viewMode === 'calendar' ? (
            <div className="grid grid-cols-7 gap-2">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'].map((d) => (
                <div key={d} className="p-2 text-center text-xs font-semibold text-muted-foreground">
                  {d}
                </div>
              ))}
              {days.map((day) => {
                const key = format(day, 'yyyy-MM-dd');
                const dayItems = grouped.get(key) ?? [];
                return (
                  <div
                    key={key}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => draggingId && movePublicationToDate(draggingId, key)}
                    className={`min-h-28 rounded-md border p-2 ${isSameMonth(day, monthDate) ? 'bg-white' : 'bg-gray-50 opacity-60'}`}
                  >
                    <p className="mb-1 text-xs font-medium">{format(day, 'd')}</p>
                    <div className="space-y-1">
                      {dayItems.slice(0, 3).map((item) => {
                        const ChannelIcon = channelIcons[item.channel] ?? Globe;
                        return (
                          <button
                            key={item.id}
                            onClick={() => setSelectedPublication(item)}
                            draggable
                            onDragStart={() => setDraggingId(item.id)}
                            onDragEnd={() => setDraggingId(null)}
                            className={`w-full rounded border px-1 py-0.5 text-left text-[10px] ${typeColors[item.content_piece?.content_type ?? 'feed'] ?? 'bg-slate-100'} ${item.status === 'published' ? 'ring-1 ring-emerald-500/60' : ''} ${item.status === 'cancelled' ? 'ring-1 ring-red-500/60 opacity-80' : ''}`}
                          >
                            <span className={`mr-1 inline-flex items-center gap-1 rounded border px-1 ${channelColors[item.channel] ?? 'border-slate-200 bg-slate-100 text-slate-700'}`}>
                              <ChannelIcon className="h-2.5 w-2.5" />
                              <span className="font-bold">{channelBadge[item.channel] ?? 'Ch'}</span>
                            </span>
                            {item.content_piece?.title ?? 'Sem titulo'}
                            {item.status === 'published' ? (
                              <CheckCircle2 className="ml-1 inline h-3 w-3 text-emerald-600" />
                            ) : null}
                            {item.status === 'cancelled' ? (
                              <XCircle className="ml-1 inline h-3 w-3 text-red-600" />
                            ) : null}
                          </button>
                        );
                      })}
                      {dayItems.length > 3 && (
                        <p className="text-[10px] text-muted-foreground">+{dayItems.length - 3} mais</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2">
              {(publicationsQuery.data ?? []).map((item) => {
                const ChannelIcon = channelIcons[item.channel] ?? Globe;
                return (
                  <button
                    key={item.id}
                    className="w-full rounded-md border p-3 text-left hover:bg-muted/30"
                    onClick={() => setSelectedPublication(item)}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">{item.content_piece?.code ?? 'MKT'} - {item.channel}</p>
                        <p className="text-sm font-medium">{item.content_piece?.title ?? 'Sem titulo'}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={channelColors[item.channel] ?? ''}>
                          <ChannelIcon className="mr-1 h-3 w-3" />
                          {item.channel}
                        </Badge>
                        <Badge variant="outline">{item.status}</Badge>
                        <Badge variant="outline">{item.scheduled_date}</Badge>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedPublication ? (
        <div className="fixed right-0 top-0 z-50 h-full w-full max-w-md border-l bg-background p-4 shadow-xl">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold">{selectedPublication.content_piece?.title ?? 'Publicacao'}</h3>
              <p className="text-sm text-muted-foreground">
                {selectedPublication.content_piece?.code} - {selectedPublication.channel}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setSelectedPublication(null)}>Fechar</Button>
          </div>
          <div className="space-y-3 text-sm">
            <p>
              <span className="text-muted-foreground">Tipo:</span> {selectedPublication.content_piece?.content_type}
            </p>
            <div>
              <Label>Data</Label>
              <Input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={editStatus} onValueChange={(v) => setEditStatus(v as typeof editStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="idea">Ideia</SelectItem>
                  <SelectItem value="draft">Rascunho</SelectItem>
                  <SelectItem value="scheduled">Agendado</SelectItem>
                  <SelectItem value="published">Publicado</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>URL externa</Label>
              <Input
                placeholder="https://..."
                value={editExternalUrl}
                onChange={(e) => setEditExternalUrl(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{selectedPublication.status}</Badge>
              {selectedPublication.status === 'published' ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              ) : null}
              {selectedPublication.status === 'cancelled' ? (
                <XCircle className="h-4 w-4 text-red-600" />
              ) : null}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() =>
                  updatePublication.mutate(
                    {
                      id: selectedPublication.id,
                      payload: {
                        scheduled_date: editDate,
                        status: editStatus,
                        external_url: editExternalUrl || null,
                      },
                    },
                    {
                      onSuccess: () => setSelectedPublication(null),
                    }
                  )
                }
                disabled={updatePublication.isPending}
              >
                Salvar alteracoes
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  updatePublication.mutate({
                    id: selectedPublication.id,
                    payload: { status: 'published' },
                  })
                }
                disabled={updatePublication.isPending || selectedPublication.status === 'published'}
              >
                Marcar publicado
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Distribuicoes do mes</CardTitle>
          <CardDescription>Visao consolidada por canal, tipo e acervo.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div>
            <p className="mb-2 text-xs text-muted-foreground">Por canal</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(dashboardQuery.data?.by_channel ?? {}).map(([key, value]) => (
                <Badge key={key} variant="outline" className={channelColors[key] ?? ''}>
                  {key}: {value}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs text-muted-foreground">Por tipo de conteudo</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(dashboardQuery.data?.by_type ?? {}).map(([key, value]) => (
                <Badge key={key} variant="outline" className={typeColors[key] ?? ''}>
                  {key}: {value}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs text-muted-foreground">Assets por tipo</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(dashboardQuery.data?.assets_by_type ?? {}).map(([key, value]) => (
                <Badge key={key} variant="outline">
                  {key}: {value}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
