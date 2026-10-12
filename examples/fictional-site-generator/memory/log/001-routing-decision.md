# 001 — flat file routing

Session: 2026-08-01

## Decision

Use one HTML file per markdown page under `build/`, mirroring `content/` paths. No client-side router.

## Rejected

- SPA with hash routes: unnecessary for a docs-only site.

## Artifacts

- Will emit: `build/**/*.html`
- Notes: `build/artifact-notes.md`
