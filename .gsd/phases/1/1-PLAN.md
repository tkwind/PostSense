---
phase: 1
plan: 1
wave: 1
---

# Plan 1.1: Prioritization Engine Logic

## Objective
Implement a priority-based analysis engine that ranks issues found in an API response and focuses the UI on the most critical one.

## Context
- .gsd/SPEC.md
- d:\Projects\Better-man\script.js

## Tasks

<task type="auto">
  <name>Refactor `analyzeResponse` for Priority</name>
  <files>d:\Projects\Better-man\script.js</files>
  <action>
    - Refactor `analyzeResponse` to collect all issues into an array before logging.
    - Implement the priority hierarchy:
      1. HTTP Status Errors (4xx/5xx) take absolute priority. If found, skip CORS checks.
      2. CORS checks (Missing/Mismatch) only run for 2xx responses.
    - Separate findings into `primaryIssue` and `secondaryNotes`.
    - Modify the UI update logic to clear the list and show the Primary Issue card prominently.
  </action>
  <verify>Check script.js for conditional CORS logic and itemized priority array handling.</verify>
  <done>HTTP errors are reported first, and CORS warnings are only analyzed for successful status codes.</done>
</task>

<task type="auto">
  <name>Implement "Additional Notes" UI</name>
  <files>d:\Projects\Better-man\script.js</files>
  <action>
    - Update the issues list rendering to support a secondary section if multiple issues are detected.
    - If `secondaryNotes` exist, render them as smaller, less prominent cards or a dedicated "Additional Observations" block below the primary issue.
    - Ensure the "No issues detected" state still works correctly.
  </action>
  <verify>Run a request that might trigger multiple warnings (if any) and see the visual hierarchy.</verify>
  <done>Multiple issues are displayed with a clear visual distinction between the main problem and secondary notes.</done>
</task>

## Success Criteria
- [ ] HTTP 4xx/5xx errors suppress CORS analysis to avoid "noise".
- [ ] CORS issues only appear for successful requests (2xx).
- [ ] UI clearly highlights the "Most Important" issue found.
