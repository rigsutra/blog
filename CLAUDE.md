# CLAUDE.md — Blog Platform — Full Project Context

This file is the single source of truth for Claude Code working in this repository.
Read this before touching any file. It covers every function, variable, route, and component.

---

## Project Overview

A full-stack blog platform built with:

- **Next.js 15** (App Router, TypeScript, Server Components)
- **Prisma ORM + SQLite** — local database at `prisma/dev.db`
- **TipTap** — rich text editor (Medium-style)
- **iron-session** — encrypted cookie-based session auth
- **bcryptjs** — password hashing (12 rounds)
- **sanitize-html** — XSS protection on all stored HTML
- **Tailwind CSS + @tailwindcss/typography** — styling

---

## Quick Start

```bash
npm install            # install deps
npm run db:push        # create / sync SQLite schema
npm run db:seed        # seed admin + sample data
npm run dev            # start dev server at http://localhost:3000
```

**Admin login:** http://localhost:3000/admin/login  
**Credentials:** set via `prisma/seed.ts` (see seed file for current values)

---

## Database — SQLite

**File location:** `prisma/dev.db`  
**Connection string (`.env`):** `DATABASE_URL="file:./dev.db"`

### Tables

#### `admin_users`

| Column        | Type     | Notes             |
| ------------- | -------- | ----------------- |
| id            | Int PK   | auto-increment    |
| username      | String   | unique            |
| password_hash | String   | bcrypt, 12 rounds |
| created_at    | DateTime | default now()     |

#### `categories`

| Column | Type   | Notes            |
| ------ | ------ | ---------------- |
| id     | Int PK |                  |
| name   | String | unique           |
| slug   | String | unique, URL-safe |

#### `blogs`

| Column       | Type      | Notes                                   |
| ------------ | --------- | --------------------------------------- |
| id           | Int PK    |                                         |
| title        | String    |                                         |
| slug         | String    | unique, auto-generated from title       |
| excerpt      | String    | short description shown in cards        |
| content      | String    | sanitized HTML from TipTap              |
| cover_image  | String?   | nullable URL path (e.g. /uploads/x.jpg) |
| status       | String    | "draft" or "published"                  |
| reading_time | Int       | auto-calculated, default 1 (minutes)    |
| category_id  | Int?      | FK → categories.id, nullable            |
| created_at   | DateTime  | auto                                    |
| updated_at   | DateTime  | auto-updated                            |
| published_at | DateTime? | set when first published                |

### Prisma Commands

```bash
npm run db:push       # sync schema changes to SQLite
npm run db:seed       # run prisma/seed.ts
npm run db:studio     # open Prisma Studio GUI (port 5555)
npm run db:generate   # regenerate Prisma client types
```

---

## Environment Variables (`.env`)

| Variable                       | Purpose                                       | Example                        |
| ------------------------------ | --------------------------------------------- | ------------------------------ |
| `DATABASE_URL`                 | SQLite file path for Prisma                   | `file:./dev.db`                |
| `SESSION_SECRET`               | 32+ char secret for iron-session encryption   | `change-this-to-random-string` |
| `NEXT_PUBLIC_SITE_URL`         | Public base URL (used in sitemap, OG tags)    | `http://localhost:3000`        |
| `NEXT_PUBLIC_SITE_NAME`        | Site name shown in navbar, footer, meta title | `Ashish Blog's`                |
| `NEXT_PUBLIC_SITE_DESCRIPTION` | Site description used in meta/OG tags         | `A modern blog...`             |

> `NEXT_PUBLIC_*` variables are exposed to the browser. Never put secrets there.

---

## File Tree

