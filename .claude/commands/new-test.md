---
description: Author a new end-to-end test (obeys this project's CLAUDE.md + universal discipline)
---

Use the **test-author** agent to author a new test. It first reads this project's
`CLAUDE.md` and existing tests, then follows them.

Scenario: $ARGUMENTS

Before writing, it must settle **which feature folder** the test belongs to by listing
the ones that already exist and asking — never inventing a name — along with the tags and
any real ticket ID. If no scenario is given, also ask what to test and the expected
negative / edge cases.
