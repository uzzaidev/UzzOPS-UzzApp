-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TENANTS
-- =====================================================
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert UzzAI tenant
INSERT INTO tenants (id, slug, name)
VALUES ('00000000-0000-0000-0000-000000000001', 'uzzai', 'UzzAI');

-- =====================================================
-- PROJECTS
-- =====================================================
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,

  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'on_hold', 'completed', 'cancelled')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),

  budget DECIMAL(15, 2),
  budget_spent DECIMAL(15, 2) DEFAULT 0,

  start_date DATE,
  end_date DATE,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- FEATURES
-- =====================================================
CREATE TABLE features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,

  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,

  -- Versionamento
  version TEXT DEFAULT 'MVP' CHECK (version IN ('MVP', 'V1', 'V2', 'V3', 'V4')),

  -- Status
  status TEXT DEFAULT 'backlog' CHECK (status IN ('backlog', 'todo', 'in_progress', 'review', 'testing', 'done', 'blocked')),

  -- Priorização
  priority TEXT DEFAULT 'P2' CHECK (priority IN ('P0', 'P1', 'P2', 'P3')),
  moscow TEXT CHECK (moscow IN ('Must', 'Should', 'Could', 'Wont')),

  -- GUT Score (para priorização)
  gut_g INTEGER CHECK (gut_g >= 1 AND gut_g <= 5),
  gut_u INTEGER CHECK (gut_u >= 1 AND gut_u <= 5),
  gut_t INTEGER CHECK (gut_t >= 1 AND gut_t <= 5),
  gut_score INTEGER GENERATED ALWAYS AS (gut_g * gut_u * gut_t) STORED,

  -- Definition of Done (6 checkboxes)
  dod_functional BOOLEAN DEFAULT false,
  dod_tests BOOLEAN DEFAULT false,
  dod_code_review BOOLEAN DEFAULT false,
  dod_documentation BOOLEAN DEFAULT false,
  dod_deployed BOOLEAN DEFAULT false,
  dod_user_acceptance BOOLEAN DEFAULT false,
  dod_progress INTEGER GENERATED ALWAYS AS (
    (CASE WHEN dod_functional THEN 1 ELSE 0 END +
     CASE WHEN dod_tests THEN 1 ELSE 0 END +
     CASE WHEN dod_code_review THEN 1 ELSE 0 END +
     CASE WHEN dod_documentation THEN 1 ELSE 0 END +
     CASE WHEN dod_deployed THEN 1 ELSE 0 END +
     CASE WHEN dod_user_acceptance THEN 1 ELSE 0 END) * 100 / 6
  ) STORED,

  -- Assignment
  responsible TEXT[], -- Array de nomes: ['Pedro', 'Luis', 'Arthur']
  due_date DATE,

  -- Story Points
  story_points INTEGER,

  -- BV/W (Business Value / Work)
  business_value INTEGER CHECK (business_value >= 1 AND business_value <= 10),
  work_effort INTEGER CHECK (work_effort >= 1 AND work_effort <= 10),
  bv_w_ratio DECIMAL(10, 2) GENERATED ALWAYS AS (
    CASE WHEN work_effort > 0 THEN business_value::DECIMAL / work_effort ELSE 0 END
  ) STORED,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- SPRINTS
-- =====================================================
CREATE TABLE sprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,

  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  goal TEXT,

  start_date DATE NOT NULL,
  end_date DATE NOT NULL,

  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'active', 'completed', 'cancelled')),

  -- Capacity
  capacity_total INTEGER, -- Total de dias disponíveis
  velocity_target INTEGER, -- Story points esperados
  velocity_actual INTEGER, -- Story points entregues

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- SPRINT FEATURES (relacionamento N:N)
-- =====================================================
CREATE TABLE sprint_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sprint_id UUID REFERENCES sprints(id) ON DELETE CASCADE,
  feature_id UUID REFERENCES features(id) ON DELETE CASCADE,

  UNIQUE(sprint_id, feature_id)
);

