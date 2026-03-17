"use client";

interface CheckButtonProps {
  checked: boolean;
  onToggle: () => void;
  label?: string;
}

export default function CheckButton({
  checked,
  onToggle,
  label,
}: CheckButtonProps) {
  return (
    <button
      onClick={onToggle}
      className={`group flex w-full items-center justify-center gap-2.5 rounded-2xl py-4 text-base font-semibold transition-all duration-300 active:scale-[0.97] ${
        checked
          ? "bg-gradient-to-r from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-200/50"
          : "card-glass text-stone-500 hover:border-amber-300/60 hover:text-amber-600"
      }`}
    >
      <span
        className={`flex h-6 w-6 items-center justify-center rounded-full transition-all ${
          checked ? "bg-white/25" : "border-2 border-current"
        }`}
      >
        {checked && (
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
          </svg>
        )}
      </span>
      <span>{label ?? (checked ? "오늘 말씀 완료!" : "오늘 말씀 완료 체크")}</span>
    </button>
  );
}
