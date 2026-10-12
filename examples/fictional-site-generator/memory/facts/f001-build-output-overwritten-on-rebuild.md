# f001 — build/ is generated, hand-edits are overwritten

Session: 2026-08-03
Status: verified (now also stated by the spec — see the note at the end)

## Claim

Anything hand-edited under `build/` survives only until the next build. `build/` is output, never input.

## How it was verified

The site title looked wrong on the published page. It was edited directly in `build/index.html`, the page was reloaded, and the new title showed — the fix appeared to work. Then `node build.js` was run for an unrelated reason and the edit was gone.

## Why it matters

Hand-editing output produces a change that looks correct and then disappears silently. The failure is invisible at the moment it is made, which is exactly what makes it expensive: a session can end believing the work is done.

## Scope

Any hand-edit of anything under `build/`. Does not apply to `content/`, `site.config.json`, or the layout templates.

## Status note — 2026-08-04

`specs/001-static-site/constitution.md` now states that `build/` is generated output and must not be edited. The constraint has an owner in the spec, so the `coldStart` flag was removed from `INDEX.json` at the next checkpoint: the fact is still true and still worth querying, but it no longer needs to be read at cold start, because the constitution is read there anyway. See workflow §Memory vs spec, rule 3.
