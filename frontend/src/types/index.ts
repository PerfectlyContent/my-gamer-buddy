export interface Game {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color_accent: string;
}

export interface Conversation {
  id: string;
  title: string;
  game_slug: string | null;
  game_name: string | null;
  game_icon: string | null;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  image_url: string | null;
  created_at: string;
}

export interface CheatCode {
  id: string;
  title: string;
  code: string;
  platform: 'PC' | 'PlayStation' | 'Xbox' | 'Phone' | 'All';
  category: string;
  description: string | null;
  created_at: string;
}

export interface GameMap {
  id: string;
  name: string;
  slug: string;
  image_url: string;
  width: number;
  height: number;
}

export interface MapMarker {
  id: string;
  map_id: string;
  marker_type: 'loot' | 'boss' | 'quest' | 'secret' | 'collectible' | 'vendor' | 'fast-travel' | 'danger';
  label: string;
  description: string | null;
  x_coord: number;
  y_coord: number;
  icon: string | null;
}

export interface Quest {
  id: string;
  name: string;
  description: string | null;
  category: 'npc_encounter' | 'secret' | 'mini_event' | 'easter_egg' | 'missable';
  region: string | null;
  difficulty: 'easy' | 'medium' | 'hard' | null;
  is_missable: boolean;
  sort_order: number;
}

export interface QuestProgress {
  quest_id: string;
  completed: boolean;
  notes: string | null;
  completed_at: string | null;
}
