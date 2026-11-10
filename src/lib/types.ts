export type Project = {
  id: string;
  name: string;
  color: string;
  note: string;
  created_at: string;
  photo_count?: number;
  day_count?: number;
};

export type Photo = {
  id: string;
  day: string;
  data_url: string;
  caption: string;
  created_at: string;
};

export type DayEntry = {
  id: string;
  day: string;
  memo: string;
  project_id: string | null;
};

export type CalendarDaySummary = {
  day: string;
  photo_count: number;
  cover_url: string | null;
  project_id: string | null;
  project_color: string | null;
  has_memo: boolean;
};
