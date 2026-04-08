"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { readings } from "@/data/readings";
import { useProgress } from "@/hooks/useProgress";
import {
  getReadingHistory,
  completeCurrentRound,
  syncRoundProgress,
  markDaysCompleteUpTo,
} from "@/lib/storage";
import { ReadingHistory } from "@/lib/types";
import ProgressBar from "@/components/ProgressBar";
import ReadingHistoryCard from "@/components/ReadingHistoryCard";

// 완료된 일차를 readings 순서 기준으로 연속 구간 묶기
function groupCompletedDays(
  completedDays: string[]
): { label: string }[] {
  const sorted = completedDays
    .map((day) => ({ day, idx: readings.findIndex((r) => r.day === day) }))
    .filter(({ idx }) => idx !== -1)
    .sort((a, b) => a.idx - b.idx);

  const groups: { start: string; end: string; startIdx: number; endIdx: number }[] = [];
  for (const { day, idx } of sorted) {
    const last = groups[groups.length - 1];
    if (last && idx === last.endIdx + 1) {
      last.end = day;
      last.endIdx = idx;
    } else {
      groups.push({ start: day, end: day, startIdx: idx, endIdx: idx });
    }
  }

  return groups.map(({ start, end }) => ({
    label: start === end ? `${start}일차` : `${start}~${end}일차`,
  }));
}

