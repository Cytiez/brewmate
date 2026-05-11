// Hand-maintained subset of Supabase types matching 0001_init.sql.
// Replace with `supabase gen types typescript` output once the project is linked.

export type Process = "washed" | "natural" | "honey" | "anaerobic" | "other";
export type RoastLevel = "light" | "medium" | "dark";
export type Density = "low" | "medium" | "high";
export type EquipmentKind = "grinder" | "dripper" | "kettle";
export type TasteRating =
  | "too_bitter"
  | "too_sour"
  | "too_weak"
  | "too_strong"
  | "flat"
  | "great";

export interface Bean {
  id: string;
  user_id: string;
  name: string;
  roaster: string | null;
  origin_country: string | null;
  origin_region: string | null;
  process: Process | null;
  roast_level: RoastLevel | null;
  altitude_masl: number | null;
  density: Density | null;
  flavor_notes: string[];
  roast_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Equipment {
  id: string;
  user_id: string;
  kind: EquipmentKind;
  name: string;
  grind_unit: string | null;
  temp_control: boolean | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface BrewLog {
  id: string;
  user_id: string;
  bean_id: string;
  grinder_id: string | null;
  dripper_id: string;
  kettle_id: string | null;
  dose_g: number;
  water_g: number;
  water_temp_c: number | null;
  grind_size: string;
  brew_time_seconds: number;
  bloom_time_seconds: number | null;
  bloom_water_g: number | null;
  taste_rating: TasteRating;
  taste_note: string | null;
  brewed_at: string;
  created_at: string;
}

export interface AiSuggestion {
  id: string;
  user_id: string;
  brew_log_id: string;
  content: string;
  model: string;
  prompt_tokens: number | null;
  completion_tokens: number | null;
  created_at: string;
}

// Minimal shape so generic createBrowserClient/createServerClient type-checks.
export type Database = {
  public: {
    Tables: {
      beans: { Row: Bean; Insert: Partial<Bean>; Update: Partial<Bean> };
      equipment: { Row: Equipment; Insert: Partial<Equipment>; Update: Partial<Equipment> };
      brew_logs: { Row: BrewLog; Insert: Partial<BrewLog>; Update: Partial<BrewLog> };
      ai_suggestions: { Row: AiSuggestion; Insert: Partial<AiSuggestion>; Update: Partial<AiSuggestion> };
      ai_usage: {
        Row: { user_id: string; day: string; count: number };
        Insert: { user_id: string; day: string; count?: number };
        Update: { count?: number };
      };
      log_creation_usage: {
        Row: { user_id: string; day: string; count: number };
        Insert: { user_id: string; day: string; count?: number };
        Update: { count?: number };
      };
    };
    Functions: {
      check_and_increment_ai_usage: {
        Args: { daily_limit: number };
        Returns: boolean;
      };
      check_and_increment_log_creation: {
        Args: { daily_limit: number };
        Returns: boolean;
      };
    };
  };
};
