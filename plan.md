# 내비따라성경읽기 PWA 구현 플랜

## 프로젝트 개요

| 항목 | 내용 |
|------|------|
| 프로젝트명 | 내비따라성경읽기 (Navi Bible) |
| 플랫폼 | PWA (Progressive Web App) |
| 기술 스택 | Next.js 14+ / TypeScript / Tailwind CSS |
| 배포 | Vercel (무료) |
| 목표 | MVP 완성 후 점진적 기능 확장 |

---

## Phase 1: 프로젝트 초기 설정

### 1-1. Next.js 프로젝트 생성

```bash
npx create-next-app@latest navi-bible --typescript --tailwind --app --src-dir
```

- App Router 사용
- TypeScript 기본 설정
- Tailwind CSS 포함
- src/ 디렉토리 구조

### 1-2. 폴더 구조

```
navi-bible/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # 루트 레이아웃 (하단 네비게이션 포함)
│   │   ├── page.tsx            # 홈 (오늘의 말씀)
│   │   ├── days/
│   │   │   ├── page.tsx        # 전체 일차 목록
│   │   │   └── [day]/
│   │   │       └── page.tsx    # 일차별 상세 페이지
│   │   ├── progress/
│   │   │   └── page.tsx        # 내 진도 페이지
│   │   └── globals.css         # 글로벌 스타일
│   ├── components/
│   │   ├── BottomNav.tsx       # 하단 네비게이션 바
│   │   ├── DayCard.tsx         # 일차 카드 컴포넌트
│   │   ├── YouTubePlayer.tsx   # 유튜브 임베드 컴포넌트
│   │   ├── KeyPoints.tsx       # 핵심 포인트 목록
│   │   ├── ProgressBar.tsx     # 진도 프로그레스 바
│   │   └── CheckButton.tsx     # 완료 체크 버튼
│   ├── data/
│   │   └── readings.ts         # 마크다운 → 구조화된 데이터
│   ├── lib/
│   │   ├── types.ts            # TypeScript 타입 정의
│   │   └── storage.ts          # localStorage 유틸리티
│   └── hooks/
│       └── useProgress.ts      # 진도 관리 커스텀 훅
├── public/
│   ├── manifest.json           # PWA 매니페스트
│   ├── icons/                  # 앱 아이콘 (192x192, 512x512)
│   └── sw.js                   # Service Worker
└── package.json
```

### 1-3. 필수 패키지 설치

```bash
npm install next-pwa          # PWA 지원
```

> Tailwind CSS, TypeScript는 create-next-app에 포함됨. 최소한의 패키지만 설치.

---

## Phase 2: 데이터 구조화

### 2-1. 타입 정의 (`src/lib/types.ts`)

```typescript
export interface KeyPoint {
  verse: string;       // "창1:1-25"
  summary: string;     // "자연과학 창조"
}

export interface DailyReading {
  day: number;
  weekday: string;
  testament: "구약" | "신약";
  bibleRange: string;
  keyPoints: KeyPoint[];
  content: string;
  reference: string;
  youtubeUrl: string;
  youtubeId: string;
}
```

### 2-2. 마크다운 → 데이터 변환 (`src/data/readings.ts`)

Bible 폴더의 1~3일차 마크다운 파일 내용을 구조화된 데이터로 변환.

```typescript
export const readings: DailyReading[] = [
  {
    day: 1,
    weekday: "월",
    testament: "구약",
    bibleRange: "창1-19장",
    keyPoints: [
      { verse: "창1:1-25", summary: "자연과학 창조" },
      { verse: "창1:26-3:24", summary: "사회과학 원리도 시작" },
      { verse: "창12:1-3", summary: "이스라엘 나라의 존재 의의" },
      { verse: "창12:4-18:19", summary: "아브람, 약속의 땅 정착, 언약 맺으심" },
      { verse: "창18:20-19장", summary: "소돔과 고모라" },
    ],
    content: "성경은 처음부터 하나님의 창조를 선포하며 시작합니다...",
    reference: "구약읽기 내비게이션 p61-72",
    youtubeUrl: "https://youtu.be/Ch_nEGrSa1E",
    youtubeId: "Ch_nEGrSa1E",
  },
  // 2일차, 3일차...
];
```

