'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useUpdateRisk } from '@/hooks/useRisks';
import type { Risk } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertTriangle } from 'lucide-react';

const formSchema = z.object({
  title: z.string().min(5, 'Título deve ter pelo menos 5 caracteres'),
  description: z.string().optional(),
  gut_g: z.number().min(1).max(5),
  gut_u: z.number().min(1).max(5),
  gut_t: z.number().min(1).max(5),
  status: z.enum(['identified', 'analyzing', 'mitigated', 'accepted', 'resolved']),
  mitigation_plan: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface EditRiskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  risk: Risk;
}

const gutLabels = {
  g: { 1: 'Muito Baixa', 2: 'Baixa', 3: 'Média', 4: 'Alta', 5: 'Muito Alta' },
  u: { 1: 'Pode esperar', 2: 'Pouco urgente', 3: 'Urgente', 4: 'Muito urgente', 5: 'Imediata' },
  t: { 1: 'Vai melhorar', 2: 'Estável', 3: 'Vai piorar pouco', 4: 'Vai piorar', 5: 'Vai piorar muito' },
};

function getSeverityLabel(score: number): string {
  if (score >= 100) return 'Crítico';
  if (score >= 50) return 'Alto';
  if (score >= 20) return 'Médio';
  return 'Baixo';
}

function getSeverityColor(label: string): string {
  const colors: Record<string, string> = {
    Crítico: 'bg-red-500 text-white',
    Alto: 'bg-orange-500 text-white',
    Médio: 'bg-yellow-500 text-white',
    Baixo: 'bg-green-500 text-white',
  };
  return colors[label] || colors.Baixo;
}

export function EditRiskModal({ open, onOpenChange, risk }: EditRiskModalProps) {
  const updateRisk = useUpdateRisk();
  const [gutScore, setGutScore] = useState(risk.gut_score || 1);
  const [severityLabel, setSeverityLabel] = useState(risk.severity_label || 'Baixo');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: risk.title,
      description: risk.description || '',
      gut_g: risk.gut_g,
      gut_u: risk.gut_u,
      gut_t: risk.gut_t,
      status: risk.status,
      mitigation_plan: risk.mitigation_plan || '',
    },
  });

  useEffect(() => {
    const g = form.watch('gut_g');
    const u = form.watch('gut_u');
    const t = form.watch('gut_t');
    const score = g * u * t;
    setGutScore(score);
    setSeverityLabel(getSeverityLabel(score));
  }, [form.watch('gut_g'), form.watch('gut_u'), form.watch('gut_t')]);

  const onSubmit = async (data: FormValues) => {
    try {
      await updateRisk.mutateAsync({
        id: risk.id,
        data,
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao atualizar risco:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Risco</DialogTitle>
          <DialogDescription>
            Código: {risk.public_id} - Atualize as informações do risco
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="identified">Identificado</SelectItem>
                        <SelectItem value="analyzing">Analisando</SelectItem>
                        <SelectItem value="mitigated">Mitigado</SelectItem>
                        <SelectItem value="accepted">Aceito</SelectItem>
                        <SelectItem value="resolved">Resolvido</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título *</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="border rounded-lg p-4 bg-gray-50 space-y-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-uzzai-primary" />
                <h3 className="font-semibold">Matriz GUT</h3>
              </div>

              <FormField
                control={form.control}
                name="gut_g"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gravidade</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <input
                          type="range"
                          min="1"
                          max="5"
                          value={field.value}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-uzzai-primary"
                        />
                        <div className="flex justify-between text-xs text-gray-600">
                          <span>1 - Muito Baixa</span>
                          <span className="font-semibold text-uzzai-primary">
                            {field.value} - {gutLabels.g[field.value as keyof typeof gutLabels.g]}
                          </span>
                          <span>5 - Muito Alta</span>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gut_u"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Urgência</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <input
                          type="range"
                          min="1"
                          max="5"
                          value={field.value}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-uzzai-primary"
                        />
                        <div className="flex justify-between text-xs text-gray-600">
                          <span>1 - Pode esperar</span>
                          <span className="font-semibold text-uzzai-primary">
                            {field.value} - {gutLabels.u[field.value as keyof typeof gutLabels.u]}
                          </span>
                          <span>5 - Imediata</span>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gut_t"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tendência</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <input
                          type="range"
                          min="1"
                          max="5"
                          value={field.value}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-uzzai-primary"
                        />
                        <div className="flex justify-between text-xs text-gray-600">
                          <span>1 - Vai melhorar</span>
                          <span className="font-semibold text-uzzai-primary">
                            {field.value} - {gutLabels.t[field.value as keyof typeof gutLabels.t]}
                          </span>
                          <span>5 - Vai piorar muito</span>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center justify-between p-4 bg-white border rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">GUT Score</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {form.watch('gut_g')} × {form.watch('gut_u')} × {form.watch('gut_t')} = {gutScore}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-4xl font-bold text-gray-900">{gutScore}</span>
                  <Badge className={getSeverityColor(severityLabel)}>{severityLabel}</Badge>
                </div>
              </div>
            </div>

            <FormField
              control={form.control}
              name="mitigation_plan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plano de Mitigação</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={updateRisk.isPending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-uzzai-primary hover:bg-uzzai-primary/90"
                disabled={updateRisk.isPending}
              >
                {updateRisk.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar Alterações'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
