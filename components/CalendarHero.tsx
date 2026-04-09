"use client";

import { motion, AnimatePresence } from "framer-motion";
import { MONTH_DATA } from "@/lib/constants";

interface CalendarHeroProps {
  month: number;
  year: number;
}

export default function CalendarHero({ month, year }: CalendarHeroProps) {
  const data = MONTH_DATA[month];

  return (
    <div className="hero-section">
      <AnimatePresence mode="wait">
        <motion.div
          key={`${month}-${year}`}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
          style={{ position: "absolute", inset: 0 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={data.image}
            alt={`${data.name} hero`}
            className="hero-image"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Time-of-day tint overlay */}
      <div className={`hero-overlay tint-${data.timeOfDay}`} />
      <div className="hero-overlay" />
      <div className="hero-overlay-side" />

      {/* Month content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`content-${month}-${year}`}
          className="hero-content"
          initial={{ opacity: 0, y: 20, x: 10 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <motion.p
            className="hero-year"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {year}
          </motion.p>

          <motion.h1
            className="hero-month-name"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            {data.name}
          </motion.h1>

          <motion.p
            className="hero-description"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
          >
            {data.description}
          </motion.p>

          <motion.span
            className="hero-mood-badge"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.55, type: "spring" }}
          >
            {data.mood}
          </motion.span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
