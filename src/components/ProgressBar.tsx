interface ProgressBarProps {
  current: number;
  total: number;
  label: string;
  color?: "amber" | "emerald" | "blue";
}

const colorMap = {
  amber: {
    bg: "bg-amber-100",
    fill: "bg-amber-500",
    text: "text-amber-700",
  },
  emerald: {
    bg: "bg-emerald-100",
    fill: "bg-emerald-500",
    text: "text-emerald-700",
  },
  blue: {
    bg: "bg-blue-100",
    fill: "bg-blue-500",
    text: "text-blue-700",
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
        <span className="text-sm font-medium text-stone-700">{label}</span>
        <span className={`text-sm font-bold ${c.text}`}>{percent}%</span>
      </div>
      <div className={`h-3 overflow-hidden rounded-full ${c.bg}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${c.fill}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="text-xs text-stone-400">
        {current} / {total}일 완료
      </p>
    </div>
  );
}
