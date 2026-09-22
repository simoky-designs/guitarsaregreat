export const APP_NAME = 'Simoky Hacker News';
export const NO_DATA_MESSAGE = 'No data available.';
export const LOADING_LABEL = 'Loading';
export const LOGIN_MESSAGE = 'login works!';

export const TABLE_ARIA_LABELS = {
  rowActions: 'row actions',
  expandRow: 'expand row',
} as const;

export const TABLE_TYPE_LABELS = {
  id: 'ID',
  type: 'Type',
  by: 'Author',
  title: 'Title',
  url: 'URL',
  score: 'Score',
  descendants: 'Comments',
  time: 'Date',
  topstories: 'Top Stories',
  newstories: 'New Stories',
  beststories: 'Best Stories',
  comments: 'Comments',
  askstories: 'Ask Stories',
  showstories: 'Show Stories',
  jobstories: 'Jobs Stories',
  submit: 'Submit',
} as const;

export const TABLE_COLUMNS = [
  { key: 'title', label: TABLE_TYPE_LABELS.title },
  { key: 'by', label: TABLE_TYPE_LABELS.by },
  { key: 'score', label: TABLE_TYPE_LABELS.score },
  { key: 'time', label: TABLE_TYPE_LABELS.time },
] as const;

export const EXPANDED_COLUMNS = [
  { key: 'url', label: TABLE_TYPE_LABELS.url },
  { key: 'type', label: TABLE_TYPE_LABELS.type },
  { key: 'comments', label: TABLE_TYPE_LABELS.comments },
] as const;

export const STORY_TYPE_BUTTONS = [
  { type: 'topstories', disabled: false },
  { type: 'newstories', disabled: false },
  { type: 'beststories', disabled: false },
  { type: 'comments', disabled: true },
  { type: 'askstories', disabled: false },
  { type: 'showstories', disabled: false },
  { type: 'jobstories', disabled: false },
  { type: 'submit', disabled: true },
] as const;