```
C:/projects/Blog/
├── .env                         # local environment variables
├── .env.example                 # template for env vars
├── .gitignore
├── CLAUDE.md                    # ← this file
├── README.md                    # user-facing setup guide
├── next.config.ts               # Next.js config (image domains, body size)
├── package.json                 # deps + scripts
├── postcss.config.js            # Tailwind/Autoprefixer pipeline
├── tailwind.config.ts           # Tailwind + typography plugin
├── tsconfig.json                # TypeScript config (paths alias @/→src/)
│
├── prisma/
│   ├── dev.db                   # LOCAL SQLite database (gitignored)
│   ├── schema.prisma            # DB schema: AdminUser, Category, Blog
│   └── seed.ts                  # Seeds admin user + categories + 3 sample posts
│
├── public/
│   └── uploads/                 # Uploaded images served as /uploads/filename
│       └── .gitkeep
│
└── src/
    ├── middleware.ts             # Auth guard: protects /admin/* and /api/admin/*
    ├── types/
    │   └── index.ts             # Shared TypeScript interfaces
    │
    ├── lib/
    │   ├── prisma.ts            # Prisma client singleton (prevents dev hot-reload leaks)
    │   ├── session.ts           # iron-session config + getSession() helper
    │   ├── auth.ts              # requireAdmin(), isAuthenticated() helpers
    │   ├── utils.ts             # Server-only: slug, reading time, sanitize, format
    │   └── client-utils.ts      # Client-safe: generateSlugClient()
    │
    ├── app/
    │   ├── layout.tsx           # Root HTML layout: fonts, metadata defaults
    │   ├── globals.css          # Tailwind base + custom editor/blog CSS
    │   ├── sitemap.ts           # Auto-generated /sitemap.xml for SEO
    │   │
    │   ├── (public)/            # Route group — wraps public pages with Navbar+Footer
    │   │   ├── layout.tsx       # Injects Navbar + Footer around all public pages
    │   │   ├── page.tsx         # Homepage: blog grid, search, category filter, pagination
    │   │   ├── about/
    │   │   │   └── page.tsx     # Static about page with 3 value cards
    │   │   ├── contact/
    │   │   │   └── page.tsx     # Contact form (client component, simulated submit)
    │   │   └── blog/
    │   │       └── [slug]/
    │   │           └── page.tsx # Blog detail: full content, related posts, OG meta
    │   │
    │   ├── admin/               # Admin panel — all routes protected by middleware
    │   │   ├── layout.tsx       # Thin pass-through layout wrapper
    │   │   ├── login/
    │   │   │   └── page.tsx     # Login form — calls POST /api/auth/login
    │   │   ├── dashboard/
    │   │   │   └── page.tsx     # Stats (4 counters) + recent posts list
    │   │   ├── blogs/
    │   │   │   ├── page.tsx     # Blog list with search/filter/delete/pagination
    │   │   │   ├── new/
    │   │   │   │   └── page.tsx # Create post — renders <BlogForm /> with no initialData
    │   │   │   └── [id]/
    │   │   │       └── edit/
    │   │   │           └── page.tsx # Edit post — fetches blog server-side, passes to <BlogForm>
    │   │   └── categories/
    │   │       └── page.tsx     # Category CRUD: inline create, rename, delete
    │   │
    │   └── api/                 # API routes (Next.js route handlers)
    │       ├── auth/
    │       │   ├── login/route.ts    # POST — validates credentials, sets session
    │       │   ├── logout/route.ts   # POST — destroys session
    │       │   └── me/route.ts       # GET  — returns current session info
    │       ├── blogs/
    │       │   ├── route.ts          # GET  — public blog listing (published only)
    │       │   └── slug/route.ts     # GET ?s=slug — fetch single published blog
    │       ├── categories/
    │       │   └── route.ts          # GET  — all categories with public blog counts
    │       ├── upload/
    │       │   └── route.ts          # POST multipart — saves image to public/uploads/
    │       └── admin/               # Protected by middleware (session required)
    │           ├── blogs/
    │           │   ├── route.ts      # GET (list all) + POST (create)
    │           │   └── [id]/
    │           │       └── route.ts  # GET + PUT (update) + DELETE
    │           └── categories/
    │               ├── route.ts      # GET (list all) + POST (create)
    │               └── [id]/
    │                   └── route.ts  # PUT (rename) + DELETE
    │
    └── components/
        ├── public/
        │   ├── Navbar.tsx        # Sticky top nav with mobile hamburger
        │   ├── Footer.tsx        # 3-column footer with nav links
        │   ├── BlogCard.tsx      # Card with cover, category badge, title, excerpt, meta
        │   └── SearchFilter.tsx  # Debounced search input + category dropdown
        └── admin/
            ├── AdminLayout.tsx   # Flex wrapper: AdminSidebar + <main>
            ├── AdminSidebar.tsx  # Left nav: Dashboard, Blogs, New, Categories, Logout
            ├── BlogEditor.tsx    # TipTap rich text editor + toolbar (client-only)
            └── BlogForm.tsx      # Full create/edit form: title, editor, settings sidebar
```

