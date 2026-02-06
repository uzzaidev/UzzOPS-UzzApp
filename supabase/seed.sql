-- =====================================================
-- SEED DATA - UzzOps Sistema de Gerenciamento UzzApp
-- =====================================================

-- =====================================================
-- 1. PROJETO UzzApp
-- =====================================================
INSERT INTO projects (tenant_id, code, name, description, status, progress, start_date)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'UZZAPP',
  'UzzApp - Chatbot WhatsApp com IA',
  'Sistema de chatbot com IA integrada para WhatsApp Business. Oferece atendimento automatizado 24/7, RAG para busca em documentação, multi-tenant (múltiplas empresas), integração com WhatsApp Business API, catálogo de produtos e fluxos conversacionais customizáveis.',
  'active',
  0,
  '2026-02-10'
);

-- =====================================================
-- 2. EQUIPE (Team Members)
-- =====================================================
INSERT INTO team_members (tenant_id, name, email, role, department, allocation_percent)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Pedro Vitor', 'pedro@uzzai.com', 'Product Owner + Frontend + UX/UI', 'Dev', 100),
  ('00000000-0000-0000-0000-000000000001', 'Luis Fernando', 'luis@uzzai.com', 'Tech Lead Full-Stack', 'Dev', 100),
  ('00000000-0000-0000-0000-000000000001', 'Arthur', 'arthur@uzzai.com', 'Marketing Manager', 'Marketing', 100),
  ('00000000-0000-0000-0000-000000000001', 'Vitor', 'vitor@uzzai.com', 'Sales Manager', 'Sales', 100),
  ('00000000-0000-0000-0000-000000000001', 'Lucas', 'lucas@uzzai.com', 'Legal Advisor', 'Legal', 100);

-- =====================================================
-- 3. SPRINT 0 (Setup & Infraestrutura)
-- =====================================================
INSERT INTO sprints (tenant_id, project_id, code, name, goal, start_date, end_date, status, capacity_total, velocity_target)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  (SELECT id FROM projects WHERE code = 'UZZAPP'),
  'SPRINT-0',
  'Sprint 0 - Setup & Infraestrutura',
  'Infraestrutura pronta para desenvolvimento do MVP',
  '2026-02-10',
  '2026-02-14',
  'completed',
  5, -- 5 dias
  0  -- Sprint 0 não tem story points
);

-- =====================================================
-- 4. SPRINT 1 (Fundamentos)
-- =====================================================
INSERT INTO sprints (tenant_id, project_id, code, name, goal, start_date, end_date, status, capacity_total, velocity_target)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  (SELECT id FROM projects WHERE code = 'UZZAPP'),
  'SPRINT-1',
  'Sprint 1 - Fundamentos',
  'Dashboard com KPIs reais + CRUD completo de Features funcionando',
  '2026-02-17',
  '2026-02-28',
  'active',
  10, -- 2 semanas
  15  -- 15 story points esperados
);

-- =====================================================
-- 5. FEATURES MVP (Exemplos iniciais)
-- =====================================================

-- US-008: Autenticação
INSERT INTO features (
  tenant_id, project_id, code, name, description, category, version, status, priority, moscow,
  gut_g, gut_u, gut_t, story_points, business_value, work_effort, responsible
)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  (SELECT id FROM projects WHERE code = 'UZZAPP'),
  'F-008',
  'US-008: Autenticação de Usuários',
  'Sistema de login com Supabase Auth, middleware de proteção de rotas, página de login.',
  'gestao-projetos',
  'MVP',
  'done',
  'P0',
  'Must',
  5, 5, 5, -- GUT: 125 (Crítico)
  3,     -- Story points
  10,    -- Business value
  3,     -- Work effort
  ARRAY['Luis', 'Pedro']
);

-- US-001: Dashboard Overview
INSERT INTO features (
  tenant_id, project_id, code, name, description, category, version, status, priority, moscow,
  gut_g, gut_u, gut_t, story_points, business_value, work_effort, responsible, due_date
)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  (SELECT id FROM projects WHERE code = 'UZZAPP'),
  'F-001',
  'US-001: Dashboard Overview do Projeto',
  'Dashboard mostrando KPIs principais: Status, Progresso, Features, Equipe, Tempo de Execução.',
  'gestao-projetos',
  'MVP',
  'in_progress',
  'P0',
  'Must',
  5, 5, 5, -- GUT: 125
  5,     -- Story points
  10,    -- Business value
  3,     -- Work effort
  ARRAY['Pedro', 'Luis'],
  '2026-02-20'
);

