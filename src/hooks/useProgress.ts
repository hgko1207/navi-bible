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
  }, []);

  const toggle = useCallback((day: number) => {
    const updated = toggleDayComplete(day);
    setProgress({ ...updated });
  }, []);

  const isCompleted = useCallback(
    (day: number) => progress.completedDays.includes(day),
    [progress.completedDays]
  );

  return { progress, toggle, isCompleted };
}