---

## Source File Breakdown — Every Function & Variable

---

### `src/middleware.ts`

**Purpose:** Next.js edge middleware — intercepts every request to `/admin/*` and `/api/admin/*`.
Runs before any page or API route handler.

```
export async function middleware(request: NextRequest)
```

- Reads `pathname` from `request.nextUrl`
- If path starts with `/admin` (but not `/admin/login`): reads iron-session, redirects to `/admin/login` if not authenticated
- If path starts with `/api/admin`: reads session, returns 401 JSON if not authenticated
- Otherwise: passes request through unchanged

**Key variable:**

- `config.matcher` — `["/admin/:path*", "/api/admin/:path*"]` — limits middleware to only these paths (important for performance)

---

### `src/types/index.ts`

Shared TypeScript interfaces used across the entire app.

| Interface        | Fields & Purpose                                                                                                                                                     |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| `Blog`           | Full blog shape: id, title, slug, excerpt, content, coverImage, status ("draft"\|"published"), readingTime, categoryId, category?, createdAt, updatedAt, publishedAt |
| `Category`       | id, name, slug, optional `_count.blogs` (used to show post counts)                                                                                                   |
| `AdminUser`      | id, username, createdAt                                                                                                                                              |
| `BlogCardProps`  | `{ blog: Blog & { category?: Category                                                                                                                                | null } }` — prop type for BlogCard |
| `PaginationMeta` | page, limit, total, totalPages — returned by all list APIs                                                                                                           |
| `ApiResponse<T>` | Generic `{ success, data?, error?, message? }` — standard API response shape                                                                                         |

---

### `src/lib/prisma.ts`

**Purpose:** Creates and exports a single `PrismaClient` instance. Prevents multiple connections during Next.js hot reloads in development.

```typescript
export const prisma; // PrismaClient singleton
```

**Pattern:** Stores instance on `globalThis` in development so HMR doesn't create 100 connections. In production a fresh instance is always used.

---

### `src/lib/session.ts`

**Purpose:** Configures iron-session (encrypted cookie sessions).

```typescript
export interface SessionData {
  adminId?: number; // DB id of logged-in admin
  username?: string; // display name
  isLoggedIn: boolean; // always set; false means guest
}

export const sessionOptions: SessionOptions;
// cookieName: "blog_admin_session"
// password:   process.env.SESSION_SECRET  (must be 32+ chars)
// httpOnly: true, sameSite: "lax"
// maxAge: 7 days (604800 seconds)
// secure: true in production only

export async function getSession(): Promise<IronSession<SessionData>>;
// Used in Server Components and Server Actions.
// Reads cookies() from next/headers.

export async function getSessionFromRequest(
  req,
  res,
): Promise<IronSession<SessionData>>;
// Used in API route handlers (req/res based, not cookie store).
```

---

### `src/lib/auth.ts`

**Purpose:** Higher-level auth helpers that wrap session checks.

```typescript
export async function requireAdmin();
// Returns session object if logged in, null if not.
// Use in server components that need to guard content.

export async function isAuthenticated(): Promise<boolean>;
// Returns true/false. Use when you only need a boolean gate.
```

---

