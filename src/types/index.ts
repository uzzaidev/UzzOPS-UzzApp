import type { Database } from './database';

// Type helpers
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

export type Insertable<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];

export type Updateable<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

// Entity types
export type Tenant = Tables<'tenants'>;
export type Project = Tables<'projects'>;
export type Feature = Tables<'features'>;
export type Sprint = Tables<'sprints'>;
export type TeamMember = Tables<'team_members'>;
export type Risk = Tables<'risks'>;

// Insert types
export type NewProject = Insertable<'projects'>;
export type NewFeature = Insertable<'features'>;
export type NewSprint = Insertable<'sprints'>;
export type NewTeamMember = Insertable<'team_members'>;
export type NewRisk = Insertable<'risks'>;

// Update types
export type ProjectUpdate = Updateable<'projects'>;
export type FeatureUpdate = Updateable<'features'>;
export type SprintUpdate = Updateable<'sprints'>;
export type TeamMemberUpdate = Updateable<'team_members'>;
export type RiskUpdate = Updateable<'risks'>;

// Status types
export type ProjectStatus = 'active' | 'on_hold' | 'completed' | 'cancelled';
export type FeatureStatus = 'backlog' | 'todo' | 'in_progress' | 'review' | 'testing' | 'done' | 'blocked';
export type SprintStatus = 'planned' | 'active' | 'completed' | 'cancelled';
export type RiskStatus = 'identified' | 'analyzing' | 'mitigated' | 'accepted' | 'resolved';

// Other enums
export type FeatureVersion = 'MVP' | 'V1' | 'V2' | 'V3' | 'V4';
export type FeaturePriority = 'P0' | 'P1' | 'P2' | 'P3';
export type MoSCoW = 'Must' | 'Should' | 'Could' | 'Wont';

// Dashboard types
export interface ProjectOverview {
  project: Project;
  totalFeatures: number;
  featuresDone: number;
  featuresInProgress: number;
  featuresTodo: number;
  progress: number;
  teamSize: number;
  currentSprint: Sprint | null;
  activeSprints: Sprint[];
  criticalRisks: number;
}

// Feature with computed fields
export interface FeatureWithRelations extends Feature {
  project?: Project;
  sprint?: Sprint;
  tasks?: any[];
}

// Filter types
export interface FeatureFilters {
  version?: FeatureVersion[];
  status?: FeatureStatus[];
  category?: string[];
  priority?: FeaturePriority[];
  responsible?: string[];
  search?: string;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
