# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

아이의 일상 기록을 통해 발달 상태를 분석하고 맞춤형 가이드를 제공하는 AI 기반 성장 트래커 앱. Next.js 15 정적 내보내기(SSG) + Capacitor 기반 PWA/안드로이드 하이브리드 앱.

## 명령어

```bash
# 개발 서버
npm run dev

# 빌드 (정적 내보내기 → out/ 디렉토리)
npm run build

# 린트
npm run lint

# 단위 테스트 (Vitest)
npm run test

# 단위 테스트 커버리지
npm run test:coverage

# E2E 테스트 (Playwright) — 빌드된 out/ 디렉토리 필요
npm run build && npm run test:e2e

# 단일 테스트 파일 실행
npx vitest run src/__tests__/store.test.ts
```

## 아키텍처

### 빌드 모드: 정적 내보내기 + API 분리

`next.config.mjs`에 `output: 'export'`가 설정되어 있어 **정적 HTML/JS로만 빌드**된다.

- **결과**: API Route(`/api/*`)는 정적 빌드에 포함되지 않음
- **해결책**: API는 별도 Vercel 배포가 필요하거나, `NEXT_PUBLIC_API_URL` 환경변수로 외부 API URL 지정
- **데모 모드**: `ANTHROPIC_API_KEY`가 없으면 API 라우트가 프리셋 응답으로 자동 fallback

### 상태 관리: Zustand + localStorage

`src/store/useStore.ts`가 앱 전체 상태의 단일 진실 원천.

- `persist` 미들웨어로 `growth-tracker-storage` 키에 localStorage 자동 저장
- `safeLocalStorage()` 래퍼를 사용하여 Safari 프라이빗 모드/쿼터 초과 등에서도 앱 정상 동작
- 다자녀 지원: `children[]` 배열 + `activeChildId`로 활성 아이 관리, `allActivities[childId]` 구조로 활동 분리

### 앱 플로우

```
page.tsx
  └─ onboardingComplete?
       ├─ false → OnboardingFlow (3단계: 아이정보 → 기질 → 검사결과)
       └─ true  → MainApp (하단 탭: 홈/리포트/추천/추이)
```

온보딩 완료 시 `completeOnboarding()`이 샘플 데이터를 자동 생성하여 빈 상태 없이 즉시 앱 사용 가능.

### AI 분석 레이어

두 API 라우트 모두 동일한 패턴:
1. `ANTHROPIC_API_KEY` 있으면 Claude API 호출
2. 실패하거나 키 없으면 하드코딩된 프리셋 데이터로 fallback
3. `/api/analyze`: `claude-3-haiku-20240307` (비용 절감)
4. `/api/recommend`: `claude-3-5-sonnet-20240620` (품질 우선)

발달 평가는 K-DST(한국 영유아 발달검사) 기준 적용, 5대 영역으로 점수화: `verbalComprehension`, `visualSpatial`, `fluidReasoning`, `workingMemory`, `processingSpeed`.

### 테스트 범위

- **단위 테스트** (`src/__tests__/`): `src/lib/**`, `src/types/**`, `src/store/**` 커버리지 측정
- **E2E 테스트** (`e2e/`): Playwright, 빌드된 `out/`을 `npx serve`로 서빙하여 실행

### 환경변수

| 변수 | 용도 | 필수 여부 |
|------|------|-----------|
| `ANTHROPIC_API_KEY` | Claude AI 분석 활성화 | 선택 (없으면 프리셋 fallback) |
| `NEXT_PUBLIC_API_URL` | API 서버 베이스 URL | 선택 (Vercel 분리 배포 시) |
| `NEXT_PUBLIC_ENABLE_SAMPLE_DATA` | 샘플 데이터 활성화 | 선택 (기본: `true`) |

### Capacitor (안드로이드)

`capacitor.config.ts`에서 `webDir: 'out'` 설정. `npm run build` 후 Capacitor 빌드 가능.

## 코드 패턴

- `@/` 경로 alias가 `src/` 를 가리킴 (`tsconfig.json`, `vitest.config.ts` 모두 동일)
- 차트 컴포넌트(`recharts`)는 lazy loading으로 번들 최적화
- 모든 API 라우트는 입력 검증 → AI 호출 시도 → 프리셋 fallback 순서를 따름
- `src/lib/affiliate.ts`에서 쿠팡 파트너스 링크 동적 생성 (`generateCoupangLink()`)
