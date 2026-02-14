# Plano: Sistema de Feedback Nativo com Captura de Tela e Anotação

> **Objetivo:** Botão de feedback ao lado do "Importar MD" na topbar que permite capturar
> a tela (seleção de área estilo Lightshot), anotar, escrever comentário e enviar.
> Tudo nativo — sem dependência de ferramenta externa.

---

## Visão do usuário — fluxo completo

```
[Topbar] → Clica em 💬 Feedback
      ↓
[Modal] → Escolhe modo:
      ├─ 📷 Capturar Tela   (captura a página atual)
      ├─ 📋 Colar imagem    (Ctrl+V de print existente)
      └─ 📁 Upload          (selecionar arquivo)
            ↓
[Overlay de Captura] ← apenas no modo "Capturar Tela"
   - Página fica com snapshot ao fundo
   - Cursor crosshair
   - Usuário arrasta → retângulo de seleção
   - Mouse up → área selecionada confirmada
            ↓
[Canvas de Anotação]
   - Imagem capturada/colada/uploadada aparece no canvas
   - Toolbar: Retângulo | Seta | Texto | Caneta | Cor | Desfazer
            ↓
[Formulário de Envio]
   - Título (obrigatório)
   - Tipo: Bug | Sugestão | Elogio | Outro
   - Prioridade: Crítica | Alta | Média | Baixa
   - Descrição (texto livre)
   - Preview da imagem anotada
            ↓
[API] → Upload da imagem para Supabase Storage
      → INSERT em user_feedback
      → (opcional) Notificação Discord/Slack
```

---

## Arquitetura de componentes

### Novos arquivos a criar

```
src/
├── components/
│   └── feedback/
│       ├── feedback-button.tsx        ← botão (Client) para o topbar
│       ├── feedback-modal.tsx         ← modal principal com estado da máquina
│       ├── screen-capture-overlay.tsx ← overlay fullscreen de seleção de área
│       ├── annotation-canvas.tsx      ← canvas com ferramentas de desenho
│       ├── annotation-toolbar.tsx     ← barra de ferramentas de anotação
│       └── feedback-form.tsx          ← formulário de título/tipo/descrição
├── app/
│   └── api/
│       └── feedback/
│           └── route.ts               ← POST handler (upload + insert)
└── database/
    └── migrations/
        └── 026_user_feedback.sql      ← tabela user_feedback
```

### Inserção na topbar

O `topbar.tsx` é um Server Component. A inserção é simples:

```tsx
// topbar.tsx — adicionar após MdFeederButton:
{projectId ? <MdFeederButton projectId={projectId} /> : null}
<FeedbackButton projectId={projectId} />   ← novo
<UserMenu ... />
```

`FeedbackButton` é um Client Component autossuficiente — o topbar não precisa
se tornar client.

---

## Migration 026 — tabela `user_feedback`

