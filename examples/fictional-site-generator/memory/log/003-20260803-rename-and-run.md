# 003 — renaming a page, and the two records it produced

Session: 2026-08-03

## Goal

Rename the `about` page to `about-us` and make every link that points at it follow.

## Path taken

1. The rename was done first by editing the generated page at `build/about.html` directly, because that was the file in front of us. The page looked right.
2. `node build.js` was run afterwards for an unrelated reason, and the edit was gone — the file had been regenerated from `content/about.md`.
3. The rename was redone properly: `content/about.md` → `content/about-us.md`, and the values that referenced it were updated in `site.config.json`, then rebuilt. Links resolved.

## Why the detour was worth recording

The hand-edit *appeared* to succeed. There was no error and no visible failure — the loss only surfaced a build later. That is a failure mode a later session cannot anticipate from the code alone, so it became a verified fact rather than a note.

## Rejected during this session

| Option | Outcome |
| :--- | :--- |
| Fix the rendered value by editing `build/` | Attempted, silently reverted by the next build → [`f001`](../facts/f001-build-output-overwritten-on-rebuild.md) (`coldStart`) |
| Fix the rendered value through `site.config.json` | Attempted, survived the rebuild → [`f002`](../facts/f002-config-is-the-source-of-truth.md) |
| Load page fragments in the browser instead of generating pages | Prototyped, worked over a local server, failed under the project's `file://` requirement → [`e001`](../deadends/e001-client-side-page-loading.md) |

Note the asymmetry: the first two were **verified** and went to the fact library; the third was **attempted and failed** and went to the dead-end library. A fourth idea — using a client-side router — was rejected on preference alone and stayed in the log only (log 001), because it was never tried.

## Result

`content/about-us.md` + rebuilt `build/`. No hand-edits under `build/`.

## Next session picks up at

Verify that the config change propagated to every page, then start on breadcrumb navigation.
