<div align="center">

# 🔧 FixItNow — Frontend

**Home services, booked in minutes.**

Vetted technicians for plumbing, electrics, AC and more across Dhaka. Fixed prices in taka, booked in minutes — with end-to-end booking, Stripe payments and role-based dashboards for customers, technicians and admins.

<br/>

[![Next.js](https://img.shields.io/badge/Next.js%2016-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![React 19](https://img.shields.io/badge/React%2019-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS%204-38BDF8?logo=tailwindcss&logoColor=black)](https://tailwindcss.com)
[![shadcn/ui](https://img.shields.io/badge/shadcn--ui-000000?logo=shadcnui&logoColor=white)](https://ui.shadcn.com)

</div>

---

## 🔗 Live Links

| Resource | URL |
| --- | --- |
| 🌐 **Live Frontend** | [https://fixiitnow-frontend.vercel.app/](https://fixiitnow-frontend.vercel.app/) |
| ⚙️ **Backend API** | [https://fixitnow-two.vercel.app/](https://fixitnow-two.vercel.app/) |
| 🐙 **Frontend Repo** | [github.com/MasadRayan/Fix_It_now_Frontend](https://github.com/MasadRayan/Fix_It_now_Frontend) |
| 🔗 **Backend Repo** | [github.com/MasadRayan/FixItNow-Backend](https://github.com/MasadRayan/FixItNow-Backend) |

---

## 📖 Project Overview

**FixItNow** connects customers with vetted, verified technicians across Dhaka. Customers browse categories and services, book a technician for a future slot, pay securely through **Stripe Checkout**, and track the job through a live status timeline. Technicians manage their services, weekly availability and incoming bookings. Admins get a full command center over users, categories and bookings.

Built with the **Next.js App Router** (React Server Components + Server Actions), **React Query** for data synchronization, and a **custom middleware proxy** that guards every route by decoded JWT role (`CUSTOMER`, `TECHNICIAN`, `ADMIN`). All backend calls flow through a typed server-fetch layer and are fully documented in [`API_INTEGRATION.md`](API_INTEGRATION.md).

---

## ✨ Main Features

**Public (anyone)**
- Landing page with hero, live stats counters, categories, top-rated pros, how-it-works, FAQ and CTA.
- Browse and search services by category (`/services`) with a rich service detail page.
- Verified technician cards with ratings, reviews and skill lists.

**Customer** (`/dashboard`)
- Book a service for a chosen date/time with address + notes validation.
- Full booking list with status (`REQUESTED → ACCEPTED → PAID → IN_PROGRESS → COMPLETED` / `CANCELLED`).
- Secure Stripe Checkout payments with automatic status polling confirmation.
- Payment history with receipts, and post-job review (1–5 stars + comment).

**Technician** (`/technician-dashboard`)
- Offer services with pricing and duration, update profile/bio + hourly rate.
- Set weekly availability (per-day time blocks).
- Accept, decline, start, and complete incoming bookings (optimistic UI).

**Admin** (`/admin-dashboard`)
- Overview stats: revenue, bookings and active users.
- Manage users (ban / unban), categories (create), and every booking in the system.

---

## 🧱 Tech Stack

| Layer | Technology |
| --- | --- |
| **Framework** | Next.js 16 (App Router, RSC + Server Actions) |
| **UI** | React 19, Tailwind CSS v4, shadcn/ui (Radix primitives), lucide-react |
| **Data / Server state** | TanStack React Query v5 |
| **Styling** | Tailwind CSS v4, `tw-animate-css`, `clsx` + `tailwind-merge` |
| **Validation** | Zod v4 |
| **Auth** | JWT (via middleware decode) + httpOnly cookie; local proxy API routes |
| **Payments** | Stripe Checkout (webhook-driven status) |
| **Notifications** | sonner toasts |
| **Backend** | Separate REST API (Node) — see [`API_INTEGRATION.md`](API_INTEGRATION.md) |

---

## 📁 Folder Structure

```
fixiitnow_frontend/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Login / Register layouts, forms, actions
│   ├── (public)/                 # Public site: home, services, service detail
│   │   ├── _actions/             # Server actions (fetch categories/services…)
│   │   ├── _components/          # home/, services/, service-details/ components
│   │   ├── services/             # Services listing + [id] detail routes
│   │   └── page.tsx              # Landing page
│   ├── (dashboard)/              # Role-based dashboards group
│   │   ├── dashboard/            # Customer: overview, bookings, payments, profile
│   │   ├── technician-dashboard/ # Bookings, services, availability, profile
│   │   ├── admin-dashboard/      # Overview, users, categories, bookings, profile
│   │   ├── _actions/             # Shared dashboard server actions
│   │   └── _components/          # Shared dashboard components
│   ├── api/auth/                 # Client→backend auth proxy routes (login/me/…)
│   └── layout.tsx                # Root layout, fonts, providers, toaster
├── components/
│   ├── dashboard/               # shell, sidebar, topbar, nav
│   ├── shared/                  # header, footer, user-menu, mobile-nav
│   └── ui/                      # shadcn/ui primitives (button, card, dialog…)
├── contexts/                    # Auth context provider
├── lib/                         # api (server fetch), api-client, types, utils
├── public/                      # Static assets
├── proxy.ts                     # Role-aware middleware (route guards)
├── next.config.ts
└── package.json
```

---

## 🚀 Run the Project Locally

**Prerequisites**
- Node.js **20+** (LTS recommended)
- npm

**1. Clone the frontend**

```bash
git clone https://github.com/MasadRayan/Fix_It_now_Frontend
cd fixiitnow_frontend
```

**2. Install dependencies**

```bash
npm install
```

**3. Configure environment variables**

Create a `.env.local` (see the provided `.env` example):

```env
BACKEND_URL=https://fixitnow-two.vercel.app
NEXT_PUBLIC_BACKEND_URL=https://fixitnow-two.vercel.app
```

> Point `NEXT_PUBLIC_BACKEND_URL` to a locally running backend for full development.

**4. Start the dev server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

**Other scripts**

| Command | Description |
| --- | --- |
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

---

## 🔌 Backend Integration

Every endpoint consumed by this frontend — auth, categories, services, technicians, bookings, payments, reviews and admin — is mapped to its consumer component, server action and demo request/response shapes in:

### 📄 [API_INTEGRATION.md](API_INTEGRATION.md)

---

## 🧑‍💻 Developer

**Masad Rayan**

[![GitHub](https://img.shields.io/badge/GitHub-@MasadRayan-181717?logo=github&logoColor=white)](https://github.com/MasadRayan)

Contributions, issues and feature requests are welcome — feel free to open a pull request or issue on the repository.