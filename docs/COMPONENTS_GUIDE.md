# 🧩 UZZOPS - COMPONENTS GUIDE

**Versão:** 1.0.0
**Última Atualização:** 2026-02-07
**Autor:** UzzAI Team

---

## 📑 ÍNDICE

1. [Visão Geral](#visão-geral)
2. [Arquitetura de Componentes](#arquitetura-de-componentes)
3. [UI Components (Shadcn/ui)](#ui-components-shadcnui)
4. [Shared Components](#shared-components)
5. [Dashboard Components](#dashboard-components)
6. [Features Components](#features-components)
7. [Sprints Components](#sprints-components)
8. [Padrões e Convenções](#padrões-e-convenções)
9. [Hooks Customizados](#hooks-customizados)

---

## 🎯 VISÃO GERAL

O UzzOPS utiliza uma arquitetura de componentes React moderna com:
- **Next.js 16 App Router** - Server e Client Components
- **TypeScript** - Type safety completo
- **Shadcn/ui** - Base de componentes UI (Radix UI + Tailwind)
- **React Hook Form + Zod** - Validação de formulários
- **React Query** - Server state management
- **Lucide React** - Ícones

### Estrutura de Diretórios

```
src/components/
├── ui/                    # 🎨 Shadcn UI Components (13 componentes)
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── form.tsx
│   ├── input.tsx
│   ├── select.tsx
│   ├── checkbox.tsx
│   ├── badge.tsx
│   ├── table.tsx
│   ├── alert-dialog.tsx
│   ├── tabs.tsx
│   ├── progress.tsx
│   └── ...
│
├── shared/               # 🔄 Layout & Shared Components
│   ├── sidebar.tsx       # Navigation sidebar
│   ├── topbar.tsx        # Top header bar (Server Component)
│   └── user-menu.tsx     # User dropdown menu
│
├── dashboard/            # 📊 Dashboard Components
│   └── dashboard-content.tsx
│
├── features/             # 🎯 Feature Management Components
│   ├── features-table.tsx
│   ├── create-feature-modal.tsx
│   ├── edit-feature-modal.tsx
│   ├── delete-feature-dialog.tsx
│   ├── dod-section.tsx
│   └── feature-sprint-selector.tsx
│
└── sprints/              # 🏃 Sprint Management Components
    ├── sprints-table.tsx
    ├── create-sprint-modal.tsx
    ├── edit-sprint-modal.tsx
    ├── delete-sprint-dialog.tsx
    ├── sprint-header.tsx
    ├── sprint-goal-section.tsx
    ├── sprint-backlog-table.tsx
    ├── sprint-workflows.tsx
    └── add-features-to-sprint-modal.tsx
```

---

## 🏗️ ARQUITETURA DE COMPONENTES

### Server vs Client Components

**Server Components (Padrão no App Router):**
- Não requerem `'use client'`
- Podem fazer data fetching direto
- Não podem usar hooks de estado (`useState`, `useEffect`)
- Exemplos: `Topbar`, páginas layout

**Client Components:**
- Requerem `'use client'` no topo
- Podem usar hooks React
- Podem ter interatividade
- Exemplos: Todos os componentes com formulários, botões, modals

### Hierarquia de Layout

```
app/(dashboard)/layout.tsx
  └── <Sidebar />              # Client Component
  └── <Topbar />               # Server Component
      └── <UserMenu />         # Client Component
  └── {children}               # Páginas específicas
      ├── /dashboard           → <DashboardContent />
      ├── /features            → <FeaturesTable />
      └── /sprints             → <SprintsTable />
```

---

## 🎨 UI COMPONENTS (SHADCN/UI)

Componentes base do Shadcn/ui (Radix UI + Tailwind CSS).

### 1. Button

**Localização:** `src/components/ui/button.tsx`

```typescript
import { Button } from '@/components/ui/button';

// Variantes
<Button variant="default">Default</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Destructive</Button>

// Tamanhos
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon">Icon</Button>

// Exemplo prático
<Button
  onClick={handleSave}
  disabled={isLoading}
  className="bg-uzzai-primary hover:bg-uzzai-primary/90"
>
  {isLoading ? <Loader2 className="animate-spin" /> : 'Salvar'}
</Button>
```

### 2. Card

**Localização:** `src/components/ui/card.tsx`

```typescript
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

<Card className="border-l-4 border-l-uzzai-primary">
  <CardHeader>
    <CardTitle>Título</CardTitle>
  </CardHeader>
  <CardContent>
    Conteúdo do card
  </CardContent>
</Card>
```

### 3. Dialog (Modal)

**Localização:** `src/components/ui/dialog.tsx`

```typescript
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Modal Title</DialogTitle>
      <DialogDescription>Modal description</DialogDescription>
    </DialogHeader>

    {/* Conteúdo */}

    <DialogFooter>
      <Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
      <Button onClick={handleSave}>Salvar</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### 4. Form (React Hook Form + Zod)

**Localização:** `src/components/ui/form.tsx`

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';

const formSchema = z.object({
  name: z.string().min(3, 'Mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
});

type FormValues = z.infer<typeof formSchema>;

function MyForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', email: '' },
  });

  const onSubmit = (data: FormValues) => {
    console.log(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>Seu nome completo</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Enviar</Button>
      </form>
    </Form>
  );
}
```

### 5. Table

**Localização:** `src/components/ui/table.tsx`

```typescript
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Nome</TableHead>
      <TableHead>Status</TableHead>
      <TableHead>Ações</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {data.map((item) => (
      <TableRow key={item.id}>
        <TableCell>{item.name}</TableCell>
        <TableCell>{item.status}</TableCell>
        <TableCell>
          <Button size="sm">Ver</Button>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

### 6. Badge

**Localização:** `src/components/ui/badge.tsx`

```typescript
import { Badge } from '@/components/ui/badge';

<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="outline">Outline</Badge>
<Badge variant="destructive">Destructive</Badge>

// Com classes customizadas
<Badge className="bg-green-500 hover:bg-green-600">Ativo</Badge>
```

### 7. AlertDialog

**Localização:** `src/components/ui/alert-dialog.tsx`

```typescript
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

<AlertDialog open={isOpen} onOpenChange={setIsOpen}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
      <AlertDialogDescription>
        Esta ação não pode ser desfeita.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancelar</AlertDialogCancel>
      <AlertDialogAction onClick={handleConfirm}>
        Confirmar
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

### 8. Outros Componentes UI

- **Input** - Campo de texto (`<Input />`)
- **Textarea** - Campo de texto multi-linha
- **Select** - Dropdown select
- **Checkbox** - Checkbox com label
- **Tabs** - Sistema de abas
- **Progress** - Barra de progresso
- **Scroll Area** - Área com scroll customizado
- **Dropdown Menu** - Menu dropdown com itens

---

## 🔄 SHARED COMPONENTS

### 1. Sidebar

**Localização:** `src/components/shared/sidebar.tsx`
**Tipo:** Client Component (`'use client'`)

**Responsabilidades:**
- Menu de navegação principal
- Identidade visual (logo UzzOps)
- Links para páginas principais
- Footer com versão

**Props:** Nenhuma

**Hooks Utilizados:**
- `usePathname()` - Detecta rota ativa

**Estrutura:**

```typescript
export function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { icon: Home, label: 'Dashboard', href: '/dashboard' },
    { icon: FileText, label: 'Features', href: '/features' },
    { icon: Calendar, label: 'Sprints', href: '/sprints' },
    { icon: Users, label: 'Team', href: '/team' },
    { icon: AlertTriangle, label: 'Risks', href: '/risks' },
  ];

  return (
    <aside className="w-64 bg-gradient-to-b from-uzzai-primary to-uzzai-primary/90">
      {/* Logo */}
      {/* Menu Items */}
      {/* Settings Footer */}
    </aside>
  );
}
```

**Estilo:**
- Largura fixa: `w-64` (256px)
- Gradiente azul: `from-uzzai-primary to-uzzai-primary/90`
- Item ativo: `bg-white/20` com `shadow-lg`
- Hover: `hover:bg-white/10`

**Uso:**
```typescript
// Em app/(dashboard)/layout.tsx
<div className="flex h-screen">
  <Sidebar />
  <main>...</main>
</div>
```

### 2. Topbar

**Localização:** `src/components/shared/topbar.tsx`
**Tipo:** Server Component (async)

**Responsabilidades:**
- Header no topo da aplicação
- Exibir informações do usuário
- Menu do usuário (logout)

**Props:** Nenhuma

**Data Fetching:**
```typescript
export async function Topbar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <header className="h-16 border-b bg-white px-6">
      <h2>Sistema de Gerenciamento</h2>
      <UserMenu user={{
        email: user?.email,
        name: user?.user_metadata?.name || user?.email?.split('@')[0],
      }} />
    </header>
  );
}
```

**Uso:**
```typescript
// Em app/(dashboard)/layout.tsx
<div className="flex-1 flex flex-col">
  <Topbar />
  <main>...</main>
</div>
```

### 3. UserMenu

**Localização:** `src/components/shared/user-menu.tsx`
**Tipo:** Client Component

**Responsabilidades:**
- Dropdown menu com informações do usuário
- Logout

**Props:**
```typescript
interface UserMenuProps {
  user: {
    email?: string;
    name?: string;
  };
}
```

**Uso:**
```typescript
<UserMenu user={{ email: 'user@example.com', name: 'John Doe' }} />
```

---

## 📊 DASHBOARD COMPONENTS

### DashboardContent

**Localização:** `src/components/dashboard/dashboard-content.tsx`
**Tipo:** Client Component

**Responsabilidades:**
- Exibir KPIs do projeto (cards)
- Sprint atual
- Status das features
- DoD compliance

**Props:**
```typescript
interface DashboardContentProps {
  projectId: string;
}
```

**Hooks Utilizados:**
- `useProjectOverview(projectId)` - Busca dados do dashboard

**Estrutura:**

```typescript
export function DashboardContent({ projectId }: DashboardContentProps) {
  const { data: overview, isLoading, error } = useProjectOverview(projectId);

  if (isLoading) return <Loader />;
  if (error) return <ErrorCard />;

  const {
    project,
    totalFeatures,
    featuresDone,
    progress,
    avgDodProgress,
    currentSprint
  } = overview;

  return (
    <div className="space-y-6">
      {/* Header */}
      <h1>{project.name}</h1>

      {/* KPI Cards (5 cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <Card>{/* Status do Projeto */}</Card>
        <Card>{/* Progresso Geral */}</Card>
        <Card>{/* Total de Features */}</Card>
        <Card>{/* DoD Compliance */}</Card>
        <Card>{/* Equipe */}</Card>
      </div>

      {/* Sprint Atual & Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>{/* Sprint Atual */}</Card>
        <Card>{/* Status das Features */}</Card>
      </div>
    </div>
  );
}
```

**KPIs Exibidos:**
1. **Status do Projeto** - Badge ativo/inativo
2. **Progresso Geral** - % de features concluídas com barra
3. **Total de Features** - Contador com breakdown
4. **DoD Compliance** - % média de DoD (color-coded)
5. **Equipe** - Número de membros + riscos críticos

**Uso:**
```typescript
// Em app/(dashboard)/dashboard/page.tsx
<DashboardContent projectId="uuid-here" />
```

---

## 🎯 FEATURES COMPONENTS

### 1. FeaturesTable

**Localização:** `src/components/features/features-table.tsx`
**Tipo:** Client Component

**Responsabilidades:**
- Exibir tabela de features
- Filtros (version, status, priority, DoD)
- Navegação para detalhes

**Props:**
```typescript
interface FeaturesTableProps {
  projectId: string;
}
```

**Hooks:**
- `useFeatures(projectId)`
- `useState` para filtros

**Filtros Implementados:**
```typescript
const [filters, setFilters] = useState({
  version: '',       // MVP, V1, V2, V3, V4
  status: '',        // backlog, todo, in_progress, etc.
  priority: '',      // P0, P1, P2, P3
  dodFilter: '',     // complete, incomplete, ''
});
```

**Estrutura da Tabela:**

| Coluna | Descrição | Tipo |
|--------|-----------|------|
| Code | Código da feature | Link |
| Name | Nome | Text |
| Category | Categoria | Badge |
| Version | Versão | Badge |
| Priority | Prioridade | Badge (color-coded) |
| Status | Status | Badge (color-coded) |
| DoD | % de DoD | Progress bar |
| Story Points | Pontos | Number |

**Badges de Status:**
- `backlog` - Cinza
- `todo` - Azul
- `in_progress` - Amarelo
- `review` - Roxo
- `testing` - Laranja
- `done` - Verde
- `blocked` - Vermelho

**Uso:**
```typescript
<FeaturesTable projectId="uuid-here" />
```

### 2. CreateFeatureModal

**Localização:** `src/components/features/create-feature-modal.tsx`
**Tipo:** Client Component

**Responsabilidades:**
- Modal para criar nova feature
- Validação com Zod
- React Hook Form

**Props:**
```typescript
interface CreateFeatureModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId?: string;
}
```

**Form Schema (Zod):**
```typescript
const formSchema = z.object({
  code: z.string()
    .min(3).max(20)
    .regex(/^[A-Z0-9-]+$/, 'Apenas letras maiúsculas, números e hífens'),
  name: z.string().min(3),
  description: z.string().optional(),
  category: z.string().min(1),
  version: z.enum(['MVP', 'V1', 'V2', 'V3', 'V4']),
  priority: z.enum(['P0', 'P1', 'P2', 'P3']),
  status: z.enum(['backlog', 'todo', 'in_progress', 'review', 'testing', 'done', 'blocked']),
});
```

**Campos do Formulário:**
1. **Code** - Código único (ex: F001)
2. **Name** - Nome da feature
3. **Description** - Descrição (opcional)
4. **Category** - Dropdown com categorias
5. **Version** - MVP, V1, V2, V3, V4
6. **Priority** - P0, P1, P2, P3
7. **Status** - backlog, todo, in_progress, etc.

**Categorias Disponíveis:**
- Gestão de Projetos
- Gestão de Equipe
- Analytics & Reports
- Gestão de Riscos
- Configuração UzzApp
- Feature Flags & Versioning
- Outros

**Hooks:**
- `useCreateFeature()` - Mutation para criar feature

**Uso:**
```typescript
const [isModalOpen, setIsModalOpen] = useState(false);

<Button onClick={() => setIsModalOpen(true)}>Nova Feature</Button>

<CreateFeatureModal
  open={isModalOpen}
  onOpenChange={setIsModalOpen}
  projectId="uuid-here"
/>
```

### 3. EditFeatureModal

**Localização:** `src/components/features/edit-feature-modal.tsx`
**Tipo:** Client Component

**Props:**
```typescript
interface EditFeatureModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature: Feature;
}
```

**Diferenças do CreateFeatureModal:**
- Form é populado com dados existentes
- Usa `useUpdateFeature()` mutation
- Campos adicionais: BV, W, G, U, T, Story Points, MoSCoW

**Uso:**
```typescript
<EditFeatureModal
  open={isEditModalOpen}
  onOpenChange={setIsEditModalOpen}
  feature={selectedFeature}
/>
```

### 4. DeleteFeatureDialog

**Localização:** `src/components/features/delete-feature-dialog.tsx`
**Tipo:** Client Component

**Props:**
```typescript
interface DeleteFeatureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature: Feature;
}
```

**Responsabilidades:**
- AlertDialog de confirmação
- Exibir informações da feature a ser deletada
- Executar delete

**Hooks:**
- `useDeleteFeature()` - Mutation

**Uso:**
```typescript
<DeleteFeatureDialog
  open={isDeleteDialogOpen}
  onOpenChange={setIsDeleteDialogOpen}
  feature={featureToDelete}
/>
```

### 5. DoDSection

**Localização:** `src/components/features/dod-section.tsx`
**Tipo:** Client Component

**Responsabilidades:**
- Exibir os 6 critérios de DoD
- Checkboxes editáveis
- Progress bar automática
- Atualização inline

**Props:**
```typescript
interface DoDSectionProps {
  feature: Feature;
  editable?: boolean;  // Default: true
}
```

**Critérios de DoD (6):**
```typescript
const DOD_CRITERIA = [
  { key: 'dod_functional', label: 'Funcionalidade implementada', icon: '⚙️' },
  { key: 'dod_tests', label: 'Testes escritos e passando', icon: '🧪' },
  { key: 'dod_code_review', label: 'Code review aprovado', icon: '👀' },
  { key: 'dod_documentation', label: 'Documentação atualizada', icon: '📝' },
  { key: 'dod_deployed', label: 'Deploy realizado', icon: '🚀' },
  { key: 'dod_user_acceptance', label: 'User acceptance OK', icon: '✅' },
];
```

**Hooks:**
- `useUpdateFeature()` - Atualiza campo individual
- `useTransition()` - Otimistic updates

**Cálculo Automático:**
- Progress é calculado no banco (computed field)
- 6 checkboxes = 100% quando todos marcados

**Uso:**
```typescript
// Em página de detalhes da feature
<DoDSection feature={feature} editable={true} />

// Modo read-only
<DoDSection feature={feature} editable={false} />
```

### 6. FeatureSprintSelector

**Localização:** `src/components/features/feature-sprint-selector.tsx`
**Tipo:** Client Component

**Responsabilidades:**
- Exibir sprints vinculados à feature
- Adicionar/remover feature de sprints
- Respeitar proteção de escopo

**Props:**
```typescript
interface FeatureSprintSelectorProps {
  feature: Feature;
}
```

**Uso:**
```typescript
<FeatureSprintSelector feature={feature} />
```

---

## 🏃 SPRINTS COMPONENTS

### 1. SprintsTable

**Localização:** `src/components/sprints/sprints-table.tsx`
**Tipo:** Client Component

**Responsabilidades:**
- Exibir tabela de sprints
- Filtros (status, período)
- Navegação para detalhes

**Props:**
```typescript
interface SprintsTableProps {
  projectId: string;
}
```

**Colunas da Tabela:**
- **Name** - Nome do sprint (link)
- **Status** - Badge (planned/active/completed)
- **Dates** - Data início → fim
- **Duration** - Semanas
- **Features** - Contador
- **Velocity** - Pontos (target vs actual)
- **Protected** - Ícone de cadeado se protegido

**Uso:**
```typescript
<SprintsTable projectId="uuid-here" />
```

### 2. CreateSprintModal

**Localização:** `src/components/sprints/create-sprint-modal.tsx`
**Tipo:** Client Component

**Props:**
```typescript
interface CreateSprintModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId?: string;
}
```

**Form Schema:**
```typescript
const formSchema = z.object({
  name: z.string().min(3),
  goal: z.string().min(10, 'Sprint Goal deve ter pelo menos 10 caracteres'),
  start_date: z.string(),
  duration_weeks: z.number().min(1).max(4),
  velocity_target: z.number().optional(),
});
```

**Validações:**
- Sprint Goal obrigatório (mín. 10 caracteres)
- Duração: 1-4 semanas
- Data de início obrigatória
- End date calculada automaticamente

**Uso:**
```typescript
<CreateSprintModal
  open={isModalOpen}
  onOpenChange={setIsModalOpen}
  projectId="uuid-here"
/>
```

### 3. SprintHeader

**Localização:** `src/components/sprints/sprint-header.tsx`
**Tipo:** Client Component

**Responsabilidades:**
- Header do Sprint Details Page
- 4 métricas principais
- Botões de ação (Edit, Delete)

**Props:**
```typescript
interface SprintHeaderProps {
  sprint: Sprint;
}
```

**Métricas Exibidas:**
1. **Velocity** - Story points done vs target
2. **Features** - Contador de features no sprint
3. **DoD Compliance** - % médio de DoD
4. **Capacity** - Dias úteis disponíveis

**Uso:**
```typescript
<SprintHeader sprint={sprint} />
```

### 4. SprintGoalSection

**Localização:** `src/components/sprints/sprint-goal-section.tsx`
**Tipo:** Client Component

**Responsabilidades:**
- Exibir Sprint Goal
- Edição inline (somente se status = planned)
- Validação (mín. 10 caracteres)

**Props:**
```typescript
interface SprintGoalSectionProps {
  sprint: Sprint;
}
```

**Regras:**
- Editável: apenas se `sprint.status === 'planned'`
- Read-only: se sprint ativo ou completo
- Validação: mínimo 10 caracteres

**Uso:**
```typescript
<SprintGoalSection sprint={sprint} />
```

### 5. SprintBacklogTable

**Localização:** `src/components/sprints/sprint-backlog-table.tsx`
**Tipo:** Client Component

**Responsabilidades:**
- Exibir features do sprint
- Remover features (com proteção)
- Links para features

**Props:**
```typescript
interface SprintBacklogTableProps {
  sprintId: string;
}
```

**Colunas:**
- Code
- Name
- Priority
- Status
- Story Points
- DoD Progress
- Ações (Remover)

**Proteção de Escopo:**
- Se `sprint.is_protected = true`
- Exibir confirmação antes de remover
- Enviar `force_override: true` na API

**Uso:**
```typescript
<SprintBacklogTable sprintId="uuid-here" />
```

### 6. SprintWorkflows

**Localização:** `src/components/sprints/sprint-workflows.tsx`
**Tipo:** Client Component

**Responsabilidades:**
- Botões de workflow do sprint
- Start Sprint
- Complete Sprint
- Cancel Sprint

**Props:**
```typescript
interface SprintWorkflowsProps {
  sprint: Sprint;
}
```

**Workflows (State Machine):**

```
planned → [Start Sprint] → active → [Complete Sprint] → completed
   ↓                          ↓
   └─────── [Cancel] ────────┘
```

**Botões Disponíveis:**

| Status | Botões Visíveis |
|--------|----------------|
| `planned` | Start Sprint, Cancel Sprint |
| `active` | Complete Sprint, Cancel Sprint |
| `completed` | (Nenhum) |

**Start Sprint:**
- Altera status para `active`
- Define `is_protected = true`
- Registra `started_at`

**Complete Sprint:**
- Altera status para `completed`
- Registra `completed_at`
- Mantém `is_protected = true`

**Cancel Sprint:**
- Altera status para `completed`
- Registra `completed_at`
- (TODO: adicionar campo de justificativa)

**Uso:**
```typescript
<SprintWorkflows sprint={sprint} />
```

### 7. AddFeaturesToSprintModal

**Localização:** `src/components/sprints/add-features-to-sprint-modal.tsx`
**Tipo:** Client Component

**Responsabilidades:**
- Modal para adicionar múltiplas features ao sprint
- Checkbox de seleção
- Respeitar proteção de escopo
- Adicionar múltiplas features de uma vez

**Props:**
```typescript
interface AddFeaturesToSprintModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sprint: Sprint;
}
```

**Funcionalidades:**
- Lista todas as features do projeto
- Checkbox multi-select
- Filtro por nome/código
- Exibir quais features já estão no sprint
- Botão "Adicionar Selecionadas"

**Proteção:**
- Se `sprint.is_protected = true`
- Exibir aviso
- Checkbox "Forçar alteração no escopo protegido"
- Enviar `force_override: true`

**Uso:**
```typescript
<AddFeaturesToSprintModal
  open={isModalOpen}
  onOpenChange={setIsModalOpen}
  sprint={sprint}
/>
```

---

## 🎨 PADRÕES E CONVENÇÕES

### 1. Nomenclatura de Componentes

**Convenções:**
- **PascalCase** para nomes de componentes
- **camelCase** para props e variáveis
- **UPPER_CASE** para constantes

```typescript
// ✅ Correto
export function CreateFeatureModal() { }
const isModalOpen = true;
const DOD_CRITERIA = [...];

// ❌ Incorreto
export function createFeatureModal() { }
const IsModalOpen = true;
const dodCriteria = [...];
```

### 2. Props Interface

Sempre definir interface de props:

```typescript
interface ComponentNameProps {
  requiredProp: string;
  optionalProp?: number;
  children?: React.ReactNode;
}

export function ComponentName({
  requiredProp,
  optionalProp = 10,
  children
}: ComponentNameProps) {
  // ...
}
```

### 3. Hooks Customizados

Todos os hooks de data fetching estão em `src/hooks/`:

```typescript
// useFeatures.ts
export function useFeatures(projectId: string) {
  return useQuery({
    queryKey: ['features', projectId],
    queryFn: () => fetchFeatures(projectId),
  });
}

export function useCreateFeature() {
  return useMutation({
    mutationFn: createFeature,
    onSuccess: () => {
      queryClient.invalidateQueries(['features']);
    },
  });
}
```

**Hooks Disponíveis:**

| Hook | Tipo | Descrição |
|------|------|-----------|
| `useFeatures(projectId)` | Query | Lista features |
| `useFeature(id)` | Query | Feature individual |
| `useCreateFeature()` | Mutation | Criar feature |
| `useUpdateFeature()` | Mutation | Atualizar feature |
| `useDeleteFeature()` | Mutation | Deletar feature |
| `useSprints(projectId)` | Query | Lista sprints |
| `useSprint(id)` | Query | Sprint individual |
| `useCreateSprint()` | Mutation | Criar sprint |
| `useUpdateSprint()` | Mutation | Atualizar sprint |
| `useDeleteSprint()` | Mutation | Deletar sprint |
| `useSprintFeatures(sprintId)` | Query | Features de um sprint |
| `useProjectOverview(projectId)` | Query | Dados do dashboard |

### 4. Validação de Forms (Zod)

Padrão de validação com Zod + React Hook Form:

```typescript
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// 1. Definir schema
const formSchema = z.object({
  email: z.string().email('Email inválido'),
  age: z.number().min(18, 'Deve ter 18+'),
  name: z.string().min(3).max(50),
  acceptTerms: z.boolean().refine(val => val, 'Deve aceitar'),
});

// 2. Inferir tipos
type FormValues = z.infer<typeof formSchema>;

// 3. Usar no form
const form = useForm<FormValues>({
  resolver: zodResolver(formSchema),
  defaultValues: {
    email: '',
    age: 18,
    name: '',
    acceptTerms: false,
  },
});

// 4. Submit handler
const onSubmit = (data: FormValues) => {
  // Dados já validados aqui
  console.log(data);
};
```

### 5. Loading States

Padrão para loading e error states:

```typescript
function MyComponent() {
  const { data, isLoading, error } = useQuery(...);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-uzzai-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <p className="text-red-600">Erro ao carregar dados.</p>
        </CardContent>
      </Card>
    );
  }

  return <div>{/* Conteúdo */}</div>;
}
```

### 6. Estilização Tailwind

**Classes Customizadas (UzzAI Brand):**

```css
/* tailwind.config.ts */
colors: {
  'uzzai-primary': '#1E3A8A',    // Azul escuro
  'uzzai-secondary': '#3B82F6',  // Azul médio
  'uzzai-warning': '#F59E0B',    // Laranja
  'uzzai-dark': '#1F2937',       // Cinza escuro
}
```

**Padrões de Cards:**
```typescript
// Card com borda colorida à esquerda
<Card className="border-l-4 border-l-uzzai-primary hover:shadow-lg transition-shadow">

// Card de sucesso
<Card className="border-l-4 border-l-green-500 bg-green-50">

// Card de erro
<Card className="border-red-200 bg-red-50">
```

**Padrões de Badges:**
```typescript
// Status colors
const statusColors = {
  backlog: 'bg-gray-500',
  todo: 'bg-blue-500',
  in_progress: 'bg-yellow-500',
  review: 'bg-purple-500',
  testing: 'bg-orange-500',
  done: 'bg-green-500',
  blocked: 'bg-red-500',
};

<Badge className={statusColors[status]}>{status}</Badge>
```

**Responsive Grid:**
```typescript
// Dashboard cards - responsivo
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
```

### 7. Ícones (Lucide React)

Padrão de uso de ícones:

```typescript
import { Home, FileText, Calendar, Loader2, CheckCircle2 } from 'lucide-react';

// Com tamanho
<Home className="w-5 h-5" />

// Com cor
<CheckCircle2 className="w-5 h-5 text-green-600" />

// Loading spinner
<Loader2 className="w-4 h-4 animate-spin" />

// Com margem
<FileText className="w-4 h-4 mr-2" />
```

**Ícones Mais Usados:**
- `Home` - Dashboard
- `FileText` - Features
- `Calendar` - Sprints
- `Users` - Team
- `AlertTriangle` - Risks
- `Settings` - Configurações
- `Loader2` - Loading
- `CheckCircle2` - DoD, Success
- `XCircle` - Error
- `Edit` - Editar
- `Trash` - Deletar
- `Plus` - Adicionar

### 8. Acessibilidade

**Boas Práticas:**

```typescript
// Labels em checkboxes
<Checkbox id="accept-terms" />
<Label htmlFor="accept-terms">Aceito os termos</Label>

// Alt text em imagens
<img src="..." alt="Descrição da imagem" />

// ARIA labels em botões de ícone
<Button aria-label="Fechar modal">
  <X className="w-4 h-4" />
</Button>

// Títulos de seções
<section aria-labelledby="section-title">
  <h2 id="section-title">Título</h2>
</section>
```

---

## 🔧 HOOKS CUSTOMIZADOS

### Estrutura de Hooks

Todos os hooks estão em `src/hooks/`:

```
src/hooks/
├── useFeatures.ts      # CRUD de features
├── useSprints.ts       # CRUD de sprints
├── useProjects.ts      # Dados do projeto
└── useProjectOverview.ts  # Dashboard overview
```

### useFeatures

**Localização:** `src/hooks/useFeatures.ts`

```typescript
// Lista todas as features
export function useFeatures(projectId: string) {
  return useQuery({
    queryKey: ['features', projectId],
    queryFn: async () => {
      const res = await fetch(`/api/features?project_id=${projectId}`);
      if (!res.ok) throw new Error('Failed to fetch features');
      return res.json();
    },
  });
}

// Feature individual
export function useFeature(id: string) {
  return useQuery({
    queryKey: ['feature', id],
    queryFn: async () => {
      const res = await fetch(`/api/features/${id}`);
      if (!res.ok) throw new Error('Failed to fetch feature');
      return res.json();
    },
  });
}

// Criar feature
export function useCreateFeature() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateFeatureInput) => {
      const res = await fetch('/api/features', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create feature');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['features'] });
    },
  });
}

// Atualizar feature
export function useUpdateFeature() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Feature> }) => {
      const res = await fetch(`/api/features/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update feature');
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['feature', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['features'] });
    },
  });
}

// Deletar feature
export function useDeleteFeature() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/features/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete feature');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['features'] });
    },
  });
}
```

### useSprints

**Localização:** `src/hooks/useSprints.ts`

Estrutura similar ao `useFeatures`:
- `useSprints(projectId)` - Lista sprints
- `useSprint(id)` - Sprint individual
- `useCreateSprint()` - Criar sprint
- `useUpdateSprint()` - Atualizar sprint
- `useDeleteSprint()` - Deletar sprint

### useProjectOverview

**Localização:** `src/hooks/useProjectOverview.ts`

```typescript
export function useProjectOverview(projectId: string) {
  return useQuery({
    queryKey: ['project-overview', projectId],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}/overview`);
      if (!res.ok) throw new Error('Failed to fetch overview');
      return res.json();
    },
  });
}
```

**Retorna:**
```typescript
interface ProjectOverview {
  project: Project;
  totalFeatures: number;
  featuresDone: number;
  featuresInProgress: number;
  featuresTodo: number;
  progress: number;
  avgDodProgress: number;
  teamSize: number;
  currentSprint: Sprint | null;
  activeSprints: Sprint[];
  criticalRisks: number;
}
```

---

## 📝 EXEMPLO COMPLETO: Criar Novo Modal

Guia passo a passo para criar um novo modal component:

### 1. Criar Arquivo do Componente

```typescript
// src/components/features/assign-feature-modal.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useUpdateFeature } from '@/hooks/useFeatures';
import { Loader2 } from 'lucide-react';

// 1. Schema de validação
const formSchema = z.object({
  assignee: z.string().min(1, 'Selecione um membro'),
});

type FormValues = z.infer<typeof formSchema>;

// 2. Props interface
interface AssignFeatureModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature: Feature;
  teamMembers: TeamMember[];
}

// 3. Componente
export function AssignFeatureModal({
  open,
  onOpenChange,
  feature,
  teamMembers,
}: AssignFeatureModalProps) {
  const updateFeature = useUpdateFeature();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      assignee: feature.assignee_id || '',
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      await updateFeature.mutateAsync({
        id: feature.id,
        data: { assignee_id: data.assignee },
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error assigning feature:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Atribuir Feature</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="assignee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Responsável</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um membro" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {teamMembers.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={updateFeature.isPending}>
                {updateFeature.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
```

### 2. Usar no Componente Pai

```typescript
// Em alguma página ou componente
'use client';

import { useState } from 'react';
import { AssignFeatureModal } from '@/components/features/assign-feature-modal';
import { Button } from '@/components/ui/button';

export function FeatureActions({ feature, teamMembers }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsModalOpen(true)}>
        Atribuir
      </Button>

      <AssignFeatureModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        feature={feature}
        teamMembers={teamMembers}
      />
    </>
  );
}
```

---

## 🎓 RESUMO

### Componentes por Categoria

| Categoria | Quantidade | Principais |
|-----------|------------|------------|
| **UI (Shadcn)** | 13 | Button, Card, Dialog, Form, Table |
| **Shared** | 3 | Sidebar, Topbar, UserMenu |
| **Dashboard** | 1 | DashboardContent |
| **Features** | 6 | FeaturesTable, Modals, DoDSection |
| **Sprints** | 9 | SprintsTable, Modals, Workflows |
| **TOTAL** | **32** | - |

### Padrões Obrigatórios

1. ✅ `'use client'` em componentes interativos
2. ✅ Props interface sempre definida
3. ✅ Zod validation em formulários
4. ✅ React Query para data fetching
5. ✅ Loading/Error states
6. ✅ TypeScript types explícitos
7. ✅ Tailwind classes (sem CSS inline)
8. ✅ Ícones do Lucide React

### Próximos Passos

Para adicionar novos componentes:
1. Definir responsabilidade única
2. Criar interface de props
3. Implementar loading/error states
4. Adicionar validação se necessário
5. Documentar neste guide
6. Adicionar testes (Sprint 3)

---

**Última Atualização:** 2026-02-07
**Próxima Revisão:** Após Sprint 3

*"Think Smart, Think Uzz.Ai"*
