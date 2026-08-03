# FixItNow API Documentation

A home services marketplace API. This document is the single source of truth for frontend developers.

---

## 1. Overview

| Item | Value |
|---|---|
| **Base URL** | `https://fixitnow-two.vercel.app` |
| **Local URL** | `http://localhost:3000` |
| **Format** | JSON |
| **Currency** | BDT (Bangladeshi Taka) |
| **Auth** | JWT (cookie or Bearer header) |

### 1.1 Authentication

All protected endpoints require a valid JWT. Send it **either** way:

- **Cookie**: `accessToken` (set automatically on login, `httpOnly`)
- **Header**: `Authorization: Bearer <accessToken>`

The server reads `req.cookies.accessToken` first, then falls back to the `Authorization` header.

### 1.2 Standard Success Response

Every successful response follows this envelope (fields `meta` / `errorDetails` are only present when relevant):

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Technicians fetched successfully",
  "data": { }
}
```

### 1.3 Standard Error Response

Every error response follows this envelope:

```json
{
  "success": false,
  "statusCode": 404,
  "message": "The requested record was not found",
  "errorDetails": {
    "name": "PrismaClientKnownRequestError",
    "prismaCode": "P2025",
    "meta": {}
  }
}
```

Common error status codes:

| Status | Meaning |
|---|---|
| `400` | Validation failed / invalid input / invalid transition |
| `401` | Missing or invalid token |
| `403` | Banned account / wrong role / not your resource |
| `404` | Resource not found |
| `409` | Duplicate value / already paid / already reviewed / status already set |

### 1.4 Pagination

List endpoints return a `meta` object:

```json
{
  "page": 1,
  "limit": 10,
  "total": 42,
  "totalPages": 5
}
```

Defaults are `page = 1`, `limit = 10`.

---

## 2. Roles & Access

| Role | What they can do |
|---|---|
| `CUSTOMER` | Browse services/technicians, create/cancel bookings, pay, review, view own bookings & payments |
| `TECHNICIAN` | Manage own profile & availability, create services, accept/decline/progress bookings, view own bookings |
| `ADMIN` | Create/view categories, view/ban users, view all bookings |

`ADMIN` **cannot** be self-registered — it is created via the seed script.

---

## 3. Endpoints

### 3.1 Auth — `/api/auth`

#### POST `/api/auth/register` — Public

Create a new `CUSTOMER` or `TECHNICIAN` account.

**Request body (CUSTOMER):**

```json
{
  "name": "Rahim Uddin",
  "email": "rahim@example.com",
  "password": "secret123",
  "phone": "+8801711111111",
  "role": "CUSTOMER",
  "address": "Dhanmondi, Dhaka",
  "avatarUrl": "https://example.com/avatar.png"
}
```

**Request body (TECHNICIAN)** — extra optional fields:

```json
{
  "name": "Karim Hossain",
  "email": "karim@example.com",
  "password": "secret123",
  "phone": "+8801722222222",
  "role": "TECHNICIAN",
  "address": "Mirpur, Dhaka",
  "bio": "Plumbing expert with 8 years experience",
  "skills": ["plumbing", "pipe fitting"],
  "hourlyRate": 500,
  "experienceYrs": 8,
  "location": "Mirpur"
}
```

**Validation rules:**
- `name`: min 2 chars
- `email`: valid email
- `password`: min 1 char
- `phone`: required
- `role`: must be `"CUSTOMER"` or `"TECHNICIAN"` (string literal)
- `hourlyRate`: positive number
- `experienceYrs`: zero or positive
- `avatarUrl`: valid URL

**Response — `201 Created`:**

```json
{
  "success": true,
  "statusCode": 201,
  "message": "User created successfully",
  "data": {
    "id": "3f2b7a1e-...",
    "name": "Karim Hossain",
    "email": "karim@example.com",
    "phone": "+8801722222222",
    "role": "TECHNICIAN",
    "status": "ACTIVE",
    "address": "Mirpur, Dhaka",
    "avatarUrl": null,
    "createdAt": "2026-01-01T10:00:00.000Z",
    "updatedAt": "2026-01-01T10:00:00.000Z"
  }
}
```

> Password is never returned. For a `TECHNICIAN` registration a `TechnicianProfile` is created automatically.

**Errors:** `409` User already exists; `400` invalid role/validation.

---

#### POST `/api/auth/login` — Public

**Request body:**

```json
{
  "email": "karim@example.com",
  "password": "secret123"
}
```

**Response — `200 OK`:** Sets `accessToken` (1 day) and `refreshToken` (7 days) cookies, and returns both:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "User logged in successfully",
  "data": {
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "eyJhbGciOi..."
  }
}
```

**Errors:** `404` User not found; `403` blocked user; `401` invalid email or password.

---

#### GET `/api/auth/me` — Authenticated (all roles)

Get the current logged-in user. Technicians also get their `technicianProfile`.

**Headers:** `Authorization: Bearer <token>`

