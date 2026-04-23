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

**Out of scope for this release:** profile photo upload. `photo_url` field stays on the model and renders as initials avatar when null. Photo upload is a future feature.

---

## 2. Data Model Changes

### User (additions)
```js
{
  password_hash: { type: String, required: true },    // bcrypt hash
  profile_complete: { type: Boolean, default: false } // gates profile wizard
}
```
All other profile fields (`bio`, `skills`, `interests`, `location`) are **optional** — completing the wizard with any combination of values (including all blank) sets `profile_complete: true`. The wizard is not a gating quality check; it is a one-time onboarding prompt.

### Thread (additions)
```js
{
  type: { type: String, enum: ['dm', 'group'], default: 'dm' },
  name: { type: String, default: null }
  // enforcement of name-required-for-group is application-level only (in createGroupThread),
  // not a Mongoose schema validator, to keep the schema simple
}
```

`unread_counts` is an existing `Map` field (string user_id → number). It already supports N participants. For group threads, `ThreadService.createGroupThread` initializes `unread_counts` to `0` for all members.

**`MessageService.sendMessage` must be updated for group threads** — it currently has two bugs that break group messaging:

1. **Two-party contact check (lines 17–24):** uses `const [p1, p2] = thread.participants` which silently drops members beyond the second, then checks only that pair for an accepted `ContactRequest`. For group threads, membership was already validated at creation time. Fix: wrap the entire contact-check block in `if (thread.type !== 'group')`.

2. **Unread increment loop (lines 38–44):** has `return msg` inside the `for` loop — increments only the first non-sender participant then returns immediately. Fix: collect all non-sender participant IDs, run `$inc` for each via `Promise.all`, do a single `$set` for `last_message`, then return.

Corrected pseudocode:
```js
if (thread.type !== 'group') {
  // existing two-party ContactRequest check unchanged
}
// validate + create message (unchanged)
const others = thread.participants.map(String).filter(id => id !== senderId.toString());
await Promise.all(others.map(id =>
  Thread.findByIdAndUpdate(threadId, { $inc: { [`unread_counts.${id}`]: 1 } })
));
await Thread.findByIdAndUpdate(threadId, { $set: { last_message: { sender_id, content, timestamp } } });
return msg;
```

---

## 3. New API Routes

### Auth (no JWT required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | `{ name, email, password }` → `{ token, user }` |
| POST | `/api/auth/login` | `{ email, password }` → `{ token, user }` |
| PATCH | `/api/auth/profile` | JWT required. `{ bio, location, skills, interests }` → sets `profile_complete: true` |

**Register flow:**
1. Validate: name present, email valid + unique, password ≥ 8 chars
2. Hash password with bcrypt (12 rounds)
3. Create User with `profile_complete: false`
4. Sign JWT `{ id, name, email }` with `JWT_SECRET`, 30-day expiry
5. Return `{ token, user: { _id, name, email, photo_url, profile_complete } }`

**Login flow:** find by email → bcrypt compare → return same `{ token, user }` shape.

**Stored in localStorage:** the full `user` object from the response body (not just decoded JWT claims) — this is how `photo_url` and `profile_complete` are available client-side immediately after auth without a separate fetch.

**Error codes:**
| Code | Status | Trigger |
|------|--------|---------|
| `EMAIL_TAKEN` | 409 | Email already registered |
| `INVALID_CREDENTIALS` | 401 | Wrong email or password |
| `VALIDATION_ERROR` | 400 | Missing/invalid fields |
| `TOKEN_EXPIRED` | 401 | JWT has expired (body: `{ code: 'TOKEN_EXPIRED' }`) |

The axios interceptor only clears localStorage and redirects to auth when the 401 response body contains `code: 'TOKEN_EXPIRED'`. All other 401s (e.g., `NOT_PARTICIPANT`, `FORBIDDEN`) are passed through to the calling code as normal errors and do not log the user out. The auth middleware must return `{ code: 'TOKEN_EXPIRED' }` specifically on `jwt.TokenExpiredError` vs `{ code: 'AUTH_FAILED' }` for all other token errors.

**Register form:** includes **email**, **password**, and **confirm password** fields. Submit disabled until password === confirm password. Passwords are hidden by default with a show/hide toggle.

### User Search

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/users/search?q=<term>` | JWT | Case-insensitive partial match on name. Excludes self. Returns `[{ _id, name, photo_url, connection_status }]` |

`connection_status` is computed by querying `ContactRequest` for documents where `(sender_id=self AND recipient_id=result) OR (sender_id=result AND recipient_id=self)`:

| State | `connection_status` |
|-------|---------------------|
| No ContactRequest exists | `'none'` |
| ContactRequest exists, status=`'pending'`, sender=self | `'pending_sent'` |
| ContactRequest exists, status=`'pending'`, recipient=self | `'pending_received'` |
| ContactRequest exists, status=`'accepted'` | `'connected'` |

Empty query string (`q` missing or blank) returns an empty array without querying the database.

### Contacts (new route)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/contacts` | JWT | Returns all accepted contacts: `[{ _id, name, photo_url }]`. Queries `ContactRequest` where `status: 'accepted'` and `sender_id` or `recipient_id` equals current user, then populates the other party's profile. Used by the Teams panel member picker. |

