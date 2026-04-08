interface ContentRendererProps {
  content: string;
}

export default function ContentRenderer({ content }: ContentRendererProps) {
  const paragraphs = content.split("\n\n").filter(Boolean);

  return (
    <div className="content-text space-y-4" style={{ color: "var(--text-secondary)" }}>
      {paragraphs.map((paragraph, i) => {
        if (paragraph.startsWith("★")) {
          const text = paragraph.slice(1).trim();
          return (
            <div
              key={i}
              className="flex gap-3 rounded-xl px-4 py-3.5"
              style={{ background: "var(--amber-soft-bg)" }}
            >
              <span className="mt-0.5 shrink-0 text-amber-500 dark:text-amber-400" aria-hidden="true">★</span>
              <p className="text-[14px] font-semibold italic leading-relaxed text-amber-700 dark:text-amber-300">
                {text}
              </p>
            </div>
          );
        }
        return (
          <p key={i} className="text-[14px] leading-relaxed">
            {paragraph}
          </p>
        );
      })}
    </div>
  );
}