**Response — `200 OK`:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "User info fetched successfully",
  "data": {
    "id": "3f2b7a1e-...",
    "name": "Karim Hossain",
    "email": "karim@example.com",
    "phone": "+8801722222222",
    "role": "TECHNICIAN",
    "status": "ACTIVE",
    "address": "Mirpur, Dhaka",
    "avatarUrl": null,
    "createdAt": "2026-01-01T10:00:00.000Z",
    "updatedAt": "2026-01-01T10:00:00.000Z",
    "technicianProfile": {
      "id": "7c1a9d2f-...",
      "userId": "3f2b7a1e-...",
      "bio": "Plumbing expert with 8 years experience",
      "skills": ["plumbing", "pipe fitting"],
      "experienceYrs": 8,
      "hourlyRate": "500.00",
      "location": "Mirpur",
      "avgRating": 4.5,
      "totalReviews": 2,
      "isVerified": true,
      "createdAt": "2026-01-01T10:00:00.000Z",
      "updatedAt": "2026-01-01T10:00:00.000Z"
    }
  }
}
```

> For a `CUSTOMER`, `technicianProfile` is omitted. `hourlyRate` is serialized as a string by Prisma (`"500.00"`).

---

### 3.2 Technician — `/api/technician`

#### GET `/api/technician/` — Public

List verified technicians with filters.

**Query parameters:**

| Param | Type | Description |
|---|---|---|
| `search` | string | Search by technician name or bio (case-insensitive) |
| `skill` | string | Filter by a single skill (must match exactly) |
| `location` | string | Partial match on technician location |
| `category` | string | Filter by category name (case-insensitive) |
| `minRating` | number | Minimum `avgRating` |
| `minExperience` | number | Minimum `experienceYrs` |
| `page` | number | Page number (default `1`) |
| `limit` | number | Per-page count (default `10`) |

**Example request:**

```
GET /api/technician/?search=karim&skill=plumbing&minRating=4&page=1&limit=10
```

**Response — `200 OK`** (`meta` + `data`):

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Technicians fetched successfully",
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  },
  "data": [
    {
      "id": "7c1a9d2f-...",
      "userId": "3f2b7a1e-...",
      "bio": "Plumbing expert with 8 years experience",
      "skills": ["plumbing", "pipe fitting"],
      "experienceYrs": 8,
      "hourlyRate": "500.00",
      "location": "Mirpur",
      "avgRating": 4.5,
      "totalReviews": 2,
      "isVerified": true,
      "createdAt": "2026-01-01T10:00:00.000Z",
      "updatedAt": "2026-01-01T10:00:00.000Z",
      "user": {
        "name": "Karim Hossain",
        "avatarUrl": null,
        "address": "Mirpur, Dhaka",
        "phone": "+8801722222222",
        "email": "karim@example.com",
        "status": "ACTIVE"
      },
      "services": [
        {
          "id": "5aa2c11d-...",
          "technicianId": "7c1a9d2f-...",
          "categoryId": "c001...",
          "title": "Pipe Leak Repair",
          "description": "Fix leaking pipes at home",
          "price": "350.00",
          "durationMins": 60,
          "isActive": true,
          "createdAt": "2026-01-01T11:00:00.000Z",
          "updatedAt": "2026-01-01T11:00:00.000Z"
        }
      ],
      "bookings": [
        {
          "status": "COMPLETED",
          "priceAtBooking": "350.00",
          "payment": { "status": "COMPLETED" },
          "customer": {
            "name": "Rahim Uddin",
            "phone": "+8801711111111",
            "email": "rahim@example.com",
            "avatarUrl": null
          }
        }
      ],
      "reviews": [
        { "rating": 5, "comment": "Great work!" },
        { "rating": 4, "comment": "Good service." }
      ],
      "_count": {
        "services": 1,
        "reviews": 2,
        "bookings": 1
      }
    }
  ]
}
```

---

#### GET `/api/technician/:id` — Public

Get a single technician by **`TechnicianProfile.id`** (not the user id).

**Response — `200 OK`:** Same shape as a single item of the list above.

**Errors:** `404` Technician not found.

---

#### PATCH `/api/technician/profile` — TECHNICIAN only

Update the authenticated technician's own profile. All fields optional — only provided fields are updated.

**Headers:** `Authorization: Bearer <token>`

**Request body (all optional):**

```json
{
  "name": "Karim Hossain Khan",
  "phone": "+8801733333333",
  "address": "Gulshan, Dhaka",
  "avatarUrl": "https://example.com/new-avatar.png",
  "bio": "Senior plumbing & electrical expert",
  "skills": ["plumbing", "electrical"],
  "hourlyRate": 600,
  "experienceYrs": 9,
  "location": "Gulshan"
}
```

**Response — `200 OK`:** The updated `User` including `technicianProfile`:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Technician profile updated successfully",
  "data": {
    "id": "3f2b7a1e-...",
    "name": "Karim Hossain Khan",
    "phone": "+8801733333333",
    "role": "TECHNICIAN",
    "status": "ACTIVE",
    "address": "Gulshan, Dhaka",
    "avatarUrl": "https://example.com/new-avatar.png",
    "createdAt": "2026-01-01T10:00:00.000Z",
    "updatedAt": "2026-01-02T10:00:00.000Z",
    "technicianProfile": {
      "id": "7c1a9d2f-...",
      "bio": "Senior plumbing & electrical expert",
      "skills": ["plumbing", "electrical"],
      "experienceYrs": 9,
      "hourlyRate": "600.00",
      "location": "Gulshan",
      "avgRating": 4.5,
      "totalReviews": 2,
      "isVerified": true
    }
  }
}
```

**Errors:** `404` user/profile not found; `403` banned user.

---

#### PUT `/api/technician/availability` — TECHNICIAN only

**Replaces** the entire weekly availability schedule (old slots are deleted first).

**Headers:** `Authorization: Bearer <token>`

**Request body** — a non-empty array of slots:

```json
[
  { "dayOfWeek": "MONDAY", "startTime": "09:00", "endTime": "17:00" },
  { "dayOfWeek": "WEDNESDAY", "startTime": "10:00", "endTime": "18:00" },
  { "dayOfWeek": "FRIDAY", "startTime": "14:00", "endTime": "20:00" }
]
```

**Validation rules:**
- `dayOfWeek`: one of `MONDAY`, `TUESDAY`, `WEDNESDAY`, `THURSDAY`, `FRIDAY`, `SATURDAY`, `SUNDAY`
- `startTime` / `endTime`: `HH:mm` 24-hour format
- `startTime` must be earlier than `endTime`

**Response — `200 OK`:** The new availability list:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Availability updated successfully",
  "data": [
    {
      "id": "a1b2c3d4-...",
      "technicianId": "7c1a9d2f-...",
      "dayOfWeek": "FRIDAY",
      "startTime": "14:00",
      "endTime": "20:00",
      "isActive": true,
      "createdAt": "2026-01-02T10:00:00.000Z",
      "updatedAt": "2026-01-02T10:00:00.000Z"
    },
    {
      "id": "e5f6a7b8-...",
      "technicianId": "7c1a9d2f-...",
      "dayOfWeek": "MONDAY",
      "startTime": "09:00",
      "endTime": "17:00",
      "isActive": true,
      "createdAt": "2026-01-02T10:00:00.000Z",
      "updatedAt": "2026-01-02T10:00:00.000Z"
    }
  ]
}
```

