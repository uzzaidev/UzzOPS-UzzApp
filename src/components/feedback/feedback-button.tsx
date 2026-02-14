'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { MessageSquare, Loader2, Camera, ClipboardPaste, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { tenantFetch } from '@/lib/api-client';
import { ScreenCaptureOverlay } from '@/components/feedback/screen-capture-overlay';

type FeedbackType = 'bug' | 'sugestao' | 'elogio' | 'outro';
type FeedbackPriority = 'critica' | 'alta' | 'media' | 'baixa';

export function FeedbackButton({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false);
  const [captureFlowActive, setCaptureFlowActive] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<FeedbackType>('sugestao');
  const [priority, setPriority] = useState<FeedbackPriority>('media');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [snapshotUrl, setSnapshotUrl] = useState<string | null>(null);
  const uploadRef = useRef<HTMLInputElement | null>(null);
  const snapshotCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const captureFlowRef = useRef(false);

  const canSubmit = useMemo(() => title.trim().length > 0 && !isSubmitting, [title, isSubmitting]);

  useEffect(() => {
    if (!open) return;
    const onPaste = (event: ClipboardEvent) => {
      const item = Array.from(event.clipboardData?.items ?? []).find((i) => i.type.startsWith('image/'));
      if (!item) return;
      const file = item.getAsFile();
      if (!file) return;
      const preview = URL.createObjectURL(file);
      setImageFile(file);
      setImagePreview((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return preview;
      });
      toast.success('Imagem colada no feedback.');
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [open]);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  function resetState() {
    setTitle('');
    setDescription('');
    setType('sugestao');
    setPriority('media');
    setImageFile(null);
    setImagePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setIsCapturing(false);
    setIsSubmitting(false);
    setOverlayOpen(false);
    setSnapshotUrl(null);
    snapshotCanvasRef.current = null;
  }

  async function handleCaptureAreaStart() {
    try {
      setIsCapturing(true);
      captureFlowRef.current = true;
      setCaptureFlowActive(true);
      setOpen(false);
      // Aguarda o fechamento visual do Dialog antes de capturar.
      await new Promise((resolve) => setTimeout(resolve, 180));
      const canvas = await html2canvas(document.body, {
        useCORS: true,
        allowTaint: false,
        scale: window.devicePixelRatio || 1,
        logging: false,
      });
      snapshotCanvasRef.current = canvas;
      const dataUrl = canvas.toDataURL('image/png', 0.95);
      if (!dataUrl) throw new Error('Falha ao gerar screenshot');
      setSnapshotUrl(dataUrl);
      setOverlayOpen(true);
    } catch {
      toast.error('Nao foi possivel capturar a tela.');
    } finally {
      setIsCapturing(false);
    }
  }

  function handleUploadChange(file?: File | null) {
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setImageFile(file);
    setImagePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return preview;
    });
  }

  async function handleSubmit() {
    if (!canSubmit) return;
    setIsSubmitting(true);
    try {
      const metadata = {
        viewport: { w: window.innerWidth, h: window.innerHeight },
        devicePixelRatio: window.devicePixelRatio,
        browser: navigator.userAgent,
        timestamp: new Date().toISOString(),
      };

      const data = {
        title: title.trim(),
        description: description.trim() || null,
        type,
        priority,
        page_url: window.location.href,
        page_title: document.title,
        metadata,
      };

      const formData = new FormData();
      formData.append('data', JSON.stringify(data));
      if (imageFile) formData.append('image', imageFile);

      const res = await tenantFetch(`/api/projects/${projectId}/feedback`, {
        method: 'POST',
        body: formData,
      });

      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error ?? 'Falha ao enviar feedback');

      toast.success('Feedback enviado com sucesso.');
      setOpen(false);
      resetState();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao enviar feedback.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next && !captureFlowRef.current) resetState();
        }}
      >
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <MessageSquare className="mr-2 h-4 w-4" />
            Feedback
          </Button>
        </DialogTrigger>

        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Enviar feedback</DialogTitle>
          <DialogDescription>
            Capture, cole ou envie uma imagem e descreva o que aconteceu.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={handleCaptureAreaStart} disabled={isCapturing || isSubmitting}>
              {isCapturing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Camera className="mr-2 h-4 w-4" />}
              Capturar area
            </Button>
            <Button variant="outline" size="sm" onClick={() => uploadRef.current?.click()} disabled={isSubmitting}>
              <Upload className="mr-2 h-4 w-4" />
              Upload
            </Button>
            <Button variant="outline" size="sm" disabled>
              <ClipboardPaste className="mr-2 h-4 w-4" />
              Cole com Ctrl+V
            </Button>
            <input
              ref={uploadRef}
              type="file"
              className="hidden"
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => handleUploadChange(e.target.files?.[0] ?? null)}
            />
          </div>

          {imagePreview ? (
            <div className="rounded-md border bg-slate-50 p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imagePreview} alt="Preview feedback" className="max-h-64 w-full rounded object-contain" />
            </div>
          ) : (
            <div className="rounded-md border border-dashed p-4 text-sm text-slate-500">
              Sem imagem. Opcional, mas recomendado para feedback de UI.
            </div>
          )}

          <Input
            placeholder="Titulo do feedback (obrigatorio)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div className="grid gap-2 sm:grid-cols-2">
            <select
              className="h-10 rounded-md border px-3 text-sm"
              value={type}
              onChange={(e) => setType(e.target.value as FeedbackType)}
            >
              <option value="bug">Bug</option>
              <option value="sugestao">Sugestao</option>
              <option value="elogio">Elogio</option>
              <option value="outro">Outro</option>
            </select>
            <select
              className="h-10 rounded-md border px-3 text-sm"
              value={priority}
              onChange={(e) => setPriority(e.target.value as FeedbackPriority)}
            >
              <option value="critica">Critica</option>
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baixa">Baixa</option>
            </select>
          </div>

          <Textarea
            rows={5}
            placeholder="Descreva o problema/sugestao..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={!canSubmit}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Enviar feedback
            </Button>
          </div>
        </div>
        </DialogContent>
      </Dialog>

      {overlayOpen && snapshotUrl ? (
        <ScreenCaptureOverlay
          open={overlayOpen}
          snapshotUrl={snapshotUrl}
          snapshotCanvas={snapshotCanvasRef.current}
          onCancel={() => {
            setOverlayOpen(false);
            captureFlowRef.current = false;
            setCaptureFlowActive(false);
            setSnapshotUrl(null);
            snapshotCanvasRef.current = null;
          }}
          onUseImage={(file) => {
            const preview = URL.createObjectURL(file);
            setImageFile(file);
            setImagePreview((prev) => {
              if (prev) URL.revokeObjectURL(prev);
              return preview;
            });
            setOverlayOpen(false);
            captureFlowRef.current = false;
            setCaptureFlowActive(false);
            setSnapshotUrl(null);
            snapshotCanvasRef.current = null;
            setOpen(true);
          }}
        />
      ) : null}
    </>
  );
}
