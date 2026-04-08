"use client";

import { useCallback, useEffect, useState } from "react";
import { ProgressData } from "@/lib/types";
import { getProgress, toggleDayComplete } from "@/lib/storage";

export function useProgress() {
  const [progress, setProgress] = useState<ProgressData>({
    completedDays: [],
    startDate: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    setProgress(getProgress());

    // markDayComplete 등 외부에서 localStorage를 직접 수정할 때 React 상태 동기화
    const handleStorage = () => setProgress(getProgress());
    window.addEventListener("storage-update", handleStorage);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("storage-update", handleStorage);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const toggle = useCallback((day: string) => {
    const updated = toggleDayComplete(day);
    setProgress({ ...updated });
  }, []);

  const isCompleted = useCallback(
    (day: string) => progress.completedDays.includes(day),
    [progress.completedDays]
  );

  return { progress, toggle, isCompleted };
}
