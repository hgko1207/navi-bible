"use client";

import { useState, useMemo } from "react";
import { DailyReading } from "@/lib/types";
import Link from "next/link";

interface SearchBarProps {
  readings: DailyReading[];
  completedDays: number[];
}

export default function SearchBar({ readings, completedDays }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const results = useMemo(() => {
    if (query.trim().length === 0) return [];
    const q = query.trim().toLowerCase();
    return readings.filter(
      (r) =>
        r.day.toString().includes(q) ||
        r.bibleRange.toLowerCase().includes(q) ||
        r.content.toLowerCase().includes(q) ||
        r.weekday.includes(q) ||
        r.keyPoints.some(
          (kp) =>
            kp.verse.toLowerCase().includes(q) ||
            kp.summary.toLowerCase().includes(q)
        )
    );
  }, [query, readings]);

  const showResults = isFocused && query.trim().length > 0;

  return (
    <div className="relative">
      <div className="relative">
        <svg
          className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2"
          style={{ color: "var(--text-muted)" }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          placeholder="일차, 성경 범위, 키워드 검색..."
          className="card-glass w-full rounded-2xl py-3 pl-10 pr-4 text-sm outline-none transition-all focus:ring-2 focus:ring-amber-100/50 dark:focus:ring-amber-900/50"
          style={{ color: "var(--text-primary)" }}
        />
        {query.length > 0 && (
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2"
            style={{ color: "var(--text-muted)" }}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        )}
      </div>

      {showResults && (
        <div
          className="absolute left-0 right-0 top-full z-50 mt-1 max-h-64 overflow-y-auto rounded-xl border shadow-xl"
          style={{
            background: "var(--bg-card-solid)",
            borderColor: "var(--border-input)",
          }}
        >
          {results.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm" style={{ color: "var(--text-muted)" }}>
              검색 결과가 없습니다
            </div>
          ) : (
            results.map((r) => {
              const completed = completedDays.includes(r.day);
              return (
                <Link
                  key={r.day}
                  href={`/days/${r.day}`}
                  className="flex items-center gap-3 border-b px-4 py-3 transition-colors last:border-0 hover:bg-amber-50/50 dark:hover:bg-amber-900/10"
                  style={{ borderColor: "var(--border-color)" }}
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      completed
                        ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                    }`}
                  >
                    {r.day}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                      {r.weekday}. {r.day}일차{" "}
                      <span style={{ color: "var(--text-muted)" }}>·</span>{" "}
                      <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                        {r.testament}
                      </span>
                    </p>
                    <p className="truncate text-xs" style={{ color: "var(--text-muted)" }}>
                      {r.bibleRange}
                    </p>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
