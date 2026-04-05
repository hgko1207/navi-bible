import {
  ProgressData,
  PlaybackPosition,
  ReadingHistory,
  ReadingRound,
  AppSettings,
  ThemeMode,
  FontSize,
} from "./types";

// ─── Progress ───

const STORAGE_KEY = "navi-bible-progress";

function getDefaultProgress(): ProgressData {
  return {
    completedDays: [],
    startDate: new Date().toISOString().split("T")[0],
  };
}

export function getProgress(): ProgressData {
  if (typeof window === "undefined") return getDefaultProgress();
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return getDefaultProgress();
  try {
    const data = JSON.parse(stored) as ProgressData;
    // 기존 number[] → string[] 마이그레이션
    if (data.completedDays.some((d) => typeof d === "number")) {
      data.completedDays = data.completedDays.map((d) => String(d));
      saveProgress(data);
    }
    return data;
  } catch {
    return getDefaultProgress();
  }
}

export function saveProgress(data: ProgressData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function toggleDayComplete(day: string): ProgressData {
  const progress = getProgress();
  const index = progress.completedDays.indexOf(day);
  if (index === -1) {
    progress.completedDays.push(day);
  } else {
    progress.completedDays.splice(index, 1);
  }
  saveProgress(progress);
  return progress;
}

export function markDayComplete(day: string): ProgressData {
  const progress = getProgress();
  if (!progress.completedDays.includes(day)) {
    progress.completedDays.push(day);
    saveProgress(progress);
  }
  return progress;
}

export function markDaysCompleteUpTo(
  targetDay: string,
  allDayIds: string[]
): ProgressData {
  const progress = getProgress();
  const targetIdx = allDayIds.indexOf(targetDay);
  if (targetIdx === -1) return progress;
  const daysToComplete = allDayIds.slice(0, targetIdx + 1);
  for (const day of daysToComplete) {
    if (!progress.completedDays.includes(day)) {
      progress.completedDays.push(day);
    }
  }
  saveProgress(progress);
  return progress;
}

export function isDayCompleted(day: string): boolean {
  return getProgress().completedDays.includes(day);
}

export function getCompletedCount(): number {
  return getProgress().completedDays.length;
}

// ─── Playback Position ───

const PLAYBACK_KEY = "navi-bible-playback";

function getAllPlayback(): Record<string, PlaybackPosition> {
  if (typeof window === "undefined") return {};
  const stored = localStorage.getItem(PLAYBACK_KEY);
  if (!stored) return {};
  try {
    return JSON.parse(stored) as Record<string, PlaybackPosition>;
  } catch {
    return {};
  }
}

export function getPlaybackPosition(videoId: string): PlaybackPosition | null {
  const all = getAllPlayback();
  return all[videoId] ?? null;
}

export function savePlaybackPosition(
  videoId: string,
  position: number,
  duration: number
): void {
  if (typeof window === "undefined") return;
  const all = getAllPlayback();
  all[videoId] = {
    videoId,
    position,
    duration,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(PLAYBACK_KEY, JSON.stringify(all));
}

// ─── Reading History (1독/2독/3독) ───

const HISTORY_KEY = "navi-bible-history";

function getDefaultHistory(): ReadingHistory {
  return {
    currentRound: 1,
    rounds: [
      {
        round: 1,
        startDate: new Date().toISOString().split("T")[0],
        endDate: null,
        completedDays: [],
      },
    ],
  };
}

export function getReadingHistory(): ReadingHistory {
  if (typeof window === "undefined") return getDefaultHistory();
  const stored = localStorage.getItem(HISTORY_KEY);
  if (!stored) return getDefaultHistory();
  try {
    const history = JSON.parse(stored) as ReadingHistory;
    // 기존 number[] → string[] 마이그레이션
    for (const round of history.rounds) {
      if (round.completedDays.some((d) => typeof d === "number")) {
        round.completedDays = round.completedDays.map((d) => String(d));
      }
    }
    return history;
  } catch {
    return getDefaultHistory();
  }
}

export function saveReadingHistory(history: ReadingHistory): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export function getCurrentRound(): ReadingRound | null {
  const history = getReadingHistory();
  return history.rounds.find((r) => r.round === history.currentRound) ?? null;
}

export function completeCurrentRound(allDayIds: string[]): ReadingHistory {
  const history = getReadingHistory();
  const current = history.rounds.find(
    (r) => r.round === history.currentRound
  );
  if (current) {
    current.endDate = new Date().toISOString().split("T")[0];
    current.completedDays = [...allDayIds];
  }

  const newRound: ReadingRound = {
    round: history.currentRound + 1,
    startDate: new Date().toISOString().split("T")[0],
    endDate: null,
    completedDays: [],
  };
  history.rounds.push(newRound);
  history.currentRound = newRound.round;

  saveReadingHistory(history);

  // Reset main progress for new round
  saveProgress({
    completedDays: [],
    startDate: newRound.startDate,
  });

  return history;
}

export function syncRoundProgress(): void {
  const history = getReadingHistory();
  const progress = getProgress();
  const current = history.rounds.find(
    (r) => r.round === history.currentRound
  );
  if (current) {
    current.completedDays = [...progress.completedDays];
    saveReadingHistory(history);
  }
}

// ─── App Settings ───

const SETTINGS_KEY = "navi-bible-settings";

function getDefaultSettings(): AppSettings {
  return {
    theme: "system",
    fontSize: "medium",
    pwaGuideDismissed: false,
    autoComplete: true,
  };
}

export function getSettings(): AppSettings {
  if (typeof window === "undefined") return getDefaultSettings();
  const stored = localStorage.getItem(SETTINGS_KEY);
  if (!stored) return getDefaultSettings();
  try {
    return { ...getDefaultSettings(), ...(JSON.parse(stored) as Partial<AppSettings>) };
  } catch {
    return getDefaultSettings();
  }
}

export function saveSettings(settings: AppSettings): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function updateTheme(theme: ThemeMode): AppSettings {
  const settings = getSettings();
  settings.theme = theme;
  saveSettings(settings);
  return settings;
}

export function updateFontSize(fontSize: FontSize): AppSettings {
  const settings = getSettings();
  settings.fontSize = fontSize;
  saveSettings(settings);
  return settings;
}

export function dismissPwaGuide(): AppSettings {
  const settings = getSettings();
  settings.pwaGuideDismissed = true;
  saveSettings(settings);
  return settings;
}
