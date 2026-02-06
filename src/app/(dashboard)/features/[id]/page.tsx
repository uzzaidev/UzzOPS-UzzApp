'use client';

import { use } from 'react';
import { useFeature } from '@/hooks/useFeatures';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Edit, Trash, CheckCircle2, Circle } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const statusLabels: Record<string, string> = {
  backlog: 'Backlog',
  todo: 'To Do',
  in_progress: 'Em Progresso',
  review: 'Em Revisão',
  testing: 'Em Testes',
  done: 'Concluído',
  blocked: 'Bloqueado',
};

const versionColors: Record<string, string> = {
  MVP: 'bg-uzzai-primary text-white',
  V1: 'bg-uzzai-secondary text-white',
  V2: 'bg-uzzai-warning text-white',
  V3: 'bg-purple-500 text-white',
  V4: 'bg-pink-500 text-white',
};

const priorityColors: Record<string, string> = {
  P0: 'bg-red-500 text-white',
  P1: 'bg-orange-500 text-white',
  P2: 'bg-blue-500 text-white',
  P3: 'bg-gray-500 text-white',
};

export default function FeatureDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data, isLoading, error } = useFeature(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-uzzai-primary" />
      </div>
    );
  }

  if (error || !data?.data) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" asChild>
          <Link href="/features">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Link>
        </Button>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">Feature não encontrada.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const feature = data.data;

  const dodItems = [
    { key: 'dod_functional', label: 'Funcionando' },
    { key: 'dod_tests', label: 'Testes' },
    { key: 'dod_code_review', label: 'Code Review' },
    { key: 'dod_documentation', label: 'Documentação' },
    { key: 'dod_deployed', label: 'Deployed' },
    { key: 'dod_user_acceptance', label: 'Aceite do Usuário' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/features">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para Features
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">{feature.code}</h1>
            <Badge className={versionColors[feature.version]}>{feature.version}</Badge>
            <Badge className={priorityColors[feature.priority]}>{feature.priority}</Badge>
          </div>
          <h2 className="text-xl text-gray-700">{feature.name}</h2>
        </div>

        <div className="flex gap-2">
          <Button variant="outline">
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
          <Button variant="outline" className="text-red-600 hover:text-red-700">
            <Trash className="w-4 h-4 mr-2" />
            Excluir
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações Principais */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Descrição</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">
                {feature.description || 'Sem descrição'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Definition of Done</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dodItems.map((item) => {
                  const checked = feature[item.key as keyof typeof feature] as boolean;
                  return (
                    <div key={item.key} className="flex items-center gap-3">
                      {checked ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-300" />
                      )}
                      <span className={checked ? 'text-gray-900' : 'text-gray-500'}>
                        {item.label}
                      </span>
                    </div>
                  );
                })}
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Progresso do DoD
                    </span>
                    <span className="text-sm font-bold text-uzzai-primary">
                      {feature.dod_progress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-uzzai-primary to-uzzai-secondary h-3 rounded-full transition-all"
                      style={{ width: `${feature.dod_progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tasks (se houver) */}
          {feature.tasks && feature.tasks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Subtasks ({feature.tasks.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {feature.tasks.map((task: any) => (
                    <div key={task.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      {task.status === 'done' ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-300 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className={task.status === 'done' ? 'line-through text-gray-500' : ''}>
                          {task.title}
                        </p>
                        {task.assigned_to && (
                          <p className="text-xs text-gray-500 mt-1">
                            Responsável: {task.assigned_to}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar com Metadados */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-medium">{statusLabels[feature.status]}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Categoria</p>
                <p className="font-medium">{feature.category}</p>
              </div>

              {feature.moscow && (
                <div>
                  <p className="text-sm text-gray-500">MoSCoW</p>
                  <Badge variant="outline">{feature.moscow}</Badge>
                </div>
              )}

              {feature.story_points && (
                <div>
                  <p className="text-sm text-gray-500">Story Points</p>
                  <p className="font-medium">{feature.story_points} pts</p>
                </div>
              )}

              {feature.due_date && (
                <div>
                  <p className="text-sm text-gray-500">Prazo</p>
                  <p className="font-medium">
                    {format(new Date(feature.due_date), "dd 'de' MMMM 'de' yyyy", {
                      locale: ptBR,
                    })}
                  </p>
                </div>
              )}

              {feature.responsible && feature.responsible.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Responsáveis</p>
                  <div className="flex flex-wrap gap-2">
                    {feature.responsible.map((person, i) => (
                      <Badge key={i} variant="outline">
                        {person}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* GUT Score */}
          {feature.gut_score && (
            <Card>
              <CardHeader>
                <CardTitle>GUT Score</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Gravidade</span>
                  <span className="font-medium">{feature.gut_g}/5</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Urgência</span>
                  <span className="font-medium">{feature.gut_u}/5</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Tendência</span>
                  <span className="font-medium">{feature.gut_t}/5</span>
                </div>
                <div className="pt-3 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Total</span>
                    <span className="text-xl font-bold text-uzzai-primary">
                      {feature.gut_score}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* BV/W Ratio */}
          {feature.bv_w_ratio && (
            <Card>
              <CardHeader>
                <CardTitle>BV/W Ratio</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Business Value</span>
                  <span className="font-medium">{feature.business_value}/10</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Work Effort</span>
                  <span className="font-medium">{feature.work_effort}/10</span>
                </div>
                <div className="pt-3 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Ratio</span>
                    <span className="text-xl font-bold text-uzzai-secondary">
                      {Number(feature.bv_w_ratio).toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Datas */}
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500">Criado em</p>
                <p className="font-medium">
                  {format(new Date(feature.created_at), "dd/MM/yyyy 'às' HH:mm", {
                    locale: ptBR,
                  })}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Última atualização</p>
                <p className="font-medium">
                  {format(new Date(feature.updated_at), "dd/MM/yyyy 'às' HH:mm", {
                    locale: ptBR,
                  })}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