### Teams

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/threads/group` | JWT | `{ name, member_ids[] }` → group thread |

**Validation:** name required; `member_ids` must contain at least 1 entry; all `member_ids` must have an accepted `ContactRequest` with the creator (i.e., a `ContactRequest` with `status: 'accepted'` where one party is the creator and the other is the member_id). If **any** member fails this check, the entire request is rejected with `FORBIDDEN` 403 — no partial group creation. The UI prevents this by only showing confirmed contacts in the member picker.

`POST /api/threads/group` calls `ThreadService.createGroupThread(creatorId, name, memberIds)` which:
1. Validates all members are confirmed contacts of creator
2. Creates Thread with `type: 'group'`, `name`, participants = [creator, ...memberIds], `unread_counts` initialized to 0 for all
3. Emits `thread_updated` to every participant's personal Socket.io room so their `ThreadList` updates in real time

Existing `GET /api/threads` returns all threads for the user; client separates by `thread.type`.

---

## 4. Socket.io Changes

### Group thread creation
When `POST /api/threads/group` succeeds, the route handler emits `thread_updated` on each participant's personal room (same event already used for DM creation).

**Payload for group threads:**
```js
{
  thread_id,
  type: 'group',
  group_name: name,          // team name string
  members: [{ _id, name }],  // all participants populated
  last_message: null,
  participant: null           // always null for groups
}
```

**`useThread.onThreadUpdated` must branch on `type`:**
```js
function onThreadUpdated(data) {
  setThreads(prev => {
    const exists = prev.find(t => t._id === data.thread_id);
    const entry = data.type === 'group'
      ? { _id: data.thread_id, type: 'group', name: data.group_name, members: data.members, last_message: data.last_message, unread_count: 0 }
      : { _id: data.thread_id, type: 'dm',    participant: data.participant, last_message: data.last_message, unread_count: 0 };
    if (exists) {
      return prev.map(t => t._id === data.thread_id ? { ...t, last_message: data.last_message } : t)
                 .sort((a, b) => new Date(b.last_message?.timestamp) - new Date(a.last_message?.timestamp));
    }
    return [entry, ...prev];
  });
}
```

**`ThreadList` must handle group threads:** when `thread.type === 'group'`, display `thread.name` as the title and a square avatar with the team's initial instead of the participant avatar. The existing DM rendering path is unchanged.

### Group message delivery
The existing `send_message` → `message_received` flow emits to the thread room. All participants who have called `join_thread` receive messages normally — no change needed. The thread room already supports N sockets.

### `join_thread` for group threads
No change to the socket handler. `join_thread` verifies the user is a participant (already checks `thread.participants.includes(userId)`) — this works for groups since all members are in `participants`.

---

## 5. Frontend Architecture

### New files
```
client/src/
├── pages/
│   ├── AuthPage.jsx           # Login / Register toggle (dark centered card)
│   └── ProfileSetupPage.jsx   # 3-step wizard
├── components/
│   ├── IconRail.jsx           # Left icon nav rail
│   ├── SearchPanel.jsx        # User search + add button
│   ├── TeamsPanel.jsx         # Team list + create modal
│   └── Greeting.jsx           # Time-based "Good morning, [name]"
├── context/
│   └── ThemeContext.jsx       # CSS vars light/dark + localStorage toggle
└── hooks/
    └── useAuth.js             # login/register/logout + localStorage helpers
```

### Modified files
- `App.jsx` — auth gate → profile gate → main layout (ThemeProvider wrap, icon rail, panel, chat)
- `ThreadList.jsx` — filter threads to `type === 'dm'` only
- `api.js` — axios request interceptor to attach `Authorization: Bearer <token>` from localStorage; response interceptor to catch `TOKEN_EXPIRED` and trigger logout

---

## 6. UI Layout

### Auth Screen
- Full-screen dark background (`#0f172a`)
- Centered card (`#1e293b`, rounded, ~360px wide):
  - "Nivarro" logo/wordmark
  - **Login mode:** email + password (with show/hide toggle) + "Sign in" button + "No account? Create one" link
  - **Register mode:** name + email + password + confirm password (show/hide) + "Create account" button + "Have an account? Sign in" link
- On success: save `{ token, user }` to `localStorage`; redirect based on `user.profile_complete`

### Profile Setup Wizard (3 steps, same dark card style)
- **Step 1:** Bio (textarea, optional) + Location (text input, optional)
- **Step 2:** Skills — type to add chips (press Enter or comma to add, click × to remove)
- **Step 3:** Interests — same chip input
- Progress bar across top (1/3 → 2/3 → 3/3)
- "Next →" / "← Back" navigation buttons; "Finish" on step 3
- "Skip setup" link on step 1 — submits empty values, marks profile complete
- On "Finish" or "Skip": `PATCH /api/auth/profile` → update `localStorage` user → enter main app

