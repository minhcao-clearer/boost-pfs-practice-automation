# TESTING-STANDARD.md — Universal E2E Testing Discipline

**Portable and project-agnostic.** This is the _engine_: how to write good end-to-end
tests, independent of any domain, app, or business. Drop this file — together with the
`.claude/` agents — into any project. Each project's `CLAUDE.md` adds its own specifics
and **wins on conflict**.

> **Scope is unconstrained.** Any interaction (clicks, typing, forms, keyboard,
> navigation, upload, dialogs, network/API, visual/state) and any domain are fair game.
> This standard governs **how** you write tests, never **what** you test.

## 1. Golden rule

Tests describe **WHAT** to check; an abstraction layer (Page Objects / helpers) knows
**HOW**. A spec reads like a scenario — no raw selectors, no hardcoded URLs, no hardcoded
data values in it.

## 2. Layering

- A selector lives in **exactly one** place — a **Page Object** (the recommended
  default; the underlying principle is _isolate selectors and mechanics from specs into
  one reusable place_, so patterns like component objects are fine as long as they honour
  it). A markup change then touches one file, not every test.
- Constant inputs (data, routes) live in a **data layer**.
- Wire objects via **fixtures / dependency injection**; import `test`/`expect` from the
  project's fixture entry point when it has one, not the raw framework.

## 3. Stability — wait on conditions, never the clock

- **Never sleep to wait for state.** Use a **condition** — a locator, a web-first
  assertion, `waitForResponse` — never `waitForTimeout` / a fixed sleep. Playwright's own
  docs call time-based waits _"inherently flaky"_. This covers **hand-rolled** sleeps too
  (`await new Promise(r => setTimeout(r, n))`), which are the same thing in disguise.
- **Debounce / throttle: wait on the _effect_** (the network call or the updated result),
  not the clock.
- **Escape hatch — all three, or it's a violation:** a fixed pause is allowed only when
  (1) there is genuinely **no observable signal**, (2) it is **minimal and bounded**, and
  (3) it is left in via an explicit
  `// eslint-disable-next-line playwright/no-wait-for-timeout -- <why no condition works>`
  — so lint blocks every undocumented sleep and every real one is greppable and reviewed.
  Deliberate pacing / rate-limiting belongs in a **helper or backoff**, not a raw sleep in
  a spec.
- **Always `await`** every action and assertion.
- Use **auto-retrying web-first assertions** (`await expect(locator)…`) for anything that
  depends on rendering, instead of a one-shot read.

## 4. Locators — best-first

Prefer **semantic** locators — role, label/placeholder, text — and treat a **test-id** as
an explicit, stable contract. Order these **by situation, not dogma**: a test-id may rank
_above_ text when the text is dynamic or localized, and _below_ it when a human-visible
label is the more meaningful, stable anchor. Fall back to stable CSS, and XPath only as a
last resort; avoid index/position-based locators and DevTools-copied absolute paths.

**Never guess a locator.** Read it off the **real DOM** and verify it there before
committing it — do not infer one from a feature name, and do not copy one from older code
without re-checking. A wrong locator does not announce itself: it matches nothing, and the
test dies in a timeout far from the real cause.
Follow the project's own locator guideline when it has one.

## 5. Clarity

- Descriptive test titles.
- **Every test ends with at least one assertion** — a test that only performs actions
  proves nothing. Assert at meaningful intermediate steps too.
- Every assertion carries a **message** naming the behaviour and the offending value —
  the first line of debugging.

## 6. Independence & coverage

- **Order-independent (firm).** A test depends only on its **own setup and the system
  under test** — never on another test, execution order, or leftover data. It must pass
  **alone, in any order, in parallel, and on retry**. Lean on Playwright's per-test
  isolation and keep `fullyParallel` on: running in parallel is what _surfaces_ hidden
  coupling.
- **No leaked _mutable_ state.** One test's writes must not affect another. Against a
  shared backend, use **unique data per run** or **cleanup in teardown** — data
  collisions are the top real-world independence killer. Generate anything that must be
  unique (emails, usernames, codes) rather than hardcoding it, and make it **traceable**
  back to the test that created it, e.g.
  `<prefix>_<testName>_<timestamp>_<random>` → `auto_createCustomer_20260402_A3F2`. Then
  a stray record in the system names its own origin. Deliberate, safe sharing is fine
  and often better: reused auth (`storageState`), worker-scoped fixtures for expensive
  resources, read-only seed data. A genuine sequential journey may use
  `test.describe.serial` as a conscious, small **scoped island** (a failure cascades),
  never a lazy default.
- **Reuse an artifact, not a test.** Need a record to edit or delete? Create it in
  **setup (API / fixture)**, don't make one test depend on another having run. CRUD
  create / edit / delete are **independent capabilities**, each verified on its own and
  owning its cleanup.
- No `test.only` committed.
- Think beyond the happy path: a happy-path scenario usually **deserves** a **negative /
  edge-case** counterpart — a strong recommendation, applied with judgment, not a hard
  gate.

## 7. Fidelity — mirror the app's real behaviour

Assertions must reflect how the app **actually** behaves. Don't over-tighten (false
failures) and don't over-loosen (missed bugs). When a matching rule is deliberately loose
or strict, it is mirroring the product — don't "fix" it blindly.

## 8. Verify; fix root causes

Before calling a change done, run the project's quality gates and the tests, and stress
new/changed specs for flakiness (repeat runs). A failure gets a **root-cause fix** —
never mask it with a sleep, a skip/`fixme`, or a loosened/deleted assertion. **A
green-but-wrong test is worse than a red one.**

Then clean up before handing the work over: no leftover debug logging, no commented-out
code (keep comments that _explain_), no unused variables, locators, or imports. Debug
scaffolding that ships is noise every future reader has to decode.

## 9. Reject these anti-patterns

- A selector or `page.locator(...)` inside a spec.
- A hardcoded value / URL in a spec instead of the data layer.
- `waitForTimeout` / a fixed sleep to wait for state (without a justified, commented
  `eslint-disable`); a missing `await`.
- Importing `test` from the raw framework instead of the project's fixture entry point.
- An assertion with no message.
- Bumping `retries` (or skipping) to mask a flaky/failing test instead of fixing the
  cause.

---

_Domain-specific rules, data, selectors, and semantics live in each project's
`CLAUDE.md`, not here._
