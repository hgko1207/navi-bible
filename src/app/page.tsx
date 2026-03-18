"use client";

import { useCallback } from "react";
import Link from "next/link";
import { readings } from "@/data/readings";
import { useProgress } from "@/hooks/useProgress";
import { markDayComplete, syncRoundProgress } from "@/lib/storage";
import YouTubePlayer from "@/components/YouTubePlayer";
import KeyPoints from "@/components/KeyPoints";
import CheckButton from "@/components/CheckButton";
import TTSPlayer from "@/components/TTSPlayer";

function getNextReading(completedDays: number[]) {
  const unread = readings.find((r) => !completedDays.includes(r.day));
  return unread ?? readings[readings.length - 1];
}

export default function HomePage() {
  const { isCompleted, toggle, progress } = useProgress();
  const reading = getNextReading(progress.completedDays);
  const completedCount = progress.completedDays.length;
  const totalDays = readings.length;
  const prevDay = readings.find((r) => r.day === reading.day - 1);
  const nextDay = readings.find((r) => r.day === reading.day + 1);

  const handleAutoComplete = useCallback(() => {
    if (!isCompleted(reading.day)) {
      markDayComplete(reading.day);
      syncRoundProgress();
      window.dispatchEvent(new Event("storage"));
    }
  }, [reading.day, isCompleted]);

  return (
    <div className="space-y-5">
      {/* 오늘의 말씀 히어로 카드 */}
      <div className="relative overflow-hidden rounded-[28px] p-[1px]">
        <div className="absolute inset-0 rounded-[28px] bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500" />
        <div className="relative overflow-hidden rounded-[27px] bg-gradient-to-br from-amber-600 via-amber-700 to-orange-800 p-6">
          {/* 장식 요소 */}
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-gradient-to-br from-white/10 to-transparent" />
          <div className="absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-gradient-to-tr from-orange-900/30 to-transparent" />
          <div className="absolute right-6 top-6 h-20 w-20 rounded-full border border-white/10" />

          <div className="relative">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 backdrop-blur-sm">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
              <span className="text-[11px] font-semibold tracking-wide text-white/90">
                이어서 읽기
              </span>
            </div>

            <h2 className="mt-4 text-[32px] font-extrabold leading-none tracking-tight text-white">
              {reading.day}일차
            </h2>
            <p className="mt-1 text-lg font-medium text-white/80">
              {reading.weekday}요일 · {reading.bibleRange}
            </p>

            <div className="mt-5 flex items-center gap-3">
              <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-white/80 backdrop-blur-sm">
                {reading.testament}
              </span>
              <div className="flex items-center gap-1.5">
                <div className="h-1 flex-1 w-16 rounded-full bg-white/20">
                  <div
                    className="h-full rounded-full bg-white/70 transition-all duration-700"
                    style={{ width: `${totalDays > 0 ? (completedCount / totalDays) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-[11px] font-medium text-white/60">
                  {completedCount}/{totalDays}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 유튜브 플레이어 */}
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

      {/* 이전/다음 일차 네비게이션 */}
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
