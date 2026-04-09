"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Note, DayMood } from "@/lib/types";
import { MOOD_OPTIONS } from "@/lib/constants";
import { formatDateKey } from "@/lib/utils";

interface NotesAndMoodProps {
  generalNotes: Note[];
  moods: DayMood;
  selectedDateKey?: string;
  onAddNote: (text: string, dateKey?: string) => void;
  onDeleteNote: (id: string, dateKey?: string) => void;
  onSetMood: (dateKey: string, mood: DayMood[string]) => void;
  onClearMood: (dateKey: string) => void;
}

export default function NotesAndMood({
  generalNotes,
  moods,
  selectedDateKey,
  onAddNote,
  onDeleteNote,
  onSetMood,
  onClearMood,
}: NotesAndMoodProps) {
  const [noteText, setNoteText] = useState("");
  const [activeTab, setActiveTab] = useState<"notes" | "mood">("notes");

  const handleAddNote = () => {
    const trimmed = noteText.trim();
    if (!trimmed) return;
    onAddNote(trimmed, selectedDateKey);
    setNoteText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      handleAddNote();
    }
  };

  const todayKey = formatDateKey(new Date());
  const moodKey = selectedDateKey || todayKey;
  const currentMood = moods[moodKey];

  return (
    <div>
      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        {(["notes", "mood"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              padding: "7px",
              borderRadius: 8,
              border: "1px solid",
              borderColor: activeTab === tab ? "var(--accent)" : "var(--border-glass)",
              background: activeTab === tab ? "rgba(124,106,247,0.15)" : "transparent",
              color: activeTab === tab ? "var(--accent)" : "var(--text-muted)",
              fontSize: "0.72rem",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "Outfit, sans-serif",
              transition: "all 0.2s",
              textTransform: "capitalize",
            }}
          >
            {tab === "notes" ? "📝 Notes" : "🎭 Mood"}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "notes" ? (
          <motion.div
            key="notes"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2 }}
          >
            {/* Note input */}
            <div className="notes-input-wrapper">
              <textarea
                className="notes-input"
                placeholder={
                  selectedDateKey
                    ? "Add note for selected date…"
                    : "Jot down a thought… (Ctrl+Enter to save)"
                }
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                className="notes-send-btn"
                onClick={handleAddNote}
                disabled={!noteText.trim()}
                style={{ opacity: noteText.trim() ? 1 : 0.4 }}
              >
                ↑
              </button>
            </div>

            {/* Notes list */}
            <div style={{ maxHeight: 180, overflowY: "auto" }}>
              <AnimatePresence>
                {generalNotes.length === 0 ? (
                  <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", textAlign: "center", padding: "12px 0" }}>
                    No notes yet. Add your first one!
                  </p>
                ) : (
                  [...generalNotes].reverse().map((note) => (
                    <motion.div
                      key={note.id}
                      className="note-item"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <span style={{ color: "var(--accent)", fontSize: "0.8rem" }}>✦</span>
                      <span className="note-text">{note.text}</span>
                      <button
                        className="note-delete"
                        onClick={() => onDeleteNote(note.id, selectedDateKey)}
                      >
                        ✕
                      </button>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="mood"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: 12 }}>
              How are you feeling{selectedDateKey ? " on this date" : " today"}?
            </p>

            <div className="mood-grid">
              {MOOD_OPTIONS.map((mood) => {
                const isSelected = currentMood?.label === mood.label;
                return (
                  <motion.button
                    key={mood.label}
                    className={`mood-btn ${isSelected ? "selected" : ""}`}
                    style={
                      isSelected
                        ? { borderColor: mood.color, background: mood.bg }
                        : {}
                    }
                    onClick={() =>
                      isSelected ? onClearMood(moodKey) : onSetMood(moodKey, mood)
                    }
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <span>{mood.emoji}</span>
                    <span>{mood.label}</span>
                  </motion.button>
                );
              })}
            </div>

            {currentMood && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  marginTop: 12,
                  padding: "8px 12px",
                  borderRadius: 8,
                  background: currentMood.bg,
                  border: `1px solid ${currentMood.color}40`,
                  fontSize: "0.75rem",
                  color: currentMood.color,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span>{currentMood.emoji}</span>
                <span style={{ fontWeight: 600 }}>Feeling {currentMood.label}</span>
                <button
                  onClick={() => onClearMood(moodKey)}
                  style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "inherit", fontSize: "0.7rem", opacity: 0.7 }}
                >
                  Clear
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
