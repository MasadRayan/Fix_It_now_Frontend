# FixItNow Frontend — Implementation Plan

Status legend: ✅ done · ⏳ next · ⬜ not started

This plan is ordered by **dependency**, not by role — each phase unblocks the
next. Don't skip ahead; e.g. you can't test bookings without services, can't
test payments without an ACCEPTED booking, can't test reviews without a
COMPLETED booking.

---

## Phase 0 — Foundation ✅ DONE

- [x] Next.js App Router + TypeScript + Tailwind scaffold, design tokens
- [x] `lib/types.ts` — all entity types mirrored from API docs
- [x] `lib/api.ts` — `serverFetch` (server-only, attaches JWT, throws `ApiError`)
- [x] `lib/http.ts` — `routeError` (consistent error → JSON response)
- [x] `lib/client-fetch.ts` — `clientFetch` (client → our own `/api/*`)
- [x] `lib/session.ts` — httpOnly cookie session (BFF pattern)
- [x] `middleware.ts` — role-gated `/dashboard/*`
- [x] Auth: register, login, logout, `/api/auth/me`
- [x] `app/error.tsx`, `app/not-found.tsx`
- [x] Dashboard shells for all 3 roles + topbar

---

## Phase 1 — Categories & Services (public browsing) ⏳ NEXT

Needed before bookings can exist. Do this phase whole before touching bookings.

### 1.1 Categories
- [ ] `lib/schemas/category.ts` — Zod schema for `CreateCategoryRequest`
- [ ] `app/api/categories/route.ts`
  - `GET` → proxies `GET /api/category/` (public, supports `search`, `page`, `limit`)
  - `POST` → proxies `POST /api/admin/categories` (ADMIN only; backend enforces role, we just forward)
- [ ] `hooks/use-categories.ts` — `useCategories()` (React Query), `useCreateCategory()` mutation
- [ ] Reusable `components/category-pill.tsx` for filter UI

### 1.2 Services
- [ ] `app/api/services/route.ts`
  - `GET` → proxies `GET /api/services/` with query passthrough (`search`, `category`, `location`, `minPrice`, `maxPrice`, `minRating`, `page`, `limit`)
  - `POST` → proxies `POST /api/services/` (TECHNICIAN only)
- [ ] `hooks/use-services.ts` — `useServices(filters)`, `useCreateService()`
- [ ] `components/service-card.tsx` — image via `next/image`, price, rating, category badge
- [ ] `components/loading-skeletons/service-card-skeleton.tsx`
- [ ] `app/services/page.tsx` — Server Component shell + Client filter bar
  - Sidebar/top filter bar: category pills, location input, price range, min rating (debounced)
  - Grid of `ServiceCard`, empty state, `loading.tsx` with skeletons
- [ ] `app/services/loading.tsx`, `app/services/error.tsx`

### 1.3 Technicians (public)
- [ ] `app/api/technicians/route.ts` → proxies `GET /api/technician/` (filters: `search`, `skill`, `location`, `category`, `minRating`, `minExperience`)
- [ ] `app/api/technicians/[id]/route.ts` → proxies `GET /api/technician/:id` (note: `TechnicianProfile.id`, not `User.id`)
- [ ] `hooks/use-technicians.ts` — `useTechnicians(filters)`, `useTechnician(id)`
- [ ] `components/technician-card.tsx`
- [ ] `app/technicians/[id]/page.tsx` — bio, skills, rating, reviews list, services offered, "Book Now" CTA (date/time picker — stub for now, wired fully in Phase 3)

### 1.4 Home page
- [ ] Replace placeholder `app/page.tsx` hero with real featured services (`GET /api/services?limit=6`) + top-rated technicians section, both using `next/image`

**Checkpoint:** Anyone (logged out) can browse `/services`, filter, open a technician profile. No auth required yet.

---

## Phase 2 — Technician Self-Service (profile + availability + service creation) ⬜

