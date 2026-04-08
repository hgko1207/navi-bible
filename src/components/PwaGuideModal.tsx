"use client";

import { useEffect, useState } from "react";

type DeviceType = "ios" | "android" | "unknown";

function detectDevice(): DeviceType {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return "ios";
  if (/android/.test(ua)) return "android";
  return "unknown";
}

interface PwaGuideModalProps {
  onClose: () => void;
}

const iosSteps = [
  { step: 1, title: "Safari로 접속", desc: "이 사이트를 Safari 브라우저에서 열어주세요." },
  { step: 2, title: "공유 버튼 탭", desc: "하단의 공유 버튼 (네모에서 화살표가 나오는 아이콘)을 탭하세요." },
  { step: 3, title: "홈 화면에 추가", desc: "메뉴에서 \"홈 화면에 추가\"를 찾아서 탭하세요." },
  { step: 4, title: "추가 완료", desc: "\"추가\"를 탭하면 홈화면에 앱 아이콘이 생성됩니다." },
];

const androidSteps = [
  { step: 1, title: "Chrome으로 접속", desc: "이 사이트를 Chrome 브라우저에서 열어주세요." },
  { step: 2, title: "메뉴 열기", desc: "우측 상단의 점 3개 메뉴(...)를 탭하세요." },
  { step: 3, title: "홈 화면에 추가", desc: "메뉴에서 \"홈 화면에 추가\" 또는 \"앱 설치\"를 탭하세요." },
  { step: 4, title: "설치 완료", desc: "\"설치\"를 탭하면 홈화면에 앱 아이콘이 생성됩니다." },
];

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 text-blue-500" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15m0-3l-3-3m0 0l-3 3m3-3v11.25" />
    </svg>
  );
}

function DotsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 text-green-500" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 text-emerald-500" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function getStepIcon(step: number, device: "ios" | "android") {
  if (step === 1) return <PhoneIcon />;
  if (step === 2) return device === "ios" ? <ShareIcon /> : <DotsIcon />;
  if (step === 3) return <PhoneIcon />;
  return <CheckCircleIcon />;
}

export default function PwaGuideModal({ onClose }: PwaGuideModalProps) {
  const [activeTab, setActiveTab] = useState<"ios" | "android">(() => {
    const device = detectDevice();
    return device === "android" ? "android" : "ios";
  });

  // Prevent background scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const steps = activeTab === "ios" ? iosSteps : androidSteps;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative mx-auto w-full max-w-lg animate-[scaleIn_0.2s_ease-out] overflow-hidden rounded-t-3xl sm:rounded-3xl"
        style={{ background: "var(--bg-card-solid)", maxHeight: "85dvh" }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b px-5 py-4" style={{ borderColor: "var(--border-color)", background: "var(--bg-card-solid)" }}>
          <h3 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
            홈화면에 추가하기
          </h3>
          <button
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-full transition-all active:scale-90"
            style={{ background: "var(--badge-bg)" }}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} style={{ color: "var(--text-tertiary)" }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Device tabs */}
        <div className="flex gap-2 px-5 pt-4">
          <button
            onClick={() => setActiveTab("ios")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all ${
              activeTab === "ios"
                ? "bg-gradient-to-r from-stone-800 to-stone-900 text-white shadow-md dark:from-stone-200 dark:to-stone-300 dark:text-stone-900"
                : ""
            }`}
            style={activeTab !== "ios" ? { background: "var(--badge-bg)", color: "var(--text-tertiary)" } : undefined}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
            </svg>
            iPhone
          </button>
          <button
            onClick={() => setActiveTab("android")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all ${
              activeTab === "android"
                ? "bg-gradient-to-r from-green-600 to-green-700 text-white shadow-md dark:from-green-700 dark:to-green-800"
                : ""
            }`}
            style={activeTab !== "android" ? { background: "var(--badge-bg)", color: "var(--text-tertiary)" } : undefined}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
              <path d="M17.6 9.48l1.84-3.18c.16-.31.04-.69-.27-.86-.31-.16-.69-.04-.86.27l-1.86 3.22c-1.44-.66-3.06-1.03-4.89-1.03-1.83 0-3.45.37-4.89 1.03L4.73 5.71c-.16-.31-.54-.43-.86-.27-.31.16-.43.54-.27.86L5.44 9.48C1.98 11.43 0 14.55 0 18h24c0-3.45-1.98-6.57-5.4-8.52zM7 15.25a1.25 1.25 0 110-2.5 1.25 1.25 0 010 2.5zm10 0a1.25 1.25 0 110-2.5 1.25 1.25 0 010 2.5z" />
            </svg>
            Galaxy
          </button>
        </div>

        {/* Steps */}
        <div className="overflow-y-auto px-5 pb-8 pt-4" style={{ maxHeight: "calc(85dvh - 140px)" }}>
          <div className="space-y-3">
            {steps.map((s) => (
              <div
                key={s.step}
                className="flex items-start gap-4 rounded-xl p-4"
                style={{ background: "var(--badge-bg)" }}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: "var(--bg-card-solid)" }}>
                  {getStepIcon(s.step, activeTab)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[11px] font-bold text-white">
                      {s.step}
                    </span>
                    <h4 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                      {s.title}
                    </h4>
                  </div>
                  <p className="mt-1 text-[13px] leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
                    {s.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
