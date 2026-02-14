'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useUpdateSprint } from '@/hooks/useSprints';
import type { Sprint } from '@/types';
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

interface EditSprintModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    sprint: Sprint | null;
}

const formSchema = z
    .object({
        name: z.string().min(3, 'Nome deve ter ao menos 3 caracteres'),
        sprint_goal: z
            .string()
            .min(10, 'Sprint Goal deve ter ao menos 10 caracteres')
            .max(500, 'Sprint Goal deve ter no máximo 500 caracteres'),
        duration_weeks: z.coerce.number().min(1).max(4).optional(), // Read-only no form
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

type FormValues = z.output<typeof formSchema>;
type FormInput = {
    name: string;
    sprint_goal: string;
    duration_weeks?: number | string;
    start_date: string;
    end_date: string;
    status: 'planned' | 'active' | 'completed' | 'cancelled';
    capacity_total?: number | string;
    velocity_target?: number | string;
};

export function EditSprintModal({ open, onOpenChange, sprint }: EditSprintModalProps) {
    const updateSprint = useUpdateSprint();

    const form = useForm<FormInput, unknown, FormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            name: '',
            sprint_goal: '',
            duration_weeks: undefined,
            start_date: '',
            end_date: '',
            status: 'planned',
            capacity_total: undefined,
            velocity_target: undefined,
        },
    });

    // Pre-popular campos quando sprint muda
    useEffect(() => {
        if (sprint) {
            form.reset({
                name: sprint.name,
                sprint_goal: (sprint as any).sprint_goal || '',
                duration_weeks: (sprint as any).duration_weeks || 2,
                start_date: sprint.start_date.split('T')[0],
                end_date: sprint.end_date.split('T')[0],
                status: sprint.status,
                capacity_total: sprint.capacity_total || undefined,
                velocity_target: sprint.velocity_target || undefined,
            });
        }
    }, [sprint, form]);

    const onSubmit = async (data: FormValues) => {
        if (!sprint) return;

        try {
            await updateSprint.mutateAsync({
                id: sprint.id,
                data,
            });

            onOpenChange(false);
        } catch (error) {
            console.error('Error updating sprint:', error);
            alert(error instanceof Error ? error.message : 'Erro ao atualizar sprint');
        }
    };

    if (!sprint) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Editar Sprint: {sprint.code}</DialogTitle>
                    <DialogDescription>
                        Atualize as informações do sprint. Código não pode ser alterado.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700">Código</label>
                                <Input value={sprint.code} disabled className="bg-gray-100" />
                                <p className="text-xs text-gray-500 mt-1">Código não pode ser alterado</p>
                            </div>

                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status *</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
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
                                        Objetivo claro do sprint (mínimo 10 caracteres)
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div>
                            <label className="text-sm font-medium">Duração (semanas)</label>
                            <Input
                                value={`${(sprint as any)?.duration_weeks || 2} semanas`}
                                disabled
                                className="bg-gray-100 mt-2"
                            />
                            <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                                <span>⚠️</span> Duração NÃO pode ser alterada após criação
                            </p>
                        </div>

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
                                disabled={updateSprint.isPending}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                className="bg-uzzai-primary hover:bg-uzzai-primary/90"
                                disabled={updateSprint.isPending}
                            >
                                {updateSprint.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Salvando...
                                    </>
                                ) : (
                                    'Salvar Alterações'
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
