# CLAUDE.md — Boost PFS Demo Automation

Project-specific rules for this repository. Anyone (human or AI) adding or changing
tests here MUST follow them. These exist to keep a **live-site E2E suite** stable and
consistent — not to be creative. When in doubt, copy the pattern in
`tests/filter/color-price.spec.ts`.

## Base discipline — read this first

This repo follows the portable, project-agnostic engine in
[`TESTING-STANDARD.md`](TESTING-STANDARD.md) (how to write good E2E tests, in any
project). **This file adds THIS project's specifics and overrides; where the two differ,
this file wins.** The AI agents in `.claude/agents/` read both.

## What this project is

Playwright + TypeScript **E2E test framework** for the Boost Commerce product-filtering
system, run against the public Shopify demo storefront
(`https://boost-pfs-demo.myshopify.com`). It is a **QA safety net**, not a shipped
product — everything is a dev dependency.

Stack: Playwright `^1.59`, TypeScript `^5.9` (strict), **Node 20 (pinned)**, ESLint 9,
Prettier.

## The golden rule (never break this)

> **Tests describe WHAT to check. `lib/` knows HOW.**

A spec must read like a scenario. It MUST NOT contain raw CSS selectors, hardcoded URLs,
or hardcoded data values. Everything mechanical lives under `lib/`.

## Where code goes (respect the layering)

| Layer        | Folder         | Put here                                                         | NEVER put here                     |
| ------------ | -------------- | ---------------------------------------------------------------- | ---------------------------------- |
| **Data**     | `lib/data`     | Constant inputs (`FILTER_DATA`), routes (`ROUTES`), URL builders | Assertions, selectors, page logic  |
| **Pages**    | `lib/pages`    | Selectors + page actions + data reads (Page Objects)             | `expect()`/assertions, test data   |
| **Fixtures** | `lib/fixtures` | Wiring that injects Page Objects into tests                      | Business logic, assertions         |
| **Types**    | `lib/types`    | Shared TypeScript interfaces (e.g. `ProductData`)                | Runtime code                       |
| **Tests**    | `tests/`       | Scenario + `expect` assertions                                   | Raw selectors, hardcoded URLs/data |

A selector belongs in **exactly one** place: the Page Object. If Boost's markup changes,
only `lib/pages/*.ts` should change.

## Scope — is this even an E2E test?

Push coverage **down the test pyramid**: write a browser (E2E) test only when the
browser interaction itself is what matters. If a rule can be proven by a unit or
integration test, it does **not** belong here. Every test here is slow and depends on a
live third-party site — earn each one; do not add E2E tests for logic a cheaper test
could cover.

## Adding a new test — the ONLY accepted pattern

Follow **data → navigate → wait → read → assert**:

1. New input (colour, price, route)? Add it to `lib/data/` — **never** a magic string
   in the spec.
2. Create the spec as `*.spec.ts` under the folder for its **feature**
   (`tests/filter/`, add `tests/search/` etc. as needed), and mark its type with a
   **tag** — `{ tag: ["@smoke", "@regression"] }`. Import `{ test, expect }` from
   `../../lib/fixtures` — **never** from `@playwright/test` directly (you would lose
   the `filterPage` fixture).
3. Navigate to the target page/collection and drive it into the state your scenario
   needs, then wait for a condition (e.g. `await filterPage.waitForProductsLoaded()`) —
   never a fixed sleep.
4. Read data via a Page Object method (e.g. `getProductData()`), then assert per item
   with a **descriptive message**: `expect(cond, "Product \"x\" ...").toBeTruthy()`.
5. Need a new selector or page action? Add a method to the Page Object — **not** the
   spec.

A happy-path test **should usually** have a **negative-path** counterpart for a plausible
failure mode (e.g. a filter expected to return zero products) — a strong recommendation,
applied with judgment, not a hard requirement.

## Assertion logic — mirror Boost's semantics, don't tighten blindly

These matching rules are deliberate; they reflect how Boost actually behaves. Tightening
them produces false failures.

1. **Loose colour matching.** A product matches if a colour value `includes` the target,
   or is `"Multi Color"` — because Boost treats `"Teal Blue"`/`"Baby Blue"` as `"Blue"`.
   Do **not** change this to strict `===`.
