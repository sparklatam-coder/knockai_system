"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { configured, isAuthenticated, role, signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const redirectTo = searchParams.get("redirectTo");

    if (redirectTo) {
      router.replace(redirectTo);
      return;
    }

    router.replace(role === "admin" ? "/admin/clients" : "/dashboard");
  }, [isAuthenticated, role, router, searchParams]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    const { error } = await signIn({ email, password });

    setIsSubmitting(false);

    if (error) {
      setErrorMessage(error);
    }
  }

  return (
    <section className="auth-card">
      <div className="auth-header">
        <span className="hero-badge">KNOCK 병원 마케팅 시스템</span>
        <h1>로그인</h1>
        <p>담당자 계정으로 로그인하여 대시보드를 확인하세요.</p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          <span>이메일</span>
          <input
            autoComplete="email"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="hospital@example.com"
            type="email"
            value={email}
          />
        </label>

        <label>
          <span>비밀번호</span>
          <input
            autoComplete="current-password"
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            type="password"
            value={password}
          />
        </label>

        {errorMessage ? <p className="form-error">{errorMessage}</p> : null}

        {!configured ? (
          <p className="form-hint">
            `.env.local`에 Supabase 공개 키를 넣으면 실제 로그인 테스트가 가능합니다.
          </p>
        ) : null}

        <button className="primary-button" disabled={isSubmitting || !configured} type="submit">
          {isSubmitting ? "로그인 중..." : "로그인"}
        </button>
      </form>

      <div className="auth-links">
        <Link href="/">홈으로</Link>
        <Link href="/admin/clients">관리자 화면</Link>
      </div>
    </section>
  );
}