**Errors:** `400` empty array / invalid day / invalid time format / start not before end; `404` profile not found.

---

### 3.3 Service — `/api/services`

#### POST `/api/services/` — TECHNICIAN only

Create a new service under an existing category.

**Headers:** `Authorization: Bearer <token>`

**Request body:**

```json
{
  "title": "Pipe Leak Repair",
  "description": "Fix leaking pipes at home",
  "category": "Plumbing",
  "price": 350,
  "durationMins": 60
}
```

**Validation rules:**
- `title`: min 3 chars
- `description`: required
- `category`: must match an existing category **name** (case-insensitive)
- `price`: positive number
- `durationMins`: positive number (optional, default `60`)

**Response — `201 Created`:**

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Service created successfully",
  "data": {
    "id": "5aa2c11d-...",
    "technicianId": "7c1a9d2f-...",
    "categoryId": "c001...",
    "title": "Pipe Leak Repair",
    "description": "Fix leaking pipes at home",
    "price": "350.00",
    "durationMins": 60,
    "isActive": true,
    "createdAt": "2026-01-01T11:00:00.000Z",
    "updatedAt": "2026-01-01T11:00:00.000Z"
  }
}
```

**Errors:** `404` Category not found / technician profile not found.

---

#### GET `/api/services/` — Public

List active services with filters.

**Query parameters:**

| Param | Type | Description |
|---|---|---|
| `search` | string | Search by title or description |
| `category` | string | Partial match on category name |
| `location` | string | Partial match on technician location |
| `minPrice` | number | Minimum price |
| `maxPrice` | number | Maximum price |
| `minRating` | number | Minimum technician `avgRating` |
| `page` | number | Page number (default `1`) |
| `limit` | number | Per-page count (default `10`) |

**Example request:**

```
GET /api/services/?category=Plumbing&minPrice=200&maxPrice=500&page=1&limit=10
```

**Response — `200 OK`:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Services fetched successfully",
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  },
  "data": [
    {
      "id": "5aa2c11d-...",
      "technicianId": "7c1a9d2f-...",
      "categoryId": "c001...",
      "title": "Pipe Leak Repair",
      "description": "Fix leaking pipes at home",
      "price": "350.00",
      "durationMins": 60,
      "isActive": true,
      "createdAt": "2026-01-01T11:00:00.000Z",
      "updatedAt": "2026-01-01T11:00:00.000Z",
      "category": {
        "name": "Plumbing",
        "description": "Plumbing services",
        "iconUrl": "https://example.com/plumbing.png"
      },
      "technician": {
        "user": {
          "name": "Karim Hossain",
          "avatarUrl": null,
          "email": "karim@example.com"
        },
        "bio": "Plumbing expert with 8 years experience",
        "location": "Mirpur",
        "avgRating": 4.5,
        "totalReviews": 2
      },
      "bookings": [
        {
          "status": "COMPLETED",
          "address": "Dhanmondi, Dhaka",
          "priceAtBooking": "350.00",
          "payment": { "status": "COMPLETED" },
          "review": { "rating": 5, "comment": "Great work!" }
        }
      ],
      "_count": {
        "bookings": 1
      }
    }
  ]
}
```

---

### 3.4 Category — `/api/category`

#### GET `/api/category/` — Public

List active categories.

**Query parameters:**

| Param | Type | Description |
|---|---|---|
| `search` | string | Search by name or description |
| `page` | number | Page number (default `1`) |
| `limit` | number | Per-page count (default `10`) |

**Response — `200 OK`:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Categories fetched successfully",
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "totalPages": 1
  },
  "data": [
    {
      "id": "c001...",
      "name": "Plumbing",
      "description": "Plumbing services",
      "iconUrl": "https://example.com/plumbing.png",
      "isActive": true,
      "createdAt": "2026-01-01T09:00:00.000Z",
      "updatedAt": "2026-01-01T09:00:00.000Z",
      "services": [
        { "title": "Pipe Leak Repair", "description": "Fix leaking pipes", "price": "350.00" }
      ],
      "_count": { "services": 1 }
    }
  ]
}
```

---

### 3.5 Booking — `/api/bookings`

**Booking lifecycle:**

```
REQUESTED → ACCEPTED → PAID → IN_PROGRESS → COMPLETED
         ↘ DECLINED