export default function ProgressPage() {
  const router = useRouter();
  const { progress } = useProgress();
  const [history, setHistory] = useState<ReadingHistory | null>(null);
  const [bulkDay, setBulkDay] = useState("");
  const [bulkDone, setBulkDone] = useState(false);
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);

  useEffect(() => {
    syncRoundProgress();
    setHistory(getReadingHistory());
  }, [progress.completedDays.length]);

  const allDayIds = useMemo(() => readings.map((r) => r.day), []);
  const totalDays = readings.length;
  const completedCount = progress.completedDays.length;

  const handleBulkComplete = () => {
    const trimmed = bulkDay.trim();
    if (!trimmed || !allDayIds.includes(trimmed)) return;
    markDaysCompleteUpTo(trimmed, allDayIds);
    syncRoundProgress();
    window.dispatchEvent(new Event("storage-update"));
    setBulkDone(true);
    setTimeout(() => setBulkDone(false), 2000);
    setBulkDay("");
  };

  const oldTestament = useMemo(() => readings.filter((r) => r.testament === "구약"), []);
  const newTestament = useMemo(() => readings.filter((r) => r.testament === "신약"), []);

  const completedOT = oldTestament.filter((r) =>
    progress.completedDays.includes(r.day)
  ).length;
  const completedNT = newTestament.filter((r) =>
    progress.completedDays.includes(r.day)
  ).length;

  const percent =
    totalDays > 0 ? Math.round((completedCount / totalDays) * 100) : 0;

  const handleCompleteRound = () => {
    setShowCompleteConfirm(true);
  };

  const handleConfirmComplete = () => {
    const updated = completeCurrentRound(allDayIds);
    setHistory(updated);
    setShowCompleteConfirm(false);
    router.refresh();
  };

  const dayGroups = useMemo(() => groupCompletedDays(progress.completedDays), [progress.completedDays]);

  return (
    <div className="space-y-5">
      {/* 전체 진도 히어로 카드 */}
      <div className="relative overflow-hidden rounded-[28px] p-[1px]">
        <div className="absolute inset-0 rounded-[28px] bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500" />
        <div className="relative overflow-hidden rounded-[27px] bg-gradient-to-br from-amber-500 via-amber-600 to-orange-700 p-6 text-white">
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-gradient-to-br from-white/10 to-transparent" />
          <div className="absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-gradient-to-tr from-orange-900/30 to-transparent" />
          <div className="absolute right-8 top-8 h-16 w-16 rounded-full border border-white/10" />

          <div className="relative">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-100/80">
              {history ? `${history.currentRound}독 진행률` : "1독 진행률"}
            </p>
            <div className="mt-3 flex items-end gap-1">
              <span className="text-[56px] font-extrabold leading-none tracking-tight">
                {percent}
              </span>
              <span className="mb-2 text-2xl font-semibold text-amber-100">%</span>
            </div>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/20 backdrop-blur-sm">
              <div
                className="h-full w-full origin-left bg-white transition-transform duration-700 ease-out"
                style={{ transform: `scaleX(${percent / 100})` }}
              />
            </div>
            <p className="mt-2.5 text-[13px] font-medium text-amber-100/90">
              {completedCount} / {totalDays}일 완료
            </p>
          </div>
        </div>
      </div>

      {/* 구약/신약 상세 */}
      <div className="card-glass space-y-4 rounded-2xl p-5">
        <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-stone-400 dark:text-stone-500">
          상세 진도
        </h3>
        <ProgressBar
          current={completedOT}
          total={oldTestament.length}
          label="구약"
          color="amber"
        />
        {newTestament.length > 0 && (
          <ProgressBar
            current={completedNT}
            total={newTestament.length}
            label="신약"
            color="blue"
          />
        )}
      </div>

      {/* 현재 진도 설정 */}
      <div className="card-glass rounded-2xl p-5">
        <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.15em] text-stone-400 dark:text-stone-500">
          현재 진도 설정
        </h3>
        <p className="mb-3 text-[13px]" style={{ color: "var(--text-tertiary)" }}>
          입력한 일차까지 모두 완료 처리합니다. (예: 48, 52A)
        </p>
        <div className="flex gap-2">
          <input
            id="bulk-day-input"
            type="text"
            placeholder={`1 ~ ${allDayIds[allDayIds.length - 1]}`}
            value={bulkDay}
            onChange={(e) => setBulkDay(e.target.value)}
            className="h-11 w-full flex-1 rounded-xl border px-4 text-[15px] font-medium outline-none transition-all focus:border-amber-400 focus:ring-2 focus:ring-amber-100/50 dark:focus:ring-amber-900/50"
            style={{ borderColor: "var(--border-input)", background: "var(--bg-input)", color: "var(--text-primary)" }}
          />
          <button
            onClick={handleBulkComplete}
            disabled={!bulkDay.trim() || !allDayIds.includes(bulkDay.trim())}
            className="h-11 shrink-0 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-5 text-sm font-bold text-white shadow-md shadow-amber-200/30 transition-all hover:shadow-lg active:scale-[0.97] disabled:opacity-40 disabled:shadow-none"
          >
            {bulkDone ? "완료!" : "적용"}
          </button>
        </div>
      </div>

      {/* 완료된 일차 */}
      <div className="card-glass rounded-2xl p-5">
        <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.15em] text-stone-400 dark:text-stone-500">
          완료한 말씀
        </h3>
        {completedCount === 0 ? (
          <div className="py-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-stone-50/80">
              <svg viewBox="0 0 24 24" className="h-8 w-8 text-stone-300" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <p className="mt-3 text-sm font-medium" style={{ color: "var(--text-tertiary)" }}>
              아직 완료한 말씀이 없습니다
            </p>
            <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
              오늘의 말씀부터 시작해보세요!
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {dayGroups.map((group) => (
              <span
                key={group.label}
                className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400"
                style={{ background: "var(--emerald-soft-bg)" }}
              >
                <svg viewBox="0 0 24 24" className="h-3 w-3" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
                {group.label}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 독서 기록 (1독/2독/3독) */}
      {history && (
        <ReadingHistoryCard rounds={history.rounds} totalDays={totalDays} />
      )}

      {/* 완독 처리 버튼 — 100% 달성 시에만 표시 */}
      {completedCount >= totalDays && totalDays > 0 && (
        <button
          onClick={handleCompleteRound}
          className="w-full rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 py-4 text-sm font-bold text-white shadow-lg shadow-amber-200/40 transition-all hover:shadow-xl active:scale-[0.98]"
        >
          완독! 다음 독서 시작하기
        </button>
      )}

      {/* 완독 확인 모달 */}
      {showCompleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowCompleteConfirm(false)}
          />
          <div
            className="relative mx-auto w-full max-w-lg rounded-t-3xl p-6 sm:rounded-3xl"
            style={{ background: "var(--bg-card-solid)" }}
          >
            <div className="mb-5 flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-md shadow-amber-200/40 dark:shadow-amber-900/40">
                <svg viewBox="0 0 24 24" className="h-6 w-6 text-white" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>
                  {history?.currentRound ?? 1}독 완독을 완료할까요?
                </h3>
                <p className="mt-1 text-[13px] leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
                  완독 기록이 저장되고 진도가 초기화됩니다. 이전 기록은 독서 기록에서 확인할 수 있습니다.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCompleteConfirm(false)}
                className="flex h-12 flex-1 items-center justify-center rounded-2xl text-sm font-semibold transition-all active:scale-[0.97]"
                style={{ background: "var(--badge-bg)", color: "var(--text-secondary)" }}
              >
                취소
              </button>
              <button
                onClick={handleConfirmComplete}
                className="flex h-12 flex-1 items-center justify-center rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-sm font-bold text-white shadow-md shadow-amber-200/30 transition-all active:scale-[0.97] dark:shadow-amber-900/30"
              >
                새 독서 시작
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