```sql
-- 026_user_feedback.sql
CREATE TABLE public.user_feedback (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID        NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id           UUID        NOT NULL,
  user_email        TEXT,
  user_name         TEXT,

  -- Conteúdo
  title             TEXT        NOT NULL,
  description       TEXT,
  type              TEXT        NOT NULL DEFAULT 'sugestao'
                    CHECK (type IN ('bug', 'sugestao', 'elogio', 'outro')),
  priority          TEXT        NOT NULL DEFAULT 'media'
                    CHECK (priority IN ('critica', 'alta', 'media', 'baixa')),

  -- Imagem anotada
  screenshot_url    TEXT,       -- URL pública do Supabase Storage
  screenshot_path   TEXT,       -- path interno no bucket (para deleção)

  -- Contexto automático (preenchido pelo cliente sem intervenção do usuário)
  page_url          TEXT,       -- window.location.href
  page_title        TEXT,       -- document.title
  metadata          JSONB       NOT NULL DEFAULT '{}'::jsonb,
  -- metadata contém: { viewport: {w, h}, browser, os, project_id, timestamp }

  -- Workflow
  status            TEXT        NOT NULL DEFAULT 'novo'
                    CHECK (status IN ('novo', 'em-analise', 'resolvido', 'descartado')),
  notes             TEXT,       -- notas internas do time ao analisar

  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at       TIMESTAMPTZ
);

-- Índices
CREATE INDEX idx_user_feedback_tenant_status
  ON public.user_feedback(tenant_id, status, created_at DESC);

CREATE INDEX idx_user_feedback_tenant_type
  ON public.user_feedback(tenant_id, type, created_at DESC);

-- RLS
ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;

-- Qualquer membro do tenant pode inserir
CREATE POLICY "tenant_insert_feedback"
  ON public.user_feedback FOR INSERT
  WITH CHECK (
    tenant_id IN (
      SELECT company_id FROM public.company_members WHERE user_id = auth.uid()
    )
  );

-- Qualquer membro do tenant pode ver
CREATE POLICY "tenant_select_feedback"
  ON public.user_feedback FOR SELECT
  USING (
    tenant_id IN (
      SELECT company_id FROM public.company_members WHERE user_id = auth.uid()
    )
  );

NOTIFY pgrst, 'reload schema';
```

---

## Supabase Storage — bucket `feedback-screenshots`

Criar via Supabase Dashboard ou migration:

```sql
-- Dentro de 026_user_feedback.sql ou separado:
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'feedback-screenshots',
  'feedback-screenshots',
  false,                    -- bucket privado (URL assinada)
  5242880,                  -- 5MB por imagem
  ARRAY['image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Policy: membro do tenant pode fazer upload
CREATE POLICY "tenant_upload_feedback_screenshots"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'feedback-screenshots'
    AND auth.uid() IS NOT NULL
  );

-- Policy: membro do tenant pode ler
CREATE POLICY "tenant_read_feedback_screenshots"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'feedback-screenshots'
    AND auth.uid() IS NOT NULL
  );
```

---

## API Route — `POST /api/feedback`

**Entrada:** `multipart/form-data`
- `image`: File (PNG) — imagem anotada
- `data`: JSON string com { title, type, priority, description, pageUrl, pageTitle, projectId, metadata }

**Lógica:**

```
1. Autenticar usuário (createClient + getUser)
2. Extrair tenant_id via company_members
3. Fazer upload da imagem:
   supabase.storage
     .from('feedback-screenshots')
     .upload(`${tenantId}/${feedbackId}.png`, imageBuffer, { contentType: 'image/png' })
4. Gerar URL assinada (1 ano): getSignedUrl(path, 31536000)
5. INSERT em user_feedback com todos os campos
6. (Opcional) POST para webhook Discord/Slack
7. Retornar { data: { id, screenshot_url } }
```

---

## Screen Capture — abordagem técnica

### Biblioteca: `html2canvas` (já no projeto!)

O projeto já usa `html2canvas` para export de PDF (`"html2canvas": "^1.4.1"`).
Não é necessário instalar nada novo.

### Fluxo de captura

```typescript
// 1. Capturar página atual como canvas
const pageCanvas = await html2canvas(document.body, {
  useCORS: true,
  allowTaint: false,
  scale: window.devicePixelRatio,  // retina-aware
  logging: false,
});

// 2. Exibir fullscreen com a imagem ao fundo
// overlay.style.backgroundImage = `url(${pageCanvas.toDataURL()})`

// 3. Usuário arrasta → selecionar área (mousedown/mousemove/mouseup)
// Retângulo de seleção desenhado sobre o overlay

// 4. Mouse up → recortar a área selecionada do pageCanvas
const ctx = pageCanvas.getContext('2d');
const croppedCanvas = document.createElement('canvas');
croppedCanvas.width = selection.width;
croppedCanvas.height = selection.height;
croppedCanvas.getContext('2d').drawImage(
  pageCanvas,
  selection.x, selection.y, selection.width, selection.height,
  0, 0, selection.width, selection.height
);

// 5. croppedCanvas vira a imagem base do AnnotationCanvas
```

