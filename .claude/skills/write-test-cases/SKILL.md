---
name: write-test-cases
description: Turn a requirement into structured manual test cases, grouped positive / negative / edge, with a coverage summary. Use when someone pastes a feature description, user story, BA document, design file or ticket and wants test cases or a QC checklist written — including "write test cases for this".
---

# Write Test Cases

Produce test cases a person can execute and a reviewer can check for gaps. This is the
step before automation: the cases written here are what
[`new-test`](../../commands/new-test.md) later turns into code.

## Step 1 — Know what you were given

| Input                | What to pull out                                              |
| -------------------- | ------------------------------------------------------------- |
| Requirement / BA doc | Functional requirements, acceptance criteria                  |
| Design (image / PDF) | UI elements, interactions, validation, empty and error states |
| User story           | "As a / I want / So that" plus its acceptance criteria        |
| Ticket description   | Scope, requirements, listed ACs                               |
| Several of the above | Cross-reference them, and flag anything that disagrees        |

If you were given nothing concrete, ask for one of these before writing anything.

Also ask which **feature** these cases belong to — the same feature name the tests will
later be filed under. Don't invent it; see `CLAUDE.md`.

## Step 2 — Analyse before you write

Always output this first. Its real job is to surface what the requirement does **not**
say, while that is still cheap to fix.

```
### Requirement analysis
- Feature:
- Source(s):
- Key functionality:
- Ambiguities / missing information:   ← undefined states, unspecified error text, missing limits
- Assumptions taken to proceed:
```

When sources disagree, list every conflict before writing cases:

| #   | Area | Source A says | Source B says | Impact | Suggested resolution |
| --- | ---- | ------------- | ------------- | ------ | -------------------- |

Then ask whether to proceed on a stated assumption or wait for clarification. Silently
picking one reading is how a whole suite ends up testing the wrong behaviour.

## Step 3 — Write the cases

One table per case:

| Field               | Value                                                                                       |
| ------------------- | ------------------------------------------------------------------------------------------- |
| **ID**              | `TC-[FEATURE]-001` — sequential within the feature                                          |
| **Summary**         | What this case proves                                                                       |
| **Preconditions**   | State or data required before the first step                                                |
| **Steps**           | Numbered, each one an action a person can take                                              |
| **Data**            | The input used — valid, invalid, or boundary                                                |
| **Expected result** | Observable outcome, specific enough to disagree with                                        |
| **Priority**        | High (core flow, data integrity) · Medium (secondary, common errors) · Low (cosmetic, rare) |
| **Type**            | Positive / Negative / Edge                                                                  |

> The `TC-…` id numbers **this document**. It is not a Jira/Xray ticket key — don't paste
> it into an automated test title as if it were one (`CLAUDE.md`, Test IDs).

Group the output under three headings:

- **Positive** — valid input, the happy path the feature exists for.
- **Negative** — invalid input, error handling, unauthorised access. Each one states the
  error the user should see, not merely "it fails".
- **Edge** — boundaries (min, max, ±1), empty and full states, unicode and long values,
  concurrent or repeated actions.

## Step 4 — Summarise the coverage

| Group                                  | Count |
| -------------------------------------- | ----- |
| Positive / Negative / Edge / **Total** |       |

Then two lines that matter more than the counts: **critical flows covered**, and **what
you deliberately left out** — so a reviewer can argue with the scope rather than guess it.

## Step 5 — Xray CSV export (only if asked)

Columns: `Id | Test type | Summary | Description | Action | Data | Expected Result | Test Repo Path`

- **One row per step** — a 4-step case is 4 rows.
- **First row of a case** carries `Id` (plain number), `Test type` = `Manual`, `Summary`,
  `Description` (prefixed `Precondition:`) and `Test Repo Path` (`Feature/Subfeature`).
- **Later rows** repeat only the `Id`; the rest stay blank.
- UTF-8, comma-delimited, named `TC_[feature]_xray.csv`.
