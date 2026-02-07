'use client';

import { useDeleteSprint } from '@/hooks/useSprints';
import type { Sprint } from '@/types';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2 } from 'lucide-react';

interface DeleteSprintDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    sprint: Sprint | null;
}

export function DeleteSprintDialog({ open, onOpenChange, sprint }: DeleteSprintDialogProps) {
    const deleteSprint = useDeleteSprint();

    const handleDelete = async () => {
        if (!sprint) return;

        try {
            await deleteSprint.mutateAsync(sprint.id);
            onOpenChange(false);
        } catch (error) {
            console.error('Error deleting sprint:', error);
            alert(error instanceof Error ? error.message : 'Erro ao deletar sprint');
        }
    };

    if (!sprint) return null;

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Deletar Sprint?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Tem certeza que deseja deletar o sprint <strong>{sprint.code} - {sprint.name}</strong>?
                        <br />
                        <br />
                        Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={deleteSprint.isPending}>
                        Cancelar
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={deleteSprint.isPending}
                        className="bg-red-600 hover:bg-red-700"
                    >
                        {deleteSprint.isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Deletando...
                            </>
                        ) : (
                            'Deletar'
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
