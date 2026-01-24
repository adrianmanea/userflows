export type ContentStatus = 'draft' | 'published' | 'archived' | 'deleted';

export interface Profile {
  id: string;
  email: string;
  role: 'user' | 'admin';
  created_at: string;
}

export interface Source {
  id: string;
  name: string;
  slug: string;
  icon_url?: string;
  url?: string;
  created_at: string;
}

export interface Component {
  id: number;
  name: string;
  description?: string;
  code_string: string;
  tags?: string[];
  original_app?: string;
  thumbnail_url?: string;
  created_at: string;
  source_id?: string; // uuid
  sources?: Source;
  status: ContentStatus;
  view_count?: number;
}

export interface Flow {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  status: ContentStatus;
  flow_steps?: FlowStep[];
}

export interface FlowStep {
  id: number;
  flow_id: number;
  component_id: number;
  step_order: number;
  component?: Component;
}
