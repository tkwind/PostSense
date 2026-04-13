---
phase: 1
plan: 1
wave: 1
---

# Plan 1.1: History Tracking & Evidence Logic

## Objective
Implement state tracking for requests and use comparison data to provide evidence-backed debugging insights and confidence levels.

## Context
- .gsd/SPEC.md
- d:\Projects\Better-man\script.js

## Tasks

<task type="auto">
  <name>Implement Request History State</name>
  <files>d:\Projects\Better-man\script.js</files>
  <action>
    - Add a global `requestHistory` array to track the last N requests (URL, Method, Status, Time).
    - Update the `sendBtn` click handler to push the current request details into history after completion.
    - Ensure `analyzeResponse` can access this history to find "Recent Alternatives" for the same URL.
  </action>
  <verify>Check script.js for state management logic in the fetch lifecycle.</verify>
  <done>The tool successfully remembers the outcome of previous requests during the session.</done>
</task>

<task type="auto">
  <name>Implement Evidence-Based Reasoning</name>
  <files>d:\Projects\Better-man\script.js</files>
  <action>
    - Refactor `analyzeResponse` to search history for the same URL with different methods.
    - If a previous request for the same URL with method X was 2xx, and current method Y is 4xx:
      - Add a "High Confidence" suggestion to switch back to method X.
      - Inject evidence text: "Suggested because ${X} returned 200 while ${Y} returned ${status}".
    - Update confidence levels for all other suggestions to be "Medium" by default unless evidence exists.
  </action>
  <verify>Run a 404 POST after a successful GET tracking and check card for reasoning text.</verify>
  <done>Suggestions now explicitly cite historical evidence when available.</done>
</task>

## Success Criteria
- [ ] Suggestions for 404s/405s include specific reasoning citing previous request outcomes.
- [ ] "High" confidence is strictly reserved for cases with observed successful alternatives.
- [ ] The engine correctly identifies URL matches in the history.
