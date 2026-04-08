interface ProgressBarProps {
  current: number;
  total: number;
  label: string;
  color?: "amber" | "emerald" | "blue";
}

const colorMap = {
  amber: {
    bg: "bg-amber-100 dark:bg-amber-900/30",
    fill: "bg-amber-500",
    text: "text-amber-700 dark:text-amber-400",
  },
  emerald: {
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
    fill: "bg-emerald-500",
    text: "text-emerald-700 dark:text-emerald-400",
  },
  blue: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    fill: "bg-blue-500",
    text: "text-blue-700 dark:text-blue-400",
  },
};

export default function ProgressBar({
  current,
  total,
  label,
  color = "amber",
}: ProgressBarProps) {
  const percent = total > 0 ? Math.round((current / total) * 100) : 0;
  const c = colorMap[color];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{label}</span>
        <span className={`text-sm font-bold ${c.text}`}>{percent}%</span>
      </div>
      <div className={`h-3 overflow-hidden rounded-full ${c.bg}`}>
        <div
          className={`h-full w-full origin-left transition-transform duration-500 ease-out ${c.fill}`}
          style={{ transform: `scaleX(${percent / 100})` }}
        />
      </div>
      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
        {current} / {total}일 완료
      </p>
    </div>
  );
}
