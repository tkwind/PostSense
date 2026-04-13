# SPEC.md — Project Specification

> **Status**: `FINALIZED`

## Vision
A minimal, production-quality Node.js CLI tool that sends HTTP requests, parses responses, and prints formatted output (status, headers, body) with a code walkthrough for educational purposes.

## Goals
1. Send GET and POST requests with custom URLs, headers, and JSON bodies using Node 18+ native fetch.
2. Provide clean CLI usage without external frameworks.
3. Print clear, formatted responses (status, headers, pretty JSON body).
4. Provide a detailed code walkthrough explanation.

## Non-Goals (Out of Scope)
- No interactive prompts.
- No support for other HTTP methods currently (just GET, POST).
- No external frameworks or overengineered architectures.

## Users
Developers learning how to build minimal CLI tools and raw HTTP request engines in Node.js.

## Constraints
- Node.js (no frameworks).
- Native `fetch` (Node 18+).
- Code under 150 lines.
- No unnecessary abstractions.

## Success Criteria
- [ ] Tool correctly parses CLI arguments for GET and POST requests.
- [ ] Tool correctly constructs and sends requests.
- [ ] Prints status, headers, and formatted body.
- [ ] Handles invalid URLs, network failures, and invalid JSON inputs gracefully.