2. **Price uses OVERLAP, not containment.** A product passes if its product-level
   `[priceMin, priceMax]` overlaps the band, because a product can have an in-band
   variant of another colour. Do **not** require the range to be fully contained.

## Hard rules — project reinforcements

The universal hard rules — no fixed sleeps, always `await`, locator priority, web-first
auto-retrying assertions, descriptive messages, independent tests, no `test.only` — live
in [`TESTING-STANDARD.md`](TESTING-STANDARD.md) and apply here **in full**. This project
additionally pins:

- **Import `{ test, expect }` from `../../lib/fixtures`**, never from `@playwright/test`
  — you would lose the `filterPage` fixture.
- **Locator fallback:** Boost's stable `.boost-sd__*` classes are an acceptable CSS
  fallback when no semantic locator exists.
- **Self-documenting code, minimal comments.** Narrate a flow with `test.step()` blocks
  rather than inline comments; let names carry the intent.
- **`.spec.ts` under `tests/` only, and folders group by _functionality_** — the feature
  under test (`tests/filter/`, later `tests/search/`, `tests/cart/`), **not** by page and
  **not** by test type. A page is an implementation detail: when Boost moves filtering
  from a sidebar into a modal, the feature is unchanged and the tests should not have to
  move. A file holds one coherent slice of that feature (`color-price.spec.ts`).
- **Test type is a _tag_, not a folder** — `test("…", { tag: ["@smoke", "@regression"] },
…)`, selected with `npx playwright test --grep @smoke`. A test is often both; a folder
  would force you to pick one and duplicate the file.
- `forbidOnly` is set for when CI runs; ESLint `playwright/no-focused-test` also flags a
  stray `test.only`.
- **Naming:** Page Object `PascalCase` + `Page` suffix (`FilterPage` in
  `filter.page.ts`); spec files `kebab-case.spec.ts`; locator fields `lowerCamelCase`
  and `readonly`.
- **Test IDs:** when a test corresponds to a Jira/Xray ticket, prefix its title with the
  real ID — `test("TC-1234: a filtered collection shows only matching products")`. **Never
  invent a placeholder ID** for a test that has no ticket; a descriptive title alone is
  correct until the ticket exists.
- **UI debugging uses a desktop viewport, 1920×1080** — so what you inspect matches what
  the suite drives.

## Environment & commands

- `BASE_URL` is required. Local: `cp .env.example .env` (already has a valid URL, no edit
  needed). The config **throws fast** if it is missing. CI does not need it — the E2E
  suite runs locally only (CI is the quality gate: typecheck/lint/format).
- Use **Node 20** (`nvm use`). Newer Node runs but warns (`EBADENGINE`).
- Setup once: `npm install` then `npx playwright install`.

| Command                                       | Purpose                                      |
| --------------------------------------------- | -------------------------------------------- |
| `npm test`                                    | Run the suite (headless)                     |
| `npm run test:ui`                             | UI mode — preferred for developing/debugging |
| `npm run test:debug`                          | Playwright Inspector                         |
| `npm run report`                              | Open last HTML report                        |
| `npm run typecheck` / `lint` / `format:check` | The three CI quality gates                   |

## Before you call a change done

Run every gate, and they MUST pass:

```bash
npm run check
```

(That is `typecheck` + `lint` + `format:check` + `test`. CI runs the first three;
the E2E suite runs only here, so **this local run is the real safety net**.)

Stress new/changed specs for flakiness: `npx playwright test <file> --repeat-each=5`.
Apply Prettier + fix all ESLint findings. If you suppress an ESLint rule or use
`@ts-expect-error`, add a comment explaining WHY (see the `no-explicit-any` example in
`eslint.config.mjs`).

## Reject these anti-patterns

- ❌ CSS selector or `page.locator(...)` written inside a spec file.
- ❌ Hardcoded colour/price/URL in a spec instead of `lib/data`.
- ❌ `page.waitForTimeout(...)` / a fixed sleep to wait for state — except a bounded,
  `eslint-disable`-justified pause when no condition exists.
- ❌ Importing `test` from `@playwright/test` in a spec (must be `../../lib/fixtures`).
- ❌ Assertions with no message.
- ❌ Bumping `retries` to mask a flaky test — fix the root cause instead.
