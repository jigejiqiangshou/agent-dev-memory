# Semantics: memory stores

## Five layers

Memory keeps **what already happened** and **where things stand now**. It never keeps direction, plans, or task breakdowns — those belong to the project's spec (see §Memory vs spec).

| Layer | Role | Default suggestion (overridable) |
| :--- | :--- | :--- |
| Hot state | Current focus, blockers, next step, pointers | `{state_root}/state.json` |
| Decision log | Why it was done this way; rejected options | `{state_root}/log/` |
| Fact library | What has been verified true | `{state_root}/facts/` |
| Dead-end library | Which route is blocked, and until when | `{state_root}/deadends/` |
| Artifacts | Code, data, figures, builds | Project dirs; memory only references paths |

Spec, constitution, ADR, and `AGENTS.md` are **not memory layers**. They are the project's authoritative statements about requirements and direction, they live outside `memory/`, and a fact that contradicts them is wrong — not the other way around.

`state_root` is declared per project (see `AGENTS.md.fragment`). Default: `memory/`.

## Four stores, three projections

One event stream, three ways of looking at it. That is why the four stores share triggers but never share content.

| Store | Answers | Nature | Lifecycle | Driver |
| :--- | :--- | :--- | :--- | :--- |
| `state.json` | Where are we now / what is next | Assertion about the present | Overwritten, no history | Session |
| `log/` | Why was it done this way | Narrative of past events | Appended, rewritten never | Session |
| `facts/` | What is verified true | Empirical claim | Appended; can go stale | Event |
| `deadends/` | Which route is blocked, until when | Guarded prohibition | Appended; can reopen | Event |

Two rules follow from this table and prevent most misuse:

- Writing "we plan to use X" into `facts` is wrong — that is a plan, and plans live in the spec.
- Writing "I think X won't work" into `deadends` is wrong — that is a guess, not a dead end. Not attempted means not recorded.

## Hot-state contract

The hot state is a single JSON file: `state_root/state.json` (lowercase). The container and the field names are fixed; everything about how you organise prose inside those fields is yours.

| Field | Type | Five questions | Required |
| :--- | :--- | :--- | :--- |
| `schema` | integer | — | yes; currently `2` |
| `updated` | string | — | yes; ISO 8601 |
| `focus` | string | 1. current focus | yes, non-empty |
| `blockers` | string[] | 2. what blocks | yes; `[]` means "none" |
| `next` | string | 3. smallest next action | yes, non-empty |
| `artifacts` | object[] | 4. artifact / doc paths | yes; each `{ "path", "kind"?, "note"? }` |
| `decisions` | object[] | 5. decision pointer | yes; each `{ "id", "topic", "path" }` |
| `notes` | string[] | — | no; catch-all for what the five questions cannot hold |
| `git` | object | — | no; e.g. `{ "intentionallyUncommitted": [{ "path", "reason" }] }` |
| `memoryStores` | object | — | no; declares where the fixed-path libraries live |

Three hard rules:

1. The whole file is valid JSON (UTF-8, no comments, no trailing commas).
2. All seven required fields are present; `focus` and `next` are non-empty strings.
3. Empty values are never omitted: write `[]` for no blockers and no artifacts.

Soft rules:

- Paths in `artifacts[].path` and `decisions[].path` are repository-relative, so both the hot state and the decision log point at files the same way.
- Keep the top level shallow and each text field to a sentence or two. Long reasoning belongs in the decision log, with the hot state keeping only the pointer.
- Extra fields (`phase`, `branch`, ...) are allowed; this skill does not validate unknown keys.
- Do not add a comment key to explain the schema itself; document that in the decision log or a sibling file.

Four qualifiers on the content fields:

- `artifacts[]` lists what **exists**. A file that is planned but not created yet does not belong here — that is a plan, so it belongs to the spec.
- `decisions[]` lists the few choices the **current snapshot** stands on, not every log entry ever written.
- `focus` / `blockers` / `next` describe the present. Sentences like "we will eventually rewrite X" belong to the spec, not here.
- `next` is the one forward-looking field, and its scope is the **smallest next action** — a step, not a roadmap.

`memoryStores` declares the fixed entry points of the append-only libraries, because `state_root` can be relocated:

```json
"memoryStores": {
  "facts": "memory/facts/INDEX.json",
  "deadends": "memory/deadends/INDEX.json"
}
```

It is a **location declaration, not a content index**: its size is constant no matter how many facts accumulate. When absent, the defaults under `state_root` apply. Do not index individual facts or dead ends here — that would make the hot state grow without bound.

Minimal shape:

