"use client";

import { useCallback, useRef } from "react";

/**
 * 무음 오디오를 재생하여 PWA가 백그라운드에서 suspend되지 않도록 유지.
 * Web Audio API로 무음 오실레이터를 생성하여 브라우저가 앱을 활성 상태로 유지하게 함.
 */
export function useBackgroundPlayback() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  const startKeepAlive = useCallback(() => {
    // 이미 실행 중이면 무시
    if (audioContextRef.current?.state === "running") return;

    try {
      const ctx = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext)();
      audioContextRef.current = ctx;

      // 무음 오실레이터 (gain 0으로 소리 없음)
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      gain.gain.value = 0; // 완전 무음
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start();

      oscillatorRef.current = oscillator;
      gainRef.current = gain;
    } catch {
      // Web Audio API 미지원 시 무시
    }
  }, []);

  const stopKeepAlive = useCallback(() => {
    try {
      oscillatorRef.current?.stop();
      oscillatorRef.current?.disconnect();
      audioContextRef.current?.close();
    } catch {
      // ignore
    }
    oscillatorRef.current = null;
    gainRef.current = null;
    audioContextRef.current = null;
  }, []);

  return { startKeepAlive, stopKeepAlive };
}
