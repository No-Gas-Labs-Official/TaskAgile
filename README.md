# TaskAgile

**Status:** Active codebase · Public  
**Stack:** TypeScript / React client · Node server · Drizzle · Tailwind

## What this is

TaskAgile is a task and campaign work surface with an RPG-styled interaction layer. The repository is a full client/server application, not a documentation-only shell.

Core layout:

| Path | Role |
|------|------|
| `client/` | Front-end application |
| `server/` | API / server logic |
| `shared/` | Shared types and utilities |
| `modules/` | Feature modules |
| `production/` · `staging/` | Environment-specific assets |
| `rpg.html` · `shrine.html` | Standalone interaction surfaces |
| `main.js` | Entry / orchestration script |

## Run (development)

```bash
npm install
# inspect package.json scripts for the current start command
npm run dev   # if defined
# or
node main.js
```

Confirm scripts in `package.json` before relying on names above — the audit recreation history left some entry points environment-specific (including Replit).

## What improved means here

This README previously only reported that the repo was successfully audited and recreated. That is provenance, not product.

Current priorities for real improvement:

1. **One documented happy path** — clone → install → run → see UI  
2. **Tests** for server routes and shared modules  
3. **Environment contract** — `.env.example` with required keys only  
4. **Issue hygiene** — close or re-scope the large open-issue backlog against a single milestone  
5. **Strip dead audit boilerplate** that does not help a new contributor run the app

## Related docs in-repo

- `AGENTS.md` — agent-oriented notes  
- `CONTRIBUTING.md` · `CODE_OF_CONDUCT.md`  
- `IP-METADATA.json` — ownership metadata  
- `LICENSE` / `LICENSE.md`

## Honest limitations

- Open issue count is high relative to contributor capacity.  
- Some paths reflect recreation-from-audit history; not every file is load-bearing.  
- Do not assume production deployment is configured until `production/` and server env are verified.

## Security

Report vulnerabilities privately if a security contact is listed in repo settings; otherwise open a minimal issue without exploit detail.

---

*Ship the path a stranger can run. Everything else is secondary.*
