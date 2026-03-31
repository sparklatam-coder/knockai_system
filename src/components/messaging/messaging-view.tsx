"use client";

import { useState, useMemo } from "react";

/* ── Types ── */
interface Patient {
  id: number;
  name: string;
  phone: string;
  lastVisit: string;
  treatment: string;
  friend: boolean;
  group: string;
}

interface Template {
  id: string;
  name: string;
  type: "알림톡" | "친구톡";
  sub: string;
  status: "approved" | "review" | "draft" | "rejected";
  body: string;
  btn: string;
  url: string;
}

interface Campaign {
  id: number;
  name: string;
  tpl: string;
  type: "알림톡" | "친구톡";
  group: string;
  count: number;
  date: string;
  status: "scheduled" | "queued" | "hold" | "draft" | "sent";
  wave: number | null;
}

interface MessageLog {
  id: number;
  time: string;
  name: string;
  type: string;
  tpl: string;
  st: "success" | "sms" | "fail";
}

/* ── Mock Data ── */
const MOCK_PATIENTS: Patient[] = Array.from({ length: 20 }, (_, i) => {
  const names = ["홍길동","김영희","박철수","이수진","최동현","정미경","강태호","윤서연","한지민","송준호","오하은","임재현","배수연","조영호","신민아","류동혁","전소희","남궁민","서현우","문가영"];
  const treatments = ["스케일링","임플란트","충치치료","교정상담","발치","신경치료","미백","보철"];
  const m = Math.floor(Math.random()*12)+1;
  const y = Math.random()>0.5 ? 2025 : Math.random()>0.4 ? 2024 : 2023;
  const d = Math.floor(Math.random()*28)+1;
  const group = y===2025&&m>=10?"6m":y===2025&&m>=4?"1y":y===2025?"2y":y===2024?"2y":"2y+";
  return {
    id: i+1, name: names[i],
    phone: `010-${String(Math.floor(Math.random()*9000+1000))}-${String(Math.floor(Math.random()*9000+1000))}`,
    lastVisit: `${y}-${String(m).padStart(2,"0")}-${String(d).padStart(2,"0")}`,
    treatment: treatments[Math.floor(Math.random()*treatments.length)],
    friend: i < 5, group,
  };
});

const TEMPLATES: Template[] = [
  { id:"t1", name:"정기검진 안내", type:"알림톡", sub:"채널추가형", status:"approved",
    body:`[#{병원명}] 정기 검진 안내\n\n#{고객명}님, 안녕하세요.\n마지막 내원일(#{진료일})로부터 시간이 경과하여\n정기 검진 안내드립니다.\n\n치과 정기검진은 6개월 주기를 권장합니다.\n\n※ 진료 후 관리사항 및 예약은\n아래 버튼을 확인해주세요.`,
    btn:"관리사항 확인하기", url:"knockai.click/care" },
  { id:"t2", name:"진료완료 안내", type:"알림톡", sub:"채널추가형", status:"approved",
    body:`[#{병원명}] 진료 완료 안내\n\n#{고객명}님, 오늘 진료가 완료되었습니다.\n\n◾ 진료일: #{진료일}\n◾ 진료내용: #{진료내용}\n◾ 다음 예약: #{다음예약일}\n\n※ 진료 후 주의사항은 아래 버튼을 확인해주세요.`,
    btn:"진료 후 주의사항", url:"knockai.click/aftercare" },
  { id:"t3", name:"예약 리마인더", type:"알림톡", sub:"기본형", status:"review",
    body:`[#{병원명}] 예약 안내\n\n#{고객명}님, 내일 예약이 있습니다.\n\n◾ 일시: #{예약일시}\n◾ 담당: #{담당의}\n\n변경이 필요하시면 아래 버튼을 눌러주세요.`,
    btn:"예약 변경/취소", url:"knockai.click/cancel" },
  { id:"t4", name:"친구소개 이벤트", type:"친구톡", sub:"이미지형", status:"draft",
    body:`🎁 친구야, 치아는 괜찮아?\n\n소개한 친구가 내원하면\n✔ 소개자: 스케일링 무료\n✔ 피소개자: 첫 진료 20% 할인`,
    btn:"친구에게 공유하기", url:"knockai.click/referral" },
];

