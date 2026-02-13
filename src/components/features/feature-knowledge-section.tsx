'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Upload, Trash2, FileText, Save } from 'lucide-react';
import type { Feature } from '@/types';
import {
  useDeleteFeatureAttachment,
  useFeatureAttachments,
  useUpdateFeature,
  useUploadFeatureAttachment,
} from '@/hooks/useFeatures';

interface Props {
  feature: Feature;
}

const TEMPLATE = `## Contexto
- Problema:
- Impacto:

## Diagnostico
- Causa raiz:
- Evidencias:

## Solucao
- Abordagem:
- Decisao tecnica:
- Riscos:

## Validacao
- Como testar:
- Resultado esperado:
`;

function formatBytes(size: number | null) {
  if (!size || size <= 0) return '-';
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function FeatureKnowledgeSection({ feature }: Props) {
  const [notes, setNotes] = useState(feature.solution_notes ?? '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const updateFeature = useUpdateFeature();
  const attachments = useFeatureAttachments(feature.id);
  const uploadAttachment = useUploadFeatureAttachment(feature.id);
  const deleteAttachment = useDeleteFeatureAttachment(feature.id);

  const itemTypeLabel = useMemo(
    () => (feature.work_item_type === 'bug' ? 'Bug' : 'Feature'),
    [feature.work_item_type]
  );

  const saveNotes = async () => {
    setFeedback(null);
    try {
      await updateFeature.mutateAsync({
        id: feature.id,
        data: { solution_notes: notes || null },
      });
      setFeedback('Base de solução salva.');
    } catch (err: any) {
      setFeedback(err?.message || 'Erro ao salvar base de solução.');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setFeedback(null);
    try {
      await uploadAttachment.mutateAsync(selectedFile);
      setSelectedFile(null);
      setFeedback('Arquivo anexado com sucesso.');
    } catch (err: any) {
      setFeedback(err?.message || 'Erro ao anexar arquivo.');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Base de Solucao
          <Badge variant="outline">{itemTypeLabel}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Documente diagnostico e solucao para acelerar onboarding e manutencao.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setNotes((prev) => (prev?.trim() ? prev : TEMPLATE))}
            >
              Inserir template
            </Button>
          </div>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[220px]"
            placeholder="Escreva a solucao, decisao tecnica e plano de validacao..."
          />
          <div className="flex justify-end">
            <Button type="button" onClick={saveNotes} disabled={updateFeature.isPending}>
              {updateFeature.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar base
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="space-y-2 border-t pt-4">
          <p className="text-sm font-medium">Anexos de Solucao (.md, .txt, .pdf)</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              type="file"
              accept=".md,.txt,.pdf,text/plain,text/markdown,application/pdf"
              onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleUpload}
              disabled={!selectedFile || uploadAttachment.isPending}
            >
              {uploadAttachment.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              Enviar
            </Button>
          </div>

          <div className="space-y-2">
            {attachments.isLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Carregando anexos...
              </div>
            ) : attachments.data?.data?.length ? (
              attachments.data.data.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between rounded-md border p-2 text-sm"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span className="truncate font-medium">{file.file_name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatBytes(file.file_size)} {file.mime_type ? `• ${file.mime_type}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" size="sm" asChild>
                      <a href={file.download_url ?? '#'} target="_blank" rel="noreferrer">
                        Abrir
                      </a>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => deleteAttachment.mutate(file.id)}
                      disabled={deleteAttachment.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Nenhum anexo enviado.</p>
            )}
          </div>
        </div>

        {feedback && (
          <p className="rounded-md bg-muted p-2 text-sm text-muted-foreground">{feedback}</p>
        )}
      </CardContent>
    </Card>
  );
}

