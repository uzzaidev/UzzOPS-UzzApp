'use client';

import { useProjectOverview } from '@/hooks/useProjectOverview';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, TrendingUp, Users, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DashboardContentProps {
  projectId: string;
}

export function DashboardContent({ projectId }: DashboardContentProps) {
  const { data: overview, isLoading, error } = useProjectOverview(projectId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-uzzai-primary" />
      </div>
    );
  }

  if (error || !overview) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <p className="text-red-600">Erro ao carregar dados do dashboard.</p>
        </CardContent>
      </Card>
    );
  }

  const { project, totalFeatures, featuresDone, featuresInProgress, progress, avgDodProgress, teamSize, currentSprint, criticalRisks } = overview;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
        <p className="text-gray-500 mt-1">{project.description}</p>
      </div>

      {/* Alert Success */}
      {progress === 0 && (
        <Card className="border-l-4 border-l-green-500 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl">✓</span>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-green-900">Sprint 0 Completo!</h3>
                <p className="text-sm text-green-700 mt-1">
                  Infraestrutura configurada. Pronto para o Sprint 1! 🚀
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <Card className="border-l-4 border-l-uzzai-primary hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Status do Projeto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={project.status === 'active' ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-500'}>
              {project.status === 'active' ? 'Ativo' : project.status}
            </Badge>
            <p className="text-xs text-gray-500 mt-2">
              {project.status === 'active' ? 'Desenvolvimento em andamento' : 'Status do projeto'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-uzzai-secondary hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Progresso Geral</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-uzzai-secondary">{progress}%</p>
              <TrendingUp className={`w-5 h-5 ${progress > 0 ? 'text-green-500' : 'text-gray-400'}`} />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {featuresDone} de {totalFeatures} features concluídas
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
              <div
                className="bg-gradient-to-r from-uzzai-secondary to-uzzai-primary h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-uzzai-warning hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Total de Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-uzzai-warning">{totalFeatures}</p>
            <div className="text-xs text-gray-500 mt-2 space-y-1">
              <p>✅ {featuresDone} concluídas</p>
              <p>🚧 {featuresInProgress} em progresso</p>
            </div>
          </CardContent>
        </Card>

        <Card className={`border-l-4 hover:shadow-lg transition-shadow ${avgDodProgress >= 80 ? 'border-l-green-500' : avgDodProgress >= 50 ? 'border-l-yellow-500' : 'border-l-red-500'}`}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              DoD Compliance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <p className={`text-3xl font-bold ${avgDodProgress >= 80 ? 'text-green-600' : avgDodProgress >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                {avgDodProgress}%
              </p>
            </div>
            <p className="text-xs text-gray-500 mt-2">Média de Definition of Done</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
              <div
                className={`h-2 rounded-full transition-all ${avgDodProgress >= 80 ? 'bg-green-500' : avgDodProgress >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                style={{ width: `${avgDodProgress}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-uzzai-dark hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Equipe
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-uzzai-dark">{teamSize}</p>
            <p className="text-xs text-gray-500 mt-2">Membros ativos no projeto</p>
            {criticalRisks > 0 && (
              <div className="flex items-center gap-2 mt-3 text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span className="text-xs font-medium">{criticalRisks} riscos críticos</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Current Sprint & Upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Sprint Atual</CardTitle>
          </CardHeader>
          <CardContent>
            {currentSprint ? (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{currentSprint.name}</span>
                    <Badge variant="outline" className={currentSprint.status === 'active' ? 'border-green-500 text-green-700' : ''}>
                      {currentSprint.start_date && currentSprint.end_date
                        ? `${format(new Date(currentSprint.start_date), 'dd MMM', { locale: ptBR })} - ${format(new Date(currentSprint.end_date), 'dd MMM', { locale: ptBR })}`
                        : 'Sem data'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{currentSprint.goal}</p>
                </div>
                {currentSprint.velocity_target && (
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600">Velocity Target</span>
                      <span className="font-medium">{currentSprint.velocity_actual || 0} / {currentSprint.velocity_target} pts</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-uzzai-primary h-2 rounded-full"
                        style={{
                          width: `${Math.min(((currentSprint.velocity_actual || 0) / currentSprint.velocity_target) * 100, 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Nenhum sprint ativo no momento</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status das Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Concluídas</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: totalFeatures > 0 ? `${(featuresDone / totalFeatures) * 100}%` : '0%' }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium w-12 text-right">{featuresDone}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Em Progresso</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: totalFeatures > 0 ? `${(featuresInProgress / totalFeatures) * 100}%` : '0%' }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium w-12 text-right">{featuresInProgress}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Pendentes</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gray-400 h-2 rounded-full"
                      style={{ width: totalFeatures > 0 ? `${((totalFeatures - featuresDone - featuresInProgress) / totalFeatures) * 100}%` : '0%' }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium w-12 text-right">{totalFeatures - featuresDone - featuresInProgress}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
