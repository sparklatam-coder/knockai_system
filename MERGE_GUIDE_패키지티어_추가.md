# 패키지 티어 시스템 추가 지시서
# 기존 knock_hospital_client_solution 프로젝트에 추가

## 배경
현재 프로젝트에 플라이휠 시각화, 서브노드 체크리스트, 활동 로그가 이미 구현되어 있다.
여기에 5티어 패키지 시스템을 추가하여, 패키지에 포함되지 않은 노드는 잠금 처리하고, 업그레이드를 유도하는 구조를 만든다.

---

## 1. DB 변경 (Supabase SQL Editor에서 실행)

### 1.1 clients 테이블에 package_tier 컬럼 추가 (없는 경우)

```sql
-- 이미 package_tier 컬럼이 있으면 SKIP
-- 없으면 아래 실행:
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'clients' AND column_name = 'package_tier'
  ) THEN
    ALTER TABLE clients ADD COLUMN package_tier TEXT NOT NULL DEFAULT 'entry'
      CHECK (package_tier IN ('entry', 'basic', 'standard', 'premium', 'platinum'));
  END IF;
END $$;

-- 이미 있지만 enum 값이 다른 경우:
-- ALTER TABLE clients DROP CONSTRAINT IF EXISTS clients_package_tier_check;
-- ALTER TABLE clients ADD CONSTRAINT clients_package_tier_check 
--   CHECK (package_tier IN ('entry', 'basic', 'standard', 'premium', 'platinum'));
```

### 1.2 기존 고객 데이터 업데이트 (필요 시)

```sql
-- 기존 고객에게 패키지 할당 (예시)
-- UPDATE clients SET package_tier = 'basic' WHERE name = '노내과의원';
-- UPDATE clients SET package_tier = 'platinum' WHERE name = '에이힐동물병원';
```

---

## 2. 상수 파일 수정

### src/lib/constants.ts 에 추가 (기존 코드 하단에 append)

```typescript
// ============================================
// 패키지 티어 시스템
// ============================================

export type PackageTier = 'entry' | 'basic' | 'standard' | 'premium' | 'platinum';

export const PACKAGE_INFO: Record<PackageTier, {
  label: string;
  price: string;
  description: string;
  guarantee: string;
  color: string;
}> = {
  entry: {
    label: 'Entry',
    price: '50만원/월',
    description: '네이버 플레이스 순위 상승',
    guarantee: '순위 상승 보장 (5위 이내 미보장)',
    color: '#9E9E9E',
  },
  basic: {
    label: 'Basic',
    price: '100만원/월',
    description: '플레이스 + 블로그/카페 확장 + SNS',
    guarantee: '3개월 내 5위 이내 개런티 (미달성 시 달성까지 무료 연장)',
    color: '#2196F3',
  },
  standard: {
    label: 'Standard',
    price: '200만원/월',
    description: 'Basic + 홈페이지 + 카카오톡 + 자동화 + 리뷰 관리',
    guarantee: '5위 개런티 유지',
    color: '#4CAF50',
  },
  premium: {
    label: 'Premium',
    price: '300만원/월',
    description: 'Standard + 광고 집행 + 카드뉴스 + 재유입/업셀 트래킹',
    guarantee: '',
    color: '#FF9800',
  },
  platinum: {
    label: 'Platinum',
    price: '400만원+α',
    description: 'Premium + 콜/채팅 응대 + 신환 유입 책임',
    guarantee: '신환 유입 성과 보장 (성과 기반 인센티브)',
    color: '#E94560',
  },
};

// 각 패키지에서 접근 가능한 노드 목록
// 이 목록에 없는 노드는 "잠금(locked)" 처리
export const PACKAGE_NODE_ACCESS: Record<PackageTier, string[]> = {
  entry: [
    'awareness',       // 네이버 플레이스 순위 상승
    'cs_analytics',    // 기본 순위 리포트
  ],
  basic: [
    'awareness',       // 플레이스 + 블로그/카페 확장
    'lead_capture',    // 기본 리드 채널
    'cs_analytics',    // 월간 리포트
  ],
  standard: [
    'awareness',
    'lead_capture',    // 홈페이지, 카카오톡, 자동화
    'lead_nurture',    // 팔로업 프로세스
    'cs_support',      // 사후 관리
    'cs_community',    // 방문자 리뷰 관리 포함
    'cs_analytics',    // 주간 리포트
  ],
  premium: [
    'awareness',
    'lead_capture',
    'lead_nurture',
    'new_patient',     // 신환 획득 프로세스
    'cs_onboarding',
    'cs_upsell',       // 업셀/크로스셀
    'cs_support',
    'cs_education',    // 카드뉴스/콘텐츠
    'cs_community',
    'cs_analytics',    // 주간 + 광고 트래킹
  ],
  platinum: [
    'awareness',
    'lead_capture',
    'lead_nurture',
    'new_patient',     // 콜/채팅 응대 포함
    'cs_onboarding',
    'cs_upsell',
    'cs_support',
    'cs_education',
    'cs_community',
    'cs_analytics',
  ],
};

// 노드가 특정 패키지에서 잠금인지 확인하는 헬퍼
export function isNodeLocked(nodeKey: string, packageTier: PackageTier): boolean {
  return !PACKAGE_NODE_ACCESS[packageTier].includes(nodeKey);
}

// 해당 노드를 unlock하는 최소 패키지 티어 반환
export function getMinimumPackageForNode(nodeKey: string): PackageTier {
  const tiers: PackageTier[] = ['entry', 'basic', 'standard', 'premium', 'platinum'];
  for (const tier of tiers) {
    if (PACKAGE_NODE_ACCESS[tier].includes(nodeKey)) {
      return tier;
    }
  }
  return 'platinum';
}
```