### `src/lib/utils.ts`

**Purpose:** Server-side utility functions. Uses Node.js deps (`slugify`, `sanitize-html`) — do NOT import in client components.

```typescript
export function generateSlug(title: string): string;
// Uses `slugify` library: lowercase, strict, trim.
// Example: "Hello World!" → "hello-world"
// Used in: POST /api/admin/blogs, POST /api/admin/categories

export function calculateReadingTime(content: string): number;
// Strips HTML tags, counts words, divides by 200 wpm.
// Returns minimum 1. Stored on blog.readingTime.

export function sanitizeContent(html: string): string;
// Runs sanitize-html with a safe allowlist.
// Strips script, style, and dangerous attributes.
// Allowed tags: h1-h6, p, br, strong, em, u, s, code, pre,
//   blockquote, ul, ol, li, a, img, hr, figure, figcaption
// All <a> tags get rel="noopener noreferrer" added automatically.
// External links get target="_blank".

export function formatDate(date: Date | string): string;
// Returns "April 5, 2026" format (en-US locale).
// Used in BlogCard and blog detail page.

export function truncateText(text: string, maxLength: number): string;
// Truncates to maxLength chars and appends "...".

export function stripHtml(html: string): string;
// Strips all HTML tags. Returns plain text.
```

---

### `src/lib/client-utils.ts`

**Purpose:** Client-safe versions of utilities (no Node.js deps). Safe to import in `"use client"` components.

```typescript
export function generateSlugClient(title: string): string;
// Pure JS slug generator: lowercase, replace spaces→hyphens, strip specials.
// Used in BlogForm.tsx for real-time slug preview as user types title.
```

---

## API Routes — Full Reference

### Auth Routes

#### `POST /api/auth/login`

- **Body:** `{ username: string, password: string }`
- **Logic:** Looks up admin by username → `bcrypt.compare(password, hash)` → if valid, writes iron-session to response cookie
- **Returns:** `{ success: true, message }` or `{ error }` with 400/401
- **Key vars:** `session.adminId`, `session.username`, `session.isLoggedIn = true`

#### `POST /api/auth/logout`

- **Logic:** Calls `session.destroy()` which clears the cookie
- **Returns:** `{ success: true }`

#### `GET /api/auth/me`

- **Logic:** Reads session, returns whether logged in + username
- **Returns:** `{ isLoggedIn: false }` or `{ isLoggedIn, username, adminId }`

---

### Public Blog Routes

#### `GET /api/blogs`

- **Query params:** `page`, `limit` (default 9), `search` (title contains), `category` (category slug)
- **Logic:** Only returns `status: "published"` blogs. Ordered by `publishedAt desc`.
- **Returns:** `{ blogs: Blog[], meta: PaginationMeta }`

#### `GET /api/blogs/slug?s={slug}`

- **Logic:** Finds one published blog by exact slug
- **Returns:** `{ blog }` or 404

#### `GET /api/categories`

- **Logic:** Returns all categories with `_count.blogs` (published only)
- **Returns:** `{ categories: Category[] }`

---

### File Upload

#### `POST /api/upload`

- **Auth:** Session required (checks iron-session inline)
- **Body:** `FormData` with field `file`
- **Validation:** MIME must be jpeg/png/webp/gif; size ≤ 5MB
- **Logic:** Saves to `public/uploads/{timestamp}-{random}{ext}`
- **Returns:** `{ url: "/uploads/filename.ext" }`
- **Key constants:** `ALLOWED_TYPES`, `MAX_SIZE = 5 * 1024 * 1024`

---

### Admin Blog Routes (all protected by middleware)

#### `GET /api/admin/blogs`

- **Query:** `page`, `limit` (10), `search`, `status` (draft|published)
- **Returns all statuses** (unlike the public route)
- **Returns:** `{ blogs, meta }`

#### `POST /api/admin/blogs`

