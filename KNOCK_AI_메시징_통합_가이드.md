# KNOCK AI 카카오톡 메시징 시스템 — 통합 가이드

> knockai_system 레포에 카카오 알림톡/친구톡 메시징 기능을 추가하기 위한 구현 가이드.
> Claude Code에서 이 문서를 참고하여 작업할 것.

---

## 1. 프로젝트 컨텍스트

### 비즈니스 목적

KNOCK AI는 병원 마케팅 대행 서비스(월 150만원)를 제공한다.
기존에는 네이버 플레이스 SEO 중심이었고, 여기에 **카카오톡 기반 환자 리텐션 시스템**을 추가한다.

핵심 흐름:
1. 덴트웹(치과 전자차트)에서 환자 데이터 CSV 내보내기
2. KNOCK AI 시스템에 업로드
3. 솔라피 API로 카카오 알림톡/친구톡 자동 발송
4. 랜딩페이지에서 카카오 채널 추가 유도
5. 채널 친구 대상 마케팅 캠페인 운영

### 카카오 메시지 유형 정리

| 유형 | 대상 | 용도 | 비용(건당) |
|------|------|------|-----------|
| 알림톡 | 번호만 있으면 발송 가능 | 정보성만 (예약확인, 리마인더) | ~8원 |
| 친구톡 | 채널 친구만 | 광고/마케팅 가능 | ~15-25원 |
| 브랜드메시지 | 마케팅 수신동의자 | 친구톡 대체 (2025.5 출시) | 차등 |

**주의**: 알림톡 본문에 채널 추가 유도 문구 직접 작성 시 검수 반려됨.
"채널추가형" 템플릿 유형을 사용하면 카카오가 하단에 자동으로 채널 추가 체크박스를 넣어줌.

**신고 리스크**: 이용자 신고 다수 접수 시 소명 불가, 사업자등록번호 기준 영구 차단 가능.
→ 반드시 분할 발송 (최근 환자부터 순차적으로).

---

## 2. 기존 코드베이스 구조

```
knockai_system/
├── src/
│   ├── app/
│   │   ├── admin/clients/[id]/page.tsx    ← 고객사 상세 (여기에 메시징 탭 추가)
│   │   ├── dashboard/page.tsx             ← 고객용 대시보드
│   │   ├── api/                           ← API routes
│   │   └── globals.css                    ← CSS 변수 정의
│   ├── components/
│   │   ├── admin/client-detail-view.tsx    ← 핵심 수정 파일 (탭 전환 추가)
│   │   ├── layout/dashboard-shell.tsx
│   │   ├── layout/GlobalNav.tsx
│   │   └── ui/                            ← shadcn/ui 컴포넌트
│   ├── hooks/
│   │   ├── use-auth.ts
│   │   ├── use-client-detail.ts
│   │   └── use-clients.ts
│   ├── lib/
│   │   ├── supabase.ts                    ← Supabase 브라우저 클라이언트
│   │   ├── supabase-server.ts
│   │   ├── constants.ts                   ← NODE_META, PACKAGE_INFO 등
│   │   └── types.ts                       ← Client, NodeRecord 등 타입
│   └── types/
├── middleware.ts                           ← 라우트 보호 (admin/dashboard/map)
└── tailwind.config.ts
```

### 핵심 패턴

- **App Router** (`/app` 폴더)
- **DashboardShell** 래핑: `ProtectedRoute > DashboardShell > ViewComponent`
- **CSS 변수**: `--bg`, `--card`, `--card2`, `--text`, `--tsub`, `--tdim`, `--border`, `--gP`(blue), `--gW`(amber), `--gG`(green)
- **상태 색상**: `--status-active`(green), `--status-progress`(amber), `--status-inactive`(gray)
- **클래스 패턴**: `apple-info-card`, `apple-seg`, `apple-seg-btn`, `apple-section`, `apple-log-card` 등
- **인증**: Supabase Auth, role = `super_admin | admin | client | guest`
- **Supabase**: `@supabase/ssr`, `getSupabaseBrowserClient()`

---

## 3. 추가할 파일 목록

### 3-1. 새로 생성할 파일

```
src/
├── components/
│   └── messaging/
│       └── messaging-view.tsx          ← 메시징 전체 UI (이미 생성됨)
├── hooks/
│   └── use-messaging.ts               ← 솔라피 API + Supabase 데이터 hook
├── app/
│   └── api/
│       └── messaging/
│           ├── send/route.ts           ← 솔라피 알림톡/친구톡 발송
│           ├── templates/route.ts      ← 템플릿 CRUD
│           ├── campaigns/route.ts      ← 캠페인 CRUD
│           ├── patients/route.ts       ← 환자 CSV 업로드/조회
│           └── history/route.ts        ← 발송 이력 조회
```

