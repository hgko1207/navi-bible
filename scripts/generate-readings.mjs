import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR = path.join(__dirname, "..", "content");
const OUTPUT_FILE = path.join(__dirname, "..", "src", "data", "readings.ts");

const OLD_TESTAMENT_BOOKS = [
  "창", "출", "레", "민", "신", "수", "삿", "룻",
  "삼상", "삼하", "왕상", "왕하", "대상", "대하",
  "스", "느", "에", "욥", "시", "잠", "전", "아",
  "사", "렘", "애", "겔", "단", "호", "욜", "암",
  "옵", "욘", "미", "나", "합", "습", "학", "슥", "말",
];

const NEW_TESTAMENT_BOOKS = [
  "마", "막", "눅", "요", "행", "롬",
  "고전", "고후", "갈", "엡", "빌", "골",
  "살전", "살후", "딤전", "딤후", "딛", "몬",
  "히", "약", "벧전", "벧후",
  "요일", "요이", "요삼", "유", "계",
];

function detectTestament(bibleRange) {
  const trimmed = bibleRange.trim();
  const allBooks = [...OLD_TESTAMENT_BOOKS, ...NEW_TESTAMENT_BOOKS].sort(
    (a, b) => b.length - a.length
  );
  for (const book of allBooks) {
    if (trimmed.startsWith(book)) {
      return NEW_TESTAMENT_BOOKS.includes(book) ? "신약" : "구약";
    }
  }
  return "구약";
}

function parseMdFile(content) {
  // Normalize: CRLF → LF, non-breaking space → regular space
  content = content.replace(/\r\n/g, "\n").replace(/\u00A0/g, " ");
  const lines = content.split("\n");

  // Parse header: ## 월. 1일차 내비따라성경읽기 포인트 창1-19장
  // 일차 정보가 있는 ## 줄을 찾음 (제목줄 "## 내비따라성경읽기 (1년3독)" 건너뜀)
  const headerLine = lines.find((l) => l.startsWith("## ") && /\d+일차/.test(l));
  if (!headerLine) throw new Error("헤더(## N일차)를 찾을 수 없습니다");

  // 포인트 뒤에 범위가 있는 경우와 없는 경우(다음 줄에 있음) 모두 지원
  const headerMatch = headerLine.match(
    /^## (\S+)\.\s*(\d+)일차\s*내비따라성경읽기\s*포인트\s*(.*)$/
  );
  if (!headerMatch) throw new Error(`헤더 파싱 실패: ${headerLine}`);

  const weekday = headerMatch[1];
  const day = parseInt(headerMatch[2]);
  let bibleRange = headerMatch[3].trim();

  // 헤더에 범위가 없으면 다음 비어있지 않은 줄에서 가져옴
  if (!bibleRange) {
    const headerIdx = lines.indexOf(headerLine);
    for (let i = headerIdx + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line && !line.startsWith("#")) {
        // ⇒가 포함된 줄이면 키포인트이므로 그 앞 줄이 범위
        if (line.includes("⇒")) break;
        bibleRange = line;
        break;
      }
    }
  }
  if (!bibleRange) throw new Error(`${day}일차: 성경 범위를 찾을 수 없습니다`);
  const testament = detectTestament(bibleRange);

  // Parse key points: lines with ⇒
  const keyPoints = [];
  const keyPointLines = lines.filter((l) => l.includes("⇒"));
  for (const line of keyPointLines) {
    const [verse, summary] = line.split("⇒").map((s) => s.trim());
    if (verse && summary) {
      keyPoints.push({ verse, summary });
    }
  }

  // Find content: between key points and ▶ reference line
  const lastKeyPointIdx = lines.findLastIndex((l) => l.includes("⇒"));
  const refLineIdx = lines.findIndex((l) => l.startsWith("▶") && l.includes("내비게이션"));

  const contentLines = lines
    .slice(lastKeyPointIdx + 1, refLineIdx !== -1 ? refLineIdx : undefined)
    .join("\n")
    .trim();

  // Parse reference
  let reference = "";
  if (refLineIdx !== -1) {
    const refMatch = lines[refLineIdx].match(/내비게이션\s*(.+?)\s*참고/);
    if (refMatch) {
      const testamentPrefix = testament === "신약" ? "신약읽기" : "구약읽기";
      reference = `${testamentPrefix} 내비게이션 ${refMatch[1].trim()}`;
    }
  }

  // Parse YouTube URL
  let youtubeUrl = "";
  let youtubeId = "";
  const ytLine = lines.find((l) => l.includes("youtu.be/") || l.includes("youtube.com/"));
  if (ytLine) {
    youtubeUrl = ytLine.trim();
    const idMatch = youtubeUrl.match(/youtu\.be\/([^?\s]+)/) ||
      youtubeUrl.match(/[?&]v=([^&\s]+)/);
    if (idMatch) youtubeId = idMatch[1];
  }

  return {
    day,
    weekday,
    testament,
    bibleRange,
    keyPoints,
    content: contentLines,
    reference,
    youtubeUrl,
    youtubeId,
  };
}

function escapeForTemplate(str) {
  return str.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$/g, "\\$");
}

function generateTs(readings) {
  const entries = readings.map((r) => {
    const keyPointsStr = r.keyPoints
      .map((kp) => `      { verse: "${kp.verse}", summary: "${kp.summary}" }`)
      .join(",\n");

    return `  {
    day: ${r.day},
    weekday: "${r.weekday}",
    testament: "${r.testament}",
    bibleRange: "${r.bibleRange}",
    keyPoints: [
${keyPointsStr},
    ],
    content: \`${escapeForTemplate(r.content)}\`,
    reference: "${r.reference}",
    youtubeUrl: "${r.youtubeUrl}",
    youtubeId: "${r.youtubeId}",
  }`;
  });

  return `// 이 파일은 자동 생성됩니다. 직접 수정하지 마세요.
// content/ 폴더의 .md 파일을 수정한 후 npm run generate 를 실행하세요.
import { DailyReading } from "@/lib/types";

export const readings: DailyReading[] = [
${entries.join(",\n")},
];

export function getReadingByDay(day: number): DailyReading | undefined {
  return readings.find((r) => r.day === day);
}

export function getTotalDays(): number {
  return readings.length;
}
`;
}

// Main
const files = fs
  .readdirSync(CONTENT_DIR)
  .filter((f) => f.endsWith("일차.md"))
  .sort((a, b) => {
    const numA = parseInt(a.match(/(\d+)/)[1]);
    const numB = parseInt(b.match(/(\d+)/)[1]);
    return numA - numB;
  });

console.log(`📖 ${files.length}개의 말씀 파일을 발견했습니다.`);

const readings = [];
for (const file of files) {
  const content = fs.readFileSync(path.join(CONTENT_DIR, file), "utf-8");
  try {
    const reading = parseMdFile(content);
    readings.push(reading);
    console.log(`  ✅ ${file} → ${reading.day}일차 (${reading.weekday}, ${reading.bibleRange})`);
  } catch (err) {
    console.error(`  ❌ ${file} 파싱 실패: ${err.message}`);
    process.exit(1);
  }
}

const output = generateTs(readings);
fs.writeFileSync(OUTPUT_FILE, output, "utf-8");
console.log(`\n✨ src/data/readings.ts 생성 완료! (${readings.length}일차)`);
