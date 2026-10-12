# Example: fictional-site-generator

A fully fictitious project used to show the memory conventions in action. No real paths, no real data.

```text
examples/fictional-site-generator/
├── build.js                     # the generator; the only writer of build/
├── site.config.json             # rendered values (title, nav, footer)
├── content/
│   ├── index.md
│   └── about-us.md              # renamed in session 2026-08-03
├── build/
│   ├── artifact-notes.md        # the project's artifact registry
│   ├── index.html               # generated; run `node build.js`
│   └── about-us.html            # generated
├── specs/001-static-site/
│   └── constitution.md          # constraints; owns the generated-output rule
└── memory/
    ├── state.json               # schema 2, with memoryStores
    ├── log/                     # NNN-YYYYMMDD-slug.md
    ├── facts/                   # INDEX.json + {id}-{slug}.md
    └── deadends/                # INDEX.json + {id}-{slug}.md
```

Regenerate the pages with `node build.js` from this directory. `build/*.html` is gitignored — it is output.

## What this example demonstrates

| Scenario | Where to look |
| :--- | :--- |
| A claim that was verified and promoted to `coldStart` | [`facts/f001`](memory/facts/f001-build-output-overwritten-on-rebuild.md), [`facts/INDEX.json`](memory/facts/INDEX.json) |
| **A `coldStart` fact demoted once the spec took ownership of the constraint** | [`facts/f001`](memory/facts/f001-build-output-overwritten-on-rebuild.md) §Status note |
| A dead end recorded with a failure category and a revisit condition | [`deadends/e001`](memory/deadends/e001-client-side-page-loading.md) |
| **A dead end reopened because `reopenIf` was met** | same file, §Reopened |
| A rejection that is *not* a dead end, because it was never tried | [`log/001`](memory/log/001-20260801-routing-decision.md) |
| A log entry that carries the reasoning, not just the outcome | [`log/003`](memory/log/003-20260803-rename-and-run.md) |
| An artifact registry (the project's own format) | [`build/artifact-notes.md`](build/artifact-notes.md) |

## The two closed loops

**Demotion.** `f001` was verified by losing a hand-edit to a rebuild, and it earned `coldStart: true`. Later the project's constitution stated the same constraint. At the next checkpoint the flag was removed: the fact is still true, but it no longer needs a cold-start slot, because the constitution is read at cold start anyway. Keeping the flag would have been a duplicate of an authority that already exists.

**Reopening.** `e001` was closed as `constraint-violation` — the browser-fragment approach broke the `file://` requirement. Its `reopenIf` named the condition that would make it viable again. When the spec narrowed that requirement and allowed a build-time inliner, the condition was met, the entry was marked `reopened`, and the reason was appended. Without `reopenIf`, the library would have blocked that route forever.
