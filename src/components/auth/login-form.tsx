"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";

export function LoginForm() {
  const searchParams = useSearchParams();
  const { configured, signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    const { error } = await signIn({ email, password });

    if (error) {
      setIsSubmitting(false);
      setErrorMessage(error);
      return;
    }

    const redirectTo = searchParams.get("redirectTo") ?? "/admin/clients";
    window.location.href = redirectTo;
  }

  return (
    <div className="login-container">
      {/* Background decorations */}
      <div className="login-bg">
        <div className="login-bg-orb login-bg-orb--1" />
        <div className="login-bg-orb login-bg-orb--2" />
        <div className="login-bg-orb login-bg-orb--3" />
      </div>

      <section className="login-card">
        {/* Top accent line */}
        <div className="login-card-accent" />

        <div className="login-header">
          <div className="login-logo">
            <span>KN</span>
            <span className="login-logo-o">
              <span className="login-logo-ring" />
              <span className="login-logo-dot" />
            </span>
            <span>CK</span>
          </div>
          <h1>로그인</h1>
          <p>담당자 계정으로 로그인하여 대시보드를 확인하세요.</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="login-field">
            <span className="login-label">이메일</span>
            <div className="login-input-wrap">
              <svg className="login-input-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="16" height="12" rx="3" />
                <path d="M2 7l8 5 8-5" />
              </svg>
              <input
                autoComplete="email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="hospital@example.com"
                type="email"
                value={email}
              />
            </div>
          </label>

          <label className="login-field">
            <span className="login-label">비밀번호</span>
            <div className="login-input-wrap">
              <svg className="login-input-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="9" width="12" height="8" rx="2" />
                <path d="M7 9V6a3 3 0 016 0v3" />
              </svg>
              <input
                autoComplete="current-password"
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                type="password"
                value={password}
              />
            </div>
          </label>

          {errorMessage ? <p className="login-error">{errorMessage}</p> : null}

          {!configured ? (
            <p className="login-hint">
              .env.local에 Supabase 공개 키를 넣으면 실제 로그인 테스트가 가능합니다.
            </p>
          ) : null}

          <button className="login-submit" disabled={isSubmitting || !configured} type="submit">
            {isSubmitting ? (
              <>
                <span className="login-spinner" />
                로그인 중...
              </>
            ) : (
              "로그인"
            )}
          </button>
        </form>

        <div className="login-footer">
          <Link href="/">← 홈으로 돌아가기</Link>
        </div>
      </section>
    </div>
  );
}
