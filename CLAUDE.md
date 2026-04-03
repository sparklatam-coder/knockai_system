# KnockAI System - 개발 가이드

## Supabase 키 구조 (절대 변경 금지)

이 프로젝트는 Supabase의 **새로운 API 키 시스템**과 **Legacy JWT 키 시스템**이 혼합된 상태입니다.
아래 구조를 반드시 유지해야 합니다.

### 환경변수 매핑

| 환경변수 | 키 형식 | 용도 | 이유 |
|---------|--------|------|------|
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_...` | 브라우저 클라이언트 | Legacy JWT 키가 비활성화되어 JWT(`eyJ...`) 형식 사용 불가. `sb_secret_`을 넣으면 브라우저에서 차단됨 |
| `SUPABASE_SERVICE_ROLE_KEY` | `sb_secret_...` | 서버 전용 (API routes) | RLS 우회 권한. 절대 `NEXT_PUBLIC_`에 넣지 말 것 |

### 2024-04 사고 경위 및 교훈

1. 기존에 스크립트에 서비스 롤 키가 하드코딩되어 git에 노출됨
2. 보안 수정 과정에서 Legacy JWT 키를 비활성화하고 새 키 체계로 전환
3. 전환 중 `NEXT_PUBLIC_SUPABASE_ANON_KEY`에 `sb_secret_` 키가 잘못 설정됨 → 브라우저에 secret 키 노출
4. JWT 형식(`eyJ...`)으로 되돌렸으나 Legacy가 비활성화된 상태라 "Legacy API keys are disabled" 에러 발생
5. 최종적으로 `sb_publishable_` 키로 설정하여 해결

### 절대 하지 말아야 할 것

- `NEXT_PUBLIC_SUPABASE_ANON_KEY`에 `sb_secret_` 값을 넣지 말 것 (브라우저에 secret 키 노출)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`에 JWT 형식(`eyJ...`) 값을 넣지 말 것 (Legacy 비활성화 상태)
- Supabase 대시보드에서 Legacy API keys를 다시 활성화하지 말 것 (보안 후퇴)
- `SUPABASE_SERVICE_ROLE_KEY`를 `NEXT_PUBLIC_` 접두사 환경변수에 절대 넣지 말 것

## 인증/권한 체계

- 역할(role)은 `app_metadata`에 저장 (user_metadata 아님 — 사용자가 직접 수정 가능하므로)
- 역할 종류: `super_admin`, `admin`, `client`
- API routes는 `getAdminRequestContext()`로 인증 + `resolveClientId()`로 소유권 검증
- 미들웨어가 `/admin/*`, `/dashboard/*`, `/map/*`, `/api/admin/*`, `/api/messaging/*` 보호

## 배포

- 호스팅: Vercel
- 프로덕션 도메인: `knockai.click`
- 배포 후 반드시 `vercel alias <배포URL> knockai.click` 실행 필요
- 환경변수는 Vercel CLI(`vercel env add`)로 관리

## 메시징 (Solapi)

- HMAC-SHA256 인증 사용
- 환경변수: `SOLAPI_API_KEY`, `SOLAPI_API_SECRET`, `SOLAPI_PFID`, `SOLAPI_SENDER_NUMBER`
- 병원별 `solapi_pfid`, `solapi_sender_number`는 clients 테이블에 저장
