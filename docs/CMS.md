# Content Management System

## Overview

The CMS is a private dashboard at /dashboard.

It uses Supabase Auth for identity, Prisma for server-side data access, PostgreSQL/Supabase for persistence, Row Level Security for database protection and Server Actions for mutations.

## Authorization Flow

~~~text
Dashboard
   │
   ▼
Supabase Auth
   │
   ├── no user ──────► Unauthorized
   │
   ▼
Authenticated user ID
   │
   ▼
Prisma Admin lookup
   │
   ├── no admin ─────► Access denied
   │
   ▼
Authorized admin
   │
   ▼
Server Action
   │
   ▼
PostgreSQL + RLS
~~~

The authorization check is implemented server-side in src/app/dashboard/actions.ts.

## Managed Content

### Projects

Fields include title, slug, category, description, stack, website URL, GitHub URL, image URL, featured state, published state and display order.

Only published projects are exposed publicly.

### Timeline

Fields include locale, chapter, period, title, body, tags, published state and display order.

The dashboard provides EN/PT editing.

Only published timeline entries are exposed publicly.

### Site Content

Localized section/field/value records allow public copy to change without modifying page components.

Social links are also managed through the dashboard.

## Locales

Supported locales are en and pt.

Public routes:

- / → English
- /pt → Portuguese

Locale validation occurs in server actions before persistence.

## Publication Model

~~~text
Draft
  │
  │ publish
  ▼
Published
  │
  ▼
Public portfolio
~~~

Unpublished projects and timeline entries are not returned by the public content API.

## Database Authorization

RLS is enabled on admins, projects, timeline_entries and site_content.

The admins table is not directly exposed to anonymous or authenticated client roles.

Administrative policies use public.is_admin().

The function uses SECURITY DEFINER and an empty search_path, and execution is restricted to the authenticated role.

## Data Lifecycle

~~~text
Dashboard form
   │
   ▼
Server Action
   │
   ├── validate locale/input shape
   ├── verify authenticated user
   ├── verify admin record
   │
   ▼
Prisma mutation
   │
   ▼
PostgreSQL
   │
   ▼
Public server render / API
~~~

## Error Handling

Server actions return controlled errors rather than raw database exceptions.

The public API returns a generic error when persistence access fails.

## Adding CMS Fields

1. Update the data model if required.
2. Add a Prisma migration.
3. Update seed data when required.
4. Update server action types and validation.
5. Add the dashboard control.
6. Add public rendering.
7. Add or update tests.
8. Run the full quality gate.
9. Document the change in the PR.

## Adding Locales

Update locale definitions, routing, content fallback, CMS validation, metadata, sitemap, public loading, dashboard controls and tests.

The current application supports English and Portuguese only.
