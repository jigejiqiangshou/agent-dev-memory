# Semantics: state and memory

## Three layers

| Layer | Role | Default suggestion (overridable) |
| :--- | :--- | :--- |
| Hot state | Current focus, blockers, next step, pointers | `{state_root}/state.json` |
| Decision log | Why / rejected options / irreversible params | `{state_root}/log/` |
| Artifacts | Code, data, figures, builds | Project dirs; memory only references paths |

`state_root` is declared per project (see `AGENTS.md.fragment`). Default: `memory/`.

## Hot-state contract

The hot state is a single JSON file: `state_root/state.json` (lowercase). The container and the field names are fixed; everything about how you organise prose inside those fields is yours.

| Field | Type | Five questions | Required |
| :--- | :--- | :--- | :--- |
| `schema` | integer | — | yes; currently `1` |
| `updated` | string | — | yes; ISO 8601 |
| `focus` | string | 1. current focus | yes, non-empty |
| `blockers` | string[] | 2. what blocks | yes; `[]` means "none" |
| `next` | string | 3. smallest next action | yes, non-empty |
| `artifacts` | object[] | 4. artifact / doc paths | yes; each `{ "path", "kind"?, "note"? }` |
| `decisions` | object[] | 5. decision pointer | yes; each `{ "id", "topic", "path" }` |
| `notes` | string[] | — | no; catch-all for what the five questions cannot hold |
| `git` | object | — | no; e.g. `{ "intentionallyUncommitted": [{ "path", "reason" }] }` |

Three hard rules:

1. The whole file is valid JSON (UTF-8, no comments, no trailing commas).
2. All seven required fields are present; `focus` and `next` are non-empty strings.
3. Empty values are never omitted: write `[]` for no blockers and no artifacts.

Soft rules:

- Paths in `artifacts[].path` and `decisions[].path` are repository-relative, so both the hot state and the decision log point at files the same way.
- Keep the top level shallow and each text field to a sentence or two. Long reasoning belongs in the decision log, with the hot state keeping only the pointer.
- Extra fields (`phase`, `branch`, ...) are allowed; this skill does not validate unknown keys.
- Do not add a comment key to explain the schema itself; document that in the decision log or a sibling file.

Minimal shape:

```json
{
  "schema": 1,
  "updated": "2026-08-02",
  "focus": "Ship a minimal static site generator that turns content/*.md into build/*.html.",
  "blockers": [],
  "next": "Add a single build.js entry that reads content/index.md and writes build/index.html.",
  "artifacts": [{ "path": "build/artifact-notes.md", "kind": "notes" }],
  "decisions": [{ "id": "001", "topic": "URL routing = flat files", "path": "memory/log/001-routing-decision.md" }]
}
```

Git is the authority for “can we return to that revision.” Memory answers “what sentence does the next session start from.”

## Five questions (required meaning and field names, free wording)

Every hot-state update must make these answerable. Field names are fixed (see the contract table above); wording, language, and ordering are not.

1. What is the current focus? → `focus`
2. What is blocking? → `blockers`
3. What is the smallest next action? → `next`
4. Where are the relevant artifacts / docs (paths)? → `artifacts[].path`
5. Where is the latest key decision recorded (pointer)? → `decisions[].path`

Empty answers are explicit: `[]` for nothing blocking, nothing to reference.

## Flexibility

- Section organisation inside the hot state, extra fields, and whether to split files are chosen by the agent for the task.
- One deliberate exception: the hot state lives in `state.json` and must parse, and the five-question field names are fixed so a cold start can machine-check them. That is a syntax-level contract, not a content template—wording, language, and additional fields stay free.
- Examples in this skill are references, not contracts.
- Do not force fixed numbering schemes, fixed five-section templates, or domain checklists into the generic skill.

## What memory must not hold

- Full copies of large binaries or datasets
- Secrets
- Project-only acceptance gates that belong in that repo’s own rules
- A second full history of Git-tracked source (summarize + point to commits/paths instead)
- An append-only history inside the hot state — the decision log owns history; the hot state holds only the current snapshot plus pointers