### 3-2. 수정할 파일

```
src/components/admin/client-detail-view.tsx   ← 탭 전환 UI 추가 (이미 부분 수정됨)
middleware.ts                                  ← (필요 시) /api/messaging 보호
```

---

## 4. client-detail-view.tsx 수정 사항

### 4-1. import 추가 (완료)

```tsx
import { MessagingView } from "@/components/messaging/messaging-view";
```

### 4-2. state 추가 (완료)

```tsx
const [activeView, setActiveView] = useState<"marketing" | "messaging">("marketing");
```

### 4-3. 탭 전환 UI 삽입 위치

고객 정보 `</section>` 닫힌 직후, 노드 카드 `<section>` 시작 전에 삽입.

```tsx
      </section>  {/* 고객 정보 카드 끝 */}

      {/* ── View Toggle: 마케팅 현황 | 메시징 ── */}
      <section style={{ marginBottom: 4 }}>
        <div className="apple-seg" style={{ display: "inline-flex" }}>
          <button type="button"
            className={`apple-seg-btn${activeView === "marketing" ? " apple-seg-active" : ""}`}
            onClick={() => setActiveView("marketing")}
            style={activeView === "marketing" ? { background: "var(--accent-bg)", color: "var(--gP)", borderColor: "var(--accent-border)" } : {}}
          >
            {activeView === "marketing" && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--gP)", display: "inline-block" }} />}
            마케팅 현황
          </button>
          <button type="button"
            className={`apple-seg-btn${activeView === "messaging" ? " apple-seg-active" : ""}`}
            onClick={() => setActiveView("messaging")}
            style={activeView === "messaging" ? { background: "var(--accent-bg)", color: "var(--gP)", borderColor: "var(--accent-border)" } : {}}
          >
            {activeView === "messaging" && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--gP)", display: "inline-block" }} />}
            💬 메시징
          </button>
        </div>
      </section>

      {/* ── Messaging View ── */}
      {activeView === "messaging" && (
        <section>
          <MessagingView clientId={clientId} clientName={data.client.name} />
        </section>
      )}

      {/* ── Marketing View (기존 코드) ── */}
      {activeView === "marketing" && (
        <>
          <section className="apple-node-grid">
            {/* ... 기존 노드 카드 코드 전체 ... */}
          </section>

          <section>
            {/* ... 기존 전체 활동 로그 코드 ... */}
          </section>
        </>
      )}

      {/* ── Global save toast (marketing only) ── */}
```

**핵심**: 기존 `<section className="apple-node-grid">` ~ `</section>` (활동 로그 포함)을
`{activeView === "marketing" && (<> ... </>)}` 로 감싸야 함.

### 4-4. 현재 JSX 수정 필요 사항

현재 코드에서 `{activeView === "marketing" && (` 뒤에 `<section>` 이 바로 나오는데,
activity log `</section>` 뒤의 `</>` 와 `)}` 가 올바르게 닫히도록 수정 필요.

**수정 전 (현재 상태, 컴파일 에러):**
```tsx
      {activeView === "marketing" && (
      <section className="apple-node-grid">
        ...
      </section>

      <section>  {/* activity log */}
        ...
      </section>
      </>
      )}
```

**수정 후 (올바른 형태):**
```tsx
      {activeView === "marketing" && (
        <>
          <section className="apple-node-grid">
            ...
          </section>

          <section>  {/* activity log */}
            ...
          </section>
        </>
      )}
```

→ `(` 뒤에 `<>` fragment 를 열고, 두 section을 감싼 뒤 `</>` 로 닫고 `)}` 로 종료.

---

## 5. Supabase 테이블 설계

### messaging_patients
```sql
CREATE TABLE messaging_patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  last_visit DATE,
  treatment TEXT,
  is_channel_friend BOOLEAN DEFAULT FALSE,
  patient_group TEXT, -- '6m', '1y', '2y', '2y+'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(client_id, phone)
);
```

