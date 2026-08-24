# Boost Commerce — Product-Filtering E2E Tests

End-to-End (E2E) test framework for the [Boost Commerce](https://boostcommerce.net/)
product-filtering system, built with **[Playwright](https://playwright.dev/) +
TypeScript**. It drives a real browser against the public demo storefront
(`boost-pfs-demo.myshopify.com`) and asserts that a filtered collection returns
**only** products that genuinely match the filter — a **QA safety net**, not a
shipped product.

> **New here?** This README is the map: how to run things and where everything
> lives. The deeper material is split by purpose so each fact has **one** home:
>
> | If you want to…                  | Read                                                                    |
> | -------------------------------- | ----------------------------------------------------------------------- |
> | Learn Playwright from scratch    | [`docs/learn-playwright.md`](docs/learn-playwright.md) (beginner guide) |
> | Know the rules for writing tests | [`CLAUDE.md`](CLAUDE.md)                                                |
> | Choose a locator                 | [`LOCATOR-STRATEGY-GUIDELINE.md`](LOCATOR-STRATEGY-GUIDELINE.md)        |

---

## Contents

1. [What this project does](#1-what-this-project-does)
2. [Quick start](#2-quick-start)
3. [Project structure](#3-project-structure)
4. [Commands](#4-commands)
5. [Adding a test](#5-adding-a-test)
6. [Quality gates](#6-quality-gates)
7. [Troubleshooting](#7-troubleshooting)
8. [Known constraints](#8-known-constraints)

---

## 1. What this project does

Boost Commerce adds **product filtering & search** to a Shopify store: a shopper
narrows a collection by colour, price, size, etc. When they pick _Colour = Blue_
and price _10–100_, the storefront must show **only** products with a Blue variant
in that range.

This project proves that promise holds, automatically. The one reference test
([`tests/filter/color-price.spec.ts`](tests/filter/color-price.spec.ts)):

1. Opens a pre-filtered collection URL on the demo storefront.
2. Reads every product the store returns.
3. Asserts each one matches the colour **and** price filter — failing loudly with
   the offending product's handle if not.

Everything under `lib/` is the reusable scaffolding so the team can add more tests
the same way, quickly and consistently. See
[`docs/learn-playwright.md`](docs/learn-playwright.md) for a line-by-line
walkthrough of that test.

---

## 2. Quick start

**Prerequisites:** Git, and **Node.js 20** (pinned in [`.nvmrc`](.nvmrc); the
`engines` field enforces `>=20 <21`). No Shopify account, VPN, or API key — the
tests hit a **public** demo store, so an internet connection is the only runtime
requirement (~1–2 GB free disk for the browser binaries).

```bash
# 1. Select Node 20  (with nvm; otherwise ensure `node -v` prints v20.x)
nvm use

# 2. Install dependencies and the browser Playwright drives
npm install
npx playwright install

# 3. Create your local env file (sets BASE_URL — the config throws without it)
cp .env.example .env

# 4. Run the tests
npm test
```

A successful run prints a green `✓` and `1 passed`. Common first-run errors and
fixes are in [Troubleshooting](#7-troubleshooting).

> **Windows (PowerShell/CMD):** use `nvm use 20`, and `copy .env.example .env`
> (CMD) or `Copy-Item .env.example .env` (PowerShell). Git Bash runs the commands
> above as-is.

---

## 3. Project structure

```
boost-pfs-practice-automation/
├── .github/workflows/ci.yml # CI: quality gate (typecheck/lint/format)
├── lib/                          # Reusable test infrastructure (the "how")
│   ├── data/                     #   Constant inputs + URL builders (no logic)
│   │   ├── filter.data.ts        #     Filter inputs (colour, price)
│   │   └── urls.ts               #     Routes + filtered-URL builder
│   ├── fixtures/index.ts         #   Injects Page Objects into tests
│   ├── pages/filter.page.ts      #   Page Object: the ONLY file with selectors
│   └── types/product.types.ts    #   Shared TypeScript types
├── tests/
│   └── filter/color-price.spec.ts # Reference test — folders group by feature
├── docs/
│   └── learn-playwright.md        # Beginner Playwright guide + test walkthrough
├── CLAUDE.md                      # Rules for adding/changing tests (read first)
├── LOCATOR-STRATEGY-GUIDELINE.md  # How to choose a locator
├── playwright.config.ts           # Test runner config (timeouts, baseURL, …)
├── eslint.config.mjs              # Lint rules (flat config)
├── tsconfig.json                  # TypeScript (strict) options
├── .mcp.json                      # Playwright MCP for AI-assisted DOM inspection
├── .env.example                   # Template for BASE_URL (copy to .env)
├── .nvmrc / .editorconfig         # Node version / editor defaults
├── .prettierrc.json               # Formatting rules
└── package.json                   # Scripts + dependencies
```

**The layering rule** (enforced by [`CLAUDE.md`](CLAUDE.md)): _tests describe
**what** to check; `lib/` knows **how**._ A selector lives in exactly one place —
the Page Object — so a Boost markup change touches one file, not every test.

| Layer        | Folder         | Holds                                 | Never holds                   |
| ------------ | -------------- | ------------------------------------- | ----------------------------- |
| **Data**     | `lib/data`     | Constant inputs, routes, URL builders | Assertions, selectors         |
| **Pages**    | `lib/pages`    | Selectors + page actions + data reads | Assertions, test data         |
| **Fixtures** | `lib/fixtures` | Wiring that injects Page Objects      | Business logic                |
| **Types**    | `lib/types`    | Shared TypeScript interfaces          | Runtime code                  |
| **Tests**    | `tests/`       | Scenario + `expect` assertions        | Raw selectors, hardcoded URLs |

---

## 4. Commands

| Command               | What it does                                   |
| --------------------- | ---------------------------------------------- |
| `npm test`            | Run all tests headless                         |
| `npm run test:ui`     | Playwright **UI mode** (best for developing)   |
| `npm run test:headed` | Run with a visible browser                     |
| `npm run test:debug`  | Step through with the Playwright Inspector     |
| `npm run report`      | Open the HTML report of the last run           |
| `npm run typecheck`   | `tsc --noEmit` — type errors                   |
| `npm run lint`        | ESLint — code issues (`lint:fix` to auto-fix)  |
| `npm run format`      | Prettier — reformat (`format:check` to verify) |
| `npm run check`       | **All gates at once** — run before pushing     |

Useful raw flags: `npx playwright test tests/filter` (one feature),
`--grep @smoke` (by tag), `-g "Filter validation"` (by title),
`--repeat-each=5` (flake check).

---

## 5. Adding a test

Follow the pattern **data → navigate → wait → read → assert**, and obey
[`CLAUDE.md`](CLAUDE.md). In short:

1. New input (colour, price, route)? Add it to `lib/data/` — never a magic string
   in the spec.
2. Create `*.spec.ts` under the folder for its **feature** (`tests/filter/`, add
   `tests/search/` etc. as needed) — not by page, not by test type. Mark the type
   with a **tag** instead: `{ tag: ["@smoke", "@regression"] }`. Import
   `{ test, expect }` from `../../lib/fixtures` (not `@playwright/test` — you'd
   lose the `filterPage` fixture).
3. Navigate, then **wait for a condition** (`waitForProductsLoaded()`) — never a
   fixed sleep.
4. Read via a Page Object method, then assert per item with a **descriptive
   message**.
5. Need a new selector or action? Add a method to the **Page Object**, not the
   spec.

A happy-path test should usually have a **negative-path** counterpart (e.g. a filter
that should return zero products) — a strong recommendation, not a hard rule. A full,
annotated tutorial is in
[`docs/learn-playwright.md`](docs/learn-playwright.md#4-viết-một-test-mới).

---

## 6. Quality gates

One command runs everything a reviewer expects — type-check, lint, formatting and
the E2E suite. **Run it before every push:**

```bash
npm run check
```

Stress a new/changed spec for flakiness with
`npx playwright test <file> --repeat-each=5`.

### Continuous Integration

[`.github/workflows/ci.yml`](.github/workflows/ci.yml) runs on every
push to `main`/`master` or a `pw-practice-**` branch (and on PRs to `main`/`master`), as
one **quality** job: `typecheck` + `lint` + `format:check`. It is fast, deterministic,
and needs no setup or secrets.

**The E2E suite deliberately does not run in CI.** It drives a shared, live third-party
storefront, so running it on every push would be slow and put needless load on that
store. **Running `npm test` locally before you push is the safety net** — see the gate
command above.

---

## 7. Troubleshooting

| You see…                                       | Cause / fix                                                    |
| ---------------------------------------------- | -------------------------------------------------------------- |
| `BASE_URL is not set`                          | No `.env` — run `cp .env.example .env`                         |
| `browserType.launch: Executable doesn't exist` | Browsers missing — run `npx playwright install`                |
| `command not found: npm`                       | Node not installed / wrong shell — install Node 20             |
| Test hangs then times out                      | A selector no longer matches the live site — open it and check |
| Flaky pass/fail                                | Never use `waitForTimeout`; reproduce with `--repeat-each=5`   |
| Zero products returned                         | The live demo store's data changed — see below                 |

Best debugging tools: `npm run test:ui` (time-travel watch mode) and the **trace**
in the HTML report (`npm run report`).

---

## 8. Known constraints

- **Live, shared, third-party store.** Its data and even its filter-UI layout can
  change without notice. The test is written **relatively** ("every product shown
  must match the filter") so it tolerates data changes and fails only on a genuine
  Boost bug. This is also why we filter **via URL, not UI clicks** — see the
  explanation in [`docs/learn-playwright.md`](docs/learn-playwright.md).
- **Chromium only** by default; Firefox/WebKit/mobile projects are present but
  commented out in `playwright.config.ts`.
- For a fully **deterministic** suite you would mock Boost's API with
  [`page.route()`](https://playwright.dev/docs/mock) — a deliberate future step.

---

**Useful links:** [Playwright docs](https://playwright.dev/docs/intro) ·
[Locators](https://playwright.dev/docs/locators) ·
[Trace viewer](https://playwright.dev/docs/trace-viewer) ·
[Best practices](https://playwright.dev/docs/best-practices)
