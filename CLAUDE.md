# 내비따라성경읽기 — Claude 작업 가이드

## 프로젝트 개요
1년3독 성경읽기 PWA. 매일 성경 읽기 포인트·유튜브 음원 제공, 진도 관리. 서버 없음 — 모든 데이터는 localStorage.

## 기술 스택
- Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- PWA (Service Worker, Web App Manifest) — Vercel 배포
- YouTube IFrame API (오디오), Web Speech API (TTS)
- 콘텐츠: `content/*.md` → `npm run generate` → `src/data/readings.ts` 자동 생성

## 핵심 규칙

### 코드
- `day` 필드는 `string` 타입 (`"1"`, `"52A"`, `"52B"` 등 A/B 일차 지원)
- `completedDays`는 `string[]`
- 이전/다음 네비게이션은 `readings` 배열 인덱스 기반 (`r.day ± 1` 금지)
- 콘텐츠 추가 후 반드시 `npm run generate` 실행

### 스타일
- 색상은 CSS 변수 사용 (`var(--border-input)` 등) — 하드코딩 금지
- 라이트모드를 기준으로 먼저 설계·구현, 다크모드는 그 다음
- 애니메이션 과다 사용 금지

## Design Context

### Users
한국어 사용 그리스도인. 이동 중·저녁 시간에 사용. 연령대 다양(20대~60대+). 한 손, 짧은 집중 시간. 저녁 사용이 많아 다크모드 중요.

### Brand Personality
**경건하고 따뜻하며 간결하다.**
감정 목표: 차분한 동기부여 + 완료 시 작은 성취감.

### Aesthetic Direction
- 웜 스톤/앰버 기조. Primary `#d97706`. 구약=amber, 신약=blue.
- 배경 오프화이트 `#f8f6f3`, 웜 다크 `#0c0a09`/`#1c1917`.
- 카드 기반, 둥근 모서리, 단일 컬럼 세로 스크롤.
- 복잡한 UI 금지 — 한 화면에 한 가지 핵심 작업.

### Design Principles
1. **콘텐츠 우선** — 말씀·플레이어가 중심, UI 크롬 최소화
2. **한 손 조작** — 큰 터치 타겟(min 44px), 주요 액션은 엄지 닿는 곳에
3. **라이트 우선** — 라이트모드 기준으로 먼저 설계, 다크모드는 후속 작업
4. **조용한 성취감** — 과한 축하 없이 지속을 돕는 방향
5. **점진적 복잡도** — 오늘 읽기는 즉시 접근, 부가 기능은 깊은 곳에

### 예정 기능 (우선순위)
1. 읽기 알림 (Web Push API)
2. 묵상 메모 (일차별 개인 노트)
3. 연속 읽기 스트릭
4. 공유하기 (Web Share API)
5. 읽기 통계 (월별 달력 히트맵)
6. 북마크
