export const APP_NAME = 'Simoky Hacker News';
export const DASHBOARD_TITLE = 'Hacker News';
export const NEWS_LOAD_ERROR = 'Failed to load news';
export const NO_DATA_MESSAGE = 'No data available.';
export const LOADING_LABEL = 'Loading';
export const LOGIN_MESSAGE = 'login works!';

export const DISABLED_NAV_LABELS = {
  comments: 'Comments',
  ask: 'ask',
  show: 'show',
  jobs: 'jobs',
  submit: 'submit',
} as const;

export const DETAIL_LABELS = {
  url: 'URL:',
  domain: 'Domain:',
  points: 'Points:',
  comments: 'Comments:',
  posted: 'Posted:',
} as const;

export const TABLE_ARIA_LABELS = {
  rowActions: 'row actions',
  expandRow: 'expand row',
} as const;

export const STORY_TYPES = {
  top: 'top',
  new: 'new',
  best: 'best',
} as const;

export type StoryType = (typeof STORY_TYPES)[keyof typeof STORY_TYPES];

export const STORY_TYPE_LABELS = {
  top: 'Top Stories',
  new: 'New Stories',
  best: 'Best Stories',
} as const;

export const getStoryTypeLabel = (storyType: StoryType) =>
  STORY_TYPE_LABELS[storyType];

export const NEWS_TABLE_COLUMNS = [
  { label: 'Title', key: 'title' },
  { label: 'Author', key: 'by' },
  { label: 'Points', key: 'score' },
] as const;
