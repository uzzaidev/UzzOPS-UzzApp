'use client';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Calendar, Target, CheckCircle2, TrendingUp, Clock } from 'lucide-react';
import { format, differenceInDays, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SprintHeaderProps {
    sprint: any;
    metrics: {
        velocity: { current: number; target: number; progress: number };
        features: { done: number; total: number; progress: number };
        dod: { average: number; progress: number };
        capacity: { used: number; total: number; progress: number };
    };
}

export function SprintHeader({ sprint, metrics }: SprintHeaderProps) {
    // Calcular dias restantes
    const today = new Date();
    const endDate = parseISO(sprint.end_date);
    const daysRemaining = differenceInDays(endDate, today);

    // Status badge
    const statusConfig = {
        planned: { label: 'Planejado', color: 'bg-blue-500/10 text-blue-700 border-blue-200' },
        active: { label: 'Ativo', color: 'bg-green-500/10 text-green-700 border-green-200' },
        completed: { label: 'Concluído', color: 'bg-gray-500/10 text-gray-700 border-gray-200' }
    };

    const statusInfo = statusConfig[sprint.status as keyof typeof statusConfig] || statusConfig.planned;

    return (
        <div className="space-y-4">
            {/* Header principal */}
            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className={statusInfo.color}>
                            {statusInfo.label}
                        </Badge>
                        {sprint.is_protected && (
                            <Badge variant="outline" className="bg-amber-500/10 text-amber-700 border-amber-200">
                                🔒 Protegido
                            </Badge>
                        )}
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        {sprint.code} - {sprint.name}
                    </h1>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {format(parseISO(sprint.start_date), 'dd MMM', { locale: ptBR })} - {format(endDate, 'dd MMM yyyy', { locale: ptBR })}
                        </span>
                        <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {sprint.duration_weeks} {sprint.duration_weeks === 1 ? 'semana' : 'semanas'}
                        </span>
                        {sprint.status === 'active' && (
                            <span className="flex items-center gap-1 font-medium">
                                {daysRemaining > 0 ? (
                                    <>
                                        <Target className="h-4 w-4 text-blue-500" />
                                        <span className="text-blue-600">{daysRemaining} dias restantes</span>
                                    </>
                                ) : (
                                    <>
                                        <Target className="h-4 w-4 text-red-500" />
                                        <span className="text-red-600">Sprint atrasado ({Math.abs(daysRemaining)} dias)</span>
                                    </>
                                )}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Métricas Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Velocity */}
                <MetricCard
                    icon={TrendingUp}
                    label="Velocity"
                    value={`${metrics.velocity.current}/${metrics.velocity.target} pts`}
                    progress={metrics.velocity.progress}
                    color="blue"
                />

                {/* Features */}
                <MetricCard
                    icon={CheckCircle2}
                    label="Features"
                    value={`${metrics.features.done}/${metrics.features.total}`}
                    progress={metrics.features.progress}
                    color="green"
                />

                {/* DoD Average */}
                <MetricCard
                    icon={Target}
                    label="DoD Médio"
                    value={`${metrics.dod.average}%`}
                    progress={metrics.dod.progress}
                    color="purple"
                />

                {/* Capacity */}
                <MetricCard
                    icon={TrendingUp}
                    label="Capacidade"
                    value={`${metrics.capacity.used}/${metrics.capacity.total} pts`}
                    progress={metrics.capacity.progress}
                    color="orange"
                />
            </div>
        </div>
    );
}

interface MetricCardProps {
    icon: any;
    label: string;
    value: string;
    progress: number;
    color: 'blue' | 'green' | 'purple' | 'orange';
}

function MetricCard({ icon: Icon, label, value, progress, color }: MetricCardProps) {
    const colorClasses = {
        blue: 'text-blue-600 bg-blue-50',
        green: 'text-green-600 bg-green-50',
        purple: 'text-purple-600 bg-purple-50',
        orange: 'text-orange-600 bg-orange-50',
    };

    const progressColors = {
        blue: '[&>div]:bg-blue-500',
        green: '[&>div]:bg-green-500',
        purple: '[&>div]:bg-purple-500',
        orange: '[&>div]:bg-orange-500',
    };

    return (
        <Card className="p-4">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
                    <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <p className="text-2xl font-bold">{value}</p>
                </div>
            </div>
            <Progress value={progress} className={`mt-3 h-2 ${progressColors[color]}`} />
        </Card>
    );
}
