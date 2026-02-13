'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PlusCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type CreateProjectResponse = {
  data?: { id: string; code: string; name: string };
  error?: string;
};

export function CreateProjectDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  async function handleCreate() {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          code: code || undefined,
          description: description || undefined,
        }),
      });

      const json = (await res.json()) as CreateProjectResponse;
      if (!res.ok || !json.data) {
        setError(json.error ?? 'Falha ao criar projeto');
        setLoading(false);
        return;
      }

      setOpen(false);
      setName('');
      setCode('');
      setDescription('');
      router.push(`/projects/${json.data.id}/dashboard`);
      router.refresh();
    } catch {
      setError('Falha ao criar projeto');
      setLoading(false);
      return;
    }

    setLoading(false);
  }

  return (
    <>
      <Button variant="outline" className="gap-2" onClick={() => setOpen(true)}>
        <PlusCircle className="w-4 h-4" />
        Criar Novo Projeto
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Projeto</DialogTitle>
            <DialogDescription>
              Crie um projeto no tenant ativo para iniciar os testes.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="project-name">Nome</Label>
              <Input
                id="project-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Projeto B"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-code">Codigo (opcional)</Label>
              <Input
                id="project-code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Ex: PRJ-B"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-description">Descricao (opcional)</Label>
              <Textarea
                id="project-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Contexto rapido do projeto"
              />
            </div>

            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={loading || name.trim().length < 2}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                'Criar Projeto'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

