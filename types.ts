
export interface LinkItem {
  id: string;
  url: string;
  title: string;
  summary: string;
  category: string;
  tags: string[];
  isRead: boolean;
  createdAt: number;
}

export interface GeminiAnalysis {
  title: string;
  summary: string;
  category: string;
  tags: string[];
}

export enum FilterType {
  ALL = 'all',
  UNREAD = 'unread',
  READ = 'read',
  CATEGORY = 'category',
  SOURCE = 'source'
}

export enum Theme {
  MODERN = 'modern',
  NEO_BRUTALISM = 'neo-brutalism',
  GLASSMORPHISM = 'glassmorphism',
  CYBER_TERMINAL = 'cyber-terminal'
}
