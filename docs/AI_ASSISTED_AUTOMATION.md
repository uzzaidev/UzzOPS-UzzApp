# 🤖 AUTOMAÇÃO ASSISTIDA POR IA - UZZOPS

**Versão:** 1.0
**Data:** 2026-02-08
**Status:** Mapeamento Conceitual
**Prioridade:** ALTA (BV/W estimado: 8.5)

---

## 🎯 VISÃO GERAL

### Problema Atual
Hoje, **100% das informações** no UzzOPS são inseridas **manualmente**:
- ❌ Digitar User Stories após Planning Meeting
- ❌ Digitar Daily Log após Daily Scrum
- ❌ Digitar Action Items após Retrospective
- ❌ Digitar Features após reunião com stakeholders
- ❌ Preencher campos repetitivos (DoD, critérios, etc.)

**Tempo perdido:** ~4-6 horas por sprint em digitação pura

---

### Solução Proposta: IA Assistant

Um sistema de **automação assistida por IA** que:

✅ **Recebe upload de informações** (áudio, texto, documentos)
✅ **Extrai dados estruturados** usando IA
✅ **Preenche automaticamente** templates pré-definidos
✅ **Gera documentos formatados** (atas, user stories, etc.)
✅ **Permite ajustes dinâmicos** com sugestões da IA
✅ **Aprende com padrões** do projeto

**Tempo economizado:** ~70-80% (reduz 6h para 1.5h por sprint)

---

## 📋 CASOS DE USO PRIORITÁRIOS

### 1. Daily Scrum Logger (Áudio → Daily Log)

**Fluxo:**
```
1. SM liga gravador no Daily (15 min)
2. Upload do áudio.mp3 no UzzOPS
3. IA transcreve + estrutura:
   - "Ontem fiz X" → Campo "what_did_yesterday"
   - "Hoje vou fazer Y" → Campo "what_will_do_today"
   - "Estou travado em Z" → Campo "impediments"
4. Sistema gera cards de Daily Log para cada membro
5. Time revisa e ajusta (1 clique de aprovação)
```

**Template IA:**
```json
{
  "meeting_type": "daily_scrum",
  "attendees": ["Pedro Vitor", "Luis Fernando", "Arthur"],
  "logs": [
    {
      "member": "Pedro Vitor",
      "what_did_yesterday": "Finalizei a tela de Dashboard Overview",
      "what_will_do_today": "Vou começar a integração com API de métricas",
      "impediments": ["Falta credencial do Supabase em produção"],
      "confidence": 0.95
    }
  ]
}
```

**Economia:** 15 min → 2 min (87% mais rápido)

---

### 2. Sprint Planning → User Stories

**Fluxo:**
```
1. PO apresenta features desejadas (áudio ou doc)
2. Upload no UzzOPS (aceita .mp3, .docx, .txt, .pdf)
3. IA extrai:
   - Título da feature
   - Descrição (formato "Como... Quero... Para...")
   - Critérios de aceitação
   - Story points estimados (baseado em histórico)
4. Sistema cria rascunhos de User Stories
5. Time faz Planning Poker para ajustar pontos
```

**Template IA:**
```json
{
  "meeting_type": "sprint_planning",
  "sprint_number": 3,
  "features_extracted": [
    {
      "title": "Dashboard de Velocity",
      "description": "Como Scrum Master, quero visualizar a velocity dos últimos sprints para prever capacidade futura",
      "acceptance_criteria": [
        "Exibir gráfico de barras com velocity dos últimos 6 sprints",
        "Calcular média de velocity",
        "Mostrar tendência (crescente/estável/decrescente)"
      ],
      "estimated_story_points": 5,
      "confidence": 0.88,
      "source": "Trecho: 'Precisamos de um dashboard que mostre a velocity...'"
    }
  ]
}
```

**Economia:** 60 min → 10 min (83% mais rápido)

---

### 3. Retrospective → Action Items

**Fluxo:**
```
1. Time faz retrospective (áudio ou notas)
2. Upload no UzzOPS
3. IA identifica:
   - O que deu certo → "keep_doing"
   - O que melhorar → "improve"
   - Ações concretas → "action_items"
4. Sistema cria tasks rastreáveis
5. Assign responsáveis automaticamente (baseado em contexto)
```

**Template IA:**
```json
{
  "meeting_type": "sprint_retrospective",
  "sprint_id": "sprint-002",
  "keep_doing": [
    "Daily às 9h está funcionando bem",
    "Code review em pares aumentou qualidade"
  ],
  "improve": [
    "Testes automatizados estão atrasados",
    "Definition of Done não está sendo seguido"
  ],
  "action_items": [
    {
      "description": "Criar suite de testes E2E com Playwright",
      "assignee": "Luis Fernando", // IA detectou que ele mencionou isso
      "deadline": "2026-02-15",
      "confidence": 0.92
    }
  ]
}
```

**Economia:** 30 min → 5 min (83% mais rápido)

---

### 4. Stakeholder Meeting → Features

**Fluxo:**
```
1. Reunião com cliente/stakeholder (áudio)
2. Upload no UzzOPS
3. IA extrai:
   - Necessidades do negócio
   - Problemas a resolver
   - Prioridades mencionadas
4. Sistema sugere Features no backlog
5. PO revisa e aprova
```

**Template IA:**
```json
{
  "meeting_type": "stakeholder_meeting",
  "participants": ["Pedro Vitor (PO)", "Cliente João"],
  "business_needs": [
    "Integrar chatbot com WhatsApp Business API",
    "Dashboard para acompanhar métricas de conversão"
  ],
  "features_suggested": [
    {
      "title": "Integração WhatsApp Business API",
      "priority": "high",
      "business_value": 8,
      "rationale": "Cliente mencionou: 'Isso é crítico para ir ao ar'",
      "confidence": 0.90
    }
  ]
}
```

**Economia:** 45 min → 8 min (82% mais rápido)

---

### 5. Templates Dinâmicos (Ajuste com IA)

**Fluxo:**
```
1. Time está criando User Story manualmente
2. Digita apenas o título: "Dashboard de Velocity"
3. Clica em "✨ Sugerir com IA"
4. IA preenche:
   - Descrição no formato "Como... Quero... Para..."
   - Critérios de aceitação (baseado em features similares)
   - Story points estimados
   - Tags sugeridas
5. Time ajusta o que precisar
```

**Exemplo Visual:**

```
┌─────────────────────────────────────────────────────────┐
│ Criar User Story                                [✨ IA] │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Título: Dashboard de Velocity                          │
│                                                         │
│ [✨ Sugerir Descrição com IA]                          │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ Descrição:                                      │   │
│ │ Como Scrum Master,                              │   │
│ │ Quero visualizar a velocity dos últimos sprints│   │
│ │ Para prever capacidade de entregas futuras     │   │
│ │                                                 │   │
│ │ ✓ Gerado por IA (95% confiança)                │   │
│ │ [Aceitar] [Ajustar] [Regenerar]                │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ [✨ Sugerir Critérios de Aceitação]                   │
│                                                         │
│ ☑ Exibir gráfico de barras com velocity             │
│ ☑ Calcular média e tendência                         │
│ ☑ Permitir filtrar por período                       │
│                                                         │
│ Story Points: 5 (sugerido pela IA)                    │
│                                                         │
│ [Salvar] [Cancelar]                                    │
└─────────────────────────────────────────────────────────┘
```

**Economia:** 10 min → 2 min (80% mais rápido)

---

## 🏗️ ARQUITETURA TÉCNICA

