"use client";

import { useMemo } from "react";
import { readings } from "@/data/readings";
import { useProgress } from "@/hooks/useProgress";
import DayCard from "@/components/DayCard";
import SearchBar from "@/components/SearchBar";

export default function DaysListPage() {
  const { isCompleted, progress } = useProgress();

  const oldTestament = useMemo(() => readings.filter((r) => r.testament === "구약"), []);
  const newTestament = useMemo(() => readings.filter((r) => r.testament === "신약"), []);
  const completedCount = progress.completedDays.length;
  const percent = readings.length > 0 ? Math.round((completedCount / readings.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* 검색 */}
      <SearchBar readings={readings} completedDays={progress.completedDays} />

      {/* 진도 요약 카드 */}
      <div className="relative overflow-hidden rounded-2xl border border-amber-100 p-5 shadow-sm dark:border-amber-800/30" style={{ background: "var(--bg-card-solid)" }}>
        <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br from-amber-100/40 to-transparent dark:from-amber-500/10" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-md shadow-amber-200/40 dark:shadow-amber-900/40">
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
            </div>
            <div>
              <p className="text-[12px] font-semibold" style={{ color: "var(--text-muted)" }}>전체 진도</p>
              <p className="text-xl font-extrabold" style={{ color: "var(--text-primary)" }}>{percent}%</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="h-3 w-28 overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800">
              <div
                className="h-full w-full origin-left bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 transition-transform duration-700"
                style={{ transform: `scaleX(${percent / 100})` }}
              />
            </div>
            <span className="text-[13px] font-bold text-amber-600 dark:text-amber-400">
              {completedCount}/{readings.length}
            </span>
          </div>
        </div>
      </div>

      {/* 구약 섹션 */}
      <section>
        <div className="mb-4 flex items-center gap-2.5">
          <div className="h-7 w-1.5 rounded-full bg-gradient-to-b from-amber-400 to-amber-600" />
          <h2 className="text-[16px] font-bold" style={{ color: "var(--text-primary)" }}>구약</h2>
          <span className="rounded-full px-2.5 py-1 text-[11px] font-bold text-amber-600 dark:text-amber-400" style={{ background: "var(--amber-soft-bg)" }}>
            {oldTestament.filter((r) => progress.completedDays.includes(r.day)).length}/{oldTestament.length}
          </span>
        </div>
        <div className="space-y-4 px-1">
          {oldTestament.map((reading) => (
            <DayCard
              key={reading.day}
              reading={reading}
              completed={isCompleted(reading.day)}
            />
          ))}
        </div>
      </section>

      {/* 신약 섹션 */}
      {newTestament.length > 0 && (
        <section>
          <div className="mb-4 flex items-center gap-2.5">
            <div className="h-7 w-1.5 rounded-full bg-gradient-to-b from-blue-400 to-blue-600" />
            <h2 className="text-[16px] font-bold" style={{ color: "var(--text-primary)" }}>신약</h2>
            <span className="rounded-full px-2.5 py-1 text-[11px] font-bold text-blue-600 dark:text-blue-400" style={{ background: "var(--blue-soft-bg)" }}>
              {newTestament.filter((r) => progress.completedDays.includes(r.day)).length}/{newTestament.length}
            </span>
          </div>
          <div className="space-y-4 px-1">
            {newTestament.map((reading) => (
              <DayCard
                key={reading.day}
                reading={reading}
                completed={isCompleted(reading.day)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
