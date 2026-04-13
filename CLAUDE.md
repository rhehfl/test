# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev           # Vite dev server (with proxy to Lost Ark API)
npm run build         # tsc -b && vite build
npm run lint          # ESLint
npm run preview       # Preview production build
npm run storybook     # Storybook dev server on port 6006
npm run build-storybook
npx vitest            # Run tests (Storybook stories via Playwright/Chromium)
npx vitest --project storybook  # Run only Storybook tests
```

## Environment

`.env` 파일에 Lost Ark API 키가 필요합니다:

```
VITE_LOA_API_KEY=Bearer <your-api-key>
```

## Architecture

**Lost Ark 캐릭터 검색 앱** — React 19 + TypeScript + Vite

### 라우팅 (TanStack Router, file-based)

`src/routes/` 폴더 구조가 URL 경로와 1:1 매핑됩니다. `routeTree.gen.ts`는 자동 생성 파일이므로 직접 수정하지 않습니다. 라우트 파일을 추가/삭제하면 dev 서버가 자동으로 재생성합니다.

- `__root.tsx` — 전역 레이아웃. `Header` + `QueryClientProvider` + `Outlet`
- `index.tsx` — `/` 홈 (캐릭터 검색 폼)
- `char/$id/index.tsx` — `/char/:id` 캐릭터 상세 페이지

동적 세그먼트는 `$변수명` 파일명으로 정의하고, `Route.useParams()`로 접근합니다.

### API 레이어

모든 API 호출은 `src/lib/fetcher.ts`를 통해 이루어집니다. `fetcher`는 `/api` 프리픽스를 붙이고 `VITE_LOA_API_KEY` 인증 헤더를 자동으로 추가합니다.

Vite dev 서버에서 `/api/*` 요청은 `https://developer-lostark.game.onstove.com`으로 프록시됩니다.

```
src/api/getCharacter.ts          → GET /characters/:name/siblings
src/api/getCharacterProfile.ts   → GET /armories/characters/:name/profiles
```

API 응답 타입은 `src/models/character.ts`에 정의되어 있습니다 (`Character`, `CharacterProfile`).

### 컴포넌트 구조

- `src/ui/` — 순수 UI 프리미티브 (디자인 시스템). Storybook stories는 이 폴더에 함께 위치 (`*.stories.tsx`)
- `src/components/` — 비즈니스 로직이 포함된 컴포넌트

**규칙: 1 파일 = 1 컴포넌트.** 각 `.tsx` 파일에는 하나의 컴포넌트만 정의합니다. 페이지 내 서브 컴포넌트도 반드시 별도 파일로 분리하세요. (헬퍼 함수·타입은 같은 파일에 두어도 됩니다.)

`Button` 컴포넌트는 `variant` (`primary`, `ghost`, `surface`, `danger`, `link`)와 `size` (`sm`, `md`, `lg`, `icon`) prop을 지원합니다. 디자인 토큰은 Tailwind 커스텀 클래스(`bg-gold`, `text-text-primary` 등)로 표현됩니다.

### 데이터 페칭

TanStack Query를 사용합니다. `QueryClient`는 `__root.tsx`에서 한 번 생성되어 전체 앱에 제공됩니다.

### 테스트

Storybook stories가 곧 Vitest 테스트입니다. `@storybook/addon-vitest`를 통해 Playwright Chromium 브라우저에서 실행됩니다.

## Git 컨벤션

브랜치 네이밍: `feat/작업내용`, `fix/작업내용`, `refactor/...`, `style/...`, `docs/...`, `chore/...`, `test/...`

커밋 메시지: `타입: 작업 내용` (예: `feat: 캐릭터 상세 페이지 추가`)

**기능 단위 커밋:** 하나의 커밋에 하나의 기능/수정만 포함합니다. 여러 독립적인 변경이 있을 경우 반드시 별도 커밋으로 분리하세요.

- 새 기능 추가 → `feat:` 커밋 1개
- 타입 분리·리팩터 → `refactor:` 커밋 1개 (기능 커밋과 혼재 금지)
- 규칙·설정 변경 → `chore:` 또는 `docs:` 커밋 1개

예시 — 잘못된 방식:
```
feat: 젬파고 추가 + 타입 models로 이동 + CLAUDE.md 규칙 추가
```
예시 — 올바른 방식:
```
feat: 젬파고 화면인식 계산기 추가
refactor: 젬 공통 타입 src/models/gem.ts로 분리
docs: 1파일 1컴포넌트·기능단위 커밋 규칙 추가
```