(any of REQUESTED / ACCEPTED / PAID → CANCELLED by customer)
```

Valid technician transitions:
- `REQUESTED → ACCEPTED | DECLINED`
- `PAID → IN_PROGRESS`
- `IN_PROGRESS → COMPLETED`

#### POST `/api/bookings/create` — CUSTOMER only

**Headers:** `Authorization: Bearer <token>`

**Request body:**

```json
{
  "serviceId": "5aa2c11d-...",
  "scheduledAt": "2026-01-15T10:00:00.000Z",
  "address": "House 12, Mirpur 10, Dhaka",
  "notes": "Please bring your own tools"
}
```

**Validation rules:**
- `serviceId`: required
- `scheduledAt`: valid ISO date, **must be in the future**
- `address`: required
- `notes`: optional
- The booking `address` must contain the technician's `location` (case-insensitive substring match)
- You cannot book your own service

**Response — `201 Created`:**

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Booking created successfully",
  "data": {
    "id": "b9d2e4f6-...",
    "customerId": "8a0c9b2e-...",
    "technicianId": "7c1a9d2f-...",
    "serviceId": "5aa2c11d-...",
    "status": "REQUESTED",
    "scheduledAt": "2026-01-15T10:00:00.000Z",
    "address": "House 12, Mirpur 10, Dhaka",
    "notes": "Please bring your own tools",
    "priceAtBooking": "350.00",
    "cancelledAt": null,
    "cancelReason": null,
    "createdAt": "2026-01-02T12:00:00.000Z",
    "updatedAt": "2026-01-02T12:00:00.000Z",
    "service": {
      "id": "5aa2c11d-...",
      "title": "Pipe Leak Repair",
      "description": "Fix leaking pipes at home",
      "price": "350.00",
      "durationMins": 60,
      "isActive": true,
      "category": { "id": "c001...", "name": "Plumbing", "description": "Plumbing services", "iconUrl": null, "isActive": true, "createdAt": "...", "updatedAt": "..." }
    },
    "technician": {
      "id": "7c1a9d2f-...",
      "userId": "3f2b7a1e-...",
      "bio": "Plumbing expert with 8 years experience",
      "skills": ["plumbing"],
      "experienceYrs": 8,
      "hourlyRate": "500.00",
      "location": "Mirpur",
      "avgRating": 4.5,
      "totalReviews": 2,
      "isVerified": true,
      "user": {
        "name": "Karim Hossain",
        "email": "karim@example.com",
        "phone": "+8801722222222"
      }
    }
  }
}
```

**Errors:** `404` service not found; `400` inactive service / past date / address not in technician's service area / self-booking; `403` banned user.

---

#### PATCH `/api/bookings/status/:id` — TECHNICIAN only

Advance the booking lifecycle (must be the booking's assigned technician).

**Headers:** `Authorization: Bearer <token>`

**Request body:**

```json
{
  "status": "ACCEPTED"
}
```

`status` must be one of: `ACCEPTED`, `DECLINED`, `IN_PROGRESS`, `COMPLETED`

**Response — `200 OK`:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Booking status updated successfully",
  "data": {
    "id": "b9d2e4f6-...",
    "customerId": "8a0c9b2e-...",
    "technicianId": "7c1a9d2f-...",
    "serviceId": "5aa2c11d-...",
    "status": "ACCEPTED",
    "scheduledAt": "2026-01-15T10:00:00.000Z",
    "address": "House 12, Mirpur 10, Dhaka",
    "notes": "Please bring your own tools",
    "priceAtBooking": "350.00",
    "cancelledAt": null,
    "cancelReason": null,
    "createdAt": "2026-01-02T12:00:00.000Z",
    "updatedAt": "2026-01-02T12:01:00.000Z"
  }
}
```

**Errors:** `400` invalid status / illegal transition (e.g. `ACCEPTED → COMPLETED`); `403` not your booking; `409` status already set; `404` booking/technician not found.

---

#### GET `/api/bookings` — CUSTOMER or TECHNICIAN

List the authenticated user's own bookings.

**Headers:** `Authorization: Bearer <token>`

**Customer response — `200 OK`** (service + technician + payment included):

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Bookings fetched successfully",
  "data": [
    {
      "id": "b9d2e4f6-...",
      "customerId": "8a0c9b2e-...",
      "technicianId": "7c1a9d2f-...",
      "serviceId": "5aa2c11d-...",
      "status": "PAID",
      "scheduledAt": "2026-01-15T10:00:00.000Z",
      "address": "House 12, Mirpur 10, Dhaka",
      "notes": "Please bring your own tools",
      "priceAtBooking": "350.00",
      "cancelledAt": null,
      "cancelReason": null,
      "createdAt": "2026-01-02T12:00:00.000Z",
      "updatedAt": "2026-01-02T13:00:00.000Z",
      "service": {
        "title": "Pipe Leak Repair",
        "description": "Fix leaking pipes at home",
        "price": "350.00",
        "durationMins": 60,
        "isActive": true,
        "category": { "name": "Plumbing", "description": "Plumbing services" }
      },
      "technician": {
        "user": { "name": "Karim Hossain", "email": "karim@example.com", "phone": "+8801722222222" },
        "bio": "Plumbing expert with 8 years experience",
        "location": "Mirpur",
        "experienceYrs": 8,
        "hourlyRate": "500.00",
        "totalReviews": 2,
        "avgRating": 4.5
      },
      "payment": { "status": "COMPLETED", "amount": "350.00" }
    }
  ]
}
```

