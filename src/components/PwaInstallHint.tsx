"use client";

import { useEffect, useState } from "react";
import { getSettings, dismissPwaGuide } from "@/lib/storage";
import PwaGuideModal from "./PwaGuideModal";

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in window.navigator && (window.navigator as Navigator & { standalone?: boolean }).standalone === true)
  );
}

export default function PwaInstallHint() {
  const [show, setShow] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Don't show if already installed as PWA
    if (isStandalone()) return;

    const settings = getSettings();
    if (settings.pwaGuideDismissed) return;

    // Show after a small delay on first visit
    const timer = setTimeout(() => setShow(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setShow(false);
    dismissPwaGuide();
  };

  const handleOpenGuide = () => {
    setShow(false);
    dismissPwaGuide();
    setShowModal(true);
  };

  if (!show && !showModal) return null;

  return (
    <>
      {show && (
        <div className="fixed bottom-20 left-4 right-4 z-[80] mx-auto max-w-lg animate-[fadeInUp_0.3s_ease-out]">
          <div
            className="flex items-center gap-3 rounded-2xl p-3.5 shadow-xl backdrop-blur-xl"
            style={{
              background: "var(--bg-card-solid)",
              border: "1px solid var(--border-color)",
              boxShadow: undefined,
            }}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600">
              <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 text-white" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
              </svg>
            </div>
            <p className="min-w-0 flex-1 text-[13px] font-medium" style={{ color: "var(--text-secondary)" }}>
              홈화면에 추가하면 앱처럼 사용할 수 있어요
            </p>
            <div className="flex shrink-0 items-center gap-1.5">
              <button
                onClick={handleDismiss}
                className="flex min-h-[44px] items-center rounded-lg px-2.5 text-[12px] font-semibold"
                style={{ color: "var(--text-muted)" }}
              >
                닫기
              </button>
              <button
                onClick={handleOpenGuide}
                className="flex min-h-[44px] items-center rounded-lg bg-amber-500 px-3 text-[12px] font-bold text-white shadow-sm"
              >
                방법 보기
              </button>
            </div>
          </div>
        </div>
      )}
      {showModal && (
        <PwaGuideModal onClose={() => setShowModal(false)} />
      )}
    </>
  );
}