- **Body:** `{ title, excerpt, content, coverImage?, categoryId?, status }`
- **Logic:**
  1. Validates title + content required
  2. `generateSlug(title)` — appends `Date.now()` if slug taken
  3. `sanitizeContent(content)` — strips XSS
  4. `calculateReadingTime(sanitized)`
  5. Sets `publishedAt = new Date()` only if `status === "published"`
- **Returns:** `{ blog }` with 201

#### `GET /api/admin/blogs/[id]`

- **Returns:** single blog by numeric id (any status)

#### `PUT /api/admin/blogs/[id]`

- **Body:** same as POST
- **Logic:**
  1. If title changed → regenerate slug, check uniqueness against other blogs
  2. Re-sanitize and recalculate reading time
  3. `isPublishing = status === "published" && existing.status !== "published"` — only sets `publishedAt` once
- **Returns:** `{ blog }`

#### `DELETE /api/admin/blogs/[id]`

- **Logic:** Hard deletes the blog row
- **Returns:** `{ success: true }`

---

### Admin Category Routes

#### `GET /api/admin/categories`

- **Returns:** All categories with total blog count (all statuses)

#### `POST /api/admin/categories`

- **Body:** `{ name: string }`
- **Logic:** Generates slug from name, checks for duplicate name or slug
- **Returns:** `{ category }` with 201

#### `PUT /api/admin/categories/[id]`

- **Body:** `{ name: string }`
- **Logic:** Regenerates slug from new name, updates record

#### `DELETE /api/admin/categories/[id]`

- **Logic:** First `updateMany` to null out `categoryId` on all related blogs (prevents FK error), then deletes the category
- **Returns:** `{ success: true }`

---

## Pages — Full Reference

### Public Pages

#### `src/app/(public)/layout.tsx`

Wraps all public pages with `<Navbar>` + `<Footer>`.

#### `src/app/(public)/page.tsx` — Homepage

- **Server Component** with `async` data fetching
- **Props:** `searchParams` (Promise of `{ search?, category?, page? }`)
- **Functions:**
  - `BlogList({ search, category, page })` — async server component that queries Prisma directly. Shows "No articles found" empty state.
  - Default export `HomePage` — fetches categories, renders hero + `<SearchFilter>` + `<BlogList>` wrapped in `<Suspense>`
- **Key variables:** `limit = 9`, `skip = (page-1) * limit`, `where` filter object built conditionally

#### `src/app/(public)/blog/[slug]/page.tsx` — Blog Detail

- **Functions:**
  - `generateMetadata({ params })` — async, returns OG + Twitter meta using blog data
  - `generateStaticParams()` — returns all published slugs for static generation at build time
  - Default export — fetches blog by slug (404 if not found), fetches related posts by same category
- **Related posts query:** same category, excluding current, limit 3, ordered by publishedAt

#### `src/app/(public)/about/page.tsx` — Static About

- No data fetching. Static page with 3 value cards (Quality Writing, Deep Dives, Reader First).

#### `src/app/(public)/contact/page.tsx` — Contact Form

- Client component (`"use client"`)
- **State:** `form { name, email, message }`, `submitted`, `loading`
- `handleSubmit(e)` — currently simulates 800ms async delay, then shows success state. Replace with real email service (Resend, SendGrid, etc.)

---

### Admin Pages

#### `src/app/admin/login/page.tsx`

- Client component. Shows login form.
- **State:** `form { username, password }`, `showPass`, `loading`, `error`
- `handleSubmit(e)` — POSTs to `/api/auth/login`, on success redirects to `/admin/dashboard`

#### `src/app/admin/dashboard/page.tsx`

- Server component. Runs 5 Prisma queries in `Promise.all`:
  - `totalBlogs`, `publishedBlogs`, `draftBlogs`, `totalCategories`, `recentBlogs` (last 5 updated)
- Renders stat cards and recent post list with edit/view links.

#### `src/app/admin/blogs/page.tsx`

