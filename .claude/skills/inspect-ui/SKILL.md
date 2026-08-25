---
name: inspect-ui
description: Open the real page in a browser and read its DOM — to find or verify a locator, understand a page's structure before writing a Page Object, or work out why an element was not found, was intercepted, or timed out. Use whenever a question can be settled by looking at the live page instead of guessing.
---

# Inspect UI

Playwright MCP is configured for this repo, so you can open the actual page rather than
reason about it. Use that: `TESTING-STANDARD.md` §4 says never guess a locator, and this
is how you avoid it.

The viewport is already pinned to 1920×1080 in [`.mcp.json`](../../../.mcp.json) — no
resize call needed.

## Snapshot or screenshot?

|                           | `browser_snapshot`                     | `browser_take_screenshot`        |
| ------------------------- | -------------------------------------- | -------------------------------- |
| Returns                   | Accessibility tree, with `ref` handles | An image                         |
| Use for                   | **Analysis and locators** — start here | Visual evidence, layout problems |
| Can you interact from it? | Yes, via `ref`                         | No                               |

Default to snapshot. Reach for a screenshot when the question is visual (something
overlaps, looks wrong, renders oddly) or when you need evidence for a report.

## Working through a page

1. `browser_navigate` to the page — but **don't re-navigate if you are already there**, a
   reload throws away the state you just built up.
2. `browser_wait_for` a signal that the content has arrived, then `browser_snapshot`.
3. From the tree, note each element's **role, accessible name, label, placeholder,
   test-id**, its nesting, and its state (visible / enabled / checked / expanded).
4. Choose locators by the priority in
   [`LOCATOR-STRATEGY-GUIDELINE.md`](../../../LOCATOR-STRATEGY-GUIDELINE.md), then run its
   verification routine against the page you have open. Don't restate its rules — apply
   them.

If the page needs a login, use the project's existing fixture or ask for credentials.
**Never read `.env` directly.**

## Situations that mislead people

| Situation              | What to do                                                                                                                                        |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Modal / dialog**     | It appears in the snapshot as an overlay; interact via its refs. Let the open animation finish first.                                             |
| **Iframe**             | Often absent from the snapshot. Read into it with `browser_evaluate`, and locate it in tests with `page.frameLocator(...)`.                       |
| **Shadow DOM**         | Playwright locators pierce it; the snapshot may not show it, so verify by interacting rather than by reading.                                     |
| **Lazy / SPA content** | Wait for specific text before snapshotting; scroll first if it loads on scroll. An empty-looking tree usually means "too early", not "not there". |
| **Repeated rows**      | Locate by content, not position: `getByRole('row').filter({ hasText: 'X' }).getByRole('button', { name: 'Edit' })`.                               |
| **Click intercepted**  | Something is on top — a toast, a spinner, a sticky header. Find it in the tree and wait for it to go, rather than forcing the click.              |

## Debugging a failing test

Read the failure first, then reproduce it on the live page:

- **Element not found** → snapshot and look: did the markup change, or is the test looking
  too early? Those need different fixes.
- **Timeout** → check whether the thing ever appears at all. If it does, the wait is on the
  wrong condition.
- **Intercepted** → see the overlay row above.
- **Assertion mismatch** → the locator worked and the value was wrong. That may be a real
  product bug; say so instead of adjusting the test until it passes.

## Output

State what you observed, then what follows from it: locators (primary, fallback, and how
each was verified), or the root cause and the fix. Selectors belong in a **Page Object** —
never in a spec.