**Technician response — `200 OK`** (service + customer only):

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Bookings fetched successfully",
  "data": [
    {
      "id": "b9d2e4f6-...",
      "customerId": "8a0c9b2e-...",
      "technicianId": "7c1a9d2f-...",
      "serviceId": "5aa2c11d-...",
      "status": "REQUESTED",
      "scheduledAt": "2026-01-15T10:00:00.000Z",
      "address": "House 12, Mirpur 10, Dhaka",
      "notes": "Please bring your own tools",
      "priceAtBooking": "350.00",
      "cancelledAt": null,
      "cancelReason": null,
      "createdAt": "2026-01-02T12:00:00.000Z",
      "updatedAt": "2026-01-02T12:00:00.000Z",
      "service": {
        "id": "5aa2c11d-...",
        "technicianId": "7c1a9d2f-...",
        "categoryId": "c001...",
        "title": "Pipe Leak Repair",
        "description": "Fix leaking pipes at home",
        "price": "350.00",
        "durationMins": 60,
        "isActive": true,
        "createdAt": "...",
        "updatedAt": "..."
      },
      "customer": { "name": "Rahim Uddin", "phone": "+8801711111111" }
    }
  ]
}
```

---

#### GET `/api/bookings/:id` — CUSTOMER or ADMIN

Get a single booking's detail.

- **CUSTOMER**: only own bookings.
- **ADMIN**: any booking (identical shape to the customer view).

**Headers:** `Authorization: Bearer <token>`

**Response — `200 OK`:** Same shape as the customer booking item above.

**Errors:** `403` not your booking; `404` booking not found.

---

#### PATCH `/api/bookings/:id/cancel` — CUSTOMER only

Cancel a booking **only when** its status is `REQUESTED`, `ACCEPTED`, or `PAID`.

**Headers:** `Authorization: Bearer <token>`

**Request body (all optional):**

```json
{
  "cancelReason": "Changed my mind"
}
```

**Response — `200 OK`:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Booking cancelled successfully",
  "data": {
    "id": "b9d2e4f6-...",
    "customerId": "8a0c9b2e-...",
    "technicianId": "7c1a9d2f-...",
    "serviceId": "5aa2c11d-...",
    "status": "CANCELLED",
    "scheduledAt": "2026-01-15T10:00:00.000Z",
    "address": "House 12, Mirpur 10, Dhaka",
    "notes": "Please bring your own tools",
    "priceAtBooking": "350.00",
    "cancelledAt": "2026-01-03T09:00:00.000Z",
    "cancelReason": "Changed my mind",
    "createdAt": "2026-01-02T12:00:00.000Z",
    "updatedAt": "2026-01-03T09:00:00.000Z"
  }
}
```

**Errors:** `400` booking already `IN_PROGRESS`/`COMPLETED`/`CANCELLED`; `403` not your booking; `404` booking not found.

---

### 3.6 Payment — `/api/payment`

> Note: the router is mounted at `/api/payment` (singular).

#### POST `/api/payment/create` — CUSTOMER only

Create a Stripe Checkout Session for an **`ACCEPTED`** booking. Returns a hosted payment URL.

**Headers:** `Authorization: Bearer <token>`

**Request body:**

```json
{
  "bookingId": "b9d2e4f6-..."
}
```

**Response — `201 Created`:**

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Payment created successfully",
  "data": {
    "transactionId": "FIXITNOW-3f2b7a1e-...",
    "paymentURL": "https://checkout.stripe.com/c/pay/cs_test_..."
  }
}
```

**Frontend flow:** open `paymentURL` in the browser (Stripe-hosted checkout). On success the user is redirected to `/dashboard/bookings`. A `stripeSessionId` is stored on the payment record so its status can be polled.

**Errors:** `404` booking not found; `403` not your booking; `400` booking not `ACCEPTED`; `409` booking already paid.

---

#### POST `/api/payment/confirm` — Stripe webhook (server-to-server)

Called by **Stripe** with the raw JSON body and a `stripe-signature` header. Do **not** call this from the frontend.

Handles `checkout.session.completed` (flips payment → `COMPLETED` and booking → `PAID`) and `checkout.session.expired` (flips payment → `FAILED`).

**Headers:** `stripe-signature: <signature>`

**Request body:** raw Stripe webhook payload (signed).

**Response — `200 OK`:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Payment created successfully"
}
```

---

#### GET `/api/payment/` — CUSTOMER only

List the authenticated customer's payment history.

**Headers:** `Authorization: Bearer <token>`

