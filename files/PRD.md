# PRD: KNOCK Hospital Customer Dashboard

## 1. 문제 정의

### 현재 상황
- knockhospitalmktsystem.vercel.app = 영업용 정적 설명 페이지
- 계약 후 고객이 마케팅 진행 상황을 확인할 수단 없음
- "뭘 해주는지 모르겠다" = 해지 사유 1위

### 해결 목표
- 고객별 대시보드에서 플라이휠 각 노드의 상태(회색/노랑/초록)를 실시간 확인
- 마케팅 활동은 로그로 기록하여 고객이 언제든 열람
- 패키지 미포함 노드는 잠금(Lock) 표시 → 업셀 유도

---

## 2. 사용자 역할

### Admin (Fillupwithmarketing 내부 담당자)
- 고객 생성/수정/삭제
- 노드 상태 변경 (inactive → in_progress → active)
- 활동 로그 작성 (날짜 + 카테고리 + 내용 + 첨부)
- 서브노드 체크리스트 관리
- 전체 고객 목록 및 대시보드 접근

### Client (병원 원장/담당자)
- 본인 병원 대시보드만 열람 (읽기 전용)
- 노드 클릭 시 해당 노드의 활동 로그 확인
- 잠금 노드에서 업그레이드 문의 가능
- 간단한 문의 메시지 전송

---

## 3. 플라이휠 노드 정의

### 3.1 노드 상태 체계

| 상태 | 코드 | 색상 | 의미 |
|------|------|------|------|
| 미설정 | `inactive` | 회색 #9E9E9E | 아직 시작 전 |
| 진행 중 | `in_progress` | 노랑 #F9A825 | 작업 시작됨, 완료 전 |
| 정상 운영 | `active` | 초록 #34C759 | 정상 동작 중 |
| 잠금 | `locked` | 회색+자물쇠 | 패키지 미포함 (DB에 저장하지 않음, package_tier로 계산) |

### 3.2 파이프라인 노드 (신규 환자 확보)

#### Node: awareness (인지 확대)
- **서브노드**: 네이버 플레이스 대표 키워드 설정, 블로그 포스팅 발행, SNS 계정 연동, 네이버 광고 세팅
- **초록 조건**: 대표 키워드 설정 완료 + 최소 1개 채널 활성화

#### Node: lead_capture (리드 획득)
- **서브노드**: 전화번호(스마트콜) 설정, 카카오톡 채널 연동, 네이버 예약 활성화, 홈페이지 폼 연동
- **초록 조건**: 최소 2개 리드 채널 활성화

#### Node: lead_nurture (리드 육성 + 유망 리드)
- **서브노드**: 팔로업 프로세스 수립, 부재중 콜백 ARS 설정, 카카오 자동응답 설정
- **초록 조건**: 팔로업 프로세스 문서화 + ARS/자동응답 중 1개 이상 설정

#### Node: new_patient (신환 획득)
- **서브노드**: 내원 동선 안내 설정, 상담 스크립트 제공, 치료 동의 프로세스 점검
- **초록 조건**: 내원 안내 + 상담 프로세스 중 1개 이상 설정

### 3.3 CS 360 노드 (기존 환자 관리)

#### Node: cs_onboarding (온보딩 - 첫 48시간)
- **서브노드**: 첫 방문 감사 문자, 치료 후 주의사항 발송, 다음 예약 안내

#### Node: cs_upsell (업셀 - 추가 진료)
- **서브노드**: 추가 진료 추천 시나리오, 패키지 상품 안내

#### Node: cs_support (고객 지원 - 사후 관리)
- **서브노드**: 치료 후 케어 문자, 정기 검진 리마인더

#### Node: cs_education (건강 교육 - 콘텐츠)
- **서브노드**: 블로그 건강정보 발행, 카카오 채널 콘텐츠

#### Node: cs_community (커뮤니티 - 리뷰/소개)
- **서브노드**: 리뷰 요청 자동화, 소개 이벤트 운영

#### Node: cs_analytics (분석 - 데이터)
- **서브노드**: 월간 유입/전환 리포트, 키워드 순위 추적

---

## 4. 패키지별 노드 활성화

```typescript
export const PACKAGE_NODE_ACCESS: Record<string, string[]> = {
  basic: [
    'awareness',
    'lead_capture',
    'cs_analytics',
  ],
  standard: [
    'awareness',
    'lead_capture',
    'lead_nurture',
    'new_patient',
    'cs_support',
    'cs_community',
    'cs_analytics',
  ],
  premium: [
    'awareness',
    'lead_capture',
    'lead_nurture',
    'new_patient',
    'cs_onboarding',
    'cs_upsell',
    'cs_support',
    'cs_education',
    'cs_community',
    'cs_analytics',
  ],
};
```

