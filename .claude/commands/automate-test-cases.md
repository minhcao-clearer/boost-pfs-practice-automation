---
description: Convert manual test cases into automation scripts autonomously using a 7-step workflow.
---

# Workflow: Generate Automation Scripts from Manual Test Cases

> **MANDATORY — Read each file fully before starting:**
>
> | Role in workflow                                                             | File to read                                                           |
> | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
> | Universal engine — how to write good E2E tests anywhere                      | [`TESTING-STANDARD.md`](../../TESTING-STANDARD.md)                     |
> | This project's rules — layering, naming, folders, tags. **Wins on conflict** | [`CLAUDE.md`](../../CLAUDE.md)                                         |
> | Locator priority, stability rules, verification routine                      | [`LOCATOR-STRATEGY-GUIDELINE.md`](../../LOCATOR-STRATEGY-GUIDELINE.md) |
>
> **Skills used throughout:**
>
> - `inspect-ui` — browser recon: DOM inspection, snapshot, screenshot
> - `smart-locator` — locator generation & validation: primary + fallback
> - `test-data` — unique, traceable test data: positive/negative/boundary/edge
> - `write-test-cases` — run this first if the user has no written test cases yet

---

## ⚠️ Execution principles

- **Role:** Act as an experienced Senior Automation Engineer — follow Clean Code + the project's layering
- **All output in English**
- **NEVER guess locators** — inspect the real DOM via MCP or a CLI recon spec
- **Desktop viewport 1920×1080** — already pinned in [`.mcp.json`](../../.mcp.json), no resize call needed
- ⚠️ **Fix autonomously (CRITICAL):** Test FAIL → read logs → analyze → fix → re-run. **DO
  NOT ask the user while fixing.** Ask only when business rules conflict or after 5
  auto-heal rounds
- **Artifact `task.md`** — MUST be created to track progress across all steps

---

## Inputs to collect

| Input                                  | How to obtain                                                                                                               | Priority    |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ----------- |
| **Test case file** (MD/Excel/JSON/URL) | User provides path or URL                                                                                                   | ⭐ Required |
| **Feature** the tests belong to        | **List the folders already under `tests/`, then ask** the user to pick one or name a new one. Never invent it (`CLAUDE.md`) | ⭐ Required |
| **Tags** (`@smoke`, `@regression`)     | User specifies — type is a tag, not a folder                                                                                | ⭐ Required |
| **Application URL**                    | User provides or embedded in TC                                                                                             | ⭐ Required |
| **Credentials** (if login needed)      | User provides or use existing fixture. **Do NOT read `.env` directly**                                                      | Optional    |

If the user has not provided enough → ask before starting.

---

## Steps

### Step 1: Initialize, Analyze & Plan

1. **Read the test case file** from the user; detect format (Markdown table, Excel, JSON, CSV, free text).

2. **Parse test cases** and extract:
   - TC list (ID, Summary, Pre-condition, Action, Data, Expected Results, Priority, Tag)
   - Pages/screens the TCs traverse
   - Pre-conditions (login, setup data, navigate…)
   - Dependencies between TCs (there should be none — `TESTING-STANDARD.md` §6)

3. **Create artifact `task.md`** for progress tracking:

   ```markdown
   # Automation Generation Progress

   - [x] Step 1: Analyze test cases
   - [ ] Step 2: UI recon
   - [ ] Step 3: POM design
   - [ ] Step 4: Test data prep
   - [ ] Step 5: Generate automation scripts
   - [ ] Step 6: Run tests + Auto-heal
   - [ ] Step 7: Cleanup & Delivery

   ## Test Cases to Automate

   | ID   | Summary | Pages     | Priority | Status |
   | ---- | ------- | --------- | -------- | ------ |
   | TC01 | Example | LoginPage | P1       | ⏳     |
   ```

---

### Step 2: Autonomous UI Recon

**Recon approach — CLI first, MCP fallback.**

#### Primary: `.recon.spec.ts` (CLI — lower token cost)

Create a temporary recon file, run it, read output, then delete:

```typescript
// tests/<feature>/<page>.recon.spec.ts
import { test } from "@playwright/test";

test("recon: <page name>", async ({ page }) => {
  await page.goto("<url>");

  const elements = await page.locator("<selector>").all();
  for (const el of elements) {
    console.log({
      text: await el.textContent(),
      role: await el.getAttribute("role"),
      ariaLabel: await el.getAttribute("aria-label"),
      placeholder: await el.getAttribute("placeholder"),
      testId: await el.getAttribute("data-testid"),
      id: await el.getAttribute("id"),
    });
  }
});
```

