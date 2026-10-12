# Workflow: triggers, cold start, persist, Git

## Two kinds of trigger

Triggers differ by **what they are keyed on**. Mixing them up is what makes a memory system either noisy or empty.

| Kind | Keyed on | Libraries | Must it be immediate? |
| :--- | :--- | :--- | :--- |
| Session-driven | A moment in the session | `state.json`, `log/` | No — the checkpoint handles it |
| Event-driven | Something that happened | `facts/`, `deadends/` | **Yes — write it while the evidence is still in hand** |

Event-driven entries are immediate because their content has a shelf life. "How exactly was it verified" and "what exactly did the error say" are still precise right after the event and become guesswork an hour later. The session-driven ones are narrative and can be composed at the checkpoint.

## Triggers (when to persist)

| Trigger | `state.json` | `log/` |
| :--- | :--- | :--- |
| Task or milestone completed | Update if progress, blockers, or artifacts actually changed | **Always write** |
| Blocker appears or clears | Update if it changed | **Always write** |
| Switching to an unrelated task | **Always write** | **Always write** |
| Before conversation compaction | **Always write** (complete *and* parseable before compaction starts) | **Always write** |
| Before a Git commit | Not required — a partial commit often leaves focus unchanged | **Always write** |
| Session end / save progress / stop for now | **Always write** | **Always write** |
| Long session, roughly 30+ minutes | Not required | **Always write** — this is what keeps the log a running record |

Two thresholds, shared moments: the `log` fires at every one of these moments, while `state.json` changes only when there is something real to record. That is how the log stays detailed without the hot state filling up with trivia.

Event-driven, written the moment they happen:

| Event | Where |
| :--- | :--- |
| A verification action just finished | `facts/` — write the body, then update `facts/INDEX.json` |
| A route was attempted and failed | `deadends/` — write the body, then update `deadends/INDEX.json` |
| A fact's precondition no longer holds | Mark that fact `stale` |
| A dead end's `reopenIf` is met | Mark it `reopened`, and append why to the body |

## What the decision log must and must not be

The log is a running record, but **an entry is earned, not scheduled by the clock alone**. A moment with a genuine artifact behind it always earns one; a conversation that produced nothing does not.

- **Pure discussion with no artifact → no entry at all.** Nothing happened that a later session could mine.
- **Once there is an artifact → the entry must carry how it came to be**, not just what it is: the goal, the path of investigation or discussion, the options rejected and why, the decision reached, pointers to the `facts`/`deadends` ids it touches, and where the next session picks up.

This is the rule that makes the log worth mining during a hard problem: the reasoning is what is hard to reconstruct, and it is captured exactly where the artifact is recorded.

Rules of thumb:

- One entry per triggered moment, not per file touched.
- Minimum content: what was done or found; the ids of related event records; where the next session resumes. Expand the process only where there is substance.
- An entry is never rewritten. Later corrections are new entries, or edits to `facts`/`deadends` status.
- Facts and dead ends are the first-hand records; the log **points at them and does not restate them**.
- No artifacts and no findings means no entry — do not manufacture one to satisfy the trigger.

Log file: `{state_root}/log/NNN-YYYYMMDD-slug.md` for new entries, numbered monotonically.

## Cold start

1. **Read the spec first, when the project has one.** Constitution, spec, plan, tasks, or the declared `AGENTS.md` conventions. Without it there is no direction, and `focus` alone does not carry one. This is also what retires facts the spec has since absorbed.
2. **Resolve the hot state**, in this order (`state.json` → case variants → legacy `STATE.md`/`DEV_STATE.md`, migrate → create new). On a parse failure, follow §Failure handling; **never continue the narrative on top of an unparsed hot state**.
3. **Read the `coldStart: true` facts** — those entries only, from `{state_root}/facts/INDEX.json`.
4. Open decision logs only as needed via pointers.
5. Confirm the next action with the user.
6. Do not redo completed items, and do not re-verify facts already in the library, unless confirming one is the task.

**Do not read the dead-end index or the full fact index at cold start.** They are read on selection, when they can actually decide something (see §Read map).

## Read map