**Response — `200 OK`:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "All My Payments fetched successfully",
  "data": [
    {
      "id": "p001...",
      "bookingId": "b9d2e4f6-...",
      "customerId": "8a0c9b2e-...",
      "transactionId": "FIXITNOW-3f2b7a1e-...",
      "amount": "350.00",
      "provider": "STRIPE",
      "status": "COMPLETED",
      "paidAt": "2026-01-02T13:00:00.000Z",
      "failureReason": null,
      "stripeSessionId": "cs_test_...",
      "gatewayMeta": {
        "sessionId": "cs_test_...",
        "paymentIntentId": "pi_...",
        "paymentStatus": "paid",
        "amountTotal": 35000,
        "currency": "bdt",
        "customerEmail": "rahim@example.com"
      },
      "createdAt": "2026-01-02T12:30:00.000Z",
      "updatedAt": "2026-01-02T13:00:00.000Z",
      "booking": {
        "id": "b9d2e4f6-...",
        "customerId": "8a0c9b2e-...",
        "technicianId": "7c1a9d2f-...",
        "serviceId": "5aa2c11d-...",
        "status": "PAID",
        "scheduledAt": "2026-01-15T10:00:00.000Z",
        "address": "House 12, Mirpur 10, Dhaka",
        "notes": null,
        "priceAtBooking": "350.00",
        "cancelledAt": null,
        "cancelReason": null,
        "createdAt": "2026-01-02T12:00:00.000Z",
        "updatedAt": "2026-01-02T13:00:00.000Z",
        "service": {
          "id": "5aa2c11d-...",
          "technicianId": "7c1a9d2f-...",
          "categoryId": "c001...",
          "title": "Pipe Leak Repair",
          "description": "Fix leaking pipes at home",
          "price": "350.00",
          "durationMins": 60,
          "isActive": true,
          "createdAt": "...",
          "updatedAt": "..."
        }
      }
    }
  ]
}
```

**Errors:** `404` user not found; `403` banned user.

---

#### GET `/api/payment/:id` — CUSTOMER only

Get a single payment by `Payment.id` (must own it).

**Headers:** `Authorization: Bearer <token>`

**Response — `200 OK`:** Same shape as one item of the list above.

**Errors:** `404` payment not found; `403` not your payment.

---

### 3.7 Review — `/api/review`

> Note: the router is mounted at `/api/review` (singular).

#### POST `/api/review/` — CUSTOMER only

Review a **`COMPLETED`** booking. One review per booking.

**Headers:** `Authorization: Bearer <token>`

**Request body:**

```json
{
  "bookingId": "b9d2e4f6-...",
  "rating": 5,
  "comment": "Excellent work, very professional!"
}
```

**Validation rules:**
- `bookingId`: required
- `rating`: integer between 1 and 5
- `comment`: optional

**Response — `201 Created`:** (also recalculates the technician's `avgRating` / `totalReviews`)

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Review created successfully",
  "data": {
    "id": "r001...",
    "bookingId": "b9d2e4f6-...",
    "customerId": "8a0c9b2e-...",
    "technicianId": "7c1a9d2f-...",
    "rating": 5,
    "comment": "Excellent work, very professional!",
    "createdAt": "2026-01-03T10:00:00.000Z",
    "updatedAt": "2026-01-03T10:00:00.000Z"
  }
}
```

**Errors:** `400` booking not `COMPLETED` / rating out of range; `403` not your booking; `404` booking not found; `409` already reviewed this booking.

---

### 3.8 Admin — `/api/admin`

All admin endpoints require **ADMIN** role.

#### POST `/api/admin/categories` — ADMIN only

Create a new category.

**Headers:** `Authorization: Bearer <token>`

**Request body:**

```json
{
  "name": "Gardening",
  "description": "Garden maintenance and landscaping"
}
```

**Validation rules:** `name` min 2 chars (duplicate names rejected case-insensitively); `description` optional.

**Response — `201 Created`:**

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Category created successfully",
  "data": {
    "id": "c009...",
    "name": "Gardening",
    "description": "Garden maintenance and landscaping",
    "iconUrl": null,
    "isActive": true,
    "createdAt": "2026-01-03T11:00:00.000Z",
    "updatedAt": "2026-01-03T11:00:00.000Z"
  }
}
```

**Errors:** `409` category already exists.

---

#### GET `/api/admin/categories` — ADMIN only

List all categories (including inactive) with their services.

**Headers:** `Authorization: Bearer <token>`

**Response — `200 OK`:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "All Categories fetched successfully",
  "data": [
    {
      "id": "c001...",
      "name": "Plumbing",
      "description": "Plumbing services",
      "iconUrl": null,
      "isActive": true,
      "createdAt": "2026-01-01T09:00:00.000Z",
      "updatedAt": "2026-01-01T09:00:00.000Z",
      "services": [
        {
          "id": "5aa2c11d-...",
          "technicianId": "7c1a9d2f-...",
          "categoryId": "c001...",
          "title": "Pipe Leak Repair",
          "description": "Fix leaking pipes at home",
          "price": "350.00",
          "durationMins": 60,
          "isActive": true,
          "createdAt": "...",
          "updatedAt": "..."
        }
      ],
      "_count": { "services": 1 }
    }
  ]
}
```

---

#### GET `/api/admin/allUsers` — ADMIN only

List all `CUSTOMER` and `TECHNICIAN` users (admins excluded).

**Query parameters:**

| Param | Type | Description |
|---|---|---|
| `role` | string | `CUSTOMER` or `TECHNICIAN` |
| `status` | string | `ACTIVE` or `BANNED` |
| `search` | string | Search by name or email |
| `page` | number | Page number (default `1`) |
| `limit` | number | Per-page count (default `10`) |

**Headers:** `Authorization: Bearer <token>`

**Response — `200 OK`:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "All Users fetched successfully",
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 3,
    "totalPages": 1
  },
  "data": [
    {
      "id": "3f2b7a1e-...",
      "name": "Karim Hossain",
      "email": "karim@example.com",
      "phone": "+8801722222222",
      "role": "TECHNICIAN",
      "status": "ACTIVE",
      "address": "Mirpur, Dhaka",
      "avatarUrl": null,
      "createdAt": "2026-01-01T10:00:00.000Z",
      "updatedAt": "2026-01-01T10:00:00.000Z",
      "technicianProfile": {
        "id": "7c1a9d2f-...",
        "avgRating": 4.5,
        "totalReviews": 2,
        "isVerified": true,
        "location": "Mirpur"
      }
    }
  ]
}
```

---

#### GET `/api/admin/bookings` — ADMIN only

List all bookings with filters.

**Query parameters:**

| Param | Type | Description |
|---|---|---|
| `status` | string | Booking status (`REQUESTED`, `ACCEPTED`, `DECLINED`, `PAID`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`) |
| `customerId` | string | Filter by customer id |
| `technicianId` | string | Filter by technician profile id |
| `fromDate` | string | `scheduledAt >= fromDate` (ISO date) |
| `toDate` | string | `scheduledAt <= toDate` (ISO date) |
| `search` | string | Search by customer name or technician name |
| `page` | number | Page number (default `1`) |
| `limit` | number | Per-page count (default `10`) |

