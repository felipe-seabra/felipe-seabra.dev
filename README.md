# Felipe Seabra

Personal portfolio for a Front-End focused Full-Stack Developer based in Dublin, Ireland.

The portfolio presents the career as a visual timeline, with English as the default language and Portuguese as an available interface language. It also supports dark and light themes.

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

Next.js 16, React 19, TypeScript, Tailwind CSS, Framer Motion, Lenis, Lucide, Vitest and Testing Library.

The visual system is implemented in code. Motion uses Framer Motion, while the portrait/avatar is composed with CSS shapes rather than a static image.

## Languages and themes

- English is the default.
- Portuguese can be toggled from the header.
- Dark and light themes can be toggled from the header.
- Preferences are persisted in local storage.

## Git workflow

Work should be developed in a feature branch and submitted through a pull request. The protected `main` branch requires the CI quality gates before merging.
