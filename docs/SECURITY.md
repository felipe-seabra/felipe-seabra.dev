# Security

## Security Objectives

The project protects three boundaries:

1. Public content consumption.
2. Authenticated CMS access.
3. Database-level authorization.

The UI is not treated as a security boundary.

## Authentication

Supabase Auth manages user identity.

The dashboard uses authenticated password-based sign-in.

Client-side email or UI state is not treated as proof of authorization.

## Authorization

CMS authorization is enforced server-side.

The server:

1. retrieves the authenticated Supabase user
2. rejects unauthenticated requests
3. looks up the user's UUID in admins
4. rejects authenticated users who are not administrators
5. performs mutations only after authorization succeeds

## Database Security

PostgreSQL Row Level Security is enabled for:

- admins
- projects
- timeline_entries
- site_content

The admins table is not directly readable by anonymous or authenticated client roles.

Administrative policies use public.is_admin().

The function uses SECURITY DEFINER, an empty search_path and the authenticated Supabase UUID. Execution is restricted to the authenticated role.

## Public API Exposure

/api/content exposes only public portfolio data.

Projects and timeline entries are filtered by published state.

The API does not return admin records, authentication tokens, passwords, internal database errors or private authorization state.

## Error Handling

Database and server errors are not returned verbatim to public clients.

Public API failures return a controlled generic error.

Server actions return controlled messages while diagnostic errors are logged server-side where appropriate.

## Injection Surface

Prisma parameterizes database operations, reducing SQL injection risk.

The audited application surface does not use dangerouslySetInnerHTML.

CMS URL fields remain an input-hardening consideration. URL protocol validation should reject dangerous schemes such as javascript:, data: and vbscript:.

## Automated Security Controls

GitHub Actions runs:

~~~bash
npm audit --audit-level=high
~~~

Security Audit is required for protected main.

## Security Testing

Current tests cover:

- unauthenticated dashboard access
- authenticated non-admin rejection
- non-admin mutation rejection
- admin access
- controlled database errors
- locale validation

These tests mock Prisma and Supabase boundaries. They do not constitute a full PostgreSQL RLS integration suite.

## Current Audit Status

The reviewed architecture showed no evident critical or high application-level vulnerability in the audited code.

Strong existing controls include server-side authorization, database RLS, restricted admin table access, parameterized Prisma queries, controlled errors, public-only content API, protected main and CI security auditing.

## Hardening Backlog

### Medium: CMS URL validation

Validate href, github_url and image_url before persistence. Allow only expected URL protocols and formats.

### Medium: Authentication rate limiting

Add an application-level rate-limiting or bot-protection layer around login if the threat model requires it. Supabase Auth remains the identity provider.

### Medium: RLS integration tests

Add tests against a real PostgreSQL/Supabase environment covering:

| Actor | Operation | Expected |
| --- | --- | --- |
| Anonymous | Read published project | Allow |
| Anonymous | Read draft project | Deny |
| Anonymous | Insert/update/delete | Deny |
| Authenticated non-admin | Read published | Allow |
| Authenticated non-admin | Read draft | Deny |
| Authenticated non-admin | Mutate | Deny |
| Admin | Read/mutate | Allow |

### Medium: Schema source-of-truth cleanup

The repository contains Prisma migrations and Supabase SQL schema/migration files.

Define one authoritative production migration workflow, then keep secondary SQL representations synchronized or explicitly reference-only.

## Security Review Principles

When changing CMS or authentication code:

- validate authorization before mutation
- preserve RLS
- never trust client-side authorization state
- do not expose raw database errors
- avoid server secrets in client bundles
- review new content fields as browser inputs
- add regression tests for authorization changes
