"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  DateRange, MonthNotes, DayMood, IntentMode, CalendarView,
  PackingItem, TodoItem, Note, StickyNote, AppSettings, UserStats,
  NoteCategory, EntryType, Frequency
} from "@/lib/types";
import {
  formatDateKey, getRangeDays, generateId, getRangeSuggestion, addDays
} from "@/lib/utils";
import { PACKING_LIST_ITEMS } from "@/lib/constants";
import { audio } from "@/lib/audio";

const today = new Date();

export function useCalendar() {
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedRange, setSelectedRange] = useState<DateRange>({ start: null, end: null });
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  
  // Advanced State Machine for Selection
  const [selectionState, setSelectionState] = useState<"idle" | "anchor" | "committed">("idle");
  const [isDragging, setIsDragging] = useState(false);

  const [notes, setNotes] = useState<MonthNotes>({});
  const [moods, setMoods] = useState<DayMood>({});
  const [intentMode, setIntentMode] = useState<IntentMode>("productivity");
  const [view, setView] = useState<CalendarView>("grid");
  const [packingItems, setPackingItems] = useState<PackingItem[]>([]);
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [stickies, setStickies] = useState<StickyNote[]>([]);
  
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const [settings, setSettings] = useState<AppSettings>({ soundEnabled: true, theme: "dark" });
  const [stats, setStats] = useState<UserStats>({ streak: 0, lastActive: null, selectedDaysRecord: {} });

  // Navigation Direction (1 = forward, -1 = backward)
  const navDirection = useRef(1);

  // Persistence
  useEffect(() => {
    try {
      const saved = localStorage.getItem("lumaflow-core-v1");
      if (saved) {
        const data = JSON.parse(saved);
        if (data.notes) setNotes(data.notes);
        if (data.moods) setMoods(data.moods);
        if (data.intentMode) setIntentMode(data.intentMode);
        if (data.settings) {
          setSettings(data.settings);
          audio.toggle(data.settings.soundEnabled);
        }
        if (data.stats) setStats(data.stats);
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    localStorage.setItem("lumaflow-core-v1", JSON.stringify({ notes, moods, intentMode, settings, stats }));
  }, [notes, moods, intentMode, settings, stats]);

  const toggleSound = useCallback(() => {
    setSettings(s => {
      const next = { ...s, soundEnabled: !s.soundEnabled };
      audio.toggle(next.soundEnabled);
      return next;
    });
    audio.playTick();
  }, []);

  const goToPrevMonth = useCallback(() => {
    audio.playSwoosh();
    navDirection.current = -1;
    setCurrentMonth((m) => {
      if (m === 0) { setCurrentYear((y) => y - 1); return 11; }
      return m - 1;
    });
  }, []);

  const goToNextMonth = useCallback(() => {
    audio.playSwoosh();
    navDirection.current = 1;
    setCurrentMonth((m) => {
      if (m === 11) { setCurrentYear((y) => y + 1); return 0; }
      return m + 1;
    });
  }, []);

  const goToToday = useCallback(() => {
    audio.playSwoosh();
    const now = new Date();
    if (now.getMonth() !== currentMonth || now.getFullYear() !== currentYear) {
       navDirection.current = (now.getFullYear() > currentYear || (now.getFullYear() === currentYear && now.getMonth() > currentMonth)) ? 1 : -1;
    }
    setCurrentMonth(now.getMonth());
    setCurrentYear(now.getFullYear());
  }, [currentMonth, currentYear]);

  const updateStatsForSelection = (start: Date) => {
    setStats(prev => {
      const day = start.getDay();
      const records = { ...prev.selectedDaysRecord };
      records[day] = (records[day] || 0) + 1;

      let streak = prev.streak;
      const todayStr = formatDateKey(today);
      if (prev.lastActive !== todayStr) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (prev.lastActive === formatDateKey(yesterday)) { streak += 1; } 
        else if (prev.lastActive !== todayStr) { streak = 1; }
      }
      return { ...prev, streak, lastActive: todayStr, selectedDaysRecord: records };
    });
  };

  // Drag logic
  const handleDragStart = useCallback((date: Date) => {
    if (selectionState === "committed") {
      setSelectionState("idle");
      setSelectedRange({ start: null, end: null });
    }
    audio.playPop();
    setSelectionState("anchor");
    setSelectedRange({ start: date, end: null });
    setIsDragging(true);
    setHoverDate(date);
    updateStatsForSelection(date);
    // suggestions
    setSuggestions(getRangeSuggestion(date));
    setShowSuggestions(true);
  }, [selectionState]);

  const handleDragEnter = useCallback((date: Date) => {
    if (!isDragging || selectionState !== "anchor") return;
    setHoverDate(date);
  }, [isDragging, selectionState]);

  const handleDragEnd = useCallback((date: Date) => {
    if (!isDragging) return;
    setIsDragging(false);
    audio.playPop();
    
    // Auto-swap
    if (selectedRange.start && date < selectedRange.start) {
      setSelectedRange(prev => ({ start: date, end: prev.start }));
    } else {
      setSelectedRange(prev => ({ start: prev.start, end: date }));
    }
    setSelectionState("committed");
    setShowSuggestions(false);
  }, [isDragging, selectedRange.start]);

  const handleDayClick = useCallback((date: Date) => {
    audio.playTick();
    if (selectionState === "idle" || selectionState === "committed") {
      setSelectionState("anchor");
      setSelectedRange({ start: date, end: null });
      setHoverDate(date);
      setSuggestions(getRangeSuggestion(date));
      setShowSuggestions(true);
      updateStatsForSelection(date);
    } else if (selectionState === "anchor") {
      audio.playPop();
      if (selectedRange.start && date < selectedRange.start) {
        setSelectedRange(prev => ({ start: date, end: prev.start }));
      } else {
        setSelectedRange(prev => ({ start: prev.start, end: date }));
      }
      setSelectionState("committed");
      setShowSuggestions(false);
    }
  }, [selectionState, selectedRange.start]);

  const clearRange = useCallback(() => {
    audio.playSwoosh();
    setSelectedRange({ start: null, end: null });
    setSelectionState("idle");
    setShowSuggestions(false);
    setHoverDate(null);
  }, []);

  const applySuggestion = useCallback((days: number) => {
    if (selectedRange.start) {
      audio.playPop();
      const end = addDays(selectedRange.start, days - 1);
      setSelectedRange({ start: selectedRange.start, end });
      setSelectionState("committed");
      setShowSuggestions(false);
    }
  }, [selectedRange.start]);

  const addNote = useCallback((text: string, category: NoteCategory, entryType: EntryType, frequency: Frequency, dateKey?: string) => {
    audio.playPop();
    const note: Note = { id: generateId(), text, createdAt: new Date().toISOString(), dateKey, category, entryType, frequency };
    const key = dateKey || "general";
    setNotes((prev) => ({ ...prev, [key]: [...(prev[key] || []), note] }));
  }, []);

  const deleteNote = useCallback((noteId: string, dateKey?: string) => {
    audio.playTick();
    const key = dateKey || "general";
    setNotes((prev) => ({ ...prev, [key]: (prev[key] || []).filter((n) => n.id !== noteId) }));
  }, []);

  const setMood = useCallback((dateKey: string, mood: DayMood[string]) => {
    audio.playPop();
    setMoods((prev) => ({ ...prev, [dateKey]: mood }));
  }, []);

  const clearMood = useCallback((dateKey: string) => {
    audio.playTick();
    setMoods((prev) => { const next = { ...prev }; delete next[dateKey]; return next; });
  }, []);

  return {
    currentMonth, currentYear, 
    selectedRange, hoverDate, setHoverDate, 
    selectionState, isDragging,
    notes, moods, intentMode, setIntentMode,
    settings, stats, suggestions, showSuggestions, setShowSuggestions,
    navDirection,
    goToPrevMonth, goToNextMonth, goToToday, 
    handleDayClick, handleDragStart, handleDragEnter, handleDragEnd,
    clearRange, applySuggestion,
    addNote, deleteNote, setMood, clearMood, toggleSound,
    getGeneralNotes: () => notes["general"] || [],
    getNotesForDate: (dateKey: string) => notes[dateKey] || [],
    rangeDays: getRangeDays(selectedRange.start, selectedRange.end),
  };
}
