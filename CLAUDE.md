# clock.email

Civic accountability tool — public timers on government response time.

## Stack
- Next.js (TypeScript), App Router, Tailwind CSS
- PostgreSQL + Prisma ORM
- Postal (self-hosted) for inbound + outbound email
- Hetzner VPS + Co-op Cloud / Coolify for deployment

## Key conventions
- Domain: clock.email (not emailclock.org)
- CC address format: start+[slug]-[5-char-code]@clock.email
- Email bodies are NEVER stored (privacy by design)
- Sender emails are private, never displayed publicly
- Clocks count UP, never down

## Project structure
- `src/app/` — Next.js App Router pages and API routes
- `src/lib/` — shared utilities (db client, email parsing, tokens)
- `src/components/` — React components
- `prisma/` — schema and seed data

## Commands
- `npm run dev` — local dev server
- `npm run db:generate` — regenerate Prisma client
- `npm run db:migrate` — run database migrations
- `npm run db:seed` — seed Boston officials directory
