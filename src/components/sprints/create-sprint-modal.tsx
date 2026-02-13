'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCreateSprint } from '@/hooks/useSprints';
import {
    Dialog,
    DialogContent,
    DialogDescription,
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
import { Loader2 } from 'lucide-react';

interface CreateSprintModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    projectId?: string;
}

const formSchema = z
    .object({
        code: z
            .string()
            .min(2, 'Código deve ter ao menos 2 caracteres')
            .max(10, 'Código deve ter no máximo 10 caracteres')
            .regex(/^SP\d+$/, 'Código deve estar no formato SP001, SP002, etc'),
        name: z.string().min(3, 'Nome deve ter ao menos 3 caracteres'),
        sprint_goal: z
            .string()
            .min(10, 'Sprint Goal deve ter ao menos 10 caracteres')
            .max(500, 'Sprint Goal deve ter no máximo 500 caracteres'),
        duration_weeks: z.coerce.number().min(1).max(4, 'Duração deve ser entre 1 e 4 semanas'),
        start_date: z.string().min(1, 'Data de início é obrigatória'),
        end_date: z.string().min(1, 'Data de término é obrigatória'),
        status: z.enum(['planned', 'active', 'completed', 'cancelled']),
        capacity_total: z.coerce.number().min(0).optional(),
        velocity_target: z.coerce.number().min(0).optional(),
    })
    .refine((data) => new Date(data.start_date) < new Date(data.end_date), {
        message: 'Data de início deve ser anterior à data de término',
        path: ['end_date'],
    });

type FormValues = z.infer<typeof formSchema>;

export function CreateSprintModal({ open, onOpenChange, projectId }: CreateSprintModalProps) {
    const createSprint = useCreateSprint();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            code: '',
            name: '',
            sprint_goal: '',
            duration_weeks: 2, // padrão: 2 semanas
            start_date: '',
            end_date: '',
            status: 'planned',
            capacity_total: undefined,
            velocity_target: undefined,
        },
    });

    const onSubmit = async (data: FormValues) => {
        if (!projectId) {
            alert('Projeto não identificado');
            return;
        }

        try {
            await createSprint.mutateAsync({
                project_id: projectId,
                ...data,
            });

            form.reset();
            onOpenChange(false);
        } catch (error) {
            console.error('Error creating sprint:', error);
            alert(error instanceof Error ? error.message : 'Erro ao criar sprint');
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Novo Sprint</DialogTitle>
                    <DialogDescription>
                        Crie um novo sprint para o projeto. Preencha as informações abaixo.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="code"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Código *</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="SP001"
                                                {...field}
                                                onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                                            />
                                        </FormControl>
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
                                                <SelectItem value="planned">Planejado</SelectItem>
                                                <SelectItem value="active">Ativo</SelectItem>
                                                <SelectItem value="completed">Concluído</SelectItem>
                                                <SelectItem value="cancelled">Cancelado</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nome *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Sprint 1" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="sprint_goal"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Sprint Goal * 🎯</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Ex: Implementar autenticação segura do usuário e dashboard administrativo"
                                            {...field}
                                            rows={3}
                                        />
                                    </FormControl>
                                    <FormDescription className="text-xs">
                                        Uma frase clara que resume o objetivo principal deste sprint (mínimo 10 caracteres)
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="duration_weeks"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Duração (semanas) *</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="1">1 semana</SelectItem>
                                            <SelectItem value="2">2 semanas ⭐</SelectItem>
                                            <SelectItem value="3">3 semanas</SelectItem>
                                            <SelectItem value="4">4 semanas</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormDescription className="text-xs flex items-center gap-1">
                                        <span className="text-orange-600">⚠️</span> Duração NÃO pode ser alterada após início do sprint
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="start_date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Data de Início *</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="end_date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Data de Término *</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="capacity_total"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Capacidade Total (pts)</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="25" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="velocity_target"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Meta de Velocity (pts)</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="20" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={createSprint.isPending}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                className="bg-uzzai-primary hover:bg-uzzai-primary/90"
                                disabled={createSprint.isPending}
                            >
                                {createSprint.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Criando...
                                    </>
                                ) : (
                                    'Criar Sprint'
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
