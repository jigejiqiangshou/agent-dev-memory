# 001 — static site

Project constraints for this fictional example. This file is **not** memory: it is the authoritative statement of what the project requires, and where a fact contradicts it, the fact is wrong.

## Constraints

- No build-step dependencies beyond Node itself. A published copy must work without a network connection, and a plain `file://` open must not break.
- `content/` is the only authoring surface; `site.config.json` declares rendered values.
- `build/` is generated output and **must not be edited by hand**. Rebuilding deletes any hand-edit. (This constraint now owns what used to be a `coldStart` fact — see [`../../memory/facts/f001-build-output-overwritten-on-rebuild.md`](../../memory/facts/f001-build-output-overwritten-on-rebuild.md).)
- Pages are addressed as flat files mirroring `content/` paths.

## Direction

Breadcrumb navigation generated from the content directory structure is the next feature. Its requirements live here and in `plan.md` / `tasks.md`; memory records only what has already happened.