```json
{
  "schema": 2,
  "updated": "2026-08-02",
  "focus": "Ship a minimal static site generator that turns content/*.md into build/*.html.",
  "blockers": [],
  "next": "Add a single build.js entry that reads content/index.md and writes build/index.html.",
  "artifacts": [{ "path": "build/artifact-notes.md", "kind": "notes" }],
  "decisions": [{ "id": "001", "topic": "URL routing = flat files", "path": "memory/log/001-routing-decision.md" }],
  "memoryStores": { "facts": "memory/facts/INDEX.json", "deadends": "memory/deadends/INDEX.json" }
}
```

Git is the authority for "can we return to that revision." Memory answers "what sentence does the next session start from."

## Five questions (required meaning and field names, free wording)

Every hot-state update must make these answerable. Field names are fixed (see the contract table above); wording, language, and ordering are not.

1. What is the current focus? → `focus`
2. What is blocking? → `blockers`
3. What is the smallest next action? → `next`
4. Where are the relevant artifacts / docs (paths)? → `artifacts[].path`
5. Where is the latest key decision recorded (pointer)? → `decisions[].path`

Empty answers are explicit: `[]` for nothing blocking, nothing to reference.

## Fact and dead-end contract

Each library is **one index file plus Markdown bodies**, one body per entry:

```text
{state_root}/facts/INDEX.json      {state_root}/deadends/INDEX.json
{state_root}/facts/{id}-{slug}.md  {state_root}/deadends/{id}-{slug}.md
```

Both the body filename and the index `path` use one convention that already encodes the number: **`{id}-{slug}.md`**, e.g. `f001-build-output-overwritten.md`. The `f` / `e` prefix and the `NNN` counter come from the id, so there is exactly one filename per entry and nothing to keep in sync by hand. The decision log is the exception, because it has no id: it numbers as `NNN-YYYYMMDD-slug.md`.

The index is the **contract and the single query entry point**. Read it first; open bodies only when the index cannot decide. The bodies are **free-form Markdown with no contract** — the machine never parses them, so their structure is yours. That split is the point of the design: the fixed part stays small and checkable, the rich part stays free.

Index shape (both libraries):

```json
{
  "schema": 1,
  "updated": "2026-08-02",
  "entries": [
    {
      "id": "f002",
      "slug": "build-output-overwritten-on-rebuild",
      "title": "build/ is generated; hand-edits are overwritten",
      "status": "verified",
      "feature": null,
      "coldStart": true,
      "scope": "any hand-edit under build/",
      "verified": "edited build/index.html, ran build.js, change was gone",
      "evidence": "build/artifact-notes.md",
      "path": "memory/facts/f002-build-output-overwritten-on-rebuild.md"
    }
  ]
}
```

| Field | Type | Required | Meaning |
| :--- | :--- | :--- | :--- |
| `id` | string | yes | `fNNN` / `eNNN`, unique within its library, never reused |
| `slug` | string | yes | short kebab-case; the body filename is `{id}-{slug}.md` |
| `title` | string | yes | one line; what this entry claims, readable in isolation |
| `status` | string | yes | see the two status tables below |
| `feature` | string \| null | yes | spec directory name it belongs to; `null` when project-wide |
| `coldStart` | boolean | facts only | may this entry be read at cold start (see §coldStart) |
| `scope` | string | yes | where it holds / what it is about |
| `verified` | string | facts with `status: verified` | how it was verified — the method, in one line |
| `reason` | string | dead ends | failure category, from the fixed list below |
| `reopenIf` | string | dead ends | the condition under which this is worth retrying |
| `evidence` | string | no | repository-relative pointer: a file, a command, a log id |
| `path` | string | yes | **repository-relative** path of the body — the same base as `artifacts[].path` and `decisions[].path`, so it stays valid when `state_root` moves |

`title` and `scope` have an **implicit length budget** (one line each). The whole reason the index is worth reading first is that it stays small; a paragraph in a title defeats it.

Fact status:

| Status | Meaning |
| :--- | :--- |
| `verified` | Confirmed by a stated method. **Requires a non-empty `verified` field.** |
| `hypothesis` | Believed but not verified, or recorded without a method. |
| `stale` | Was verified; a precondition in `scope` no longer holds. Kept, never deleted. |

Dead-end status:

| Status | Meaning |
| :--- | :--- |
| `closed` | Tried and failed; not to be re-attempted while `reopenIf` is unmet. |
| `reopened` | `reopenIf` was met; it may be attempted again, with the reason recorded in the body. |

Dead-end `reason` is a fixed small set, so the library stays filterable:

`api-absent` · `perf-insufficient` · `dependency-conflict` · `constraint-violation` · `conclusion-was-wrong`

