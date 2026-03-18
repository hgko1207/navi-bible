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
        className={`flex items-center gap-4 rounded-2xl bg-white px-5 py-5 shadow-sm transition-all duration-200 active:scale-[0.98] ${
          completed
            ? "border border-emerald-200/80 shadow-emerald-100/40"
            : "border border-stone-100 hover:shadow-md hover:shadow-amber-100/30"
        }`}
      >
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-[15px] font-bold transition-all ${
            completed
              ? "bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-md shadow-emerald-200/50"
              : "bg-gradient-to-br from-amber-50 to-amber-100 text-amber-700"
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
            <span className="text-[15px] font-bold text-stone-800">
              {reading.day}일차
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                reading.testament === "구약"
                  ? "bg-amber-50 text-amber-600"
                  : "bg-blue-50 text-blue-600"
              }`}
            >
              {reading.testament}
            </span>
          </div>
          <p className="mt-1.5 truncate text-[13px] text-stone-400">
            {reading.bibleRange}
          </p>
        </div>
        <svg
          className={`h-5 w-5 shrink-0 transition-colors ${completed ? "text-emerald-300" : "text-stone-300"}`}
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
