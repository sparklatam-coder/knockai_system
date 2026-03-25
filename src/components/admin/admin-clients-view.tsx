"use client";

import { useCallback, useMemo, useRef, useState } from "react";
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
  const [logo,         setLogo]         = useState<File | null>(null);
  const [logoPreview,  setLogoPreview]  = useState<string | null>(null);
  const [formMsg,      setFormMsg]      = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

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

  const handleLogoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) { setLogo(null); setLogoPreview(null); return; }
    if (!file.type.startsWith("image/")) { setFormMsg("이미지 파일만 업로드 가능합니다."); return; }
    if (file.size > 2 * 1024 * 1024) { setFormMsg("로고는 2MB 이하만 가능합니다."); return; }
    setLogo(file);
    setLogoPreview(URL.createObjectURL(file));
    setFormMsg(null);
  }, []);

  const clearLogo = useCallback(() => {
    setLogo(null);
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    setLogoPreview(null);
    if (logoInputRef.current) logoInputRef.current.value = "";
  }, [logoPreview]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormMsg(null);
    const result = await createClient({ input: form, logo });
    if (result.error) { setFormMsg(result.error); return; }
    setForm(INITIAL);
    clearLogo();
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
              background: "var(--overlay-3)", border: "1px solid var(--border)",
              borderRadius: "var(--radius-input)", color: "var(--text)", fontSize: 14,
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
                background: selectedTier === t.value ? "var(--accent-bg)" : "var(--overlay-3)",
                border: selectedTier === t.value ? "1px solid var(--accent-hover)" : "1px solid var(--border)",
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
        {error && <span style={{ color: "var(--error)", marginLeft: 8 }}>{error}</span>}
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

              {/* Logo upload */}
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 4 }}>
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  style={{
                    width: 72, height: 72, borderRadius: 16, cursor: "pointer",
                    background: logoPreview ? "transparent" : "var(--overlay-3)",
                    border: logoPreview ? "2px solid var(--accent-border)" : "2px dashed var(--border)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    overflow: "hidden", flexShrink: 0, transition: "border-color 0.2s",
                  }}
                >
                  {logoPreview ? (
                    <img src={logoPreview} alt="로고" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--tdim)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="4" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                    </svg>
                  )}
                </button>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.6px", textTransform: "uppercase", color: "var(--tdim)" }}>
                    병원 로고
                  </span>
                  <span style={{ fontSize: 12, color: "var(--tsub)" }}>PNG, JPG, SVG · 2MB 이하</span>
                  {logo && (
                    <button type="button" onClick={clearLogo} style={{
                      fontSize: 11, color: "var(--error-soft)", background: "none", border: "none",
                      cursor: "pointer", padding: 0, textAlign: "left",
                    }}>
                      삭제
                    </button>
                  )}
                </div>
                <input ref={logoInputRef} type="file" accept="image/*" hidden onChange={handleLogoChange} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <FormField label="병원명 *">
                  <input required value={form.name} onChange={field("name")} placeholder="노크병원" style={inputStyle} />
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
                <p style={{ fontSize: 13, color: formMsg.startsWith("✓") ? "var(--gG)" : "var(--error)" }}>
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
  background: "var(--overlay-2)",
  border: "1px solid var(--border)",
  borderRadius: 10, color: "var(--text)", fontSize: 13,
};
