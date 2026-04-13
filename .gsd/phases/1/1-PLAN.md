---
phase: 1
plan: 1
wave: 1
---

# Plan 1.1: Engine Structure & UI Enhancements

## Objective
Convert the current minimal text-based error dumping panel into a structured, color-coded Issue Detection Engine UI. Hook in the stub for the logic analysis layer that will be built in Phase 2.

## Context
- .gsd/SPEC.md
- d:\Projects\Better-man\index.html
- d:\Projects\Better-man\styles.css
- d:\Projects\Better-man\script.js

## Tasks

<task type="auto">
  <name>Enhance Issues UI styling</name>
  <files>d:\Projects\Better-man\styles.css</files>
  <action>
    Add CSS rules to support structured issue cards:
    - `.issue-card` container.
    - `.severity-warning` (e.g., orange) and `.severity-error` (e.g., red) colors.
    - Title, Why (description), and Fix (actionable suggestion) sub-elements.
    - `.copy-fix-btn` styling for the nice-to-have copy-paste capability.
  </action>
  <verify>Test-Path d:\Projects\Better-man\styles.css</verify>
  <done>CSS file includes robust styling for interactive issue components rather than simple li lines.</done>
</task>

<task type="auto">
  <name>Refactor `logIssue` and Analysis hook</name>
  <files>d:\Projects\Better-man\script.js</files>
  <action>
    Update `script.js`:
    1. Refactor `logIssue` to accept a structured object `{ problem, why, fix, severity }`.
    2. Within `logIssue`, dynamically construct the custom `.issue-card` DOM elements. Embed the `.copy-fix-btn` logic that maps to `navigator.clipboard.writeText(fix)`.
    3. Modify the existing "URL empty" / "Browser restriction" checks to use this new object format (`severity: 'error'`).
    4. Provide an empty stub function `analyzeResponse(response)` that is reliably called right after a successful `fetch()` resolves but before the status updates end.
  </action>
  <verify>Test-Path d:\Projects\Better-man\script.js</verify>
  <done>The script leverages the new rich card system and hooks perfectly into the JS architecture.</done>
</task>

## Success Criteria
- [ ] Users see visually distinct warnings/errors in the issues panel.
- [ ] Fixes can be copy-pasted via an integrated button.
- [ ] `analyzeResponse` hook is correctly positioned in the async chain.