### Main App Layout
```
[ Rail 44px ] [ Panel 280px ] [ Chat Area flex-1 ]
```

**Rail (fixed, full height):**
- Top: Nivarro `N` logo mark
- Messages icon (💬) — default active on load
- Search icon (🔍)
- Teams icon (👥)
- Bottom: theme toggle (☀️ light / 🌙 dark) + user avatar (initials if no photo)

**Panel:** swaps based on active rail icon. Contains ThreadList (DMs), SearchPanel, or TeamsPanel.

**Chat area:** ChatWindow when a thread is selected; else an empty state. Greeting at the top of the chat area header bar.

**ContactRequestBanner:** rendered as a fixed-position toast/notification bar above the chat area (not inside the panel), so it remains visible regardless of which panel tab is active.

### Search Panel
- Debounced text input (300ms) → `GET /api/users/search?q=...`
- Each result row: initials avatar + name + action button:
  - `none` → **+ Add** (POST contact request)
  - `pending_sent` → **Pending** (disabled, grey)
  - `pending_received` → **Accept** (PATCH accept)
  - `connected` → **Message** (open or create DM thread)
- Empty state: "Search for people by name"

### Teams Panel
- List of group threads (square avatar with team initial, name, member count, last message preview)
- **+ New team** at bottom → inline modal:
  - Team name text input (required)
  - Scrollable list of confirmed contacts only (checkboxes) — `GET /api/contacts` returning accepted contacts
  - "Create" button (disabled until name + ≥1 member selected) → `POST /api/threads/group`
  - On success: modal closes, new team appears in list

### Greeting Component
- Rendered at top of chat area header
- Logic: reads `user.name` from localStorage, takes the first space-delimited word as first name
- Time brackets (device local time): 5:00–11:59 → "Good morning", 12:00–16:59 → "Good afternoon", 17:00–4:59 → "Good evening"

---

## 7. Theme System

`ThemeContext` wraps the entire app and reads `localStorage.getItem('theme')` on mount (default `'dark'`). It sets CSS custom properties on `document.body`:

```css
/* dark (default) */
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

All components use `var(--bg-primary)` etc. inline or via a single CSS file. Toggling calls `setTheme` in context, updates `document.body` properties, and persists to `localStorage`.

---

## 8. Auth Persistence

- Login/register response: `{ token, user: { _id, name, email, photo_url, profile_complete } }` stored as-is in `localStorage` under keys `token` and `user` (JSON-stringified)
- `api.js` request interceptor: reads `localStorage.getItem('token')` and sets `Authorization` header on every request
- `api.js` response interceptor: if 401 and `response.data.code === 'TOKEN_EXPIRED'` → `localStorage.clear()` → `window.location.href = '/'`. All other 401s propagate normally.
- `App.jsx` on mount: no token → `<AuthPage />`; token + `profile_complete: false` → `<ProfileSetupPage />`; token + `profile_complete: true` → main app layout

---

## 9. Server Changes Summary

### New files
```
server/
├── routes/
│   ├── auth.js         # register, login, profile patch
│   └── users.js        # search endpoint
└── services/
    └── AuthService.js  # register, login, completeProfile logic
```

### Modified files
- `index.js` — mount `/api/auth` (no auth middleware), `/api/users` (requireAuth), add `GET /api/contacts` to existing contacts router
- `middleware/auth.js` — distinguish `TokenExpiredError` → `{ code: 'TOKEN_EXPIRED' }` from other JWT errors → `{ code: 'AUTH_FAILED' }`
- `models/User.js` — add `password_hash`, `profile_complete`
- `models/Thread.js` — add `type`, `name`
- `routes/contacts.js` — add `GET /` returning accepted contacts list
- `routes/threads.js` — add `POST /group`
- `services/ThreadService.js` — add `createGroupThread`; update `getThreadsForUser` to populate group member names
- `services/MessageService.js` — fix two-party contact check (group bypass) and unread increment loop (all non-senders)
- `client/src/hooks/useThread.js` — branch `onThreadUpdated` on `type` for group vs DM entry construction
- `client/src/components/ThreadList.jsx` — render group threads with team name + square initial avatar

### Confirmed existing packages (no additions needed)
- `jsonwebtoken` — already a dependency (used in auth middleware)

### New packages
| Package | Side | Purpose |
|---------|------|---------|
| `bcryptjs` | server | Password hashing — pure JS, no native build |

---

## 10. Validation Rules

| Rule | Response |
|------|----------|
| Email unique on register | `EMAIL_TAKEN` 409 |
| Password ≥ 8 characters | `VALIDATION_ERROR` 400 |
| Confirm password must match (client-side only) | Inline form error, submit blocked |
| Team name required | `VALIDATION_ERROR` 400 |
| Team must have ≥ 1 member | `VALIDATION_ERROR` 400 |
| All team members must be confirmed contacts of creator | `FORBIDDEN` 403 (reject entire request) |
| Search query blank | Return `[]`, no DB query |
| `TOKEN_EXPIRED` on any request | 401 `{ code: 'TOKEN_EXPIRED' }` → client clears auth |
