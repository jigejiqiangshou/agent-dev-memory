# 001 — flat file routing

Session: 2026-08-01

## Decision

Use one HTML file per markdown page under `build/`, mirroring `content/` paths. No client-side router.

## Rejected

- SPA with hash routes: unnecessary for a docs-only site. This was a **preference**, not a constraint — so it was recorded here and deliberately **not** written to the dead-end library. Only routes that were actually tried and failed belong there.

## Reasoning

Flat files keep `build/` inspectable without a server and make every page addressable by its real path. A router would add a runtime dependency for navigation that plain links already provide.

## Artifacts

- Will emit: `build/**/*.html`
- Notes: `build/artifact-notes.md`

## Next session picks up at

Create the single build entry that turns `content/index.md` into `build/index.html`.
