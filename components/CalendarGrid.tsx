"use client";

import { motion } from "framer-motion";
import { DateRange, DayMood } from "@/lib/types";
import {
  generateCalendarDays,
  isDateInRange,
  isDateEqual,
  isToday,
  isWeekend,
  formatDateKey,
} from "@/lib/utils";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface CalendarGridProps {
  year: number;
  month: number;
  selectedRange: DateRange;
  hoverDate: Date | null;
  isSelecting: boolean;
  moods: DayMood;
  onDayClick: (date: Date) => void;
  onDayHover: (date: Date | null) => void;
}

export default function CalendarGrid({
  year,
  month,
  selectedRange,
  hoverDate,
  isSelecting,
  moods,
  onDayClick,
  onDayHover,
}: CalendarGridProps) {
  const days = generateCalendarDays(year, month);

  // Compute preview range when selecting
  const previewEnd = isSelecting && hoverDate ? hoverDate : selectedRange.end;

  return (
    <div className="calendar-grid-wrapper">
      {/* Day headers */}
      <div className="calendar-grid" style={{ marginBottom: 4 }}>
        {DAYS.map((d, i) => (
          <div
            key={d}
            className={`day-header ${i === 0 || i === 6 ? "weekend" : ""}`}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="calendar-grid">
        {days.map(({ date, isCurrentMonth }, idx) => {
          const dateKey = formatDateKey(date);
          const isStart = isDateEqual(date, selectedRange.start);
          const isEnd = isDateEqual(date, previewEnd);
          const inRange = isDateInRange(date, selectedRange.start, previewEnd);
          const mood = moods[dateKey];
          const today = isToday(date);
          const weekend = isWeekend(date);

          let className = "day-cell";
          if (!isCurrentMonth) className += " other-month";
          if (today) className += " is-today";
          if (weekend && isCurrentMonth) className += " is-weekend";
          if (isStart) className += " is-start";
          if (isEnd && (selectedRange.end || (isSelecting && hoverDate))) className += " is-end";
          if (inRange && !isStart && !isEnd) className += " in-range";

          return (
            <motion.div
              key={idx}
              className={className}
              onClick={() => isCurrentMonth && onDayClick(date)}
              onMouseEnter={() => isCurrentMonth && onDayHover(date)}
              onMouseLeave={() => onDayHover(null)}
              whileHover={
                isCurrentMonth
                  ? { scale: isStart || isEnd ? 1.12 : 1.1, zIndex: 2 }
                  : {}
              }
              whileTap={{ scale: 0.92 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              style={
                mood && !isStart && !isEnd
                  ? { background: mood.bg }
                  : undefined
              }
            >
              <span className="day-number">{date.getDate()}</span>
              {mood && (
                <div
                  className="day-mood-dot"
                  style={{ background: mood.color }}
                  title={mood.label}
                />
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