-- US-002: Gestão de Features
INSERT INTO features (
  tenant_id, project_id, code, name, description, category, version, status, priority, moscow,
  gut_g, gut_u, gut_t, story_points, business_value, work_effort, responsible, due_date
)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  (SELECT id FROM projects WHERE code = 'UZZAPP'),
  'F-002',
  'US-002: Gestão de Features (CRUD)',
  'CRUD completo de features: lista, filtros, criação, edição, detalhes, busca.',
  'gestao-projetos',
  'MVP',
  'todo',
  'P0',
  'Must',
  5, 5, 4, -- GUT: 100
  8,     -- Story points
  9,     -- Business value
  5,     -- Work effort
  ARRAY['Pedro', 'Luis'],
  '2026-02-25'
);

-- =====================================================
-- 6. RELACIONAR FEATURES AO SPRINT 1
-- =====================================================
INSERT INTO sprint_features (sprint_id, feature_id)
SELECT
  (SELECT id FROM sprints WHERE code = 'SPRINT-1'),
  id
FROM features
WHERE code IN ('F-001', 'F-002');

-- =====================================================
-- 7. USER STORY US-001 (detalhamento)
-- =====================================================
INSERT INTO user_stories (
  tenant_id,
  feature_id,
  public_id,
  as_a,
  i_want,
  so_that,
  acceptance_criteria
)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  (SELECT id FROM features WHERE code = 'F-001'),
  'US-001',
  'Product Owner (Pedro)',
  'visualizar um dashboard com KPIs principais do projeto UzzApp',
  'eu possa ter uma visão rápida do status geral em um só lugar',
  '[
    "Dashboard mostra 4 cards de KPIs: Status, Progresso, Features, Equipe",
    "Seção Tempo de Execução com barra de progresso visual",
    "Dashboard responsivo (mobile, tablet, desktop)",
    "Carrega em menos de 2 segundos"
  ]'::jsonb
);

-- =====================================================
-- 8. TASKS da US-001
-- =====================================================
INSERT INTO tasks (tenant_id, feature_id, title, assigned_to, estimated_hours, status)
VALUES
  ('00000000-0000-0000-0000-000000000001', (SELECT id FROM features WHERE code = 'F-001'), 'Criar API /api/projects/:id/overview', 'Luis', 8.0, 'todo'),
  ('00000000-0000-0000-0000-000000000001', (SELECT id FROM features WHERE code = 'F-001'), 'Componente DashboardCard', 'Pedro', 4.0, 'todo'),
  ('00000000-0000-0000-0000-000000000001', (SELECT id FROM features WHERE code = 'F-001'), 'Componente ProgressBar', 'Pedro', 4.0, 'todo'),
  ('00000000-0000-0000-0000-000000000001', (SELECT id FROM features WHERE code = 'F-001'), 'Integrar API com componentes', 'Pedro', 4.0, 'todo'),
  ('00000000-0000-0000-0000-000000000001', (SELECT id FROM features WHERE code = 'F-001'), 'Testes E2E do dashboard', 'Pedro', 4.0, 'todo');

-- =====================================================
-- 9. EXEMPLO DE RISCO
-- =====================================================
INSERT INTO risks (
  tenant_id,
  project_id,
  public_id,
  title,
  description,
  gut_g,
  gut_u,
  gut_t,
  severity_label,
  status,
  mitigation_plan,
  owner_id
)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  (SELECT id FROM projects WHERE code = 'UZZAPP'),
  'R-001',
  'Dependência do WhatsApp Business API',
  'Mudanças na política ou API do WhatsApp podem impactar o produto',
  4, -- Gravidade: Alto
  3, -- Urgência: Média
  4, -- Tendência: Alta
  'Alto',
  'mitigated',
  'Implementar camada de abstração para facilitar migração para outras plataformas de mensagens',
  (SELECT id FROM team_members WHERE name = 'Luis Fernando')
);

-- =====================================================
-- FIM DO SEED
-- =====================================================
