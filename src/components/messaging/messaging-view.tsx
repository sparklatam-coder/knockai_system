"use client";

import { useState, useMemo, useRef } from "react";
import { useMessaging } from "@/hooks/use-messaging";
import type { MsgTemplate, MsgCampaign } from "@/lib/types";

/* ── Status Badge ── */
const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  success:      { label: "성공",     color: "var(--status-active)",   bg: "var(--status-active-bg)" },
  sms_fallback: { label: "SMS대체",  color: "var(--gW)",             bg: "rgba(217,119,6,0.08)" },
  fail:         { label: "실패",     color: "var(--error)",           bg: "var(--error-bg)" },
  scheduled:    { label: "예약",     color: "var(--gP)",              bg: "var(--accent-bg)" },
  sending:      { label: "발송중",   color: "var(--gW)",              bg: "rgba(217,119,6,0.08)" },
  queued:       { label: "대기",     color: "var(--tsub)",            bg: "var(--overlay-3)" },
  hold:         { label: "보류",     color: "var(--gW)",              bg: "rgba(217,119,6,0.08)" },
  draft:        { label: "준비중",   color: "var(--tdim)",            bg: "var(--overlay-2)" },
  sent:         { label: "발송완료", color: "var(--status-active)",   bg: "var(--status-active-bg)" },
  cancelled:    { label: "취소",     color: "var(--tdim)",            bg: "var(--overlay-2)" },
  approved:     { label: "승인",     color: "var(--status-active)",   bg: "var(--status-active-bg)" },
  review:       { label: "검수중",   color: "var(--gW)",              bg: "rgba(217,119,6,0.08)" },
  rejected:     { label: "반려",     color: "var(--error)",           bg: "var(--error-bg)" },
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

const TYPE_LABEL: Record<string, string> = { alimtalk: "알림톡", friendtalk: "친구톡" };

/* ── Main Component ── */
interface MessagingViewProps {
  clientId: string;
  clientName: string;
}

