---
name: take-issue
description: Implement one ready-for-agent issue end to end in this checkout. Open in a Sonnet session.
disable-model-invocation: false
---

# Take issue

One issue, this checkout, one PR. Conventions (claiming, branch name, PR body, media) and environment setup/verification are in `docs/agents/issue-tracker.md`.

Arguments: `$ARGUMENTS` is an issue number. With none, take the lowest-numbered open `ready-for-agent` issue with no open blocker.

## Steps

1. **Claim.** Switch to a new branch per the tracker doc's naming convention, then swap the label/status as the doc says. This is the first write.
2. **Read.** Fetch the issue with its full history. The Done-when is the completion criterion for step 3; if the issue has none, write one from its body and post it before coding.
3. **Implement.** Follow docs/agents/issue-tracker.md → "Running issues with subagents" for environment setup, any shared-resource rules (device pools, seed data), and how to verify. Done when every Done-when line holds.
4. **PR.** Push, open the PR closing the issue per the tracker doc's convention, with media for anything visible per the doc. Report the PR number, what was verified and how, and any Done-when line not met.
