# Artifact notes (example layout)

This file shows a project-chosen index format. Agents may use tables, lists, or other shapes. It is registered as an artifact in [`../memory/state.json`](../memory/state.json).

| Path | Kind | Notes |
| :--- | :--- | :--- |
| `content/` | source | Author markdown |
| `site.config.json` | source | Site title, nav, footer; rendered into every page |
| `build/` | output | Generated HTML; safe to delete and rebuild. **Never edit by hand** — see [`../memory/facts/f001-build-output-overwritten-on-rebuild.md`](../memory/facts/f001-build-output-overwritten-on-rebuild.md) |
| `build.js` | tool | Entry script: `content/*.md` + `site.config.json` → `build/*.html` |
| `specs/001-static-site/` | spec | Requirements and constraints; direction lives here, not in memory |

Memory should link here or list paths; it should not paste full HTML bodies.

To regenerate the pages: `node build.js`.
