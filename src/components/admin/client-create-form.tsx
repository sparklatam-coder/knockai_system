"use client";

import { useMemo, useState } from "react";
import type { ClientCreateInput, PackageTier } from "@/lib/types";

interface ClientCreateFormProps {
  creating: boolean;
  onSubmit: (input: ClientCreateInput) => Promise<{ error: string | null }>;
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
  const [message, setMessage] = useState<string | null>(null);

  const packageOptions = useMemo<PackageTier[]>(() => ["basic", "standard", "premium"], []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    const result = await onSubmit(form);

    if (result.error) {
      setMessage(result.error);
      return;
    }

    setForm(initialState);
    setMessage("고객이 생성되고 기본 노드가 초기화되었습니다.");
  }

  return (
    <article className="panel-card client-form-card">
      <div className="section-heading">
        <h2>새 고객 등록</h2>
        <p>생성 시 `clients`, `nodes`, `sub_nodes`가 함께 준비됩니다.</p>
      </div>

      <form className="client-form" onSubmit={handleSubmit}>
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
