export interface NewsResponse {
  page: number;
  nextPage: number | null;
  items: NewsItem[];
}

export interface NewsItem {
  id: number;
  rank?: number;
  title?: string;
  url?: string;
  domain?: string;
  author?: string | null;
  points?: number | null;
  comments?: number | null;
  postedAt?: string;
}