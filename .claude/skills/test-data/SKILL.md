---
name: test-data
description: Generate test data for a scenario — unique, traceable, and covering positive, negative, boundary and edge cases. Use when a test needs input it must create rather than read, or when deciding what values a scenario should be exercised with.
---

# Test Data

Data that lets tests run in parallel, twice in a row, without colliding — and that names
its own origin when it turns up in a system later.

## Read first

- [`TESTING-STANDARD.md`](../../../TESTING-STANDARD.md) §6 — the unique/traceable rule
  this skill implements.
- The project's `CLAUDE.md` and its data layer (`lib/data/` here) for where constants live
  and how they are named.

## Two kinds of value — decide which you are producing

| Kind                                                          | Example                         | Where it goes                                                |
| ------------------------------------------------------------- | ------------------------------- | ------------------------------------------------------------ |
| **Fixed input** — the scenario is about this exact value      | a colour, a price band, a route | The data layer, as a named constant. Never inline in a spec. |
| **Generated input** — must differ per run to avoid collisions | email, username, order code     | Generated at run time, traceable back to the test            |

Getting this wrong is the common mistake: hardcoding something that must be unique (two
runs collide), or randomising something the assertion depends on (the test can no longer
state what it expects).

## Generated values: unique and traceable

```
<prefix>_<testName>_<timestamp>_<random>
auto_createCustomer_20260402_A3F2          → username
auto_createCustomer_20260402_A3F2@test.com → email
```

Traceable matters as much as unique: when a stray record shows up, its name says which
test made it. Each test gets its own values so parallel runs cannot clash. If the test
creates something, it also cleans it up — see `TESTING-STANDARD.md` §6.

**Never** put real personal data in test data.

## What values to exercise

Cover these deliberately rather than by habit:

- **Positive** — valid, within constraints, the shape the feature is built for.
- **Negative** — missing required fields, wrong format, values that should be rejected.
  Pair each with the **error the app should show**, so the test asserts the behaviour and
  not merely a failure.
- **Boundary** — min, max, min+1, max−1, empty vs null, zero, negative.
- **Edge** — unicode and accents, very long strings, leading/trailing whitespace, markup
  or quote characters in free-text fields.

Respect what the field actually accepts — read its validation from the real DOM rather
than assuming a limit.

## Output

Group by category so the intent is visible, and give each negative case its expected
outcome:

```json
{
  "positive": [{ "email": "auto_signup_20260402_A3F2@test.com" }],
  "negative": [{ "email": "", "expectedError": "Email is required" }],
  "boundary": [{ "email": "a@b.co", "note": "shortest accepted" }]
}
```