---

## 3. 타입 수정

### 기존 Client 타입에 package_tier 추가 (이미 있으면 타입만 변경)

```typescript
// src/lib/types.ts 또는 해당 타입 파일에서
// Client 인터페이스의 package_tier 타입을 아래로 변경:
package_tier: 'entry' | 'basic' | 'standard' | 'premium' | 'platinum';
```

---

## 4. UI 컴포넌트 추가

### 4.1 PackageBadge 컴포넌트 (신규)

```
파일: src/components/PackageBadge.tsx

역할: 패키지 티어를 색상 뱃지로 표시
Props: { tier: PackageTier }
동작: PACKAGE_INFO에서 label, color 가져와서 작은 뱃지 렌더
사용처: 고객 카드, 대시보드 상단
```

### 4.2 LockedNodeOverlay 컴포넌트 (신규)

```
파일: src/components/flywheel/LockedNodeOverlay.tsx

역할: 잠금된 노드 위에 오버레이 표시
Props: { nodeKey: string, currentTier: PackageTier, onUpgradeClick: () => void }
동작:
  - 반투명 오버레이 (backdrop-blur + opacity-60)
  - 자물쇠 아이콘 (Lock icon)
  - "이 서비스는 {최소패키지} 이상에서 이용 가능합니다" 텍스트
  - "업그레이드 문의" 버튼 → onUpgradeClick 호출
```

### 4.3 UpgradeModal 컴포넌트 (신규)

```
파일: src/components/UpgradeModal.tsx

역할: 업그레이드 안내 팝업
Props: { isOpen: boolean, onClose: () => void, currentTier: PackageTier, targetTier: PackageTier, clientName: string }
동작:
  - 현재 패키지 vs 타겟 패키지 비교 표시
  - 타겟 패키지의 추가 기능 목록
  - "담당자에게 확인해주세요" + 담당자 연락처
  - 또는 inquiries 테이블에 문의 자동 저장
```

---

## 5. 기존 컴포넌트 수정

### 5.1 플라이휠 노드 카드 수정

기존 노드 카드 컴포넌트를 찾아서 (NodeCard 또는 유사한 컴포넌트), 아래 로직 추가:

