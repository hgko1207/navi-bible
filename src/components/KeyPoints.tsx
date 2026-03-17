import { KeyPoint } from "@/lib/types";

interface KeyPointsProps {
  points: KeyPoint[];
}

export default function KeyPoints({ points }: KeyPointsProps) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-orange-500/10">
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-orange-500" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
          </svg>
        </div>
        <span className="text-[12px] font-semibold text-stone-500">핵심 포인트</span>
      </div>
      <div className="space-y-2">
        {points.map((point, index) => (
          <div
            key={index}
            className="card-glass flex items-start gap-3 rounded-2xl px-4 py-3 transition-all"
          >
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 text-[11px] font-bold text-white shadow-sm">
              {index + 1}
            </span>
            <div className="min-w-0">
              <span className="text-xs font-semibold text-amber-700">
                {point.verse}
              </span>
              <p className="mt-0.5 text-[13px] leading-snug text-stone-600">
                {point.summary}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