### Alternativa via Clipboard API (Ctrl+V)

```typescript
document.addEventListener('paste', (e: ClipboardEvent) => {
  const item = Array.from(e.clipboardData?.items ?? [])
    .find(i => i.type.startsWith('image/'));
  if (!item) return;
  const blob = item.getAsFile();
  const url = URL.createObjectURL(blob);
  // → carregar no AnnotationCanvas
});
```

### Upload de arquivo

```tsx
<input
  type="file"
  accept="image/*"
  onChange={(e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    // → carregar no AnnotationCanvas
  }}
/>
```

---

## Annotation Canvas — ferramentas

O canvas de anotação usa **Canvas 2D API pura** — sem biblioteca adicional.

### Ferramentas mínimas (v1)

| Ferramenta | Ícone | Comportamento |
|---|---|---|
| Retângulo | `Square` | Drag → desenha borda colorida |
| Seta | `ArrowRight` | Click-drag → seta apontando |
| Texto | `Type` | Click → input aparece na posição |
| Caneta livre | `Pencil` | Freehand path |
| Cor | paleta | Red (padrão) / Yellow / Blue / Green |
| Desfazer | `Undo2` | Remove última anotação |
| Limpar tudo | `Trash2` | Remove todas as anotações |

### Estrutura de dados interna (estado do canvas)

```typescript
type Annotation =
  | { type: 'rect';  x: number; y: number; w: number; h: number; color: string }
  | { type: 'arrow'; x1: number; y1: number; x2: number; y2: number; color: string }
  | { type: 'text';  x: number; y: number; text: string; color: string }
  | { type: 'path';  points: [number, number][]; color: string };

// Estado:
const [annotations, setAnnotations] = useState<Annotation[]>([]);

// Render: a cada mudança, redesenhar:
// 1. drawImage(baseImage, 0, 0)
// 2. Para cada annotation → desenhar sobre a imagem
```

### Export final

```typescript
// Retorna PNG blob com anotações fundidas
canvas.toBlob((blob) => {
  // blob → enviar para a API route
}, 'image/png', 0.95);
```

---

## Componente `FeedbackButton` — ponto de entrada

```
Estado da máquina (máquina simples de estados):

idle
  → (click) → modal_open

modal_open
  → (selecionar "Capturar Tela") → capturing
  → (paste / upload) → annotating

capturing
  → (html2canvas completo) → selecting_area
  → (ESC) → modal_open

selecting_area  [overlay fullscreen]
  → (drag release) → annotating
  → (ESC) → modal_open

annotating  [canvas + toolbar]
  → (continuar) → form
  → (voltar) → modal_open

form  [campos + preview]
  → (enviar) → submitting
  → (cancelar) → modal_open

submitting
  → (sucesso) → success → idle
  → (erro) → form (com toast de erro)
```

---

## Metadados automáticos coletados

Estes dados são coletados silenciosamente no cliente, sem perguntar ao usuário:

```typescript
const metadata = {
  viewport: { w: window.innerWidth, h: window.innerHeight },
  devicePixelRatio: window.devicePixelRatio,
  browser: navigator.userAgent,  // simplificado
  page_url: window.location.href,
  page_title: document.title,
  project_id: projectId,          // do contexto
  timestamp: new Date().toISOString(),
};
```

Isso permite ao time reproduzir exatamente o contexto do feedback sem perguntar.

---

## Notificação (opcional — fase 2)

Após insert bem-sucedido, a API pode enviar um POST para um webhook:

