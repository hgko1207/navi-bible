import { Testament } from "./types";

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

export function detectTestament(bibleRange: string): Testament {
  // 성경 범위에서 첫 번째 책 약어를 추출
  const trimmed = bibleRange.trim();

  // 긴 약어부터 매칭 (예: "삼상"이 "삼"보다 먼저)
  const allBooks = [...OLD_TESTAMENT_BOOKS, ...NEW_TESTAMENT_BOOKS].sort(
    (a, b) => b.length - a.length
  );

  for (const book of allBooks) {
    if (trimmed.startsWith(book)) {
      if (NEW_TESTAMENT_BOOKS.includes(book)) return "신약";
      return "구약";
    }
  }

  return "구약"; // 기본값
}
