---
phase: 1
plan: 1
wave: 1
---

# Plan 1.1: Web UI Request Tool Implementation

## Objective
Implement a browser-based user interface (`index.html`, `styles.css`, `script.js`) that allows a user to construct and fire API requests visually without frameworks, supporting standard features alongside a mode toggle. Generate the code explanation walkthrough.

## Context
- .gsd/SPEC.md

## Tasks

<task type="auto">
  <name>Build HTML, CSS, and JS logic</name>
  <files>
    d:\Projects\Better-man\index.html
    d:\Projects\Better-man\styles.css
    d:\Projects\Better-man\script.js
  </files>
  <action>
    Create the minimal web layout according to the spec:
    - Left UI elements: URL input, Method dropdown, dynamic Headers key/value rows, Body textarea.
    - Top UI elements: 'Postman Mode' vs 'Browser Mode' toggle switch.
    - Right UI elements: Response viewing panel showing Status, Headers, and properly formatted JSON Body.
    - Bottom UI elements: 'Issues Detected' panel.
    - Implement Javascript using native `fetch`: Hook up buttons, parse the dynamic inputs to build the `fetch` initialization object, format the textual outputs, and construct response viewing.
    - "Browser Mode" must forcefully impose an `Origin` header dynamically simulating local hosts or strictly enforce subset constraints.
  </action>
  <verify>Test-Path d:\Projects\Better-man\index.html; Test-Path d:\Projects\Better-man\script.js</verify>
  <done>All three boilerplate files exist and hook into each other.</done>
</task>

<task type="auto">
  <name>Create Code Explanation Walkthrough</name>
  <files>d:\Projects\Better-man\WALKTHROUGH.md</files>
  <action>
    Create a robust `WALKTHROUGH.md` containing the educational "Code Explanation" requested. Cover:
    1. UI inputs mapping
    2. Header construction
    3. `fetch` request building
    4. Postman vs Browser Mode behavior and logic
    5. Response rendering mechanics
    Include instructions on how to naturally run the app locally without build tools (e.g. `npx serve` or standard browser opening).
  </action>
  <verify>Test-Path d:\Projects\Better-man\WALKTHROUGH.md</verify>
  <done>The walkthrough successfully details all 5 explanatory requirements along with local run instructions.</done>
</task>

## Success Criteria
- [ ] Interface correctly matches structural layout specification.
- [ ] Users can fire `fetch` commands using dynamic headers and a request body.
- [ ] A Postman vs Browser logic split exists avoiding un-testable boundaries while meeting spec basics.
- [ ] Walkthrough explicitly guides users through technical design choices mapping back to the prompt's academic requirement.
