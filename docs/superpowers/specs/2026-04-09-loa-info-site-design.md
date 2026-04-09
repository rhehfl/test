# Lost Ark 정보 사이트 — Phase 1 설계

## 개요

로아와/일로아와 유사한 Lost Ark 캐릭터 정보 사이트. 캐릭터 검색 후 장비/각인/보석/스킬을 확인할 수 있으며, 검색 데이터를 Supabase에 누적해 아크패시브 노드 패턴 통계를 제공한다.

---

## 페이지 구조

| 경로 | 설명 |
|------|------|
| `/` | 캐릭터 검색 홈 |
| `/char/:id` | 캐릭터 상세 페이지 (사이드바 레이아웃) |
| `/stats` | 아크패시브 통계 페이지 |

---

## 캐릭터 상세 페이지 (`/char/:id`)

### 레이아웃

- **상단 헤더**: 캐릭터 이미지, 이름, 서버, 직업, 아이템 레벨
- **왼쪽 사이드바**: 4개 탭 — 장비 / 각인 / 보석 / 스킬
- **메인 영역**: 선택된 탭 콘텐츠 (기본값: 장비)

### 사이드바 탭별 표시 내용

| 탭 | 표시 내용 |
|----|----------|
| 장비 | 무기~방어구 6종 (등급, 품질, 재련 단계, 각인석 각인 요약) |
| 각인 | 활성 각인 목록 + 레벨 |
| 보석 | 보석 목록 (레벨, 종류, 연결 스킬) |
| 스킬 | 스킬 레벨, 트라이포드, 룬 |

---

## API 레이어

### 추가할 엔드포인트 (`src/api/`)

```
getCharacterEquipment.ts     → GET /armories/characters/:name/equipment
getCharacterEngravings.ts    → GET /armories/characters/:name/engravings
getCharacterGems.ts          → GET /armories/characters/:name/gems
getCharacterSkills.ts        → GET /armories/characters/:name/combat-skills
```

기존 `getCharacterProfile.ts`, `getCharacter.ts` 유지.

### 모델 추가 (`src/models/`)

`character.ts`에 타입 추가:
- `Equipment` — 장비 아이템 (Type, Name, Grade, Quality, Level, Tooltip 등)
- `Engraving` — 각인 (Name, Level)
- `Gem` — 보석 (Level, Name, Icon, Effects)
- `Skill` — 스킬 (Name, Level, Tripods, Rune)

### Lazy Loading 전략

탭 클릭 시 해당 API 호출. TanStack Query의 `enabled` 옵션으로 제어.

```ts
// 예시: 각인 탭 클릭 시에만 fetch
useQuery({
  queryKey: ['engravings', id],
  queryFn: () => getCharacterEngravings(id),
  enabled: activeTab === 'engravings',
})
```

---

## Supabase 스키마

### `characters` 테이블

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | uuid | PK |
| `character_name` | text | 캐릭터명 (unique) |
| `server_name` | text | 서버명 |
| `class_name` | text | 직업명 |
| `item_avg_level` | numeric | 아이템 평균 레벨 |
| `ark_passive_pattern` | text | 아크패시브 패턴 (예: "1-1-1") |
| `raw_data` | jsonb | 전체 프로필 raw JSON |
| `updated_at` | timestamptz | 마지막 업데이트 시각 |

### `character_stats` 뷰 (집계용)

```sql
SELECT
  class_name,
  ark_passive_pattern,
  COUNT(*) AS count,
  ROUND(AVG(item_avg_level), 2) AS avg_item_level
FROM characters
GROUP BY class_name, ark_passive_pattern
ORDER BY class_name, count DESC;
```

### 아크패시브 패턴 추출

`ark_passive_pattern`은 `/armories/characters/:name/profiles` 응답의 `ArkPassive` 필드에서 추출한다. 패턴은 깨달음/진화/초월 노드 포인트를 `"깨달음-진화-초월"` 형식 문자열로 정규화 (예: `"1-1-1"`, `"1-2-1"`). API 응답에 해당 필드가 없으면 `null`로 저장.

### Upsert 시점

캐릭터 상세 페이지 진입 시 프로필 API 응답 후 Supabase에 upsert (conflict on `character_name`).

---

## 통계 페이지 (`/stats`)

### 표시 내용

- 직업별 필터
- 아이템 레벨 구간 필터 (예: 1580~1600, 1600~1620, 1620+)
- 아크패시브 패턴별 사용자 수 + 비율 바 차트

### 데이터 소스

Supabase `character_stats` 뷰를 직접 쿼리 (별도 서버 불필요).

---

## 컴포넌트 구조

```
src/
  api/
    getCharacterEquipment.ts
    getCharacterEngravings.ts
    getCharacterGems.ts
    getCharacterSkills.ts
  components/
    CharacterHeader.tsx       # 상단 캐릭터 대표 정보
    CharacterSidebar.tsx      # 4탭 사이드바
    tabs/
      EquipmentTab.tsx
      EngravingsTab.tsx
      GemsTab.tsx
      SkillsTab.tsx
    StatsChart.tsx            # 아크패시브 패턴 바 차트
  lib/
    supabase.ts               # Supabase client 초기화
  models/
    character.ts              # 타입 추가
  routes/
    char/$id/index.tsx        # 리팩토링
    stats/index.tsx           # 신규
```

---

## 데이터 흐름

```
사용자 검색
  → /char/:id 진입
  → Lost Ark API: profiles (항상 fetch)
  → Supabase upsert (백그라운드, 에러 무시)
  → 탭 클릭 → 해당 API lazy fetch
```

---

## 환경 변수 추가

```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

---

## 에러 처리

- Lost Ark API 실패 시 에러 메시지 표시 (재시도 버튼)
- Supabase upsert 실패는 조용히 무시 (통계 누락만, UX 영향 없음)
- 캐릭터 미존재(404) 시 "캐릭터를 찾을 수 없습니다" 안내

---

## 디자인 시스템 & Storybook

### UI 프리미티브 추가 (`src/ui/`)

기존 `Button` 컴포넌트 외 아래 컴포넌트 추가:

| 컴포넌트 | 용도 |
|---------|------|
| `Badge` | 등급 표시 (고대/유물/영웅 등), 각인 레벨 |
| `Card` | 장비 아이템 카드, 보석 카드 |
| `ProgressBar` | 품질 수치 시각화 |
| `Tabs` | 사이드바 탭 상태 관리 |
| `Skeleton` | 로딩 상태 placeholder |

각 컴포넌트는 `*.stories.tsx`를 함께 작성해 Storybook에서 확인 가능하게 한다.

### 디자인 토큰

기존 Tailwind 커스텀 클래스(`bg-gold`, `text-text-primary` 등) 패턴 유지. 장비 등급별 색상 토큰 추가:

```
text-grade-ancient   # 고대 (노란/주황)
text-grade-relic     # 유물 (주황)
text-grade-legendary # 전설 (금)
text-grade-epic      # 영웅 (보라)
text-grade-rare      # 희귀 (파랑)
```

---

## 테스트

- 기존 Storybook/Vitest 패턴 유지
- `src/ui/` 각 컴포넌트 Story 작성 (Badge, Card, ProgressBar, Tabs, Skeleton)
- 각 탭 컴포넌트 (`EquipmentTab`, `EngravingsTab` 등) Story 작성
- `StatsChart` Story 작성
