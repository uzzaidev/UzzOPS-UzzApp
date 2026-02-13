'use client';

import { useDeleteRisk } from '@/hooks/useRisks';
import type { Risk } from '@/types';
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

interface DeleteRiskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  risk: Risk;
}

export function DeleteRiskDialog({ open, onOpenChange, risk }: DeleteRiskDialogProps) {
  const deleteRisk = useDeleteRisk();

  const handleDelete = async () => {
    try {
      await deleteRisk.mutateAsync(risk.id);
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao deletar risco:', error);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Deletar Risco?</AlertDialogTitle>
          <AlertDialogDescription>
            Você está prestes a deletar o risco <strong>{risk.public_id}</strong> - {risk.title}.
            <br />
            <br />
            Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteRisk.isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteRisk.isPending}
            className="bg-red-600 hover:bg-red-700"
          >
            {deleteRisk.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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
