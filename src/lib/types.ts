export interface KeyPoint {
  verse: string;
  summary: string;
}

export type Testament = "구약" | "신약";

export interface DailyReading {
  day: number;
  weekday: string;
  testament: Testament;
  bibleRange: string;
  keyPoints: KeyPoint[];
  content: string;
  reference: string;
  youtubeUrl: string;
  youtubeId: string;
}

export interface ProgressData {
  completedDays: number[];
  startDate: string;
}

export interface PlaybackPosition {
  videoId: string;
  position: number;
  duration: number;
  updatedAt: string;
}

export interface ReadingRound {
  round: number;
  startDate: string;
  endDate: string | null;
  completedDays: number[];
}

export interface ReadingHistory {
  currentRound: number;
  rounds: ReadingRound[];
}

export interface YTPlayerState {
  UNSTARTED: -1;
  ENDED: 0;
  PLAYING: 1;
  PAUSED: 2;
  BUFFERING: 3;
  CUED: 5;
}

// ─── Settings ───

export type ThemeMode = "light" | "dark" | "system";
export type FontSize = "small" | "medium" | "large" | "xlarge";

export interface AppSettings {
  theme: ThemeMode;
  fontSize: FontSize;
  pwaGuideDismissed: boolean;
}