**Headers:** `Authorization: Bearer <token>`

**Response — `200 OK`:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "All Bookings fetched successfully",
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 3,
    "totalPages": 1
  },
  "data": [
    {
      "id": "b9d2e4f6-...",
      "customerId": "8a0c9b2e-...",
      "technicianId": "7c1a9d2f-...",
      "serviceId": "5aa2c11d-...",
      "status": "PAID",
      "scheduledAt": "2026-01-15T10:00:00.000Z",
      "address": "House 12, Mirpur 10, Dhaka",
      "notes": null,
      "priceAtBooking": "350.00",
      "cancelledAt": null,
      "cancelReason": null,
      "createdAt": "2026-01-02T12:00:00.000Z",
      "updatedAt": "2026-01-02T13:00:00.000Z",
      "customer": {
        "name": "Rahim Uddin",
        "email": "rahim@example.com"
      },
      "technician": {
        "user": {
          "name": "Karim Hossain",
          "email": "karim@example.com"
        }
      }
    }
  ]
}
```

---

#### PATCH `/api/admin/user/:id` — ADMIN only

Ban or unban a user.

**Headers:** `Authorization: Bearer <token>`

**Request body:**

```json
{
  "status": "BANNED"
}
```

`status` must be `ACTIVE` or `BANNED`. Admins cannot be changed.

**Response — `200 OK`:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "User status updated successfully",
  "data": {
    "id": "8a0c9b2e-...",
    "name": "Rahim Uddin",
    "email": "rahim@example.com",
    "phone": "+8801711111111",
    "role": "CUSTOMER",
    "status": "BANNED",
    "address": "Dhanmondi, Dhaka",
    "avatarUrl": null,
    "createdAt": "2026-01-01T10:00:00.000Z",
    "updatedAt": "2026-01-03T12:00:00.000Z"
  }
}
```

**Errors:** `403` cannot change admin status; `409` status unchanged; `404` user not found.

---

## 4. Endpoint Reference Table

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register CUSTOMER or TECHNICIAN |
| POST | `/api/auth/login` | Public | Login, returns JWT + sets cookies |
| GET | `/api/auth/me` | All roles | Current user info |
| GET | `/api/technician/` | Public | List technicians (filtered) |
| GET | `/api/technician/:id` | Public | Single technician |
| PATCH | `/api/technician/profile` | TECHNICIAN | Update own profile |
| PUT | `/api/technician/availability` | TECHNICIAN | Replace weekly availability |
| POST | `/api/services/` | TECHNICIAN | Create a service |
| GET | `/api/services/` | Public | List services (filtered) |
| GET | `/api/category/` | Public | List categories |
| POST | `/api/bookings/create` | CUSTOMER | Create a booking |
| PATCH | `/api/bookings/status/:id` | TECHNICIAN | Accept / decline / progress |
| GET | `/api/bookings` | CUSTOMER, TECHNICIAN | Own bookings |
| GET | `/api/bookings/:id` | CUSTOMER, ADMIN | Booking detail |
| PATCH | `/api/bookings/:id/cancel` | CUSTOMER | Cancel booking |
| POST | `/api/payment/create` | CUSTOMER | Create Stripe checkout |
| POST | `/api/payment/confirm` | Stripe webhook | Confirm payment |
| GET | `/api/payment/` | CUSTOMER | Own payment history |
| GET | `/api/payment/:id` | CUSTOMER | Single payment |
| POST | `/api/review/` | CUSTOMER | Review a completed booking |
| POST | `/api/admin/categories` | ADMIN | Create category |
| GET | `/api/admin/categories` | ADMIN | List categories |
| GET | `/api/admin/allUsers` | ADMIN | List users |
| GET | `/api/admin/bookings` | ADMIN | List all bookings |
| PATCH | `/api/admin/user/:id` | ADMIN | Ban / unban user |

---

## 5. Types & Enums

> Currency values (`hourlyRate`, `price`, `priceAtBooking`, `amount`) are serialized as **strings** (e.g. `"350.00"`) because Prisma's `Decimal` type is returned as a string. Convert with `Number()` when doing math.

### 5.1 Enums

```typescript
type Role = "CUSTOMER" | "TECHNICIAN" | "ADMIN";

type UserStatus = "ACTIVE" | "BANNED";

type BookingStatus =
  | "REQUESTED"
  | "ACCEPTED"
  | "DECLINED"
  | "PAID"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

type PaymentProvider = "STRIPE";

type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";

type DayOfWeek =
  | "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY"
  | "FRIDAY" | "SATURDAY" | "SUNDAY";
```

### 5.2 Entities

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  status: UserStatus;
  address: string | null;
  avatarUrl: string | null;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  technicianProfile?: TechnicianProfile | null; // present for TECHNICIAN
}

