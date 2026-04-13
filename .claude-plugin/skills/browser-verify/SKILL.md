---
name: browser-verify
description: LOA 앱에서 기능을 구현하거나 버그를 수정하거나 컴포넌트/라우트/API를 변경한 후 브라우저로 검증할 때 사용. "브라우저 검증", "브라우저로 확인", "화면 확인", "UI 테스트" 또는 src/ 파일 수정 후 자동으로 적용.
version: 1.0.0
---

# LOA 브라우저 검증 스킬

src/ 파일을 수정한 후에는 반드시 이 절차대로 브라우저 검증을 수행한다.

## 검증 절차

### 1. 브라우저 도구 로드 및 탭 준비

```
ToolSearch("select:mcp__claude-in-chrome__tabs_context_mcp") 로 탭 컨텍스트 도구 로드
→ mcp__claude-in-chrome__tabs_context_mcp() 호출
→ 기존 MCP 탭 재사용 또는 tabs_create_mcp로 새 탭 생성
```

### 2. 콘솔 추적 초기화

페이지 이동 전에 반드시 콘솔/네트워크 추적을 시작한다:
- `mcp__claude-in-chrome__read_console_messages(clear=true)` — 이전 메시지 초기화
- `mcp__claude-in-chrome__read_network_requests(clear=true)` — 이전 요청 초기화

### 3. 관련 페이지로 이동

수정된 파일 기준으로 검증할 URL을 결정한다:

| 수정 위치 | 검증 URL |
|-----------|----------|
| `routes/index.tsx`, `CharacterSearchForm` | `http://localhost:5173/` |
| `routes/char/`, `CharacterHeader`, `CharacterSidebar`, `tabs/*` | `http://localhost:5173/char/rhehfl0101` |
| `routes/stats/`, `StatsChart` | `http://localhost:5173/stats` |
| `components/header.tsx` | 모든 페이지 |
| 여러 곳 수정 | 위 URL 전부 |

```
mcp__claude-in-chrome__navigate(url=<결정된 URL>, tabId=<탭ID>)
```

### 4. 페이지 로드 후 콘솔 에러 확인

```
mcp__claude-in-chrome__read_console_messages(onlyErrors=true, pattern="error|Error|TypeError|Cannot")
```

에러가 없으면 ✅, 에러가 있으면 내용을 캡처해서 즉시 분석.

### 5. 스크린샷으로 시각 확인

```
mcp__claude-in-chrome__computer(action="screenshot")
```

레이아웃 깨짐, 빈 화면, "Something went wrong" 등 확인.

### 6. 캐릭터 페이지라면 4개 탭 전부 클릭 확인

`/char/` 관련 변경 시 반드시 모든 탭을 클릭해서 에러 여부 확인:
- 장비 탭 → 스크린샷
- 각인 탭 → 스크린샷
- 보석 탭 → 스크린샷
- 스킬 탭 → 스크린샷

각 탭 클릭 후 "Something went wrong" 또는 콘솔 에러 확인.

### 7. 네트워크 요청 확인

```
mcp__claude-in-chrome__read_network_requests(urlPattern="/api/")
```

실패한 API 요청(4xx/5xx)이 있으면 원인 분석.

### 8. 검증 결과 보고

검증 완료 후 다음 형식으로 보고:

```
✅ 브라우저 검증 완료
- 검증 URL: ...
- 콘솔 에러: 없음 / [에러 내용]
- 시각 확인: 정상 / [문제 내용]
- 네트워크: 정상 / [실패 요청]
```

에러가 발견되면 즉시 수정하고 재검증한다.

## 주의사항

- 개발 서버(`npm run dev`)가 실행 중이어야 한다 (포트 5173)
- 캐시 데이터 사용으로 API 호출이 없을 수 있음 — 정상
- Supabase에서 데이터를 가져오면 CDN 이미지 요청이 함께 발생 — 정상
- TanStack Router Devtools 버튼은 무시
