import { Suspense } from "react";
import { SetPasswordForm } from "@/components/auth/set-password-form";

export default function SetPasswordPage() {
  return (
    <main className="auth-page">
      <Suspense fallback={<div className="state-card">로딩 중...</div>}>
        <SetPasswordForm />
      </Suspense>
    </main>
  );
}
