# agent-dev-memory

Portable skill for multi-session **hot state** (`state.json`), **decision logs**, and **artifact path references**. Git remains the backup authority; this skill does not add MCP, locks, or a second backup system.

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
    ├── memory/
    │   ├── state.json
    │   └── log/001-routing-decision.md
    └── build/artifact-notes.md
```

## Install

1. Copy this folder to `~/.cursor/skills/agent-dev-memory/` (all projects) or `.cursor/skills/agent-dev-memory/` (one repo).
2. Do not install under `~/.cursor/skills-cursor/`.
3. Paste [`AGENTS.md.fragment`](AGENTS.md.fragment) into the target repo’s root `AGENTS.md`, or into a `## Agent memory` section of `README.md`.
4. Adjust `state_root` if needed (default `memory/`).
5. If the repo already has a Markdown hot state (`STATE.md` / `DEV_STATE.md`), migrate it to `state.json` and delete the old file in the same handoff — never keep both. See [`references/workflow.md`](references/workflow.md) §Migrate legacy.

The hot state is `state_root/state.json`: valid JSON, with required fields `schema`, `updated`, `focus`, `blockers`, `next`, `artifacts`, `decisions` (contract: [`references/semantics.md`](references/semantics.md) §Hot-state contract).

Details: [`references/project-binding.md`](references/project-binding.md).

## Boundary with Git

- Memory: what to do next, blockers, pointers — a single current snapshot (`state.json`), not a history.
- Git: recoverable revisions of code and text.

## Example

See [`examples/fictional-site-generator/`](examples/fictional-site-generator/) (fictional only; no real project paths).
