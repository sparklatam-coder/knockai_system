# Supabase Setup

## 1. Create Project

- Create a new Supabase project.
- Open `Project Settings -> API` and copy:
  - `Project URL`
  - `anon` key
  - `service_role` key

## 2. Add Local Environment Variables

Create `/Users/joseph/knock_hospital_client_solution/.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Notes:

- `NEXT_PUBLIC_*` values are used by browser auth and middleware.
- `SUPABASE_SERVICE_ROLE_KEY` is used only by server-side admin APIs.
- Never expose the service role key to the browser.

## 3. Run SQL

In the Supabase SQL Editor, run files in this order:

1. `/Users/joseph/knock_hospital_client_solution/files/migration_001_initial.sql`
2. `/Users/joseph/knock_hospital_client_solution/files/seed_data.sql`

Expected result:

- `clients`
- `nodes`
- `sub_nodes`
- `activity_logs`
- `inquiries`

## 4. Create Admin Account

Create one auth user in `Authentication -> Users`.

After creation, set the user's metadata so the account is treated as admin:

```json
{
  "role": "admin"
}
```

Current app behavior:

- Admin route checks use `user_metadata.role === 'admin'`
- Client route data uses `clients.auth_user_id`
- New customer creation can invite a client email when the service role key is present

## 5. Link Seed Data for Client Login Testing

For a client test account, update one seeded client row with the auth user id:

```sql
update clients
set auth_user_id = '<SUPABASE_AUTH_USER_ID>'
where id = 'a1111111-1111-1111-1111-111111111111';
```

You can repeat that for another seeded client if needed.

## 6. Start App

```bash
npm run dev
```

Useful routes:

- `http://localhost:3000/login`
- `http://localhost:3000/admin/clients`
- `http://localhost:3000/dashboard`

## 7. What Works Now

- Login form wired to Supabase auth
- Middleware-based protected routes
- Admin customer list fetch
- Admin customer creation
- Auto-initialize 10 nodes + default sub-nodes
- Admin customer detail fetch
- Node status update
- Sub-node checkbox toggle
- Activity log creation
- Client read-only dashboard fetch

## 8. Current Constraint

Actual end-to-end verification still requires:

- A real Supabase project
- Valid keys in `.env.local`
- At least one admin auth user
- At least one client row linked through `clients.auth_user_id`
