# PROGRESS — FixItNow Frontend

**Status: Public site ✅ · Auth ✅ · All 3 dashboards (Admin/Customer/Technician) built ✅ · Payment integration ⏳ next · Reviews ⬜ · Booking-creation flow ⬜**

> Detailed build plan lives in `planning.md`. This file tracks what's actually done vs. pending.

## Setup done
- Installed: `@tanstack/react-query`, `zod`, `sonner`, `server-only`, `jsonwebtoken`, `radix-ui`
- Created `.env`/`.env.local` → `BACKEND_URL=https://fixitnow-two.vercel.app`
- Root `app/layout.tsx`: sonner `<Toaster>`, title "FixItNow"

## Core libs (`lib/`)
- `types.ts` — all enums/entities/request + enriched list shapes from `ApiDocumentation.md`
- `api.ts` — `serverFetch` (unwraps envelope), `serverFetchPage` (unwraps envelope **and** the real nested `data: { meta, data }` shape — see Bugfixes below), `getAccessToken`/`getRole`/`decodeJwtRole`, `ApiError`
- `backend.ts` — `BACKEND_URL`, `TOKEN_COOKIE`
- `fetch-backend.ts` — `backendFetch` with 3 retries, 20s request timeout, 5s connect timeout, retries on timeouts
- `http.ts` — `routeError` → consistent `{ error }` JSON
- `client-fetch.ts` — `clientFetch` (client → our own `/api/*`)
- `booking-status.ts` — status → badge/color mapping
- `utils.ts` — `cn()`, `formatBDT`, `formatDate`, `formatDateTime`
- **No refresh-token flow** — single `accessToken` (1 day) httpOnly cookie; backend has no refresh route (verified 404)

## Edge/auth
- `proxy.ts` — **Next 16: `middleware` renamed to `proxy`**. `AUTH_ROUTES` (`/login`, `/register`) bounce logged-in users to role home; `PUBLIC_ROUTES` (`/`, `/services`); protected pages → `/login?next=`; role gates `/dashboard` (CUSTOMER), `/technician-dashboard` (TECHNICIAN), `/admin-dashboard` (ADMIN)
- `app/api/auth/{login,register,me,logout}/route.ts` — BFF proxies; login/register set `accessToken` httpOnly cookie
- Login/Register UI in `app/(auth)/` (server action + `useActionState`)

## Public site ✅
- Home: Hero, Categories, HowItWorks, Pros, TrustStrip, FAQ, CTA
- `app/(public-route)/_actions/` — `getAllCategory`, `getAllServices`, `getAllTechnician`, `getAllReviews`
- `/services` + `ServicesBoard`/`ServiceCard` (search, category filter, pagination); `/services/[id]` detail (`job-ticket`, `technician-card`, `job-ledger`, reviews)
- Custom `loading.tsx`/`error.tsx`/`not-found.tsx`; paper-ticket design system (Bricolage/Archivo/IBM Plex Mono, hard-shadow cards, ticket tokens)

## Dashboards ✅ (route group `app/(dashboaredGroup)/`)
All data access via server actions in `app/(dashboaredGroup)/_actions/` + `router.refresh()` (no React Query in use).

- **CUSTOMER (`/dashboard`)** — overview (stats, recent bookings), bookings list (status badge, Pay-now stub ⏳, cancel dialog), payments history, profile
- **TECHNICIAN (`/technician-dashboard`)** — overview, profile form, availability sheet (weekly), services board (create service), bookings (accept/decline/start/complete via `updateBookingStatus`)
- **ADMIN (`/admin-dashboard`)** — overview (users/bookings/revenue stats), users board (search/filter/pagination/ban-unban), bookings table (read-only + detail dialog), categories (create), profile

## Payment integration ⏳ NEXT (plan agreed)
Flow: Pay now → `POST /api/payment/create` → redirect to returned `paymentURL` (Stripe) → success redirects to `/dashboard/bookings` → watcher confirms → booking `PAID`.

