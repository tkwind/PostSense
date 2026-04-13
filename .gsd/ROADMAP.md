# ROADMAP.md

> **Current Milestone**: v0.5 - Intelligent Issue Prioritization
> **Goal**: Ensure the tool identifies the most relevant issue instead of blindly reporting all possible problems.

## Must-Haves
- [ ] HTTP error detection takes priority over other checks
- [ ] CORS detection runs only for successful (2xx) responses
- [ ] Clear distinction between Errors (Failure) and Warnings (Environmental)
- [ ] Primary issue focus: show most relevant issue top-level

## Phases

### Phase 1: Prioritization Engine Logic
**Status**: ✅ Complete
**Objective**: Refactor `analyzeResponse` to implement the priority hierarchy and show secondary issues as additional notes.

### Phase 2: Visual & UX Polishing
**Status**: ⬜ Not Started
**Objective**: Improve issue explanation clarity and refine visual severity cues (Red/Yellow).
