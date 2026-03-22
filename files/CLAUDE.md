# KNOCK Hospital Customer Dashboard

## Project Overview
고객별 마케팅 플라이휠 진행 상태를 시각화하고, 활동 로그를 투명하게 공개하는 대시보드.
기존 영업용 정적 페이지(knockhospitalmktsystem.vercel.app)를 고객별 동적 대시보드로 전환.

## Tech Stack
- **Frontend**: React + TypeScript + Vite + TailwindCSS + shadcn/ui
- **Backend/DB**: Supabase (Auth + PostgreSQL + Storage + RLS)
- **Deployment**: Vercel
- **Package Manager**: pnpm

## Color System
```
--primary: #1A1A2E (deep navy)
--secondary: #16213E (dark blue)
--accent: #E94560 (coral red)
--accent2: #0F3460 (medium blue)
--success: #34C759 (green - active node)
--warning: #F9A825 (yellow - in progress node)
--inactive: #9E9E9E (gray - inactive node)
--locked: #E0E0E0 (light gray - locked node)
```

## Architecture Decisions
- Supabase Auth for authentication (email + password)
- RLS policies enforce client isolation (clients can only see their own data)
- Admin role stored in `user_metadata.role = 'admin'`
- Korean UI throughout (모든 UI 텍스트는 한국어)
- Mobile-first responsive design

## File Structure Convention
```
src/
  components/
    layout/          # Header, Sidebar, Layout wrappers
    flywheel/         # Flywheel visualization, NodeCard, StatusDot
    dashboard/        # DashboardView, LogTimeline, NodeDetailPanel
    admin/            # ClientList, ClientForm, LogEntryForm
    ui/               # shadcn/ui components
  pages/
    LoginPage.tsx
    AdminClientsPage.tsx
    AdminDashboardPage.tsx
    ClientDashboardPage.tsx
  hooks/
    useAuth.ts
    useClient.ts
    useNodes.ts
    useLogs.ts
  lib/
    supabase.ts       # Supabase client init
    types.ts          # TypeScript types matching DB schema
    constants.ts      # Node definitions, package mappings
  utils/
    nodeHelpers.ts    # Status color mapping, node label lookup
```

## Key Rules
- Never hardcode client data; always fetch from Supabase
- All Supabase queries go through custom hooks in `src/hooks/`
- Use `react-router-dom` for routing with protected routes
- Admin routes: `/admin/*`, Client routes: `/dashboard`
- Activity logs are always sorted newest-first
- Node status transitions: inactive → in_progress → active (one direction only, Admin can also reset)
- Locked nodes are determined by package_tier, not stored as status
