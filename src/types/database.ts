// Database types for Supabase

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      tenants: {
        Row: {
          id: string;
          slug: string;
          name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          user_id: string;
          full_name: string;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          full_name?: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          full_name?: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      company_members: {
        Row: {
          id: string;
          user_id: string;
          tenant_id: string;
          role: 'admin' | 'member' | 'viewer';
          status: 'active' | 'pending' | 'inactive';
          invited_by: string | null;
          joined_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          tenant_id: string;
          role?: 'admin' | 'member' | 'viewer';
          status?: 'active' | 'pending' | 'inactive';
          invited_by?: string | null;
          joined_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          tenant_id?: string;
          role?: 'admin' | 'member' | 'viewer';
          status?: 'active' | 'pending' | 'inactive';
          invited_by?: string | null;
          joined_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          tenant_id: string;
          code: string;
          name: string;
          description: string | null;
          status: 'active' | 'on_hold' | 'completed' | 'cancelled';
          progress: number;
          budget: number | null;
          budget_spent: number;
          start_date: string | null;
          end_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          code: string;
          name: string;
          description?: string | null;
          status?: 'active' | 'on_hold' | 'completed' | 'cancelled';
          progress?: number;
          budget?: number | null;
          budget_spent?: number;
          start_date?: string | null;
          end_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          code?: string;
          name?: string;
          description?: string | null;
          status?: 'active' | 'on_hold' | 'completed' | 'cancelled';
          progress?: number;
          budget?: number | null;
          budget_spent?: number;
          start_date?: string | null;
          end_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      features: {
        Row: {
          id: string;
          tenant_id: string;
          project_id: string;
          code: string;
          name: string;
          description: string | null;
          category: string;
          version: 'MVP' | 'V1' | 'V2' | 'V3' | 'V4';
          status: 'backlog' | 'todo' | 'in_progress' | 'review' | 'testing' | 'done' | 'blocked';
          priority: 'P0' | 'P1' | 'P2' | 'P3';
          moscow: 'Must' | 'Should' | 'Could' | 'Wont' | null;
          gut_g: number | null;
          gut_u: number | null;
          gut_t: number | null;
          gut_score: number | null;
          dod_functional: boolean;
          dod_tests: boolean;
          dod_code_review: boolean;
          dod_documentation: boolean;
          dod_deployed: boolean;
          dod_user_acceptance: boolean;
          dod_progress: number;
          responsible: string[] | null;
          due_date: string | null;
          story_points: number | null;
          business_value: number | null;
          work_effort: number | null;
          bv_w_ratio: number | null;
          work_item_type: 'feature' | 'bug';
          solution_notes: string | null;
          dod_custom_items: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          project_id: string;
          code: string;
          name: string;
          description?: string | null;
          category: string;
          version?: 'MVP' | 'V1' | 'V2' | 'V3' | 'V4';
          status?: 'backlog' | 'todo' | 'in_progress' | 'review' | 'testing' | 'done' | 'blocked';
          priority?: 'P0' | 'P1' | 'P2' | 'P3';
          moscow?: 'Must' | 'Should' | 'Could' | 'Wont' | null;
          gut_g?: number | null;
          gut_u?: number | null;
          gut_t?: number | null;
          dod_functional?: boolean;
          dod_tests?: boolean;
          dod_code_review?: boolean;
          dod_documentation?: boolean;
          dod_deployed?: boolean;
          dod_user_acceptance?: boolean;
          responsible?: string[] | null;
          due_date?: string | null;
          story_points?: number | null;
          business_value?: number | null;
          work_effort?: number | null;
          work_item_type?: 'feature' | 'bug';
          solution_notes?: string | null;
          dod_custom_items?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          project_id?: string;
          code?: string;
          name?: string;
          description?: string | null;
          category?: string;
          version?: 'MVP' | 'V1' | 'V2' | 'V3' | 'V4';
          status?: 'backlog' | 'todo' | 'in_progress' | 'review' | 'testing' | 'done' | 'blocked';
          priority?: 'P0' | 'P1' | 'P2' | 'P3';
          moscow?: 'Must' | 'Should' | 'Could' | 'Wont' | null;
          gut_g?: number | null;
          gut_u?: number | null;
          gut_t?: number | null;
          dod_functional?: boolean;
          dod_tests?: boolean;
          dod_code_review?: boolean;
          dod_documentation?: boolean;
          dod_deployed?: boolean;
          dod_user_acceptance?: boolean;
          responsible?: string[] | null;
          due_date?: string | null;
          story_points?: number | null;
          business_value?: number | null;
          work_effort?: number | null;
          work_item_type?: 'feature' | 'bug';
          solution_notes?: string | null;
          dod_custom_items?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      feature_attachments: {
        Row: {
          id: string;
          tenant_id: string;
          feature_id: string;
          file_name: string;
          file_path: string;
          mime_type: string | null;
          file_size: number | null;
          uploaded_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          feature_id: string;
          file_name: string;
          file_path: string;
          mime_type?: string | null;
          file_size?: number | null;
          uploaded_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          feature_id?: string;
          file_name?: string;
          file_path?: string;
          mime_type?: string | null;
          file_size?: number | null;
          uploaded_by?: string | null;
          created_at?: string;
        };
      };
      sprints: {
        Row: {
          id: string;
          tenant_id: string;
          project_id: string;
          code: string;
          name: string;
          goal: string | null;
          start_date: string;
          end_date: string;
          status: 'planned' | 'active' | 'completed' | 'cancelled';
          capacity_total: number | null;
          velocity_target: number | null;
          velocity_actual: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          project_id: string;
          code: string;
          name: string;
          goal?: string | null;
          start_date: string;
          end_date: string;
          status?: 'planned' | 'active' | 'completed' | 'cancelled';
          capacity_total?: number | null;
          velocity_target?: number | null;
          velocity_actual?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          project_id?: string;
          code?: string;
          name?: string;
          goal?: string | null;
          start_date?: string;
          end_date?: string;
          status?: 'planned' | 'active' | 'completed' | 'cancelled';
          capacity_total?: number | null;
          velocity_target?: number | null;
          velocity_actual?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      team_members: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          email: string;
          user_id: string | null;
          avatar_url: string | null;
          role: string;
          permission_level: 'admin' | 'member';
          status: 'active' | 'pending' | 'inactive';
          department: string | null;
          allocation_percent: number;
          velocity_avg: number | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name: string;
          email: string;
          user_id?: string | null;
          avatar_url?: string | null;
          role: string;
          permission_level?: 'admin' | 'member';
          status?: 'active' | 'pending' | 'inactive';
          department?: string | null;
          allocation_percent?: number;
          velocity_avg?: number | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string;
          email?: string;
          user_id?: string | null;
          avatar_url?: string | null;
          role?: string;
          permission_level?: 'admin' | 'member';
          status?: 'active' | 'pending' | 'inactive';
          department?: string | null;
          allocation_percent?: number;
          velocity_avg?: number | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      risks: {
        Row: {
          id: string;
          tenant_id: string;
          project_id: string;
          public_id: string;
          title: string;
          description: string | null;
          gut_g: number | null;
          gut_u: number | null;
          gut_t: number | null;
          gut_score: number | null;
          severity_label: string | null;
          status: 'identified' | 'analyzing' | 'mitigated' | 'accepted' | 'resolved';
          mitigation_plan: string | null;
          owner_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          project_id: string;
          public_id: string;
          title: string;
          description?: string | null;
          gut_g?: number | null;
          gut_u?: number | null;
          gut_t?: number | null;
          severity_label?: string | null;
          status?: 'identified' | 'analyzing' | 'mitigated' | 'accepted' | 'resolved';
          mitigation_plan?: string | null;
          owner_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          project_id?: string;
          public_id?: string;
          title?: string;
          description?: string | null;
          gut_g?: number | null;
          gut_u?: number | null;
          gut_t?: number | null;
          severity_label?: string | null;
          status?: 'identified' | 'analyzing' | 'mitigated' | 'accepted' | 'resolved';
          mitigation_plan?: string | null;
          owner_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
