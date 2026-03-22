import Link from "next/link";
import type { ReactNode } from "react";
import { SessionActions } from "@/components/layout/session-actions";

interface DashboardShellProps {
  title: string;
  description: string;
  children: ReactNode;
  actions?: ReactNode;
  showSessionActions?: boolean;
}

export function DashboardShell({
  title,
  description,
  children,
  actions,
  showSessionActions = true,
}: DashboardShellProps) {
  return (
    <div className="dashboard-shell">
      <header className="dashboard-topbar">
        <div>
          <div className="hero-badge">KNOCK 병원 마케팅 시스템</div>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>

        <nav className="shell-nav">
          <Link href="/">홈</Link>
          <Link href="/login">로그인</Link>
          <Link href="/admin/clients">관리자</Link>
          <Link href="/dashboard">고객 대시보드</Link>
        </nav>
      </header>

      {showSessionActions ? <SessionActions /> : null}

      {actions ? <div className="shell-actions">{actions}</div> : null}

      <main className="dashboard-content page-fade-in">{children}</main>
    </div>
  );
}
