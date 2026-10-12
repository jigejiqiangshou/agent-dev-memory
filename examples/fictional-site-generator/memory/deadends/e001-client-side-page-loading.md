# e001 — client-side page fragment loader

Session: 2026-08-03
Status: closed → reopened (2026-08-04)

## Route attempted

Instead of generating one HTML file per page, ship a single shell page and have the browser fetch and inject `content/*.md` fragments on navigation. The motivation was to stop rebuilding every page on each content change.

## What was tried

A prototype `build/index.html` that fetched `content/*.md` through `fetch()` and injected the result into a container, plus a `hashchange` handler for navigation. It worked locally.

## Why it failed

It works from a local file server only. With `file://`, `fetch()` on a local path is blocked, so the site stops working when opened directly from disk — and this project's constraint is that a published copy must work offline from the filesystem. Making the fragments load without a server would require bundling a runtime or inlining every page into the shell, which is either a new dependency or the same page-generation work in a worse form.

Failure category: `constraint-violation` — not a technology problem, a requirement problem.

## Not the same thing as

Reacting to a client-side *router* was rejected earlier for a different reason (unnecessary for a docs-only site, log 001). That rejection was a preference; this one is a constraint. Only this one is a dead end.

## Reopened — 2026-08-04

`reopenIf` was met: the offline constraint was narrowed in `specs/001-static-site/spec.md` from "must work from `file://`" to "must work without a network connection", and a build-time inliner was explicitly allowed. The route is viable again in its inlined form: fragments are baked into the shell at build time instead of fetched at runtime.

Recorded rather than retried silently, because the original failure and the reason it no longer applies are exactly what a later session would need in order to trust the route.
