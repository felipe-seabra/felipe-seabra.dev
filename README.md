# Felipe Seabra | Portfolio

Personal portfolio and content-managed career timeline for Felipe Seabra, a Front-End focused Full-Stack Developer based in Dublin, Ireland.

Production: https://felipeseabra.com.br

The project is a server-first Next.js application with a private CMS, Supabase authentication and PostgreSQL, Prisma database access, bilingual public routes, motion-driven UI, structured SEO metadata, automated quality gates, and protected GitHub workflows.

## Overview

The application has two primary surfaces:

- Public portfolio: career timeline, projects, about/contact content, bilingual routing, responsive UI, theme switching and motion.
- Private CMS: authenticated dashboard for managing projects, timeline entries, public copy and social/SEO-related content.

Public routes:

- / → English
- /pt → Portuguese

Private route:

- /dashboard → CMS

## Architecture

~~~text
Browser
  │
  ├── Public routes
  │     ├── /
  │     └── /pt
  │           │
  │           └── Server-rendered portfolio
  │
  └── /dashboard
        │
        ├── Supabase Auth
        │
        └── Server Actions
              │
              └── Prisma
                    │
                    └── PostgreSQL / Supabase
~~~

Detailed architecture: docs/ARCHITECTURE.md

## Technology Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 16 |
| UI | React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| Motion | Framer Motion + Lenis |
| Icons | Lucide React |
| Database | PostgreSQL via Supabase |
| ORM | Prisma |
| Authentication | Supabase Auth |
| API | Next.js Route Handler |
| Tests | Vitest + Testing Library |
| CI | GitHub Actions |
| Hosting | Vercel |
| Source control | GitHub |

## Repository Structure

~~~text
.
├── .github/workflows/ci.yml       # CI quality gates
├── prisma/
│   ├── schema.prisma              # Database models
│   ├── seed.ts                    # Seed data
│   └── migrations/                # Prisma migrations
├── public/                        # Static assets and machine-readable metadata
├── src/
│   ├── app/
│   │   ├── api/content/           # Public CMS API
│   │   ├── dashboard/             # Private CMS
│   │   ├── pt/                    # Portuguese route
│   │   ├── layout.tsx             # Global metadata/layout
│   │   ├── robots.ts              # Robots policy
│   │   └── sitemap.ts             # Sitemap
│   ├── components/portfolio/      # Public UI and interaction components
│   └── lib/                       # i18n, Prisma and Supabase infrastructure
├── supabase/                      # Supabase SQL schema/reference
├── tests/                         # Automated tests
├── proxy.ts                       # Request/session/locale handling
└── package.json
~~~

## Local Development

### Requirements

- Node.js 24
- npm
- A PostgreSQL/Supabase database for CMS features

### Install

~~~bash
npm install
~~~

### Environment

~~~bash
cp .env.example .env.local
~~~

Configure the required Supabase and database variables described in .env.example.

The Prisma datasource uses DATABASE_URL for application/runtime connections and DIRECT_URL for direct database access and migrations.

### Run

~~~bash
npm run dev
~~~

Open http://localhost:3000.

## Quality Gates

~~~bash
npm run lint
npm run typecheck
npm run test
npm run build
npm audit --audit-level=high
~~~

CI enforces Lint, Typecheck, Tests and Security Audit, followed by Build.

## CMS

The dashboard at /dashboard provides authenticated content management for:

- Projects
- Career timeline entries
- Public site copy
- Social links
- English and Portuguese content

Authorization is enforced on the server. A valid Supabase user must also exist in the admins table before dashboard mutations are permitted.

Database Row Level Security is enabled for the CMS tables.

See docs/CMS.md and docs/SECURITY.md.

## Internationalization

Supported locales:

- English: /
- Portuguese: /pt

CMS content is locale-aware where appropriate.

## Motion and Interaction

The public UI uses layered motion:

- Lenis smooth scrolling
- Framer Motion entrance/reveal transitions
- Scroll-linked hero parallax
- Scroll progress indicator
- Floating/reactive avatar
- Pulsing timeline markers
- Project hover interactions
- Back-to-top interaction
- Reduced-motion support

## SEO

The application includes:

- Metadata API titles and descriptions
- Canonical URLs
- Open Graph metadata and locale-specific OG images
- Twitter cards
- Favicon and web manifest
- Dynamic sitemap
- Dynamic robots policy
- JSON-LD structured data
- llms.txt
- noindex,nofollow for the dashboard

The canonical production domain is https://felipeseabra.com.br.

## Testing

The suite covers public content API behavior, CMS authorization logic, admin/non-admin access, controlled error handling, locale validation and public page rendering.

Application tests mock infrastructure boundaries such as Prisma and Supabase. Database-level RLS behavior should therefore be tested separately.

## Security Model

Security is based on defense in depth:

1. Supabase Auth establishes identity.
2. The server verifies the authenticated user.
3. The admins table determines CMS authorization.
4. Server Actions perform privileged mutations only after authorization.
5. PostgreSQL RLS provides database-level authorization.
6. Public API queries only published portfolio records where applicable.
7. Dashboard metadata prevents indexing.
8. CI performs dependency auditing.

See docs/SECURITY.md.

## Git and Delivery Workflow

The main branch is protected.

~~~text
feature branch
    ↓
focused implementation
    ↓
single logical commit where practical
    ↓
Pull Request
    ↓
CI quality gates
    ↓
manual review
    ↓
manual merge to main
~~~

Required checks:

- Lint
- Typecheck
- Tests
- Security Audit
- Build

Auto-merge is disabled. Direct changes to main are not part of the workflow.

## Deployment

Production is designed for Vercel with Supabase PostgreSQL/Auth.

Before deployment:

1. Configure production environment variables.
2. Apply Prisma migrations.
3. Verify Supabase Auth configuration.
4. Verify the production admin account.
5. Run the full quality gate.
6. Deploy the protected main branch.
7. Verify public routes, CMS, sitemap and robots endpoints.

See docs/DEPLOYMENT.md.

## Documentation Map

| Document | Purpose |
| --- | --- |
| docs/ARCHITECTURE.md | Application architecture and data flows |
| docs/CMS.md | CMS behavior and data model |
| docs/DEVELOPMENT.md | Local development and engineering workflow |
| docs/DEPLOYMENT.md | Production deployment and verification |
| docs/SECURITY.md | Security model, audit findings and hardening |

## License

This repository contains a personal portfolio. The source code of this project is licensed under the MIT License.

Portfolio content, personal information, images, branding, and other personal assets are not included in the MIT License and may not be reused without permission.
