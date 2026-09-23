import { NewsItem } from '../../core/interfaces/news';
import { TABLE_TYPE_LABELS } from '../const/app-const';

export interface TableColumn {
  key: NewsItemKey;
  label: string;
}

export interface StoryTypeButtons {
  type: StoryType;
  disabled: boolean;
}

export type NewsItemKey = keyof NewsItem;
export type StoryType = 'topstories' | 'newstories' | 'beststories' | 'comments' | 'askstories' | 'showstories' | 'jobstories' | 'submit';
export type TableTypeKey = keyof typeof TABLE_TYPE_LABELS;
export type TableTypeLabel = (typeof TABLE_TYPE_LABELS)[TableTypeKey];
export const getTableTypeLabel = (key: TableTypeKey): TableTypeLabel => TABLE_TYPE_LABELS[key];
