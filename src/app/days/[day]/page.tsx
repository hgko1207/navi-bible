"use client";

import { useCallback, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { readings, getReadingByDay } from "@/data/readings";
import { useProgress } from "@/hooks/useProgress";
import { markDayComplete, markDaysCompleteUpTo, syncRoundProgress } from "@/lib/storage";
import YouTubePlayer from "@/components/YouTubePlayer";
import KeyPoints from "@/components/KeyPoints";
import CheckButton from "@/components/CheckButton";
import TTSPlayer from "@/components/TTSPlayer";

export default function DayDetailPage() {
  const params = useParams<{ day: string }>();
  const dayNum = Number(params.day);
  const { isCompleted, toggle } = useProgress();

  const reading = getReadingByDay(dayNum);
  const [bulkDone, setBulkDone] = useState(false);

  const handleBulkComplete = useCallback(() => {
    if (reading && dayNum > 1) {
      markDaysCompleteUpTo(dayNum);
      syncRoundProgress();
      window.dispatchEvent(new Event("storage"));
      setBulkDone(true);
      setTimeout(() => setBulkDone(false), 2000);
    }
  }, [reading, dayNum]);

  const handleAutoComplete = useCallback(() => {
    if (reading && !isCompleted(reading.day)) {
      markDayComplete(reading.day);
      syncRoundProgress();
      window.dispatchEvent(new Event("storage"));
    }
  }, [reading, isCompleted]);

  if (!reading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-stone-50">
          <svg viewBox="0 0 24 24" className="h-10 w-10 text-stone-300" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <p className="mt-4 text-lg font-semibold text-stone-700">
          해당 일차를 찾을 수 없습니다
        </p>
        <Link
          href="/days"
          className="mt-4 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-200/40 transition-all hover:shadow-xl active:scale-95"
        >
          목록으로 돌아가기
        </Link>
      </div>
    );
  }

  const prevDay = readings.find((r) => r.day === dayNum - 1);
  const nextDay = readings.find((r) => r.day === dayNum + 1);

  return (
    <div className="space-y-5">
      {/* 상단 정보 히어로 */}
      <div className="relative overflow-hidden rounded-[28px] p-[1px]">
        <div className="absolute inset-0 rounded-[28px] bg-gradient-to-br from-stone-500 via-stone-700 to-stone-900" />
        <div className="relative overflow-hidden rounded-[27px] bg-gradient-to-br from-stone-700 via-stone-800 to-stone-900 p-6">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br from-white/8 to-transparent" />
          <div className="absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-gradient-to-tr from-amber-500/10 to-transparent" />
          <div className="absolute right-6 top-6 h-16 w-16 rounded-full border border-white/5" />

          <div className="relative">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold backdrop-blur-sm ${
                reading.testament === "구약"
                  ? "bg-amber-500/20 text-amber-300"
                  : "bg-blue-500/20 text-blue-300"
              }`}
            >
              <div className={`h-1.5 w-1.5 rounded-full ${reading.testament === "구약" ? "bg-amber-400" : "bg-blue-400"}`} />
              {reading.testament}
            </span>
            <h2 className="mt-3 text-[32px] font-extrabold leading-none tracking-tight text-white">
              {reading.day}일차
            </h2>
            <p className="mt-1.5 text-lg font-medium text-white/70">
              {reading.weekday}요일 · {reading.bibleRange}
            </p>
          </div>
        </div>
      </div>

      {/* 유튜브 */}
      <section className="card-glass rounded-2xl p-4">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-red-500/10">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-red-500" fill="currentColor">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          </div>
          <span className="text-[12px] font-semibold text-stone-500">개역개정 음원</span>
        </div>
        <YouTubePlayer
          videoId={reading.youtubeId}
          day={reading.day}
          onComplete={handleAutoComplete}
        />
      </section>

      {/* 핵심 포인트 */}
      <section>
        <KeyPoints points={reading.keyPoints} />
      </section>

      {/* 요약 본문 */}
      <section className="card-glass overflow-hidden rounded-2xl">
        <div className="flex items-center justify-between border-b border-stone-100/80 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-500/10">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-amber-600" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <span className="text-[12px] font-semibold text-stone-500">오늘의 요약</span>
          </div>
          <TTSPlayer text={reading.content} />
        </div>
        <div className="px-5 py-4">
          <div className="space-y-5 text-[16px] leading-[1.9] text-stone-600">
            {reading.content.split("\n\n").map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
          <div className="mt-5 flex items-center gap-2 rounded-xl bg-amber-50/60 px-3.5 py-2.5">
            <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-amber-400" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
            <span className="text-xs text-amber-600/80">{reading.reference} 참고</span>
          </div>
        </div>
      </section>

      {/* 완료 체크 */}
      <CheckButton
        checked={isCompleted(reading.day)}
        onToggle={() => toggle(reading.day)}
      />

      {/* 여기까지 모두 완료 */}
      {dayNum > 1 && (
        <button
          onClick={handleBulkComplete}
          className="w-full rounded-2xl border border-stone-200 bg-white py-3.5 text-sm font-semibold text-stone-500 shadow-sm transition-all hover:border-amber-300 hover:text-amber-600 active:scale-[0.98]"
        >
          {bulkDone ? "완료되었습니다!" : `1일차 ~ ${dayNum}일차 모두 완료`}
        </button>
      )}

      {/* 이전/다음 네비게이션 */}
      <div className="flex gap-3">
        {prevDay ? (
          <Link
            href={`/days/${prevDay.day}`}
            className="card-glass flex flex-1 items-center justify-center gap-1.5 rounded-2xl py-3.5 text-sm font-medium text-stone-600 shadow-sm transition-all hover:border-amber-300/60 hover:shadow-md active:scale-[0.98]"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            {prevDay.day}일차
          </Link>
        ) : (
          <div className="flex-1" />
        )}
        {nextDay ? (
          <Link
            href={`/days/${nextDay.day}`}
            className="card-glass flex flex-1 items-center justify-center gap-1.5 rounded-2xl py-3.5 text-sm font-medium text-stone-600 shadow-sm transition-all hover:border-amber-300/60 hover:shadow-md active:scale-[0.98]"
          >
            {nextDay.day}일차
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ) : (
          <div className="flex-1" />
        )}
      </div>
    </div>
  );
}
