export enum AppMode {
  Dashboard = 'DASHBOARD',
  Chat = 'CHAT',
  Vision = 'VISION',
  Json = 'JSON',
  Speech = 'SPEECH'
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  isError?: boolean;
}

export interface Recipe {
  name: string;
  cuisine: string;
  difficulty: string;
  prepTime: string;
  ingredients: string[];
}

export type LoadingState = 'idle' | 'loading' | 'streaming' | 'success' | 'error';
