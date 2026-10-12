# Workflow: cold start, persist, Git

## Triggers (must persist hot state)

1. User says end / save progress / stop for now.
2. User starts an unrelated new task.
3. Before conversation compaction (persist must be complete *and* parseable before compaction starts).
4. Milestone done or blocked status changes.
5. Long session with unfinished intermediate steps (practical rule of thumb: ~30+ minutes of unfinished work).

## Cold start

1. Resolve the hot state with the order in `SKILL.md` §2 (`state.json` → case variants → legacy `STATE.md`/`DEV_STATE.md`, migrate it → create new).
2. Open decision logs only as needed via pointers.
3. Confirm next action with the user.
4. Do not redo completed items unless asked.

## Migrate legacy (`STATE.md` / `DEV_STATE.md` → `state.json`)

1. Read the five answers out of the Markdown file and map them onto the contract fields.
2. Anything important that the five questions cannot hold goes into `notes[]`.
3. `updated`: reuse the old file's date; if it has none, use today and say so in `notes`.
4. Write `state.json`, verify it parses, then delete the old Markdown hot state **in the same handoff**.
5. If deletion is impossible (permissions): say so in `notes` and tell the user to delete it by hand.
6. Never leave both files authoritative — tell the user the filename changed.

## Memory vs Git

| Moment | Memory | Git |
| :--- | :--- | :--- |
| Trivial redoable edits | Optional one-line next-step tweak | No commit required |
| Milestone / key decision | Update hot state + append decision entry | Prefer commit; message names the theme |
| Session end / task switch / pre-compaction | Must update hot state | If important artifacts are dirty: commit or record “intentionally uncommitted” |
| Disposable experiment | Optional rejection note in log | Leave uncommitted or drop branch |

## Light check before calling handoff done

1. Writes stayed inside allowed paths.
2. `state.json` parses, required fields are present, and the five questions are answerable.
3. Key artifacts have locatable path refs (`artifacts[].path` / `decisions[].path` are repository-relative).
4. Dirty critical work is committed or explicitly waived in hot state.
5. No legacy Markdown hot state is left alongside it.

Then tell the user the hot-state path (`state.json`), the `updated` value, and the update time.

## Failure handling

Markdown survives a truncated write; JSON does not — a half-written `state.json` breaks the next cold start. So:

1. Rewrite the hot state in full; do not patch it piecemeal.
2. Write the complete content to a temporary file in the same directory first (e.g. `state.json.tmp`), confirm it parses, then replace `state.json` with it. If the host tool can only write in place, re-read and verify immediately after writing.
3. If persist fails mid-way: fix paths/permissions, complete hot state first, then the decision log. Prefer keeping the last parseable version and telling the user "this update did not land" over writing broken JSON.
4. Do not invent a `.jsonc` or comment-bearing pseudo-JSON file; the contract requires valid JSON.
5. Never claim handoff complete without a readable, parseable hot state.
