export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export function formatDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function parseDateKey(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function isDateInRange(date: Date, start: Date | null, end: Date | null): boolean {
  if (!start || !end) return false;
  const d = date.getTime();
  const s = start.getTime();
  const e = end.getTime();
  return d >= Math.min(s, e) && d <= Math.max(s, e);
}

export function isDateEqual(a: Date, b: Date | null): boolean {
  if (!b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function getRangeDays(start: Date | null, end: Date | null): number {
  if (!start || !end) return 0;
  const diff = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function getWeekNumber(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 1);
  const diff = date.getTime() - start.getTime();
  const oneWeek = 1000 * 60 * 60 * 24 * 7;
  return Math.floor(diff / oneWeek);
}

export function isSameMonth(date: Date, year: number, month: number): boolean {
  return date.getFullYear() === year && date.getMonth() === month;
}

export function isToday(date: Date): boolean {
  const today = new Date();
  return isDateEqual(date, today);
}

export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

export function generateCalendarDays(year: number, month: number) {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const days: { date: Date; isCurrentMonth: boolean }[] = [];

  // Previous month padding
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);

  for (let i = firstDay - 1; i >= 0; i--) {
    days.push({
      date: new Date(prevYear, prevMonth, daysInPrevMonth - i),
      isCurrentMonth: false,
    });
  }

  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    days.push({
      date: new Date(year, month, d),
      isCurrentMonth: true,
    });
  }

  // Next month padding
  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;
  const remaining = 42 - days.length;
  for (let d = 1; d <= remaining; d++) {
    days.push({
      date: new Date(nextYear, nextMonth, d),
      isCurrentMonth: false,
    });
  }

  return days;
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function getRangeSuggestion(start: Date): string[] {
  const dayOfWeek = start.getDay();
  const suggestions: string[] = [];

  if (dayOfWeek === 5) {
    suggestions.push("Weekend Getaway", "Long Weekend");
  } else if (dayOfWeek === 0 || dayOfWeek === 1) {
    suggestions.push("Work Sprint", "Full Week");
  } else if (dayOfWeek === 4) {
    suggestions.push("Long Weekend", "Focus Block");
  } else {
    suggestions.push("Focus Block", "Work Sprint");
  }

  return suggestions;
}

export function getMoodSummary(moods: Record<string, { label: string; emoji: string }>) {
  const counts: Record<string, { count: number; emoji: string }> = {};
  Object.values(moods).forEach(({ label, emoji }) => {
    if (!counts[label]) counts[label] = { count: 0, emoji };
    counts[label].count++;
  });

  const total = Object.values(counts).reduce((sum, { count }) => sum + count, 0);
  if (total === 0) return null;

  const sorted = Object.entries(counts).sort((a, b) => b[1].count - a[1].count);
  return { counts, total, sorted };
}