### messaging_templates
```sql
CREATE TABLE messaging_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'alimtalk', 'friendtalk'
  subtype TEXT, -- '채널추가형', '기본형', '이미지형'
  status TEXT DEFAULT 'draft', -- 'draft', 'review', 'approved', 'rejected'
  body TEXT NOT NULL,
  button_name TEXT,
  button_url TEXT,
  solapi_template_id TEXT, -- 솔라피 검수 후 발급되는 ID
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### messaging_campaigns
```sql
CREATE TABLE messaging_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  template_id UUID REFERENCES messaging_templates(id),
  type TEXT NOT NULL, -- 'alimtalk', 'friendtalk'
  target_group TEXT, -- 'all', '6m', '1y', '2y', '2y+', 'friends'
  target_count INTEGER DEFAULT 0,
  scheduled_at TIMESTAMPTZ,
  status TEXT DEFAULT 'draft', -- 'draft', 'scheduled', 'sending', 'sent', 'cancelled'
  wave INTEGER, -- 분할 발송 차수 (1,2,3,4)
  sent_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  fail_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### messaging_logs
```sql
CREATE TABLE messaging_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES messaging_campaigns(id),
  patient_id UUID REFERENCES messaging_patients(id),
  type TEXT NOT NULL, -- 'alimtalk', 'friendtalk', 'sms'
  template_name TEXT,
  status TEXT NOT NULL, -- 'success', 'sms_fallback', 'fail'
  solapi_message_id TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW()
);
```

### RLS 정책

```sql
-- admin만 모든 레코드 접근
ALTER TABLE messaging_patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE messaging_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE messaging_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE messaging_logs ENABLE ROW LEVEL SECURITY;

-- client는 자기 client_id 레코드만 읽기
CREATE POLICY "clients_read_own" ON messaging_patients
  FOR SELECT USING (
    client_id = (SELECT id FROM clients WHERE auth_user_id = auth.uid())
  );
-- (templates, campaigns, logs도 동일 패턴)
```

---

## 6. 솔라피 API 연동

### 환경변수

```env
SOLAPI_API_KEY=NCSA...
SOLAPI_API_SECRET=...
SOLAPI_PFID=KA01PF...         # 카카오 채널 PFID
SOLAPI_SENDER_NUMBER=031...   # 발신번호
```

### API Route: /api/messaging/send/route.ts

```typescript
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { to, templateId, variables, type, pfId } = await req.json();

  const message: any = {
    to,
    from: process.env.SOLAPI_SENDER_NUMBER,
  };

  if (type === "alimtalk") {
    message.kakaoOptions = {
      pfId: pfId || process.env.SOLAPI_PFID,
      templateId,
      variables,
    };
  } else if (type === "friendtalk") {
    message.kakaoOptions = {
      pfId: pfId || process.env.SOLAPI_PFID,
      // imageId, buttons 등 추가
    };
  }

  const response = await fetch("https://api.solapi.com/messages/v4/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.SOLAPI_API_KEY}`,
    },
    body: JSON.stringify({ message }),
  });

  const data = await response.json();
  return NextResponse.json(data);
}
```

### 대량 발송 (캠페인)

```typescript
// /api/messaging/campaigns/send/route.ts
// 솔라피는 대량 발송 API도 지원
// POST https://api.solapi.com/messages/v4/send-many
// body: { messages: [{ to, from, kakaoOptions }, ...] }
```

---

## 7. 분할 발송 전략

기존 환자 2,000명에게 정기검진 안내를 보낼 때:

```
환자 그룹 분류 (최종내원일 기준):
- 6m:  최근 6개월 이내 내원
- 1y:  6개월 ~ 1년
- 2y:  1년 ~ 2년
- 2y+: 2년 이상 미내원

