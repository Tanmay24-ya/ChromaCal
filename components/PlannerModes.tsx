"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PackingItem, TodoItem } from "@/lib/types";
import { MOCK_WEATHER } from "@/lib/constants";

interface TripModeProps {
  rangeDays: number;
  packingItems: PackingItem[];
  startDate: Date | null;
  onTogglePacking: (id: string) => void;
  onAddPacking: (text: string) => void;
}

export function TripMode({ rangeDays, packingItems, startDate, onTogglePacking, onAddPacking }: TripModeProps) {
  const [newItem, setNewItem] = useState("");
  const checked = packingItems.filter((i) => i.checked).length;
  const weather = MOCK_WEATHER.slice(0, Math.min(rangeDays, 7));

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3 }}
    >
      {/* Mode badge */}
      <div style={{ textAlign: "center", marginBottom: 14 }}>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "6px 16px", borderRadius: 999,
          background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.3)",
          color: "#fbbf24", fontSize: "0.75rem", fontWeight: 700,
        }}>
          ✈️ TRIP PLANNER MODE — {rangeDays} days
        </span>
      </div>

      {/* Mock weather */}
      <p className="panel-title" style={{ marginBottom: 8 }}>🌤 Forecast Preview</p>
      <div className="weather-strip">
        {weather.map((w, i) => (
          <motion.div
            key={i}
            className="weather-card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <div className="weather-icon">{w.icon}</div>
            <div className="weather-temp">{w.temp}</div>
            <div className="weather-desc">{w.desc}</div>
          </motion.div>
        ))}
      </div>

      {/* Packing list */}
      <div style={{ marginTop: 16 }}>
        <p className="panel-title">
          🧳 Packing List
          <span style={{ marginLeft: "auto", color: "var(--accent)", fontWeight: 700 }}>
            {checked}/{packingItems.length}
          </span>
        </p>

        {/* Progress bar */}
        <div className="summary-bar" style={{ marginBottom: 10 }}>
          <motion.div
            className="summary-bar-fill"
            style={{ background: "linear-gradient(90deg, #fbbf24, #f59e0b)", width: `${packingItems.length ? (checked / packingItems.length) * 100 : 0}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${packingItems.length ? (checked / packingItems.length) * 100 : 0}%` }}
          />
        </div>

        <div style={{ maxHeight: 200, overflowY: "auto" }}>
          <AnimatePresence>
            {packingItems.map((item) => (
              <motion.div
                key={item.id}
                className={`check-item ${item.checked ? "checked" : ""}`}
                onClick={() => onTogglePacking(item.id)}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10, height: 0 }}
                layout
              >
                <div className="check-box">{item.checked ? "✓" : ""}</div>
                <span className="check-label">{item.text}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="add-item-row">
          <input
            className="add-item-input"
            placeholder="Add item…"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && newItem.trim()) {
                onAddPacking(newItem.trim());
                setNewItem("");
              }
            }}
          />
          <button
            className="add-item-btn"
            onClick={() => {
              if (newItem.trim()) { onAddPacking(newItem.trim()); setNewItem(""); }
            }}
          >
            +
          </button>
        </div>
      </div>
    </motion.div>
  );
}

interface TaskModeProps {
  todos: TodoItem[];
  onAddTodo: (text: string) => void;
  onToggleTodo: (id: string) => void;
  onDeleteTodo: (id: string) => void;
}

export function TaskMode({ todos, onAddTodo, onToggleTodo, onDeleteTodo }: TaskModeProps) {
  const [newTodo, setNewTodo] = useState("");
  const done = todos.filter((t) => t.checked).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3 }}
    >
      <div style={{ textAlign: "center", marginBottom: 14 }}>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "6px 16px", borderRadius: 999,
          background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.3)",
          color: "#34d399", fontSize: "0.75rem", fontWeight: 700,
        }}>
          ✅ TASK PLANNER MODE
        </span>
      </div>

      <p className="panel-title">
        📋 Tasks
        {todos.length > 0 && (
          <span style={{ marginLeft: "auto", color: "var(--accent)", fontWeight: 700 }}>
            {done}/{todos.length} done
          </span>
        )}
      </p>

      <div style={{ maxHeight: 200, overflowY: "auto" }}>
        <AnimatePresence>
          {todos.length === 0 ? (
            <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", textAlign: "center", padding: "12px 0" }}>
              Add tasks for this date range!
            </p>
          ) : (
            todos.map((todo) => (
              <motion.div
                key={todo.id}
                className={`check-item ${todo.checked ? "checked" : ""}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, height: 0 }}
                layout
              >
                <div className="check-box" onClick={() => onToggleTodo(todo.id)}>
                  {todo.checked ? "✓" : ""}
                </div>
                <span className="check-label" onClick={() => onToggleTodo(todo.id)}>
                  {todo.text}
                </span>
                <button
                  onClick={() => onDeleteTodo(todo.id)}
                  className="note-delete"
                >
                  ✕
                </button>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      <div className="add-item-row">
        <input
          className="add-item-input"
          placeholder="Add a task…"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && newTodo.trim()) {
              onAddTodo(newTodo.trim());
              setNewTodo("");
            }
          }}
        />
        <button
          className="add-item-btn"
          onClick={() => {
            if (newTodo.trim()) { onAddTodo(newTodo.trim()); setNewTodo(""); }
          }}
        >
          +
        </button>
      </div>
    </motion.div>
  );
}
