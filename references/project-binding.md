# Project binding

Reusable procedure lives in this skill. Each repository only needs a thin binding.

## Paste source (single source of truth)

Copy the full contents of [`../AGENTS.md.fragment`](../AGENTS.md.fragment).

Do not duplicate that text into other skill files; edit the fragment only when the binding wording changes.

## Where to paste

| Target | When |
| :--- | :--- |
| Repository root `AGENTS.md` | Preferred for agents that load project instructions |
| Section in root `README.md` (e.g. `## Agent memory`) | When the repo has no `AGENTS.md` yet |

Paste into one place. Pasting into both is unnecessary.

## Customize after paste

- Change `state_root` if not `memory/`.
- **Declare the spec location.** Point at whatever the project already uses for requirements and direction — constitution, `specs/*/plan.md`, `tasks.md`, an ADR directory, or a conventions section of `AGENTS.md`. If the project has none, write `none` and memory becomes the temporary holder for direction, labelled as a downgrade (see [`workflow.md`](workflow.md) §Direction routing).
- Optionally list writable artifact roots or read-only roots.
- A repo whose binding still names a Markdown hot state needs the fragment's "Legacy" line applied: update that line to `state_root/state.json` and delete the old file in the same handoff — never keep both.
- A repo coming from `schema: 1` needs no action: v1 hot states stay valid, and the upgrade happens on the next write. Create empty `facts/INDEX.json` and `deadends/INDEX.json` the first time either library is used.
- Keep project-specific validators and domain gates in that repo's own rules—not in this skill.

## What the binding must not do

Do not restate the fact or dead-end content rules in the repository. The binding declares **where** things live; the meanings, contracts, and read/write rules stay in this skill. Copying them into every repository guarantees that one of the copies goes stale.

Do not create a spec file just to satisfy the direction rule. If the project has no spec, direction stays in memory and is marked as a downgrade.

## Install the skill

- Personal (all projects): copy this folder to `~/.cursor/skills/agent-dev-memory/`
- One repo: copy to `.cursor/skills/agent-dev-memory/` or keep under that repo's `skills/agent-dev-memory/` if your toolchain loads it from there

Never install into `~/.cursor/skills-cursor/` (Cursor built-in skills).