---

## 5. 데이터베이스 스키마

### 5.1 clients
```sql
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,                    -- 병원명
  region TEXT,                           -- 지역 (시/구/동)
  contact_name TEXT,                     -- 담당자 이름
  contact_phone TEXT,                    -- 연락처
  contact_email TEXT,                    -- 이메일
  package_tier TEXT NOT NULL DEFAULT 'basic' CHECK (package_tier IN ('basic', 'standard', 'premium')),
  contract_start DATE,                   -- 계약 시작일
  auth_user_id UUID REFERENCES auth.users(id), -- Client 로그인 계정
  memo TEXT,                             -- Admin 내부 메모
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 5.2 nodes
```sql
CREATE TABLE nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  node_key TEXT NOT NULL,                -- awareness, lead_capture, lead_nurture, new_patient, cs_onboarding, cs_upsell, cs_support, cs_education, cs_community, cs_analytics
  status TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('inactive', 'in_progress', 'active')),
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id),
  UNIQUE(client_id, node_key)
);
```

### 5.3 sub_nodes
```sql
CREATE TABLE sub_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  node_key TEXT NOT NULL,
  label TEXT NOT NULL,                   -- 서브노드 이름
  is_done BOOLEAN DEFAULT false,
  done_at TIMESTAMPTZ,
  sort_order INT DEFAULT 0,
  UNIQUE(client_id, node_key, label)
);
```

### 5.4 activity_logs
```sql
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  node_key TEXT NOT NULL,
  action_type TEXT NOT NULL DEFAULT 'note' CHECK (action_type IN ('status_change', 'task_complete', 'note', 'file_upload')),
  content TEXT NOT NULL,                 -- 로그 내용
  attachment_url TEXT,                   -- 첨부파일 URL (Supabase Storage)
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  visible_to_client BOOLEAN DEFAULT true
);
```

### 5.5 inquiries (Phase 2, but create table now)
```sql
CREATE TABLE inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 5.6 RLS Policies
```sql
-- Admin can do everything
CREATE POLICY admin_all ON clients FOR ALL USING (
  auth.jwt() ->> 'role' = 'admin'
  OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- Client can only read own data
CREATE POLICY client_read_own ON clients FOR SELECT USING (
  auth_user_id = auth.uid()
);

-- Same pattern for nodes, sub_nodes, activity_logs
-- activity_logs: Client can only see visible_to_client = true
CREATE POLICY client_read_logs ON activity_logs FOR SELECT USING (
  client_id IN (SELECT id FROM clients WHERE auth_user_id = auth.uid())
  AND visible_to_client = true
);
```

---

## 6. 화면 구성

### 6.1 라우팅

| 경로 | 역할 | 설명 |
|------|------|------|
| `/login` | 공용 | 이메일+비밀번호 로그인 |
| `/admin/clients` | Admin | 고객 목록 (카드 리스트) |
| `/admin/clients/:id` | Admin | 개별 고객 대시보드 (편집 가능) |
| `/dashboard` | Client | 내 대시보드 (읽기 전용) |

### 6.2 Admin: 고객 목록 (/admin/clients)

**레이아웃:**
- 상단: 검색바 + 필터(지역, 패키지) + '+ 새 고객' 버튼
- 본문: 카드 그리드 (반응형 1~3열)
- 각 카드: 병원명, 패키지 뱃지, 플라이휠 미니 상태바(10개 dot), 마지막 활동일

**'+ 새 고객' 모달:**
- 병원명 (필수)
- 지역
- 담당자 이름, 연락처, 이메일
- 패키지 선택 (Basic/Standard/Premium)
- 계약 시작일
- Client 로그인 이메일 (Supabase Auth 계정 자동 생성)
- 저장 시: clients 레코드 생성 + nodes 10개 초기 레코드 생성 + sub_nodes 기본 항목 생성

### 6.3 Admin: 고객 대시보드 (/admin/clients/:id)

**레이아웃:**
- 상단: 병원 기본정보 카드 (이름, 주소, 패키지, 계약일, 편집 버튼)
- 중앙: 플라이휠 시각화
  - 기존 knockhospitalmktsystem.vercel.app 레이아웃을 최대한 재현
  - 왼쪽: Patient Acquisition Pipeline (awareness → lead_capture → lead_nurture → new_patient)
  - 오른쪽: CS 360 (6개 노드 원형/그리드 배치)
  - 각 노드에 상태 표시 dot (색상으로 구분)
  - 잠금 노드: 반투명 + 자물쇠 아이콘
