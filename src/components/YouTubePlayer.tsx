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
  day: number;
  onComplete?: () => void;
}

const PLAYBACK_RATES = [0.75, 1, 1.25, 1.5, 1.75, 2];

// YT states
const PLAYING = 1;
const PAUSED = 2;
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
            if (event.data === ENDED) {
              setIsPlaying(false);
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
        savePlaybackPosition(videoId, time, dur);

        // 90% 이상 들으면 자동 완료
        if (dur > 0 && time / dur >= 0.9 && !hasAutoCompleted && onComplete) {
          setHasAutoCompleted(true);
          onComplete();
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

  const handleRateChange = useCallback(() => {
    if (!playerRef.current) return;
    const currentRate = playerRef.current.getPlaybackRate();
    const currentIndex = PLAYBACK_RATES.indexOf(currentRate);
    const nextIndex = (currentIndex + 1) % PLAYBACK_RATES.length;
    const newRate = PLAYBACK_RATES[nextIndex];
    playerRef.current.setPlaybackRate(newRate);
    setPlaybackRate(newRate);
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
        <div className="rounded-2xl bg-white p-3 shadow-sm">
          {/* 프로그레스 바 */}
          <div
            className="group relative h-2 cursor-pointer rounded-full bg-stone-200"
            onClick={handleProgressClick}
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-600 transition-all"
              style={{ width: `${progressPercent}%` }}
            />
            <div
              className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-amber-500 bg-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
              style={{ left: `calc(${progressPercent}% - 8px)` }}
            />
          </div>

          {/* 시간 표시 */}
          <div className="mt-1.5 flex justify-between text-[11px] text-stone-400">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>

          {/* 컨트롤 버튼 */}
          <div className="mt-2 flex items-center justify-center gap-4">
            {/* 10초 뒤로 */}
            <button
              onClick={handleSeekBack}
              className="flex h-10 w-10 items-center justify-center rounded-full text-stone-500 transition-colors hover:bg-stone-100 active:bg-stone-200"
              title="10초 뒤로"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                <path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z" />
              </svg>
              <span className="absolute mt-6 text-[9px]">10</span>
            </button>

            {/* 재생/일시정지 */}
            <button
              onClick={handlePlayPause}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-600 text-white shadow-lg shadow-amber-200/50 transition-all hover:bg-amber-700 active:scale-95"
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
              onClick={handleSeekForward}
              className="flex h-10 w-10 items-center justify-center rounded-full text-stone-500 transition-colors hover:bg-stone-100 active:bg-stone-200"
              title="30초 앞으로"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                <path d="M11.5 8c2.65 0 5.05.99 6.9 2.6L22 7v9h-9l3.62-3.62C15.23 11.22 13.46 10.5 11.5 10.5c-3.54 0-6.55 2.31-7.6 5.5L1.53 15.22C2.92 11.03 6.85 8 11.5 8z" />
              </svg>
              <span className="absolute mt-6 text-[9px]">30</span>
            </button>
          </div>

          {/* 배속 */}
          <div className="mt-2 flex justify-center">
            <button
              onClick={handleRateChange}
              className="rounded-full border border-stone-200 px-3 py-1 text-xs font-semibold text-stone-600 transition-colors hover:border-amber-300 hover:text-amber-700"
            >
              {playbackRate}x 속도
            </button>
          </div>

          {/* 이어듣기 안내 */}
          {currentTime > 10 && !isPlaying && (
            <p className="mt-2 text-center text-[11px] text-amber-600">
              {formatTime(currentTime)}부터 이어듣기 가능
            </p>
          )}
        </div>
      )}
    </div>
  );
}