### 2-3. localStorage 유틸리티 (`src/lib/storage.ts`)

```typescript
// 진도 체크: 완료한 일차 Set
getCompletedDays(): number[]
toggleDay(day: number): void
isCompleted(day: number): boolean
getProgressPercent(): number
```

---

## Phase 3: 핵심 화면 구현

### 3-1. 루트 레이아웃 (`layout.tsx`)

- 모바일 퍼스트 반응형 레이아웃
- 하단 네비게이션 바 (3탭): 오늘의 말씀 | 전체 목록 | 내 진도
- 상단 헤더: "내비따라성경읽기" 타이틀
- 따뜻한 색상 테마 (베이지 배경, 네이비 텍스트, 골드 포인트)

### 3-2. 홈 - 오늘의 말씀 (`page.tsx`)

```
┌─────────────────────────┐
│   내비따라성경읽기        │  ← 헤더
├─────────────────────────┤
│  📖 3일차 | 수요일       │  ← 현재 일차 + 요일
│  창39-50장, 출1-11장     │  ← 성경 범위
├─────────────────────────┤
│  ▶ 유튜브 플레이어       │  ← 임베드 영상
│  (개역개정 음원)         │
├─────────────────────────┤
│  핵심 포인트             │
│  • 창39-50장 ⇒ 요셉의..│
│  • 출1:1-4:17 ⇒ 모세.. │
├─────────────────────────┤
│  요약                    │
│  애굽으로 팔려간 요셉은  │
│  누명으로 감옥살이를...  │
├─────────────────────────┤
│  ☐ 오늘 말씀 완료       │  ← 체크 버튼
├─────────────────────────┤
│  📖    📋    📊         │  ← 하단 네비게이션
│  오늘  목록  진도        │
└─────────────────────────┘
```

**오늘의 일차 계산 로직:**
- 시작일(1독 시작 날짜)을 기준으로 오늘이 몇 번째 평일(월~금)인지 계산
- 주말은 건너뜀
- 설정에서 시작일 변경 가능

### 3-3. 전체 목록 (`days/page.tsx`)

```
┌─────────────────────────┐
│  전체 목록               │
├─────────────────────────┤
│  ── 구약 ──             │
│  ✅ 1일차 | 창1-19장    │
│  ✅ 2일차 | 창20-38장   │
│  ☐ 3일차 | 창39-50,출..│
│  ☐ 4일차 | ...         │
│  ...                    │
│  ── 신약 ──             │
│  ☐ 49일차 | ...        │
│  ...                    │
├─────────────────────────┤
│  📖    📋    📊         │
└─────────────────────────┘
```

- 구약/신약 섹션 구분
- 완료한 일차는 ✅ 표시
- 카드 터치 → 상세 페이지 이동

### 3-4. 일차 상세 페이지 (`days/[day]/page.tsx`)

- 홈과 동일한 레이아웃 (선택한 일차 내용 표시)
- 유튜브 플레이어 + 핵심 포인트 + 요약
- 완료 체크 버튼
- 이전/다음 일차 이동 버튼

### 3-5. 내 진도 (`progress/page.tsx`)

```
┌─────────────────────────┐
│  내 진도                 │
├─────────────────────────┤
│  1독 진행률              │
│  ████████░░░░░░ 38%     │
│  24 / 62일 완료          │
├─────────────────────────┤
│  구약  ██████░░░ 67%    │
│  신약  ░░░░░░░░░  0%    │
├─────────────────────────┤
│  📖    📋    📊         │
└─────────────────────────┘
```

---

## Phase 4: 컴포넌트 구현 상세

### 4-1. YouTubePlayer 컴포넌트

```typescript
// YouTube 영상 ID를 받아 iframe 임베드
// 반응형 16:9 비율 유지
// lazy loading으로 초기 로딩 최적화
<YouTubePlayer videoId="Ch_nEGrSa1E" />
```

### 4-2. BottomNav 컴포넌트