```typescript
// Na API route, após o insert:
if (process.env.FEEDBACK_WEBHOOK_URL) {
  await fetch(process.env.FEEDBACK_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: `**Novo Feedback [${data.type.toUpperCase()}]** — ${data.title}`,
      embeds: [{
        title: data.title,
        description: data.description,
        color: data.type === 'bug' ? 0xFF0000 : 0x5865F2,
        fields: [
          { name: 'Prioridade', value: data.priority, inline: true },
          { name: 'Página', value: data.pageUrl, inline: true },
          { name: 'Por', value: data.userEmail, inline: true },
        ],
        image: { url: screenshotUrl },
      }]
    }),
  });
}
```

Compatível com Discord webhook (direto) ou Slack (formato levemente diferente).

---

## Fases de implementação

### Fase 1 — Base (prioritária)
Foco: funciona sem screen capture (upload/paste), formulário completo, storage e DB.

- [ ] `026_user_feedback.sql` — migration + bucket
- [ ] `POST /api/feedback/route.ts` — upload + insert
- [ ] `feedback-button.tsx` — botão no topbar
- [ ] `feedback-modal.tsx` — modal com 3 modos de entrada
- [ ] `feedback-form.tsx` — formulário com título/tipo/prioridade/descrição
- [ ] Inserção no `topbar.tsx`

**Resultado:** Feedback via upload/paste já funciona 100%.

### Fase 2 — Screen Capture
Foco: captura nativa da página atual.

- [ ] `screen-capture-overlay.tsx` — overlay fullscreen + seleção de área
- [ ] Integração com `html2canvas` (já instalado)
- [ ] Estado "capturing → selecting_area" na máquina de estados

**Resultado:** Experiência Lightshot nativa.

### Fase 3 — Anotação
Foco: ferramentas de desenho sobre a imagem capturada.

- [ ] `annotation-canvas.tsx` — canvas 2D com render das anotações
- [ ] `annotation-toolbar.tsx` — toolbar com 6 ferramentas
- [ ] Undo / clear
- [ ] Export do canvas como PNG

**Resultado:** Experiência completa — captura + desenho + envio.

### Fase 4 — Gestão de feedbacks (futuro)
Nova página `/projects/[id]/feedback` para visualizar e gerenciar feedbacks recebidos.
Fora do escopo imediato.

---

## Dependências

**Zero novas dependências para as Fases 1–3.**

| Recurso | Como | Já disponível? |
|---|---|---|
| Modal/Dialog | `shadcn/ui Dialog` | ✅ |
| Canvas 2D | API nativa do browser | ✅ |
| Clipboard paste | `ClipboardEvent` nativa | ✅ |
| Page screenshot | `html2canvas` | ✅ já no projeto |
| Upload storage | `supabase.storage` | ✅ |
| Toast de sucesso | `sonner` | ✅ |
| Ícones | `lucide-react` | ✅ |

---

## Resumo das decisões de design

| Decisão | Alternativa descartada | Por quê |
|---|---|---|
| `html2canvas` para captura | `getDisplayMedia()` (Screen Capture API) | `getDisplayMedia` abre diálogo nativo do OS pedindo qual tela capturar — interrompe o fluxo e é confuso. `html2canvas` captura a página atual silenciosamente, que é exatamente o que o usuário quer ao dar feedback sobre o app. |
| Canvas 2D puro para anotação | `fabric.js` / `konva.js` | Fabric/Konva têm ~250KB cada. O conjunto de ferramentas necessário (rect, arrow, text, path) é simples o suficiente para Canvas 2D sem dependência. |
| Bucket privado com URL assinada | Bucket público | Screenshots de feedback podem conter dados sensíveis do sistema. URL assinada com expiração de 1 ano é o balanço correto. |
| Máquina de estados explícita | Múltiplos booleans (`isCapturing`, `isAnnotating`...) | Com 6 estados possíveis, booleans geram estados impossíveis (ex: `isCapturing = true && isAnnotating = true`). Uma string enum elimina isso. |
| Metadados automáticos | Perguntar viewport/browser ao usuário | O usuário não sabe o que é "viewport". Coletar silenciosamente no cliente dá contexto de reprodução sem atrito. |
