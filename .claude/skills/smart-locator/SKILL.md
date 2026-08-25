---
name: smart-locator
description: Produce a stable, verified locator for a UI element — inspect the real DOM, pick the best-first strategy, prove uniqueness, and offer a fallback. Use when adding a selector to a Page Object or when an existing locator looks fragile.
---

# Smart Locator

Produce a locator that is **stable** — one that keeps matching the right element after the
UI is refactored (an extra wrapper `div`, a renamed class, a changed layout), not merely
one that matches today.

## Read first

- [`LOCATOR-STRATEGY-GUIDELINE.md`](../../../LOCATOR-STRATEGY-GUIDELINE.md) — the priority
  order, the two conditions a locator must meet, and the verification routine. **That file
  is the single source of truth; do not restate its rules here or in your answer.**
- The project's `CLAUDE.md` for any local locator fallback it allows.

## How to work

1. **Open the real page and inspect the DOM. Never guess.**
   Playwright MCP is configured for this repo, so `browser_navigate` then
   `browser_snapshot` gives you the live accessibility tree. Do not infer a locator from a
   feature name, and do not copy one from older code without re-checking it.
2. **Pick by priority**, per the guideline — semantic first, test-id as an explicit
   contract, stable CSS below that, XPath last.
3. **Prove it**: run the guideline's verification routine (matches exactly one element; it
   is the element the user acts on; survives a reload; holds across loading / loaded /
   empty states). A locator that has not been checked against the DOM is not finished.
4. **Offer a fallback** when the primary depends on something that could reasonably
   change, and say what would break it.

## Output

For each element:

| Element | Primary | Fallback | Verified how |
| ------- | ------- | -------- | ------------ |

Then state where it belongs: a selector lives in a **Page Object**, never in a spec.
