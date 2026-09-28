# Felipe Seabra

Personal portfolio for a Front-End focused Full-Stack Developer based in Dublin, Ireland.

The site presents the career as a visual timeline with English as the default language, Portuguese as an available interface language, dark/light themes and code-driven motion.

## Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Quality

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## Stack

Next.js 16, React 19, TypeScript, Tailwind CSS 4, Framer Motion, Lenis, Lucide, Supabase, Vitest and Testing Library.

## Motion system

The public site uses layered motion rather than static transitions:

- Lenis provides smooth scrolling.
- Framer Motion handles entrance/reveal animations.
- Scroll-linked parallax is driven by `useScroll` and `useTransform`.
- A scroll progress indicator tracks the page.
- Timeline markers pulse continuously.
- Project rows respond to hover.
- The avatar floats subtly and reacts to hover.
- `prefers-reduced-motion` is respected.

The implementation follows the same general visual direction as the supplied reference: cinematic sections, scroll-driven movement, layered depth and deliberate micro-interactions.

## SEO

The application includes:

- Metadata API title and description.
- Canonical URL.
- Open Graph and Twitter metadata.
- Favicon and web manifest.
- Dynamic `/sitemap.xml`.
- Dynamic `/robots.txt` with dashboard excluded.
- JSON-LD Person structured data.
- `llms.txt` for machine-readable site context.
- Dashboard route marked `noindex,nofollow`.

## Content dashboard

The private dashboard is available at:

`/dashboard`

It is designed around Supabase Auth + Postgres + Row Level Security.

### Local setup

Copy the example environment file:

```bash
cp .env.example .env.local
```

Add:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

Then run the SQL in `supabase/schema.sql`.

The schema includes:

- `admins`
- `projects`
- `timeline_entries`
- `site_content`

Published portfolio data is readable publicly. Mutations are restricted to users present in the `admins` table.

The dashboard currently provides authentication, project CRUD and hero content editing. Timeline editing is intentionally the next CMS increment.

## Languages and themes

- English is the default.
- Portuguese can be toggled from the header.
- Dark and light themes can be toggled from the header.
- Preferences are persisted in local storage.

## Git workflow

Work should be developed in a feature branch and submitted through a pull request. The protected `main` branch requires the CI quality gates before merging.
