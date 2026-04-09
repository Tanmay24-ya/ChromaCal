"use client";

import { motion } from "framer-motion";
import { DayMood } from "@/lib/types";
import { generateCalendarDays, formatDateKey, isToday } from "@/lib/utils";

const DAYS = ["S", "M", "T", "W", "T", "F", "S"];

interface HeatmapViewProps {
  year: number;
  month: number;
  moods: DayMood;
  onDayClick: (date: Date) => void;
}

export default function HeatmapView({ year, month, moods, onDayClick }: HeatmapViewProps) {
  const days = generateCalendarDays(year, month);

  return (
    <div style={{ padding: "8px 20px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <p style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-muted)" }}>
          🌡 Mood Heatmap
        </p>
        <p style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>Click a day to add mood</p>
      </div>

      {/* Headers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 4 }}>
        {DAYS.map((d, i) => (
          <div key={i} style={{ textAlign: "center", fontSize: "0.6rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.1em" }}>
            {d}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
        {days.map(({ date, isCurrentMonth }, idx) => {
          const key = formatDateKey(date);
          const mood = isCurrentMonth ? moods[key] : null;
          const today = isToday(date);

          return (
            <motion.div
              key={idx}
              onClick={() => isCurrentMonth && onDayClick(date)}
              whileHover={{ scale: 1.15, zIndex: 2 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              title={mood ? `${mood.emoji} ${mood.label}` : date.toDateString()}
              style={{
                aspectRatio: "1",
                borderRadius: 6,
                background: mood ? mood.bg : isCurrentMonth ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.01)",
                border: today ? "1.5px solid var(--accent)" : "1px solid",
                borderColor: mood ? mood.color + "40" : "rgba(255,255,255,0.06)",
                cursor: isCurrentMonth ? "pointer" : "default",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: mood ? "0.9rem" : "0.55rem",
                color: mood ? "transparent" : isCurrentMonth ? "var(--text-muted)" : "rgba(255,255,255,0.1)",
                position: "relative",
                transition: "all 0.2s",
              }}
            >
              {mood ? (
                <span style={{ fontSize: "0.85rem", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }}>
                  {mood.emoji}
                </span>
              ) : (
                <span style={{ opacity: isCurrentMonth ? 0.5 : 0.2 }}>{date.getDate()}</span>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap", gap: 8 }}>
        {Object.entries(
          Object.values(moods).reduce<Record<string, typeof moods[string]>>(
            (acc, m) => { if (m && !acc[m.label]) acc[m.label] = m; return acc; },
            {}
          )
        ).map(([label, m]) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 5, padding: "3px 8px", borderRadius: 999, background: m.bg, border: `1px solid ${m.color}40` }}>
            <span style={{ fontSize: "0.75rem" }}>{m.emoji}</span>
            <span style={{ fontSize: "0.6rem", color: m.color, fontWeight: 600 }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
