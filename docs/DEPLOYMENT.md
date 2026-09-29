# Deployment

## Production

Canonical production site:

https://felipeseabra.com.br

The application is designed for Vercel with Supabase authentication and PostgreSQL.

## Required Configuration

~~~text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
DATABASE_URL
DIRECT_URL
~~~

Never expose database connection strings or server-only credentials to the browser.

## Database Migration

Schema changes are deployed through committed Prisma migrations.

Before a release containing a migration:

1. Review the migration.
2. Confirm deployment ordering is safe.
3. Run npx prisma migrate deploy.
4. Verify tables, constraints and policies.
5. Deploy the application.

## Build

~~~bash
npm run build
~~~

The build script runs prisma generate before next build.

## CI Before Production

Required checks:

- Lint
- Typecheck
- Tests
- Security Audit
- Build

Build depends on the application quality checks.

## Post-Deployment Verification

### Public

Verify /, /pt, project links, navigation, theme switching, responsive layout, motion and reduced-motion behavior.

### SEO

Verify page title, canonical URL, Open Graph metadata, /sitemap.xml, /robots.txt, favicon and structured data.

### CMS

Verify /dashboard, valid admin login, non-admin rejection, project CRUD, timeline CRUD, content editing, EN/PT switching and sign out.

### Database

Verify migration status, admin record, RLS policies and published/draft behavior.

## Rollback

Application rollback and database rollback are separate concerns.

Before destructive database changes, establish a safe migration strategy.

Do not manually modify production schema outside migration history without documenting and reconciling the change.

For application-only failures, revert to a known-good application commit or PR when appropriate.

For database failures, diagnose migration state before attempting another migration.

## Operational Notes

The public content API uses public cache headers with short cache lifetime and stale-while-revalidate behavior.

When CMS changes appear delayed, consider cache behavior before treating the deployment as broken.

The dashboard is not intended to be indexed.