```bash
npx playwright test <page>.recon.spec.ts --headed
```

> **Delete the recon file immediately after** — do not commit it to source.

#### Fallback: Playwright MCP

Use MCP only when CLI recon cannot handle the scenario:

| Scenario                                                  | Use MCP    |
| --------------------------------------------------------- | ---------- |
| Unknown page structure — don't know what to query         | ✅         |
| Dynamic content / SPA — elements appear after interaction | ✅         |
| iframe / shadow DOM inspection                            | ✅         |
| Real-time interaction needed to reveal elements           | ✅         |
| Known elements — just need to verify a locator            | ❌ use CLI |

MCP sequence (defined in `inspect-ui`): `browser_navigate` → `browser_wait_for` →
`browser_snapshot`.

> ⚠️ `browser_snapshot` returns the full accessibility tree — expensive. Use targeted CLI
> recon first.

For each page in the test cases: snapshot, identify every element to interact with
(inputs, buttons, links, dropdowns, drawers, modals), collect the best locator per element
(primary + fallback) per `LOCATOR-STRATEGY-GUIDELINE.md`, and verify by attempting
interaction.

**Record in a Locator Collection table:**

| Page      | Element     | Action | Primary Locator       | Fallback Locator | Verified |
| --------- | ----------- | ------ | --------------------- | ---------------- | -------- |
| LoginPage | Email input | Type   | `getByLabel('Email')` | `#email`         | ✅       |

**Handle situations:**

| Situation                | Action                                                            |
| ------------------------ | ----------------------------------------------------------------- |
| URL blocked / VPN needed | Notify user                                                       |
| Login required           | Use existing fixture or ask user for credentials                  |
| Element not found        | Snapshot again → try another locator → notify user if DOM changed |
| CAPTCHA / 2FA            | Notify user — cannot automate                                     |
| Dynamic content / SPA    | `browser_wait_for` specific text before snapshot                  |

**NEVER guess selectors** — every locator verified on the real DOM before Step 3.

---

### Step 3: POM Design

1. **List Page classes** to create — one class per page/screen.

2. **Generate Page Object classes**, each with:
   - Locators declared at the top as `readonly` fields
   - Constructor accepting the `Page` instance
   - Action methods describing user behaviour — `applyFilter()`, not `clickButton()`
   - Data-read methods where a test needs to inspect rendered state

   Assertions do **not** belong here — they live in the spec (`CLAUDE.md` layering).

3. **Spec file organisation** (`CLAUDE.md`): the folder is the **feature**, the file is one
   coherent slice of it, and the test **type is a tag** — not a folder.

4. **Check the project structure** — place files correctly, no duplicates. Extend an
   existing Page Object rather than adding a near-duplicate.

---

### Step 4: Test Data Preparation

1. **Analyze test data** from the test cases:
   - Unique per run (email, username, code/ID) → generate, random + traceable
   - Fixed (URL, config) → read from env/config
   - Data-driven (multiple sets) → external JSON/YAML

2. **Generate test data** in the format defined in `TESTING-STANDARD.md` §6 (supports
   parallel runs):

   ```
   <prefix>_<testName>_<timestamp>_<random>
   Email:    auto_login_20260402_A3F2@test.com
   Username: auto_user_20260402_B7C1
   ```

3. **Data location:** constants live in the project's data layer (`lib/data/` here), not
   inline in a spec.

4. **Sensitive data** (credentials): read from env variables or fixture files.
   **DO NOT hardcode** in test code. **DO NOT read `.env` directly.**

---

### Step 5: Generate Automation Scripts

1. **Create test files** — the feature folder from Inputs, tagged with the agreed tags:

   ```
   Setup (Arrange):
   - Initialize page objects (via the project's fixtures)
   - Prepare test data (from Step 4)
   - Navigate; login via fixture if needed

   Execution (Act):
   - Execute steps per test case
   - Call methods from Page Objects only (no inline locators in tests)

   Verification (Assert):
   - Assert outcomes vs expected results from the TC
   - Clear assertion messages: "Expected dashboard header after login"
   ```

2. **Mandatory assertions:**
   - Each TC must have ≥1 assertion
   - Use soft assertions when checking multiple independent points
   - After create/archive/publish: reload or re-open the list before asserting — it may not
     auto-refresh
   - After create: search for the new item to verify it — bypasses pagination

3. **Code principles:** apply `TESTING-STANDARD.md` §3 (waits), §5 (assertions and their
   messages) and §6 (independence, data collisions, teardown), plus the layering and
   naming rules in `CLAUDE.md`. Those files are the source of truth — do not restate them
   here or in your output.

---

### Step 6: Execution & Auto-Heal