- 노드 클릭 시: 우측 슬라이드 패널 또는 하단 확장
  - 서브노드 체크리스트 (체크박스, Admin이 토글)
  - 해당 노드 활동 로그 (최신순)
  - '상태 변경' 드롭다운 (inactive/in_progress/active)
  - '로그 추가' 폼: 내용(텍스트) + 카테고리(드롭다운) + 첨부(선택) + Client 노출 여부 체크박스
- 하단: 전체 활동 로그 타임라인 (모든 노드 통합, 날짜별 그룹핑)

### 6.4 Client: 내 대시보드 (/dashboard)

**레이아웃:**
- Admin 대시보드와 동일한 플라이휠 시각화 (읽기 전용, 편집 버튼 없음)
- 노드 클릭 시: 해당 노드의 로그만 표시 (서브노드 체크리스트는 숨김)
- 잠금 노드: "이 서비스는 Standard/Premium 패키지에 포함됩니다" + 문의 버튼
- 하단: 활동 로그 타임라인 (visible_to_client = true인 것만)
- '문의하기' 플로팅 버튼: 간단한 메시지 전송 모달

---

## 7. 핵심 컴포넌트

### FlywheelVisualization
```
Props:
  - nodes: NodeWithStatus[]
  - packageTier: 'basic' | 'standard' | 'premium'
  - onNodeClick: (nodeKey: string) => void
  - isAdmin: boolean

동작:
  - 파이프라인 노드는 세로 흐름 (위→아래 화살표 연결)
  - CS 360 노드는 원장님이 익숙한 현재 사이트의 원형 배치 유지
  - 각 노드에 StatusDot 컴포넌트 (색상 원)
  - 잠금 노드: opacity-50 + Lock 아이콘 오버레이
  - 클릭 가능한 노드는 hover 효과
```

### NodeDetailPanel
```
Props:
  - nodeKey: string
  - clientId: string
  - isAdmin: boolean
  - onClose: () => void

동작:
  - 서브노드 체크리스트 (Admin만 편집)
  - 활동 로그 리스트 (최신순)
  - Admin: 상태 변경 + 로그 추가 폼
  - Client: 읽기 전용
```

### LogTimeline
```
Props:
  - logs: ActivityLog[]
  - showNodeBadge: boolean (전체 타임라인에서는 true)

동작:
  - 날짜별 그룹핑 (오늘, 어제, 이번 주, 이전)
  - 각 로그: 시간 + 노드 뱃지(색상) + action_type 아이콘 + 내용
  - 첨부파일 있으면 다운로드 링크
```

---

## 8. MVP 구현 순서 (Phase 1)

### Step 1: 프로젝트 초기화
- Vite + React + TypeScript + TailwindCSS + shadcn/ui 세팅
- Supabase 클라이언트 초기화
- 라우터 설정 (react-router-dom v6)
- 인증 컨텍스트 (AuthProvider)

### Step 2: DB + Auth
- Supabase에서 테이블 5개 생성 (위 SQL 실행)
- RLS 정책 적용
- Admin 계정 수동 생성 (user_metadata.role = 'admin')
- 로그인 페이지 구현

### Step 3: Admin 고객 관리
- 고객 목록 페이지 (CRUD)
- 고객 생성 시 nodes 10개 + sub_nodes 자동 초기화

### Step 4: 플라이휠 시각화
- FlywheelVisualization 컴포넌트
- StatusDot 컴포넌트
- 패키지별 잠금 처리

### Step 5: 노드 상세 + 로그
- NodeDetailPanel (서브노드 체크리스트 + 로그)
- 로그 추가 폼 (Admin)
- LogTimeline 컴포넌트

### Step 6: Client 대시보드
- Client 라우트 + 읽기 전용 뷰
- visible_to_client 필터링

### Step 7: 마무리
- 모바일 반응형 점검
- 에러 핸들링 + 로딩 상태
- Vercel 배포

---

## 9. 타입 정의

