'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCreateFeature } from '@/hooks/useFeatures';
import { useTeam } from '@/hooks/useTeam';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';

const DOD_CRITERIA = [
  { key: 'dod_functional', label: 'Funcionalidade implementada' },
  { key: 'dod_tests', label: 'Testes escritos e passando' },
  { key: 'dod_code_review', label: 'Code review aprovado' },
  { key: 'dod_documentation', label: 'Documentacao atualizada' },
  { key: 'dod_deployed', label: 'Deploy realizado' },
  { key: 'dod_user_acceptance', label: 'User acceptance aprovado' },
] as const;

const formSchema = z.object({
  code: z
    .string()
    .min(3, 'Codigo deve ter pelo menos 3 caracteres')
    .max(20, 'Codigo deve ter no maximo 20 caracteres')
    .regex(/^[A-Z0-9-]+$/, 'Codigo deve conter apenas letras maiusculas, numeros e hifens'),
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  description: z.string().optional(),
  category: z.string().min(1, 'Categoria e obrigatoria'),
  version: z.enum(['MVP', 'V1', 'V2', 'V3', 'V4']),
  priority: z.enum(['P0', 'P1', 'P2', 'P3']),
  status: z.enum(['backlog', 'todo', 'in_progress', 'review', 'testing', 'done', 'blocked']),
  work_item_type: z.enum(['feature', 'bug']),
  solution_notes: z.string().optional(),
  responsible: z.array(z.string()).optional(),
  dod_functional: z.boolean(),
  dod_tests: z.boolean(),
  dod_code_review: z.boolean(),
  dod_documentation: z.boolean(),
  dod_deployed: z.boolean(),
  dod_user_acceptance: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateFeatureModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId?: string;
  initialItemType?: 'feature' | 'bug';
}

export function CreateFeatureModal({
  open,
  onOpenChange,
  projectId,
  initialItemType = 'feature',
}: CreateFeatureModalProps) {
  const createFeature = useCreateFeature();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: '',
      name: '',
      description: '',
      category: '',
      version: 'MVP',
      priority: 'P2',
      status: 'backlog',
      work_item_type: 'feature',
      solution_notes: '',
      responsible: [],
      dod_functional: false,
      dod_tests: false,
      dod_code_review: false,
      dod_documentation: false,
      dod_deployed: false,
      dod_user_acceptance: false,
    },
  });

  const selectedItemType = form.watch('work_item_type');
  const selectedResponsible = form.watch('responsible') ?? [];
  const { data: team = [] } = useTeam(projectId ?? '');
  const activeTeam = team.filter((member) => member.status === 'active' && member.is_active);
  const [customDodItems, setCustomDodItems] = useState<string[]>([]);

  useEffect(() => {
    if (!open) return;
    form.setValue('work_item_type', initialItemType);
  }, [form, initialItemType, open]);

  const onSubmit = async (data: FormValues) => {
    if (!projectId) return;
    try {
      await createFeature.mutateAsync({
        ...data,
        dod_custom_items: customDodItems.map((item) => item.trim()).filter(Boolean),
        project_id: projectId,
      });

      form.reset();
      setCustomDodItems([]);
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao criar item:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{selectedItemType === 'bug' ? 'Novo Bug' : 'Nova Feature'}</DialogTitle>
          <DialogDescription>
            Registre um item com contexto de entrega e DoD customizado.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Codigo *</FormLabel>
                    <FormControl>
                      <Input placeholder="F001" {...field} className="uppercase" />
                    </FormControl>
                    <FormDescription>Codigo unico do item (ex: F001, BUG-12)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="gestao-projetos">Gestao de Projetos</SelectItem>
                        <SelectItem value="gestao-equipe">Gestao de Equipe</SelectItem>
                        <SelectItem value="analytics">Analytics & Reports</SelectItem>
                        <SelectItem value="gestao-riscos">Gestao de Riscos</SelectItem>
                        <SelectItem value="config-uzzapp">Configuracao UzzApp</SelectItem>
                        <SelectItem value="feature-flags">Feature Flags & Versioning</SelectItem>
                        <SelectItem value="outros">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="work_item_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de item *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="feature">Feature</SelectItem>
                      <SelectItem value="bug">Bug</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>Use Bug para problemas e Feature para evolucao funcional.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={
                        selectedItemType === 'bug'
                          ? 'Ex: Falha no login com SSO'
                          : 'Ex: Dashboard de indicadores'
                      }
                      {...field}
                    />
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
                  <FormLabel>Descricao</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={
                        selectedItemType === 'bug'
                          ? 'Descreva impacto, comportamento esperado e passos de reproducao...'
                          : 'Descreva a funcionalidade e o valor esperado...'
                      }
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="solution_notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Solucao / Diagnostico inicial</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Opcional: proposta de solucao, hipoteses ou links relevantes."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Depois voce pode anexar arquivos .md/.txt/.pdf na tela de detalhes.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="version"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Versao *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="MVP">MVP</SelectItem>
                        <SelectItem value="V1">V1</SelectItem>
                        <SelectItem value="V2">V2</SelectItem>
                        <SelectItem value="V3">V3</SelectItem>
                        <SelectItem value="V4">V4</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prioridade *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="P0">P0 - Critico</SelectItem>
                        <SelectItem value="P1">P1 - Alto</SelectItem>
                        <SelectItem value="P2">P2 - Medio</SelectItem>
                        <SelectItem value="P3">P3 - Baixo</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                        <SelectItem value="backlog">Backlog</SelectItem>
                        <SelectItem value="todo">To Do</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="review">Review</SelectItem>
                        <SelectItem value="testing">Testing</SelectItem>
                        <SelectItem value="done">Done</SelectItem>
                        <SelectItem value="blocked">Blocked</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="responsible"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Responsaveis</FormLabel>
                  <FormDescription>
                    Selecione quem fica responsavel por este item.
                  </FormDescription>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 rounded-lg border p-3">
                    {activeTeam.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Nenhum membro ativo disponivel.</p>
                    ) : (
                      activeTeam.map((member) => {
                        const checked = selectedResponsible.includes(member.name);
                        return (
                          <label
                            key={member.id}
                            className="flex items-center gap-2 text-sm cursor-pointer"
                          >
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(nextChecked) => {
                                const current = field.value ?? [];
                                if (nextChecked) {
                                  field.onChange([...current, member.name]);
                                  return;
                                }
                                field.onChange(current.filter((name) => name !== member.name));
                              }}
                            />
                            <span>{member.name}</span>
                          </label>
                        );
                      })
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="rounded-lg border p-4 space-y-3">
              <div>
                <h4 className="text-sm font-semibold">Definition of Done (DoD)</h4>
                <p className="text-xs text-muted-foreground">
                  Defina os criterios que ja entram marcados para este item.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {DOD_CRITERIA.map((criterion) => (
                  <FormField
                    key={criterion.key}
                    control={form.control}
                    name={criterion.key}
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                          />
                        </FormControl>
                        <FormLabel className="font-normal text-sm">{criterion.label}</FormLabel>
                      </FormItem>
                    )}
                  />
                ))}
              </div>

              <div className="space-y-2 border-t pt-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Personalizado
                </p>
                {customDodItems.length === 0 ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCustomDodItems([''])}
                  >
                    Adicionar criterio personalizado
                  </Button>
                ) : (
                  <div className="space-y-2">
                    {customDodItems.map((value, index) => (
                      <div key={`custom-dod-${index}`} className="flex items-start gap-2">
                        <div className="flex-1">
                          <Input
                            placeholder={`Criterio personalizado ${index + 1}`}
                            value={value}
                            onChange={(event) => {
                              const next = [...customDodItems];
                              next[index] = event.target.value;
                              setCustomDodItems(next);
                            }}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setCustomDodItems(customDodItems.filter((_, i) => i !== index))}
                        >
                          Remover
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCustomDodItems([...customDodItems, ''])}
                    >
                      Adicionar outro criterio
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={createFeature.isPending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-uzzai-primary hover:bg-uzzai-primary/90"
                disabled={createFeature.isPending}
              >
                {createFeature.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Criando...
                  </>
                ) : selectedItemType === 'bug' ? (
                  'Criar Bug'
                ) : (
                  'Criar Feature'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
