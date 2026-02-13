# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

UzzOPS is an internal project management system for UzzApp (a WhatsApp Chatbot with AI). Built with Next.js App Router, it manages features, sprints, risks, and team members with full CRUD operations.

## Commands

```bash
pnpm dev          # Start development server
pnpm build        # Production build
pnpm lint         # Run ESLint
pnpm test         # Run Jest tests
pnpm test:watch   # Jest in watch mode
pnpm prettier --write "src/**/*.{ts,tsx}"  # Format code
```

**Package manager:** pnpm (required — do not use npm or yarn)

## Architecture

### Stack
- **Next.js 16** App Router with **React 19** and **TypeScript 5** (strict mode)
- **Supabase** (PostgreSQL) for database and authentication
- **TanStack React Query v5** for server state (60s stale time, no refetch on focus)
- **Shadcn/ui** + **Tailwind CSS 4** for UI components
- **React Hook Form** + **Zod** for forms and validation

### Directory Structure

```
src/
├── app/
│   ├── (dashboard)/       # Protected routes (layout wraps with sidebar)
│   │   ├── features/      # Feature CRUD + detail pages
│   │   ├── sprints/       # Sprint list + sprint detail with backlog
│   │   ├── risks/         # Risk management (GUT matrix)
│   │   └── team/          # Team members
│   ├── api/               # Next.js API routes (serverless)
│   │   ├── features/      # GET list, POST create, [id] CRUD
│   │   ├── sprints/       # GET list, POST create, [id] CRUD + /features
│   │   ├── risks/         # GET list, POST create, [id] CRUD
│   │   └── projects/[id]/ # overview endpoint for KPIs
│   └── login/             # Public auth page
├── components/
│   ├── ui/                # Shadcn/ui base components
│   ├── dashboard/         # KPI cards (dashboard-content.tsx)
│   ├── features/          # Feature table, create/edit/delete modals
│   ├── sprints/           # Sprint table, backlog, goal section, modals
│   ├── risks/             # Risk table, create/edit/delete modals
│   └── shared/            # Sidebar, topbar, user-menu
├── hooks/                 # React Query data-fetching and mutation hooks
├── lib/
│   └── supabase/          # server.ts (API routes/server components), client.ts (browser)
├── types/
│   ├── database.ts        # Supabase auto-generated DB types
│   └── index.ts           # Application entity types, enums, response shapes
└── middleware.ts           # Auth guard: redirects unauthenticated to /login
```

### Data Flow Pattern

All data operations follow this pattern:
1. Component renders with React Query hook (e.g., `useFeatures(filters)`)
2. User action triggers a mutation hook (e.g., `useCreateFeature()`)
3. Mutation calls a Next.js API route via `fetch`
4. API route validates, calls Supabase, returns `{ data?, error?, message? }`
5. `onSuccess` invalidates relevant React Query cache keys
6. UI re-renders with fresh data

### Query Key Conventions

```typescript
['features', filters]           // feature list
['feature', id]                 // single feature
['sprints', projectId]          // sprint list
['sprint', id]                  // single sprint
['sprint-features', sprintId]   // features within a sprint
['risks', filters]              // risk list
['project-overview', projectId] // dashboard KPIs
```

### API Response Format

All API routes return: `{ data?: T, error?: string, message?: string }`

### Supabase Clients

- **Server** (`src/lib/supabase/server.ts`): Use in API routes and Server Components — cookie-based session
- **Client** (`src/lib/supabase/client.ts`): Use in Client Components only — browser-based auth

### Key Type Patterns

```typescript
// Entity types are derived from DB schema:
type Feature = Tables<'features'>
type NewFeature = Insertable<'features'>
type FeatureUpdate = Updateable<'features'>

// Key enums (defined in src/types/index.ts):
FeatureStatus: 'backlog' | 'todo' | 'in_progress' | 'review' | 'testing' | 'done' | 'blocked'
SprintStatus:  'planned' | 'active' | 'completed' | 'cancelled'
FeatureVersion: 'MVP' | 'V1' | 'V2' | 'V3' | 'V4'
FeaturePriority: 'P0' | 'P1' | 'P2' | 'P3'
```

### Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=
```

### Database

Migrations are in `database/migrations/`. The DB uses UUID primary keys, multi-tenant isolation via `tenant_id`, and GUT matrix scoring (Gravidade × Urgência × Tendência, 1–5 each) for risk prioritization. Sprint goals have a minimum 10-character CHECK constraint enforced at the DB level.

### Sprint Scope Protection

Sprints have scope protection built in. When adding features to an active sprint, a `force_override: boolean` flag is required in the request body. The `useAddFeatureToSprint` hook handles this with detailed error responses including `{ status, message, code, details }`.