| Library | Cold start | Choosing a route | Before verifying | Digging into a hard problem |
| :--- | :--- | :--- | :--- | :--- |
| Spec / constitution / plan | **Required** | Yes | — | Yes |
| `state.json` | **Required** | — | — | — |
| `facts` entries with `coldStart: true` | **Required** | — | — | — |
| `facts/INDEX.json` (full) | No | Yes | Yes | Yes |
| `deadends/INDEX.json` | No | Yes | — | Yes |
| `log/` | No | — | — | **Primary use** |

Three hard rules:

1. **Index first, bodies on demand.** Read `INDEX.json` before opening any body; skip the body when `status`/`scope`/`reopenIf` already settles the question.
2. **Check `reopenIf` before opening a dead end.** Unmet → leave that route alone. Met → record the reopening first, then proceed.
3. **Before stating that something is not viable, check the dead-end index.** A hit means cite the existing entry instead of rediscovering it; a miss means it is a new finding, so record it. This is also what keeps an untried guess from being pronounced a dead end.

## Checkpoint (the single entry point for memory writes)

Run this whenever any trigger above fires. Five questions, each with a test for "nothing to do":

1. **Did progress, blockers, or artifacts actually change?** → update `state.json`. *Nothing to do:* none of the three changed.
2. **Was anything newly verified?** → write `facts/` with method, evidence, and scope. *Nothing to do:* nothing new was verified. **An unverified assumption is not a fact** — record it as `hypothesis`, or leave it out.
3. **Was a route attempted and failed?** → write `deadends/` with `reason`, `reopenIf`, and `scope`. *Nothing to do:* nothing was attempted, or it worked.
4. **Does any existing fact's precondition no longer hold?** → mark it `stale`. *Nothing to do:* no precondition changed.
5. **Does anything pending describe how things will be done?** → route it per §Direction routing. *Nothing to do:* everything pending is about the past or the present.

Question 5 is the gate that keeps memory from turning into a copy of the spec. It is also the only question whose answer may be "write somewhere else".

Do not promote or demote `coldStart` outside this checkpoint.

## Direction routing

Before writing anything, split what is pending in two:

| Pending content | Where it goes |
| :--- | :--- |
| Technical route, roadmap, task breakdown, acceptance criteria, "what we will do" | The project's spec / plan / tasks / constitution / ADR, or declared `AGENTS.md` conventions |
| What happened, what was verified, what was ruled out, where things stand | Memory |

Order of operations:

1. Write the direction item into whichever spec artifact owns it (route → `plan`, breakdown → `tasks`, behaviour → `spec`, project-wide constraint → constitution). Do not create a new spec file to hold it, and do not restate it in memory.
2. If no such artifact exists: record it in memory, and label it a **downgrade** — a temporary holding place until the project has a spec.
3. If the write is refused (permissions, read-only checkout): **never drop it silently.** Record it in memory, annotate it as "spec write was refused, kept here temporarily", and retry at the next handoff.
4. If the target file is ambiguous and the user is reachable, ask. Otherwise write to the nearest owning artifact and say which one.

## Sub-agent reports (write access)

**Only the main agent writes memory.** A sub-agent or teammate with its own memory manages that separately; it never writes this project's `memory/`.

When a sub-agent has something worth recording, it reports the **proposed entry in near-index shape**, so the main agent can validate and paste rather than reinterpret:

```text
[kind] fact | deadend
id-intent: f014            (main agent assigns the final id)
title: <one line>
status / reason: <status, or reason category for a dead end>
scope: <where it holds>
verified: <how it was verified>        (facts only)
reopenIf: <revisit condition>          (dead ends only)
evidence: <repository-relative pointer>
summary: <2-3 sentences for the body>
```

The main agent decides what is admitted, assigns ids, and writes at the checkpoint. Reports that arrive in any other shape are read as information, not as entries.

## Index write protocol

The index is a small file shared by all entries, so a torn write makes every entry unfindable at once, even though the bodies survive. Treat it like the hot state:

