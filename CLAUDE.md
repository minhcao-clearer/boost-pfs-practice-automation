# CLAUDE.md — Boost PFS Demo Automation

Project-specific rules for this repository. Anyone (human or AI) adding or changing
tests here MUST follow them. These exist to keep a **live-site E2E suite** stable and
consistent — not to be creative. When in doubt, copy the pattern in
`tests/regression/filter.spec.ts`.

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
2. Create the spec as `*.spec.ts` under `tests/` (Playwright only discovers this
   suffix). Import `{ test, expect }` from `../../lib/fixtures` — **never** from
   `@playwright/test` directly (you would lose the `filterPage` fixture).
3. Navigate to the target page/collection and drive it into the state your scenario
   needs, then wait for a condition (e.g. `await filterPage.waitForProductsLoaded()`) —
   never a fixed sleep.
4. Read data via a Page Object method (e.g. `getProductData()`), then assert per item
   with a **descriptive message**: `expect(cond, "Product \"x\" ...").toBeTruthy()`.
5. Need a new selector or page action? Add a method to the Page Object — **not** the
   spec.

Every happy-path test needs at least one **negative-path** test for each plausible
failure mode (e.g. a filter expected to return zero products).

## Assertion logic — mirror Boost's semantics, don't tighten blindly

These matching rules are deliberate; they reflect how Boost actually behaves. Tightening
them produces false failures.

1. **Loose colour matching.** A product matches if a colour value `includes` the target,
   or is `"Multi Color"` — because Boost treats `"Teal Blue"`/`"Baby Blue"` as `"Blue"`.
   Do **not** change this to strict `===`.
2. **Price uses OVERLAP, not containment.** A product passes if its product-level
   `[priceMin, priceMax]` overlaps the band, because a product can have an in-band
   variant of another colour. Do **not** require the range to be fully contained.

## Hard rules (violations are review failures, not style nits)

- **NEVER use `page.waitForTimeout()`** or any fixed sleep. Wait for a condition (a
  locator visible, a web-first assertion).
- **ALWAYS `await`** every Playwright action and assertion.
- **Locator priority:** `getByRole` > `getByLabel`/`getByPlaceholder` > `getByText` >
  `getByTestId` > CSS/XPath (last resort). Boost's stable `.boost-sd__*` classes are an
  acceptable CSS fallback when no semantic locator exists.
- **Use web-first, auto-retrying assertions** (`await expect(locator).…`) for anything
  that depends on rendering (e.g. the `not.toHaveCount(0)` gate). Do not replace it with
  a one-shot read.
- **Every `test()` title and every `expect()` gets a descriptive message** naming the
  behaviour and the offending value — this is the first line of debugging.
- **Keep tests independent** — each navigates fresh; never rely on order or shared state.
- **Self-documenting code, minimal comments.** Narrate a flow with `test.step()` blocks
  rather than inline comments; let names carry the intent.
- **No `test.only` committed** (`forbidOnly` fails CI; ESLint `playwright/no-focused-test`
  also flags it).
- **`.spec.ts` under `tests/` only.** Group by type in subfolders (`regression/`, add
  `smoke/` etc. as needed).

## Environment & commands

- `BASE_URL` is required. Local: `cp .env.example .env` (already has a valid URL, no edit
  needed). CI: injected from a GitHub Actions secret. The config **throws fast** if it is
  missing.
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

Run the same gates CI runs, and they MUST pass:

```bash
npm run typecheck && npm run lint && npm run format:check && npm test
```

Stress new/changed specs for flakiness: `npx playwright test <file> --repeat-each=5`.
Apply Prettier + fix all ESLint findings. If you suppress an ESLint rule or use
`@ts-expect-error`, add a comment explaining WHY (see the `no-explicit-any` example in
`eslint.config.mjs`).

## Reject these anti-patterns

- ❌ CSS selector or `page.locator(...)` written inside a spec file.
- ❌ Hardcoded colour/price/URL in a spec instead of `lib/data`.
- ❌ `page.waitForTimeout(...)` / fixed sleeps.
- ❌ Importing `test` from `@playwright/test` in a spec (must be `../../lib/fixtures`).
- ❌ Assertions with no message.
- ❌ A new happy-path test with no negative-path counterpart.
- ❌ Bumping `retries` to mask a flaky test — fix the root cause instead.
