import Link from "next/link";
import { DailyReading } from "@/lib/types";

interface DayCardProps {
  reading: DailyReading;
  completed: boolean;
}

export default function DayCard({ reading, completed }: DayCardProps) {
  return (
    <Link href={`/days/${reading.day}`}>
      <div
        className={`flex items-center gap-4 rounded-2xl px-5 py-5 transition-all duration-200 active:scale-[0.98] ${
          completed
            ? "border border-emerald-200/80 shadow-sm shadow-emerald-100/40 dark:border-emerald-800/50 dark:shadow-emerald-900/20"
            : "border hover:shadow-md hover:shadow-amber-100/30 dark:hover:shadow-amber-900/10"
        }`}
        style={{
          background: "var(--bg-card-solid)",
          borderColor: completed ? undefined : "var(--border-card)",
          boxShadow: completed ? undefined : "var(--shadow-card)",
        }}
      >
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl font-bold transition-all ${
            completed
              ? "bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-md shadow-emerald-200/50 dark:shadow-emerald-900/50"
              : "bg-gradient-to-br from-amber-50 to-amber-100 text-amber-700 dark:from-amber-500/20 dark:to-amber-600/20 dark:text-amber-400"
          } ${reading.day.length > 2 ? "text-[12px]" : "text-[15px]"}`}
        >
          {completed ? (
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
          ) : (
            reading.day
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[15px] font-bold" style={{ color: "var(--text-primary)" }}>
              {reading.day}일차
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                reading.testament === "구약"
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-blue-600 dark:text-blue-400"
              }`}
              style={{ background: reading.testament === "구약" ? "var(--amber-soft-bg)" : "var(--blue-soft-bg)" }}
            >
              {reading.testament}
            </span>
          </div>
          <p className="mt-1.5 truncate text-[13px]" style={{ color: "var(--text-muted)" }}>
            {reading.bibleRange}
          </p>
        </div>
        <svg
          className={`h-5 w-5 shrink-0 transition-colors ${completed ? "text-emerald-300 dark:text-emerald-600" : ""}`}
          style={!completed ? { color: "var(--text-muted)" } : undefined}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}
