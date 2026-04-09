# Lost Ark 정보 사이트 — 구현 계획

스펙: `docs/superpowers/specs/2026-04-09-loa-info-site-design.md`

---

## 단계 1 — 디자인 시스템 (UI 프리미티브)

> `src/ui/` — 비즈니스 로직 없는 순수 UI 컴포넌트. Storybook Story 포함.

- [ ] `Badge` — variant prop (고대/유물/전설/영웅/희귀/일반), `Badge.stories.tsx`
- [ ] `Card` — 장비/보석 카드 래퍼, `Card.stories.tsx`
- [ ] `ProgressBar` — value/max prop, 품질 수치용, `ProgressBar.stories.tsx`
- [ ] `Tabs` — items/activeTab/onChange prop, `Tabs.stories.tsx`
- [ ] `Skeleton` — 로딩 placeholder (width/height prop), `Skeleton.stories.tsx`
- [ ] `tailwind.config` — 등급 색상 토큰 추가 (`text-grade-ancient` 등 5종)

---

## 단계 2 — Supabase 셋업

> Supabase 프로젝트 생성 및 스키마 초기화.

- [ ] Supabase 프로젝트 생성 (supabase.com)
- [ ] `characters` 테이블 생성 SQL 실행
- [ ] `character_stats` 뷰 생성 SQL 실행
- [ ] `src/lib/supabase.ts` — Supabase client 초기화
- [ ] `.env`에 `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` 추가

---

## 단계 3 — API 레이어 확장

> `src/api/` — Lost Ark API 엔드포인트 추가.

- [ ] `getCharacterEquipment.ts`
- [ ] `getCharacterEngravings.ts`
- [ ] `getCharacterGems.ts`
- [ ] `getCharacterSkills.ts`
- [ ] `src/models/character.ts` — Equipment, Engraving, Gem, Skill 타입 추가

---

## 단계 4 — 캐시 레이어

> `src/lib/fetchAndCache.ts` — Supabase 캐시 우선 로직.

- [ ] `getCharacterFromCache(name)` — Supabase 조회
- [ ] `saveCharacterToCache(name, data)` — Supabase upsert
- [ ] `fetchAllCharacterData(name)` — API 4종 병렬 호출 후 캐시 저장
- [ ] 아크패시브 패턴 추출 유틸 함수

---

## 단계 5 — 캐릭터 상세 페이지 리팩토링

> `src/routes/char/$id/index.tsx` + 신규 컴포넌트.

- [ ] `CharacterHeader.tsx` — 이미지, 이름, 직업, 아이템 레벨, updated_at, 새로고침 버튼
- [ ] `CharacterSidebar.tsx` — Tabs 컴포넌트 사용, 4탭
- [ ] `EquipmentTab.tsx` — Card + Badge + ProgressBar 사용
- [ ] `EngravingsTab.tsx` — Badge 사용
- [ ] `GemsTab.tsx` — Badge 사용
- [ ] `SkillsTab.tsx` — 스킬 레벨, 트라이포드
- [ ] `char/$id/index.tsx` 리팩토링 — 캐시 우선 로직 연결, Skeleton 로딩

---

## 단계 6 — 통계 페이지

> `src/routes/stats/index.tsx` + `StatsChart.tsx`.

- [ ] `StatsChart.tsx` — 바 차트 (직업별 아크패시브 패턴 분포), `StatsChart.stories.tsx`
- [ ] `stats/index.tsx` — 직업 필터, 아이템 레벨 구간 필터, Supabase 뷰 쿼리
- [ ] 헤더에 `/stats` 링크 추가

---

## 단계 7 — Supabase Edge Function (데이터 시딩)

> `supabase/functions/collect-rankings/`

- [ ] `supabase` CLI 설치 및 로컬 초기화
- [ ] `collect-rankings/index.ts` — 랭킹 API 순회 → 캐릭터 데이터 수집 → upsert
- [ ] 레이트 리밋 딜레이 (200ms/req)
- [ ] Supabase Cron 등록 (매일 KST 04:00)
- [ ] Edge Function 배포

---

## 단계 8 — 마무리

- [ ] `queryKey` 버그 수정 (`['character', 'my']` → `['character', id]`)
- [ ] `.env.example` 업데이트
- [ ] `.gitignore`에 `.superpowers/` 추가
