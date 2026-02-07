'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCreateFeature } from '@/hooks/useFeatures';
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
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
    code: z
        .string()
        .min(3, 'Código deve ter pelo menos 3 caracteres')
        .max(20, 'Código deve ter no máximo 20 caracteres')
        .regex(/^[A-Z0-9-]+$/, 'Código deve conter apenas letras maiúsculas, números e hífens'),
    name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
    description: z.string().optional(),
    category: z.string().min(1, 'Categoria é obrigatória'),
    version: z.enum(['MVP', 'V1', 'V2', 'V3', 'V4']),
    priority: z.enum(['P0', 'P1', 'P2', 'P3']),
    status: z.enum(['backlog', 'todo', 'in_progress', 'review', 'testing', 'done', 'blocked']),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateFeatureModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    projectId?: string;
}

export function CreateFeatureModal({ open, onOpenChange, projectId }: CreateFeatureModalProps) {
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
        },
    });

    const onSubmit = async (data: FormValues) => {
        try {
            // Buscar o tenant_id do projeto se projectId foi fornecido
            let tenantId = null;
            if (projectId) {
                const res = await fetch(`/api/projects/${projectId}`);
                if (res.ok) {
                    const projectData = await res.json();
                    tenantId = projectData.data?.tenant_id;
                }
            }

            // Se não conseguimos obter o tenant_id, usar um valor padrão (UzzAI)
            if (!tenantId) {
                tenantId = '00000000-0000-0000-0000-000000000001';
            }

            await createFeature.mutateAsync({
                ...data,
                tenant_id: tenantId,
                project_id: projectId,
            });

            // Sucesso: fechar modal e resetar form
            form.reset();
            onOpenChange(false);
        } catch (error) {
            console.error('Erro ao criar feature:', error);
            // O erro já é tratado pelo React Query
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Nova Feature</DialogTitle>
                    <DialogDescription>
                        Crie uma nova feature para o projeto UzzApp. Preencha todos os campos obrigatórios.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            {/* Code */}
                            <FormField
                                control={form.control}
                                name="code"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Código *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="F001" {...field} className="uppercase" />
                                        </FormControl>
                                        <FormDescription>Código único da feature (ex: F001)</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Category */}
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
                                                <SelectItem value="gestao-projetos">Gestão de Projetos</SelectItem>
                                                <SelectItem value="gestao-equipe">Gestão de Equipe</SelectItem>
                                                <SelectItem value="analytics">Analytics & Reports</SelectItem>
                                                <SelectItem value="gestao-riscos">Gestão de Riscos</SelectItem>
                                                <SelectItem value="config-uzzapp">Configuração UzzApp</SelectItem>
                                                <SelectItem value="feature-flags">Feature Flags & Versioning</SelectItem>
                                                <SelectItem value="outros">Outros</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Name */}
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nome *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: Dashboard Overview" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Description */}
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descrição</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Descreva a funcionalidade desta feature..."
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-3 gap-4">
                            {/* Version */}
                            <FormField
                                control={form.control}
                                name="version"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Versão *</FormLabel>
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

                            {/* Priority */}
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
                                                <SelectItem value="P0">P0 - Crítico</SelectItem>
                                                <SelectItem value="P1">P1 - Alto</SelectItem>
                                                <SelectItem value="P2">P2 - Médio</SelectItem>
                                                <SelectItem value="P3">P3 - Baixo</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Status */}
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
