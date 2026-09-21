export interface NewsResponse {
  page: number;
  nextPage: number | null;
  total: number;
  items: NewsItem[];
}

export interface NewsItem {
  id: number;
  type?: 'story' | 'comment' | 'job' | 'poll' | 'pollopt';
  by?: string;
  time?: number;
  title?: string;
  text?: string;
  url?: string;
  score?: number;
  descendants?: number;
  kids?: number[];
  parent?: number;
  parts?: number[];
  poll?: number;
}