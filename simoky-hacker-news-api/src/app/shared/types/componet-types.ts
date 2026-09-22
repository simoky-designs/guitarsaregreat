import { NewsItem } from '../../core/interfaces/news';
import { TABLE_TYPE_LABELS } from '../const/app-constants';

export interface TableColumn {
  key: NewsItemKey;
  label: string;
}

export interface StoryTypeButtons {
  type: StoryTypes;
  disabled: boolean;
}

export type NewsItemKey = keyof NewsItem;
export type StoryTypes = 'top' | 'new' | 'best' | 'comments' | 'ask' | 'show' | 'jobs' | 'submit';
export type TableTypeKey = keyof typeof TABLE_TYPE_LABELS;
export type TableTypeLabel = (typeof TABLE_TYPE_LABELS)[TableTypeKey];
export const getTableTypeLabel = (key: TableTypeKey): TableTypeLabel => TABLE_TYPE_LABELS[key];