- 3개 탭: 오늘의 말씀, 전체 목록, 내 진도
- 현재 페이지 하이라이트
- 고정 하단 위치 (sticky bottom)

### 4-3. DayCard 컴포넌트

- 일차 번호 + 요일 + 성경 범위
- 완료 여부 표시
- 클릭 시 상세 페이지 이동

### 4-4. CheckButton 컴포넌트

- 토글 방식 (완료/미완료)
- 완료 시 애니메이션 효과
- localStorage에 즉시 저장

---

## Phase 5: PWA 설정

### 5-1. Web App Manifest (`public/manifest.json`)

```json
{
  "name": "내비따라성경읽기",
  "short_name": "내비성경",
  "description": "1년 3독 성경읽기 가이드",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#F5F0E8",
  "theme_color": "#1E3A5F",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

### 5-2. Service Worker (next-pwa)

- 정적 자산 캐싱 (오프라인에서도 요약 텍스트 열람 가능)
- 유튜브는 온라인 필요 (오프라인 시 안내 메시지)

### 5-3. 앱 아이콘

- 192x192, 512x512 PNG
- 성경 + 내비게이션 모티브 심플 아이콘

---

## Phase 6: 스타일 & 디자인

### 6-1. 색상 팔레트

```
배경:     #F5F0E8 (따뜻한 베이지)
주 텍스트: #1E3A5F (네이비)
보조:     #6B7280 (그레이)
포인트:   #B8860B (골드)
완료:     #059669 (그린)
카드 배경: #FFFFFF
```

### 6-2. 타이포그래피

- 제목: 20-24px, bold
- 본문: 16-17px (가독성 우선, 다양한 연령대 고려)
- 줄간격: 1.7~1.8 (긴 텍스트 읽기 편의)

### 6-3. 모바일 최적화

- 최대 너비 480px 기준 디자인 (모바일 퍼스트)
- 터치 타겟 최소 44px
- 스크롤 영역 명확히 구분
- 데스크톱에서는 가운데 정렬 + 최대 너비 제한

---

## 구현 순서 (단계별)

### Step 1: 기반 작업
- [x] Next.js 프로젝트 생성 + Tailwind 설정
- [x] 폴더 구조 생성
- [x] 타입 정의 (`types.ts`)
- [x] 데이터 파일 작성 (`readings.ts`) — 1~3일차 데이터 입력
- [x] localStorage 유틸리티 (`storage.ts`)

### Step 2: 레이아웃 + 네비게이션
- [x] 루트 레이아웃 (헤더 + 하단 네비)
- [x] BottomNav 컴포넌트
- [x] 색상 팔레트 + 글로벌 스타일 적용

### Step 3: 홈 화면 (오늘의 말씀)
- [x] 오늘의 일차 계산 로직
- [x] YouTubePlayer 컴포넌트
- [x] KeyPoints 컴포넌트
- [x] 요약 본문 표시
- [x] CheckButton 컴포넌트 (완료 체크)

### Step 4: 전체 목록 화면
- [x] DayCard 컴포넌트
- [x] 구약/신약 섹션 구분
- [x] 완료 여부 표시
- [x] 목록 → 상세 페이지 라우팅

### Step 5: 일차 상세 페이지
- [x] 동적 라우트 (`/days/[day]`)
- [x] 이전/다음 일차 이동
- [x] 완료 체크

### Step 6: 내 진도 화면
- [x] 전체 진도율 계산
- [x] ProgressBar 컴포넌트
- [x] 구약/신약 별도 진도율

### Step 7: PWA 설정
- [x] manifest.json 작성
- [x] 앱 아이콘 생성 (SVG)
- [x] Service Worker 직접 작성 (sw.js + 등록 컴포넌트)
- [x] 오프라인 캐싱 설정 완료

### Step 8: 테스트 + 배포
- [x] 타입체크 통과 (any/unknown 없음)
- [x] 빌드 성공
- [x] 개발 서버 실행 확인 (localhost:3000)
- [ ] Vercel 배포 (사용자 준비 시)
- [ ] 실제 URL 접속 테스트

---

## Phase 9: v2 기능 추가 (완료)

### Step 9: 유튜브 플레이어 고도화 (YouTube IFrame Player API)
- [x] YouTube IFrame Player API 연동 (단순 iframe → API 제어)
- [x] 재생 위치 저장 (localStorage) — 어디까지 들었는지 기억
- [x] 이어듣기 — 다음 접속 시 마지막 위치부터 재생
- [x] 재생 프로그레스 바 — 클릭으로 원하는 위치 이동 가능
- [x] 자동 완료 체크 — 90% 이상 재생 시 자동으로 해당 일차 완료 처리
- [x] 커스텀 재생 컨트롤 UI (재생/일시정지/10초뒤로/30초앞으로/배속)

### Step 10: 검색 기능
- [x] 검색 바 UI (목록 페이지 상단)
- [x] 일차 번호, 성경 범위, 요약 내용, 핵심포인트로 검색
- [x] 검색 결과 드롭다운 → 클릭 시 상세 페이지 이동

### Step 11: TTS (요약 음성 읽기)
- [x] Web Speech API 기반 TTS 컴포넌트 (TTSPlayer)
- [x] 재생/일시정지/정지 컨트롤
- [x] 홈 + 상세 페이지에 "요약 듣기" 버튼 추가
- [x] 한국어 음성 지원 (브라우저 내장 TTS)

### Step 12: 독서 기록 시스템 (1독/2독/3독)
- [x] 타입 확장: ReadingRound, ReadingHistory
- [x] 완독 시 → 기록 저장 + 새 회차 자동 시작
- [x] 진도 페이지에 "회차별 기록" 카드 (ReadingHistoryCard)
- [x] 회차별 시작일/종료일/진행률 표시
- [x] "새 독서 시작" / "완독 처리" 버튼

### Step 13: 자동 구약/신약 구분
- [x] 성경 약어 → 구약/신약 자동 판별 함수 (bible.ts: detectTestament)
- [x] 구약 39권 + 신약 27권 전체 약어 매핑
- [x] 데이터 추가 시 자동 설정 가능

### Step 14: UI/디자인 리뉴얼
- [x] 글래스모피즘 + 그라데이션 카드 디자인
- [x] 부드러운 페이드인 애니메이션 (CSS @keyframes)
- [x] 그라데이션 & 그림자 전면 업그레이드
- [x] 하단 네비 아이콘을 SVG 아이콘으로 교체 (이모지 → Heroicons)
- [x] 카드 호버/터치 마이크로 인터랙션 (scale, shadow)
- [x] 전체 여백, 타이포그래피, 색상 팔레트 정교화
- [x] iOS safe area 대응

---

## 향후 확장 (v3 이후)

| 우선순위 | 기능 | 설명 |
|---------|------|------|
| v3-1 | 개인 메모 | 일차별 메모/기도제목 기록 |
| v3-2 | 다크 모드 | 시스템 설정 연동 또는 수동 토글 |
| v3-3 | 공유 기능 | 카카오톡/SNS 공유 버튼 |
| v3-4 | 알림 | 매일 말씀 시간 알림 (Notification API) |
| v4-1 | 백엔드 연동 | Supabase/Firebase로 사용자 데이터 동기화 |
| v4-2 | 그룹 기능 | 함께 읽는 그룹, 그룹원 진도 확인 |
| v4-3 | 관리자 CMS | 새 일차 콘텐츠 등록/수정 |

---

## 데이터 추가 방법

사용자가 Bible 폴더에 `N일차.md` 파일을 추가하면:
1. 마크다운 파일 내용을 파싱
2. 성경 범위 첫 글자로 구약/신약 자동 구분
3. `readings.ts`에 데이터 추가
4. 앱에 즉시 반영

---

## 참고사항

- 현재 1~3일차 데이터 적용 완료
- 나머지 일차는 사용자가 마크다운 파일 올려주면 즉시 적용
- 독서 기록은 localStorage에 저장 (서버 불필요)
- TTS는 브라우저 내장 기능 사용 (추가 비용 없음)