const CAMPAIGNS: Campaign[] = [
  { id:1, name:"정기검진 1차", tpl:"정기검진 안내", type:"알림톡", group:"6m", count:5, date:"2026-04-01", status:"scheduled", wave:1 },
  { id:2, name:"정기검진 2차", tpl:"정기검진 안내", type:"알림톡", group:"1y", count:7, date:"2026-04-03", status:"queued", wave:2 },
  { id:3, name:"정기검진 3차", tpl:"정기검진 안내", type:"알림톡", group:"2y", count:5, date:"2026-04-05", status:"queued", wave:3 },
  { id:4, name:"정기검진 4차", tpl:"정기검진 안내", type:"알림톡", group:"2y+", count:3, date:"결과 후", status:"hold", wave:4 },
  { id:5, name:"4월 건강 정보", tpl:"월간 콘텐츠", type:"친구톡", group:"friends", count:5, date:"2026-04-07", status:"draft", wave:null },
  { id:6, name:"친구야 괜찮아?", tpl:"친구소개 이벤트", type:"친구톡", group:"friends", count:5, date:"2026-04-14", status:"draft", wave:null },
];

const LOGS: MessageLog[] = [
  { id:1, time:"03/31 09:00", name:"홍길동", type:"알림톡", tpl:"정기검진 안내", st:"success" },
  { id:2, time:"03/31 09:00", name:"김영희", type:"알림톡", tpl:"정기검진 안내", st:"success" },
  { id:3, time:"03/31 09:01", name:"박철수", type:"알림톡", tpl:"정기검진 안내", st:"sms" },
  { id:4, time:"03/30 14:00", name:"이수진", type:"친구톡", tpl:"3월 건강 정보", st:"success" },
  { id:5, time:"03/30 11:30", name:"최동현", type:"알림톡", tpl:"진료완료 안내", st:"success" },
  { id:6, time:"03/29 09:00", name:"정미경", type:"알림톡", tpl:"예약 리마인더", st:"success" },
  { id:7, time:"03/29 09:00", name:"강태호", type:"알림톡", tpl:"예약 리마인더", st:"fail" },
];

/* ── Status Badge (matches existing apple-* pattern) ── */
const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  success:   { label: "성공",   color: "var(--status-active)",   bg: "var(--status-active-bg)" },
  sms:       { label: "SMS대체", color: "var(--gW)",             bg: "rgba(217,119,6,0.08)" },
  fail:      { label: "실패",   color: "var(--error)",           bg: "var(--error-bg)" },
  scheduled: { label: "예약",   color: "var(--gP)",              bg: "var(--accent-bg)" },
  queued:    { label: "대기",   color: "var(--tsub)",            bg: "var(--overlay-3)" },
  hold:      { label: "보류",   color: "var(--gW)",              bg: "rgba(217,119,6,0.08)" },
  draft:     { label: "준비중", color: "var(--tdim)",            bg: "var(--overlay-2)" },
  sent:      { label: "발송완료", color: "var(--status-active)", bg: "var(--status-active-bg)" },
  approved:  { label: "승인",   color: "var(--status-active)",   bg: "var(--status-active-bg)" },
  review:    { label: "검수중", color: "var(--gW)",              bg: "rgba(217,119,6,0.08)" },
  rejected:  { label: "반려",   color: "var(--error)",           bg: "var(--error-bg)" },
};

function StatusChip({ status }: { status: string }) {
  const s = STATUS_MAP[status] ?? STATUS_MAP.draft;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "2px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600,
      background: s.bg, color: s.color,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.color }} />
      {s.label}
    </span>
  );
}

/* ── Sub-tab pill (matching apple-seg style) ── */
function MsgTab({ label, active, count, onClick }: { label: string; active: boolean; count?: number; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} style={{
      padding: "7px 16px", fontSize: 13, fontWeight: active ? 700 : 500,
      borderRadius: 8, cursor: "pointer", transition: "all 0.15s",
      border: active ? "1px solid var(--accent-border)" : "1px solid transparent",
      background: active ? "var(--accent-bg)" : "transparent",
      color: active ? "var(--gP)" : "var(--tsub)",
      display: "flex", alignItems: "center", gap: 6,
    }}>
      {label}
      {count !== undefined && (
        <span style={{ fontSize: 10, background: active ? "rgba(59,130,246,0.15)" : "var(--overlay-3)", padding: "1px 6px", borderRadius: 10, color: active ? "var(--gP)" : "var(--tdim)" }}>
          {count}
        </span>
      )}
    </button>
  );
}

/* ── Main Component ── */
interface MessagingViewProps {
  clientId: string;
  clientName: string;
}