interface TechnicianProfile {
  id: string;
  userId: string;
  bio: string | null;
  skills: string[];
  experienceYrs: number;
  hourlyRate: string; // Decimal serialized as string
  location: string | null;
  avgRating: number;
  totalReviews: number;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface TechnicianAvailability {
  id: string;
  technicianId: string;
  dayOfWeek: DayOfWeek;
  startTime: string; // "HH:mm"
  endTime: string;   // "HH:mm"
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Category {
  id: string;
  name: string;
  description: string | null;
  iconUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Service {
  id: string;
  technicianId: string;
  categoryId: string;
  title: string;
  description: string;
  price: string; // Decimal as string
  durationMins: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Booking {
  id: string;
  customerId: string;
  technicianId: string;
  serviceId: string;
  status: BookingStatus;
  scheduledAt: string; // ISO 8601
  address: string;
  notes: string | null;
  priceAtBooking: string; // Decimal as string
  cancelledAt: string | null;
  cancelReason: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Payment {
  id: string;
  bookingId: string;
  customerId: string;
  transactionId: string;
  amount: string; // Decimal as string
  provider: PaymentProvider;
  status: PaymentStatus;
  paidAt: string | null;
  failureReason: string | null;
  stripeSessionId: string | null;
  gatewayMeta: {
    sessionId: string;
    paymentIntentId: string | null;
    paymentStatus: string;
    amountTotal: number;
    currency: string;
    customerEmail: string | null;
  } | null;
  createdAt: string;
  updatedAt: string;
}

interface Review {
  id: string;
  bookingId: string;
  customerId: string;
  technicianId: string;
  rating: number; // 1 - 5
  comment: string | null;
  createdAt: string;
  updatedAt: string;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
```

### 5.3 Request Bodies (Zod-validated)

```typescript
// POST /api/auth/register
type RegisterRequest =
  | {
      role: "CUSTOMER";
      name: string;
      email: string;
      password: string;
      phone: string;
      address?: string;
      avatarUrl?: string;
    }
  | {
      role: "TECHNICIAN";
      name: string;
      email: string;
      password: string;
      phone: string;
      address?: string;
      avatarUrl?: string;
      bio?: string;
      skills?: string[];
      hourlyRate?: number;
      experienceYrs?: number;
      location?: string;
    };

// POST /api/auth/login
interface LoginRequest {
  email: string;
  password: string;
}

// PATCH /api/technician/profile  (all optional)
interface UpdateTechnicianProfileRequest {
  name?: string;
  phone?: string;
  address?: string;
  avatarUrl?: string;
  bio?: string;
  skills?: string[];
  hourlyRate?: number;
  experienceYrs?: number;
  location?: string;
}

// PUT /api/technician/availability
type AvailabilityRequest = Array<{
  dayOfWeek: DayOfWeek;
  startTime: string; // "HH:mm"
  endTime: string;   // "HH:mm"
}>;

// POST /api/services/
interface CreateServiceRequest {
  title: string;
  description: string;
  category: string; // category NAME, not id
  price: number;
  durationMins?: number; // default 60
}

// POST /api/admin/categories
interface CreateCategoryRequest {
  name: string;
  description?: string;
}

// POST /api/bookings/create
interface CreateBookingRequest {
  serviceId: string;
  scheduledAt: string; // future ISO datetime
  address: string;
  notes?: string;
}

// PATCH /api/bookings/status/:id
interface UpdateBookingStatusRequest {
  status: "ACCEPTED" | "DECLINED" | "IN_PROGRESS" | "COMPLETED";
}

// PATCH /api/bookings/:id/cancel
interface CancelBookingRequest {
  cancelReason?: string;
}

// POST /api/payment/create
interface CreatePaymentRequest {
  bookingId: string;
}

// POST /api/review/
interface CreateReviewRequest {
  bookingId: string;
  rating: number; // 1 - 5
  comment?: string;
}

// PATCH /api/admin/user/:id
interface UpdateUserStatusRequest {
  status: "ACTIVE" | "BANNED";
}
```

---

## 6. Common Frontend Workflows

### Registration → Booking → Payment (Happy Path)

1. `POST /api/auth/register` (CUSTOMER) → get `id`
2. `POST /api/auth/login` → store `accessToken` (also set as cookie)
3. `GET /api/category/` → pick a category
4. `GET /api/services/?category=Plumbing` → pick a service
5. `POST /api/bookings/create` with `serviceId`, future `scheduledAt`, `address`
6. Technician: `PATCH /api/bookings/status/:id` `{ "status": "ACCEPTED" }`
7. `POST /api/payment/create` → open `paymentURL` in a new tab
8. Stripe redirects to `/payment/success?tran_id=<transactionId>`; webhook flips booking to `PAID`
9. Technician: `PATCH /api/bookings/status/:id` `{ "status": "IN_PROGRESS" }`, then `{ "status": "COMPLETED" }`
10. `POST /api/review/` with `rating` + `comment`

### Testing Payments

- Use Stripe test card: **`4242 4242 4242 4242`**, any future expiry, any CVC.
- Currency is **BDT** (amount = `price × 100` in paisa).

---

## 7. Notes & Gotchas

- Payment and review routers are mounted at **singular** paths: `/api/payment` and `/api/review` (not `/payments` / `/reviews`).
- `GET /api/technician/:id` expects a **`TechnicianProfile.id`**, which you get from the list endpoint or `technicianProfile.id` on the user. It is **not** the `User.id`.
- `POST /api/services/` takes the category **name** (`category: "Plumbing"`), not the category id.
- `scheduledAt` must be a **future** date; the booking `address` must contain the technician's `location` text.
- Booking cancellation does **not** trigger an automatic Stripe refund.
- `hourlyRate`, `price`, `priceAtBooking`, and `amount` are returned as strings.
- `avatarUrl` accepts only valid URLs; `authorization` header or cookie is interchangeable.
- CORS is restricted to `https://fixitnow-two.vercel.app` with `credentials: true`.
