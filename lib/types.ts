export type IntentMode = "planning" | "productivity" | "personal";
export type CalendarView = "grid" | "heatmap" | "timeline";
export type CalendarMode = "task" | "trip";

export type NoteCategory = "general" | "work" | "personal" | "urgent";
export type EntryType = "memo" | "event";
export type Frequency = "once" | "weekly" | "monthly";

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

export interface Note {
  id: string;
  text: string;
  createdAt: string;
  dateKey?: string; 
  category: NoteCategory;
  entryType: EntryType;
  frequency: Frequency;
}

export interface StickyNote {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
}

export interface MoodEntry {
  emoji: string;
  label: string;
  color: string;
  bg: string;
}

export interface DayMood {
  [dateKey: string]: MoodEntry;
}

export interface MonthNotes {
  [dateKey: string]: Note[];
}

export interface PackingItem {
  id: string;
  text: string;
  checked: boolean;
}

export interface TodoItem {
  id: string;
  text: string;
  checked: boolean;
  priority: "low" | "medium" | "high";
}

export interface AppSettings {
  soundEnabled: boolean;
  theme: "dark" | "light";
}

export interface UserStats {
  streak: number;
  lastActive: string | null;
  selectedDaysRecord: Record<number, number>;
}

export interface CalendarState {
  currentMonth: number;
  currentYear: number;
  selectedRange: DateRange;
  notes: MonthNotes;
  moods: DayMood;
  intentMode: IntentMode;
  view: CalendarView;
  calendarMode: CalendarMode;
  packingItems: PackingItem[];
  todos: TodoItem[];
  stickies: StickyNote[];
  settings: AppSettings;
  stats: UserStats;
}
