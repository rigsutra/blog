# Blog Platform

A complete full-stack blog website built with Next.js 15, Prisma, SQLite, TipTap editor, and Tailwind CSS.

---

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment variables
```bash
cp .env.example .env
```
Edit `.env` and set a strong `SESSION_SECRET` (at least 32 random characters).

### 3. Initialize the database
```bash
npm run db:push
```

### 4. Seed the database (creates admin user + sample data)
```bash
npm run db:seed
```

### 5. Start the dev server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## Admin Panel

URL: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

Default credentials:
- **Username:** `admin`
- **Password:** `admin123`

> **Change the password after first login** (via Prisma Studio or a custom settings page).

---

## Commands

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run db:push` | Sync Prisma schema to database |
| `npm run db:seed` | Seed database with sample data |
| `npm run db:studio` | Open Prisma Studio (database GUI) |
| `npm run db:generate` | Regenerate Prisma client |

---

## Project Structure

```
src/
├── app/
│   ├── (public)/          # Public blog pages
│   │   ├── page.tsx       # Homepage with blog listing
│   │   ├── blog/[slug]/   # Blog detail page
│   │   ├── about/         # About page
│   │   └── contact/       # Contact page
│   ├── admin/             # Admin panel
│   │   ├── login/         # Admin login
│   │   ├── dashboard/     # Dashboard with stats
│   │   ├── blogs/         # Blog management
│   │   └── categories/    # Category management
│   ├── api/               # API routes
│   │   ├── auth/          # Login/logout/me
│   │   ├── blogs/         # Public blog endpoints
│   │   ├── categories/    # Public category endpoints
│   │   ├── admin/         # Protected admin endpoints
│   │   └── upload/        # Image upload
│   ├── layout.tsx         # Root layout
│   └── sitemap.ts         # Auto-generated sitemap
├── components/
│   ├── public/            # Public-facing components
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── BlogCard.tsx
│   │   └── SearchFilter.tsx
│   └── admin/             # Admin components
│       ├── AdminLayout.tsx
│       ├── AdminSidebar.tsx
│       ├── BlogEditor.tsx  # TipTap rich text editor
│       └── BlogForm.tsx    # Full blog create/edit form
├── lib/
│   ├── prisma.ts          # Prisma client singleton
│   ├── session.ts         # iron-session config
│   ├── auth.ts            # Auth helpers
│   ├── utils.ts           # Server utilities (slug, reading time, sanitize)
│   └── client-utils.ts    # Client-safe utilities
├── middleware.ts           # Route protection for /admin
└── types/index.ts          # Shared TypeScript types
prisma/
├── schema.prisma           # Database schema
└── seed.ts                 # Database seeder
public/
└── uploads/                # Uploaded images (local)
```

---

## Features

### Public Site
- Clean, Medium-inspired reading layout
- Homepage with blog cards (title, cover, excerpt, category, date, reading time)
- Search blogs by title (debounced)
- Filter by category
- Blog detail page with rich content rendering
- Related posts section
- About & Contact pages
- Auto-generated XML sitemap
- Open Graph & Twitter card meta tags
- Fully responsive

### Admin Panel
- Secure session-based login (bcrypt password hashing + iron-session)
- Dashboard with stats (total posts, published, drafts, categories)
- Blog list with search, status filter, and pagination
- Create/Edit blogs with TipTap rich text editor
- Auto-save drafts every 5 seconds
- Preview mode before publishing
- Draft / Publish toggle
- Slug auto-generation from title
- Cover image upload (local) or URL paste
- Category management (CRUD)
- Delete with confirmation

### Editor (TipTap)
Toolbar includes:
- Undo / Redo
- Headings (H1, H2, H3)
- Bold, Italic, Underline, Strikethrough
- Inline code
- Bullet list, Numbered list
- Blockquote
- Code block
- Link (add/remove)
- Image upload
- Horizontal rule

### Security
- Passwords hashed with bcrypt (12 rounds)
- Session encrypted via iron-session
- Middleware protects all `/admin/*` routes
- HTML content sanitized with sanitize-html before storage
- File uploads validated (type + size limit: 5MB)
- All admin API routes protected

---

## Database Schema

```prisma
model AdminUser {
  id           Int      @id @default(autoincrement())
  username     String   @unique
  passwordHash String
  createdAt    DateTime @default(now())
}

model Category {
  id    Int    @id @default(autoincrement())
  name  String @unique
  slug  String @unique
  blogs Blog[]
}

model Blog {
  id          Int       @id @default(autoincrement())
  title       String
  slug        String    @unique
  excerpt     String
  content     String
  coverImage  String?
  status      String    @default("draft")
  readingTime Int       @default(1)
  categoryId  Int?
  category    Category?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  publishedAt DateTime?
}
```

---

## Creating a New Admin User

Open Prisma Studio:
```bash
npm run db:studio
```

Or run a seed script update:
```ts
// In prisma/seed.ts, add another upsert:
await prisma.adminUser.upsert({
  where: { username: "newadmin" },
  update: {},
  create: {
    username: "newadmin",
    passwordHash: await bcrypt.hash("newpassword", 12),
  },
});
```

---

## Deployment

1. Set `NODE_ENV=production` and update `NEXT_PUBLIC_SITE_URL`
2. Set a strong `SESSION_SECRET` (32+ random chars)
3. The SQLite database (`prisma/dev.db`) persists on the server filesystem
4. For cloud deployments, consider switching to PostgreSQL by updating `schema.prisma`
5. `public/uploads/` should be backed up or replaced with cloud storage (S3, Cloudinary, etc.)

Build and run:
```bash
npm run build
npm run start
```
