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
export type Profile = Tables<'profiles'>;
export type CompanyMember = Tables<'company_members'>;
export type Project = Tables<'projects'>;
export type Sprint = Tables<'sprints'>;
export type TeamMember = Tables<'team_members'>;
export type Risk = Tables<'risks'>;

// Member role / status (company_members)
export type MemberRole = 'admin' | 'member' | 'viewer';

// Insert types
export type NewProject = Insertable<'projects'>;
export type NewFeature = Insertable<'features'>;
export type NewSprint = Insertable<'sprints'>;
export type NewTeamMember = Insertable<'team_members'>;
export type NewRisk = Insertable<'risks'>;
export type FeatureAttachment = Tables<'feature_attachments'>;

// Update types
export type ProjectUpdate = Updateable<'projects'>;
export type SprintUpdate = Updateable<'sprints'>;
export type TeamMemberUpdate = Updateable<'team_members'>;
export type RiskUpdate = Updateable<'risks'>;

// FeatureUpdate extended with Sprint 4 columns
export type FeatureUpdate = Updateable<'features'> & {
  is_mvp?: boolean;
  acceptance_criteria?: string | null;
  invest_checklist?: Record<string, boolean | null> | null;
};

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
  avgDodProgress: number;
  teamSize: number;
  currentSprint: Sprint | null;
  activeSprints: Sprint[];
  criticalRisks: number;
}

// Feature extended with Sprint 4 + Sprint 5 columns
export interface Feature extends Tables<'features'> {
  is_mvp?: boolean;
  acceptance_criteria?: string | null;
  invest_checklist?: {
    independent: boolean | null;
    negotiable: boolean | null;
    valuable: boolean | null;
    estimable: boolean | null;
    small: boolean | null;
    testable: boolean | null;
  } | null;
  // Sprint 5 columns
  is_epic?: boolean;
  decomposed_at?: string | null;
  // Sprint 6 columns
  is_spike?: boolean;
  spike_timebox_hours?: number | null;
  spike_outcome?: string | null;
  spike_converted_to_story_id?: string | null;
  work_item_type: 'feature' | 'bug';
  solution_notes: string | null;
  dod_custom_items: string[];
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
  projectId?: string;
}

// =====================================================
// SPRINT 4 TYPES
// =====================================================

// US-4.3: Retrospective Actions
export type RetrospectiveCategory = 'worked_well' | 'needs_improvement' | 'experiment';
export type RetrospectiveStatus = 'pending' | 'in_progress' | 'done' | 'abandoned';