1. **Numbering.** Take the next free `NNN` by reading the current index; ids are never reused.
2. **Body first, then index.** Write `{id}-{slug}.md`, confirm it is non-empty, then update the index. Only the decision log carries a date in its filename; library bodies are named from their id.
3. **Batch.** Read the index once, append every accepted entry, write once. With multiple reports, this is one write, not one per report.
4. **Atomic replace.** Write the full content to a temporary file in the same directory (`INDEX.json.tmp`), confirm it parses, then replace `INDEX.json` with it. If the host tool can only write in place, re-read and verify immediately after writing.
5. **Verify 1:1.** Every index entry has a body, and every body has an index entry. This is checked in the light check.
6. **Fallback.** If the index cannot be written or will not parse, append the new entries to `INDEX.recover.jsonl` in the same directory (one JSON object per line — pure append, safe against truncation), tell the user, and merge it back into the index at the next handoff. The fallback exists for **corruption, not for concurrency**: memory has a single writer.
7. The index carries its own `updated`; `state.json` does not relay it.

## Migrate legacy (`STATE.md` / `DEV_STATE.md` → `state.json`)

1. Read the five answers out of the Markdown file and map them onto the contract fields.
2. Anything important that the five questions cannot hold goes into `notes[]`.
3. `updated`: reuse the old file's date; if it has none, use today and say so in `notes`.
4. Write `state.json`, verify it parses, then delete the old Markdown hot state **in the same handoff**.
5. If deletion is impossible (permissions): say so in `notes` and tell the user to delete it by hand.
6. Never leave both files authoritative — tell the user the filename changed.

## Migrate v1 hot state → `schema: 2`

- A `schema: 1` file stays **valid**; the v2 additions are optional and absent means default. A cold start on v1 must not error and must not silently upgrade.
- Upgrade opportunistically: the next time the hot state is written for another reason, set `schema: 2` and add `memoryStores` if the libraries are not at the default paths.
- On the first read of a v1 file, create `facts/` and `deadends/` with empty indices if they are missing. Do not back-fill them from history.
- Validation must tolerate unknown keys, or v1 files will be judged invalid by their own skill.

## Memory vs Git

| Moment | Memory | Git |
| :--- | :--- | :--- |
| Trivial redoable edits | Optional one-line next-step tweak | No commit required |
| Milestone / key decision | Update hot state + append log entry (with rejected options and reasoning) | Prefer commit; message names the theme |
| Verification succeeded | Write a fact entry at once | — |
| Route attempted and failed | Write a dead-end entry at once | — |
| Session end / task switch / pre-compaction | Must update hot state and write a log entry | If important artifacts are dirty: commit or record "intentionally uncommitted" |
| Disposable experiment | Rejection note in the log, or a dead end if it was attempted | Leave uncommitted or drop branch |

## Light check before calling handoff done

1. Writes stayed inside allowed paths.
2. `state.json` parses, required fields are present, and the five questions are answerable.
3. Key artifacts have locatable path refs (`artifacts[].path`, `decisions[].path`, and the library indices' `path` are all repository-relative). Nothing is listed as an artifact that does not exist on disk yet.
4. Dirty critical work is committed or explicitly waived in hot state.
5. No legacy Markdown hot state is left alongside it.
6. Both indices parse, and index entries and bodies match 1:1.
7. No direction, roadmap, or task-breakdown content in memory that the spec already owns (unless labelled a downgrade or a refused spec write).
8. Every `facts` entry with `status: verified` has a non-empty `verified`; every `deadends` entry has a non-empty `reopenIf`; at most 10 facts carry `coldStart: true`.

Then tell the user the hot-state path (`state.json`), the `updated` value, and the update time.

## Failure handling

Markdown survives a truncated write; JSON does not — a half-written `state.json` breaks the next cold start. So:

1. Rewrite the hot state in full; do not patch it piecemeal.
2. Write the full content to a temporary file in the same directory first (e.g. `state.json.tmp`), confirm it parses, then replace `state.json` with it. If the host tool can only write in place, re-read and verify immediately after writing.
3. If persist fails mid-way: fix paths/permissions, complete hot state first, then the decision log, then the libraries. Prefer keeping the last parseable version and telling the user "this update did not land" over writing broken JSON.
4. Do not invent a `.jsonc` or comment-bearing pseudo-JSON file; the contract requires valid JSON.
5. Facts and dead-end bodies are Markdown, so a torn write costs one entry, not the library — but the index is JSON and follows rule 2. If the index write fails, use the `INDEX.recover.jsonl` fallback above rather than leaving the entry unrecorded.
6. Never claim handoff complete without a readable, parseable hot state.