-- =====================================================
-- TEAM MEMBERS
-- =====================================================
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  role TEXT NOT NULL,
  department TEXT, -- Dev, Marketing, Sales, Legal, etc.

  allocation_percent INTEGER DEFAULT 100 CHECK (allocation_percent >= 0 AND allocation_percent <= 100),
  velocity_avg INTEGER, -- Média de story points por sprint

  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- RISKS
-- =====================================================
CREATE TABLE risks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,

  public_id TEXT UNIQUE NOT NULL, -- Ex: R-001
  title TEXT NOT NULL,
  description TEXT,

  -- GUT Score
  gut_g INTEGER CHECK (gut_g >= 1 AND gut_g <= 5),
  gut_u INTEGER CHECK (gut_u >= 1 AND gut_u <= 5),
  gut_t INTEGER CHECK (gut_t >= 1 AND gut_t <= 5),
  gut_score INTEGER GENERATED ALWAYS AS (gut_g * gut_u * gut_t) STORED,

  severity_label TEXT, -- 'Crítico', 'Alto', 'Médio', 'Baixo'
  status TEXT DEFAULT 'identified' CHECK (status IN ('identified', 'analyzing', 'mitigated', 'accepted', 'resolved')),

  mitigation_plan TEXT,
  owner_id UUID REFERENCES team_members(id),

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- USER STORIES (relacionamento opcional para features)
-- =====================================================
CREATE TABLE user_stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  feature_id UUID REFERENCES features(id) ON DELETE CASCADE,

  public_id TEXT UNIQUE NOT NULL, -- Ex: US-001

  as_a TEXT NOT NULL, -- "Como Product Owner"
  i_want TEXT NOT NULL, -- "Eu quero visualizar dashboard"
  so_that TEXT NOT NULL, -- "Para que eu tenha visão geral"

  acceptance_criteria JSONB, -- Array de critérios

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- TASKS (subtasks de features)
-- =====================================================
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  feature_id UUID REFERENCES features(id) ON DELETE CASCADE,

  title TEXT NOT NULL,
  description TEXT,

  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),

  assigned_to TEXT, -- Nome do responsável
  estimated_hours DECIMAL(5, 2),

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- VELOCITY HISTORY (para tracking de velocidade do time)
-- =====================================================
CREATE TABLE velocity_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  sprint_id UUID REFERENCES sprints(id) ON DELETE CASCADE,

  story_points_planned INTEGER,
  story_points_completed INTEGER,

  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- UZZAPP CLIENTS (para tracking de clientes do chatbot)
-- =====================================================
CREATE TABLE uzzapp_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  company TEXT,
  phone TEXT,
  email TEXT,

  plan TEXT, -- 'free', 'basic', 'pro', 'enterprise'
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'trial', 'churned', 'paused')),

  onboarded_at DATE,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- CLIENT CATALOGS (catálogos de produtos dos clientes)
-- =====================================================
CREATE TABLE client_catalogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  client_id UUID REFERENCES uzzapp_clients(id) ON DELETE CASCADE,

  product_name TEXT NOT NULL,
  product_description TEXT,
  price DECIMAL(10, 2),
  sku TEXT,

  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- INDEXES (para performance)
-- =====================================================
CREATE INDEX idx_features_project_status ON features(tenant_id, project_id, status);
CREATE INDEX idx_features_version ON features(tenant_id, version);
CREATE INDEX idx_features_priority ON features(tenant_id, priority);
CREATE INDEX idx_features_gut_score ON features(tenant_id, gut_score DESC);
CREATE INDEX idx_sprints_project_status ON sprints(tenant_id, project_id, status);
CREATE INDEX idx_risks_gut_score ON risks(tenant_id, gut_score DESC);

-- =====================================================
-- TRIGGERS (para updated_at automático)
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tenants_updated_at
  BEFORE UPDATE ON tenants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_features_updated_at
  BEFORE UPDATE ON features
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sprints_updated_at
  BEFORE UPDATE ON sprints
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_members_updated_at
  BEFORE UPDATE ON team_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_risks_updated_at
  BEFORE UPDATE ON risks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_stories_updated_at
  BEFORE UPDATE ON user_stories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_uzzapp_clients_updated_at
  BEFORE UPDATE ON uzzapp_clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_catalogs_updated_at
  BEFORE UPDATE ON client_catalogs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