export interface RetrospectiveAction {
  id: string;
  tenant_id: string;
  sprint_id: string;
  project_id: string;
  category: RetrospectiveCategory;
  action_text: string;
  status: RetrospectiveStatus;
  owner_id: string | null;
  due_date: string | null;
  success_criteria: string | null;
  outcome: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export type NewRetrospectiveAction = Omit<RetrospectiveAction, 'id' | 'created_at' | 'updated_at' | 'completed_at'>;

// US-4.1: Planning Poker
export type PokerCardValue = '0' | '½' | '1' | '2' | '3' | '5' | '8' | '13' | '21' | '∞' | '?' | '☕';
export type PokerSessionType = 'business_value' | 'work_effort';
export type PokerSessionStatus = 'active' | 'completed' | 'cancelled';
export type PokerConsensus = 'unanimous' | 'majority' | 'forced';

export interface PlanningPokerSession {
  id: string;
  tenant_id: string;
  project_id: string;
  name: string;
  type: PokerSessionType;
  status: PokerSessionStatus;
  feature_ids: string[];
  current_feature_index: number;
  facilitator_id: string | null;
  revealed: boolean;
  created_at: string;
  completed_at: string | null;
}

export interface PlanningPokerVote {
  id: string;
  session_id: string;
  feature_id: string;
  voter_name: string;
  vote_value: PokerCardValue;
  vote_numeric: number | null;
  created_at: string;
}

export interface PlanningPokerResult {
  id: string;
  session_id: string;
  feature_id: string;
  final_value: number;
  consensus_level: PokerConsensus | null;
  votes_summary: {
    min: number;
    max: number;
    avg: number;
    median: number;
    votes: { voter: string; value: string }[];
  } | null;
  discussion_notes: string | null;
  created_at: string;
}

// MVP Progress
export interface MvpProgress {
  project_id: string;
  mvp_total: number;
  mvp_done: number;
  mvp_progress_percentage: number;
}

// INVEST Checklist
export interface INVESTChecklist {
  independent: boolean | null;
  negotiable: boolean | null;
  valuable: boolean | null;
  estimable: boolean | null;
  small: boolean | null;
  testable: boolean | null;
}

// =====================================================
// SPRINT 5 TYPES
// =====================================================

// US-5.1: Backlog Mind Map
export interface FeatureCluster {
  id: string;
  project_id: string;
  name: string;
  description: string | null;
  color: string;
  position_x: number;
  position_y: number;
  is_collapsed: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClusterSummary extends FeatureCluster {
  feature_count: number;
  total_story_points: number;
  features_done: number;
  completion_rate: number;
}

export interface FeatureClusterMember {
  feature_id: string;
  cluster_id: string;
  position_x: number;
  position_y: number;
  created_at: string;
}

export interface FeatureDependency {
  id: string;
  project_id: string;
  feature_id: string;
  depends_on_id: string;
  dependency_type: 'blocks' | 'relates_to' | 'duplicates';
  created_at: string;
}

export interface BacklogMapData {
  clusters: ClusterSummary[];
  features: (Feature & { cluster_id?: string; cluster_position_x?: number; cluster_position_y?: number })[];
  dependencies: FeatureDependency[];
}

// US-5.2: Epic Decomposition
export interface EpicDecomposition {
  id: string;
  epic_id: string;
  child_story_id: string;
  decomposition_strategy: string | null;
  created_at: string;
}

export type DecompositionStrategy = 'by_persona' | 'by_layer' | 'by_criteria' | 'by_scenario';

export interface DecompositionSuggestion {
  strategy: DecompositionStrategy;
  label: string;
  stories: {
    name: string;
    description: string;
    story_points: number;
    acceptance_criteria?: string;
  }[];
}

export interface NewChildStory {
  name: string;
  description: string;
  story_points: number;
  acceptance_criteria?: string;
}

// US-5.3: DoD Evolutivo
export interface DodLevel {
  id: string;
  project_id: string;
  level: 1 | 2 | 3;
  name: string;
  criteria: string[];
  is_active: boolean;
  activated_at: string | null;
  created_at: string;
}

export interface DodHistory {
  id: string;
  project_id: string;
  from_level: number | null;
  to_level: number;
  reason: string | null;
  changed_by: string | null;
  changed_at: string;
}

export interface DodData {
  levels: DodLevel[];
  activeLevel: DodLevel | null;
  canUpgrade: boolean;
  history: DodHistory[];
}

// =====================================================
// TEAM TYPES (Migration 012)
// =====================================================

export type MemberPermission = 'admin' | 'member';
export type MemberStatus = 'active' | 'pending' | 'inactive';

export interface TeamMemberFull {
  id: string;
  tenant_id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  role: string;
  department: string | null;
  allocation_percent: number;
  velocity_avg: number | null;
  is_active: boolean;
  permission_level: MemberPermission;
  status: MemberStatus;
  user_id: string | null;
  created_at: string;
  updated_at: string;
}

export type UzzappClientStatus = 'active' | 'trial' | 'churned' | 'paused';
export type UzzappClientPlan = 'starter' | 'pro' | 'enterprise' | 'custom' | null;

export interface UzzappClient {
  id: string;
  tenant_id: string | null;
  name: string;
  legal_name: string | null;
  cnpj: string | null;
  company: string | null;
  segment: string | null;
  company_size: 'micro' | 'pequena' | 'media' | 'grande' | null;
  city: string | null;
  state: string | null;
  address_full: string | null;
  website: string | null;
  phone: string | null;
  email: string | null;
  main_contact_name: string | null;
  main_contact_role: string | null;
  whatsapp_business: string | null;
  plan: UzzappClientPlan;
  status: UzzappClientStatus | null;
  funnel_stage: string | null;
  negotiation_status: string | null;
  closing_probability: number | null;
  priority: 'critica' | 'alta' | 'media' | 'baixa' | null;
  potential_value: number | null;
  monthly_fee_value: number | null;
  setup_fee_value: number | null;
  next_interaction_date: string | null;
  next_action_deadline: string | null;
  sales_owner_id: string | null;
  followup_owner_id: string | null;
  technical_owner_id: string | null;
  product_focus: string | null;
  project_label: string | null;
  preferred_channel: string | null;
  general_sentiment: string | null;
  lead_source: 'indicacao' | 'linkedin' | 'evento' | 'cold-outreach' | 'inbound' | 'parceiro' | 'outro' | null;
  icp_classification: 'hot' | 'warm' | 'cold' | 'future' | null;
  business_context: string | null;
  lead_daily_volume: number | null;
  stakeholders_json: unknown[] | null;
  bant_snapshot: Record<string, unknown> | null;
  fit_snapshot: Record<string, unknown> | null;
  last_contact_date: string | null;
  tags: string[] | null;
  notes: string | null;
  onboarded_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

// =====================================================
// SPRINT 6 TYPES
// =====================================================

// US-6.1: Daily Scrum Logger
export interface DailyLog {
  id: string;
  project_id: string;
  sprint_id: string | null;
  team_member_id: string;
  log_date: string;
  what_did_yesterday: string;
  what_will_do_today: string;
  impediments: string[];
  created_at: string;
  updated_at: string;
}

export interface DailyLogWithMember extends DailyLog {
  team_member: {
    id: string;
    name: string;
    avatar_url: string | null;
  } | null;
  sprint: {
    id: string;
    name: string;
  } | null;
}

export interface NewDailyLog {
  projectId: string;
  sprintId?: string | null;
  whatDidYesterday: string;
  whatWillDoToday: string;
  impediments?: string[];
  logDate?: string;
}

// US-6.2: Spike Tracking — extends Feature with new columns
export interface SpikeSummary {
  sprint_id: string;
  project_id: string;
  total_spikes: number;
  spikes_done: number;
  total_timebox_hours: number;
  spikes_with_outcomes: number;
  spikes_converted: number;
  spike_completion_rate: number;
}

// US-6.3: Export
export type ExportFormat = 'pdf' | 'excel' | 'json';

export interface ExportHistoryItem {
  id: string;
  project_id: string;
  exported_by: string;
  export_format: ExportFormat;
  export_sections: Record<string, boolean> | null;
  file_size_bytes: number | null;
  exported_at: string;
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
