"use client";

import { ReadingRound } from "@/lib/types";

interface ReadingHistoryCardProps {
  rounds: ReadingRound[];
  totalDays: number;
}

export default function ReadingHistoryCard({
  rounds,
  totalDays,
}: ReadingHistoryCardProps) {
  if (rounds.length === 0) return null;

  return (
    <div className="card-glass rounded-2xl p-5">
      <h3 className="mb-4 text-[11px] font-bold uppercase tracking-[0.15em] text-stone-400">
        독서 기록
      </h3>
      <div className="space-y-3">
        {rounds.map((round) => {
          const isComplete = round.endDate !== null;
          const progress =
            totalDays > 0
              ? Math.round((round.completedDays.length / totalDays) * 100)
              : 0;

          return (
            <div
              key={round.round}
              className={`rounded-xl border p-3.5 ${
                isComplete
                  ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-800/50 dark:bg-emerald-900/20"
                  : "border-amber-200 bg-amber-50/30 dark:border-amber-800/50 dark:bg-amber-900/20"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                      isComplete
                        ? "bg-emerald-500 text-white"
                        : "bg-amber-500 text-white"
                    }`}
                  >
                    {round.round}
                  </span>
                  <span className="text-sm font-semibold text-stone-700 dark:text-stone-300">
                    {round.round}독
                  </span>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                    isComplete
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
                  }`}
                >
                  {isComplete ? "완독" : `진행중 ${progress}%`}
                </span>
              </div>
              <div className="mt-2 text-xs text-stone-400 dark:text-stone-500">
                {round.startDate}
                {isComplete ? ` ~ ${round.endDate}` : " ~ 진행중"}
              </div>
              {!isComplete && (
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-amber-100">
                  <div
                    className="h-full rounded-full bg-amber-500 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
