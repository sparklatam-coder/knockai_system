import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <main className="login-page">
      <Suspense fallback={<div className="state-card">로그인 화면을 불러오는 중입니다.</div>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
