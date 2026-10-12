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
- Optionally list writable artifact roots or read-only roots.
- A repo whose binding still names a Markdown hot state needs the fragment’s "Legacy" line applied: update that line to `state_root/state.json` and delete the old file in the same handoff — never keep both.
- Keep project-specific validators and domain gates in that repo’s own rules—not in this skill.

## Install the skill

- Personal (all projects): copy this folder to `~/.cursor/skills/agent-dev-memory/`
- One repo: copy to `.cursor/skills/agent-dev-memory/` or keep under that repo’s `skills/agent-dev-memory/` if your toolchain loads it from there

Never install into `~/.cursor/skills-cursor/` (Cursor built-in skills).
