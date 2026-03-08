# Restart Prompt for Claude Code

Paste this to get back up to speed:

---

I'm working on clock.email (email-clock project). Read these files to catch up:
- `HANDOFF.md` — architecture, server access, what's built
- `/home/francesco/projects/ClockEmail_Spec_v2.md` — full feature spec and roadmap
- `RESTART.md` — this file, check for current status below

Then check `git status` and `git diff` to see uncommitted work, and check the memory directory at `~/.claude/projects/-home-francesco-projects-email-clock/memory/` for notes from previous sessions.

## Current Status

- Phase 1 in progress
- Homepage link fix (#7) and nav favicon (#8) done but uncommitted
- Demo data TRUNCATE added but uncommitted
- **Mailgun wired up** for inbound+outbound email:
  - Inbound: route handler accepts Mailgun's multipart/form-data + signature verification
  - Outbound: uses Mailgun SMTP via existing Nodemailer setup
  - Parser (`src/lib/parse-inbound.ts`) supports both Mailgun and Postal formats
  - Verification: `src/lib/verify-mailgun.ts` checks HMAC-SHA256 signatures
- Hetzner won't open SMTP ports until 1-month customer mark — Mailgun is the bridge
- **Mailgun setup still needed:** DNS records, route configuration in Mailgun dashboard
- Local dev crashes WSL2 — may need to disable `output: "standalone"` in next.config.ts for dev mode
- Phases 2-6 from spec not started yet

## Mailgun Environment Variables (add to .env / docker-compose)

```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=postmaster@clock.email
SMTP_PASS=<mailgun-smtp-password>
EMAIL_FROM="clock.email <noreply@clock.email>"
EMAIL_DISABLED=false
MAILGUN_WEBHOOK_SIGNING_KEY=<from-mailgun-dashboard>
```

## Known Issues

- `next dev` can freeze WSL2 — don't run it with standalone output enabled
- The `.next` cache (435MB) can cause issues — safe to delete and rebuild