### Stack Tecnológico

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                     │
├─────────────────────────────────────────────────────────┤
│ - Upload de arquivos (áudio, docs, texto)              │
│ - Preview de transcrição                               │
│ - Editor de ajustes dinâmicos                          │
│ - Aprovação em lote (bulk actions)                     │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                  API ROUTES (Next.js)                   │
├─────────────────────────────────────────────────────────┤
│ POST /api/ai/transcribe  - Upload + transcrição        │
│ POST /api/ai/extract     - Extração estruturada        │
│ POST /api/ai/suggest     - Sugestões dinâmicas         │
│ POST /api/ai/generate    - Geração de documentos       │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                   IA SERVICES (Node.js)                 │
├─────────────────────────────────────────────────────────┤
│ 1. Transcrição: OpenAI Whisper API                     │
│ 2. Extração: OpenAI GPT-4o + function calling          │
│ 3. Contextualização: RAG (embeddings do projeto)       │
│ 4. Validação: Zod schemas                              │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                  DATABASE (Supabase)                    │
├─────────────────────────────────────────────────────────┤
│ - ai_transcriptions (áudios + texto)                   │
│ - ai_extractions (dados estruturados)                  │
│ - ai_suggestions (histórico de sugestões)              │
│ - project_embeddings (contexto do projeto)             │
└─────────────────────────────────────────────────────────┘
```

---

### Componentes Principais

#### 1. Upload Component

```typescript
// src/components/ai/ai-upload-modal.tsx

interface AIUploadModalProps {
  type: 'daily_scrum' | 'sprint_planning' | 'retrospective' | 'stakeholder_meeting'
  projectId: string
  sprintId?: string
  onComplete: (data: ExtractedData) => void
}

