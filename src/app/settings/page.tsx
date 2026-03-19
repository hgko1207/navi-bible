"use client";

import { useEffect, useState } from "react";
import { useSettings } from "@/hooks/useSettings";
import { ThemeMode, FontSize } from "@/lib/types";
import PwaGuideModal from "@/components/PwaGuideModal";

const themeOptions: { value: ThemeMode; label: string; icon: string }[] = [
  { value: "light", label: "라이트", icon: "sun" },
  { value: "dark", label: "다크", icon: "moon" },
  { value: "system", label: "시스템", icon: "auto" },
];

const fontSizeOptions: { value: FontSize; label: string; sample: string }[] = [
  { value: "small", label: "작게", sample: "가" },
  { value: "medium", label: "보통", sample: "가" },
  { value: "large", label: "크게", sample: "가" },
  { value: "xlarge", label: "매우 크게", sample: "가" },
];

const fontSizePx: Record<FontSize, number> = {
  small: 14,
  medium: 16,
  large: 18,
  xlarge: 20,
};

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
    </svg>
  );
}

function AutoIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25A2.25 2.25 0 015.25 3h13.5A2.25 2.25 0 0121 5.25z" />
    </svg>
  );
}

const themeIcons = { sun: SunIcon, moon: MoonIcon, auto: AutoIcon };

export default function SettingsPage() {
  const { settings, setTheme, setFontSize } = useSettings();
  const [showPwaGuide, setShowPwaGuide] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="space-y-5">
        <div className="relative overflow-hidden rounded-[28px] p-[1px]">
          <div className="absolute inset-0 rounded-[28px] bg-gradient-to-br from-stone-400 via-stone-600 to-stone-800" />
          <div className="relative overflow-hidden rounded-[27px] bg-gradient-to-br from-stone-600 via-stone-700 to-stone-800 p-6">
            <div className="relative">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-300">설정</p>
              <h2 className="mt-2 text-[28px] font-extrabold leading-none tracking-tight text-white">사용자 설정</h2>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* 헤더 */}
      <div className="relative overflow-hidden rounded-[28px] p-[1px]">
        <div className="absolute inset-0 rounded-[28px] bg-gradient-to-br from-stone-400 via-stone-600 to-stone-800" />
        <div className="relative overflow-hidden rounded-[27px] bg-gradient-to-br from-stone-600 via-stone-700 to-stone-800 p-6">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br from-white/8 to-transparent" />
          <div className="relative">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-300">
              설정
            </p>
            <h2 className="mt-2 text-[28px] font-extrabold leading-none tracking-tight text-white">
              사용자 설정
            </h2>
          </div>
        </div>
      </div>

      {/* 테마 설정 */}
      <div className="card-glass rounded-2xl p-5">
        <h3 className="mb-1 text-[11px] font-bold uppercase tracking-[0.15em]" style={{ color: "var(--text-muted)" }}>
          화면 테마
        </h3>
        <p className="mb-4 text-[13px]" style={{ color: "var(--text-tertiary)" }}>
          다크모드로 눈의 피로를 줄여보세요
        </p>
        <div className="grid grid-cols-3 gap-2">
          {themeOptions.map((opt) => {
            const Icon = themeIcons[opt.icon as keyof typeof themeIcons];
            const isSelected = settings.theme === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setTheme(opt.value)}
                className={`flex flex-col items-center gap-2 rounded-xl py-3.5 text-sm font-semibold transition-all active:scale-[0.97] ${
                  isSelected
                    ? "bg-amber-500 text-white shadow-lg shadow-amber-200/30 dark:shadow-amber-900/30"
                    : "text-stone-500 dark:text-stone-400"
                }`}
                style={{ background: isSelected ? undefined : "var(--badge-bg)" }}
              >
                <Icon />
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 글꼴 크기 */}
      <div className="card-glass rounded-2xl p-5">
        <h3 className="mb-1 text-[11px] font-bold uppercase tracking-[0.15em]" style={{ color: "var(--text-muted)" }}>
          글꼴 크기
        </h3>
        <p className="mb-4 text-[13px]" style={{ color: "var(--text-tertiary)" }}>
          읽기 편한 크기를 선택하세요
        </p>
        <div className="grid grid-cols-4 gap-2">
          {fontSizeOptions.map((opt) => {
            const isSelected = settings.fontSize === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setFontSize(opt.value)}
                className={`flex flex-col items-center gap-1.5 rounded-xl py-3 transition-all active:scale-[0.97] ${
                  isSelected
                    ? "bg-amber-500 text-white shadow-lg shadow-amber-200/30 dark:shadow-amber-900/30"
                    : "text-stone-500 dark:text-stone-400"
                }`}
                style={{ background: isSelected ? undefined : "var(--badge-bg)" }}
              >
                <span style={{ fontSize: `${fontSizePx[opt.value]}px`, fontWeight: 700 }}>
                  {opt.sample}
                </span>
                <span className="text-[10px] font-medium">{opt.label}</span>
              </button>
            );
          })}
        </div>
        {/* 미리보기 */}
        <div className="mt-4 rounded-xl p-4" style={{ background: "var(--badge-bg)" }}>
          <p className="content-text" style={{ color: "var(--text-secondary)" }}>
            성경은 처음부터 하나님의 창조를 선포하며 시작합니다. 하나님은 6일 동안 천지만물을 창조하셨습니다.
          </p>
        </div>
      </div>

      {/* 앱처럼 사용하기 */}
      <div className="card-glass rounded-2xl p-5">
        <h3 className="mb-1 text-[11px] font-bold uppercase tracking-[0.15em]" style={{ color: "var(--text-muted)" }}>
          앱처럼 사용하기
        </h3>
        <p className="mb-4 text-[13px]" style={{ color: "var(--text-tertiary)" }}>
          홈화면에 추가하면 앱처럼 사용할 수 있어요
        </p>
        <button
          onClick={() => setShowPwaGuide(true)}
          className="flex w-full items-center gap-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-3.5 text-left text-white shadow-md shadow-amber-200/30 transition-all active:scale-[0.98] dark:shadow-amber-900/30"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold">홈화면에 추가하는 방법</p>
            <p className="text-[12px] text-white/70">iPhone, Galaxy 기기별 가이드 보기</p>
          </div>
          <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-white/60" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>

      {/* PWA 가이드 모달 */}
      {showPwaGuide && (
        <PwaGuideModal onClose={() => setShowPwaGuide(false)} />
      )}
    </div>
  );
}
