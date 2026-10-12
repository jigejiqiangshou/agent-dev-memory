# f002 — site.config.json is the source of truth for rendered values

Session: 2026-08-03
Status: verified

## Claim

`site.config.json` is read by `build.js` and its values are rendered into every page. A value changed there survives every rebuild.

## How it was verified

The site title was changed in `site.config.json` and `node build.js` was run. The new title appeared in every generated page, including pages that were not touched.

## Consequence for future sessions

When a rendered value is wrong, the fix goes into `site.config.json` (or the content/layout templates), never into `build/`. This is the constructive counterpart of f001: f001 says the output cannot be edited, f002 says where the edit actually belongs.