export function AIUploadModal({ type, projectId, sprintId, onComplete }: AIUploadModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState<{
    step: 'upload' | 'transcribe' | 'extract' | 'validate'
    percentage: number
    message: string
  }>({
    step: 'upload',
    percentage: 0,
    message: 'Aguardando upload...'
  })

  const handleUpload = async () => {
    if (!file) return

    setIsProcessing(true)

    try {
      // Step 1: Upload
      setProgress({ step: 'upload', percentage: 10, message: 'Enviando arquivo...' })
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)
      formData.append('projectId', projectId)
      if (sprintId) formData.append('sprintId', sprintId)

      // Step 2: Transcrição (se for áudio)
      setProgress({ step: 'transcribe', percentage: 30, message: 'Transcrevendo áudio...' })
      const transcribeRes = await fetch('/api/ai/transcribe', {
        method: 'POST',
        body: formData
      })
      const { transcription, transcriptionId } = await transcribeRes.json()

      // Step 3: Extração estruturada
      setProgress({ step: 'extract', percentage: 60, message: 'Extraindo informações...' })
      const extractRes = await fetch('/api/ai/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcription,
          transcriptionId,
          meetingType: type,
          projectId,
          sprintId
        })
      })
      const { data } = await extractRes.json()

      // Step 4: Validação
      setProgress({ step: 'validate', percentage: 90, message: 'Validando dados...' })
      const validated = validateExtractedData(data, type)

      setProgress({ step: 'validate', percentage: 100, message: 'Concluído!' })

      onComplete(validated)
    } catch (error) {
      toast.error('Erro ao processar arquivo')
      console.error(error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            ✨ Upload Assistido por IA - {getMeetingTypeName(type)}
          </DialogTitle>
          <DialogDescription>
            Faça upload de áudio, documento ou texto para extração automática
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Dropzone */}
          <div
            className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50"
            onClick={() => document.getElementById('file-input')?.click()}
          >
            {file ? (
              <div className="space-y-2">
                <FileAudio className="h-12 w-12 mx-auto text-green-500" />
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="font-medium">Clique ou arraste para fazer upload</p>
                <p className="text-sm text-muted-foreground">
                  Suporta: MP3, WAV, M4A, DOCX, PDF, TXT (max 25MB)
                </p>
              </div>
            )}
          </div>

          <input
            id="file-input"
            type="file"
            accept="audio/*,.docx,.pdf,.txt"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />

          {/* Progress */}
          {isProcessing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>{progress.message}</span>
                <span>{progress.percentage}%</span>
              </div>
              <Progress value={progress.percentage} />
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {progress.step === 'transcribe' && (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Usando OpenAI Whisper...</span>
                  </>
                )}
                {progress.step === 'extract' && (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Usando GPT-4o para extração estruturada...</span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Info sobre o contexto */}
          <Alert>
            <Sparkles className="h-4 w-4" />
            <AlertTitle>Contexto do Projeto</AlertTitle>
            <AlertDescription>
              A IA já conhece o histórico do projeto e vai adaptar as sugestões
              ao seu estilo de trabalho.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onComplete(null)}>
            Cancelar
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!file || isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Processar com IA
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

---

#### 2. API Routes

##### `/api/ai/transcribe` - Transcrição

```typescript
// src/app/api/ai/transcribe/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Verificar autenticação
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string
    const projectId = formData.get('projectId') as string
    const sprintId = formData.get('sprintId') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validar tamanho (max 25MB)
    if (file.size > 25 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 25MB)' }, { status: 400 })
    }

    // Transcrever com Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
      language: 'pt', // Português
      response_format: 'verbose_json',
      timestamp_granularities: ['segment'] // Para saber quem falou quando
    })

    // Salvar no banco
    const { data: saved, error: dbError } = await supabase
      .from('ai_transcriptions')
      .insert({
        project_id: projectId,
        sprint_id: sprintId,
        meeting_type: type,
        file_name: file.name,
        file_size: file.size,
        transcription_text: transcription.text,
        transcription_segments: transcription.segments,
        duration_seconds: transcription.duration,
        created_by: session.user.id
      })
      .select()
      .single()

    if (dbError) throw dbError

    return NextResponse.json({
      transcription: transcription.text,
      transcriptionId: saved.id,
      segments: transcription.segments,
      duration: transcription.duration
    })

  } catch (error) {
    console.error('Transcription error:', error)
    return NextResponse.json(
      { error: 'Failed to transcribe audio' },
      { status: 500 }
    )
  }
}
```

---

##### `/api/ai/extract` - Extração Estruturada

```typescript
// src/app/api/ai/extract/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import OpenAI from 'openai'
import { z } from 'zod'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

// Schemas de validação
const DailyLogSchema = z.object({
  meeting_type: z.literal('daily_scrum'),
  attendees: z.array(z.string()),
  logs: z.array(z.object({
    member: z.string(),
    what_did_yesterday: z.string(),
    what_will_do_today: z.string(),
    impediments: z.array(z.string()),
    confidence: z.number().min(0).max(1)
  }))
})

const SprintPlanningSchema = z.object({
  meeting_type: z.literal('sprint_planning'),
  sprint_number: z.number().optional(),
  features_extracted: z.array(z.object({
    title: z.string(),
    description: z.string(),
    acceptance_criteria: z.array(z.string()),
    estimated_story_points: z.number(),
    confidence: z.number(),
    source: z.string()
  }))
})

const RetrospectiveSchema = z.object({
  meeting_type: z.literal('sprint_retrospective'),
  sprint_id: z.string().optional(),
  keep_doing: z.array(z.string()),
  improve: z.array(z.string()),
  action_items: z.array(z.object({
    description: z.string(),
    assignee: z.string().optional(),
    deadline: z.string().optional(),
    confidence: z.number()
  }))
})

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { transcription, transcriptionId, meetingType, projectId, sprintId } = body

    // Buscar contexto do projeto (últimas features, team members, etc)
    const [featuresRes, membersRes] = await Promise.all([
      supabase
        .from('features')
        .select('title, description, story_points')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(10),
      supabase
        .from('team_members')
        .select('user:users(full_name, email)')
        .eq('project_id', projectId)
    ])

    const recentFeatures = featuresRes.data || []
    const teamMembers = (membersRes.data || []).map(m => m.user.full_name)

    // Prompt baseado no tipo de reunião
    const systemPrompt = getSystemPrompt(meetingType, {
      recentFeatures,
      teamMembers,
      projectId
    })

    // Chamar GPT-4o com function calling
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: transcription }
      ],
      functions: [getFunctionSchema(meetingType)],
      function_call: { name: `extract_${meetingType}` },
      temperature: 0.3 // Baixa temperatura para consistência
    })

    const functionCall = completion.choices[0].message.function_call
    if (!functionCall) {
      throw new Error('No function call returned')
    }

    const extractedData = JSON.parse(functionCall.arguments)

    // Validar com Zod
    let validated
    switch (meetingType) {
      case 'daily_scrum':
        validated = DailyLogSchema.parse(extractedData)
        break
      case 'sprint_planning':
        validated = SprintPlanningSchema.parse(extractedData)
        break
      case 'sprint_retrospective':
        validated = RetrospectiveSchema.parse(extractedData)
        break
      default:
        throw new Error('Invalid meeting type')
    }

    // Salvar extração no banco
    const { data: saved, error: dbError } = await supabase
      .from('ai_extractions')
      .insert({
        transcription_id: transcriptionId,
        project_id: projectId,
        sprint_id: sprintId,
        meeting_type: meetingType,
        extracted_data: validated,
        created_by: session.user.id
      })
      .select()
      .single()

    if (dbError) throw dbError

    return NextResponse.json({
      data: validated,
      extractionId: saved.id,
      tokens_used: completion.usage?.total_tokens
    })

  } catch (error) {
    console.error('Extraction error:', error)
    return NextResponse.json(
      { error: 'Failed to extract data' },
      { status: 500 }
    )
  }
}

// Helper: System prompt dinâmico
function getSystemPrompt(
  meetingType: string,
  context: { recentFeatures: any[]; teamMembers: string[]; projectId: string }
): string {
  const basePrompt = `Você é um assistente especializado em metodologia Scrum.
Seu objetivo é extrair informações estruturadas de transcrições de reuniões.

**Contexto do Projeto:**
- Time: ${context.teamMembers.join(', ')}
- Features recentes: ${context.recentFeatures.map(f => f.title).join(', ')}

**Instruções:**
- Extraia APENAS informações explicitamente mencionadas
- Use os nomes EXATOS dos membros do time
- Mantenha o formato "Como... Quero... Para..." para User Stories
- Indique confidence (0.0-1.0) baseado na clareza da informação
- Se houver dúvida, marque confidence < 0.7
`

  switch (meetingType) {
    case 'daily_scrum':
      return basePrompt + `
**Tipo de Reunião:** Daily Scrum (15 min)

**O que extrair:**
1. Lista de participantes
2. Para cada membro:
   - O que fez ontem
   - O que fará hoje
   - Impedimentos (se houver)

**Dicas:**
- Frases como "Terminei X" → what_did_yesterday
- Frases como "Vou fazer Y" → what_will_do_today
- Frases como "Estou travado em Z" → impediments
`

    case 'sprint_planning':
      return basePrompt + `
**Tipo de Reunião:** Sprint Planning

**O que extrair:**
1. Número do sprint (se mencionado)
2. Para cada feature discutida:
   - Título conciso
   - Descrição no formato: "Como [papel], quero [ação], para [benefício]"
   - Critérios de aceitação (lista de verificação)
   - Story points estimados (baseado em complexidade mencionada)
   - Trecho original que originou a feature

**Dicas:**
- Palavras como "precisamos", "importante ter" → indicam features
- Números mencionados (3, 5, 8, 13) → provavelmente story points
- "Quando estiver pronto, deve..." → critério de aceitação
`

    case 'sprint_retrospective':
      return basePrompt + `
**Tipo de Reunião:** Sprint Retrospective

**O que extrair:**
1. O que continuar fazendo (keep_doing)
2. O que melhorar (improve)
3. Ações concretas (action_items):
   - Descrição clara
   - Responsável (se mencionado)
   - Prazo (se mencionado)

**Dicas:**
- "Está funcionando bem" → keep_doing
- "Precisamos melhorar" → improve
- "Vamos fazer X" → action_item
- Nome de pessoa + ação → assignee
`

    default:
      return basePrompt
  }
}

// Helper: Function schema para OpenAI
function getFunctionSchema(meetingType: string) {
  switch (meetingType) {
    case 'daily_scrum':
      return {
        name: 'extract_daily_scrum',
        description: 'Extract structured data from Daily Scrum transcription',
        parameters: {
          type: 'object',
          properties: {
            meeting_type: { type: 'string', enum: ['daily_scrum'] },
            attendees: {
              type: 'array',
              items: { type: 'string' },
              description: 'List of team members who attended'
            },
            logs: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  member: { type: 'string' },
                  what_did_yesterday: { type: 'string' },
                  what_will_do_today: { type: 'string' },
                  impediments: {
                    type: 'array',
                    items: { type: 'string' }
                  },
                  confidence: { type: 'number', minimum: 0, maximum: 1 }
                },
                required: ['member', 'what_did_yesterday', 'what_will_do_today', 'impediments', 'confidence']
              }
            }
          },
          required: ['meeting_type', 'attendees', 'logs']
        }
      }

    case 'sprint_planning':
      return {
        name: 'extract_sprint_planning',
        description: 'Extract User Stories from Sprint Planning transcription',
        parameters: {
          type: 'object',
          properties: {
            meeting_type: { type: 'string', enum: ['sprint_planning'] },
            sprint_number: { type: 'number' },
            features_extracted: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  acceptance_criteria: {
                    type: 'array',
                    items: { type: 'string' }
                  },
                  estimated_story_points: { type: 'number' },
                  confidence: { type: 'number' },
                  source: { type: 'string' }
                },
                required: ['title', 'description', 'acceptance_criteria', 'estimated_story_points', 'confidence', 'source']
              }
            }
          },
          required: ['meeting_type', 'features_extracted']
        }
      }

    case 'sprint_retrospective':
      return {
        name: 'extract_sprint_retrospective',
        description: 'Extract action items from Retrospective transcription',
        parameters: {
          type: 'object',
          properties: {
            meeting_type: { type: 'string', enum: ['sprint_retrospective'] },
            sprint_id: { type: 'string' },
            keep_doing: {
              type: 'array',
              items: { type: 'string' }
            },
            improve: {
              type: 'array',
              items: { type: 'string' }
            },
            action_items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  description: { type: 'string' },
                  assignee: { type: 'string' },
                  deadline: { type: 'string' },
                  confidence: { type: 'number' }
                },
                required: ['description', 'confidence']
              }
            }
          },
          required: ['meeting_type', 'keep_doing', 'improve', 'action_items']
        }
      }

    default:
      throw new Error('Invalid meeting type')
  }
}
```

---

##### `/api/ai/suggest` - Sugestões Dinâmicas

```typescript
// src/app/api/ai/suggest/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { field, context, projectId } = body
    // field: 'description' | 'acceptance_criteria' | 'story_points'
    // context: { title: "Dashboard de Velocity", ... }

    // Buscar features similares (RAG)
    const { data: similarFeatures } = await supabase
      .from('features')
      .select('title, description, acceptance_criteria, story_points')
      .eq('project_id', projectId)
      .textSearch('title', context.title, { type: 'websearch' })
      .limit(3)

    const prompt = getSuggestionPrompt(field, context, similarFeatures || [])

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Modelo mais rápido para sugestões
      messages: [
        { role: 'system', content: 'Você é um assistente Scrum especializado em User Stories.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 500
    })

    const suggestion = completion.choices[0].message.content

    // Salvar sugestão no banco (para analytics)
    await supabase.from('ai_suggestions').insert({
      project_id: projectId,
      field,
      context,
      suggestion,
      user_id: session.user.id
    })

    return NextResponse.json({
      suggestion,
      tokens_used: completion.usage?.total_tokens
    })

  } catch (error) {
    console.error('Suggestion error:', error)
    return NextResponse.json(
      { error: 'Failed to generate suggestion' },
      { status: 500 }
    )
  }
}

function getSuggestionPrompt(
  field: string,
  context: any,
  similarFeatures: any[]
): string {
  const baseContext = `
**Título da Feature:** ${context.title}
${context.description ? `**Descrição atual:** ${context.description}` : ''}

**Features similares no projeto:**
${similarFeatures.map((f, i) => `
${i + 1}. ${f.title}
   Descrição: ${f.description}
   Pontos: ${f.story_points}
`).join('\n')}
`

  switch (field) {
    case 'description':
      return baseContext + `
**Tarefa:** Escreva uma descrição concisa no formato "Como... Quero... Para..." baseado no título acima.

**Formato:**
Como [papel/persona],
Quero [ação/funcionalidade],
Para [benefício/objetivo].

**Responda APENAS com a descrição, sem explicações adicionais.**
`

    case 'acceptance_criteria':
      return baseContext + `
**Tarefa:** Gere 3-5 critérios de aceitação objetivos e testáveis para esta feature.

**Formato:** Lista com bullets (cada item deve ser verificável com "✓" ou "✗")

**Exemplo:**
- Exibir gráfico de barras com velocity dos últimos 6 sprints
- Calcular média de velocity automaticamente
- Permitir filtrar por período (últimos 3, 6 ou 12 sprints)

**Responda APENAS com a lista de critérios, um por linha, sem explicações adicionais.**
`

    case 'story_points':
      return baseContext + `
**Tarefa:** Estime os story points (escala Fibonacci: 1, 2, 3, 5, 8, 13, 21) baseado na complexidade desta feature.

**Considere:**
- Complexidade técnica
- Incerteza
- Esforço estimado
- Comparação com features similares (veja acima)

**Responda APENAS com o número (ex: "5"), sem explicações.**
`

    default:
      return baseContext
  }
}
```

---

#### 3. Review Component (Aprovação em Lote)

```typescript
// src/components/ai/ai-review-modal.tsx

interface AIReviewModalProps {
  extractedData: ExtractedData
  onApprove: (data: ExtractedData) => void
  onReject: () => void
}

export function AIReviewModal({ extractedData, onApprove, onReject }: AIReviewModalProps) {
  const [editedData, setEditedData] = useState(extractedData)

  return (
    <Dialog open onOpenChange={() => {}}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>✨ Revisão de Dados Extraídos</DialogTitle>
          <DialogDescription>
            Revise as informações extraídas pela IA antes de salvar
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Daily Scrum */}
          {extractedData.meeting_type === 'daily_scrum' && (
            <div className="space-y-4">
              {extractedData.logs.map((log, idx) => (
                <Card key={idx}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{log.member}</CardTitle>
                      <Badge variant={log.confidence > 0.8 ? 'success' : 'warning'}>
                        {(log.confidence * 100).toFixed(0)}% confiança
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Yesterday */}
                    <div>
                      <Label>O que fez ontem:</Label>
                      <Textarea
                        value={log.what_did_yesterday}
                        onChange={(e) => {
                          const updated = [...editedData.logs]
                          updated[idx].what_did_yesterday = e.target.value
                          setEditedData({ ...editedData, logs: updated })
                        }}
                        rows={2}
                      />
                    </div>

                    {/* Today */}
                    <div>
                      <Label>O que fará hoje:</Label>
                      <Textarea
                        value={log.what_will_do_today}
                        onChange={(e) => {
                          const updated = [...editedData.logs]
                          updated[idx].what_will_do_today = e.target.value
                          setEditedData({ ...editedData, logs: updated })
                        }}
                        rows={2}
                      />
                    </div>

                    {/* Impediments */}
                    {log.impediments.length > 0 && (
                      <div>
                        <Label>Impedimentos:</Label>
                        <ul className="list-disc list-inside space-y-1">
                          {log.impediments.map((imp, impIdx) => (
                            <li key={impIdx} className="text-sm">
                              <Input
                                value={imp}
                                onChange={(e) => {
                                  const updated = [...editedData.logs]
                                  updated[idx].impediments[impIdx] = e.target.value
                                  setEditedData({ ...editedData, logs: updated })
                                }}
                                className="inline-block w-[90%]"
                              />
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Sprint Planning */}
          {extractedData.meeting_type === 'sprint_planning' && (
            <div className="space-y-4">
              {extractedData.features_extracted.map((feature, idx) => (
                <Card key={idx}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{feature.title}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge>{feature.estimated_story_points} pts</Badge>
                        <Badge variant={feature.confidence > 0.8 ? 'success' : 'warning'}>
                          {(feature.confidence * 100).toFixed(0)}%
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Description */}
                    <div>
                      <Label>Descrição:</Label>
                      <Textarea
                        value={feature.description}
                        onChange={(e) => {
                          const updated = [...editedData.features_extracted]
                          updated[idx].description = e.target.value
                          setEditedData({ ...editedData, features_extracted: updated })
                        }}
                        rows={3}
                      />
                    </div>

                    {/* Acceptance Criteria */}
                    <div>
                      <Label>Critérios de Aceitação:</Label>
                      <ul className="space-y-2">
                        {feature.acceptance_criteria.map((criterion, cIdx) => (
                          <li key={cIdx} className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <Input
                              value={criterion}
                              onChange={(e) => {
                                const updated = [...editedData.features_extracted]
                                updated[idx].acceptance_criteria[cIdx] = e.target.value
                                setEditedData({ ...editedData, features_extracted: updated })
                              }}
                              className="flex-1"
                            />
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Source */}
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        <strong>Fonte:</strong> {feature.source}
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Retrospective */}
          {extractedData.meeting_type === 'sprint_retrospective' && (
            <Tabs defaultValue="keep">
              <TabsList>
                <TabsTrigger value="keep">Continuar Fazendo</TabsTrigger>
                <TabsTrigger value="improve">Melhorar</TabsTrigger>
                <TabsTrigger value="actions">Ações</TabsTrigger>
              </TabsList>

              <TabsContent value="keep" className="space-y-2">
                {extractedData.keep_doing.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <ThumbsUp className="h-4 w-4 text-green-500" />
                    <Input
                      value={item}
                      onChange={(e) => {
                        const updated = [...editedData.keep_doing]
                        updated[idx] = e.target.value
                        setEditedData({ ...editedData, keep_doing: updated })
                      }}
                    />
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="improve" className="space-y-2">
                {extractedData.improve.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                    <Input
                      value={item}
                      onChange={(e) => {
                        const updated = [...editedData.improve]
                        updated[idx] = e.target.value
                        setEditedData({ ...editedData, improve: updated })
                      }}
                    />
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="actions" className="space-y-4">
                {extractedData.action_items.map((action, idx) => (
                  <Card key={idx}>
                    <CardContent className="pt-4 space-y-2">
                      <Input
                        placeholder="Descrição da ação"
                        value={action.description}
                        onChange={(e) => {
                          const updated = [...editedData.action_items]
                          updated[idx].description = e.target.value
                          setEditedData({ ...editedData, action_items: updated })
                        }}
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <Select
                          value={action.assignee}
                          onValueChange={(value) => {
                            const updated = [...editedData.action_items]
                            updated[idx].assignee = value
                            setEditedData({ ...editedData, action_items: updated })
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Responsável" />
                          </SelectTrigger>
                          <SelectContent>
                            {/* Team members */}
                          </SelectContent>
                        </Select>
                        <Input
                          type="date"
                          value={action.deadline}
                          onChange={(e) => {
                            const updated = [...editedData.action_items]
                            updated[idx].deadline = e.target.value
                            setEditedData({ ...editedData, action_items: updated })
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onReject}>
            Descartar
          </Button>
          <Button onClick={() => onApprove(editedData)}>
            <Check className="h-4 w-4 mr-2" />
            Aprovar e Salvar ({getItemCount(editedData)} itens)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function getItemCount(data: ExtractedData): number {
  if (data.meeting_type === 'daily_scrum') return data.logs.length
  if (data.meeting_type === 'sprint_planning') return data.features_extracted.length
  if (data.meeting_type === 'sprint_retrospective') return data.action_items.length
  return 0
}
```

---

## 🗄️ DATABASE SCHEMA

### Nova Migration: `011_ai_assistant.sql`

```sql
-- ============================================================================
-- MIGRATION 011: AI ASSISTANT
-- ============================================================================
-- Descrição: Tabelas para automação assistida por IA
-- Autor: Claude Code + Pedro Vitor
-- Data: 2026-02-08
-- ============================================================================

-- ============================================================================
-- 1. AI TRANSCRIPTIONS
-- ============================================================================
-- Armazena áudios transcritos (Whisper)

CREATE TABLE ai_transcriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  sprint_id UUID REFERENCES sprints(id) ON DELETE CASCADE,

  -- Metadata do arquivo
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL, -- bytes
  meeting_type TEXT NOT NULL CHECK (meeting_type IN (
    'daily_scrum',
    'sprint_planning',
    'sprint_review',
    'sprint_retrospective',
    'stakeholder_meeting',
    'other'
  )),

  -- Transcrição
  transcription_text TEXT NOT NULL,
  transcription_segments JSONB, -- Whisper segments (timestamp + speaker)
  duration_seconds INTEGER,

  -- Metadata
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Índices
  CONSTRAINT ai_transcriptions_file_size_check CHECK (file_size <= 26214400) -- 25MB
);

CREATE INDEX idx_ai_transcriptions_project ON ai_transcriptions(project_id);
CREATE INDEX idx_ai_transcriptions_sprint ON ai_transcriptions(sprint_id);
CREATE INDEX idx_ai_transcriptions_type ON ai_transcriptions(meeting_type);
CREATE INDEX idx_ai_transcriptions_created ON ai_transcriptions(created_at DESC);

-- Full-text search na transcrição
CREATE INDEX idx_ai_transcriptions_text_search
ON ai_transcriptions
USING gin(to_tsvector('portuguese', transcription_text));

COMMENT ON TABLE ai_transcriptions IS 'Transcrições de áudios usando OpenAI Whisper';
COMMENT ON COLUMN ai_transcriptions.transcription_segments IS 'Segments do Whisper com timestamps e speaker diarization';

-- ============================================================================
-- 2. AI EXTRACTIONS
-- ============================================================================
-- Armazena dados estruturados extraídos pela IA

CREATE TABLE ai_extractions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transcription_id UUID NOT NULL REFERENCES ai_transcriptions(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  sprint_id UUID REFERENCES sprints(id) ON DELETE CASCADE,

  -- Tipo e dados
  meeting_type TEXT NOT NULL,
  extracted_data JSONB NOT NULL,

  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',    -- Aguardando revisão
    'approved',   -- Aprovado pelo usuário
    'rejected',   -- Rejeitado
    'applied'     -- Aplicado ao sistema
  )),

  -- Metadata
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  applied_at TIMESTAMPTZ,

  -- Analytics
  tokens_used INTEGER, -- OpenAI tokens
  processing_time_ms INTEGER
);

CREATE INDEX idx_ai_extractions_transcription ON ai_extractions(transcription_id);
CREATE INDEX idx_ai_extractions_project ON ai_extractions(project_id);
CREATE INDEX idx_ai_extractions_status ON ai_extractions(status);

COMMENT ON TABLE ai_extractions IS 'Dados estruturados extraídos pela IA (GPT-4o)';
COMMENT ON COLUMN ai_extractions.extracted_data IS 'JSON com dados estruturados (varia por meeting_type)';

-- ============================================================================
-- 3. AI SUGGESTIONS
-- ============================================================================
-- Armazena sugestões dinâmicas da IA (campo por campo)

CREATE TABLE ai_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

  -- Contexto
  field TEXT NOT NULL, -- 'description', 'acceptance_criteria', 'story_points', etc
  context JSONB NOT NULL, -- { title: "...", ... }
  suggestion TEXT NOT NULL,

  -- User feedback
  user_id UUID NOT NULL REFERENCES auth.users(id),
  accepted BOOLEAN, -- NULL = não revisado, TRUE = aceito, FALSE = rejeitado

  -- Analytics
  tokens_used INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_suggestions_project ON ai_suggestions(project_id);
CREATE INDEX idx_ai_suggestions_user ON ai_suggestions(user_id);
CREATE INDEX idx_ai_suggestions_field ON ai_suggestions(field);
CREATE INDEX idx_ai_suggestions_accepted ON ai_suggestions(accepted) WHERE accepted IS NOT NULL;

COMMENT ON TABLE ai_suggestions IS 'Sugestões de preenchimento dinâmico (GPT-4o-mini)';
COMMENT ON COLUMN ai_suggestions.accepted IS 'Feedback do usuário para melhorar sugestões futuras';

-- ============================================================================
-- 4. PROJECT EMBEDDINGS (RAG)
-- ============================================================================
-- Vetores de embeddings para RAG (Retrieval-Augmented Generation)

CREATE TABLE project_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

  -- Conteúdo
  content_type TEXT NOT NULL CHECK (content_type IN (
    'feature',
    'user_story',
    'retrospective_action',
    'daily_log',
    'documentation'
  )),
  content_id UUID, -- ID da feature, user story, etc
  content_text TEXT NOT NULL,

  -- Embedding (text-embedding-3-small, 1536 dimensions)
  embedding VECTOR(1536),

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_project_embeddings_project ON project_embeddings(project_id);
CREATE INDEX idx_project_embeddings_type ON project_embeddings(content_type);
CREATE INDEX idx_project_embeddings_content ON project_embeddings(content_id);

-- Índice de similaridade (HNSW para performance)
CREATE INDEX idx_project_embeddings_vector
ON project_embeddings
USING hnsw (embedding vector_cosine_ops);

COMMENT ON TABLE project_embeddings IS 'Embeddings para RAG (contexto inteligente)';
COMMENT ON COLUMN project_embeddings.embedding IS 'OpenAI text-embedding-3-small (1536 dims)';

-- ============================================================================
-- 5. AI USAGE ANALYTICS
-- ============================================================================
-- Rastreia uso da IA (custos, performance)

CREATE TABLE ai_usage_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),

  -- Operação
  operation_type TEXT NOT NULL CHECK (operation_type IN (
    'transcribe',
    'extract',
    'suggest',
    'embed'
  )),

  -- Custos
  tokens_used INTEGER NOT NULL,
  estimated_cost_usd NUMERIC(10, 6), -- $0.000001 precision

  -- Performance
  processing_time_ms INTEGER,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  model_used TEXT -- 'whisper-1', 'gpt-4o', 'gpt-4o-mini', etc
);

CREATE INDEX idx_ai_usage_project ON ai_usage_analytics(project_id);
CREATE INDEX idx_ai_usage_user ON ai_usage_analytics(user_id);
CREATE INDEX idx_ai_usage_operation ON ai_usage_analytics(operation_type);
CREATE INDEX idx_ai_usage_created ON ai_usage_analytics(created_at DESC);

COMMENT ON TABLE ai_usage_analytics IS 'Analytics de uso da IA (custos e performance)';

-- ============================================================================
-- 6. TRIGGERS
-- ============================================================================

-- Auto-atualizar updated_at em embeddings
CREATE OR REPLACE FUNCTION update_embedding_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_embedding_timestamp
BEFORE UPDATE ON project_embeddings
FOR EACH ROW
EXECUTE FUNCTION update_embedding_timestamp();

-- ============================================================================
-- 7. RLS POLICIES
-- ============================================================================

-- ai_transcriptions
ALTER TABLE ai_transcriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view transcriptions from their projects"
ON ai_transcriptions FOR SELECT
TO authenticated
USING (
  project_id IN (
    SELECT project_id FROM team_members
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create transcriptions in their projects"
ON ai_transcriptions FOR INSERT
TO authenticated
WITH CHECK (
  project_id IN (
    SELECT project_id FROM team_members
    WHERE user_id = auth.uid()
  )
);

-- ai_extractions
ALTER TABLE ai_extractions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view extractions from their projects"
ON ai_extractions FOR SELECT
TO authenticated
USING (
  project_id IN (
    SELECT project_id FROM team_members
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create and update extractions in their projects"
ON ai_extractions FOR ALL
TO authenticated
USING (
  project_id IN (
    SELECT project_id FROM team_members
    WHERE user_id = auth.uid()
  )
);

-- ai_suggestions
ALTER TABLE ai_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own suggestions"
ON ai_suggestions FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can create suggestions in their projects"
ON ai_suggestions FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid() AND
  project_id IN (
    SELECT project_id FROM team_members
    WHERE user_id = auth.uid()
  )
);

-- project_embeddings
ALTER TABLE project_embeddings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view embeddings from their projects"
ON project_embeddings FOR SELECT
TO authenticated
USING (
  project_id IN (
    SELECT project_id FROM team_members
    WHERE user_id = auth.uid()
  )
);

-- ai_usage_analytics
ALTER TABLE ai_usage_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own AI usage"
ON ai_usage_analytics FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "System can insert usage analytics"
ON ai_usage_analytics FOR INSERT
TO authenticated
WITH CHECK (true);

-- ============================================================================
-- 8. FUNCTIONS ÚTEIS
-- ============================================================================

-- Buscar features similares (RAG)
CREATE OR REPLACE FUNCTION search_similar_features(
  p_project_id UUID,
  p_query_text TEXT,
  p_limit INTEGER DEFAULT 5
)
RETURNS TABLE (
  feature_id UUID,
  title TEXT,
  description TEXT,
  similarity_score FLOAT
) AS $$
BEGIN
  -- Aqui você faria a busca por similaridade usando embeddings
  -- Por simplicidade, vou usar full-text search
  RETURN QUERY
  SELECT
    f.id,
    f.title,
    f.description,
    ts_rank(
      to_tsvector('portuguese', f.title || ' ' || COALESCE(f.description, '')),
      plainto_tsquery('portuguese', p_query_text)
    ) as score
  FROM features f
  WHERE
    f.project_id = p_project_id
    AND to_tsvector('portuguese', f.title || ' ' || COALESCE(f.description, ''))
        @@ plainto_tsquery('portuguese', p_query_text)
  ORDER BY score DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION search_similar_features IS 'Busca features similares por texto (base para RAG)';

-- Calcular custo total de IA por projeto
CREATE OR REPLACE FUNCTION calculate_ai_cost(
  p_project_id UUID,
  p_start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
  p_end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS NUMERIC AS $$
DECLARE
  total_cost NUMERIC;
BEGIN
  SELECT COALESCE(SUM(estimated_cost_usd), 0)
  INTO total_cost
  FROM ai_usage_analytics
  WHERE
    project_id = p_project_id
    AND created_at BETWEEN p_start_date AND p_end_date;

  RETURN total_cost;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calculate_ai_cost IS 'Calcula custo total de IA por projeto em um período';

-- ============================================================================
-- 9. SEED DE EXEMPLO (DESENVOLVIMENTO)
-- ============================================================================

-- Inserir transcription de teste
DO $$
DECLARE
  v_project_id UUID;
  v_user_id UUID;
  v_transcription_id UUID;
BEGIN
  -- Buscar primeiro projeto
  SELECT id INTO v_project_id FROM projects LIMIT 1;
  SELECT id INTO v_user_id FROM auth.users LIMIT 1;

  IF v_project_id IS NULL OR v_user_id IS NULL THEN
    RAISE NOTICE 'Não há projetos ou usuários. Pulando seed.';
    RETURN;
  END IF;

  -- Inserir transcrição de exemplo
  INSERT INTO ai_transcriptions (
    project_id,
    file_name,
    file_size,
    meeting_type,
    transcription_text,
    duration_seconds,
    created_by
  ) VALUES (
    v_project_id,
    'daily_scrum_2026_02_08.mp3',
    1024000,
    'daily_scrum',
    'Pedro: Ontem finalizei a tela de Dashboard. Hoje vou integrar com a API. Sem impedimentos. Luis: Ontem criei os endpoints de métricas. Hoje vou fazer os testes. Estou travado na credencial do Supabase.',
    420, -- 7 minutos
    v_user_id
  ) RETURNING id INTO v_transcription_id;

  -- Inserir extração de exemplo
  INSERT INTO ai_extractions (
    transcription_id,
    project_id,
    meeting_type,
    extracted_data,
    status,
    created_by,
    tokens_used
  ) VALUES (
    v_transcription_id,
    v_project_id,
    'daily_scrum',
    '{
      "meeting_type": "daily_scrum",
      "attendees": ["Pedro Vitor", "Luis Fernando"],
      "logs": [
        {
          "member": "Pedro Vitor",
          "what_did_yesterday": "Finalizei a tela de Dashboard Overview",
          "what_will_do_today": "Vou integrar com a API de métricas",
          "impediments": [],
          "confidence": 0.95
        },
        {
          "member": "Luis Fernando",
          "what_did_yesterday": "Criei os endpoints de métricas",
          "what_will_do_today": "Vou fazer os testes automatizados",
          "impediments": ["Falta credencial do Supabase em produção"],
          "confidence": 0.92
        }
      ]
    }'::jsonb,
    'pending',
    v_user_id,
    1250
  );

  RAISE NOTICE '✅ Seed de AI Assistant inserido com sucesso!';
END $$;

-- ============================================================================
-- VERIFICAÇÃO FINAL
-- ============================================================================

DO $$
DECLARE
  v_table_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_table_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name IN (
    'ai_transcriptions',
    'ai_extractions',
    'ai_suggestions',
    'project_embeddings',
    'ai_usage_analytics'
  );

  IF v_table_count = 5 THEN
    RAISE NOTICE '✅ Migration 011 completa! 5 tabelas criadas.';
    RAISE NOTICE '📊 Tabelas: ai_transcriptions, ai_extractions, ai_suggestions, project_embeddings, ai_usage_analytics';
    RAISE NOTICE '🤖 Sistema de IA Assistant pronto para uso!';
  ELSE
    RAISE EXCEPTION '❌ Erro: Esperado 5 tabelas, encontrado %', v_table_count;
  END IF;
END $$;
```

---

## 📊 USER STORIES

### Sprint 7: AI Assistant (Core) - 26 pontos

#### US-7.1: Upload e Transcrição de Áudios (8 pts)

**Como** Scrum Master,
**Quero** fazer upload de áudios de reuniões e receber transcrição automática,
**Para** eliminar a digitação manual de notas.

**Critérios de Aceitação:**
- ☑ Upload de arquivos MP3, WAV, M4A (max 25MB)
- ☑ Transcrição usando OpenAI Whisper API
- ☑ Exibir progresso em tempo real (upload → transcrição)
- ☑ Suportar português brasileiro
- ☑ Salvar transcrição no banco (`ai_transcriptions`)
- ☑ Permitir re-download da transcrição
- ☑ Exibir duração e metadata do arquivo

**Detalhes Técnicos:**
- Componente: `AIUploadModal`
- API: `POST /api/ai/transcribe`
- Model: OpenAI Whisper-1
- Custo estimado: ~$0.006 por minuto de áudio

**DoD:**
- [ ] Código commitado e merged
- [ ] Testes unitários (upload, validação)
- [ ] Testado com áudio real (Daily de 15 min)
- [ ] Performance: transcrição em < 30s (para 15min de áudio)
- [ ] Error handling (arquivo muito grande, formato inválido)

---

#### US-7.2: Extração de Daily Scrum (8 pts)

**Como** Scrum Master,
**Quero** que o sistema extraia automaticamente os Daily Logs da transcrição,
**Para** não precisar digitar manualmente para cada membro.

**Critérios de Aceitação:**
- ☑ Detectar participantes da reunião
- ☑ Extrair "O que fez ontem" para cada membro
- ☑ Extrair "O que fará hoje" para cada membro
- ☑ Extrair impedimentos (se mencionados)
- ☑ Exibir confidence score (0-100%)
- ☑ Permitir revisão antes de salvar
- ☑ Aprovar em lote (todos de uma vez)

**Detalhes Técnicos:**
- API: `POST /api/ai/extract`
- Model: GPT-4o com function calling
- Schema: `DailyLogSchema` (Zod)
- Componente: `AIReviewModal`

**DoD:**
- [ ] Código commitado
- [ ] Testes E2E (transcrição → extração → aprovação)
- [ ] Accuracy: >80% dos campos corretos (validado manualmente)
- [ ] Performance: extração em < 10s
- [ ] Daily Logs criados no banco após aprovação

---

#### US-7.3: Sugestões Dinâmicas em Forms (5 pts)

**Como** PO,
**Quero** clicar em "✨ Sugerir com IA" nos formulários de User Story,
**Para** receber descrições, critérios e estimativas pré-preenchidos.

**Critérios de Aceitação:**
- ☑ Botão "✨ Sugerir com IA" nos campos: Description, Acceptance Criteria, Story Points
- ☑ Sugestão baseada no contexto (título, features similares)
- ☑ Exibir sugestão com botões: [Aceitar] [Ajustar] [Regenerar]
- ☑ Permitir edição antes de aceitar
- ☑ Salvar feedback (aceito/rejeitado) para analytics

**Detalhes Técnicos:**
- API: `POST /api/ai/suggest`
- Model: GPT-4o-mini (mais rápido e barato)
- RAG: Buscar features similares para contextualização
- Componente: `AISuggestButton`

**DoD:**
- [ ] Código commitado
- [ ] Testes unitários (sugestão, accept, reject)
- [ ] Performance: sugestão em < 3s
- [ ] Custo: < $0.001 por sugestão

---

#### US-7.4: Analytics e Custos de IA (5 pts)

**Como** Admin,
**Quero** visualizar analytics de uso da IA (custos, tokens, performance),
**Para** controlar gastos e otimizar uso.

**Critérios de Aceitação:**
- ☑ Dashboard com métricas:
  - Custo total (últimos 30 dias)
  - Tokens usados por operação (transcribe, extract, suggest)
  - Tempo médio de processamento
  - Operações mais caras
- ☑ Gráfico de custos ao longo do tempo
- ☑ Filtrar por projeto, usuário, tipo de operação
- ☑ Exportar relatório CSV

**Detalhes Técnicos:**
- Página: `/dashboard/ai-analytics`
- Tabela: `ai_usage_analytics`
- Charts: Recharts
- Export: `csv-export` lib

**DoD:**
- [ ] Código commitado
- [ ] Dashboard funcional
- [ ] Cálculo de custo preciso (baseado em pricing da OpenAI)
- [ ] Export CSV funcionando

---

### Sprint 8: AI Assistant (Advanced) - 18 pontos

#### US-8.1: Sprint Planning Assistido (8 pts)

**Como** PO,
**Quero** fazer upload de documento de requisitos ou áudio da Planning,
**Para** gerar User Stories automaticamente.

**Critérios:**
- ☑ Upload de DOCX, PDF, TXT, MP3
- ☑ Extrair título, descrição ("Como... Quero... Para..."), critérios, story points
- ☑ Gerar múltiplas User Stories de uma vez
- ☑ Revisão em lote
- ☑ Vincular source (trecho que originou a feature)

---

#### US-8.2: Retrospective Assistida (5 pts)

**Como** Scrum Master,
**Quero** extrair action items de áudios de Retrospective,
**Para** rastrear ações automaticamente.

**Critérios:**
- ☑ Extrair: Keep Doing, Improve, Action Items
- ☑ Detectar responsável e prazo (se mencionado)
- ☑ Criar tasks rastreáveis
- ☑ Notificar responsáveis

---

#### US-8.3: RAG - Contextualização Inteligente (5 pts)

**Como** Sistema,
**Quero** usar embeddings para buscar features similares,
**Para** dar sugestões mais precisas baseadas no histórico do projeto.

**Critérios:**
- ☑ Gerar embeddings para features, user stories, docs
- ☑ Busca por similaridade (cosine similarity)
- ☑ Usar RAG em todas as sugestões da IA
- ☑ Performance: busca em < 100ms

---

## 💰 CUSTOS E ROI

### Custos Estimados (OpenAI)

**Pricing (Feb 2026):**
- **Whisper-1:** $0.006 / minuto
- **GPT-4o:** $2.50 / 1M input tokens, $10.00 / 1M output tokens
- **GPT-4o-mini:** $0.150 / 1M input tokens, $0.600 / 1M output tokens
- **text-embedding-3-small:** $0.020 / 1M tokens

**Uso Típico (por sprint de 2 semanas):**

| Operação | Frequência | Tokens | Custo Unitário | Custo Total |
|----------|-----------|--------|----------------|-------------|
| **Daily Scrum (15 min áudio)** | 10x/sprint | - | $0.09 | $0.90 |
| **Extract Daily** | 10x | ~2,000 | $0.005 | $0.05 |
| **Sprint Planning (1h áudio)** | 1x/sprint | - | $0.36 | $0.36 |
| **Extract Planning** | 1x | ~5,000 | $0.025 | $0.025 |
| **Retrospective (30 min)** | 1x/sprint | - | $0.18 | $0.18 |
| **Extract Retro** | 1x | ~2,500 | $0.012 | $0.012 |
| **Sugestões Dinâmicas** | 50x/sprint | ~500/cada | $0.0003 | $0.015 |
| **Embeddings (RAG)** | 100x/sprint | ~200/cada | $0.000004 | $0.0004 |
| | | | **TOTAL/SPRINT** | **$1.53** |

**Custo anual:** ~$40 por projeto
**Custo por 10 projetos:** ~$400/ano

---

### ROI Esperado

**Economia de Tempo (por sprint):**
- Daily Scrum: 15 min → 2 min (13 min saved × 10 = **130 min**)
- Sprint Planning: 60 min → 10 min (**50 min** saved)
- Retrospective: 30 min → 5 min (**25 min** saved)
- Sugestões: 10 min/feature × 10 features = **100 min** saved

**Total economizado:** ~305 min/sprint = **5 horas**

**Valor da hora (dev sênior):** ~$50/h
**Economia monetária:** 5h × $50 = **$250/sprint**

**ROI:** ($250 - $1.53) / $1.53 = **16,200% 🚀**

---

## 🎯 PRIORIZAÇÃO (BV/W)

| Feature | Business Value (BV) | Work Effort (W) | BV/W | Prioridade |
|---------|--------------------:|----------------:|-----:|-----------:|
| **US-7.2: Daily Scrum Extract** | 10 | 8 | **1.25** | 🔴 CRÍTICA |
| **US-7.3: Sugestões Dinâmicas** | 9 | 5 | **1.80** | 🔴 CRÍTICA |
| **US-7.1: Upload + Transcrição** | 8 | 8 | **1.00** | 🟡 ALTA |
| **US-8.1: Sprint Planning** | 9 | 8 | **1.13** | 🟡 ALTA |
| **US-8.2: Retrospective** | 7 | 5 | **1.40** | 🟡 ALTA |
| **US-7.4: Analytics** | 5 | 5 | **1.00** | 🟢 MÉDIA |
| **US-8.3: RAG** | 6 | 5 | **1.20** | 🟢 MÉDIA |

**Recomendação:** Implementar Sprints 7-8 (44 story points, ~3-4 semanas)

---

## 🚦 ROADMAP DE IMPLEMENTAÇÃO

### Fase 1: MVP (Sprint 7) - 2 semanas

**Meta:** Daily Scrum 100% automatizado

✅ **Semana 1:**
- US-7.1: Upload + Transcrição (4 dias)
- US-7.2: Daily Extract (parte 1 - extração) (1 dia)

✅ **Semana 2:**
- US-7.2: Daily Extract (parte 2 - review + aprovação) (2 dias)
- US-7.3: Sugestões Dinâmicas (2 dias)
- US-7.4: Analytics Básico (1 dia)

**Entregável:** Time consegue fazer Daily sem digitar nada

---

### Fase 2: Expansão (Sprint 8) - 2 semanas

**Meta:** Planning e Retro também automatizadas

✅ **Semana 1:**
- US-8.1: Sprint Planning (5 dias)

✅ **Semana 2:**
- US-8.2: Retrospective (3 dias)
- US-8.3: RAG (2 dias)

**Entregável:** 100% das cerimônias Scrum automatizadas

---

### Fase 3: Otimização (Sprint 9) - 1 semana

**Meta:** Polimento e UX

- Melhorar accuracy (fine-tuning de prompts)
- Adicionar shortcuts (ex: "⌘K" para sugerir)
- Mobile-friendly (upload de áudio pelo celular)
- Integração com calendário (auto-detectar reuniões)

---

## 📚 DEPENDÊNCIAS

### Pacotes NPM

```bash
pnpm add openai      # OpenAI SDK
pnpm add zod         # Schema validation (já instalado)
pnpm add @supabase/supabase-js  # Supabase (já instalado)
```

### Variáveis de Ambiente

```env
# .env.local
OPENAI_API_KEY=sk-proj-...  # OpenAI API key
```

### Supabase Extensions

```sql
-- Habilitar pgvector para embeddings
CREATE EXTENSION IF NOT EXISTS vector;
```

---

## ⚠️ CONSIDERAÇÕES

### Privacidade e Segurança

1. **Dados sensíveis em áudios:**
   - ❌ NÃO fazer upload de reuniões com clientes (LGPD)
   - ✅ Apenas reuniões internas do time
   - ⚠️ Adicionar aviso de consentimento

2. **Armazenamento:**
   - Áudios NÃO são salvos, apenas transcrições
   - Transcrições ficam no banco (RLS protegido)
   - Possibilidade de deletar após X dias (GDPR compliance)

3. **API Keys:**
   - NUNCA expor `OPENAI_API_KEY` no frontend
   - Usar API Routes (server-side apenas)
   - Rate limiting para evitar abuso

---

### Limitações Técnicas

1. **Whisper:**
   - Máximo 25MB por arquivo (~4 horas de áudio)
   - Melhor com áudio limpo (microfone de qualidade)
   - Pode ter dificuldade com sotaques fortes

2. **GPT-4o:**
   - Temperatura baixa (0.3) para consistência
   - Pode "alucinar" informações não mencionadas
   - Sempre requer revisão humana

3. **Custos:**
   - Projetos com muitas reuniões = custos maiores
   - Monitorar `ai_usage_analytics` mensalmente
   - Considerar rate limiting (ex: max 10 uploads/dia)

---

### Alternativas e Melhorias Futuras

1. **Diarização de speakers (quem falou o quê):**
   - OpenAI Whisper não suporta nativamente
   - Usar [PyAnnote](https://github.com/pyannote/pyannote-audio) (Python)
   - Ou [AssemblyAI](https://www.assemblyai.com/) (pago, $0.00025/sec)

2. **Upload direto do celular:**
   - Gravar Daily no celular
   - Upload automático via mobile app
   - PWA com MediaRecorder API

3. **Integração com calendário:**
   - Google Calendar API
   - Auto-detectar Daily Scrum (agenda recorrente)
   - Lembrete push: "Fazer upload do Daily de hoje?"

4. **Fine-tuning de modelos:**
   - Treinar modelo customizado com histórico do projeto
   - Melhorar accuracy de estimativas (story points)
   - Reconhecer termos específicos do domínio

---

## 🧪 TESTES E VALIDAÇÃO

### Testes Unitários

```typescript
// __tests__/api/ai/extract.test.ts

describe('POST /api/ai/extract', () => {
  it('should extract daily logs from transcription', async () => {
    const mockTranscription = `
      Pedro: Ontem finalizei o dashboard. Hoje vou integrar API. Sem impedimentos.
      Luis: Ontem criei endpoints. Hoje vou testar. Falta credencial do Supabase.
    `

    const response = await fetch('/api/ai/extract', {
      method: 'POST',
      body: JSON.stringify({
        transcription: mockTranscription,
        meetingType: 'daily_scrum',
        projectId: 'test-project-id'
      })
    })

    const { data } = await response.json()

    expect(data.logs).toHaveLength(2)
    expect(data.logs[0].member).toBe('Pedro Vitor')
    expect(data.logs[0].what_did_yesterday).toContain('dashboard')
    expect(data.logs[1].impediments).toContain('Supabase')
  })
})
```

### Testes E2E

```typescript
// e2e/ai-daily-upload.spec.ts

import { test, expect } from '@playwright/test'

test('Daily Scrum upload flow', async ({ page }) => {
  await page.goto('/dashboard/sprints/sprint-1')

  // Click "Upload Daily"
  await page.click('button:has-text("Upload Daily")')

  // Upload audio file
  await page.setInputFiles('input[type="file"]', 'test-fixtures/daily.mp3')

  // Click "Process with AI"
  await page.click('button:has-text("Processar com IA")')

  // Wait for transcription
  await expect(page.locator('text=Transcrevendo áudio')).toBeVisible()
  await expect(page.locator('text=Extraindo informações')).toBeVisible()

  // Review modal should appear
  await expect(page.locator('text=Revisão de Dados Extraídos')).toBeVisible()

  // Check extracted data
  const pedroCard = page.locator('text=Pedro Vitor').locator('..')
  await expect(pedroCard.locator('textarea').first()).toContainText('dashboard')

  // Approve
  await page.click('button:has-text("Aprovar e Salvar")')

  // Should see success toast
  await expect(page.locator('text=Daily Logs criados com sucesso')).toBeVisible()

  // Logs should appear in the table
  await expect(page.locator('text=Pedro Vitor')).toBeVisible()
})
```

---

## 📈 MÉTRICAS DE SUCESSO

### KPIs (Key Performance Indicators)

1. **Adoção:**
   - % de Dailys feitos com IA (meta: >80% após 1 mês)
   - % de User Stories criadas com sugestões da IA (meta: >50%)

2. **Accuracy:**
   - % de campos aprovados sem ajustes (meta: >70%)
   - % de confidence score > 0.8 (meta: >80%)

3. **Economia:**
   - Tempo economizado por sprint (meta: >5h)
   - Redução de digitação manual (meta: >70%)

4. **Satisfação:**
   - NPS da feature (meta: >8/10)
   - "Você usaria isso em outros projetos?" (meta: >90% sim)

---

## 🎉 CONCLUSÃO

A **Automação Assistida por IA** representa uma evolução significativa para o UzzOPS:

✅ **Elimina trabalho manual repetitivo** (70-80% de redução)
✅ **ROI excepcional** (16,200% - $250 economizado por $1.53 investido)
✅ **Custo acessível** (~$40/ano por projeto)
✅ **Implementação rápida** (2 sprints para MVP completo)
✅ **Melhoria contínua** (IA aprende com feedback do usuário)

**Próximo Passo:** Validar com PO e priorizar no backlog (recomendo Sprint 7-8).

---

**Versão:** 1.0
**Autor:** Claude Code + Pedro Vitor
**Data:** 2026-02-08
**Status:** Mapeamento Completo ✅
