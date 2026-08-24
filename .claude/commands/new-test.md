---
description: Author a new end-to-end test (obeys this project's CLAUDE.md + universal discipline)
---

Use the **test-author** agent to author a new test. It first reads this project's
`CLAUDE.md` and existing tests, then follows them.

Scenario: $ARGUMENTS

If no scenario is given, ask what to test and the expected negative / edge cases.
