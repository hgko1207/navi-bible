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
        className={`card-glass flex items-center gap-3.5 rounded-2xl px-4 py-3.5 transition-all duration-200 active:scale-[0.98] ${
          completed
            ? "border-emerald-200/60 bg-gradient-to-r from-emerald-50/80 to-white/70"
            : "hover:border-amber-200/60 hover:shadow-md hover:shadow-amber-100/20"
        }`}
      >
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold transition-all ${
            completed
              ? "bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-200/50"
              : "bg-gradient-to-br from-amber-100 to-amber-50 text-amber-700"
          }`}
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
            <span className="text-[13px] font-semibold text-stone-800">
              {reading.weekday}. {reading.day}일차
            </span>
            <span
              className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                reading.testament === "구약"
                  ? "bg-amber-100/80 text-amber-600"
                  : "bg-blue-100/80 text-blue-600"
              }`}
            >
              {reading.testament}
            </span>
          </div>
          <p className="mt-0.5 truncate text-[12px] text-stone-400">
            {reading.bibleRange}
          </p>
        </div>
        <svg
          className={`h-4 w-4 shrink-0 transition-colors ${completed ? "text-emerald-300" : "text-stone-300"}`}
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
