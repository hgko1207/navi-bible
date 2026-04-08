"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface TTSPlayerProps {
  text: string;
}

const TTS_RATES = [1, 1.25, 1.5, 1.75, 2];

export default function TTSPlayer({ text }: TTSPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [rate, setRate] = useState(1);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    setIsSupported("speechSynthesis" in window);
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  const handlePlay = useCallback(() => {
    if (!("speechSynthesis" in window)) return;

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ko-KR";
    utterance.rate = rate;
    utterance.pitch = 1;

    // 한국어 음성 찾기
    const voices = window.speechSynthesis.getVoices();
    const koVoice = voices.find((v) => v.lang.startsWith("ko"));
    if (koVoice) {
      utterance.voice = koVoice;
    }

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };
    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };
    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [text, isPaused, rate]);

  const handlePause = useCallback(() => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.pause();
    setIsPaused(true);
    setIsPlaying(false);
  }, []);

  const handleStop = useCallback(() => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  }, []);

  const handleRateChange = useCallback(() => {
    const currentIndex = TTS_RATES.indexOf(rate);
    const nextIndex = (currentIndex + 1) % TTS_RATES.length;
    const newRate = TTS_RATES[nextIndex];
    setRate(newRate);

    // 재생 중이면 새 배속으로 다시 시작
    if (isPlaying && utteranceRef.current) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ko-KR";
      utterance.rate = newRate;
      utterance.pitch = 1;

      const voices = window.speechSynthesis.getVoices();
      const koVoice = voices.find((v) => v.lang.startsWith("ko"));
      if (koVoice) utterance.voice = koVoice;

      utterance.onstart = () => { setIsPlaying(true); setIsPaused(false); };
      utterance.onend = () => { setIsPlaying(false); setIsPaused(false); };
      utterance.onerror = () => { setIsPlaying(false); setIsPaused(false); };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  }, [rate, isPlaying, text]);

  if (!isSupported) return null;

  return (
    <div className="flex items-center gap-2">
      {!isPlaying ? (
        <button
          type="button"
          onClick={handlePlay}
          className="flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-medium transition-all hover:text-amber-700 active:scale-95"
          style={{ background: "var(--bg-secondary)", color: "var(--text-secondary)" }}
        >
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
          </svg>
          {isPaused ? "이어듣기" : "요약 듣기"}
        </button>
      ) : (
        <>
          <button
            type="button"
            onClick={handlePause}
            className="flex items-center gap-1.5 rounded-full bg-amber-100 px-3.5 py-2 text-xs font-medium text-amber-700 transition-all active:scale-95 dark:bg-amber-900/30 dark:text-amber-400"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
            일시정지
          </button>
          <button
            type="button"
            onClick={handleStop}
            className="flex h-11 w-11 items-center justify-center rounded-full transition-all active:scale-95"
            style={{ background: "var(--bg-secondary)", color: "var(--text-tertiary)" }}
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
              <path d="M6 6h12v12H6z" />
            </svg>
          </button>
        </>
      )}
      <button
        type="button"
        onClick={handleRateChange}
        className="rounded-full border px-2.5 py-1.5 text-[11px] font-semibold transition-colors hover:border-amber-300 hover:text-amber-700"
        style={{ borderColor: "var(--border-input)", color: "var(--text-tertiary)" }}
      >
        {rate}x
      </button>
    </div>
  );
}
