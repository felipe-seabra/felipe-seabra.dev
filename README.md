# Felipe Seabra

> Front-End focused Full-Stack Developer building modern, performant, and polished web experiences.

[![CI](https://github.com/felipe-seabra/felipe-seabra.dev/actions/workflows/ci.yml/badge.svg)](https://github.com/felipe-seabra/felipe-seabra.dev/actions/workflows/ci.yml)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-24-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)

## Overview

This repository contains my personal developer portfolio.

It is a professional showcase of my work, technical experience, design background, and approach to building production-ready web interfaces.

The visual direction is inspired by contemporary editorial and interaction-driven web design, with a strong focus on typography, motion, composition, performance, accessibility, and responsive behavior.

## Focus

- Front-End development with React and Next.js
- Strictly typed TypeScript development
- Modern responsive interfaces
- Motion design and micro-interactions
- Performance and accessibility
- SEO and semantic HTML
- Clean, maintainable project structure
- Production-oriented engineering workflow

## Tech Stack

| Area | Technology |
| :--- | :--- |
| Framework | Next.js 15, App Router |
| UI | React 19 |
| Language | TypeScript, strict mode |
| Styling | Tailwind CSS 4 |
| Animation | Framer Motion, GSAP |
| Smooth Scrolling | Lenis |
| Icons | Lucide React |
| Forms | Zod, React Hook Form |
| Quality | ESLint, Prettier, Vitest, Testing Library |
| CI | GitHub Actions |
| Runtime | Node.js 24 |
| Deployment | Vercel |

## Engineering Standards

The repository follows the same production-oriented principles used in my application projects:

- Strict TypeScript with unused code checks enabled.
- ESLint and Prettier for consistent code quality.
- Automated type checking before integration.
- Automated tests for reusable and critical behavior.
- Dependency security auditing with `npm audit`.
- Production builds verified in CI.
- Pull requests for changes targeting `main`.
- Conventional commit style for a readable history.
- Secrets and environment-specific configuration kept outside version control.

## Project Structure

```text
.
├── .github/
│   └── workflows/
│       └── ci.yml
├── public/
├── src/
│   ├── app/
│   ├── components/
│   ├── hooks/
│   └── lib/
├── tests/
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── package-lock.json
├── postcss.config.mjs
├── tsconfig.json
└── README.md
```

The structure can evolve as the portfolio grows. New abstractions should be introduced only when they improve clarity, reuse, or maintainability.

## Local Development

### Requirements

- Node.js 24.x
- npm

### Installation

```bash
git clone https://github.com/felipe-seabra/felipe-seabra.dev.git
cd felipe-seabra.dev
npm ci
```

### Development

```bash
npm run dev
```

The application runs at `http://localhost:3000`.

### Quality checks

Run the same checks used by CI locally:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
npm audit --audit-level=high
```

## Git Workflow

The `main` branch is production-ready.

Use short-lived branches for changes:

```text
feat/<name>
fix/<name>
refactor/<name>
chore/<name>
docs/<name>
```

Pull requests should:

1. Explain the purpose of the change.
2. Keep the scope focused.
3. Pass all required CI checks.
4. Avoid unrelated changes.
5. Be merged only after validation.

## CI Pipeline

Every pull request targeting `main` runs:

- Lint
- TypeScript type checking
- Tests
- Dependency security audit
- Production build

GitHub Actions also cancels obsolete in-progress runs for the same branch or pull request.

## Main Branch Protection

The `main` branch is intended to be protected with GitHub branch rules.

Required checks:

- `Lint`
- `Typecheck`
- `Tests`
- `Security Audit`
- `Build`

The repository should require pull requests, passing status checks, up-to-date branches, and block force pushes and branch deletion.

## Security

Never commit:

- API keys
- Authentication tokens
- Private certificates
- Production credentials
- `.env.local` or other secret environment files

Use environment variables for local and deployment-specific secrets.

If a security issue is discovered, report it privately rather than publishing sensitive details in a public issue.

## License

This repository contains my personal portfolio and project source code. Unless otherwise stated, portfolio content, branding, images, and personal materials are not licensed for reuse.

Third-party libraries remain under their respective licenses.

## Author

**Felipe Seabra**

Dublin, Ireland

[GitHub](https://github.com/felipe-seabra)
