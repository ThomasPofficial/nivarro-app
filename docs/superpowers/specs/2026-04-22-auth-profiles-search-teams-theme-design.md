# Nivarro — Auth, Profiles, Search, Teams & Theme Design Spec
**Date:** 2026-04-22
**Status:** Approved
**Features:** User auth + persistence, one-time profile setup, dynamic greeting, user search + friend requests, team group chats, light/dark theme

---

## 1. Overview

Five interconnected features that transform the Nivarro messaging app from a token-only prototype into a full user-facing product:

1. **Auth** — register/login with JWT persistence (no re-login on refresh)
2. **Profile setup** — one-time 3-step wizard after first sign-up
3. **Dynamic greeting** — "Good morning/afternoon/evening, [first name]"
4. **Search + friend requests** — find users by name, send contact requests
5. **Teams** — group chats created by picking contacts
6. **Light/dark theme** — toggle persisted in localStorage

---

## 2. Data Model Changes

### User (additions)
```js
{
  password_hash: { type: String, required: true },   // bcrypt hash
  profile_complete: { type: Boolean, default: false } // gates profile wizard
}
```

### Thread (additions)
```js
{
  type: { type: String, enum: ['dm', 'group'], default: 'dm' },
  name: { type: String, default: null }  // only set for group threads
}
```

No other model changes. Existing `skills`, `bio`, `interests`, `location` fields on User are already present.

---

## 3. New API Routes

All new routes under `/api/auth` (unprotected) and additions to existing protected routes.

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | None | Create account: `{ name, email, password }` → `{ token, user }` |
| POST | `/api/auth/login` | None | `{ email, password }` → `{ token, user }` |
| PATCH | `/api/auth/profile` | JWT | Complete profile wizard: `{ bio, location, skills, interests }` → sets `profile_complete: true` |

**Register flow:**
1. Validate name/email/password (email unique, password min 8 chars)
2. Hash password with bcrypt (12 rounds)
3. Create User with `profile_complete: false`
4. Sign JWT `{ id, name, email }` with `JWT_SECRET`, expire 30 days
5. Return `{ token, user: { id, name, email, profile_complete } }`

**Login flow:**
1. Find user by email
2. Compare password with bcrypt
3. Return same shape as register

**Error codes:**
- `EMAIL_TAKEN` — 409 on register
- `INVALID_CREDENTIALS` — 401 on login
- `VALIDATION_ERROR` — 400 for missing/invalid fields

### User Search

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/users/search?q=<term>` | JWT | Search users by name (case-insensitive, partial match). Excludes self. Returns `[ { _id, name, photo_url, connection_status } ]` |

`connection_status` values: `'none'` | `'pending_sent'` | `'pending_received'` | `'connected'`

### Teams

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/threads/group` | JWT | Create group thread: `{ name, member_ids[] }` → thread with `type: 'group'` |

Existing `GET /api/threads` already returns all threads; client filters by `type` to separate DMs from teams.

---

## 4. Frontend Architecture

### New files
```
client/src/
├── pages/
│   ├── AuthPage.jsx          # Login / Register toggle
│   └── ProfileSetupPage.jsx  # 3-step wizard
├── components/
│   ├── IconRail.jsx          # Left icon nav rail
│   ├── SearchPanel.jsx       # User search + add button
│   ├── TeamsPanel.jsx        # Team list + create modal
│   └── Greeting.jsx          # "Good morning, [name]"
├── context/
│   └── ThemeContext.jsx      # light/dark CSS vars + toggle
└── hooks/
    └── useAuth.js            # login/register/logout helpers
```

### Modified files
- `App.jsx` — add auth gate, profile gate, icon rail layout, theme provider
- `ThreadList.jsx` — filter to `type: 'dm'` threads only
- `api.js` — auto-attach token from localStorage on every request

---

## 5. UI Layout

### Auth Screen
- Full-screen dark background (`#0f172a`)
- Centered white card: Nivarro logo → email + password fields → Sign in / Create account toggle link
- On success: token + user saved to `localStorage`; redirect based on `profile_complete`

