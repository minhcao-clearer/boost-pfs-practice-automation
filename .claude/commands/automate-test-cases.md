---
description: Turn written manual test cases into automated Playwright tests — recon the real UI, design the Page Objects, generate the specs, then run and self-heal until they pass or a real bug is found.
---

# Automate test cases

Takes test cases a human wrote and produces working automation. Long-running and mostly
autonomous: keep going through failures rather than stopping to ask, and only surface a
question when the answer is a judgement no one has made yet.

## Read first

- [`TESTING-STANDARD.md`](../../TESTING-STANDARD.md) — the universal engine.
- This project's [`CLAUDE.md`](../../CLAUDE.md) — layering, naming, folders, tags.
  **On conflict, `CLAUDE.md` wins.**
- [`LOCATOR-STRATEGY-GUIDELINE.md`](../../LOCATOR-STRATEGY-GUIDELINE.md) — locator
  priority and the verification routine.

Skills that do the specialised parts: `inspect-ui` (read the live DOM), `smart-locator`
(choose and verify locators), `test-data` (unique, traceable inputs).

## Inputs to collect

| Input                                     | Required | How to get it                                                                                                                  |
| ----------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **Test cases** (file, doc or pasted text) | ⭐       | From the user. If they have none written, run the `write-test-cases` skill first.                                              |
| **Feature** the tests belong to           | ⭐       | **Ask.** List the folders already under `tests/` and have the user pick one or name a new one — never invent it (`CLAUDE.md`). |
| **Application URL**                       | ⭐       | From the user, or already in the test cases                                                                                    |
| **Tags** (`@smoke`, `@regression`)        | ⭐       | Ask; type is a tag, not a folder                                                                                               |
| Credentials, if a login is needed         | —        | Ask, or use an existing fixture. **Never read `.env` directly.**                                                               |

Ask for anything missing before starting. Then track progress in a scratch `task.md` —
one row per test case, status updated as you go — and delete it once you have reported.

---

## 1. Parse and plan

Read the test cases and pull out, per case: id, summary, preconditions, steps, data,
expected result, priority. Note which pages each case touches and any order dependency
between them (there should not be one — see `TESTING-STANDARD.md` §6).

Say back what you understood before building on it. A misread requirement automated
faithfully is worse than no automation.

## 2. Recon the real UI

**Never guess a locator.** Two ways to look, cheapest first:

- **Throwaway recon spec** — a temporary `*.recon.spec.ts` that queries candidate
  elements and prints their `role`, `name`, `aria-label`, `placeholder`, `data-testid`
  and `id` to stdout. Run it, read the output, **delete the file**. Cheap, and best when
  you already know roughly what you are looking for.
- **Playwright MCP** (`inspect-ui`) — when you don't know the page's structure, when
  content only appears after interaction, or for iframes and shadow DOM. Snapshots are
  richer but cost far more context, so reach for this second.

Record what you found, and how each locator was verified:

| Page | Element | Primary | Fallback | Verified |
| ---- | ------- | ------- | -------- | -------- |

Situations that stop recon: a login you have no credentials for, a CAPTCHA or 2FA (say so
— it cannot be automated), or an element that simply is not there (re-snapshot; if it is
genuinely gone, the markup changed and the test cases may be out of date).

## 3. Design the Page Objects

One class per page or component. Selectors live **only** here; assertions live **only** in
specs. Methods describe user intent — `applyFilter()`, not `clickThirdButton()`.

Reuse before you add: check the existing Page Objects first, and extend one rather than
introducing a near-duplicate.

## 4. Prepare the data

Split fixed inputs (belong in the data layer as named constants) from values that must be
unique per run (generate them, traceable). Use the `test-data` skill. Nothing hardcoded in
a spec; no credentials in code.

## 5. Write the specs

File goes in the feature folder agreed above, tagged with the agreed type. Follow the
project's accepted pattern (`CLAUDE.md`) — for this repo, **data → navigate → wait → read
→ assert**.

Each case becomes a test whose steps mirror the written steps and whose assertions mirror
the written expected results, with a message naming the offending value. Cover the
negative cases the test cases describe — that is usually where the bugs are.

## 6. Run, then heal the _cause_

Run the specs. On failure, classify before you touch anything:

| Symptom                | Usually means                        | Do                                          |
| ---------------------- | ------------------------------------ | ------------------------------------------- |
| Element not found      | Locator wrong or stale               | Re-inspect the DOM, pick a verified locator |
| Timeout                | Waiting on the wrong condition       | Wait for what actually signals readiness    |
| Click intercepted      | Overlay, toast, spinner on top       | Wait for it to clear                        |
| Data conflict          | Values collide between runs          | Generate unique data                        |
| Import / type error    | Code mistake                         | Fix it                                      |
| **Assertion mismatch** | **The app returned the wrong thing** | **Probably a real bug — see below**         |

Iterate on the automation faults **without asking** — up to about five rounds, logging
what you changed each time. Never "fix" a failure with a sleep, a skip, a `fixme`, or a
loosened assertion; that is the one outcome worse than a red test.

**When it looks like a product bug:** re-run once with no code change. If the same
assertion fails the same way, it is a bug, not a flake. Stop healing and report it:
the test case id, steps, expected vs actual, the assertion message, and a screenshot.
Do not bend the test to match the broken behaviour. (If a Jira/Xray integration is
configured, file it there; otherwise report it to the user.)

**Then prove stability:** `npx playwright test <file> --repeat-each=2`. A test that passes
once is not yet evidence.

## 7. Clean up and hand over

- Remove the recon spec, debug logging, commented-out code, unused locators and imports.
- Run the project's full gate — `npm run check` here.
- Report: how many cases passed / failed / were skipped and why, the files you added or
  changed, the locator table, and anything you could not automate.
- Delete `task.md`.

Finally, have the work reviewed against the rules — `/review-test` — before it is merged.
The generated code is a draft until a person has judged it.