발송 스케줄:
1차 (6m)  → 즉시 발송 → 2일 대기 → 신고율 확인
2차 (1y)  → 1차 문제없으면 발송 → 2일 대기
3차 (2y)  → 2차 문제없으면 발송 → 2일 대기
4차 (2y+) → 3차 결과 보고 결정 (LMS 전환 고려)
```

그룹 분류 로직 (CSV 업로드 시 자동 분류):
```typescript
function classifyPatientGroup(lastVisit: string): string {
  const months = (Date.now() - new Date(lastVisit).getTime()) / (1000 * 60 * 60 * 24 * 30);
  if (months <= 6) return "6m";
  if (months <= 12) return "1y";
  if (months <= 24) return "2y";
  return "2y+";
}
```

---

## 8. 알림톡 템플릿 (검수용)

### 정기검진 안내 (채널추가형)

```
[#{병원명}] 정기 검진 안내

#{고객명}님, 안녕하세요.
마지막 내원일(#{진료일})로부터 시간이 경과하여
정기 검진 안내드립니다.

치과 정기검진은 6개월 주기를 권장합니다.

※ 진료 후 관리사항 및 예약은
아래 버튼을 확인해주세요.

[버튼: 관리사항 확인하기 → knockai.click/{병원}/care]
[카카오 자동삽입: 채널 추가하고 마케팅 메시지 받기]
```

### 진료완료 안내 (채널추가형)

```
[#{병원명}] 진료 완료 안내

#{고객명}님, 오늘 진료가 완료되었습니다.

◾ 진료일: #{진료일}
◾ 진료내용: #{진료내용}
◾ 다음 예약: #{다음예약일}

※ 진료 후 주의사항은 아래 버튼을 확인해주세요.

[버튼: 진료 후 주의사항 → knockai.click/{병원}/aftercare]
[카카오 자동삽입: 채널 추가하고 마케팅 메시지 받기]
```

### 예약 리마인더 (기본형)

```
[#{병원명}] 예약 안내

#{고객명}님, 내일 예약이 있습니다.

◾ 일시: #{예약일시}
◾ 담당: #{담당의}

변경이 필요하시면 아래 버튼을 눌러주세요.

[버튼: 예약 변경/취소 → knockai.click/{병원}/cancel]
```

---

## 9. 랜딩페이지 구조

`knockai.click/{병원slug}/care` 에 만들 페이지:

```
시술별 주의사항 (진짜 유용한 정보)
  ↓
카카오 채널 추가 버튼 (CTA)
  ↓
네이버 플레이스 리뷰 유도
  ↓
다음 예약 캘린더 추가
  ↓
온라인 예약 폼
```

카카오 검수 대상은 알림톡 템플릿 내용만이고, 링크된 페이지는 검수 대상이 아님.
→ 랜딩페이지에서 자유롭게 채널 추가 유도, 리뷰 유도, 이벤트 안내 가능.

---

## 10. 채널 친구 성장 → 마케팅 전환 플로우

```
1단계: 알림톡으로 시작 (번호만 있으면 됨)
  - 정기검진 안내, 진료완료 안내, 리마인더
  - "채널추가형" 템플릿으로 자연스럽게 친구 전환

2단계: 채널 친구 확보 (전환율 15~25% 예상)
  - 2,000명 발송 → 300~500명 채널 친구

3단계: 친구 대상 마케팅 (친구톡)
  - 월 2회 건강 정보 콘텐츠
  - 이벤트 (친구소개 "친구야 괜찮아?")
  - 시술 프로모션, 재방문 쿠폰

4단계: 자동화 확대
  - 정기검진 6개월 자동 알림톡
  - 내원 7일 후 경과 확인
  - 30일 미방문 재방문 유도
```

**메시징 주기 권장**: 월 2회 정기 + 이벤트 시 1~2회 추가.
주 1회 이상은 채널 차단율 급등.

---

## 11. 비용 구조

| 항목 | 비용 |
|------|------|
| 솔라피 기본료 | 무료 (종량제) |
| 알림톡 건당 | ~8원 |
| 친구톡 건당 | ~15~25원 |
| SMS fallback 건당 | ~20원 |
| 1회차 2,000명 발송 | ~16,000원 (알림톡) |
| 월 친구톡 2회 × 500명 | ~20,000원 |
| **월 운영비 합계** | **약 3~5만원** |

치과 월 150만원 과금 대비 메시징 실비는 5만원 미만 → 마진 확보.

---

## 12. 실행 체크리스트

### Phase 1: 인프라 세팅 (1주)
- [ ] 솔라피 가입 + API Key 발급
- [ ] 양주이지치과 카카오톡 채널 개설 + 비즈니스 인증
- [ ] 솔라피에 카카오 채널 연동 (PFID 발급)
- [ ] 알림톡 템플릿 3종 등록 + 검수 요청

### Phase 2: 코드 구현 (2주)
- [ ] Supabase 테이블 4개 생성 (patients, templates, campaigns, logs)
- [ ] `messaging-view.tsx` 컴포넌트 완성 (Mock → Supabase 연동)
- [ ] `client-detail-view.tsx` 탭 전환 JSX 수정 마무리
- [ ] API routes 구현 (send, templates, campaigns, patients, history)
- [ ] CSV 업로드 + 자동 그룹 분류 기능
- [ ] 랜딩페이지 `/app/(landing)/{병원slug}/care/page.tsx`

### Phase 3: 파일럿 (1주)
- [ ] 양주이지치과 환자 CSV 업로드
- [ ] 분할 발송 1차 (최근 6개월 환자)
- [ ] 신고율 확인 → 2~4차 순차 발송
- [ ] 채널 친구 전환율 측정

### Phase 4: 마케팅 시작 (지속)
- [ ] 첫 친구톡 캠페인 발송
- [ ] 월간 건강 콘텐츠 템플릿 세트 제작
- [ ] 친구소개 이벤트 랜딩페이지 개발
- [ ] 노내과, 아이힐동물병원에 동일 구조 복제
