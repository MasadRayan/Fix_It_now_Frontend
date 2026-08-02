# PROGRESS — FixItNow Frontend

**Status: Phase 1 (Marketing/home) ✅ + Auth ✅ complete. Phase 2 (Dashboards) in progress — stub pages created, no CRUD yet.**

## Setup done
- Installed: `@tanstack/react-query`, `zod`, `sonner`, `server-only`, `jsonwebtoken`, `radix-ui`
- Created `.env`/`.env.local` → `BACKEND_URL=https://fixitnow-two.vercel.app`
- Root `app/layout.tsx` updated: `<Providers>` (React Query) + sonner `<Toaster>`, title "FixItNow"

## Core libs (`lib/`)
- `types.ts` — all enums/entities/request + enriched list shapes from `ApiDocumentation.md`
- `api.ts` — `serverFetch` (server-only, attaches Bearer from `accessToken` cookie, throws `ApiError`, unwraps envelope) + `getAccessToken`/`getRole`/`decodeJwtRole`
- `http.ts` — `routeError` → consistent `{ error }` JSON
- `client-fetch.ts` — `clientFetch` → our own `/api/*`
- `utils.ts` — `cn()`
- **`session.ts` was deleted** — auth handled directly in server actions; only `accessToken` (1 day) httpOnly cookie exists. No refresh-token flow (backend has no `/api/auth/refresh-token` — verified 404).

## Edge/auth
- `proxy.ts` — **Next 16: `middleware` renamed to `proxy`**. Global matcher; `AUTH_ROUTES` (`/login`, `/register`) bounce logged-in users to their role home; `PUBLIC_ROUTES` (`/`, `/services`); protected pages redirect to `/login?next=`; role-based access for `/dashboard` (CUSTOMER), `/technician-dashboard` (TECHNICIAN), `/admin-dashboard` (ADMIN).
- `app/api/auth/{login,register,me,logout}/route.ts` — BFF proxies; login/register set `accessToken` httpOnly cookie (login also decodes role).
- Auth handled via server action: `app/(auth)/_actions/authAction.ts` (`loginAction`) + `app/(auth)/_components/LoginForm.tsx` (useActionState).

## Auth UI
- `app/(auth)/layout.tsx`, `login/page.tsx` (server component, branded split-screen), `register/page.tsx` (role toggle CUSTOMER/TECHNICIAN, auto-login after register)

## Public site (Phase 1) ✅
- Home (`app/(public-route)/page.tsx`): Hero, Categories, HowItWorks, Pros, TrustStrip, FAQ, CTA
- `app/(public-route)/_actions/` — `getAllCategory`, `getAllServices`, `getAllTechnician`, `getAllReviews` (server actions, full envelope unwrapped)
- `/services` page + `ServicesBoard`/`ServiceCard` (search, category filter, pagination, clear-filters)
- Custom `app/loading.tsx` (dispatch-ticket), `app/error.tsx`, `app/not-found.tsx`
- Design system: paper-ticket tokens (`ticket`/`ink`/`board`/`bone`/`safety`/`edge`/`steel`), Bricolage+Archivo+IBM Plex Mono fonts, hard-shadow cards, punch-hole/ticket-stub artifacts

## Dashboard (Phase 2 — in progress)
- Restructured into route group `app/(dashboaredGroup)/`
- `dashboard/page.tsx` (CUSTOMER), `technician-dashboard/page.tsx`, `admin-dashboard/page.tsx` — **empty stubs**
- `components/dashboard-shell.tsx` — topbar + role nav + logout (nav updated to new routes)
- Old `app/dashboard/*` deleted

## Error/404 + UI kit (`components/ui/`)
- `button.tsx`, `card.tsx`, `badge.tsx`, `input.tsx` (Input/Textarea/Select/Label/Field), `dialog.tsx`, `skeleton.tsx`, `empty-state.tsx`

## Verification
- `npx tsc --noEmit` ✅ (clean)
- `npm run lint` ✅ (clean)
- `npm run build` — **fails only because prerendering `/` needs the live backend (network timeout)**; compile + typecheck pass. Not a code error.

## Next up (per rubric gaps)
1. **Core CRUD (20%)** — build the 3 dashboards:
   - CUSTOMER (`/dashboard`): bookings list, create booking flow
   - TECHNICIAN (`/technician-dashboard`): own services CRUD (`POST/GET /api/services/`), profile (`PATCH /api/technician/profile`), availability (`PUT /api/technician/availability`), accept/decline bookings
   - ADMIN (`/admin-dashboard`): users list/ban, categories create/delete, bookings table
2. **Payment (10%)** — Stripe checkout: `POST /api/payment/create` → redirect → success/cancel pages → refresh booking state
3. **Validation & errors (10%)** — actually use `zod` for form validation; add `global-error.tsx` + per-dashboard error/loading boundaries
4. **Commits (10%)** — 17/20 so far; reach 20+ with conventional commits while building the above
