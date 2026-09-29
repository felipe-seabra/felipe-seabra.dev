# Architecture

## Purpose

The portfolio is a server-first Next.js application with a private content-management surface.

~~~text
Browser
  ├── / and /pt
  │     └── Server-rendered portfolio
  │
  └── /dashboard
        ├── Supabase Auth
        └── Server Actions
              └── Prisma
                    └── PostgreSQL / Supabase
~~~

## Public Routes

src/app/page.tsx and src/app/pt/page.tsx establish the localized public entry points.

The route layer resolves locale, loads CMS data, builds metadata and passes server-fetched data to presentation components under src/components/portfolio.

## Public Content API

src/app/api/content/route.ts exposes published portfolio content.

It accepts locale, defaults to English, returns public site content, published timeline entries and published projects, and does not expose admin or authentication data.

Responses use public cache headers and database failures return a generic error.

## Dashboard

src/app/dashboard/page.tsx is the client-side CMS interface.

src/app/dashboard/actions.ts is the server-side mutation boundary.

Authentication comes from Supabase Auth. Authorization is separate and requires the authenticated user to exist in the admins table.

## Authentication and Session Handling

Supabase SSR integration is implemented in:

- src/lib/supabase/client.ts
- src/lib/supabase/server.ts
- src/lib/supabase/proxy.ts
- proxy.ts

The request proxy synchronizes authentication state and exposes the current portfolio locale through request headers.

## Data Access

Prisma is the server-side data access layer.

Current models:

- Admin
- Project
- TimelineEntry
- SiteContent

Database access remains server-side.

## Rendering Strategy

Server-side responsibilities include database reads, metadata generation and structured SEO data.

Client components are used for browser state and interaction such as theme switching, language controls, smooth scrolling, motion, interactive cursor and dashboard forms.

## Motion

- Lenis provides smooth scrolling.
- Framer Motion provides entrance, reveal and interaction animation.
- Scroll-linked transforms drive hero parallax and scroll progress.
- The motion layer respects prefers-reduced-motion.

## SEO

The application provides canonical URLs, localized metadata, Open Graph images, Twitter cards, sitemap, robots, JSON-LD, manifest, favicon and llms.txt.

The dashboard uses noindex,nofollow.

## Key Files

| Path | Responsibility |
| --- | --- |
| src/app/page.tsx | English public route |
| src/app/pt/page.tsx | Portuguese public route |
| src/app/layout.tsx | Global metadata and document shell |
| src/app/api/content/route.ts | Public content API |
| src/app/dashboard/page.tsx | CMS UI |
| src/app/dashboard/actions.ts | Authorized CMS mutations |
| src/lib/prisma.ts | Prisma client |
| src/lib/i18n.ts | Locale/content helpers |
| src/lib/supabase/* | Supabase infrastructure |
| proxy.ts | Request/session/locale proxy |
| src/components/portfolio/* | Public presentation |
| prisma/schema.prisma | Database models |
| prisma/migrations/* | Database migrations |
| tests/* | Automated tests |
| .github/workflows/ci.yml | CI |

## Architectural Constraints

- no direct Prisma usage from client components
- no CMS mutation without server-side authorization
- no direct database mutation from public routes
- no public exposure of admin records
- no authentication decision based only on client state
- no bypass of protected main
- no requirement for motion to understand core content

## Current Consideration

The repository contains both Prisma migration history and Supabase SQL schema/migration files. Production migrations are represented by Prisma. The secondary SQL files should remain synchronized or be explicitly documented as reference material to avoid schema drift.