export function MessagingView({ clientId, clientName }: MessagingViewProps) {
  const [tab, setTab] = useState<"overview"|"patients"|"templates"|"campaigns"|"history">("overview");
  const [patientFilter, setPatientFilter] = useState("all");
  const [showUpload, setShowUpload] = useState(false);
  const [showTplDetail, setShowTplDetail] = useState<Template|null>(null);
  const [showNewCampaign, setShowNewCampaign] = useState(false);

  const patients = MOCK_PATIENTS;
  const friends = patients.filter(p => p.friend).length;
  const groups = useMemo(() => ({
    "6m": patients.filter(p=>p.group==="6m").length,
    "1y": patients.filter(p=>p.group==="1y").length,
    "2y": patients.filter(p=>p.group==="2y").length,
    "2y+": patients.filter(p=>p.group==="2y+").length,
  }), [patients]);

  const filtered = patientFilter==="all" ? patients : patientFilter==="friends" ? patients.filter(p=>p.friend) : patients.filter(p=>p.group===patientFilter);

  /* ── Overview ── */
  const renderOverview = () => (
    <>
      {/* Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "총 환자", value: patients.length.toLocaleString(), sub: "덴트웹 CSV" },
          { label: "채널 친구", value: String(friends), sub: `전환율 ${Math.round(friends/patients.length*100)}%` },
          { label: "이번 달 발송", value: String(LOGS.length), sub: `성공 ${LOGS.filter(l=>l.st==="success").length}건` },
          { label: "다음 캠페인", value: "4/1", sub: "정기검진 1차" },
        ].map((m, i) => (
          <div key={i} style={{ background: "var(--card2)", borderRadius: "var(--radius-card)", padding: "14px 18px" }}>
            <div style={{ fontSize: 11, color: "var(--tdim)", marginBottom: 6, fontWeight: 600 }}>{m.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "var(--text)" }}>{m.value}</div>
            <div style={{ fontSize: 11, color: "var(--tsub)", marginTop: 3 }}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Wave plan */}
      <div className="apple-info-card" style={{ marginBottom: 16 }}>
        <span className="sec-label">분할 발송 계획</span>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
          {[
            { w: 1, label: "1차: 최근 6개월", n: groups["6m"], date: "4/1", st: "scheduled" },
            { w: 2, label: "2차: 6개월~1년", n: groups["1y"], date: "4/3", st: "queued" },
            { w: 3, label: "3차: 1~2년", n: groups["2y"], date: "4/5", st: "queued" },
            { w: 4, label: "4차: 2년 이상", n: groups["2y+"], date: "결과 후 결정", st: "hold" },
          ].map(w => (
            <div key={w.w} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "var(--card2)", borderRadius: 10, border: w.st==="scheduled" ? "1px solid var(--accent-border)" : "1px solid var(--border)" }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, background: w.st==="scheduled" ? "var(--accent-bg)" : "var(--overlay-3)", color: w.st==="scheduled" ? "var(--gP)" : "var(--tdim)" }}>{w.w}</div>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{w.label}</span>
                <span style={{ fontSize: 12, color: "var(--tsub)", marginLeft: 8 }}>{w.n}명 · {w.date}</span>
              </div>
              <StatusChip status={w.st} />
            </div>
          ))}
        </div>
      </div>

      {/* Recent logs */}
      <div className="apple-info-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span className="sec-label">최근 발송</span>
          <button type="button" onClick={() => setTab("history")} style={{ fontSize: 12, color: "var(--gP)", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>전체보기 →</button>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 10 }}>
          <thead>
            <tr>
              {["시간","환자","유형","템플릿","상태"].map(h => (
                <th key={h} style={{ fontSize: 11, color: "var(--tdim)", padding: "6px 8px", textAlign: "left", fontWeight: 600, borderBottom: "1px solid var(--border)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {LOGS.slice(0,5).map(l => (
              <tr key={l.id}>
                <td style={{ fontSize: 12, color: "var(--tsub)", padding: "8px 8px", borderBottom: "1px solid var(--border)" }}>{l.time}</td>
                <td style={{ fontSize: 13, fontWeight: 600, padding: "8px 8px", borderBottom: "1px solid var(--border)" }}>{l.name}</td>
                <td style={{ fontSize: 12, color: "var(--tsub)", padding: "8px 8px", borderBottom: "1px solid var(--border)" }}>{l.type}</td>
                <td style={{ fontSize: 12, color: "var(--tsub)", padding: "8px 8px", borderBottom: "1px solid var(--border)" }}>{l.tpl}</td>
                <td style={{ padding: "8px 8px", borderBottom: "1px solid var(--border)" }}><StatusChip status={l.st} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );

  /* ── Patients ── */
  const renderPatients = () => (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ display: "flex", gap: 4 }}>
          {[["all","전체"],["friends","채널친구"],["6m","6개월"],["1y","6개월~1년"],["2y","1~2년"],["2y+","2년+"]].map(([k,l]) => (
            <button key={k} type="button" onClick={() => setPatientFilter(k)} style={{
              padding: "5px 12px", fontSize: 12, fontWeight: patientFilter===k ? 600 : 400, borderRadius: 6, cursor: "pointer",
              border: patientFilter===k ? "1px solid var(--accent-border)" : "1px solid transparent",
              background: patientFilter===k ? "var(--accent-bg)" : "transparent",
              color: patientFilter===k ? "var(--gP)" : "var(--tsub)",
            }}>{l}</button>
          ))}
        </div>
        <button type="button" onClick={() => setShowUpload(!showUpload)} style={{
          padding: "7px 16px", fontSize: 12, fontWeight: 600, borderRadius: 8,
          border: "1px solid var(--border)", background: "var(--card)", cursor: "pointer", color: "var(--text)",
        }}>CSV 업로드</button>
      </div>

      {showUpload && (
        <div style={{ padding: 24, marginBottom: 14, border: "2px dashed var(--border)", borderRadius: "var(--radius-card)", textAlign: "center", background: "var(--card2)" }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6, color: "var(--text)" }}>덴트웹 환자 CSV 업로드</div>
          <div style={{ fontSize: 12, color: "var(--tsub)", marginBottom: 4 }}>덴트웹 → 검색 → 환자 목록 내보내기 → CSV</div>
          <div style={{ fontSize: 11, color: "var(--tdim)", marginBottom: 14 }}>필수: 환자명, 전화번호, 최종내원일, 진료내용</div>
          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
            <button type="button" style={{ padding: "7px 16px", fontSize: 12, fontWeight: 600, borderRadius: 8, border: "1px solid var(--border)", background: "var(--card)", cursor: "pointer", color: "var(--text)" }}>파일 선택</button>
            <button type="button" onClick={() => setShowUpload(false)} style={{ padding: "7px 16px", fontSize: 12, borderRadius: 8, border: "none", background: "none", cursor: "pointer", color: "var(--tsub)" }}>닫기</button>
          </div>
        </div>
      )}

      <div className="apple-info-card">
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["#","환자명","전화번호","최종 내원","진료","채널"].map(h => (
                <th key={h} style={{ fontSize: 11, color: "var(--tdim)", padding: "6px 8px", textAlign: "left", fontWeight: 600, borderBottom: "1px solid var(--border)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id}>
                <td style={{ fontSize: 11, color: "var(--tdim)", padding: "8px 8px", borderBottom: "1px solid var(--border)" }}>{p.id}</td>
                <td style={{ fontSize: 13, fontWeight: 600, padding: "8px 8px", borderBottom: "1px solid var(--border)" }}>{p.name}</td>
                <td style={{ fontSize: 12, color: "var(--tsub)", padding: "8px 8px", borderBottom: "1px solid var(--border)" }}>{p.phone}</td>
                <td style={{ fontSize: 12, color: "var(--tsub)", padding: "8px 8px", borderBottom: "1px solid var(--border)" }}>{p.lastVisit}</td>
                <td style={{ fontSize: 12, color: "var(--tsub)", padding: "8px 8px", borderBottom: "1px solid var(--border)" }}>{p.treatment}</td>
                <td style={{ padding: "8px 8px", borderBottom: "1px solid var(--border)" }}>
                  {p.friend ? <span style={{ fontSize: 11, color: "var(--status-active)", fontWeight: 600 }}>친구</span> : <span style={{ color: "var(--tdim)" }}>—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ padding: "10px 8px 0", fontSize: 11, color: "var(--tdim)" }}>{filtered.length}명 / 전체 {patients.length}명</div>
      </div>
    </>
  );

  /* ── Templates ── */
  const renderTemplates = () => (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {TEMPLATES.map(t => (
          <div key={t.id} onClick={() => setShowTplDetail(t)} className="apple-info-card" style={{ cursor: "pointer", transition: "border-color 0.15s" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 700 }}>{t.name}</span>
                <span style={{ fontSize: 11, color: "var(--tsub)" }}>{t.type} · {t.sub}</span>
              </div>
              <StatusChip status={t.status} />
            </div>
            <div style={{ fontSize: 12, color: "var(--tsub)", whiteSpace: "pre-line", lineHeight: 1.5, maxHeight: 44, overflow: "hidden" }}>{t.body.substring(0,100)}...</div>
          </div>
        ))}
      </div>

      {/* Template detail modal */}
      {showTplDetail && (
        <div style={{ position: "fixed", inset: 0, zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div onClick={() => setShowTplDetail(null)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.3)" }} />
          <div style={{ position: "relative", background: "var(--card)", borderRadius: "var(--radius-card)", padding: 24, width: 420, maxHeight: "85vh", overflow: "auto", border: "1px solid var(--border)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{showTplDetail.name}</div>
                <div style={{ fontSize: 12, color: "var(--tsub)", marginTop: 2 }}>{showTplDetail.type} · {showTplDetail.sub}</div>
              </div>
              <StatusChip status={showTplDetail.status} />
            </div>
            <div style={{ background: "var(--card2)", borderRadius: 12, padding: 16, fontSize: 13, whiteSpace: "pre-line", lineHeight: 1.7, color: "var(--text)", marginBottom: 14 }}>
              {showTplDetail.body}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
              <div style={{ padding: "10px 14px", border: "1px solid var(--accent-border)", borderRadius: 10, fontSize: 13, color: "var(--gP)", textAlign: "center", fontWeight: 600, cursor: "pointer", background: "var(--accent-bg)" }}>{showTplDetail.btn} →</div>
              {showTplDetail.sub === "채널추가형" && (
                <div style={{ padding: "10px 14px", background: "rgba(217,119,6,0.06)", border: "1px solid rgba(217,119,6,0.2)", borderRadius: 10, fontSize: 11, color: "var(--gW)", textAlign: "center" }}>
                  ☑ 채널 추가하고 이 채널의 마케팅 메시지 등을 카카오톡으로 받기
                </div>
              )}
            </div>
            <div style={{ fontSize: 11, color: "var(--tdim)", marginBottom: 16 }}>랜딩 URL: {showTplDetail.url}</div>
            <button type="button" onClick={() => setShowTplDetail(null)} style={{ width: "100%", padding: "10px", fontSize: 13, fontWeight: 600, borderRadius: 10, border: "1px solid var(--border)", background: "var(--card)", cursor: "pointer", color: "var(--text)" }}>닫기</button>
          </div>
        </div>
      )}
    </>
  );

  /* ── Campaigns ── */
  const renderCampaigns = () => (
    <>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
        <button type="button" onClick={() => setShowNewCampaign(!showNewCampaign)} style={{
          padding: "7px 16px", fontSize: 12, fontWeight: 600, borderRadius: 8,
          border: "1px solid var(--border)", background: "var(--card)", cursor: "pointer", color: "var(--text)",
        }}>+ 새 캠페인</button>
      </div>

      {showNewCampaign && (
        <div className="apple-info-card" style={{ marginBottom: 14 }}>
          <span className="sec-label">새 캠페인</span>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 11, color: "var(--tdim)", fontWeight: 600 }}>캠페인 이름</label>
              <input placeholder="예: 5월 정기검진 안내" className="apple-input" style={{ width: "100%", marginTop: 4 }} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: "var(--tdim)", fontWeight: 600 }}>메시지 유형</label>
              <select className="apple-input" style={{ width: "100%", marginTop: 4, height: 38 }}>
                <option>알림톡 (정보성)</option>
                <option>친구톡 (마케팅)</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, color: "var(--tdim)", fontWeight: 600 }}>템플릿</label>
              <select className="apple-input" style={{ width: "100%", marginTop: 4, height: 38 }}>
                {TEMPLATES.filter(t=>t.status==="approved").map(t => <option key={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, color: "var(--tdim)", fontWeight: 600 }}>대상</label>
              <select className="apple-input" style={{ width: "100%", marginTop: 4, height: 38 }}>
                <option>전체 ({patients.length}명)</option>
                <option>최근 6개월 ({groups["6m"]}명)</option>
                <option>6개월~1년 ({groups["1y"]}명)</option>
                <option>1~2년 ({groups["2y"]}명)</option>
                <option>2년+ ({groups["2y+"]}명)</option>
                <option>채널 친구 ({friends}명)</option>
              </select>
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, color: "var(--tdim)", fontWeight: 600 }}>발송일</label>
            <input type="date" className="apple-input" style={{ width: 180, marginTop: 4 }} />
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button type="button" onClick={() => setShowNewCampaign(false)} style={{ padding: "7px 16px", fontSize: 12, borderRadius: 8, border: "none", background: "none", cursor: "pointer", color: "var(--tsub)" }}>취소</button>
            <button type="button" onClick={() => setShowNewCampaign(false)} style={{ padding: "7px 16px", fontSize: 12, fontWeight: 700, borderRadius: 8, border: "none", background: "var(--gP)", cursor: "pointer", color: "#fff" }}>생성</button>
          </div>
        </div>
      )}

      {/* Wave campaigns */}
      <div style={{ marginBottom: 8 }}><span className="sec-label">분할 발송 (알림톡)</span></div>
      {CAMPAIGNS.filter(c=>c.wave).map(c => (
        <div key={c.id} className="apple-info-card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, background: c.status==="scheduled" ? "var(--accent-bg)" : "var(--overlay-3)", color: c.status==="scheduled" ? "var(--gP)" : "var(--tdim)" }}>{c.wave}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</div>
              <div style={{ fontSize: 11, color: "var(--tsub)" }}>{c.count}명 · {c.date}</div>
            </div>
          </div>
          <StatusChip status={c.status} />
        </div>
      ))}

      {/* Marketing campaigns */}
      <div style={{ marginTop: 20, marginBottom: 8 }}><span className="sec-label">마케팅 캠페인 (친구톡)</span></div>
      {CAMPAIGNS.filter(c=>!c.wave).map(c => (
        <div key={c.id} className="apple-info-card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</div>
            <div style={{ fontSize: 11, color: "var(--tsub)" }}>채널 친구 · {c.count}명 · {c.date}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <StatusChip status={c.status} />
            <button type="button" style={{ fontSize: 11, fontWeight: 600, padding: "4px 12px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--card)", cursor: "pointer", color: "var(--text)" }}>편집</button>
          </div>
        </div>
      ))}
    </>
  );

  /* ── History ── */
  const renderHistory = () => (
    <div className="apple-info-card">
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {["발송 시간","환자","유형","템플릿","상태"].map(h => (
              <th key={h} style={{ fontSize: 11, color: "var(--tdim)", padding: "6px 8px", textAlign: "left", fontWeight: 600, borderBottom: "1px solid var(--border)" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {LOGS.map(l => (
            <tr key={l.id}>
              <td style={{ fontSize: 12, color: "var(--tsub)", padding: "8px 8px", borderBottom: "1px solid var(--border)" }}>{l.time}</td>
              <td style={{ fontSize: 13, fontWeight: 600, padding: "8px 8px", borderBottom: "1px solid var(--border)" }}>{l.name}</td>
              <td style={{ fontSize: 12, color: "var(--tsub)", padding: "8px 8px", borderBottom: "1px solid var(--border)" }}>{l.type}</td>
              <td style={{ fontSize: 12, color: "var(--tsub)", padding: "8px 8px", borderBottom: "1px solid var(--border)" }}>{l.tpl}</td>
              <td style={{ padding: "8px 8px", borderBottom: "1px solid var(--border)" }}><StatusChip status={l.st} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div>
      {/* Sub-tab navigation */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
        <MsgTab label="대시보드" active={tab==="overview"} onClick={() => setTab("overview")} />
        <MsgTab label="환자 DB" active={tab==="patients"} onClick={() => setTab("patients")} count={patients.length} />
        <MsgTab label="템플릿" active={tab==="templates"} onClick={() => setTab("templates")} count={TEMPLATES.length} />
        <MsgTab label="캠페인" active={tab==="campaigns"} onClick={() => setTab("campaigns")} count={CAMPAIGNS.length} />
        <MsgTab label="발송 이력" active={tab==="history"} onClick={() => setTab("history")} count={LOGS.length} />
      </div>

      {/* Content */}
      {tab === "overview" && renderOverview()}
      {tab === "patients" && renderPatients()}
      {tab === "templates" && renderTemplates()}
      {tab === "campaigns" && renderCampaigns()}
      {tab === "history" && renderHistory()}
    </div>
  );
}
