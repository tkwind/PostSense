---
phase: 1
plan: 1
wave: 1
---

# Plan 1.1: Core Implementation & Walkthrough

## Objective
Implement `app.js` to send HTTP requests, format output, and handle errors, and write the required code walkthrough.

## Context
- .gsd/SPEC.md

## Tasks

<task type="auto">
  <name>Implement CLI tool</name>
  <files>d:\Projects\Better-man\app.js</files>
  <action>
    Implement `app.js` with the following requirements:
    - Use native `fetch` API.
    - Parse CLI arguments: `node app.js [METHOD] [URL] [HEADERS?] [BODY?]`.
    - Handle errors for invalid URL, network errors, and invalid JSON.
    - Print status, headers, and formatted JSON body.
    - Keep it clean and <150 lines.
  </action>
  <verify>node app.js GET https://jsonplaceholder.typicode.com/posts/1</verify>
  <done>Request is sent and response formatted successfully</done>
</task>

<task type="auto">
  <name>Create code walkthrough</name>
  <files>d:\Projects\Better-man\WALKTHROUGH.md</files>
  <action>
    Create a detailed markdown file `WALKTHROUGH.md` containing a breakdown of the code for educational purposes.
    Explain how arguments are parsed, the HTTP request is constructed, headers and body are handled, the response is processed, and where errors are handled.
  </action>
  <verify>Test-Path d:\Projects\Better-man\WALKTHROUGH.md</verify>
  <done>Walkthrough explains all 5 requested components.</done>
</task>

## Success Criteria
- [ ] app.js acts as a functional request engine.
- [ ] WALKTHROUGH.md breaks down the logic clearly.
- [ ] Required logic is robust against missing properties or bad input.