- Client component (needs `useSearchParams`), wrapped in `<Suspense>` in default export.
- Inner component `AdminBlogsInner`:
  - **State:** `blogs`, `meta`, `loading`, `search`, `status`, `deleting`
  - `fetchBlogs()` — calls `GET /api/admin/blogs` with current filters
  - `handleDelete(id, title)` — confirms → calls `DELETE /api/admin/blogs/${id}` → refetches
  - `updateFilters(search, status)` — pushes updated URL query params

#### `src/app/admin/blogs/new/page.tsx`

- Server component, simply renders `<AdminLayout><BlogForm /></AdminLayout>` with no `initialData` prop.

#### `src/app/admin/blogs/[id]/edit/page.tsx`

- Server component. Fetches blog from Prisma by id (404 if not found).
- Passes `initialData` to `<BlogForm>`.

#### `src/app/admin/categories/page.tsx`

- Client component.
- **State:** `categories`, `loading`, `newName`, `creating`, `editing { id, name }`, `deleting`, `error`
- `fetchCategories()` — GET `/api/admin/categories`
- `handleCreate(e)` — POST new category
- `handleUpdate(id, name)` — PUT rename; inline edit triggered by pencil icon
- `handleDelete(id, name)` — confirms → DELETE (safe, blogs get uncategorized)

---

## Components — Full Reference

### `src/components/public/Navbar.tsx`

- Client component (needs `useState` for mobile menu)
- **State:** `isOpen` — toggles mobile hamburger menu
- **Key variable:** `navLinks` — array of `{ href, label }` for Home/About/Contact
- Sticky header with glass blur effect (`bg-white/90 backdrop-blur-md`)

### `src/components/public/Footer.tsx`

- Server component (no hooks)
- 3-column grid: brand + description, nav links, admin link
- `year` computed via `new Date().getFullYear()`

### `src/components/public/BlogCard.tsx`

- Server component
- Shows: cover image (or letter avatar fallback), category badge linking to `/?category=slug`, title, excerpt (3-line clamp), date + reading time
- Hover effects: shadow, scale on image, blue title color

### `src/components/public/SearchFilter.tsx`

- Client component (must be wrapped in `<Suspense>` by parent — done in homepage)
- **State:** `search`, `category`
- `updateUrl(newSearch, newCategory)` — memoized with `useCallback`; builds URLSearchParams and calls `router.push`
- **Debounce:** 400ms timeout on search input changes before URL update
- `clearSearch()` — resets search and updates URL
- **Layout:** both controls centered (`justify-center`); search is `w-[180px]`, category is `w-[240px]` (search = 3/4 of category width); full-width on mobile

---

### `src/components/admin/AdminLayout.tsx`

- Server component (no hooks needed)
- Renders `<AdminSidebar>` + `<main>` in a flex row

### `src/components/admin/AdminSidebar.tsx`

- Client component (needs `usePathname` for active link detection, `useRouter` for logout)
- **Key variable:** `navItems` — array of `{ href, label, icon }` for all 4 nav links
- `handleLogout()` — POSTs to `/api/auth/logout`, then `router.push("/admin/login")`
- Active link detection: exact match for dashboard, prefix match for others

### `src/components/admin/BlogEditor.tsx`

- Client component (`"use client"`) — **loaded via `dynamic()` with `ssr: false`** in BlogForm
- **Props:** `content: string`, `onChange: (html: string) => void`, `onImageUpload?: (file: File) => Promise<string>`
- **Key variable:** `editor` — TipTap `Editor` instance from `useEditor()`
- **TipTap extensions loaded:**
  | Extension | Notes |
  |-------------------|----------------------------------------------------|
  | StarterKit | Core: doc, paragraph, text, history, etc. CodeBlock and HorizontalRule disabled here (overridden below) |
  | Underline | `Ctrl+U` |
  | Link | `openOnClick: false` so editing is possible |
  | Image | With `rounded-lg max-w-full` class |
  | Placeholder | "Start writing your story…" |
  | CodeBlock | Dark theme class override |
  | HorizontalRule | Inserts `<hr>` |

