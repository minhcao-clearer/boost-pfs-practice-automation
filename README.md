# Boost Commerce — UI Automation Test Framework

End-to-End (E2E) test framework for the [Boost Commerce](https://boostcommerce.net/)
product-filtering system, built with **[Playwright](https://playwright.dev/) +
TypeScript**.

This README is written to onboard developers who are **new to Playwright**. It
explains not just _how_ to run things, but _why_ the project is structured the
way it is. Read it top to bottom the first time; use the table of contents after
that.

---

## Table of contents

1. [What this project does](#1-what-this-project-does)
2. [Tech stack](#2-tech-stack)
3. [Prerequisites](#3-prerequisites)
4. [Quick start](#4-quick-start)
5. [Project structure](#5-project-structure)
6. [Core concepts (Playwright 101)](#6-core-concepts-playwright-101)
7. [How the current test works](#7-how-the-current-test-works)
8. [Running tests](#8-running-tests)
9. [Writing a new test (tutorial)](#9-writing-a-new-test-tutorial)
10. [Configuration reference](#10-configuration-reference)
11. [Environment variables & secrets](#11-environment-variables--secrets)
12. [Code quality: lint, format, type-check](#12-code-quality-lint-format-type-check)
13. [Continuous Integration (CI)](#13-continuous-integration-ci)
14. [Debugging & troubleshooting](#14-debugging--troubleshooting)
15. [Conventions & best practices](#15-conventions--best-practices)
16. [Known constraints](#16-known-constraints)
17. [Glossary](#17-glossary)
18. [Useful links](#18-useful-links)

---

## 1. What this project does

**Boost Commerce** is a Shopify app that adds **product filtering & search** to an
online store: shoppers narrow a product listing (a "collection") by colour, price,
size, brand, and so on. When a shopper ticks _Colour = Blue_ and drags the price
slider to _10–100_, the storefront should show **only** products that actually
have a Blue variant priced in that range.

This project **automates a real browser** to prove that promise holds. It:

1. Opens the public Boost demo storefront (`boost-pfs-demo.myshopify.com`).
2. Applies a colour + price filter.
3. Reads every product the store returns.
4. Asserts each one genuinely matches the filter — and fails loudly (with the
   offending product's handle) if any does not.

In other words, it is a **QA safety net** for Boost's filtering logic, expressed
as code that can run automatically on every change.

Today there is **one test** ([`tests/regression/filter.spec.ts`](tests/regression/filter.spec.ts))
that demonstrates the full pattern. Everything else in the repo (Page Objects,
fixtures, data files, CI) is the reusable scaffolding so the team can add many
more tests the same way, quickly and consistently.

> New to Shopify/Boost vocabulary (collection, handle, variant…)? See the
> [Glossary](#17-glossary).

---

## 2. Tech stack

| Tool                                | Version     | Purpose                                               | Docs                                                       |
| ----------------------------------- | ----------- | ----------------------------------------------------- | ---------------------------------------------------------- |
| **Playwright** (`@playwright/test`) | ^1.59       | Browser automation + test runner + assertions         | [playwright.dev](https://playwright.dev/docs/intro)        |
| **TypeScript**                      | ^5.9        | Typed test code; catches mistakes before they run     | [typescriptlang.org](https://www.typescriptlang.org/docs/) |
| **Node.js**                         | 20 (pinned) | JavaScript runtime that executes everything           | [nodejs.org](https://nodejs.org/)                          |
| **ESLint**                          | ^9          | Static analysis / linting (finds bugs & bad patterns) | [eslint.org](https://eslint.org/)                          |
| **Prettier**                        | ^3          | Automatic, opinionated code formatting                | [prettier.io](https://prettier.io/)                        |
| **dotenv**                          | ^17         | Loads environment variables from `.env` locally       | [npm](https://www.npmjs.com/package/dotenv)                |
| **GitHub Actions**                  | —           | CI: runs quality checks + tests on every push/PR      | [docs](https://docs.github.com/actions)                    |

All of these are **dev dependencies** — nothing ships to production; this repo
only _tests_ a product, it isn't the product.

---

## 3. Prerequisites

You need three things installed on your machine. If you're starting from a fresh
laptop, install them in this order.

### 3.1 Git

Used to download (clone) the code.

- **macOS:** `git` usually comes with Xcode Command Line Tools. If missing, run
  `xcode-select --install`, or install from https://git-scm.com/download/mac.
- **Windows:** install from https://git-scm.com/download/win (this also gives you
  "Git Bash", a Unix-like terminal — handy, see the Windows notes below).
- **Linux:** `sudo apt install git` (Debian/Ubuntu) or your distro's equivalent.

Check: `git --version`.

### 3.2 Node.js 20

This project runs on **Node.js version 20** (pinned in [`.nvmrc`](.nvmrc) and
enforced by the `engines` field in `package.json`). Two ways to install it:

- **Simplest — official installer:** download the **Node 20 LTS** installer from
  https://nodejs.org and run it. This also installs `npm`.
- **Recommended if you'll juggle Node versions — `nvm`:** a version manager that
  lets you switch Node versions per project.
  - macOS / Linux: install [nvm](https://github.com/nvm-sh/nvm), then run
    `nvm install 20 && nvm use` in the project root.
  - Windows: install [nvm-windows](https://github.com/coreybutler/nvm-windows),
    then run `nvm install 20 && nvm use 20`.

Check: `node -v` should print `v20.x`, and `npm -v` should print a version.
`npm` ships with Node, so you don't install it separately.

### 3.3 What you do NOT need

> **No Shopify account, no VPN, no login, no API key.** The tests hit a **public**
> demo storefront over the internet — a working internet connection is the only
> runtime requirement. Roughly **1–2 GB of free disk** is needed for the browser
> binaries Playwright downloads in step 3 of the Quick start.

Any editor works; **VS Code** is recommended (see the Prettier-on-save tip in
[section 12](#12-code-quality-lint-format-type-check)).

---

## 4. Quick start

From a cloned repo to a passing test. Run these in a terminal.

> **First, complete [section 3](#3-prerequisites).** These steps assume **git**
> and **Node.js 20** are already installed. If `node -v` does not print `v20.x`,
> stop and do section 3 first — step 2 (`npm install`) will fail with
> `command not found: npm` on a machine without Node.

```bash
# 0. Download the code and enter the folder
git clone https://github.com/apphubdev/boost-pfs-demo-automation.git
cd boost-pfs-demo-automation

# 1. Select Node 20
#    - With nvm:        nvm use            (reads .nvmrc)
#    - Without nvm:     make sure `node -v` already prints v20.x (see section 3.2)
nvm use

# 2. Install project dependencies
npm install

# 3. Install the browsers Playwright drives (Chromium, etc.)
npx playwright install --with-deps

# 4. Create your local env file (see section 11)
cp .env.example .env

# 5. Run the tests
npm test
```

### Windows notes

If you're on Windows using **PowerShell** or **CMD** (not Git Bash), two commands
differ:

- `nvm use` → use `nvm use 20` (nvm-windows needs the explicit version).
- `cp .env.example .env` → use `copy .env.example .env` (CMD) or
  `Copy-Item .env.example .env` (PowerShell).

Everything else is identical. (Using **Git Bash** on Windows lets you run the
macOS/Linux commands as-is.)

### What a successful run looks like

After step 5 you should see something like:

```
Running 1 test using 1 worker

  ✓  1 [chromium] › tests/regression/filter.spec.ts:17:5 › Filter validation: a colour + price filtered collection shows only matching products (4.4s)

  1 passed (6s)
```

A green `✓` and `1 passed` means everything works. Common first-run errors:

| You see…                                       | It means…                        | Fix                                              |
| ---------------------------------------------- | -------------------------------- | ------------------------------------------------ |
| `BASE_URL is not set`                          | No `.env` file                   | Do step 4 (`cp .env.example .env`)               |
| `browserType.launch: Executable doesn't exist` | Browsers not installed           | Do step 3 (`npx playwright install --with-deps`) |
| `command not found: npm`                       | Node not installed / wrong shell | Revisit [section 3.2](#32-nodejs-20)             |

---

## 5. Project structure

```
boost-pfs-demo-automation/
├── .github/workflows/playwright.yml   # CI pipeline (quality + test jobs)
├── lib/                               # Reusable test infrastructure
│   ├── data/                          # Test data & URL builders (no logic)
│   │   ├── filter.data.ts             #   Filter inputs (colour, price)
│   │   └── urls.ts                    #   Routes + filtered-URL builder
│   ├── fixtures/
│   │   └── index.ts                   # Custom Playwright fixtures (DI for Page Objects)
│   ├── pages/
│   │   └── filter.page.ts             # Page Object for the collection/filter page
│   └── types/
│       └── product.types.ts           # Shared TypeScript types
├── tests/
│   └── regression/
│       └── filter.spec.ts             # The actual test(s)
├── .env.example                       # Template for local env vars
├── .editorconfig                      # Editor defaults (indent, charset…)
├── .gitattributes                     # Normalize line endings to LF
├── .gitignore                         # Files git should ignore (.env, reports…)
├── .nvmrc                             # Pinned Node version (20)
├── eslint.config.mjs                  # ESLint (flat config)
├── .prettierrc.json                   # Prettier formatting rules
├── playwright.config.ts               # Playwright configuration
├── tsconfig.json                      # TypeScript compiler options
├── package.json                       # Scripts + dependencies
└── package-lock.json                  # Locked dependency versions
```

### 5.1 The `lib/` layers (why they're separate)

The golden rule: **tests describe _what_ to check; `lib/` knows _how_.**

| Layer        | Folder         | Responsibility                                           | Must NOT contain              |
| ------------ | -------------- | -------------------------------------------------------- | ----------------------------- |
| **Data**     | `lib/data`     | Constant inputs (colours, prices) and URL construction   | Assertions, page logic        |
| **Pages**    | `lib/pages`    | How to talk to a page: locators + actions + reading data | Assertions, test data         |
| **Fixtures** | `lib/fixtures` | Wiring: hand ready-to-use Page Objects to tests          | Business logic                |
| **Types**    | `lib/types`    | Shared TypeScript interfaces                             | Runtime code                  |
| **Tests**    | `tests/`       | The scenario + assertions (`expect`)                     | Raw selectors, hardcoded URLs |

Keeping these separate means a selector change touches **one** file
(`filter.page.ts`), not every test.

### 5.2 File-by-file reference

Every source file, what it holds, and when you'd edit it.

#### `lib/data/filter.data.ts`

The filter inputs the test uses, as one frozen object.

```ts
export const FILTER_DATA = {
  COLOR: { BLUE: "Blue" },
  PRICE: { MIN: "10", MAX: "100" },
} as const;
```

- **Exports:** `FILTER_DATA`.
- **Edit when:** you want the test(s) to filter by a different colour or price.

#### `lib/data/urls.ts`

Route constants and the helper that turns a filter into a Boost URL.

- **Exports:** `ROUTES` (collection paths) and `buildFilteredCollectionUrl(collectionPath, color, minPrice, maxPrice)`, which returns e.g. `/collections/vertical-layout?color=Blue&price=10:100`.
- **Edit when:** you add a new collection route, or need to encode more filter parameters into the URL.

#### `lib/types/product.types.ts`

Shared TypeScript shapes.

```ts
export interface ProductData {
  handle: string; // the product's URL slug, e.g. "blue-mesh-mix-dress"
  colors: string[]; // colour option values, e.g. ["Teal Blue", "Black"]
  priceMin: number; // lowest variant price on the product
  priceMax: number; // highest variant price on the product
}
```

- **Exports:** `ProductData`.
- **Edit when:** you read additional fields from a product card and need to type them.

#### `lib/fixtures/index.ts`

Extends Playwright's `test` with our own **fixtures** and re-exports `expect`.

- **Exports:** `test` (our extended version, which knows about `filterPage`) and `expect`.
- **Why tests import from here** instead of `@playwright/test`: so `filterPage` is available for free (see [section 6.4](#64-fixtures-dependency-injection)).
- **Edit when:** you add another Page Object and want it injected into tests.

#### `lib/pages/filter.page.ts`

The **Page Object** for the collection page — the only file that knows the page's
CSS selectors.

- **Exports:** the `FilterPage` class:
  - `filteredProducts` — a locator for all product cards (`.boost-sd__product-item`).
  - `waitForProductsLoaded()` — waits until the grid has rendered.
  - `getProductData()` — scrapes each card's `data-product` attribute into `ProductData[]`.
- **Edit when:** Boost changes its markup, or a test needs a new page action/read.

#### `tests/regression/filter.spec.ts`

The actual test(s). See [section 7](#7-how-the-current-test-works) for a full
walkthrough.

- **Edit when:** you add or change a test scenario.
- **Folder convention:** `tests/regression/` holds regression checks. Add more
  folders (e.g. `tests/smoke/`) as suites grow; Playwright picks up any
  `*.spec.ts` under `tests/` (see `testDir` in the config).

#### Config files (root)

| File                                 | What it configures                                                                            |
| ------------------------------------ | --------------------------------------------------------------------------------------------- |
| `playwright.config.ts`               | Test runner: timeouts, retries, browsers, artifacts, baseURL — see [§10](#playwrightconfigts) |
| `tsconfig.json`                      | TypeScript compiler / type-checking rules — see [§10](#tsconfigjson)                          |
| `eslint.config.mjs`                  | Lint rules (flat config) — see [§10](#eslintconfigmjs--prettierrcjson)                        |
| `.prettierrc.json`                   | Formatting rules (quotes, width…)                                                             |
| `.editorconfig`                      | Baseline editor settings (indent, charset, final newline)                                     |
| `.nvmrc`                             | Node version (`20`) for `nvm` and CI                                                          |
| `.gitattributes`                     | Forces LF line endings so Windows/macOS diffs stay clean                                      |
| `.gitignore`                         | Keeps `.env`, `node_modules`, reports, etc. out of git                                        |
| `.env.example`                       | Template listing the env vars you need locally                                                |
| `package.json` / `package-lock.json` | Scripts, dependencies, and their exact locked versions                                        |

---

## 6. Core concepts (Playwright 101)

If you've never used Playwright, read this section once — the rest of the README
assumes these ideas.

### 6.1 A test, an assertion, a locator

```ts
import { test, expect } from "../../lib/fixtures";

test("my test name", async ({ page }) => {
  await page.goto("/some-path"); // navigate
  const heading = page.locator("h1"); // a "locator" = a lazy handle to element(s)
  await expect(heading).toHaveText("Hello"); // an assertion (auto-retries)
});
```

- **`test(name, fn)`** — declares one test. The `fn` is `async` and receives
  fixtures (like `page`) via the `{ ... }` argument.
- **`async` / `await`** — browser actions are asynchronous; you `await` each one so
  it finishes before the next line runs. Forgetting `await` is the #1 beginner bug.
- **`page`** — the browser tab. Provided automatically to every test.
- **Locator** — a _description_ of an element (e.g. `.boost-sd__product-item`).
  It is lazy: nothing happens until you act on it or assert against it.
- **`expect(...)`** — an assertion. Playwright's web-first assertions
  **auto-retry** until they pass or time out, which removes most flakiness.

### 6.2 Auto-waiting (don't use `sleep`)

Playwright automatically waits for elements to be actionable before clicking, and
for assertions to become true. **Never** add fixed `waitForTimeout(3000)` sleeps —
they're slow when unnecessary and flaky when the app is slower than your guess.
Wait for a **condition** instead (a locator becoming visible, an assertion
passing).

### 6.3 Page Object Model (POM)

Instead of scattering CSS selectors across tests, we put them in a class. Our
[`FilterPage`](lib/pages/filter.page.ts):

```ts
export class FilterPage {
  readonly filteredProducts: Locator;
  constructor(page: Page) {
    this.filteredProducts = page.locator(".boost-sd__product-item");
  }
  async getProductData(): Promise<ProductData[]> {
    /* reads each product card */
  }
}
```

Benefit: if Boost renames that CSS class, we fix it in one place, and every test
keeps working.

### 6.4 Fixtures (dependency injection)

A **fixture** provides a ready-made object to a test. We extend Playwright's
`test` so every test can just ask for `filterPage`
([`lib/fixtures/index.ts`](lib/fixtures/index.ts)):

```ts
export const test = base.extend<{ filterPage: FilterPage }>({
  filterPage: async ({ page }, use) => {
    await use(new FilterPage(page));
  },
});
```

That's why tests import `{ test, expect }` from `../../lib/fixtures` instead of
from `@playwright/test` directly — our version already knows about `filterPage`,
so a test signature can be `async ({ page, filterPage }) => { ... }`.

### 6.5 Data-driven inputs

Test inputs live in [`lib/data/filter.data.ts`](lib/data/filter.data.ts):

```ts
export const FILTER_DATA = {
  COLOR: { BLUE: "Blue" },
  PRICE: { MIN: "10", MAX: "100" },
} as const;
```

Tests reference `FILTER_DATA.COLOR.BLUE` instead of a magic string. Change the
data in one place to re-target the test.

### 6.6 The key design decision: filter via URL, not UI clicks

This is the most important thing to understand about this project.

Boost's demo storefront renders its filter controls in **two different layouts**
(a vertical sidebar of colour swatches, or horizontal collapsible dropdowns), and
the shared demo **switches between them unpredictably**. Clicking a colour swatch
therefore works one day and hangs the next (the control is hidden inside a closed
dropdown).

Boost also accepts filters as **URL query parameters** and applies them on page
load. So instead of clicking, we navigate straight to a pre-filtered URL:

```
/collections/vertical-layout?color=Blue&price=10:100
```

This is **layout-agnostic and deterministic** — it doesn't care which filter UI
is rendered. That URL is built by
[`buildFilteredCollectionUrl`](lib/data/urls.ts). This is a standard technique for
keeping E2E tests stable against a third-party UI you don't control.

---

## 7. How the current test works

File: [`tests/regression/filter.spec.ts`](tests/regression/filter.spec.ts). Here
is the whole test, annotated:

```ts
import { test, expect } from "../../lib/fixtures"; // our extended test + expect
import { ROUTES, buildFilteredCollectionUrl } from "../../lib/data/urls";
import { FILTER_DATA } from "../../lib/data/filter.data";

// A product passes the price filter when its price range OVERLAPS the band —
// Boost shows a product if ANY variant is in range, not only when the whole
// range is contained. (Kept at module scope so the test body has no branching.)
const priceRangeOverlaps = (
  productMin: number,
  productMax: number,
  bandMin: number,
  bandMax: number,
) => productMin <= bandMax && productMax >= bandMin;

test("Filter validation: a colour + price filtered collection shows only matching products", async ({
  page,
  filterPage,
}) => {
  const minPrice = Number(FILTER_DATA.PRICE.MIN);
  const maxPrice = Number(FILTER_DATA.PRICE.MAX);

  // 1. Navigate to a URL that already carries the colour + price filter.
  await page.goto(
    buildFilteredCollectionUrl(
      ROUTES.COLLECTION_ALL_VERTICAL_LAYOUT,
      FILTER_DATA.COLOR.BLUE,
      FILTER_DATA.PRICE.MIN,
      FILTER_DATA.PRICE.MAX,
    ),
    { waitUntil: "domcontentloaded" },
  );

  // 2. Boost renders the grid asynchronously — wait for the first card.
  await filterPage.waitForProductsLoaded();

  // 3. The filter must return at least one product.
  await expect(filterPage.filteredProducts).not.toHaveCount(0);

  // 4. Read every product card into typed data.
  const productData = await filterPage.getProductData();

  // 5. Every product shown must match BOTH the colour and the price filter.
  for (const { handle, colors, priceMin, priceMax } of productData) {
    const matchesColor =
      colors.some((color) => color.includes(FILTER_DATA.COLOR.BLUE)) ||
      colors.includes("Multi Color");
    expect(
      matchesColor,
      `Product "${handle}" offers no ${FILTER_DATA.COLOR.BLUE} colour (has: ${colors.join(", ")})`,
    ).toBeTruthy();

    const overlapsPriceBand = priceRangeOverlaps(
      priceMin,
      priceMax,
      minPrice,
      maxPrice,
    );
    expect(
      overlapsPriceBand,
      `Product "${handle}" price range [${priceMin}, ${priceMax}] does not overlap [${minPrice}, ${maxPrice}]`,
    ).toBeTruthy();
  }
});
```

Two subtleties worth understanding:

- **Colour matching is intentionally loose.** Boost treats `Teal Blue` / `Baby
Blue` as matching "Blue", and `Multi Color` matches every colour — so we mirror
  that with `includes(...)` + a `Multi Color` allowance. A strict equality check
  would wrongly fail on those products.
- **Price uses overlap, not containment.** A product can have a $50 Blue variant
  and a $150 Red variant. Boost rightly shows it under a 10–100 filter (the Blue
  one qualifies), and its product-level range is `[50, 150]`. Requiring the whole
  range inside `[10, 100]` would wrongly fail it, so we assert **overlap**.

Because every assertion carries a message, a failure names the exact product and
values, e.g. `Product "x" offers no Blue colour (has: Black, Red)`.

---

## 8. Running tests

| Command               | What it does                                             | When to use               |
| --------------------- | -------------------------------------------------------- | ------------------------- |
| `npm test`            | Run all tests headless                                   | Default; before pushing   |
| `npm run test:ui`     | Open Playwright **UI mode** (time-travel, watch, re-run) | Best way to develop/debug |
| `npm run test:headed` | Run with a visible browser window                        | See what the browser does |
| `npm run test:debug`  | Run with the Playwright Inspector (step through)         | Pause and inspect         |
| `npm run report`      | Open the HTML report of the **last** run                 | Investigate a failure     |

Useful raw Playwright flags (via `npx playwright test ...`):

```bash
npx playwright test filter.spec.ts              # one file
npx playwright test filter.spec.ts:17           # the test at line 17
npx playwright test -g "Filter validation"      # tests matching a title substring
npx playwright test --headed --workers=1        # serial, visible
npx playwright test --repeat-each=5             # run 5x to check for flakiness
npx playwright test --trace on                  # force-record a trace even on pass
```

### Reading results

- **Terminal** shows a pass/fail list (the `list` reporter).
- **HTML report** (`npm run report`) shows every step per test, and — on failure —
  the **trace**, **screenshot**, and **video** (these are configured to appear
  only on failure/retry; see [§10](#playwrightconfigts)).
- **Trace viewer** — from the report, open a failed test's trace to "time-travel"
  through every action with before/after DOM snapshots, network, and console. To
  open a saved trace file directly:
  ```bash
  npx playwright show-trace path/to/trace.zip
  ```
  This is the single most useful debugging tool in Playwright — learn it early.

---

## 9. Writing a new test (tutorial)

Let's add a second test that filters by a different colour. The pattern is always
the same: **data → URL → navigate → read → assert.**

**Step 1 — add the data** you need in [`lib/data/filter.data.ts`](lib/data/filter.data.ts):

```ts
export const FILTER_DATA = {
  COLOR: { BLUE: "Blue", BLACK: "Black" }, // <- added Black
  PRICE: { MIN: "10", MAX: "100" },
} as const;
```

**Step 2 — write the test.** If you add it to the **existing**
`tests/regression/filter.spec.ts`, the imports are already at the top of the file.
If you create a **new** file (e.g. `tests/regression/filter-black.spec.ts`), start
with these imports — this is a complete, runnable file:

```ts
import { test, expect } from "../../lib/fixtures";
import { ROUTES, buildFilteredCollectionUrl } from "../../lib/data/urls";
import { FILTER_DATA } from "../../lib/data/filter.data";

test("Filter validation: Black-filtered collection shows only black products", async ({
  page,
  filterPage,
}) => {
  await page.goto(
    buildFilteredCollectionUrl(
      ROUTES.COLLECTION_ALL_VERTICAL_LAYOUT,
      FILTER_DATA.COLOR.BLACK,
      FILTER_DATA.PRICE.MIN,
      FILTER_DATA.PRICE.MAX,
    ),
    { waitUntil: "domcontentloaded" },
  );
  await filterPage.waitForProductsLoaded();

  const products = await filterPage.getProductData();
  for (const { handle, colors } of products) {
    const matches =
      colors.some((c) => c.includes(FILTER_DATA.COLOR.BLACK)) ||
      colors.includes("Multi Color");
    expect(matches, `Product "${handle}" is not black`).toBeTruthy();
  }
});
```

**Step 3 — need a new selector or action?** Add it to the Page Object, not the
test. Example — reading each product's title:

```ts
// in lib/pages/filter.page.ts, inside the FilterPage class
async getProductTitles(): Promise<string[]> {
  return this.filteredProducts.evaluateAll((cards) =>
    cards.map(
      (c) => c.querySelector(".boost-sd__product-title")?.textContent ?? "",
    ),
  );
}
```

**Step 4 — run it** with `npm run test:ui` while developing (fast feedback), then
`npm test` before pushing, and finally the quality gates
([§12](#12-code-quality-lint-format-type-check)).

**Golden rules when adding tests**

- **File name:** `*.spec.ts` under `tests/` (Playwright only picks up `.spec.ts`).
- No raw CSS selectors in a test file — put them in the Page Object.
- No hardcoded strings/URLs — put them in `lib/data`.
- No `waitForTimeout` sleeps — use locators/assertions that wait for a condition.
- One behaviour per `test(...)`; keep the title descriptive (it shows in reports).

---

## 10. Configuration reference

### `playwright.config.ts`

The most relevant settings ([full file](playwright.config.ts)):

| Setting         | Value                   | Why                                                                               |
| --------------- | ----------------------- | --------------------------------------------------------------------------------- |
| `timeout`       | `60_000` (60s per test) | E2E hits a live site; CI runners are slower                                       |
| `globalTimeout` | `10 min`                | Hard cap for the whole run                                                        |
| `retries`       | `2` on CI, `0` locally  | Absorb transient CI flakiness; fail fast locally                                  |
| `workers`       | `1` on CI, auto locally | Serial on CI for stability; parallel locally                                      |
| `fullyParallel` | `true`                  | Files/tests can run in parallel                                                   |
| `forbidOnly`    | `true` on CI            | Fails the build if someone leaves a `test.only`                                   |
| `baseURL`       | `process.env.BASE_URL`  | Lets tests use relative paths like `/collections/...`                             |
| `trace`         | `on-first-retry`        | Record a trace only when a test retries (keeps runs fast)                         |
| `screenshot`    | `only-on-failure`       | Screenshots only when useful                                                      |
| `video`         | `retain-on-failure`     | Videos only when useful                                                           |
| `reporter`      | `html` + `list`         | HTML report on disk + live list in the terminal                                   |
| `projects`      | `chromium`              | Which browser(s) to run; Firefox/WebKit/mobile are commented out, ready to enable |

Two things happen **before** the config object:

1. **`dotenv` loads `.env`** (with `quiet: true` so it prints no promo noise).
2. **An env guard** throws `BASE_URL is not set` immediately if the variable is
   missing — a clear failure instead of a cryptic "invalid URL" mid-test.

### `tsconfig.json`

TypeScript compiler options (used only for `npm run typecheck` — Playwright
transpiles the TS itself, hence `noEmit: true`). Notable options:

| Option                                  | Effect                                                             |
| --------------------------------------- | ------------------------------------------------------------------ |
| `strict`                                | Turns on all strict type checks (null-safety, etc.)                |
| `noUnusedLocals` / `noUnusedParameters` | Errors on dead variables/params                                    |
| `noImplicitOverride`                    | Requires `override` keyword when overriding                        |
| `noFallthroughCasesInSwitch`            | Catches missing `break` in `switch`                                |
| `target` / `lib`                        | Compile to `ES2022`; include DOM types for `evaluateAll` callbacks |
| `module` / `moduleResolution`           | `ESNext` / `Bundler` — modern import resolution                    |
| `isolatedModules`                       | Each file transpiles independently (matches Playwright)            |
| `skipLibCheck`                          | Don't type-check `node_modules` (faster)                           |

### `eslint.config.mjs` / `.prettierrc.json`

- **ESLint** (flat config) layers: JS recommended → TypeScript recommended →
  Playwright recommended (scoped to `tests/`) → a project tweak
  (`no-explicit-any` as a warning) → `eslint-config-prettier` last (turns off
  formatting rules so ESLint and Prettier don't fight).
- **Prettier** owns formatting: `semi: true`, `singleQuote: false` (double
  quotes), `trailingComma: "all"`, `printWidth: 80`.

---

## 11. Environment variables & secrets

The project needs one variable:

| Variable   | Meaning                                                          |
| ---------- | ---------------------------------------------------------------- |
| `BASE_URL` | Storefront base URL, e.g. `https://boost-pfs-demo.myshopify.com` |

**Locally**, it's read from a `.env` file (which is **gitignored** — never
committed). Create it from the template:

```bash
cp .env.example .env
```

**In CI**, there is no `.env` file — `BASE_URL` is injected from a **GitHub
Actions repository secret**. Create it once per repo:

1. On GitHub, open the repository → **Settings**.
2. In the left sidebar: **Secrets and variables → Actions**.
3. Open the **Secrets** tab → click **New repository secret**.
4. **Name:** `BASE_URL` (exact case — it must match `secrets.BASE_URL` in the
   workflow file).
5. **Value:** `https://boost-pfs-demo.myshopify.com`
6. Click **Add secret**.

The next CI run picks it up automatically. If the secret is missing, the `test`
job fails fast with `BASE_URL is not set`.

> Note: `BASE_URL` here is a public URL, so it isn't truly sensitive — it's stored
> as a secret to demonstrate the pattern. For genuinely non-secret config, GitHub
> **Variables** (`vars.*`) are the more correct choice.

---

## 12. Code quality: lint, format, type-check

Run these before pushing (CI enforces all three):

```bash
npm run typecheck     # tsc --noEmit: type errors
npm run lint          # eslint: code issues
npm run format:check  # prettier: formatting drift
```

To auto-fix:

```bash
npm run lint:fix      # fix lint issues where possible
npm run format        # reformat every file
```

**Full script list** (`package.json`):

| Script         | Command                    | Purpose                   |
| -------------- | -------------------------- | ------------------------- |
| `test`         | `playwright test`          | Run the suite             |
| `test:ui`      | `playwright test --ui`     | UI / watch mode           |
| `test:headed`  | `playwright test --headed` | Visible browser           |
| `test:debug`   | `playwright test --debug`  | Inspector / step-through  |
| `report`       | `playwright show-report`   | Open the last HTML report |
| `typecheck`    | `tsc --noEmit`             | Type-check only           |
| `lint`         | `eslint .`                 | Lint                      |
| `lint:fix`     | `eslint . --fix`           | Lint + auto-fix           |
| `format`       | `prettier --write .`       | Reformat                  |
| `format:check` | `prettier --check .`       | Verify formatting         |

> **Tip:** enable "Format on Save" with the Prettier extension in your editor so
> `format:check` never surprises you in CI.

---

## 13. Continuous Integration (CI)

Defined in [`.github/workflows/playwright.yml`](.github/workflows/playwright.yml).
It runs on every push and PR to `main`/`master`, as **two jobs**:

| Job         | Steps                                 | Speed | Purpose                               |
| ----------- | ------------------------------------- | ----- | ------------------------------------- |
| **quality** | `typecheck` + `lint` + `format:check` | ~20s  | Fast, deterministic code-quality gate |
| **test**    | install browsers + `playwright test`  | ~1–3m | The actual E2E run                    |

Both jobs use Node from [`.nvmrc`](.nvmrc) with npm caching. They run
**independently**, so a flaky live-site E2E never hides a real lint/type error.
The `test` job needs the `BASE_URL` secret (section 11).

### Setting up CI in a new / forked repository

CI is already wired up — the workflow file is part of the repo, so pushing to
`main`/`master` (or opening a PR) triggers it automatically. There is **one manual
step**: add the `BASE_URL` secret (see
[section 11](#11-environment-variables--secrets)). Without it, the very first
`test` run fails with `BASE_URL is not set` while the `quality` job still passes.

To manually run or re-run the pipeline: repo **Actions** tab → open a run →
**Re-run jobs** (or **Re-run failed jobs**).

> **Recommended:** protect `main` (repo **Settings → Branches → Add rule**) to
> require the `quality` and `test` checks to pass before a PR can merge.

### When CI fails

1. Open the failed run on GitHub → click the failed job to read logs.
2. Download the **`playwright-report`** artifact attached to the run.
3. Unzip and open it locally (or drag `trace.zip` into
   [trace.playwright.dev](https://trace.playwright.dev)) to inspect the
   trace/screenshot/video of the failed test.

---

## 14. Debugging & troubleshooting

| Symptom                                        | Likely cause / fix                                                                                      |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `BASE_URL is not set`                          | You didn't `cp .env.example .env` (local) or the CI secret is missing                                   |
| `Cannot navigate to invalid URL`               | `baseURL` empty → same as above                                                                         |
| Test hangs then times out                      | A locator never became visible; check the selector still exists on the live site (open it in a browser) |
| `browserType.launch: Executable doesn't exist` | Run `npx playwright install --with-deps`                                                                |
| Flaky pass/fail                                | Never rely on `waitForTimeout`; assert a real condition. Reproduce with `--repeat-each=5`               |
| Zero products returned                         | The live demo store's data changed — see [Known constraints](#16-known-constraints)                     |
| `test.only` fails CI                           | You left a `.only` in the code; remove it (`forbidOnly` blocks it on CI)                                |

**Best debugging tools:**

- `npm run test:ui` — watch mode with time-travel; the fastest feedback loop.
- `npm run test:debug` — step through with the Inspector.
- The **trace** in the HTML report — replay a failed CI run action by action.

---

## 15. Conventions & best practices

- **Locators belong in Page Objects**, not tests.
- **Data belongs in `lib/data`**, not tests.
- **Prefer role/text locators** (`getByRole`, `getByText`) over brittle CSS when
  the markup allows; fall back to stable class names (like Boost's
  `.boost-sd__*`) otherwise.
- **Use web-first assertions** (`await expect(locator).toHaveText(...)`) — they
  auto-retry. Avoid asserting on a value you read once.
- **No fixed sleeps.** Wait for conditions.
- **Descriptive test titles** and **assertion messages** — they are your first
  line of debugging.
- **Keep tests independent** — each test navigates fresh; don't rely on order.
- **Always `await`** async calls (Playwright actions and assertions are async).
- **Run `typecheck`, `lint`, `format:check` before every push.**

---

## 16. Known constraints

- **The tests target a live, shared, third-party demo store.** Its data
  (products, prices, colours) and even its filter-UI layout can change without
  notice. The current test is written **relatively** ("every product shown must
  match the filter"), so it tolerates data changes and only fails if Boost
  genuinely returns a wrong product.
- **Chromium only** by default. Firefox/WebKit/mobile projects are present but
  commented out in the config — enable them when needed.
- For a fully **deterministic** suite you would mock Boost's API responses with
  Playwright's [`page.route()`](https://playwright.dev/docs/mock) and assert
  against fixed fixtures, or point the tests at a store instance you control.
  That's a deliberate future step, not wired up today.

---

## 17. Glossary

### Playwright / testing terms

| Term                  | Meaning                                                              |
| --------------------- | -------------------------------------------------------------------- |
| **E2E**               | End-to-end: drives a real browser like a user would                  |
| **Locator**           | A lazy, auto-waiting reference to element(s) on the page             |
| **Assertion**         | `expect(...)`; a check that (for web-first assertions) auto-retries  |
| **Page Object (POM)** | A class holding a page's locators + actions                          |
| **Fixture**           | An object Playwright injects into a test (e.g. `page`, `filterPage`) |
| **Trace**             | A recording of a test run you can replay action-by-action            |
| **Flaky**             | A test that passes/fails inconsistently without code changes         |
| **Headless / headed** | Browser runs invisibly / with a visible window                       |
| **Worker**            | A parallel process Playwright uses to run tests concurrently         |

### Shopify / Boost terms

| Term               | Meaning                                                                    |
| ------------------ | -------------------------------------------------------------------------- |
| **Storefront**     | The public shopping website customers browse                               |
| **Collection**     | A group/listing of products (e.g. "vertical-layout"); what we filter       |
| **Product**        | An item for sale; may come in several variants                             |
| **Variant**        | A specific version of a product (e.g. _Blue / M_) with its own price/stock |
| **Handle**         | A product's URL-safe slug, e.g. `blue-mesh-mix-dress`                      |
| **SKU**            | Stock Keeping Unit — a variant's inventory code                            |
| **Swatch**         | The little colour square in the filter UI                                  |
| **`data-product`** | HTML attribute on each Boost product card holding its JSON data            |
| **Facet / filter** | A criterion shoppers filter by (colour, price, size…)                      |

---

## 18. Useful links

**Playwright**

- Getting started: https://playwright.dev/docs/intro
- Writing tests: https://playwright.dev/docs/writing-tests
- Locators guide: https://playwright.dev/docs/locators
- Assertions: https://playwright.dev/docs/test-assertions
- Trace viewer: https://playwright.dev/docs/trace-viewer
- Best practices: https://playwright.dev/docs/best-practices

**This project**

- Repository: https://github.com/apphubdev/boost-pfs-demo-automation
- Boost Commerce: https://boostcommerce.net/