```typescript
// 기존 노드 렌더링 부분에 추가
import { isNodeLocked } from '@/lib/constants';

// 컴포넌트 내부:
const locked = isNodeLocked(node.node_key, client.package_tier);

// 렌더링:
{locked ? (
  <LockedNodeOverlay
    nodeKey={node.node_key}
    currentTier={client.package_tier}
    onUpgradeClick={() => setShowUpgradeModal(true)}
  />
) : (
  // 기존 노드 내용 (상태 dot, 서브노드 등)
)}
```

### 5.2 Admin 고객 폼 수정

고객 생성/수정 폼에 패키지 선택 드롭다운 추가:

```typescript
// 기존 고객 폼에 추가
<select value={packageTier} onChange={e => setPackageTier(e.target.value)}>
  <option value="entry">Entry (50만원/월)</option>
  <option value="basic">Basic (100만원/월)</option>
  <option value="standard">Standard (200만원/월)</option>
  <option value="premium">Premium (300만원/월)</option>
  <option value="platinum">Platinum (400만원+α)</option>
</select>
```

### 5.3 Client 대시보드 수정

Client가 보는 대시보드에서:
- 잠금 노드는 LockedNodeOverlay 표시
- 잠금 노드 클릭 시 UpgradeModal 표시
- 상단에 PackageBadge 표시

---

## 6. Claude Code 실행 순서

Claude Code 터미널에서 아래 순서로 지시:

### Step 1: DB 확인
```
현재 clients 테이블에 package_tier 컬럼이 있는지 확인해줘.
없으면 entry/basic/standard/premium/platinum 5개 값을 가지는 package_tier 컬럼을 추가해줘.
기본값은 'entry'로.
```

### Step 2: 상수 추가
```
src/lib/constants.ts에 PACKAGE_INFO, PACKAGE_NODE_ACCESS, isNodeLocked, getMinimumPackageForNode를 추가해줘.
이 파일에 첨부된 지시서의 "2. 상수 파일 수정" 섹션 내용을 그대로 넣어줘.
기존 코드는 건드리지 말고 하단에 append해.
```

### Step 3: 잠금 UI
```
LockedNodeOverlay 컴포넌트를 만들어줘.
잠금된 노드 위에 반투명 오버레이 + 자물쇠 아이콘 + "이 서비스는 {패키지명} 이상에서 이용 가능합니다" 텍스트 + "업그레이드 문의" 버튼.
```

### Step 4: 플라이휠에 잠금 적용
```
기존 플라이휠 노드 카드에 isNodeLocked 체크를 추가해줘.
client.package_tier에 따라 잠금된 노드는 LockedNodeOverlay를 보여주고,
잠금 아닌 노드는 기존 그대로 보여줘.
기존 동작은 절대 변경하지 마.
```

### Step 5: 업그레이드 모달
```
UpgradeModal을 만들어줘.
잠금 노드에서 "업그레이드 문의" 클릭 시 표시.
현재 패키지 vs 필요 패키지 비교 + 담당자 연락처 표시.
inquiries 테이블이 있으면 문의 내용 자동 저장.
```

### Step 6: Admin에 패키지 관리 추가
```
Admin 고객 편집 폼에 패키지 선택 드롭다운을 추가해줘.
entry/basic/standard/premium/platinum 5개 옵션.
저장 시 clients.package_tier 업데이트.
```

### Step 7: Client 뷰에 패키지 뱃지
```
Client 대시보드 상단에 현재 패키지 뱃지를 표시해줘.
PackageBadge 컴포넌트를 만들어서 사용.
```

---

## 7. 주의사항

- **기존 코드를 절대 삭제하지 말 것** — 새 기능은 추가(append)만
- **기존 노드 렌더링 로직에는 조건부(if locked)만 감싸기** — 기존 동작 유지
- **Supabase 테이블 기존 데이터 보존** — ALTER TABLE만, DROP 절대 금지
- **package_tier가 null인 기존 레코드 처리** — DEFAULT 'entry'로 설정하되, 기존 데이터는 수동으로 업데이트
- **CSS 변수 기존 것 활용** — 새 색상은 PACKAGE_INFO에서 인라인으로 처리하거나, 기존 CSS 변수 시스템에 맞춰 추가
