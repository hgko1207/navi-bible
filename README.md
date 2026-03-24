# 내비따라 성경읽기 (1년3독)

2026년 내비따라 성경읽기 1년3독 앱입니다. 매일 성경 읽기 포인트와 유튜브 음원을 제공하며, 읽기 진행 상황을 관리할 수 있습니다.

## 주요 기능

- 일차별 성경읽기 포인트 및 핵심 내용 제공
- 유튜브 음원 재생 (배속 조절 지원)
- 읽기 완료 체크 및 진행률 관리
- 다크모드 지원
- 글꼴 크기 조절
- 자동 다음 일차 이동
- PWA 설치 지원 (오프라인 사용 가능)

## 기술 스택

- [Next.js 15](https://nextjs.org) (App Router)
- [TypeScript](https://www.typescriptlang.org)
- [Tailwind CSS](https://tailwindcss.com)
- PWA (Service Worker)

## 콘텐츠 현황

현재 1일차 ~ 48일차 콘텐츠가 포함되어 있습니다.

## 개발 서버 실행

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) 에서 확인할 수 있습니다.

## 빌드

```bash
npm run build
npm start
```

## 배포

Vercel을 통해 자동 배포됩니다. `main` 브랜치에 푸쉬하면 자동으로 빌드 및 배포됩니다.