```typescript
// src/lib/types.ts

export type PackageTier = 'basic' | 'standard' | 'premium';
export type NodeStatus = 'inactive' | 'in_progress' | 'active';
export type ActionType = 'status_change' | 'task_complete' | 'note' | 'file_upload';

export interface Client {
  id: string;
  name: string;
  region: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  package_tier: PackageTier;
  contract_start: string | null;
  auth_user_id: string | null;
  memo: string | null;
  created_at: string;
  updated_at: string;
}

export interface NodeRecord {
  id: string;
  client_id: string;
  node_key: string;
  status: NodeStatus;
  updated_at: string;
  updated_by: string | null;
}

export interface SubNode {
  id: string;
  client_id: string;
  node_key: string;
  label: string;
  is_done: boolean;
  done_at: string | null;
  sort_order: number;
}

export interface ActivityLog {
  id: string;
  client_id: string;
  node_key: string;
  action_type: ActionType;
  content: string;
  attachment_url: string | null;
  created_by: string | null;
  created_at: string;
  visible_to_client: boolean;
}

export interface Inquiry {
  id: string;
  client_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
}
```

---

## 10. 노드 메타데이터 상수

```typescript
// src/lib/constants.ts

export const NODE_META = {
  // Pipeline
  awareness: {
    label: '인지 확대',
    emoji: '🔍',
    description: '네이버 플레이스 · 블로그 · 광고 · SNS',
    group: 'pipeline',
    order: 1,
  },
  lead_capture: {
    label: '리드 획득',
    emoji: '📋',
    description: '전화 · 카카오톡 · 네이버 예약 · 홈페이지 폼',
    group: 'pipeline',
    order: 2,
  },
  lead_nurture: {
    label: '리드 육성',
    emoji: '💬',
    description: '팔로업 · 설득 · 유망 리드 확인',
    group: 'pipeline',
    order: 3,
  },
  new_patient: {
    label: '신환 획득',
    emoji: '🏥',
    description: '내원 → 상담 → 치료 결정',
    group: 'pipeline',
    order: 4,
  },
  // CS 360
  cs_onboarding: {
    label: '온보딩',
    emoji: '🎯',
    description: '첫 48시간 관리',
    group: 'cs360',
    order: 5,
  },
  cs_upsell: {
    label: '업셀',
    emoji: '💎',
    description: '추가 진료 안내',
    group: 'cs360',
    order: 6,
  },
  cs_support: {
    label: '고객 지원',
    emoji: '🤝',
    description: '사후 관리',
    group: 'cs360',
    order: 7,
  },
  cs_education: {
    label: '건강 교육',
    emoji: '📚',
    description: '콘텐츠 제공',
    group: 'cs360',
    order: 8,
  },
  cs_community: {
    label: '커뮤니티',
    emoji: '👥',
    description: '리뷰 · 소개',
    group: 'cs360',
    order: 9,
  },
  cs_analytics: {
    label: '분석',
    emoji: '📊',
    description: '데이터 리포트',
    group: 'cs360',
    order: 10,
  },
} as const;

export type NodeKey = keyof typeof NODE_META;

export const ALL_NODE_KEYS = Object.keys(NODE_META) as NodeKey[];

export const DEFAULT_SUB_NODES: Record<string, string[]> = {
  awareness: ['네이버 플레이스 대표 키워드 설정', '블로그 포스팅 발행', 'SNS 계정 연동', '네이버 광고 세팅'],
  lead_capture: ['전화번호(스마트콜) 설정', '카카오톡 채널 연동', '네이버 예약 활성화', '홈페이지 폼 연동'],
  lead_nurture: ['팔로업 프로세스 수립', '부재중 콜백 ARS 설정', '카카오 자동응답 설정'],
  new_patient: ['내원 동선 안내 설정', '상담 스크립트 제공', '치료 동의 프로세스 점검'],
  cs_onboarding: ['첫 방문 감사 문자', '치료 후 주의사항 발송', '다음 예약 안내'],
  cs_upsell: ['추가 진료 추천 시나리오', '패키지 상품 안내'],
  cs_support: ['치료 후 케어 문자', '정기 검진 리마인더'],
  cs_education: ['블로그 건강정보 발행', '카카오 채널 콘텐츠'],
  cs_community: ['리뷰 요청 자동화', '소개 이벤트 운영'],
  cs_analytics: ['월간 유입/전환 리포트', '키워드 순위 추적'],
};

export const PACKAGE_NODE_ACCESS: Record<string, string[]> = {
  basic: ['awareness', 'lead_capture', 'cs_analytics'],
  standard: ['awareness', 'lead_capture', 'lead_nurture', 'new_patient', 'cs_support', 'cs_community', 'cs_analytics'],
  premium: ALL_NODE_KEYS as unknown as string[],
};
```