- **`setLink()`** — prompts for URL, calls `editor.chain().focus().setLink()` or `unsetLink()`
- **`handleImageUpload(file)`** — calls `onImageUpload` prop → inserts image node at cursor
- **`fileInputRef`** — hidden `<input type="file">` triggered by toolbar Image button
- **`useEffect` on `content`** — syncs external content changes into editor (used when loading edit page)
- **`ToolbarButton`** — internal sub-component: renders a styled button, shows blue active state
- **`Divider`** — 1px vertical line between toolbar groups

### `src/components/admin/BlogForm.tsx`

- Client component. The main create/edit form. Contains all form logic.
- **Dynamically imports `BlogEditor`** with `ssr: false` (TipTap requires browser DOM)
- **Props:** `initialData?` — if provided, form is in "edit" mode
- **`isEdit`** — `!!initialData` — controls POST vs PUT, URL, heading text
- **`form` state:**
  ```typescript
  {
    title: string,
    slug: string,
    excerpt: string,
    content: string,      // HTML from TipTap
    coverImage: string,   // URL path or empty
    categoryId: string,   // stringified number or ""
    status: "draft" | "published"
  }
  ```
- **`saveStatus`** — `"idle" | "saving" | "saved" | "error"` — drives the auto-save status line
- **`autoSaveTimer`** — `useRef` holding the debounce timer ID
- **`coverInputRef`** — ref to hidden file input for cover image upload
- **Key functions:**
  - `autoSave()` — `useCallback`; POSTs/PUTs current form state silently every 5 seconds after content changes
  - `handleSave(publishStatus?)` — manual save; validates, calls API, redirects to edit URL on success
  - `handleCoverUpload(file)` — uploads to `/api/upload`, sets `form.coverImage` to returned URL
  - `handleEditorImageUpload(file)` — same as above but returns URL string for TipTap to use
- **Auto-slug generation:** `useEffect` on `form.title` — only fires on new posts (`!isEdit`) and only if slug not already set; uses `generateSlugClient`
- **Auto-save trigger:** `useEffect` on `form.content + form.title` — clears and resets 5s debounce timer on every change

---

## CSS — `src/app/globals.css`

Key CSS classes defined here (not Tailwind utilities):

| Class                                                | Purpose                                                                                                                   |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `.ProseMirror`                                       | TipTap editor content area styles                                                                                         |
| `.ProseMirror p.is-editor-empty:first-child::before` | Placeholder text via CSS `content: attr(data-placeholder)`                                                                |
| `.blog-content`                                      | Styles for rendered blog HTML on public detail page: heading sizes, list styles, blockquote, code, pre, links, images, hr |
| `.sidebar-link`                                      | Base style for admin nav links (flex, padding, rounded, transition)                                                       |
| `.sidebar-link.active`                               | Blue background highlight for current page                                                                                |
| `.line-clamp-2/3`                                    | CSS multi-line text truncation                                                                                            |

---

## Authentication Flow

```
User submits login form
  → POST /api/auth/login
      → bcrypt.compare(password, hash)
      → iron-session: writes encrypted cookie "blog_admin_session"
          containing { adminId, username, isLoggedIn: true }

Every subsequent admin request:
  → middleware.ts reads cookie (edge runtime)
  → Decrypts session
  → If isLoggedIn=false or adminId missing → redirect to /admin/login
  → Otherwise → request passes through

Logout:
  → POST /api/auth/logout
  → session.destroy() clears the cookie
```

---

## Content Flow (Create Blog)

```
Admin fills BlogForm (title, TipTap content, category, excerpt, cover)
  → Auto-save every 5s: POST /api/admin/blogs (status=draft)
  → Click "Publish": POST /api/admin/blogs (status=published)

API handler:
  → generateSlug(title) using slugify
  → sanitizeContent(html) — strips XSS, enforces allowlist
  → calculateReadingTime(sanitized) — word count / 200
  → prisma.blog.create(...)
  → Sets publishedAt = now() if publishing

Blog appears on public homepage:
  → GET / fetches from Prisma (status: "published")
  → BlogCard renders it with title, excerpt, cover, date, reading time

Blog detail page:
  → /blog/[slug] calls generateStaticParams() at build time
  → SSG prerendered (rebuilds on next `npm run build`)
  → dangerouslySetInnerHTML renders the sanitized content
```

