"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCalendar } from "@/hooks/useCalendar";
import { MONTH_DATA } from "@/lib/constants";
import { generateCalendarDays, formatDateKey } from "@/lib/utils";
import { NoteCategory, EntryType, Frequency } from "@/lib/types";

export default function LumaFlow() {
  const cal = useCalendar();
  const days = generateCalendarDays(cal.currentYear, cal.currentMonth);
  const appRef = useRef<HTMLDivElement>(null);

  const [noteText, setNoteText] = useState("");
  const [category, setCategory] = useState<NoteCategory>("general");
  const [entryType, setEntryType] = useState<EntryType>("memo");
  const [frequency, setFrequency] = useState<Frequency>("once");
  
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);

  const scrollToApp = () => appRef.current?.scrollIntoView({ behavior: "smooth" });

  const getTargetLabel = () => {
    if (cal.selectionState === "anchor" && cal.selectedRange.start) {
      if (cal.hoverDate && cal.hoverDate.getTime() !== cal.selectedRange.start.getTime()) {
        const d1 = cal.selectedRange.start;
        const d2 = cal.hoverDate;
        if (d1 < d2) return `${d1.toLocaleDateString('en-US', {month: 'short', day: 'numeric'})} → ${d2.toLocaleDateString('en-US', {month: 'short', day: 'numeric'})}`;
        return `${d2.toLocaleDateString('en-US', {month: 'short', day: 'numeric'})} → ${d1.toLocaleDateString('en-US', {month: 'short', day: 'numeric'})}`;
      }
      return `${cal.selectedRange.start.toLocaleDateString('en-US', {month: 'short', day: 'numeric'})} (Selecting...)`;
    }
    if (cal.selectionState === "committed" && cal.selectedRange.start) {
      if (cal.selectedRange.end && cal.selectedRange.start.getTime() !== cal.selectedRange.end.getTime()) {
        return `${cal.selectedRange.start.toLocaleDateString('en-US', {month: 'short', day: 'numeric'})} → ${cal.selectedRange.end.toLocaleDateString('en-US', {month: 'short', day: 'numeric'})} (${cal.rangeDays} days)`;
      }
      return cal.selectedRange.start.toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'});
    }
    return "Select a timeline point...";
  };

  const themeVariables = useMemo(() => {
    if (category === "work") { return { c: "#10B981", g: "rgba(16, 185, 129, 0.3)", l: "rgba(16, 185, 129, 0.1)", b: "rgba(16, 185, 129, 0.5)" }; }
    if (category === "personal") { return { c: "#F59E0B", g: "rgba(245, 158, 11, 0.3)", l: "rgba(245, 158, 11, 0.1)", b: "rgba(245, 158, 11, 0.5)" }; }
    if (category === "urgent") { return { c: "#F43F5E", g: "rgba(244, 63, 94, 0.3)", l: "rgba(244, 63, 94, 0.1)", b: "rgba(244, 63, 94, 0.5)" }; }
    return { c: "#0066FF", g: "rgba(0, 102, 255, 0.3)", l: "rgba(0, 102, 255, 0.1)", b: "rgba(0, 102, 255, 0.5)" };
  }, [category]);

  const activeNotes = useMemo(() => {
    if (!cal.selectedRange.start) return [];
    return cal.getNotesForDate(formatDateKey(cal.selectedRange.start)) || [];
  }, [cal.selectedRange.start, cal.notes]);

  const stats = useMemo(() => {
    let memos = 0; let events = 0;
    const catCount: Record<string, number> = { work: 0, personal: 0, urgent: 0, general: 0 };
    activeNotes.forEach(n => {
      if (n.entryType === "memo") memos++; if (n.entryType === "event") events++;
      catCount[n.category]++;
    });
    let primeFocus = "GENERAL"; let max = 0;
    Object.entries(catCount).forEach(([cat, val]) => { if (val > max) { max = val; primeFocus = outlineTag(cat); } });
    if (max === 0) primeFocus = "NONE";
    return { memos, events, primeFocus };
  }, [activeNotes]);

  function outlineTag(cat: string) { return cat.toUpperCase(); }

  const handleAddEntry = () => {
    if (!noteText.trim() || !cal.selectedRange.start) return;
    cal.addNote(noteText, category, entryType, frequency, formatDateKey(cal.selectedRange.start));
    setNoteText("");
  };

  const executeExport = (type: "png" | "pdf") => {
    if (type === "pdf") window.print();
    else alert("High-Res PNG Generation initialized. Capturing DOM timeline...");
    setIsExportOpen(false);
  };

  return (
    <div className={`scroll-container ${!isDark ? 'light-theme' : ''}`} style={{ "--accent-color": themeVariables.c, "--accent-glow": themeVariables.g, "--accent-light": themeVariables.l, "--accent-border": themeVariables.b } as any}>
      
      {/* ─── GLOBAL HEADER (Sticky) ─── */}
      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 70, background: 'var(--bg-panel)', backdropFilter: 'blur(16px)', zIndex: 100, borderBottom: '1px solid var(--border-glass)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
          <div style={{ background: 'var(--accent-color)', color: 'var(--bg-dark)', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px var(--accent-glow)' }}>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'Clash Display', letterSpacing: '-0.02em', color: 'var(--text-main)' }}>LumaFlow</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={() => setIsDark(!isDark)} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)', color: 'var(--text-main)', width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            {isDark ? <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg> : <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>}
          </button>
          <button onClick={scrollToApp} style={{ background: 'var(--accent-color)', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 999, fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 4px 15px var(--accent-glow)', transition: '0.2s' }}>Explore Calendar</button>
        </div>
      </header>

      {/* ─── LANDING PAGE HERO ─── */}
      <section className="snap-section landing-hero" style={{ paddingTop: 70, '--accent-color': '#0066FF', '--accent-light': 'rgba(0,102,255,0.1)' } as any}>
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }} style={{ position: 'relative', zIndex: 10 }}>
          <h1 className="hero-title">LUMAFLOW.<br /><span>INTERACTIVE.</span></h1>
          <p className="hero-subtitle">PRECISION ENGINEERING FOR YOUR TIMELINE.<br />DRAG. DOCUMENT. ANALYZE. REPEAT.</p>
          <div className="hero-buttons" style={{ justifyContent: 'center' }}>
            <button className="btn-primary" onClick={scrollToApp}>
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" stroke="currentColor" strokeWidth="2" fill="none"/></svg>
              START PLANNING
            </button>
          </div>
        </motion.div>
      </section>

      {/* ─── MASSIVE EXTENDED FEATURES SHOWCASE ─── */}
      <section id="features" style={{ padding: '80px 0' }}>
        <div className="feature-section">
          <div className="feature-container">
            
            {/* Feature 1: Core Drag Selection (Blue) */}
            <div className="feature-block" style={{ '--accent-color': '#0066FF', '--accent-glow': 'rgba(0,102,255,0.3)' } as any}>
              <motion.div className="feat-text" initial={{ opacity: 0, x: -80 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: "easeOut" }} viewport={{ once: true, margin: "-100px" }}>
                <div className="feat-icon-wrap"><svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg></div>
                <h2 className="feat-title">Precision Range Selection</h2>
                <p className="feat-desc">Select date ranges with Click, Drag, or Keyboard. Experience the frictionless State Machine logic with real-time blue drag previews, auto-reversed span handling, and instant duration feedback before you even commit.</p>
              </motion.div>
              <motion.div className="feat-visual" initial={{ opacity: 0, x: 80 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }} viewport={{ once: true, margin: "-100px" }}>
                <div className="feat-pill">CORE SYSTEM</div>
                <div className="mock-window">
                  <svg className="mock-icon" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
                </div>
              </motion.div>
            </div>

            {/* Feature 2: Page Flip & Physical (Purple) */}
            <div className="feature-block reverse" style={{ marginTop: 120, '--accent-color': '#8B5CF6', '--accent-glow': 'rgba(139,92,246,0.3)' } as any}>
              <motion.div className="feat-text" style={{ paddingLeft: 80 }} initial={{ opacity: 0, x: 80 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: "easeOut" }} viewport={{ once: true, margin: "-100px" }}>
                <div className="feat-icon-wrap"><svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg></div>
                <h2 className="feat-title">Physical Calendar Emulation</h2>
                <p className="feat-desc">We transcended standard flat UI. When you shift timelines, the calendar executes a physically grounded 3D `rotateY()` turn simulating physical pages. Framed completely by dynamic UI spiral binders.</p>
              </motion.div>
              <motion.div className="feat-visual" initial={{ opacity: 0, x: -80 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }} viewport={{ once: true, margin: "-100px" }}>
                <div className="feat-pill">UX UPGRADE</div>
                <div className="mock-window">
                  <svg className="mock-icon" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
                </div>
              </motion.div>
            </div>

            {/* Feature 3: Dynamic Theming (Green) */}
            <div className="feature-block" style={{ marginTop: 120, '--accent-color': '#10B981', '--accent-glow': 'rgba(16,185,129,0.3)' } as any}>
              <motion.div className="feat-text" initial={{ opacity: 0, x: -80 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: "easeOut" }} viewport={{ once: true, margin: "-100px" }}>
                <div className="feat-icon-wrap"><svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 12 12 17 22 12"/><polyline points="2 17 12 22 22 17"/></svg></div>
                <h2 className="feat-title">Intent-Driven Theming</h2>
                <p className="feat-desc">The UI doesn't just hold data. It *becomes* the data. Clicking between Work (Emerald), Personal (Amber), and Urgent (Ruby) aggressively recalibrates every single border, glow, shadow, and tag dynamically in the DOM.</p>
              </motion.div>
              <motion.div className="feat-visual" initial={{ opacity: 0, x: 80 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }} viewport={{ once: true, margin: "-100px" }}>
                <div className="feat-pill">ENGINEERING</div>
                <div className="mock-window">
                  <svg className="mock-icon" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 12 12 17 22 12"/><polyline points="2 17 12 22 22 17"/></svg>
                </div>
              </motion.div>
            </div>

            {/* Feature 4: Intelligence Dashboard (Rose) */}
            <div className="feature-block reverse" style={{ marginTop: 120, '--accent-color': '#F43F5E', '--accent-glow': 'rgba(244,63,94,0.3)' } as any}>
              <motion.div className="feat-text" style={{ paddingLeft: 80 }} initial={{ opacity: 0, x: 80 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: "easeOut" }} viewport={{ once: true, margin: "-100px" }}>
                <div className="feat-icon-wrap"><svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg></div>
                <h2 className="feat-title">Contextual Intelligence Insight</h2>
                <p className="feat-desc">The dashboard reads your selected date ranges and calculates on the fly. It aggregates total Memo entries, tallies your Event tags, and executes algorithms to determine your psychological "Prime Focus" for that period instantly.</p>
              </motion.div>
              <motion.div className="feat-visual" initial={{ opacity: 0, x: -80 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }} viewport={{ once: true, margin: "-100px" }}>
                <div className="feat-pill">ALGORITHM</div>
                <div className="mock-window">
                  <svg className="mock-icon" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                </div>
              </motion.div>
            </div>

            {/* Feature 5: Smart Notes (Amber) */}
            <div className="feature-block" style={{ marginTop: 120, '--accent-color': '#F59E0B', '--accent-glow': 'rgba(245,158,11,0.3)' } as any}>
              <motion.div className="feat-text" initial={{ opacity: 0, x: -80 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: "easeOut" }} viewport={{ once: true, margin: "-100px" }}>
                <div className="feat-icon-wrap"><svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div>
                <h2 className="feat-title">Smart Notes & Tracking</h2>
                <p className="feat-desc">Chronicle everything. Secure infinite logs into our memory panels natively persisting underneath the DOM. Pin categories directly to grids enabling dots visualization directly on the physical tracker below.</p>
              </motion.div>
              <motion.div className="feat-visual" initial={{ opacity: 0, x: 80 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }} viewport={{ once: true, margin: "-100px" }}>
                <div className="feat-pill">FEATURES</div>
                <div className="mock-window">
                  <svg className="mock-icon" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── APP INTERFACE ─── */}
      <section ref={appRef} className="snap-section" style={{ minHeight: 'auto', paddingTop: 120, paddingBottom: 160 }}>
        <div className="app-container" style={{ height: 'auto', gap: 40, alignItems: 'flex-start', maxWidth: 1400, margin: '0 auto', background: 'transparent' }}>
          
          {/* SIDEBAR: CHRONICLE ENTRY & ACTIVE SELECTION HISTORY */}
          <aside className="sidebar" style={{ width: 440, border: 'none', background: 'transparent', padding: 0 }}>
            <div className="bento-card" style={{ borderRadius: 24, padding: '40px 32px', marginBottom: 24 }}>
              <div className="panel-header" style={{ marginBottom: 24 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                CHRONICLE ENTRY
              </div>
              
              <div className="bento-card" style={{ padding: 20 }}>
                <p className="label-sm">TARGETED TIMELINE</p>
                <div className="timeline-target-box">
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  {getTargetLabel()}
                </div>
              </div>

              <textarea 
                className="memory-input"
                placeholder={category === "work" ? "e.g. 'Project sync', 'Deploy v2'..." : "What's happening in this timeline?"}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
              />

              <div className="grid-buttons-2x2">
                <button className={`grid-btn ${category === "general" ? "active" : ""}`} onClick={() => setCategory("general")}>⚡ GENERAL</button>
                <button className={`grid-btn ${category === "work" ? "active" : ""}`} onClick={() => setCategory("work")}>💼 WORK</button>
                <button className={`grid-btn ${category === "personal" ? "active" : ""}`} onClick={() => setCategory("personal")}>👤 PERSONAL</button>
                <button className={`grid-btn ${category === "urgent" ? "active" : ""}`} onClick={() => setCategory("urgent")}>⚠ URGENT</button>
              </div>

              <div className="bento-card" style={{ padding: 20 }}>
                <p className="label-sm">CHRONICLE SETTINGS</p>
                <div style={{ marginBottom: 16 }}>
                  <p style={{ fontSize: "0.65rem", color: "var(--text-subtle)", fontWeight: 700, marginBottom: 8 }}>ENTRY TYPE</p>
                  <div className="toggle-group" style={{ marginBottom: 0 }}>
                    <button className={`toggle-btn ${entryType === "memo" ? "active" : ""}`} onClick={() => setEntryType("memo")}>MEMO</button>
                    <button className={`toggle-btn ${entryType === "event" ? "active" : ""}`} onClick={() => setEntryType("event")}>EVENT</button>
                  </div>
                </div>
                <div>
                  <p style={{ fontSize: "0.65rem", color: "var(--text-subtle)", fontWeight: 700, marginBottom: 8 }}>FREQUENCY</p>
                  <div className="toggle-group" style={{ marginBottom: 0 }}>
                    <button className={`toggle-btn ${frequency === "once" ? "active" : ""}`} onClick={() => setFrequency("once")}>ONCE</button>
                    <button className={`toggle-btn ${frequency === "weekly" ? "active" : ""}`} onClick={() => setFrequency("weekly")}>WEEKLY</button>
                    <button className={`toggle-btn ${frequency === "monthly" ? "active" : ""}`} onClick={() => setFrequency("monthly")}>MONTHLY</button>
                  </div>
                </div>
              </div>

              <button className="add-btn" onClick={handleAddEntry} disabled={!noteText.trim() || !cal.selectedRange.start}>
                ADD TO TIMELINE
              </button>
            </div>

            {/* ACTIVE SELECTION HISTORY */}
            {activeNotes.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <p className="label-sm" style={{ marginBottom: 16, paddingLeft: 8 }}>ACTIVE SELECTION HISTORY</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {activeNotes.map((n, i) => {
                    const colorMap: any = { work: "#10B981", urgent: "#F43F5E", personal: "#F59E0B", general: "#0066FF" };
                    return (
                      <div key={n.id} className="bento-card" style={{ borderLeft: `3px solid ${colorMap[n.category]}`, padding: "16px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                          <div style={{ width: 6, height: 6, background: colorMap[n.category], borderRadius: "50%" }} />
                          <span style={{ fontSize: "0.65rem", fontWeight: 800, textTransform: "uppercase", color: colorMap[n.category], letterSpacing: "0.1em" }}>
                            {n.category} • {n.entryType}
                          </span>
                        </div>
                        <p style={{ fontSize: "0.95rem", color: "var(--text-main)", lineHeight: 1.5, fontWeight: 500 }}>{n.text}</p>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </aside>

          {/* MAIN CALENDAR COLUMN */}
          <main className="main-content" style={{ padding: 0 }}>

            {/* EXPORT ROW */}
            <div style={{ width: "100%", maxWidth: 800, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontStyle: "italic" }}>Tip: Click a start and end date to select a range.</p>
              <button 
                onClick={() => setIsExportOpen(true)}
                style={{ background: "var(--accent-color)", color: "#fff", border: "none", padding: "10px 24px", borderRadius: 8, fontWeight: 800, fontSize: "0.8rem", cursor: "pointer", boxShadow: "0 4px 20px var(--accent-glow)", display: "flex", alignItems: "center", gap: 8, letterSpacing: "0.05em", transition: "0.2s" }}
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                EXPORT TIMELINE
              </button>
            </div>

            {/* SMART SUGGESTIONS */}
            <AnimatePresence>
              {cal.selectionState === "anchor" && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }} 
                  animate={{ opacity: 1, height: 'auto', marginBottom: 24 }} 
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className="bento-card"
                  style={{ width: '100%', maxWidth: 800, padding: "16px 24px", display: "flex", alignItems: "center", gap: 16, background: "rgba(16, 185, 129, 0.1)", borderColor: "rgba(16, 185, 129, 0.3)" }}
                >
                  <div style={{ color: "#10B981" }}>
                    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                  </div>
                  <div>
                    <p style={{ fontSize: "0.85rem", color: "#10B981", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 4 }}>Smart Suggestions</p>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => cal.applySuggestion(3)} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "var(--text-main)", padding: "4px 12px", borderRadius: 99, fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}>Weekend Trip (3 days)</button>
                      <button onClick={() => cal.applySuggestion(7)} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "var(--text-main)", padding: "4px 12px", borderRadius: 99, fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}>Work Sprint (7 days)</button>
                    </div>
                  </div>
                  <button onClick={cal.clearRange} style={{ marginLeft: "auto", background: "rgba(244,63,94,0.1)", color: "#f43f5e", border: "1px solid rgba(244,63,94,0.3)", padding: "8px 16px", borderRadius: 8, fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}>CANCEL</button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* WALL CALENDAR */}
            <div className="wall-calendar-wrapper">
              <div className="spiral-binding">{Array.from({length: 40}).map((_, i) => <div key={i} className="spiral-ring" />)}</div>
              <motion.div className="wall-hero" style={{ backgroundImage: `url(${MONTH_DATA[cal.currentMonth].image})` }} key={cal.currentMonth} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                <div className="wall-wave" />
                <div className="wall-wave-inner" />
                <div className="wall-title">
                  <div className="wt-year">{cal.currentYear}</div>
                  <div className="wt-month">{MONTH_DATA[cal.currentMonth].name.toUpperCase()}</div>
                </div>
              </motion.div>

              <div className="wall-calendar-bottom">
                <div className="cal-controls">
                  <div className="cal-filters">
                    <select className="filter-select" value={cal.currentMonth} onChange={() => {}}>{MONTH_DATA.map((m, i) => <option key={m.name} value={i}>{m.name.toUpperCase()}</option>)}</select>
                    <select className="filter-select" value={cal.currentYear} onChange={() => {}}><option value="2026">2026</option><option value="2027">2027</option></select>
                  </div>
                  <div className="cal-nav-group">
                    <button className="nav-btn" onClick={cal.goToPrevMonth}>‹</button>
                    <button className="nav-btn wide" onClick={cal.goToToday}><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg> TODAY</button>
                    <button className="nav-btn" onClick={cal.goToNextMonth}>›</button>
                  </div>
                </div>

                <div className="calendar-grid">
                  <div className="cal-weekdays">{["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((d, i) => <div key={d} className={`weekday ${i >= 5 ? 'weekend' : ''}`}>{d}</div>)}</div>
                  <AnimatePresence mode="wait">
                    <motion.div key={`${cal.currentMonth}-${cal.currentYear}`} initial={{ opacity: 0, rotateY: cal.navDirection.current > 0 ? -90 : 90 }} animate={{ opacity: 1, rotateY: 0 }} exit={{ opacity: 0, rotateY: cal.navDirection.current > 0 ? 90 : -90 }} transition={{ type: "spring", stiffness: 100, damping: 20 }} className="cal-days" style={{ transformOrigin: "center center" }}>
                      {days.map(({ date, isCurrentMonth }, idx) => {
                        const key = formatDateKey(date);
                        const dayOfWeek = (date.getDay() + 6) % 7; 
                        const isWeekend = dayOfWeek >= 5;

                        let sStart = cal.selectedRange.start; let sEnd = cal.selectedRange.end;
                        if (cal.selectionState === "anchor" && cal.hoverDate) {
                          if (cal.hoverDate < sStart!) { sEnd = sStart; sStart = cal.hoverDate; } else { sEnd = cal.hoverDate; }
                        }

                        const isStart = sStart && formatDateKey(sStart) === key; const isEnd = sEnd && formatDateKey(sEnd) === key;
                        const isInRange = sStart && sEnd && date > sStart && date < sEnd;
                        const isAnchor = cal.selectionState === "anchor" && sStart && formatDateKey(sStart) === key && !sEnd;
                        
                        let classes = "day-cell";
                        if (!isCurrentMonth) classes += " other-month";
                        if (isWeekend) classes += " weekend";
                        if (isStart || isEnd || (isStart && isEnd) || isAnchor) classes += " is-selected";
                        if (isInRange) classes += cal.selectionState === "anchor" ? " preview-range" : " in-range";

                        const dayNotes = cal.getNotesForDate(key) || [];

                        return (
                          <div key={idx} className={classes} onClick={() => isCurrentMonth && cal.handleDayClick(date)} onMouseEnter={() => isCurrentMonth && cal.handleDragEnter(date)} onMouseDownCapture={() => isCurrentMonth && cal.handleDragStart(date)} onMouseUpCapture={() => isCurrentMonth && cal.handleDragEnd(date)}>
                            {date.getDate()}
                            {dayNotes.length > 0 && <div className="dots-container">{dayNotes.slice(0,3).map((n, i) => <div key={i} className={`dot dot-${n.category}`} />)}</div>}
                          </div>
                        );
                      })}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>

          </main>
        </div>
      </section>

      {/* ─── PREMIUM FOOTER ─── */}
      <footer style={{ borderTop: "1px solid var(--border-glass)", background: "var(--bg-panel)", padding: "80px 40px", marginTop: 80 }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <div style={{ background: 'var(--accent-color)', color: '#fff', borderRadius: 8, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'Clash Display', color: 'var(--text-main)' }}>LumaFlow</span>
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", maxWidth: 300, lineHeight: 1.6 }}>A premium, physical calendar experience designed for digital focus. Recreating the timeless wall calendar aesthetic in a modern Next.js app.</p>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: 24, fontWeight: 700 }}>Built by Tanmay.</p>
          </div>
          <div style={{ display: "flex", gap: 32 }}>
            <a href="https://github.com/Tanmay24-ya" target="_blank" rel="noreferrer" style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: "0.85rem", fontWeight: 600 }}>GitHub</a>
            <a href="https://www.linkedin.com/in/tanmay-dixit-a251a4296/" target="_blank" rel="noreferrer" style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: "0.85rem", fontWeight: 600 }}>LinkedIn</a>
            <a href="https://drive.google.com/file/d/1WOfyP4KGpETQ8UiL3ASpWZWh_Lbk7IPt/view?usp=sharing" target="_blank" rel="noreferrer" style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: "0.85rem", fontWeight: 600 }}>Resume</a>
          </div>
        </div>
        <div style={{ maxWidth: 1400, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 80, borderTop: "1px solid var(--border-glass)", paddingTop: 32 }}>
          <p style={{ color: "var(--text-subtle)", fontSize: "0.75rem", fontWeight: 700 }}>© 2026 LUMAFLOW. BUILT BY TANMAY.</p>
          <div style={{ display: "flex", gap: 24 }}>
            <a href="#" style={{ color: "var(--text-subtle)", textDecoration: "none", fontSize: "0.75rem", fontWeight: 700 }}>PRIVACY POLICY</a>
            <a href="#" style={{ color: "var(--text-subtle)", textDecoration: "none", fontSize: "0.75rem", fontWeight: 700 }}>TERMS OF SERVICE</a>
          </div>
        </div>
      </footer>

      {/* ─── EXPORT MODAL ─── */}
      <AnimatePresence>
        {isExportOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 999 }}
              onClick={() => setIsExportOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              style={{ position: 'fixed', top: '50%', left: '50%', x: '-50%', y: '-50%', width: 440, background: 'var(--bg-dark)', border: '1px solid var(--border-glass)', borderRadius: 24, zIndex: 1000, padding: 32, boxShadow: '0 40px 80px rgba(0,0,0,0.8)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'Clash Display', letterSpacing: '0.05em' }}>EXPORT TIMELINE</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Generate Professional Record</p>
                </div>
                <button onClick={() => setIsExportOpen(false)} style={{ background: 'var(--bg-card)', border: 'none', width: 32, height: 32, borderRadius: '50%', color: 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>✕</button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <button onClick={() => executeExport("png")} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-panel)', border: '1px solid var(--border-glass)', padding: '20px 24px', borderRadius: 16, cursor: 'pointer', transition: '0.2s', textAlign: 'left' }} className="export-btn">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ background: 'rgba(244, 63, 94, 0.1)', color: '#F43F5E', width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    </div>
                    <div>
                      <p style={{ color: 'var(--text-main)', fontWeight: 700, fontSize: '0.95rem' }}>Capture Image</p>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em' }}>HIGH RES PNG</p>
                    </div>
                  </div>
                  <svg width="20" height="20" fill="none" stroke="var(--text-subtle)" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                </button>

                <button onClick={() => executeExport("pdf")} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-panel)', border: '1px solid var(--border-glass)', padding: '20px 24px', borderRadius: 16, cursor: 'pointer', transition: '0.2s', textAlign: 'left' }} className="export-btn">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6', width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                    </div>
                    <div>
                      <p style={{ color: 'var(--text-main)', fontWeight: 700, fontSize: '0.95rem' }}>Document PDF</p>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em' }}>READY TO PRINT</p>
                    </div>
                  </div>
                  <svg width="20" height="20" fill="none" stroke="var(--text-subtle)" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style jsx>{`
        .export-btn:hover { background: var(--bg-card) !important; border-color: rgba(255,255,255,0.15) !important; transform: translateY(-2px); }
      `}</style>
    </div>
  );
}
