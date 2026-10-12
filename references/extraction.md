# Extraction notes (abstraction only)

Derived by abstracting session-handover style systems. This file is documentation for authors; it is not part of the runtime checklist.

## Keep (abstract)

| Idea | Generic form in this skill |
| :--- | :--- |
| Bounded hot snapshot | Short hot state under `state_root` |
| Machine-checkable hot state | JSON container (`state.json`) with fixed five-question field names |
| Append-only decision history | `{state_root}/log/` or equivalent |
| Append-only verified-fact history | `{state_root}/facts/` with a JSON index and free-form bodies |
| Append-only ruled-out history | `{state_root}/deadends/` with a revisit condition per entry |
| Index before bodies | Fixed-path `INDEX.json` as the single query entry point; bodies stay contract-free |
| No method, no fact | `verified` is required for `status: verified`, otherwise the entry is `hypothesis` |
| Expensive-and-invisible preconditions | A capped `coldStart` flag on facts, so unknown unknowns are caught |
| Cold-start order | Spec → hot state → `coldStart` facts → optional log |
| Persist on end / switch / compaction | Workflow triggers |
| Two trigger kinds | Session-driven (`state`, `log`) vs event-driven (`facts`, `deadends`) |
| Receipt after persist | Tell user path + time |
| Separate activity from archive | Hot vs cold layers |
| Memory holds past and present, not direction | Direction routes to the project's spec |

## Discard (do not put in generic skill)

One distinction matters when reading this table: fixed *field names* for a machine-checkable hot state are kept on purpose (see Keep), while fixed *semantic* structure—prose sections, numbering, phase pipelines—is discarded. Syntax contract yes; content template no.

| Project-coupled item | Why discard |
| :--- | :--- |
| Language-specific static-check gates (e.g. fixed MCP tool names) | Belongs in project rules |
| Fixed phase numbering / domain pipelines | Project-specific |
| Mandatory rigid section templates or `NN+topic` naming | Conflicts with flexible retention |
| Rigid *semantic* templates (fixed prose sections, forced numbering) | Project-specific; format freedom is the point |
| A fixed format for the fact / dead-end bodies | The index carries the contract; the bodies stay free-form |
| Copying spec constraints into the fact library | Guarantees drift; the spec wins on conflict |
| Storing direction or roadmaps in memory when the project has a spec | Duplicates the authority and goes stale |
| Checklist item that requires files to exist before the step that creates them | Circular gate |
| Absolute machine user paths | Non-portable / leaking |
| Domain metrics, model names, dataset paths | Context pollution |
| Treating memory files as a substitute for Git | Reinvents backup |

## Relationship to legacy project skills

If a repository still has a domain-specific handover skill, keep it for that domain’s gates. Use `agent-dev-memory` for portable multi-session hygiene; do not merge domain checklists back into this package.
