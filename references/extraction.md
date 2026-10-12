# Extraction notes (abstraction only)

Derived by abstracting session-handover style systems. This file is documentation for authors; it is not part of the runtime checklist.

## Keep (abstract)

| Idea | Generic form in this skill |
| :--- | :--- |
| Bounded hot snapshot | Short hot state under `state_root` |
| Machine-checkable hot state | JSON container (`state.json`) with fixed five-question field names |
| Append-only decision history | `{state_root}/log/` or equivalent |
| Cold-start order | Hot → optional log → confirm next |
| Persist on end / switch / compaction | Workflow triggers |
| Receipt after persist | Tell user path + time |
| Separate activity from archive | Hot vs cold layers |

## Discard (do not put in generic skill)

One distinction matters when reading this table: fixed *field names* for a machine-checkable hot state are kept on purpose (see Keep), while fixed *semantic* structure—prose sections, numbering, phase pipelines—is discarded. Syntax contract yes; content template no.

| Project-coupled item | Why discard |
| :--- | :--- |
| Language-specific static-check gates (e.g. fixed MCP tool names) | Belongs in project rules |
| Fixed phase numbering / domain pipelines | Project-specific |
| Mandatory rigid section templates or `NN+topic` naming | Conflicts with flexible retention |
| Rigid *semantic* templates (fixed prose sections, forced numbering) | Project-specific; format freedom is the point |
| Checklist item that requires files to exist before the step that creates them | Circular gate |
| Absolute machine user paths | Non-portable / leaking |
| Domain metrics, model names, dataset paths | Context pollution |
| Treating memory files as a substitute for Git | Reinvents backup |

## Relationship to legacy project skills

If a repository still has a domain-specific handover skill, keep it for that domain’s gates. Use `agent-dev-memory` for portable multi-session hygiene; do not merge domain checklists back into this package.
