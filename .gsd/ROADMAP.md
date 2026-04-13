# ROADMAP.md

> **Current Milestone**: v0.3 - First Real Debug Insight
> **Goal**: Make the tool produce at least ONE clear, actionable debugging insight per request when applicable.

## Must-Haves
- [ ] Implement CORS detection: check for missing `access-control-allow-origin`
- [ ] Implement response condition: "This API will fail in browser due to missing CORS headers"
- [ ] Force Browser Mode behavior: Always attach Origin header (`http://localhost:3000`)
- [ ] Populate Issues panel dynamically: Must show at least one issue when condition is met
- [ ] Add clear structured issue format: Title, Explanation, Fix suggestion (exact header)

## Nice-to-haves
- [ ] Show "No issues detected" when clean
- [ ] Add icons or color (red/yellow) for severity
- [ ] Log raw request headers used (for debugging mismatch)

## Phases

### Phase 1: Engine Logic Implementation
**Status**: ⬜ Not Started
**Objective**: Implement the JS detection logic inside `analyzeResponse`, strictly mapping Origin/Browser logic with the structured issue format in the DOM.
