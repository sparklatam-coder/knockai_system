"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { ClientCreateInput, PackageTier } from "@/lib/types";

interface ClientCreateFormProps {
  creating: boolean;
  onSubmit: (options: { input: ClientCreateInput; logo?: File | null }) => Promise<{ error: string | null }>;
}

const initialState: ClientCreateInput = {
  name: "",
  region: "",
  contact_name: "",
  contact_phone: "",
  contact_email: "",
  package_tier: "basic",
  contract_start: "",
  login_email: "",
  memo: "",
};

export function ClientCreateForm({ creating, onSubmit }: ClientCreateFormProps) {
  const [form, setForm] = useState<ClientCreateInput>(initialState);
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const packageOptions = useMemo<PackageTier[]>(() => ["basic", "standard", "premium"], []);

  const handleLogoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;

    if (!file) {
      setLogo(null);
      setLogoPreview(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      setMessage("이미지 파일만 업로드할 수 있습니다.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setMessage("로고 파일은 2MB 이하만 가능합니다.");
      return;
    }

    setLogo(file);
    const url = URL.createObjectURL(file);
    setLogoPreview(url);
    setMessage(null);
  }, []);

  const clearLogo = useCallback(() => {
    setLogo(null);
    if (logoPreview) {
      URL.revokeObjectURL(logoPreview);
    }
    setLogoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [logoPreview]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    const result = await onSubmit({ input: form, logo });

    if (result.error) {
      setMessage(result.error);
      return;
    }

    setForm(initialState);
    clearLogo();
    setMessage("고객이 생성되고 기본 노드가 초기화되었습니다.");
  }

  return (
    <article className="panel-card client-form-card">
      <div className="section-heading">
        <h2>새 고객 등록</h2>
        <p>생성 시 `clients`, `nodes`, `sub_nodes`가 함께 준비됩니다.</p>
      </div>

      <form className="client-form" onSubmit={handleSubmit}>
        {/* Logo upload */}
        <div className="logo-upload-field">
          <span className="logo-upload-label">병원 로고</span>
          <div className="logo-upload-row">
            <button
              className="logo-upload-area"
              onClick={() => fileInputRef.current?.click()}
              type="button"
            >
              {logoPreview ? (
                <img
                  alt="로고 미리보기"
                  className="logo-preview-img"
                  src={logoPreview}
                />
              ) : (
                <div className="logo-placeholder">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="4" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                  </svg>
                  <span>로고 업로드</span>
                </div>
              )}
            </button>
            {logo && (
              <button
                className="logo-clear-btn"
                onClick={clearLogo}
                type="button"
              >
                삭제
              </button>
            )}
          </div>
          <input
            accept="image/*"
            hidden
            onChange={handleLogoChange}
            ref={fileInputRef}
            type="file"
          />
          <span className="logo-upload-hint">PNG, JPG, SVG (2MB 이하)</span>
        </div>

        <label>
          <span>병원명</span>
          <input
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            required
            value={form.name}
          />
        </label>
        <label>
          <span>지역</span>
          <input
            onChange={(event) => setForm((prev) => ({ ...prev, region: event.target.value }))}
            value={form.region}
          />
        </label>
        <label>
          <span>담당자 이름</span>
          <input
            onChange={(event) =>
              setForm((prev) => ({ ...prev, contact_name: event.target.value }))
            }
            value={form.contact_name}
          />
        </label>
        <label>
          <span>담당자 연락처</span>
          <input
            onChange={(event) =>
              setForm((prev) => ({ ...prev, contact_phone: event.target.value }))
            }
            value={form.contact_phone}
          />
        </label>
        <label>
          <span>담당자 이메일</span>
          <input
            onChange={(event) =>
              setForm((prev) => ({ ...prev, contact_email: event.target.value }))
            }
            type="email"
            value={form.contact_email}
          />
        </label>
        <label>
          <span>로그인 이메일</span>
          <input
            onChange={(event) => setForm((prev) => ({ ...prev, login_email: event.target.value }))}
            placeholder="초대 메일 발송 대상"
            type="email"
            value={form.login_email}
          />
        </label>
        <label>
          <span>패키지</span>
          <select
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                package_tier: event.target.value as PackageTier,
              }))
            }
            value={form.package_tier}
          >
            {packageOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>계약 시작일</span>
          <input
            onChange={(event) =>
              setForm((prev) => ({ ...prev, contract_start: event.target.value }))
            }
            type="date"
            value={form.contract_start}
          />
        </label>
        <label className="full-width">
          <span>내부 메모</span>
          <textarea
            onChange={(event) => setForm((prev) => ({ ...prev, memo: event.target.value }))}
            rows={4}
            value={form.memo}
          />
        </label>

        {message ? <p className="form-hint">{message}</p> : null}

        <button className="primary-button" disabled={creating} type="submit">
          {creating ? "생성 중..." : "고객 생성"}
        </button>
      </form>
    </article>
  );
}
