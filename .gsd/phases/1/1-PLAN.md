---
phase: 1
plan: 1
wave: 1
---

# Plan 1.1: Suggested Actions Engine

## Objective
Implement a multi-suggestion engine that provides ranked next steps (Retry as GET, Check path, etc.) with confidence levels.

## Context
- .gsd/SPEC.md
- d:\Projects\Better-man\script.js

## Tasks

<task type="auto">
  <name>Refactor `logIssue` for Multi-Action Support</name>
  <files>d:\Projects\Better-man\script.js</files>
  <action>
    - Update `logIssue` to accept a `suggestions` array instead of a single `action`.
    - Each suggestion should include: `id`, `label`, `confidence` (High/Medium), and `description`.
    - Refactor the UI rendering to show a "Suggested Actions" block within each issue card, styling higher confidence actions more prominently.
  </action>
  <verify>Check script.js for loop logic in logIssue UI generation.</verify>
  <done>Multiple buttons can be rendered per issue card with confidence labels.</done>
</task>

<task type="auto">
  <name>Enhance Suggestion Engine in `analyzeResponse`</name>
  <files>d:\Projects\Better-man\script.js</files>
  <action>
    - Update the status code analysis logic to populate multiple suggestions:
      - 404: Check path (High), Retry as GET (Medium if not GET).
      - 405: Retry as GET (High if not GET), Check path (Medium).
      - 401/403: Verify Headers (High), Check path (Medium).
    - Ensure `why` messages are context-aware (referencing current method/URL).
  </action>
  <verify>Check analyzeResponse for logic that pushes multiple objects into a new `suggestions` array.</verify>
  <done>Each failure condition generates at least 2 distinct suggested actions with confidence levels.</done>
</task>

## Success Criteria
- [ ] Issue cards show a "Suggested Actions" section.
- [ ] Suggestions include "High" or "Medium" confidence tags.
- [ ] Multiple actions (Retry as GET + Check Path) appear for 404s/405s.
