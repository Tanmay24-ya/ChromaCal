"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DayMood, MonthNotes } from "@/lib/types";
import { getMoodSummary, getDaysInMonth } from "@/lib/utils";
import { MONTH_DATA } from "@/lib/constants";

interface MonthlySummaryProps {
  month: number;
  year: number;
  moods: DayMood;
  notes: MonthNotes;
  rangeDays: number;
  onClose: () => void;
}

export default function MonthlySummary({ month, year, moods, notes, rangeDays, onClose }: MonthlySummaryProps) {
  const monthName = MONTH_DATA[month].name;
  const totalDays = getDaysInMonth(year, month);
  const summary = getMoodSummary(moods);
  const totalNotes = Object.values(notes).flat().length;

  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.85, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        <h2 className="modal-title">
          ✨ {monthName} in Review
        </h2>

        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 20, lineHeight: 1.6 }}>
          Here&apos;s a snapshot of your {monthName} based on your tracked data.
        </p>

        {/* Stats */}
        <div>
          <div className="summary-stat">
            <span className="summary-stat-label">📅 Days in month</span>
            <span className="summary-stat-value">{totalDays}</span>
          </div>

          <div className="summary-stat">
            <span className="summary-stat-label">📝 Notes written</span>
            <span className="summary-stat-value">{totalNotes}</span>
          </div>

          {rangeDays > 0 && (
            <div className="summary-stat">
              <span className="summary-stat-label">🗓 Days selected</span>
              <span className="summary-stat-value">{rangeDays}</span>
            </div>
          )}

          <div className="summary-stat">
            <span className="summary-stat-label">📊 Moods tracked</span>
            <span className="summary-stat-value">{summary?.total || 0} days</span>
          </div>
        </div>

        {/* Mood breakdown */}
        {summary && summary.sorted.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <p style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 12 }}>
              Mood Breakdown
            </p>
            {summary.sorted.map(([label, { count, emoji }]) => {
              const pct = Math.round((count / summary.total) * 100);
              return (
                <div key={label} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                      {emoji} {label}
                    </span>
                    <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-primary)" }}>
                      {count} day{count !== 1 ? "s" : ""} ({pct}%)
                    </span>
                  </div>
                  <div className="summary-bar">
                    <motion.div
                      className="summary-bar-fill"
                      style={{ background: "linear-gradient(90deg, var(--accent), #818cf8)", width: `${pct}%` }}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ delay: 0.3, duration: 0.8 }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Summary text */}
        <div style={{
          marginTop: 16,
          padding: "12px 14px",
          borderRadius: 10,
          background: "rgba(124,106,247,0.1)",
          border: "1px solid rgba(124,106,247,0.2)",
          fontSize: "0.8rem",
          color: "rgba(167,139,250,0.9)",
          lineHeight: 1.6,
        }}>
          {summary && summary.sorted.length > 0 ? (
            <>
              Your top mood this month is <strong>{summary.sorted[0][1].emoji} {summary.sorted[0][0]}</strong> with {summary.sorted[0][1].count} day{summary.sorted[0][1].count !== 1 ? "s" : ""}.
              {totalNotes > 0 && ` You've written ${totalNotes} note${totalNotes !== 1 ? "s" : ""}.`}
              {rangeDays > 0 && ` You're planning ${rangeDays} days.`}
            </>
          ) : (
            <>Start tracking moods and adding notes to see your monthly story here! 📖</>
          )}
        </div>

        <button className="modal-close" onClick={onClose}>
          Close Summary
        </button>
      </motion.div>
    </motion.div>
  );
}
