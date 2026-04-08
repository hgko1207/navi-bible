"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getPlaybackPosition, savePlaybackPosition } from "@/lib/storage";

// YouTube IFrame API 타입 선언
interface YTPlayer {
  playVideo(): void;
  pauseVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  getCurrentTime(): number;
  getDuration(): number;
  getPlayerState(): number;
  setPlaybackRate(rate: number): void;
  getPlaybackRate(): number;
  destroy(): void;
}

interface YTPlayerEvent {
  target: YTPlayer;
  data: number;
}

interface YouTubePlayerProps {
  videoId: string;
  day: string;
  onComplete?: () => void;
}

const PLAYBACK_RATES = [1, 1.25, 1.5, 1.75, 2];

// YT states
const PLAYING = 1;
const ENDED = 0;

export default function YouTubePlayer({
  videoId,
  day,
  onComplete,
}: YouTubePlayerProps) {
  const playerRef = useRef<YTPlayer | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isReady, setIsReady] = useState(false);
  const [hasAutoCompleted, setHasAutoCompleted] = useState(false);
  const wasPlayingBeforeHidden = useRef(false);
  const lastSaveTimeRef = useRef(0);

  const playerId = `yt-player-${day}`;


  // YouTube IFrame API 로드
  useEffect(() => {
    const existingScript = document.getElementById("yt-iframe-api");
    if (!existingScript) {
      const script = document.createElement("script");
      script.id = "yt-iframe-api";
      script.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(script);
    }

    function initPlayer() {
      if (!containerRef.current) return;

      // 기존 플레이어 정리
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }

      const savedPos = getPlaybackPosition(videoId);

      const win = window as Window & { YT?: { Player: new (id: string, config: {
        videoId: string;
        playerVars: Record<string, string | number>;
        events: {
          onReady: (e: YTPlayerEvent) => void;
          onStateChange: (e: YTPlayerEvent) => void;
        };
      }) => YTPlayer } };

      if (!win.YT?.Player) return;

      playerRef.current = new win.YT.Player(playerId, {
        videoId,
        playerVars: {
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          start: savedPos ? Math.floor(savedPos.position) : 0,
        },
        events: {
          onReady: (event: YTPlayerEvent) => {
            setDuration(event.target.getDuration());
            setIsReady(true);
            if (savedPos && savedPos.position > 0) {
              setCurrentTime(savedPos.position);
            }
          },
          onStateChange: (event: YTPlayerEvent) => {
            setIsPlaying(event.data === PLAYING);
            if (event.data === PLAYING) {
              setDuration(event.target.getDuration());
            }
            // 일시정지 또는 종료 시 즉시 저장
            if (event.data !== PLAYING) {
              const t = event.target.getCurrentTime();
              const d = event.target.getDuration();
              if (d > 0) {
                savePlaybackPosition(videoId, t, d);
                lastSaveTimeRef.current = Date.now();
              }
            }
            if (event.data === ENDED) {
              setIsPlaying(false);
              if (!hasAutoCompleted && onComplete) {
                setHasAutoCompleted(true);
                onComplete();
              }
            }
          },
        },
      });
    }

    // YT API가 이미 로드된 경우
    const win = window as Window & {
      YT?: { Player: unknown };
      onYouTubeIframeAPIReady?: () => void;
    };

    if (win.YT?.Player) {
      initPlayer();
    } else {
      const prevCallback = win.onYouTubeIframeAPIReady;
      win.onYouTubeIframeAPIReady = () => {
        if (prevCallback) prevCallback();
        initPlayer();
      };
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch {
          // ignore
        }
        playerRef.current = null;
      }
    };
  }, [videoId, day, playerId]);

  // 재생 위치 추적 (1초마다)
  useEffect(() => {
    if (isPlaying && playerRef.current) {
      intervalRef.current = setInterval(() => {
        if (!playerRef.current) return;
        const time = playerRef.current.getCurrentTime();
        const dur = playerRef.current.getDuration();
        setCurrentTime(time);
        setDuration(dur);
        const now = Date.now();
        if (now - lastSaveTimeRef.current >= 5000) {
          savePlaybackPosition(videoId, time, dur);
          lastSaveTimeRef.current = now;
        }
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, videoId, hasAutoCompleted, onComplete]);

  // 백그라운드 전환 시 자동 재개
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!playerRef.current) return;

      if (document.hidden) {
        // 백그라운드로 전환됨 - 즉시 위치 저장 (앱 종료 대비)
        const time = playerRef.current.getCurrentTime();
        const dur = playerRef.current.getDuration();
        if (dur > 0) {
          savePlaybackPosition(videoId, time, dur);
          lastSaveTimeRef.current = Date.now();
        }

        // 재생 중이었는지 기록
        const state = playerRef.current.getPlayerState();
        wasPlayingBeforeHidden.current = state === PLAYING;

        if (wasPlayingBeforeHidden.current) {
          // 백그라운드에서 재생 시도 (일부 브라우저에서 동작)
          setTimeout(() => {
            try {
              playerRef.current?.playVideo();
            } catch {
              // YouTube가 차단하면 무시
            }
          }, 500);
        }
      } else {
        // 포그라운드로 복귀 - 재생 중이었으면 자동 재개
        if (wasPlayingBeforeHidden.current) {
          setTimeout(() => {
            try {
              playerRef.current?.playVideo();
            } catch {
              // ignore
            }
          }, 300);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [videoId]);

  // Media Session API - 잠금화면/알림바 컨트롤
  useEffect(() => {
    if (!("mediaSession" in navigator) || !isReady) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: `${day}일차 성경읽기`,
      artist: "내비따라성경읽기",
      album: "개역개정 음원",
    });

    navigator.mediaSession.setActionHandler("play", () => {
      playerRef.current?.playVideo();
    });
    navigator.mediaSession.setActionHandler("pause", () => {
      playerRef.current?.pauseVideo();
    });
    navigator.mediaSession.setActionHandler("seekbackward", () => {
      if (!playerRef.current) return;
      const time = playerRef.current.getCurrentTime();
      playerRef.current.seekTo(Math.max(0, time - 10), true);
    });
    navigator.mediaSession.setActionHandler("seekforward", () => {
      if (!playerRef.current) return;
      const time = playerRef.current.getCurrentTime();
      const dur = playerRef.current.getDuration();
      playerRef.current.seekTo(Math.min(dur, time + 30), true);
    });

    return () => {
      navigator.mediaSession.setActionHandler("play", null);
      navigator.mediaSession.setActionHandler("pause", null);
      navigator.mediaSession.setActionHandler("seekbackward", null);
      navigator.mediaSession.setActionHandler("seekforward", null);
    };
  }, [isReady, day]);

  const handlePlayPause = useCallback(() => {
    if (!playerRef.current) return;
    const state = playerRef.current.getPlayerState();
    if (state === PLAYING) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  }, []);

  const handleSeekBack = useCallback(() => {
    if (!playerRef.current) return;
    const time = playerRef.current.getCurrentTime();
    playerRef.current.seekTo(Math.max(0, time - 10), true);
  }, []);

  const handleSeekForward = useCallback(() => {
    if (!playerRef.current) return;
    const time = playerRef.current.getCurrentTime();
    const dur = playerRef.current.getDuration();
    playerRef.current.seekTo(Math.min(dur, time + 30), true);
  }, []);

  const [showSpeedPanel, setShowSpeedPanel] = useState(false);

  const handleRateDecrease = useCallback(() => {
    if (!playerRef.current) return;
    const currentIndex = PLAYBACK_RATES.indexOf(playbackRate);
    if (currentIndex > 0) {
      const newRate = PLAYBACK_RATES[currentIndex - 1];
      playerRef.current.setPlaybackRate(newRate);
      setPlaybackRate(newRate);
    }
  }, [playbackRate]);

  const handleRateIncrease = useCallback(() => {
    if (!playerRef.current) return;
    const currentIndex = PLAYBACK_RATES.indexOf(playbackRate);
    if (currentIndex < PLAYBACK_RATES.length - 1) {
      const newRate = PLAYBACK_RATES[currentIndex + 1];
      playerRef.current.setPlaybackRate(newRate);
      setPlaybackRate(newRate);
    }
  }, [playbackRate]);

  const handleRateSelect = useCallback((rate: number) => {
    if (!playerRef.current) return;
    playerRef.current.setPlaybackRate(rate);
    setPlaybackRate(rate);
    setShowSpeedPanel(false);
  }, []);

  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!playerRef.current || duration === 0) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percent = x / rect.width;
      const seekTime = percent * duration;
      playerRef.current.seekTo(seekTime, true);
      setCurrentTime(seekTime);
    },
    [duration]
  );

  const handleSeekKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (!playerRef.current || duration === 0) return;
      const time = playerRef.current.getCurrentTime();
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        const t = Math.max(0, time - 5);
        playerRef.current.seekTo(t, true);
        setCurrentTime(t);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        const t = Math.min(duration, time + 5);
        playerRef.current.seekTo(t, true);
        setCurrentTime(t);
      } else if (e.key === "Home") {
        e.preventDefault();
        playerRef.current.seekTo(0, true);
        setCurrentTime(0);
      } else if (e.key === "End") {
        e.preventDefault();
        playerRef.current.seekTo(duration, true);
        setCurrentTime(duration);
      }
    },
    [duration]
  );

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="space-y-3">
      {/* YouTube 영상 */}
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden rounded-2xl bg-stone-900 shadow-lg"
        style={{ paddingBottom: "56.25%" }}
      >
        <div id={playerId} className="absolute inset-0 h-full w-full" />
      </div>

      {/* 커스텀 컨트롤 */}
      {isReady && (
        <div className="rounded-2xl p-3">
          {/* 프로그레스 바 — 터치 영역 32px, 시각 높이 8px, 키보드 ←→ 5초 이동 */}
          <div
            className="group relative -my-3 cursor-pointer rounded py-3 outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-1"
            onClick={handleProgressClick}
            onKeyDown={handleSeekKeyDown}
            tabIndex={0}
            role="slider"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progressPercent)}
          >
            <div
              className="h-2 overflow-hidden rounded-full"
              style={{ background: "var(--border-input)" }}
            >
              <div
                className="h-full w-full origin-left bg-gradient-to-r from-amber-500 to-amber-600 transition-transform"
                style={{ transform: `scaleX(${progressPercent / 100})` }}
              />
            </div>
            <div
              className="pointer-events-none absolute inset-y-0 flex items-center opacity-0 transition-opacity group-hover:opacity-100"
              style={{ left: `calc(${progressPercent}% - 8px)` }}
            >
              <div
                className="h-4 w-4 rounded-full border-2 border-amber-500 shadow-sm"
                style={{ background: "var(--bg-card-solid)" }}
              />
            </div>
          </div>

          {/* 시간 표시 */}
          <div className="mt-1.5 flex justify-between text-[11px]" style={{ color: "var(--text-muted)" }}>
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>

          {/* 컨트롤 버튼 */}
          <div className="mt-2 flex items-center justify-center gap-4">
            {/* 10초 뒤로 */}
            <button
              type="button"
              onClick={handleSeekBack}
              className="relative flex h-11 w-11 items-center justify-center rounded-full transition-colors active:scale-95"
              style={{ color: "var(--text-tertiary)" }}
              title="10초 뒤로"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                <path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z" />
              </svg>
              <span className="absolute bottom-0.5 text-[9px] font-semibold">10</span>
            </button>

            {/* 재생/일시정지 */}
            <button
              type="button"
              onClick={handlePlayPause}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-600 text-white shadow-lg shadow-amber-200/50 transition-all hover:bg-amber-700 active:scale-95 dark:shadow-amber-900/40"
            >
              {isPlaying ? (
                <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="ml-1 h-7 w-7" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            {/* 30초 앞으로 */}
            <button
              type="button"
              onClick={handleSeekForward}
              className="relative flex h-11 w-11 items-center justify-center rounded-full transition-colors active:scale-95"
              style={{ color: "var(--text-tertiary)" }}
              title="30초 앞으로"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                <path d="M11.5 8c2.65 0 5.05.99 6.9 2.6L22 7v9h-9l3.62-3.62C15.23 11.22 13.46 10.5 11.5 10.5c-3.54 0-6.55 2.31-7.6 5.5L1.53 15.22C2.92 11.03 6.85 8 11.5 8z" />
              </svg>
              <span className="absolute bottom-0.5 text-[9px] font-semibold">30</span>
            </button>
          </div>

          {/* 배속 */}
          <div className="relative mt-2 flex flex-col items-center">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRateDecrease}
                disabled={PLAYBACK_RATES.indexOf(playbackRate) === 0}
                className="flex h-11 w-11 items-center justify-center rounded-full border transition-colors hover:border-amber-300 hover:text-amber-700 disabled:opacity-30"
                style={{ borderColor: "var(--border-input)", color: "var(--text-tertiary)" }}
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                  <path d="M19 13H5v-2h14v2z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setShowSpeedPanel(!showSpeedPanel)}
                className="flex min-h-[44px] min-w-[72px] items-center justify-center rounded-full border px-3 text-xs font-semibold transition-colors hover:border-amber-300 hover:text-amber-700 dark:hover:border-amber-700 dark:hover:text-amber-400"
                style={{ borderColor: "var(--border-input)", color: "var(--text-secondary)" }}
              >
                {playbackRate}x 속도
              </button>
              <button
                type="button"
                onClick={handleRateIncrease}
                disabled={PLAYBACK_RATES.indexOf(playbackRate) === PLAYBACK_RATES.length - 1}
                className="flex h-11 w-11 items-center justify-center rounded-full border transition-colors hover:border-amber-300 hover:text-amber-700 disabled:opacity-30"
                style={{ borderColor: "var(--border-input)", color: "var(--text-tertiary)" }}
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                </svg>
              </button>
            </div>

            {/* 속도 선택 패널 */}
            {showSpeedPanel && (
              <div className="mt-2 flex flex-wrap justify-center gap-1.5 rounded-xl p-2" style={{ background: "var(--bg-secondary)" }}>
                {PLAYBACK_RATES.map((rate) => (
                  <button
                    type="button"
                    key={rate}
                    onClick={() => handleRateSelect(rate)}
                    className={`rounded-full px-3 py-2 text-xs font-medium transition-colors ${
                      rate === playbackRate
                        ? "bg-amber-600 text-white shadow-sm"
                        : "hover:bg-amber-100 hover:text-amber-700 dark:hover:bg-amber-900/30 dark:hover:text-amber-400"
                    }`}
                    style={rate !== playbackRate ? { color: "var(--text-tertiary)" } : undefined}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 이어듣기 안내 */}
          {currentTime > 10 && !isPlaying && (
            <p className="mt-2 text-center text-[11px] text-amber-600 dark:text-amber-400">
              {formatTime(currentTime)}부터 이어듣기 가능
            </p>
          )}
        </div>
      )}
    </div>
  );
}
