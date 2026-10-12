# agent-dev-memory

Portable skill for multi-session **hot state** (`state.json`), **decision logs**, **verified facts**, and **dead ends**, plus artifact path references. Git remains the backup authority; this skill does not add MCP, locks, or a second backup system.

Memory stores **what already happened** and **where things stand now**. Direction, roadmaps, and task breakdowns belong to the project's spec, not here.

## Layout

```text
agent-dev-memory/
├── SKILL.md
├── AGENTS.md.fragment
├── README.md
├── references/
│   ├── semantics.md
│   ├── workflow.md
│   ├── project-binding.md
│   └── extraction.md
└── examples/fictional-site-generator/
    ├── README.md
    ├── build.js
    ├── site.config.json
    ├── content/{index,about-us}.md
    ├── build/                 # generated output (gitignored)
    │   └── artifact-notes.md
    ├── specs/001-static-site/constitution.md
    └── memory/
        ├── state.json
        ├── log/001-20260801-routing-decision.md
        ├── log/002-20260802-build-entry.md
        ├── log/003-20260803-rename-and-run.md
        ├── facts/INDEX.json
        ├── facts/f001-build-output-overwritten-on-rebuild.md
        ├── facts/f002-config-is-the-source-of-truth.md
        ├── deadends/INDEX.json
        └── deadends/e001-client-side-page-loading.md
```

## Install

1. Copy this folder to `~/.cursor/skills/agent-dev-memory/` (all projects) or `.cursor/skills/agent-dev-memory/` (one repo).
2. Do not install under `~/.cursor/skills-cursor/`.
3. Paste [`AGENTS.md.fragment`](AGENTS.md.fragment) into the target repo’s root `AGENTS.md`, or into a `## Agent memory` section of `README.md`.
4. Adjust `state_root` if needed (default `memory/`), and declare the project's **spec location**.
5. If the repo already has a Markdown hot state (`STATE.md` / `DEV_STATE.md`), migrate it to `state.json` and delete the old file in the same handoff — never keep both. See [`references/workflow.md`](references/workflow.md) §Migrate legacy.

The hot state is `state_root/state.json`: valid JSON, with required fields `schema`, `updated`, `focus`, `blockers`, `next`, `artifacts`, `decisions` (contract: [`references/semantics.md`](references/semantics.md) §Hot-state contract).

## The four stores

| Store | Answers | Driver | Read |
| :--- | :--- | :--- | :--- |
| `state.json` | Where are we now, what is next | Session | Cold start |
| `log/NNN-*.md` | Why was it done this way | Session | When digging into a hard problem |
| `facts/` | What is verified true | Event | Cold start (≤10 `coldStart` entries); index on selection and before verifying |
| `deadends/` | Which route is blocked, until when | Event | Index on selection, before ruling a route out |

Each library is `INDEX.json` plus one Markdown body per entry. **Query the index first**; open a body only when the index cannot decide.

## Boundary with Git

- Memory: what to do next, blockers, pointers, verified facts, ruled-out routes — a single current snapshot (`state.json`) plus append-only libraries.
- Git: recoverable revisions of code and text.

## Example

See [`examples/fictional-site-generator/`](examples/fictional-site-generator/) (fictional only; no real project paths). It demonstrates a `coldStart` fact being demoted once the spec states the same constraint, and a dead end being reopened because its `reopenIf` condition was met.
