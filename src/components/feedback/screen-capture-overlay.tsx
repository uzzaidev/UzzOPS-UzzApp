'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type Props = {
  open: boolean;
  snapshotUrl: string;
  snapshotCanvas: HTMLCanvasElement | null;
  onCancel: () => void;
  onUseImage: (file: File) => void;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function ScreenCaptureOverlay({
  open,
  snapshotUrl,
  snapshotCanvas,
  onCancel,
  onUseImage,
}: Props) {
  const [stage, setStage] = useState<'select' | 'annotate'>('select');
  const [dragging, setDragging] = useState(false);
  const [start, setStart] = useState<{ x: number; y: number } | null>(null);
  const [current, setCurrent] = useState<{ x: number; y: number } | null>(null);
  const [color, setColor] = useState('#ef4444');

  const baseCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);

  useEffect(() => {
    if (!open) return;
    setStage('select');
    setStart(null);
    setCurrent(null);
  }, [open, snapshotUrl]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = async (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c' && stage === 'annotate') {
        e.preventDefault();
        await copyToClipboardAndClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onCancel, open, stage]);

  const rect = useMemo(() => {
    if (!start || !current) return null;
    const x = Math.min(start.x, current.x);
    const y = Math.min(start.y, current.y);
    const width = Math.abs(current.x - start.x);
    const height = Math.abs(current.y - start.y);
    if (width < 2 || height < 2) return null;
    return { x, y, width, height };
  }, [current, start]);

  async function cropSelection(selection: Rect) {
    if (!snapshotCanvas) {
      toast.error('Snapshot indisponivel.');
      return;
    }
    const cssWidth = window.innerWidth;
    const cssHeight = window.innerHeight;
    const scaleX = snapshotCanvas.width / cssWidth;
    const scaleY = snapshotCanvas.height / cssHeight;

    const sx = Math.max(0, Math.floor(selection.x * scaleX));
    const sy = Math.max(0, Math.floor(selection.y * scaleY));
    const sw = Math.max(1, Math.floor(selection.width * scaleX));
    const sh = Math.max(1, Math.floor(selection.height * scaleY));

    const crop = document.createElement('canvas');
    crop.width = sw;
    crop.height = sh;
    const cropCtx = crop.getContext('2d');
    if (!cropCtx) return;
    cropCtx.drawImage(snapshotCanvas, sx, sy, sw, sh, 0, 0, sw, sh);

    const base = baseCanvasRef.current;
    const draw = drawCanvasRef.current;
    if (!base || !draw) return;

    base.width = sw;
    base.height = sh;
    draw.width = sw;
    draw.height = sh;

    const baseCtx = base.getContext('2d');
    const drawCtx = draw.getContext('2d');
    if (!baseCtx || !drawCtx) return;

    baseCtx.clearRect(0, 0, sw, sh);
    baseCtx.drawImage(crop, 0, 0);
    drawCtx.clearRect(0, 0, sw, sh);
    drawCtx.lineWidth = 3;
    drawCtx.lineCap = 'round';
    drawCtx.lineJoin = 'round';

    setStage('annotate');
  }

  function getCanvasPoint(event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) {
    const canvas = drawCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rectCanvas = canvas.getBoundingClientRect();
    const x = ((event.clientX - rectCanvas.left) / rectCanvas.width) * canvas.width;
    const y = ((event.clientY - rectCanvas.top) / rectCanvas.height) * canvas.height;
    return { x, y };
  }

  function beginDraw(event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { x, y } = getCanvasPoint(event);
    drawingRef.current = true;
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function moveDraw(event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) {
    if (!drawingRef.current) return;
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { x, y } = getCanvasPoint(event);
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  function endDraw() {
    drawingRef.current = false;
  }

  function clearAnnotations() {
    const draw = drawCanvasRef.current;
    if (!draw) return;
    const ctx = draw.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, draw.width, draw.height);
  }

  async function mergeToFile() {
    const base = baseCanvasRef.current;
    const draw = drawCanvasRef.current;
    if (!base || !draw) return null;
    const out = document.createElement('canvas');
    out.width = base.width;
    out.height = base.height;
    const outCtx = out.getContext('2d');
    if (!outCtx) return null;
    outCtx.drawImage(base, 0, 0);
    outCtx.drawImage(draw, 0, 0);
    const blob = await new Promise<Blob | null>((resolve) => out.toBlob(resolve, 'image/png', 0.95));
    if (!blob) return null;
    return new File([blob], `feedback-${Date.now()}.png`, { type: 'image/png' });
  }

  async function copyToClipboardAndClose() {
    const file = await mergeToFile();
    if (!file) {
      toast.error('Falha ao gerar imagem anotada.');
      return;
    }
    try {
      await navigator.clipboard.write([new ClipboardItem({ [file.type]: file })]);
      toast.success('Imagem copiada. Reabra o feedback e cole com Ctrl+V.');
      onCancel();
    } catch {
      toast.error('Nao foi possivel copiar para clipboard neste navegador.');
    }
  }

  async function useImageInFeedback() {
    const file = await mergeToFile();
    if (!file) {
      toast.error('Falha ao gerar imagem anotada.');
      return;
    }
    onUseImage(file);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120]">
      {stage === 'select' ? (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${snapshotUrl})` }}
          />
          <div className="absolute inset-0 bg-black/35" />
          <div
            className="absolute inset-0 cursor-crosshair"
            onMouseDown={(e) => {
              const x = clamp(e.clientX, 0, window.innerWidth);
              const y = clamp(e.clientY, 0, window.innerHeight);
              setStart({ x, y });
              setCurrent({ x, y });
              setDragging(true);
            }}
            onMouseMove={(e) => {
              if (!dragging) return;
              const x = clamp(e.clientX, 0, window.innerWidth);
              const y = clamp(e.clientY, 0, window.innerHeight);
              setCurrent({ x, y });
            }}
            onMouseUp={() => setDragging(false)}
          />

          {rect ? (
            <div
              className="pointer-events-none absolute border-2 border-sky-400 bg-sky-200/15"
              style={{ left: rect.x, top: rect.y, width: rect.width, height: rect.height }}
            />
          ) : null}

          <div className="absolute left-4 right-4 top-4 flex items-center justify-between rounded-md border bg-white/95 p-2 text-xs shadow">
            <p className="text-slate-700">Selecione a area para captura. ESC cancela.</p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={onCancel}>Cancelar</Button>
              <Button size="sm" disabled={!rect} onClick={() => rect && cropSelection(rect)}>
                Confirmar selecao
              </Button>
            </div>
          </div>
        </>
      ) : (
        <div className="absolute inset-0 bg-black/75 p-4">
          <div className="mx-auto flex h-full max-w-6xl flex-col rounded-lg border bg-white">
            <div className="flex flex-wrap items-center gap-2 border-b p-2">
              <p className="mr-2 text-xs text-slate-500">Caneta:</p>
              {['#ef4444', '#22c55e', '#3b82f6', '#eab308'].map((c) => (
                <button
                  key={c}
                  className={`h-6 w-6 rounded border ${color === c ? 'ring-2 ring-offset-1' : ''}`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                  type="button"
                />
              ))}
              <div className="ml-auto flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={clearAnnotations}>Limpar</Button>
                <Button size="sm" variant="outline" onClick={copyToClipboardAndClose}>Copiar (Ctrl+C)</Button>
                <Button size="sm" variant="outline" onClick={useImageInFeedback}>Usar no feedback</Button>
                <Button size="sm" onClick={onCancel}>Fechar</Button>
              </div>
            </div>
            <div className="relative flex-1 overflow-auto bg-slate-900 p-4">
              <div className="relative mx-auto h-fit w-fit">
                <canvas ref={baseCanvasRef} className="block max-h-[70vh] max-w-full" />
                <canvas
                  ref={drawCanvasRef}
                  className="absolute inset-0 block max-h-[70vh] max-w-full cursor-crosshair"
                  onMouseDown={beginDraw}
                  onMouseMove={moveDraw}
                  onMouseUp={endDraw}
                  onMouseLeave={endDraw}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