Technicians need this before customers can book them meaningfully (a technician
with no services/availability has nothing to book).

- [ ] `app/api/technician/profile/route.ts` → `PATCH` proxies `PATCH /api/technician/profile`
- [ ] `app/api/technician/availability/route.ts` → `PUT` proxies `PUT /api/technician/availability`
- [ ] `hooks/use-technician-profile.ts` — `useUpdateProfile()`, `useSetAvailability()`
- [ ] `app/dashboard/technician/profile/page.tsx` — form: bio, skills (tag input), hourlyRate, experienceYrs, location, avatarUrl
- [ ] `app/dashboard/technician/availability/page.tsx` — weekly grid (Mon–Sun), click a day → add `{startTime, endTime}` block, remove block, "Save schedule" → `PUT` (full replace, so build the complete array client-side before submit)
- [ ] `app/dashboard/technician/services/page.tsx` — list own services (filter `GET /api/services/` isn't scoped to technician by the API, so filter client-side by `technicianId === session.id` after fetch, or fetch via `/api/technicians/[technicianProfileId]` which includes `services`) + "Add service" form (`POST /api/services/`, `category` = name not id, pull category list from Phase 1.1)
- [ ] Update `app/dashboard/technician/page.tsx` — replace placeholder with real overview: upcoming jobs count, pending requests count (from Phase 3 booking hook), quick links to profile/availability/services

**Checkpoint:** A technician can log in, complete their profile, set weekly availability, and publish at least one service. Verify by re-visiting `/technicians/[id]` as a logged-out user and seeing the new data.

---

## Phase 3 — Booking Flow (core functionality) ⬜

The centerpiece feature — booking status machine drives everything after this.

- [ ] `lib/booking-status.ts` — single source of truth: status → badge color, status → allowed next actions per role (mirrors the table in the assignment doc exactly)
- [ ] `app/api/bookings/route.ts`
  - `GET` → proxies `GET /api/bookings` (role-aware response shape from backend, pass through as-is)
  - `POST` → proxies `POST /api/bookings/create`
- [ ] `app/api/bookings/[id]/route.ts` → `GET` proxies `GET /api/bookings/:id`
- [ ] `app/api/bookings/[id]/status/route.ts` → `PATCH` proxies `PATCH /api/bookings/status/:id`
- [ ] `app/api/bookings/[id]/cancel/route.ts` → `PATCH` proxies `PATCH /api/bookings/:id/cancel`
- [ ] `hooks/use-bookings.ts` — `useBookings()`, `useBooking(id)`, `useCreateBooking()`, `useUpdateBookingStatus()` (invalidate `["bookings"]` on success — no full reload), `useCancelBooking()`
- [ ] `components/booking-status-badge.tsx` — colored badge per `lib/booking-status.ts`
- [ ] **Customer booking creation** — on `app/technicians/[id]/page.tsx`:
  - [ ] Service picker (from that technician's `services[]`)
  - [ ] Date/time picker constrained to the technician's `availability` (Phase 2) — client-side validate against `dayOfWeek`/`startTime`/`endTime` before submit, but the real guard is server-side
  - [ ] Address field — **must validate client-side that it contains the technician's `location` substring** (case-insensitive) before submitting, so the user gets an inline error instead of a 400 toast; still handle the 400 gracefully if they bypass it
  - [ ] Notes field (optional)
  - [ ] Submit → `useCreateBooking()` → toast + redirect to `/dashboard/customer`
- [ ] **Customer dashboard** — `app/dashboard/customer/bookings/page.tsx`
  - [ ] Table/list of own bookings, `BookingStatusBadge`, conditional actions:
    - `ACCEPTED` → "Pay Now" button → links to Phase 4 pay page
    - `REQUESTED | ACCEPTED | PAID` → "Cancel" button (confirm dialog, optional `cancelReason` input) → `useCancelBooking()`
    - `COMPLETED` → "Leave Review" button → Phase 5
  - [ ] Update `app/dashboard/customer/page.tsx` overview to pull real counts
- [ ] **Technician booking management** — `app/dashboard/technician/bookings/page.tsx`
  - [ ] Table of incoming bookings, action buttons per status:
    - `REQUESTED` → Accept / Decline
    - `PAID` → Start Job (`IN_PROGRESS`)
    - `IN_PROGRESS` → Complete Job (`COMPLETED`)
  - [ ] Optimistic update or query invalidation on every status change (assignment explicitly calls this out — no full page reload)
- [ ] `app/dashboard/customer/bookings/loading.tsx`, `app/dashboard/technician/bookings/loading.tsx` — skeleton rows

**Checkpoint:** Full loop works end-to-end except payment: customer books →
technician accepts → (skip payment for now, can't reach PAID) → confirm
cancel works on REQUESTED/ACCEPTED, confirm illegal transitions are blocked
in the UI (don't show "Complete" button on a REQUESTED booking).

---

## Phase 4 — Payment Integration (mandatory, Stripe) ⬜

Only reachable once a booking is `ACCEPTED` (Phase 3).

- [ ] `app/api/payments/route.ts`
  - `POST` → proxies `POST /api/payment/create` (body: `{bookingId}`)
  - `GET` → proxies `GET /api/payment/` (customer's own history)
- [ ] `app/api/payments/[id]/route.ts` → `GET` proxies `GET /api/payment/:id`
- [ ] `hooks/use-payments.ts` — `useCreatePayment()`, `usePayments()`, `usePayment(id)`
- [ ] `app/dashboard/customer/bookings/[id]/pay/page.tsx`
  - [ ] Show booking summary (service, technician, price)
  - [ ] "Pay with Stripe" button → `useCreatePayment()` → on success, `window.location.href = data.paymentURL` (full redirect to Stripe-hosted checkout, not a new tab, so the return URL comes back to our app cleanly)
  - [ ] Loading state while the session is being created
- [ ] `app/payment/success/page.tsx`
  - [ ] Reads `?tran_id=` from `useSearchParams()`
  - [ ] Because the webhook flips status asynchronously, **poll** `GET /api/payments/[id]` or re-fetch the booking every 2s (max ~5 tries) until `status === "COMPLETED"` / booking `status === "PAID"`, then show success state with a link back to the dashboard
  - [ ] Fallback message if still pending after max retries: "Payment is confirming — check your dashboard shortly" (don't hang forever)
- [ ] `app/payment/cancel/page.tsx` — simple "Payment was cancelled, you can try again from your dashboard" + link back to the pay page
- [ ] `app/dashboard/customer/payments/page.tsx` — payment history table (`usePayments()`), status badges, links to related booking
- [ ] Note in `API_INTEGRATION.md`: `/api/payment/confirm` is a **Stripe webhook**, never called from the frontend — do not build a route for it

**Checkpoint:** Use Stripe test card `4242 4242 4242 4242`. Full loop:
book → accept → pay → land on `/payment/success` → booking flips to `PAID` →
technician can now start the job.

---

## Phase 5 — Reviews ⬜

Only reachable once a booking is `COMPLETED` (needs technician to finish
Phase 3's Start/Complete actions after payment).

- [ ] `app/api/reviews/route.ts` → `POST` proxies `POST /api/review/`
- [ ] `hooks/use-reviews.ts` — `useCreateReview()`
- [ ] `components/review-form-dialog.tsx` — star rating (1–5) + comment, opens from the "Leave Review" button in the customer bookings table
- [ ] On success: toast + invalidate bookings query (button should disappear/change once reviewed — track this by checking `booking.review` if the backend includes it, otherwise track locally reviewed IDs in the query cache)
- [ ] Reviews already display on `app/technicians/[id]/page.tsx` (Phase 1.3) — verify a new review appears after submission (invalidate that query too)

**Checkpoint:** Complete the full customer journey end-to-end once: register →
browse → book → (technician accepts) → pay → (technician starts + completes)
→ review → review shows on technician's public profile.

---

## Phase 6 — Admin Panel ⬜

Independent of the customer/technician loop — can be built in parallel with
Phase 3–5 if you have two people, otherwise do it last since it's lower
weight per booking-status testing dependencies (admin just *views* bookings,
doesn't drive the state machine).

- [ ] `app/api/admin/users/route.ts` → `GET` proxies `GET /api/admin/allUsers` (filters: `role`, `status`, `search`, `page`, `limit`)
- [ ] `app/api/admin/users/[id]/route.ts` → `PATCH` proxies `PATCH /api/admin/user/:id`
- [ ] `app/api/admin/bookings/route.ts` → `GET` proxies `GET /api/admin/bookings` (filters: `status`, `customerId`, `technicianId`, `fromDate`, `toDate`, `search`, `page`, `limit`)
- [ ] `app/api/admin/categories/route.ts` → already covered by Phase 1.1's `POST`; add `GET` here proxying `GET /api/admin/categories` (includes inactive categories — different from the public one)
- [ ] `hooks/use-admin.ts` — `useAdminUsers(filters)`, `useBanUser()`, `useAdminBookings(filters)`, `useAdminCategories()`, `useCreateCategory()` (reuse from 1.1 if not already)
- [ ] `app/dashboard/admin/users/page.tsx` — data table, search box, role/status filter dropdowns, pagination, Ban/Unban button per row (confirm dialog; disable button + show "Admin" label on admin rows since they can't be changed)
- [ ] `app/dashboard/admin/bookings/page.tsx` — data table, status/date filters, read-only (admin doesn't drive transitions per the API)
- [ ] `app/dashboard/admin/categories/page.tsx` — table of all categories + "Add category" form (name, description)
- [ ] Update `app/dashboard/admin/page.tsx` overview — total users, active bookings, revenue (sum `payments` if you fetch them, or compute from `admin/bookings` `priceAtBooking` where `status` implies paid — document whichever approach you pick)

**Checkpoint:** Admin can search/filter/paginate users, ban a test customer
account, confirm that banned account gets a `403` on next login attempt
(handled gracefully by the login form's error toast).

---

## Phase 7 — Cross-cutting polish (do continuously, not just at the end) ⬜

Spread these across every phase above rather than bolting on at the end —
grading weights UI/UX and error handling at 30% combined.

- [ ] **Loading states**: every data-fetching route gets a `loading.tsx` with skeletons matching the eventual layout (not a generic spinner)
- [ ] **Error boundaries**: every route segment with a data dependency gets an `error.tsx`
- [ ] **Toast consistency**: every mutation (create/update/delete) shows a success or error toast — audit at the end that none were missed
- [ ] **Empty states**: no results after filtering, zero bookings, zero services — each needs a designed empty state, not a blank div
- [ ] **Responsive pass**: test every page at 375px, 768px, 1280px — nav collapses to a menu on mobile, tables become stacked cards on mobile
- [ ] **`next/image`** everywhere an avatar/service image appears — no raw `<img>`
- [ ] **Accessibility**: every form input has a `<label>`, every icon-only button has `aria-label`, keyboard focus visible (already global via `globals.css`), confirm dialogs are keyboard-dismissable
- [ ] **Optimistic UI or invalidation** on all booking status changes (explicit assignment requirement — verify no page does a hard reload after a mutation)

---

## Suggested working order (single developer, deadline-aware)

1. Phase 1 (browsing) — unlocks visible progress fast, no auth complexity
2. Phase 2 (technician self-service) — needed to have real bookable data
3. Phase 3 (bookings) — the core grading category (20%)
4. Phase 4 (payment) — mandatory, but scoped small once Phase 3 exists
5. Phase 5 (reviews) — small, fast once Phase 3/4 work
6. Phase 6 (admin) — independent, do whenever time allows
7. Phase 7 — fold in as you go, don't save for the end
8. Phase 8 — final day only