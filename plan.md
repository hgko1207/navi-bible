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
- [x] GitHub 저장소 생성 (https://github.com/hgko1207/navi-bible)
- [x] Vercel 배포 완료 (https://navi-bible.vercel.app/)
- [x] git push → 자동 재배포 연동 확인

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

## Phase 10: v3 기능 추가 (완료)

### Step 15: 다크모드
- [x] CSS 변수 기반 라이트/다크 테마 시스템
- [x] 시스템 설정 연동 + 수동 전환(라이트/다크/시스템)
- [x] localStorage에 설정 저장
- [x] FOUC 방지 (인라인 스크립트로 초기 테마 적용)
- [x] 전체 컴포넌트 다크모드 대응 (card-glass, 텍스트, 배경, 입력, 네비게이션 등)

### Step 16: 글꼴 크기 조절
- [x] 4단계 글꼴 크기 (작게 14px / 보통 16px / 크게 18px / 매우 크게 20px)
- [x] CSS 변수(--app-font-size)로 content-text 클래스에 적용
- [x] 설정 페이지에서 실시간 미리보기
- [x] localStorage에 설정 저장

### Step 17: 자동 다음일차 이동
- [x] 완료 체크 시 NextDayToast 표시
- [x] YouTube 자동 완료(90%) 시에도 토스트 표시
- [x] 5초 카운트다운 후 자동 닫힘
- [x] "다음 일차로 이동" 버튼 클릭 시 해당 페이지로 라우팅
- [x] 홈 페이지 + 상세 페이지 모두 적용

### Step 18: 홈화면 추가 가이드 (PWA 설치 안내)
- [x] 설정 페이지에 "앱처럼 사용하기" 섹션 + 가이드 버튼
- [x] iPhone(Safari) / Galaxy(Chrome) 탭 전환 가이드 모달 (PwaGuideModal)
- [x] 기기 감지(iOS/Android)로 기본 탭 자동 설정
- [x] 첫 방문 시 3초 후 1회성 안내 토스트 (PwaInstallHint)
- [x] 이미 PWA로 설치된 경우 토스트 미표시
- [x] 설정 페이지 추가 (하단 네비게이션 4번째 탭)

### Step 19: 설정 페이지 신규 추가
- [x] /settings 라우트 추가
- [x] 하단 네비게이션에 설정 아이콘(기어) 탭 추가
- [x] 테마 토글 + 글꼴 크기 조절 + PWA 가이드 통합

---

### Step 20: 전체 목록 UI 개선
- [x] 미완료 카드 다크모드 테두리: `--border-card` 변수 추가 (다크: `rgba(255,255,255,0.08)`)
- [x] 미완료 카드에 미세 box-shadow(`--shadow-card`)로 자연스러운 구분
- [x] 카드 리스트 좌우 패딩(`px-1`) 추가로 수평 여백 확보

---

## 향후 확장 (v4 이후)

### 확장 우선순위

| 순위 | 기능 | 난이도 | 무료 서비스 | 설명 |
|------|------|--------|------------|------|
| 1 | **Supabase 연동 (로그인+동기화)** | 중 | Supabase Auth+DB (무료) | 데이터 유실 방지, 기기 간 동기화 |
| 2 | **개인 메모** | 하 | Supabase DB | DB 연동 후 일차별 메모/기도제목 저장 |
| 3 | **공유 기능** | 하 | 카카오 SDK (무료) | 카카오톡/SNS 공유 버튼 |
| 4 | **알림** | 중 | Web Push API / Firebase FCM | 매일 말씀 시간 알림 |
| 5 | **그룹 기능** | 상 | Supabase (무료 5만 MAU) | 함께 읽는 그룹, 그룹원 진도 확인 |
| 6 | **관리자 CMS** | 상 | Supabase | 새 일차 콘텐츠 등록/수정 |

### localStorage 한계 분석

현재 앱의 모든 사용자 데이터는 localStorage에 저장됨.

| 상황 | 데이터 유실? |
|------|-------------|
| 브라우저 캐시/데이터 삭제 | **전부 삭제됨** |
| 시크릿/프라이빗 모드 | 저장 안 됨 |
| 다른 기기에서 접속 | 이전 데이터 없음 (기기별 별도) |
| Safari "방문 기록 및 웹 사이트 데이터 지우기" | **전부 삭제됨** |
| iOS에서 저장 공간 부족 시 | 자동 삭제될 수 있음 |
| 앱 아이콘 삭제 후 재설치 | 삭제될 수 있음 |

**결론: localStorage는 언제든 사라질 수 있다. 중요한 데이터는 서버에 백업 필요.**

### 백엔드 연동 시 구조 (Supabase 추천)

#### 추천 스택: Supabase (전부 무료)

| 항목 | 무료 한도 |
|------|----------|
| 인증 | 5만 MAU (월간 활성 사용자) |
| 데이터베이스 | PostgreSQL 500MB |
| 스토리지 | 1GB |
| API 요청 | 무제한 |
| 가격 | **$0** (가족 단위 사용에 충분) |

#### 데이터베이스 테이블 설계

```sql
-- 1) 사용자: Supabase Auth가 auth.users 자동 생성

-- 2) 읽기 진도
CREATE TABLE reading_progress (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  day         INTEGER NOT NULL,
  completed   BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, day)
);

-- 3) 독서 회차 (1독/2독/3독)
CREATE TABLE reading_rounds (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  round       INTEGER NOT NULL,
  start_date  DATE NOT NULL,
  end_date    DATE,
  UNIQUE(user_id, round)
);

-- 4) 유튜브 재생 위치
CREATE TABLE playback_positions (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id    TEXT NOT NULL,
  position    REAL NOT NULL,
  duration    REAL NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, video_id)
);

-- 5) 개인 메모 (향후 확장)
CREATE TABLE notes (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  day         INTEGER NOT NULL,
  content     TEXT,
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, day)
);
```

#### 데이터 흐름 (이중 저장 구조)

```
현재:  앱 → localStorage (기기에만 저장)

향후:  앱 → localStorage (즉시 반영, 오프라인 대응)
         → Supabase DB (서버 백업, 기기 간 동기화)
```

- 로그인 없이도 사용 가능 (현재처럼 localStorage)
- 로그인하면 서버에 백업 + 기기 간 동기화
- localStorage 삭제되어도 로그인하면 서버에서 복원

#### 동기화 시나리오

| 상황 | 동작 |
|------|------|
| 앱 처음 열 때 | localStorage 먼저 표시 → 서버에서 최신 데이터 가져와 병합 |
| 체크 완료 시 | localStorage 즉시 업데이트 + 서버에 비동기 저장 |
| 오프라인 상태 | localStorage에만 저장, 온라인 복귀 시 서버 동기화 |
| 다른 기기 접속 | 로그인 → 서버에서 데이터 가져옴 → localStorage에 복원 |
| localStorage 삭제됨 | 로그인만 하면 서버에서 전체 복원 |

#### Supabase 셋업 절차 (실제 구현 시)

```
1. supabase.com 가입 (GitHub 로그인)
2. 새 프로젝트 생성 (리전: Northeast Asia - Tokyo)
3. SQL Editor에서 테이블 생성
4. npm install @supabase/supabase-js
5. 환경변수 설정 (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)
6. storage.ts 수정: localStorage + Supabase 이중 저장
7. 로그인 UI 추가
8. Vercel 환경변수 등록 → 배포
```

---

## 콘텐츠 관리 & 배포 방법

### 콘텐츠 추가 워크플로우

```
content/ 폴더에 N일차.md 추가 → npm run generate → git push → Vercel 자동 배포
```

1. `content/` 폴더에 `N일차.md` 파일 추가 (형식은 아래 참조)
2. `npm run generate` — .md 파일을 파싱하여 `src/data/readings.ts` 자동 생성
3. `git add . && git commit && git push` — Vercel이 자동 재배포
   - `npm run build` / `npm run dev` 시에도 generate가 자동 실행됨

### .md 파일 형식

```markdown
# 내비따라성경읽기 (1년3독)
## 월. 1일차 내비따라성경읽기 포인트 창1-19장

창1:1-25 ⇒자연과학 창조
창1:26-3:24 ⇒사회과학 원리도 시작

본문 요약 내용...

▶구약읽기 내비게이션 p61-72 참고하세요.

개역개정 음원
https://youtu.be/Ch_nEGrSa1E
```

### 주요 파일 구조

```
navi-bible/
├── content/                     # 📂 일차별 .md 파일 (데이터 원본)
│   ├── 1일차.md ~ 15일차.md
│   └── (계속 추가)
├── scripts/
│   └── generate-readings.mjs   # 🔧 .md → readings.ts 변환 스크립트
├── src/data/
│   └── readings.ts             # 🤖 자동 생성됨 (직접 수정 금지)
└── ...
```

### 배포 정보

| 항목 | 내용 |
|------|------|
| GitHub | https://github.com/hgko1207/navi-bible |
| 배포 URL | https://navi-bible.vercel.app/ |
| 배포 방식 | git push → Vercel 자동 배포 |
| 아이폰 설치 | Safari → 공유 → 홈 화면에 추가 |

---

## 참고사항

- 현재 1~15일차 데이터 적용 완료 (60일차 이상까지 확장 예정)
- 홈 화면: "이어서 읽기" — 안 읽은 가장 낮은 일차를 자동 표시
- 독서 기록은 localStorage에 저장 (서버 불필요)
- TTS는 브라우저 내장 기능 사용 (추가 비용 없음)