---

## Image Upload Flow

```
User selects file in BlogForm (cover) or BlogEditor (inline)
  → FormData { file } → POST /api/upload
  → Validates MIME type (jpeg/png/webp/gif only)
  → Validates size (≤ 5MB)
  → Writes to public/uploads/{timestamp}-{random}.{ext}
  → Returns { url: "/uploads/filename.ext" }
  → BlogForm sets form.coverImage = url
  → BlogEditor inserts <img src=url> node at cursor
```

---

## Key Constants & Magic Numbers

| Location                             | Constant         | Value        | Purpose                            |
| ------------------------------------ | ---------------- | ------------ | ---------------------------------- |
| `api/upload/route.ts`                | `MAX_SIZE`       | 5MB          | Max upload size                    |
| `api/upload/route.ts`                | `ALLOWED_TYPES`  | 4 MIME types | Upload whitelist                   |
| `lib/utils.ts`                       | `wordsPerMinute` | 200          | Reading time calculation base      |
| `lib/session.ts`                     | `maxAge`         | 604800       | Session duration: 7 days (seconds) |
| `app/api/blogs/route.ts`             | default `limit`  | 9            | Public homepage page size          |
| `app/api/admin/blogs/route.ts`       | default `limit`  | 10           | Admin list page size               |
| `components/admin/BlogForm.tsx`      | auto-save delay  | 5000ms       | Debounce before auto-save fires    |
| `components/public/SearchFilter.tsx` | debounce         | 400ms        | Search URL update delay            |
| `prisma/seed.ts`                     | bcrypt rounds    | 12           | Password hash cost factor          |

---

## NPM Scripts

| Script                | What it runs                                                   |
| --------------------- | -------------------------------------------------------------- |
| `npm run dev`         | `next dev` — hot-reload dev server on :3000                    |
| `npm run build`       | `next build` — production build (runs type check + static gen) |
| `npm run start`       | `next start` — serve the production build                      |
| `npm run lint`        | `next lint` — ESLint                                           |
| `npm run db:push`     | `prisma db push` — sync schema.prisma → dev.db                 |
| `npm run db:seed`     | `ts-node prisma/seed.ts` — seed admin + categories + blogs     |
| `npm run db:studio`   | `prisma studio` — browser GUI for dev.db at :5555              |
| `npm run db:generate` | `prisma generate` — rebuild Prisma client types                |

---

## Extending This Project

### Add a new admin page

1. Create `src/app/admin/your-page/page.tsx`
2. Wrap with `<AdminLayout>` — middleware protects it automatically
3. Add it to `navItems` array in `src/components/admin/AdminSidebar.tsx`

### Add a new public API field

1. Add column to `prisma/schema.prisma`
2. Run `npm run db:push`
3. Add to the `Blog` interface in `src/types/index.ts`
4. Update relevant API route and component

### Switch from SQLite to PostgreSQL

1. Change `schema.prisma` datasource provider to `"postgresql"`
2. Update `DATABASE_URL` in `.env` to a PostgreSQL connection string
3. Run `npm run db:push` (or `prisma migrate dev` for migrations)

### Replace local file uploads with cloud storage

- Edit `src/app/api/upload/route.ts`
- Replace `writeFile` with your cloud SDK (AWS S3, Cloudinary, etc.)
- Return the cloud URL instead of `/uploads/filename`

### Add a new admin user

```bash
npm run db:studio
# Open admin_users table → Add record
# password_hash = bcrypt.hash("yourpassword", 12)
```

Or add a new `upsert` block in `prisma/seed.ts` and re-run `npm run db:seed`.
