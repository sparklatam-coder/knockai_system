"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { getSupabaseBrowserClient } from "@/lib/supabase";

export function SetPasswordForm() {
  const { user, loading } = useAuth();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = "/login?error=session_expired";
    }
  }, [loading, user]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("비밀번호는 8자 이상이어야 합니다.");
      return;
    }

    if (password !== confirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    setSubmitting(true);

    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setError("Supabase 환경변수가 설정되지 않았습니다.");
      setSubmitting(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      setError(updateError.message);
      setSubmitting(false);
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 2000);
  }

  if (loading) {
    return <div className="state-card">세션을 확인하는 중...</div>;
  }

  if (success) {
    return (
      <section className="auth-card">
        <div className="auth-header">
          <span className="hero-badge">KNOCK 병원 마케팅 시스템</span>
          <h1>설정 완료</h1>
          <p>비밀번호가 설정되었습니다. 대시보드로 이동합니다...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="auth-card">
      <div className="auth-header">
        <span className="hero-badge">KNOCK 병원 마케팅 시스템</span>
        <h1>비밀번호 설정</h1>
        <p>
          환영합니다, <strong>{user?.email}</strong>님!
          <br />
          로그인에 사용할 비밀번호를 설정해 주세요.
        </p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          <span>새 비밀번호</span>
          <input
            autoComplete="new-password"
            minLength={8}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="8자 이상"
            type="password"
            value={password}
          />
        </label>

        <label>
          <span>비밀번호 확인</span>
          <input
            autoComplete="new-password"
            minLength={8}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="다시 한 번 입력"
            type="password"
            value={confirm}
          />
        </label>

        {error ? <p className="form-error">{error}</p> : null}

        <button className="primary-button" disabled={submitting} type="submit">
          {submitting ? "설정 중..." : "비밀번호 설정"}
        </button>
      </form>
    </section>
  );
}