export function MessagingView({ clientId, clientName }: MessagingViewProps) {
  const {
    patients, templates, campaigns, logs,
    loading, error,
    uploadCSV, createTemplate, createCampaign, updateCampaign,
  } = useMessaging(clientId);

  const [tab, setTab] = useState<"overview"|"patients"|"templates"|"campaigns"|"history">("overview");
  const [patientFilter, setPatientFilter] = useState("all");
  const [showUpload, setShowUpload] = useState(false);
  const [showTplDetail, setShowTplDetail] = useState<MsgTemplate|null>(null);
  const [showNewCampaign, setShowNewCampaign] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<string | null>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);

  // New campaign form state
  const [newCampName, setNewCampName] = useState("");
  const [newCampType, setNewCampType] = useState<"alimtalk"|"friendtalk">("alimtalk");
  const [newCampTplId, setNewCampTplId] = useState("");
  const [newCampGroup, setNewCampGroup] = useState("all");
  const [newCampDate, setNewCampDate] = useState("");
  const [campSaving, setCampSaving] = useState(false);

  const friends = patients.filter(p => p.is_channel_friend).length;
  const groups = useMemo(() => ({
    "6m": patients.filter(p => p.patient_group === "6m").length,
    "1y": patients.filter(p => p.patient_group === "1y").length,
    "2y": patients.filter(p => p.patient_group === "2y").length,
    "2y+": patients.filter(p => p.patient_group === "2y+").length,
  }), [patients]);

  const filtered = patientFilter === "all"
    ? patients
    : patientFilter === "friends"
      ? patients.filter(p => p.is_channel_friend)
      : patients.filter(p => p.patient_group === patientFilter);

  const waveCampaigns = campaigns.filter(c => c.wave != null).sort((a, b) => (a.wave ?? 0) - (b.wave ?? 0));
  const mktCampaigns = campaigns.filter(c => c.wave == null);
  const approvedTemplates = templates.filter(t => t.status === "approved");

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadMsg("업로드 중...");
    const result = await uploadCSV(file);
    if (result.error) {
      setUploadMsg(`오류: ${result.error}`);
    } else {
      setUploadMsg(`${result.count}명 업로드 완료`);
      setTimeout(() => { setUploadMsg(null); setShowUpload(false); }, 2000);
    }
    e.target.value = "";
  };

  const handleCreateCampaign = async () => {
    if (!newCampName.trim()) return;
    setCampSaving(true);
    const groupCount = newCampGroup === "all" ? patients.length
      : newCampGroup === "friends" ? friends
      : groups[newCampGroup as keyof typeof groups] ?? 0;

    await createCampaign({
      name: newCampName,
      type: newCampType,
      template_id: newCampTplId || undefined,
      target_group: newCampGroup,
      target_count: groupCount,
      scheduled_at: newCampDate || undefined,
    } as Partial<MsgCampaign>);
    setCampSaving(false);
    setShowNewCampaign(false);
    setNewCampName("");
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "var(--tsub)" }}>메시징 데이터 로딩 중...</div>;
  if (error) return <div style={{ padding: 20, color: "var(--error)" }}>⚠️ {error}</div>;

  /* ── Overview ── */
  const renderOverview = () => {
    const successLogs = logs.filter(l => l.status === "success").length;
    const nextCampaign = campaigns.find(c => c.status === "scheduled" || c.status === "draft");

    return (
      <>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
          {[
            { label: "총 환자", value: patients.length.toLocaleString(), sub: "덴트웹 CSV" },
            { label: "채널 친구", value: String(friends), sub: patients.length ? `전환율 ${Math.round(friends / patients.length * 100)}%` : "—" },
            { label: "이번 달 발송", value: String(logs.length), sub: `성공 ${successLogs}건` },
            { label: "다음 캠페인", value: nextCampaign ? (nextCampaign.scheduled_at ? new Date(nextCampaign.scheduled_at).toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" }) : "미정") : "—", sub: nextCampaign?.name ?? "없음" },
          ].map((m, i) => (
            <div key={i} style={{ background: "var(--card2)", borderRadius: "var(--radius-card)", padding: "14px 18px" }}>
              <div style={{ fontSize: 11, color: "var(--tdim)", marginBottom: 6, fontWeight: 600 }}>{m.label}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "var(--text)" }}>{m.value}</div>
              <div style={{ fontSize: 11, color: "var(--tsub)", marginTop: 3 }}>{m.sub}</div>
            </div>
          ))}
        </div>

        {/* Wave plan */}
        {waveCampaigns.length > 0 && (
          <div className="apple-info-card" style={{ marginBottom: 16 }}>
            <span className="sec-label">분할 발송 계획</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
              {waveCampaigns.map(c => (
                <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "var(--card2)", borderRadius: 10, border: c.status === "scheduled" ? "1px solid var(--accent-border)" : "1px solid var(--border)" }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, background: c.status === "scheduled" ? "var(--accent-bg)" : "var(--overlay-3)", color: c.status === "scheduled" ? "var(--gP)" : "var(--tdim)" }}>{c.wave}</div>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</span>
                    <span style={{ fontSize: 12, color: "var(--tsub)", marginLeft: 8 }}>{c.target_count}명 · {c.scheduled_at ? new Date(c.scheduled_at).toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" }) : "미정"}</span>
                  </div>
                  <StatusChip status={c.status} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent logs */}
        <div className="apple-info-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="sec-label">최근 발송</span>
            <button type="button" onClick={() => setTab("history")} style={{ fontSize: 12, color: "var(--gP)", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>전체보기 →</button>
          </div>
          {logs.length > 0 ? (
            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 10 }}>
              <thead>
                <tr>
                  {["시간", "환자", "유형", "템플릿", "상태"].map(h => (
                    <th key={h} style={{ fontSize: 11, color: "var(--tdim)", padding: "6px 8px", textAlign: "left", fontWeight: 600, borderBottom: "1px solid var(--border)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.slice(0, 5).map(l => (
                  <tr key={l.id}>
                    <td style={{ fontSize: 12, color: "var(--tsub)", padding: "8px 8px", borderBottom: "1px solid var(--border)" }}>{new Date(l.sent_at).toLocaleString("ko-KR", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}</td>
                    <td style={{ fontSize: 13, fontWeight: 600, padding: "8px 8px", borderBottom: "1px solid var(--border)" }}>{(l as unknown as { patient?: { name: string } }).patient?.name ?? "—"}</td>
                    <td style={{ fontSize: 12, color: "var(--tsub)", padding: "8px 8px", borderBottom: "1px solid var(--border)" }}>{TYPE_LABEL[l.type] ?? l.type}</td>
                    <td style={{ fontSize: 12, color: "var(--tsub)", padding: "8px 8px", borderBottom: "1px solid var(--border)" }}>{l.template_name ?? "—"}</td>
                    <td style={{ padding: "8px 8px", borderBottom: "1px solid var(--border)" }}><StatusChip status={l.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: 20, textAlign: "center", color: "var(--tdim)", fontSize: 13 }}>아직 발송 이력이 없습니다</div>
          )}
        </div>
      </>
    );
  };

  /* ── Patients ── */
  const renderPatients = () => (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ display: "flex", gap: 4 }}>
          {([["all", "전체"], ["friends", "채널친구"], ["6m", "6개월"], ["1y", "6개월~1년"], ["2y", "1~2년"], ["2y+", "2년+"]] as const).map(([k, l]) => (
            <button key={k} type="button" onClick={() => setPatientFilter(k)} style={{
              padding: "5px 12px", fontSize: 12, fontWeight: patientFilter === k ? 600 : 400, borderRadius: 6, cursor: "pointer",
              border: patientFilter === k ? "1px solid var(--accent-border)" : "1px solid transparent",
              background: patientFilter === k ? "var(--accent-bg)" : "transparent",
              color: patientFilter === k ? "var(--gP)" : "var(--tsub)",
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
          {uploadMsg && <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: uploadMsg.startsWith("오류") ? "var(--error)" : "var(--status-active)" }}>{uploadMsg}</div>}
          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
            <button type="button" onClick={() => csvInputRef.current?.click()} style={{ padding: "7px 16px", fontSize: 12, fontWeight: 600, borderRadius: 8, border: "1px solid var(--border)", background: "var(--card)", cursor: "pointer", color: "var(--text)" }}>파일 선택</button>
            <button type="button" onClick={() => setShowUpload(false)} style={{ padding: "7px 16px", fontSize: 12, borderRadius: 8, border: "none", background: "none", cursor: "pointer", color: "var(--tsub)" }}>닫기</button>
          </div>
          <input ref={csvInputRef} type="file" accept=".csv" onChange={(e) => void handleCSVUpload(e)} style={{ display: "none" }} />
        </div>
      )}

      <div className="apple-info-card">
        {filtered.length > 0 ? (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["#", "환자명", "전화번호", "최종 내원", "진료", "채널"].map(h => (
                  <th key={h} style={{ fontSize: 11, color: "var(--tdim)", padding: "6px 8px", textAlign: "left", fontWeight: 600, borderBottom: "1px solid var(--border)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, idx) => (
                <tr key={p.id}>
                  <td style={{ fontSize: 11, color: "var(--tdim)", padding: "8px 8px", borderBottom: "1px solid var(--border)" }}>{idx + 1}</td>
                  <td style={{ fontSize: 13, fontWeight: 600, padding: "8px 8px", borderBottom: "1px solid var(--border)" }}>{p.name}</td>
                  <td style={{ fontSize: 12, color: "var(--tsub)", padding: "8px 8px", borderBottom: "1px solid var(--border)" }}>{p.phone}</td>
                  <td style={{ fontSize: 12, color: "var(--tsub)", padding: "8px 8px", borderBottom: "1px solid var(--border)" }}>{p.last_visit ?? "—"}</td>
                  <td style={{ fontSize: 12, color: "var(--tsub)", padding: "8px 8px", borderBottom: "1px solid var(--border)" }}>{p.treatment ?? "—"}</td>
                  <td style={{ padding: "8px 8px", borderBottom: "1px solid var(--border)" }}>
                    {p.is_channel_friend ? <span style={{ fontSize: 11, color: "var(--status-active)", fontWeight: 600 }}>친구</span> : <span style={{ color: "var(--tdim)" }}>—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: 30, textAlign: "center", color: "var(--tdim)", fontSize: 13 }}>
            {patients.length === 0 ? "환자 데이터가 없습니다. CSV를 업로드해주세요." : "해당 조건의 환자가 없습니다."}
          </div>
        )}
        <div style={{ padding: "10px 8px 0", fontSize: 11, color: "var(--tdim)" }}>{filtered.length}명 / 전체 {patients.length}명</div>
      </div>
    </>
  );

  /* ── Templates ── */
  const renderTemplates = () => (
    <>
      {templates.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {templates.map(t => (
            <div key={t.id} onClick={() => setShowTplDetail(t)} className="apple-info-card" style={{ cursor: "pointer", transition: "border-color 0.15s" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 700 }}>{t.name}</span>
                  <span style={{ fontSize: 11, color: "var(--tsub)" }}>{TYPE_LABEL[t.type] ?? t.type}{t.subtype ? ` · ${t.subtype}` : ""}</span>
                </div>
                <StatusChip status={t.status} />
              </div>
              <div style={{ fontSize: 12, color: "var(--tsub)", whiteSpace: "pre-line", lineHeight: 1.5, maxHeight: 44, overflow: "hidden" }}>{t.body.substring(0, 100)}...</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="apple-info-card" style={{ padding: 30, textAlign: "center", color: "var(--tdim)", fontSize: 13 }}>
          등록된 템플릿이 없습니다.
        </div>
      )}

      {/* Template detail modal */}
      {showTplDetail && (
        <div style={{ position: "fixed", inset: 0, zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div onClick={() => setShowTplDetail(null)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.3)" }} />
          <div style={{ position: "relative", background: "var(--card)", borderRadius: "var(--radius-card)", padding: 24, width: 420, maxHeight: "85vh", overflow: "auto", border: "1px solid var(--border)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{showTplDetail.name}</div>
                <div style={{ fontSize: 12, color: "var(--tsub)", marginTop: 2 }}>{TYPE_LABEL[showTplDetail.type] ?? showTplDetail.type}{showTplDetail.subtype ? ` · ${showTplDetail.subtype}` : ""}</div>
              </div>
              <StatusChip status={showTplDetail.status} />
            </div>
            <div style={{ background: "var(--card2)", borderRadius: 12, padding: 16, fontSize: 13, whiteSpace: "pre-line", lineHeight: 1.7, color: "var(--text)", marginBottom: 14 }}>
              {showTplDetail.body}
            </div>
            {showTplDetail.button_name && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
                <div style={{ padding: "10px 14px", border: "1px solid var(--accent-border)", borderRadius: 10, fontSize: 13, color: "var(--gP)", textAlign: "center", fontWeight: 600, cursor: "pointer", background: "var(--accent-bg)" }}>{showTplDetail.button_name} →</div>
                {showTplDetail.subtype === "채널추가형" && (
                  <div style={{ padding: "10px 14px", background: "rgba(217,119,6,0.06)", border: "1px solid rgba(217,119,6,0.2)", borderRadius: 10, fontSize: 11, color: "var(--gW)", textAlign: "center" }}>
                    ☑ 채널 추가하고 이 채널의 마케팅 메시지 등을 카카오톡으로 받기
                  </div>
                )}
              </div>
            )}
            {showTplDetail.button_url && <div style={{ fontSize: 11, color: "var(--tdim)", marginBottom: 16 }}>랜딩 URL: {showTplDetail.button_url}</div>}
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
              <input value={newCampName} onChange={e => setNewCampName(e.target.value)} placeholder="예: 5월 정기검진 안내" className="apple-input" style={{ width: "100%", marginTop: 4 }} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: "var(--tdim)", fontWeight: 600 }}>메시지 유형</label>
              <select value={newCampType} onChange={e => setNewCampType(e.target.value as "alimtalk"|"friendtalk")} className="apple-input" style={{ width: "100%", marginTop: 4, height: 38 }}>
                <option value="alimtalk">알림톡 (정보성)</option>
                <option value="friendtalk">친구톡 (마케팅)</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, color: "var(--tdim)", fontWeight: 600 }}>템플릿</label>
              <select value={newCampTplId} onChange={e => setNewCampTplId(e.target.value)} className="apple-input" style={{ width: "100%", marginTop: 4, height: 38 }}>
                <option value="">선택 안 함</option>
                {approvedTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, color: "var(--tdim)", fontWeight: 600 }}>대상</label>
              <select value={newCampGroup} onChange={e => setNewCampGroup(e.target.value)} className="apple-input" style={{ width: "100%", marginTop: 4, height: 38 }}>
                <option value="all">전체 ({patients.length}명)</option>
                <option value="6m">최근 6개월 ({groups["6m"]}명)</option>
                <option value="1y">6개월~1년 ({groups["1y"]}명)</option>
                <option value="2y">1~2년 ({groups["2y"]}명)</option>
                <option value="2y+">2년+ ({groups["2y+"]}명)</option>
                <option value="friends">채널 친구 ({friends}명)</option>
              </select>
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, color: "var(--tdim)", fontWeight: 600 }}>발송일</label>
            <input type="date" value={newCampDate} onChange={e => setNewCampDate(e.target.value)} className="apple-input" style={{ width: 180, marginTop: 4 }} />
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button type="button" onClick={() => setShowNewCampaign(false)} style={{ padding: "7px 16px", fontSize: 12, borderRadius: 8, border: "none", background: "none", cursor: "pointer", color: "var(--tsub)" }}>취소</button>
            <button type="button" onClick={() => void handleCreateCampaign()} disabled={campSaving} style={{ padding: "7px 16px", fontSize: 12, fontWeight: 700, borderRadius: 8, border: "none", background: "var(--gP)", cursor: "pointer", color: "#fff", opacity: campSaving ? 0.5 : 1 }}>{campSaving ? "생성 중..." : "생성"}</button>
          </div>
        </div>
      )}

      {/* Wave campaigns */}
      {waveCampaigns.length > 0 && (
        <>
          <div style={{ marginBottom: 8 }}><span className="sec-label">분할 발송 (알림톡)</span></div>
          {waveCampaigns.map(c => (
            <div key={c.id} className="apple-info-card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, background: c.status === "scheduled" ? "var(--accent-bg)" : "var(--overlay-3)", color: c.status === "scheduled" ? "var(--gP)" : "var(--tdim)" }}>{c.wave}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: "var(--tsub)" }}>{c.target_count}명 · {c.scheduled_at ? new Date(c.scheduled_at).toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" }) : "미정"}</div>
                </div>
              </div>
              <StatusChip status={c.status} />
            </div>
          ))}
        </>
      )}

      {/* Marketing campaigns */}
      {mktCampaigns.length > 0 && (
        <>
          <div style={{ marginTop: 20, marginBottom: 8 }}><span className="sec-label">마케팅 캠페인 (친구톡)</span></div>
          {mktCampaigns.map(c => (
            <div key={c.id} className="apple-info-card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</div>
                <div style={{ fontSize: 11, color: "var(--tsub)" }}>{c.target_group === "friends" ? "채널 친구" : c.target_group} · {c.target_count}명 · {c.scheduled_at ? new Date(c.scheduled_at).toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" }) : "미정"}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <StatusChip status={c.status} />
              </div>
            </div>
          ))}
        </>
      )}

      {campaigns.length === 0 && (
        <div className="apple-info-card" style={{ padding: 30, textAlign: "center", color: "var(--tdim)", fontSize: 13 }}>
          등록된 캠페인이 없습니다.
        </div>
      )}
    </>
  );

  /* ── History ── */
  const renderHistory = () => (
    <div className="apple-info-card">
      {logs.length > 0 ? (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["발송 시간", "환자", "유형", "템플릿", "상태"].map(h => (
                <th key={h} style={{ fontSize: 11, color: "var(--tdim)", padding: "6px 8px", textAlign: "left", fontWeight: 600, borderBottom: "1px solid var(--border)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {logs.map(l => (
              <tr key={l.id}>
                <td style={{ fontSize: 12, color: "var(--tsub)", padding: "8px 8px", borderBottom: "1px solid var(--border)" }}>{new Date(l.sent_at).toLocaleString("ko-KR", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}</td>
                <td style={{ fontSize: 13, fontWeight: 600, padding: "8px 8px", borderBottom: "1px solid var(--border)" }}>{(l as unknown as { patient?: { name: string } }).patient?.name ?? "—"}</td>
                <td style={{ fontSize: 12, color: "var(--tsub)", padding: "8px 8px", borderBottom: "1px solid var(--border)" }}>{TYPE_LABEL[l.type] ?? l.type}</td>
                <td style={{ fontSize: 12, color: "var(--tsub)", padding: "8px 8px", borderBottom: "1px solid var(--border)" }}>{l.template_name ?? "—"}</td>
                <td style={{ padding: "8px 8px", borderBottom: "1px solid var(--border)" }}><StatusChip status={l.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div style={{ padding: 30, textAlign: "center", color: "var(--tdim)", fontSize: 13 }}>아직 발송 이력이 없습니다</div>
      )}
    </div>
  );

  return (
    <div>
      {/* Sub-tab navigation */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
        <MsgTab label="대시보드" active={tab === "overview"} onClick={() => setTab("overview")} />
        <MsgTab label="환자 DB" active={tab === "patients"} onClick={() => setTab("patients")} count={patients.length} />
        <MsgTab label="템플릿" active={tab === "templates"} onClick={() => setTab("templates")} count={templates.length} />
        <MsgTab label="캠페인" active={tab === "campaigns"} onClick={() => setTab("campaigns")} count={campaigns.length} />
        <MsgTab label="발송 이력" active={tab === "history"} onClick={() => setTab("history")} count={logs.length} />
      </div>

      {tab === "overview" && renderOverview()}
      {tab === "patients" && renderPatients()}
      {tab === "templates" && renderTemplates()}
      {tab === "campaigns" && renderCampaigns()}
      {tab === "history" && renderHistory()}
    </div>
  );
}
