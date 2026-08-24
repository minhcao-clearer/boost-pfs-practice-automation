---
description: Review a test / diff against the project rules (read-only)
---

Use the **test-reviewer** agent to review the target against this project's `CLAUDE.md`
plus universal E2E discipline, reporting violations with `file:line`. It must not edit
anything.

Target: $ARGUMENTS

If no target is given, review the current git diff (unstaged and staged changes).