### Profile Setup Wizard (3 steps, same dark card)
- **Step 1:** Bio (textarea) + Location (text input)
- **Step 2:** Skills — type-to-add chip input
- **Step 3:** Interests — same chip input
- Progress bar across top showing current step
- "Next →" / "← Back" navigation; "Finish" on step 3
- On finish: `PATCH /api/auth/profile` → mark complete → enter main app

### Main App (Icon Rail Layout)
```
[ Rail ] [ Panel ] [ Chat Area ]
```

**Rail (44px wide, dark):**
- Top: Nivarro logo mark
- Messages icon — shows ThreadList panel (DMs only)
- Search icon — shows SearchPanel
- Teams icon — shows TeamsPanel
- Bottom: ☀️/🌙 theme toggle + avatar

**Panel (280px):** swaps content based on active rail icon

**Chat area:** existing ChatWindow; greeting banner at top

### Search Panel
- Text input at top: live search as user types (debounced 300ms)
- Each result row: avatar + name + status chip
  - `none` → **+ Add** button (sends contact request)
  - `pending_sent` → **Pending** (disabled, grey)
  - `pending_received` → **Accept** button
  - `connected` → **Message** button (opens DM thread)

### Teams Panel
- List of group threads (name + member count + last message preview)
- **+ New team** button at bottom → modal:
  - Team name input
  - Scrollable contact list (checkboxes) — only confirmed contacts
  - **Create** button → `POST /api/threads/group`

### Greeting
- Lives at the top of the chat area header
- `"Good morning, [firstName]"` — time-based:
  - 5am–11:59am → Good morning
  - 12pm–4:59pm → Good afternoon
  - 5pm–4:59am → Good evening
- First name parsed from `user.name` stored in localStorage

---

## 6. Theme System

- `ThemeContext` wraps entire app; reads `localStorage.getItem('theme')` (default: `'dark'`)
- Sets CSS custom properties on `document.body`:
  ```css
  /* dark */
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --text-primary: #ffffff;
  --text-secondary: #94a3b8;
  --accent: #0ea5e9;
  --border: #334155;

  /* light */
  --bg-primary: #f8fafc;
  --bg-secondary: #ffffff;
  --text-primary: #0f172a;
  --text-secondary: #64748b;
  --accent: #0ea5e9;
  --border: #e2e8f0;
  ```
- All components use `var(--bg-primary)` etc. — single toggle flips the whole app
- Toggle persists choice to `localStorage`

---

## 7. Auth Persistence

- On login/register: store `{ token, user }` in `localStorage`
- `api.js` reads token on every request via axios interceptor — no manual passing
- `App.jsx` checks `localStorage` on mount:
  - No token → `AuthPage`
  - Token + `profile_complete: false` → `ProfileSetupPage`
  - Token + `profile_complete: true` → main app
- JWT expiry: 30 days. If a request returns 401 → clear localStorage → redirect to auth

---

## 8. Server Changes Summary

### New files
```
server/
├── routes/
│   ├── auth.js        # register, login, profile patch
│   └── users.js       # search endpoint
└── services/
    └── AuthService.js # register, login, completeProfile logic
```

### Modified files
- `index.js` — mount `/api/auth` (unprotected) and `/api/users` (protected)
- `models/User.js` — add `password_hash`, `profile_complete`
- `models/Thread.js` — add `type`, `name`
- `routes/threads.js` — add `POST /group`
- `services/ThreadService.js` — update `createThread` to accept type/name, update `getThreadsForUser` to populate group name/members

### New package
- `bcryptjs` — password hashing (pure JS, no native build step)

---

## 9. Validation Rules

| Rule | Error |
|------|-------|
| Email must be unique on register | `EMAIL_TAKEN` 409 |
| Password minimum 8 characters | `VALIDATION_ERROR` 400 |
| Team must have a name | `VALIDATION_ERROR` 400 |
| Team must have at least 1 other member | `VALIDATION_ERROR` 400 |
| Search query minimum 1 character | Return empty array |
| Only confirmed contacts can be added to a team | `FORBIDDEN` 403 |

---

## 10. Packages Added

| Package | Side | Purpose |
|---------|------|---------|
| `bcryptjs` | server | Password hashing |

No new client packages needed — theme uses CSS vars, auth uses existing axios.
