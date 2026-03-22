# CHANGELOG

## 2026-03-20 — 디자인 품질 & 고객 경험 대폭 개선

### 라운드 1: 시각적 품질 개선

#### 1-1. 플라이휠 시각화 고급화
- 상태 dot에 pulse 애니메이션 추가 (초록=부드러운 pulse, 노랑=깜빡임)
- 잠금 노드: CSS 클래스 기반 blur + grayscale 처리 (`.locked-node`, `.locked-seg`)
- 잠금 노드 중앙에 큰 자물쇠 오버레이 (`LockBadge centered`)
- 파이프라인 화살표에 그라디언트 라인 추가
- 플라이휠 배경에 미세한 radial glow + float 애니메이션

#### 1-2. 카드/패널 디자인 통일
- 모든 카드 `border-radius: 16px`, `box-shadow` 통일
- 카드 내부 패딩 `20px 24px`로 통일
- 빈 상태(활동 기록 없음)에 아이콘 + 메시지 추가
- client-card에 hover 시 transform + shadow 트랜지션

#### 1-3. 타이포그래피 정리
- `font-feature-settings: "tnum"` 적용 (숫자 고정폭)
- `sec-title` 28px → 24px, `sec-desc` 중복 line-height 정리
- `apple-meta-label` 12px → 11px (캡션 일관성)

#### 1-4. 색상 시스템 정리
- 상태 색상 통일: 완료 `#34C759`, 진행중 `#F9A825`, 대기 `#9E9E9E`
- CSS 변수 `--gG` 업데이트: `#3ddc84` → `#34C759`
- 모든 컴포넌트에서 하드코딩 색상 통일

### 라운드 2: 고객 경험(UX) 개선

#### 2-1. 로그 타임라인 개선
- LogModal: 날짜별 그룹핑 (오늘/어제/이번 주/이전)
- action_type별 아이콘 추가 (📝메모, ✅완료, 🔄변경, 📎업로드)
- 대시보드 활동 로그: 노드 색상 태그, 아이콘, "더 보기" 버튼
- 빈 로그 상태 메시지 개선

#### 2-2. 잠금 노드 → 업그레이드 경험
- UpgradeModal: 문의 전송 후 토스트 알림
- 3초 후 자동 닫힘
- 전송 중 로딩 스피너

#### 2-3. 대시보드 첫인상 개선
- 요약 카드 4개 추가: 활성 노드 수, 전체 활동 기록, 현재 패키지, 마지막 업데이트
- 각 카드에 아이콘 + 숫자 강조 + 라벨

#### 2-4. 서브노드 체크리스트 UX
- 완료된 항목 하단 자동 정렬
- 전체 완료 시 축하 메시지 ("모든 설정이 완료되었습니다! 🎉")
- 프로그레스바 색상 전환 애니메이션

#### 2-5. 로딩/전환 경험
- 페이지 전환 fade-in 애니메이션 (`.page-fade-in`)
- 로딩 시 skeleton UI (shimmer 효과)
- 에러 배너 스타일 통일 (`.error-banner`)
- 버튼 로딩 스피너 (`.btn-spinner`)

### 라운드 3: 반응형 + 마무리

#### 3-1. 모바일 최적화
- 375px 브레이크포인트 추가 (패딩, 폰트 사이즈, 카드 크기 조정)
- 768px 태블릿 브레이크포인트 추가
- 터치 타겟 최소 44px (체크박스, 세그먼트 버튼, 버튼)
- iOS 줌 방지 (`font-size: 16px` on inputs)

#### 3-2. 마이크로 인터랙션
- 체크박스 체크 시 scale 애니메이션
- 카드 hover 트랜지션 300ms로 통일
- 체크리스트 아이템 opacity/transform 트랜지션

#### 3-3. 접근성
- 모든 interactive 요소에 `aria-label` 추가
- `focus-visible` 아웃라인 (키보드 네비게이션)
- 색상 대비 개선 (대기 상태 `#9E9E9E` → 더 밝은 회색)

### 점검-개선 루프 (3회)

#### 루프 1
- client-card, client-detail-view 하드코딩 색상 통일
- `border-radius: 18` → `16` 전체 통일

#### 루프 2
- 로딩 상태 skeleton UI 적용 (client-dashboard-view, client-detail-view, client-preview-view)
- 에러 상태 배너 스타일 통일

#### 루프 3
- UpgradeModal `borderRadius: 14` → `12` 통일
- 최종 빌드 확인 완료

### 변경된 파일 목록
- `src/app/globals.css` — 애니메이션, 반응형, 접근성, 색상 통일
- `src/components/dashboard/dashboard-canvas.tsx` — 요약 카드, 로그 UI, 잠금 UX
- `src/components/admin/client-detail-view.tsx` — 체크리스트 UX, skeleton, 색상
- `src/components/admin/client-card.tsx` — 색상 통일, border-radius
- `src/components/UpgradeModal.tsx` — 토스트, 자동닫힘, 로딩 스피너
- `src/components/layout/dashboard-shell.tsx` — page-fade-in
- `src/components/dashboard/client-dashboard-view.tsx` — skeleton, 에러 배너
- `src/components/dashboard/client-preview-view.tsx` — skeleton, 에러 배너