Three rules that keep these libraries honest:

1. **No method, no fact.** An entry lacking `verified` is written as `hypothesis`, never as `verified`. A claim that cannot say how it was checked is a guess, and a guess stored as a fact is worse than no entry — later sessions read it as established.
2. **No attempt, no dead end.** `deadends` records routes actually tried and failed. A route merely judged unlikely is not a dead end.
3. **No revisit condition, no entry.** Every dead end carries `reopenIf`. Many "impossible" routes were only impossible under the old constraint; without a revisit condition the library becomes superstition and permanently blocks a route that has since become correct.

## `coldStart`: the small hot subset of facts

`coldStart: true` on a fact means: **read this entry at cold start.** The cold-start read is `state.json` plus these entries only — not the whole fact index.

It exists for one failure mode: **unknown unknowns**. Some preconditions are expensive to violate and invisible from the current focus. The focus line says "add breadcrumbs to the site", nothing hints that editing `build/` is pointless, so the work proceeds on a false assumption, looks successful, and is silently destroyed later. The dead-end library cannot catch this — it governs routes you chose, and here no route was chosen.

Eligibility is one decidable test:

> Violating it makes the session's work entirely void, or causes irreversible loss.

| Fact | `coldStart`? | Why |
| :--- | :--- | :--- |
| `build/` is generated; hand-edits are overwritten | yes | Violating it voids the whole session's work |
| The main branch is protected; direct pushes are rejected | no | A project constraint — lives in the spec/constitution (§Memory vs spec) |
| This library's default call silently returns a wrong result | yes | Violating it voids every measurement taken |
| The test command is `npm run test:unit`, not `npm test` | no | One failed command and it self-corrects in seconds |
| `state.json` must be fully rewritten | no | The next persist reveals it by itself |

Three constraints:

1. **Hard cap: at most 10 entries.** Exceeding it forces a demotion. The cap is what keeps "hot" from slowly absorbing the whole library; the exact number matters less than its being a constant.
2. **Registered only at the checkpoint, by the main agent.** "Violating it voids the session" is a cross-session judgement, and judging it in the moment over-promotes. Demotion happens in the same place.
3. **Not a copy of the spec.** When the project's spec or constitution already states the constraint, the fact does not restate it — follow §Memory vs spec.

## Memory vs spec

Memory records **what already happened** and **where things stand now**. Statements about the present and the future — current technical route, roadmap, task breakdown, acceptance criteria — do **not** live here.

Routing rule:

1. **If the project has spec/plan/tasks, an ADR set, a constitution, or an `AGENTS.md` with declared conventions:** direction, roadmap, and task breakdown go there. Memory neither copies, mirrors, nor summarises them.
2. **If the project has no such place:** direction may be recorded in memory, but it must be flagged as a **downgrade** (see workflow §Direction routing) and moved out once the project gains a spec.
3. **If that location is not writable** (permissions, read-only checkout): never drop the content silently. Record it in memory, mark it explicitly as "spec write was refused, kept here temporarily", and retry at the next handoff.

Two shapes of the same boundary:

- **Normative vs empirical.** A rule someone *defined* ("must use ESM", "the build directory is generated") belongs to the spec. A behaviour someone *discovered* ("this API returns a row vector in version N", "the default argument silently changes the result") is a fact, because no spec would have written it. This is why `npm test` is not a fact: it is convention, not discovery.
- **When they overlap.** Facts must never duplicate spec text. Either do not record it, or record only a pointer (`see: specs/003/plan.md §Constraints`). If a fact and the current spec contradict each other, **the spec wins**, and the fact is marked `stale`.

Resolving that contradiction belongs to whoever finds it, at the next checkpoint: read the spec, retire the facts it has absorbed.

## Flexibility

- Section organisation inside the hot state, extra fields, and whether to split files are chosen by the agent for the task.
- Three deliberate exceptions, all syntax-level: the hot state lives in `state.json` and must parse; the five-question field names are fixed; the two library indices live at fixed paths with the field set above. Everything at the content level — wording, language, prose inside bodies, additional index fields — stays free.
- Examples in this skill are references, not contracts.
- Do not force fixed numbering schemes, fixed five-section templates, or domain checklists into the generic skill.

## What memory must not hold

- Direction, roadmaps, and task breakdowns when the project has a spec (see §Memory vs spec)
- Full copies of large binaries or datasets
- Secrets
- Project-only acceptance gates that belong in that repo's own rules
- A second full history of Git-tracked source (summarize + point to commits/paths instead)
- An append-only history inside the hot state — the log owns history; the hot state holds only the current snapshot plus pointers
