import type { ReactNode } from "react";
import { GlobalNav } from "@/components/layout/GlobalNav";
import { SessionActions } from "@/components/layout/session-actions";

interface DashboardShellProps {
  title: string;
  description: string;
  children: ReactNode;
  actions?: ReactNode;
  showSessionActions?: boolean;
  hideNav?: boolean;
}

export function DashboardShell({
  title,
  description,
  children,
  actions,
  showSessionActions = true,
  hideNav = false,
}: DashboardShellProps) {
  return (
    <div className="dashboard-shell">
      {!hideNav && <GlobalNav />}

      <header className="dashboard-topbar">
        <div>
          <div className="hero-badge">KNOCK 병원 마케팅 시스템</div>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
      </header>

      {showSessionActions ? <SessionActions /> : null}

      {actions ? <div className="shell-actions">{actions}</div> : null}

      <main className="dashboard-content page-fade-in">{children}</main>
    </div>
  );
}
