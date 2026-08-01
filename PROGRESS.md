# PROGRESS — FixItNow Frontend

**Status: Phase 0 (Foundation) ~90% complete. Paused at user request before continuing to Phase 1.**

## Setup done
- Installed: `@tanstack/react-query`, `zod`, `sonner`, `server-only` (zod not used yet)
- Created `.env.local` → `BACKEND_URL=https://fixitnow-two.vercel.app`
- Root `app/layout.tsx` updated: added `<Providers>` (React Query) + sonner `<Toaster>`, title "FixItNow"

## Files created

### Core libs (`lib/`)
- `types.ts` — all enums/entities/request + enriched list shapes from `ApiDocumentation.md`
- `api.ts` — `serverFetch` (server-only, attaches Bearer, throws `ApiError`, unwraps envelope)
- `session.ts` — `getSession`/`getAccessToken`/`setSessionCookies`/`clearSessionCookies`/`decodeJwtRole` (cookies `fixit_access`, `fixit_role`)
- `http.ts` — `routeError` → consistent `{ error }` JSON
- `client-fetch.ts` — `clientFetch` → our own `/api/*`
- `utils.ts` — `cn()`

### Edge/auth
- `proxy.ts` — **Next 16: `middleware` is renamed to `proxy`**; gates `/dashboard/*` by role cookie, redirects to `/login` (no session) or `/dashboard` (wrong role)
- `app/api/auth/{login,register,me,logout}/route.ts` — BFF proxies; login decodes JWT role and sets httpOnly cookies

### Auth UI
- `app/(auth)/layout.tsx`, `login/page.tsx`, `register/page.tsx` (role toggle CUSTOMER/TECHNICIAN, auto-login after register)

### Dashboard
- `app/dashboard/layout.tsx` (role-gated shell)
- `app/dashboard/page.tsx` (role → redirect)
- `app/dashboard/customer/page.tsx`
- `components/dashboard-shell.tsx` — topbar + role nav + logout

### Error/404 + UI kit (`components/ui/`)
- `app/error.tsx`, `app/not-found.tsx`
- `button.tsx`, `card.tsx`, `badge.tsx`, `input.tsx` (Input/Textarea/Select/Label/Field), `dialog.tsx`, `skeleton.tsx`, `empty-state.tsx`

## Remaining in Phase 0 (2 small stubs, write aborted at user request)
- `app/dashboard/technician/page.tsx`
- `app/dashboard/admin/page.tsx`

## Verification
- `npm run lint` and `npx tsc --noEmit` passed **before** the last few files were added; needs a re-run once Phase 0 stubs are finished.

## Key Next 16 facts applied
- `proxy.ts` replaces `middleware.ts`; `cookies()` and `params` are async (`await`).

## Next up (per planning.md, order preserved)
- Finish Phase 0 stubs → verify lint/typecheck/build → Phase 1 (Categories, Services, Technicians, Home).
