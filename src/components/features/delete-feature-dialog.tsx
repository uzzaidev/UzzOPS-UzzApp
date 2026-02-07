'use client';

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
import { useDeleteFeature } from '@/hooks/useFeatures';
import type { Feature } from '@/types';
import { Loader2 } from 'lucide-react';

interface DeleteFeatureDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    feature: Feature | null;
}

export function DeleteFeatureDialog({ open, onOpenChange, feature }: DeleteFeatureDialogProps) {
    const deleteFeature = useDeleteFeature();

    const handleDelete = async () => {
        if (!feature) return;

        try {
            await deleteFeature.mutateAsync(feature.id);
            onOpenChange(false);
        } catch (error) {
            console.error('Erro ao deletar feature:', error);
            // O erro já é tratado pelo React Query
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta ação não pode ser desfeita. Isso irá deletar permanentemente a feature{' '}
                        <span className="font-semibold text-foreground">{feature?.code}</span>
                        {' - '}
                        <span className="font-semibold text-foreground">{feature?.name}</span>.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={deleteFeature.isPending}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={deleteFeature.isPending}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {deleteFeature.isPending ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Deletando...
                            </>
                        ) : (
                            'Deletar Feature'
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
