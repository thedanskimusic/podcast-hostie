export interface Tenant {
  id: string;
  name: string;
  slug: string;
  custom_domain?: string | null;
  primary_color: string;
  logo_url?: string | null;
  font_family?: string | null;
  border_radius: number;
}

export interface Show {
  id: string;
  tenant_id: string;
  title: string;
  description?: string | null;
  cover_image?: string | null;
  author?: string | null;
  created_at: Date;
}

export interface Episode {
  id: string;
  show_id: string;
  title: string;
  audio_url: string;
  duration_seconds: number;
  published_at?: Date | null;
  created_at: Date;
}

export interface User {
  id: string;
  email: string;
  tenant_id: string;
  created_at: Date;
}

export interface UserProgress {
  user_id: string;
  episode_id: string;
  current_time: number;
  is_completed: boolean;
  updated_at: Date;
}
