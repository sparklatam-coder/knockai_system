"use client";

import { useMemo, useState } from "react";
import { ClientCard } from "@/components/admin/client-card";
import { useClients } from "@/hooks/use-clients";
import type { ClientCreateInput, PackageTier } from "@/lib/types";

const INITIAL: ClientCreateInput = {
  name: "", region: "", contact_name: "", contact_phone: "",
  contact_email: "", package_tier: "entry", contract_start: "",
  login_email: "", memo: "",
};

const TIERS: { value: string; label: string }[] = [
  { value: "all",       label: "전체"      },
  { value: "entry",     label: "Entry"     },
  { value: "basic",     label: "Basic"     },
  { value: "standard",  label: "Standard"  },
  { value: "premium",   label: "Premium"   },
  { value: "platinum",  label: "Platinum"  },
];

export function AdminClientsView() {
  const { clients, loading, error, creating, createClient } = useClients();
  const [search,       setSearch]       = useState("");
  const [selectedTier, setSelectedTier] = useState("all");
  const [showModal,    setShowModal]    = useState(false);
  const [form,         setForm]         = useState<ClientCreateInput>(INITIAL);
  const [formMsg,      setFormMsg]      = useState<string | null>(null);

  const filtered = useMemo(() => clients.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch = !q || c.name.toLowerCase().includes(q) || c.region?.toLowerCase().includes(q) || c.contact_name?.toLowerCase().includes(q);
    const matchTier   = selectedTier === "all" || c.package_tier === selectedTier;
    return matchSearch && matchTier;
  }), [clients, search, selectedTier]);

  function field<K extends keyof ClientCreateInput>(key: K) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormMsg(null);
    const result = await createClient(form);
    if (result.error) { setFormMsg(result.error); return; }
    setForm(INITIAL);
    setFormMsg("✓ 고객이 생성되었습니다.");
    setTimeout(() => { setShowModal(false); setFormMsg(null); }, 1200);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Toolbar ── */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        {/* Search */}
        <div style={{ position: "relative", flex: "1 1 220px" }}>
          <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--tdim)", fontSize: 15, pointerEvents: "none" }}>🔍</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="병원명, 지역, 담당자"
            style={{
              width: "100%", minHeight: 44, paddingLeft: 40, paddingRight: 14,
              background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)",
              borderRadius: 12, color: "var(--text)", fontSize: 14,
            }}
          />
        </div>

        {/* Tier pills */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {TIERS.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setSelectedTier(t.value)}
              style={{
                padding: "8px 16px", borderRadius: 100, fontSize: 13, fontWeight: 600,
                cursor: "pointer", transition: "all 0.18s",
                background: selectedTier === t.value ? "rgba(79,156,255,0.18)" : "rgba(255,255,255,0.04)",
                border: selectedTier === t.value ? "1px solid rgba(79,156,255,0.4)" : "1px solid var(--border)",
                color: selectedTier === t.value ? "var(--gP)" : "var(--tsub)",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* New client button */}
        <button
          type="button"
          className="primary-button"
          onClick={() => setShowModal(true)}
          style={{ marginLeft: "auto", gap: 6 }}
        >
          + 신규 고객
        </button>
      </div>

      {/* ── Count ── */}
      <p style={{ fontSize: 13, color: "var(--tdim)" }}>
        {loading ? "불러오는 중…" : `총 ${filtered.length}개 고객`}
        {error && <span style={{ color: "#ef4444", marginLeft: 8 }}>{error}</span>}
      </p>

      {/* ── Client grid ── */}
      {!loading && filtered.length === 0 ? (
        <div className="state-card">조건에 맞는 고객이 없습니다.</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
          {filtered.map((c) => <ClientCard key={c.id} client={c} />)}
        </div>
      )}

      {/* ── Create modal ── */}
      {showModal && (
        <div
          className="popup-overlay show"
          onClick={() => { setShowModal(false); setFormMsg(null); }}
        >
          <div
            className="popup"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 520, width: "92%" }}
          >
            <button className="popup-close" type="button" onClick={() => { setShowModal(false); setFormMsg(null); }}>✕</button>

            <h3 style={{ fontSize: 20, fontWeight: 900, marginBottom: 4 }}>신규 고객 등록</h3>
            <p style={{ fontSize: 13, color: "var(--tsub)", marginBottom: 20 }}>
              생성 시 clients · nodes · sub_nodes가 자동으로 준비됩니다.
            </p>

            <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 12 }}>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <FormField label="병원명 *">
                  <input required value={form.name} onChange={field("name")} placeholder="노크치과" style={inputStyle} />
                </FormField>
                <FormField label="지역">
                  <input value={form.region} onChange={field("region")} placeholder="서울 강남" style={inputStyle} />
                </FormField>
                <FormField label="담당자 이름">
                  <input value={form.contact_name} onChange={field("contact_name")} placeholder="홍길동" style={inputStyle} />
                </FormField>
                <FormField label="담당자 연락처">
                  <input value={form.contact_phone} onChange={field("contact_phone")} placeholder="010-0000-0000" style={inputStyle} />
                </FormField>
                <FormField label="담당자 이메일">
                  <input type="email" value={form.contact_email} onChange={field("contact_email")} placeholder="clinic@example.com" style={inputStyle} />
                </FormField>
                <FormField label="로그인 이메일">
                  <input type="email" value={form.login_email} onChange={field("login_email")} placeholder="초대 메일 발송" style={inputStyle} />
                </FormField>
                <FormField label="패키지">
                  <select value={form.package_tier} onChange={field("package_tier")} style={inputStyle}>
                    <option value="entry">Entry (50만원/월)</option>
                    <option value="basic">Basic (100만원/월)</option>
                    <option value="standard">Standard (200만원/월)</option>
                    <option value="premium">Premium (300만원/월)</option>
                    <option value="platinum">Platinum (400만원+α)</option>
                  </select>
                </FormField>
                <FormField label="계약 시작일">
                  <input type="date" value={form.contract_start} onChange={field("contract_start")} style={inputStyle} />
                </FormField>
              </div>

              <FormField label="내부 메모">
                <textarea value={form.memo} onChange={field("memo")} rows={3} placeholder="내부용 메모 (고객 비공개)" style={{ ...inputStyle, resize: "none" }} />
              </FormField>

              {formMsg && (
                <p style={{ fontSize: 13, color: formMsg.startsWith("✓") ? "var(--gG)" : "#ef4444" }}>
                  {formMsg}
                </p>
              )}

              <button
                type="submit"
                className="primary-button"
                disabled={creating}
                style={{ width: "100%", marginTop: 4 }}
              >
                {creating ? "생성 중…" : "고객 생성"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.6px", textTransform: "uppercase", color: "var(--tdim)" }}>
        {label}
      </span>
      {children}
    </label>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", minHeight: 40,
  padding: "9px 12px",
  background: "rgba(255,255,255,0.03)",
  border: "1px solid var(--border)",
  borderRadius: 10, color: "var(--text)", fontSize: 13,
};
