"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface NextDayToastProps {
  nextDay: string;
  onDismiss: () => void;
}

export default function NextDayToast({ nextDay, onDismiss }: NextDayToastProps) {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [countdown, setCountdown] = useState(8);

  useEffect(() => {
    // Animate in
    requestAnimationFrame(() => setVisible(true));

    // Auto-dismiss after countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleDismiss();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(onDismiss, 200);
  };

  const handleGoNext = () => {
    setVisible(false);
    setTimeout(() => {
      onDismiss();
      router.push(`/days/${nextDay}`);
    }, 200);
  };

  return (
    <div
      className={`fixed bottom-20 left-4 right-4 z-[90] mx-auto max-w-lg transition-all duration-300 ${
        visible
          ? "translate-y-0 opacity-100"
          : "translate-y-4 opacity-0"
      }`}
    >
      <div
        className="flex items-center gap-3 rounded-2xl p-4 shadow-2xl backdrop-blur-xl"
        style={{
          background: "var(--bg-card-solid)",
          border: "1px solid var(--border-color)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
        }}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-md shadow-emerald-200/40 dark:shadow-emerald-900/40">
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="currentColor">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
            완료! 다음으로 이동할까요?
          </p>
          <p className="text-[12px]" style={{ color: "var(--text-muted)" }}>
            {countdown}초 후 자동으로 닫힙니다
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDismiss}
            className="rounded-lg px-3 py-2 text-xs font-semibold transition-all active:scale-95"
            style={{ color: "var(--text-muted)" }}
          >
            닫기
          </button>
          <button
            onClick={handleGoNext}
            className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-amber-200/30 transition-all active:scale-95 dark:shadow-amber-900/30"
          >
            {nextDay}일차
            <svg viewBox="0 0 24 24" className="ml-1 inline-block h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
