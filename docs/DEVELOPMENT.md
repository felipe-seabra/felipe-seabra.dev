# Development Guide

## Prerequisites

- Node.js 24
- npm
- Git
- GitHub access
- Supabase project for CMS/database development

## Installation

~~~bash
npm install
cp .env.example .env.local
~~~

Typical environment variables:

~~~text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
DATABASE_URL=
DIRECT_URL=
~~~

Never commit .env.local or production secrets.

## Commands

~~~bash
npm run dev
npm run lint
npm run typecheck
npm run test
npm run build
npm run format
npm run format:check
npm audit --audit-level=high
~~~

## Database Workflow

Prisma is the application database access layer.

~~~bash
npx prisma validate
npx prisma generate
npx prisma migrate deploy
~~~

The production build runs prisma generate before next build.

Database changes should be represented by migrations and tested before deployment.

## Testing Strategy

Vitest and Testing Library cover:

- public API behavior
- CMS authorization logic
- admin/non-admin access
- controlled error handling
- locale validation
- public page rendering

Infrastructure boundaries are mocked in application tests. Mocked tests validate application logic but do not prove PostgreSQL RLS behavior in a real database.

Authorization or policy changes should include an integration-test strategy.

## Engineering Conventions

### TypeScript

Use strict TypeScript. Avoid any. Prefer explicit domain types at application boundaries.

### Next.js

Prefer App Router and server components by default. Use client components only where browser state, events, animation or other client-only behavior is required.

Keep database access on the server.

### Data Access

Use Prisma for application database access.

Database authorization must remain enforced by PostgreSQL RLS, not only by UI restrictions.

### Errors

Do not return raw database exceptions to users. Log diagnostic details server-side where appropriate and return controlled messages to clients.

## Git Workflow

Never work directly on main.

~~~bash
git switch -c feat/short-description
~~~

Keep changes scoped to one logical concern. Prefer one coherent commit for a feature or fix rather than a sequence of trivial commits.

Use conventional commit messages:

~~~text
feat: add project filtering
fix: restore localized metadata
refactor: simplify content loading
docs: document CMS architecture
test: cover admin authorization
chore: update dependencies
~~~

Open a pull request against main.

Required checks:

- Lint
- Typecheck
- Tests
- Security Audit
- Build

Auto-merge is disabled.

## Pull Request Expectations

A PR should explain what changed, why it changed, implementation details, security implications, validation results, deployment or migration requirements, and known follow-up work.

## Review Checklist

### Code

- TypeScript passes.
- Lint passes.
- Tests pass.
- Build passes.
- No unnecessary dependencies.
- No secrets or local environment files.
- Server/client boundaries are intentional.

### Security

- Authorization is server-side.
- RLS is preserved.
- Public API exposes only intended fields.
- Error responses do not leak internal details.
- New content inputs are reviewed for injection risks.

### Database

- Migration included when schema changes.
- Seed behavior considered.
- RLS and policies reviewed.
- Production migration order is safe.

### SEO

For public content changes, verify metadata, canonical URL, Open Graph behavior, sitemap implications and structured data when applicable.

## Definition of Done

A change is ready for merge when implementation is complete, relevant tests exist, required CI checks pass, documentation is updated when architecture or behavior changes, migrations are committed when required, and the PR description is complete.
