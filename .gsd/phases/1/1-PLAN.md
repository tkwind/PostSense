---
phase: 1
plan: 1
wave: 1
---

# Plan 1.1: Issue Promotion & Structural Shift

## Objective
Promote inferred causal theories to become the primary focus of the UI, making raw HTTP errors supporting context rather than the main problem title.

## Context
- .gsd/SPEC.md
- d:\Projects\Better-man\script.js

## Tasks

<task type="auto">
  <name>Refactor Analysis for Promotion</name>
  <files>d:\Projects\Better-man\script.js</files>
  <action>
    - Update `analyzeResponse` to identify if a "High Confidence" causal inference exists.
    - If it exists, set a new `promotedTitle` field (e.g. "Payload Restriction Detected" instead of "Endpoint Not Found").
    - Capture the raw HTTP status as `supportingStatus` (e.g. "Status: 404").
    - Ensure inference wording is precise and cautious (using "likely", "appears to", "observed").
  </action>
  <verify>Check script.js for logic that swaps problem titles based on inference confidence.</verify>
  <done>Primary issues use causal theories as titles when evidence is strong.</done>
</task>

<task type="auto">
  <name>Update logIssue UI for Promoted Layout</name>
  <files>d:\Projects\Better-man\script.js</files>
  <action>
    - Update the card HTML generation in `logIssue`:
      - If `promotedTitle` exists, use it as the main header.
      - Add a small sub-header `[Supporting Status: {code}]`.
      - Separate the "What Changed" deltas into a clean bulleted list inside the reasoning block.
  </action>
  <verify>Run a 404 POST after a 200 GET and verify the card title changes to something like "Payload Restriction".</verify>
  <done>The UI feels intelligent by highlighting the root cause over the reactive error code.</done>
</task>

## Success Criteria
- [ ] Primary issues change their title from HTTP codes to Causal Theories when evidence exists.
- [ ] Raw status codes are displayed as small, de-emphasized supporting text.
- [ ] Wording is refined to be precise and empirical.