Verified backend behavior (`FixItNow-Backend/src/models/payment/`):
- `POST /api/payment/create` (CUSTOMER): validates booking exists/owned/`ACCEPTED`/not already paid → upserts `PENDING` payment + fresh `transactionId` → Stripe Checkout session → returns `{ transactionId, paymentURL }`. Errors: 404 / 403 / 400 / 409.
- `success_url` is **hardcoded** to `${APP_URL}/dashboard/bookings` — the doc's `/payment/success?tran_id=` does NOT exist. So the confirming state lives on the bookings page, and **no `/payment/success` page is needed**.
- `cancel_url` = `${APP_URL}/payment/cancel?tran_id=<txn>` → build a `/payment/cancel` page.
- Webhook `/api/payment/confirm` is **Stripe → server only** (payment `COMPLETED` + booking `PAID`, or payment `FAILED` on expiry). Never call from frontend.
- `GET /api/payment/` and `/api/payment/:id` — plain array / single object (already working).

### Build list
- [ ] `app/(dashboaredGroup)/_actions/createPayment.ts` — server action → `POST /api/payment/create`, returns `{ success, message, data?: { transactionId, paymentURL } }`; map 400 → "not ACCEPTED anymore", 409 → "already paid"
- [ ] `app/(dashboaredGroup)/_components/booking-actions.tsx` — real Pay button: `useTransition` → `createPayment` → `window.location.href = paymentURL`; disabled while `payment.status === "PENDING"`; error toasts
- [ ] `app/(dashboaredGroup)/_components/payment-confirm-watcher.tsx` — client watcher: if any booking has `payment.status === "PENDING"`, poll `getMyBookings()` every 2s (max 5), then `router.refresh()` + success toast; fallback "still confirming" message
- [ ] `app/(dashboaredGroup)/dashboard/bookings/page.tsx` — mount the watcher
- [ ] `app/payment/cancel/page.tsx` — reads `?tran_id=`, "Payment cancelled — retry from your dashboard", link to `/dashboard/bookings`

### Prerequisites (backend, out of this repo)
- Backend `.env` `APP_URL` must point at the frontend base URL (local: `http://localhost:3000`) or Stripe redirects break
- Stripe **test mode**; webhook configured to hit the deployed backend `/api/payment/confirm`
- An `ACCEPTED` booking to test against (booking-creation flow doesn't exist yet — seed via API)

### Test checklist
1. Booking `ACCEPTED` → Pay button visible
2. Pay → Stripe test card `4242 4242 4242 4242` → land on `/dashboard/bookings`
3. Watcher polls → booking `PAID`, payment `COMPLETED`
4. `/dashboard/payments` shows `COMPLETED`; Pay button gone (status now PAID)
5. Stripe cancel → `/payment/cancel?tran_id=...`; payment shows `FAILED`

## Known gaps / later work
- ⬜ **Booking creation flow** — customers can't book yet (no `POST /api/bookings/create` action/UI). Blocks end-to-end payment testing without seeded data
- ⬜ **Reviews (Phase 5)** — `POST /api/review/` + review dialog on COMPLETED bookings
- ⬜ **Zod validation** — installed but unused so far
- ⬜ **`/payment/success` page** — intentionally skipped (backend success_url → `/dashboard/bookings`)

## Bugfixes (recent)
- **`serverFetchPage` nested shape** — backend wraps paginated data as `data: { meta, data: [...] }` (not flat as the doc claims). `serverFetchPage` now unwraps both shapes. This fixed the admin overview crash (`users.data.filter`) and the "0 records" roster.
- **Backend timeouts** — `backendFetch` timeout raised 5s → 20s, connect 3s → 5s, and timeouts are now retried (the admin `allUsers` query was >5s).
- **Silent admin errors** — users page now surfaces fetch errors ("Roster unavailable") instead of rendering an empty table.

## Verification
- `npx tsc --noEmit` ✅ (only pre-existing `app/layout.tsx` unused-import warnings via lint)
- `npm run lint` ✅ (0 errors)
- `npm run build` — was failing only on prerendering `/` (needs live backend); compile + typecheck pass
