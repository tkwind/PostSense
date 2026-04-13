# SPEC.md — Project Specification

> **Status**: `FINALIZED`

## Vision
A minimal web-based UI for an API request tool that allows users to send requests and format responses directly from the browser, supporting both raw and browser-simulated modes. 

## Goals
1. Provide a layout with URL, Method, dynamic Headers, and JSON body inputs.
2. Formulate and send requests via standard `fetch`.
3. Provide an intuitive Response panel for Status, Headers, and formatted JSON Body.
4. Support Postman Mode (as-is) and Browser Mode (injecting Origin, restricted header logic).
5. Document the codebase with a "Code Explanation".

## Non-Goals (Out of Scope)
- No build tools (Webpack, Vite, etc.)
- No JS frameworks (React, Vue, etc.)
- No full browser policy simulation (only minimal Origin/restriction logic).

## Users
Developers seeking a lightweight, purely local API request tool runnable entirely from an `index.html` file.

## Constraints
- Pure HTML/CSS/JS.
- Native `fetch` API.

## Success Criteria
- [ ] Layout matches the Left/Top/Right/Bottom panel requirements.
- [ ] Requests successfully fire and load responses into the Right panel.
- [ ] Mode toggling behavior affects the structure of the outgoing request.
- [ ] Detailed code explanation is provided.