1. **Run tests:**

   ```bash
   npx playwright test <test_file> --headed
   ```

2. **Track results.**

   **If PASS:** run once more to confirm stability, update `task.md` (TC → ✅ PASS), remove
   debug logs and commented-out code.

   **If FAIL → classify the error type immediately:**

   | Error type                                                     | Cause                       | Action                                                |
   | -------------------------------------------------------------- | --------------------------- | ----------------------------------------------------- |
   | **Assertion mismatch** (`toHaveText`, `toEqual`, `toContain`…) | App returns wrong data/UI   | → **Bug flow** (§3 below)                             |
   | Element not found                                              | Automation — locator broken | `inspect-ui`: snapshot → `smart-locator`: new locator |
   | Click intercepted                                              | Automation — overlay timing | Wait for overlay → retry                              |
   | Timeout                                                        | Automation — slow load      | Wait on the right condition                           |
   | Navigation error                                               | Automation — URL/redirect   | Check URL, page load                                  |
   | Test data conflict                                             | Automation — duplicate data | `test-data`: new unique data                          |
   | Import/compile error                                           | Automation — code error     | Fix imports, class names                              |

   **Auto-heal loop for technical failures (max 5 rounds):**

   ```
   WHILE technical failure AND round ≤ 5:
     1. Fix code
     2. Re-run test
     3. Log to task.md: "Round N: Fixed [what] → [result]"
   If still failing after round 5 → Bug flow (§3)
   ```

   Never "fix" a failure with a sleep, a skip, a `test.fixme()`, or a loosened assertion.

3. **Bug flow:**

   **Trigger conditions:**
   - Assertion mismatch confirmed after a re-run with no code change → report immediately
   - Any failure still present after 5 auto-heal rounds → report

   **Before reporting — confirm it is an app bug:** re-run the test once WITHOUT any code
   change. If it still fails with the same assertion mismatch, it is an app bug, not flaky.

   **Bug report contents:**

   ```
   Summary:   <TC_ID>: <TC summary> — <assertion that failed>
   Priority:  based on TC priority (P1 → Critical, P2 → Major, P3 → Minor)

   ## Steps to Reproduce
   1. <pre-condition>
   2. <action steps from TC>

   ## Expected Result   <from the TC>
   ## Actual Result     <from the test output>
   ## Error             <exact assertion message + stack trace excerpt>

   ## Evidence
   - Screenshot at failure, trace.zip
   - TC ID, test file path, auto-heal rounds
   ```

   If a Jira/Xray integration is configured, file it there and record the key in `task.md`.
   Otherwise report it to the user. **Do not bend the test to match broken behaviour.**

4. **⚠️ Fix autonomously — DO NOT ask the user while fixing.** Ask only when:
   - Server/app inaccessible
   - Business rules conflict
   - Still failing after 5 rounds

5. **Verify stability** — the test must PASS **twice in a row**:

   ```bash
   npx playwright test <test_file> --repeat-each=2
   ```

---

### Step 7: Cleanup & Delivery

1. **Code cleanup** (mandatory before delivery):
   - [ ] Delete the `.recon.spec.ts` file — it must never reach source control
   - [ ] Delete any screenshots or traces you captured while debugging
   - [ ] Apply the delivery checklist in `TESTING-STANDARD.md` §8 (debug logging,
         commented-out code, unused variables / locators / imports)
   - [ ] Run the project's full gate — `npm run check`

2. **Update `task.md`** with final results:

   ```markdown
   ## Results

   | TC ID | Title            | Status  | Stability  | Notes            |
   | ----- | ---------------- | ------- | ---------- | ---------------- |
   | TC01  | Successful login | ✅ PASS | 2/2 stable | —                |
   | TC03  | Sign up          | ⚠️ SKIP | —          | CAPTCHA required |

   ## Files Created

   - lib/pages/login.page.ts
   - lib/data/login.data.ts
   - tests/<feature>/<slice>.spec.ts
   ```

3. **Report** to the user: totals (X PASS / Y FAIL / Z SKIP), files created/modified, known
   issues and limitations, and the Locator Collection table.

4. **Delete `task.md`** after the report is delivered — it is a temporary progress
   artifact and must not be committed.

5. **Hand off for review** — run `/review-test` on the generated specs before merging.

---

## Output

- **Page Object classes** — one file per page, locators verified from the DOM
- **Test classes** — complete automation scripts, stably PASS twice
- **Test data** — unique + traceable values where uniqueness is required
- **Locator Collection table** — all elements + primary/fallback locators
- **Results report** — PASS/FAIL/SKIP summary
- _(No `task.md` — deleted after delivery)_
