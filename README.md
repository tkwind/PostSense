![PostSense Banner](banner.png)

# PostSense: Intelligence-Backed API Debugging

**Stop staring at generic 404s and 405s.**  
Most API clients just send requests; PostSense actually debugs them by comparing your failures against your history.  
Get evidence-backed fixes, not just status codes.

---

## Why PostSense?

Generic API clients are reactive. They show you a status code and leave you to guess the "why." PostSense is proactive. It looks at your session history, identifies successful patterns, and performs **Differential Analysis** to tell you exactly why your current request is failing.

### The Differential Debugging Edge

| Feature | Standard Clients | PostSense |
| :--- | :--- | :--- |
| **Error Handling** | Raw `404` or `405` | **Method Mismatch Detected** |
| **CORS Testing** | Hidden (Bypasses CORS) | **Browser Simulation Mode** |
| **Actionability** | Manual Trial & Error | **One-Click Evidence Fixes** |
| **Intelligence** | Static Logs | **Causal Inference Engine** |
| **Unknown Endpoints** | You guess | **Auto-Probe discovers it** |

---

## Getting Started

PostSense is a single-folder, vanilla JS project. No `npm install`, no heavy dependencies.

### 1. Simple Access (No Setup)
Open the **[Live Demo](https://tkwind.github.io/BetterMan/)** and start debugging instantly.

### 2. Local Setup
1. Clone the repo.
2. Open `index.html` in your browser (or serve it with a lightweight server like `serve` or `live-server`).
3. Start debugging.

---

## Core Features

### 🔴 Breakpoint-Driven Timeline
The execution timeline works like a debugger, not a log viewer. When a request fails, PostSense:
- Automatically scrolls to and highlights the **first point of failure**
- Collapses successful steps ("3 steps succeeded before failure")
- Renders a structured **Breakpoint Card** with Expected vs Actual values, impact, and an action button

### 🔍 Compare with Working Request
Side-by-side diff between a failed request and the last known successful one for the same endpoint. Shows:
- **Method** difference (highlighted)
- **Header** differences (changed-only mode)
- **Body** differences (JSON property-level diff)
- **Apply Baseline** buttons per field + full "Retry with Baseline" restoration

### 🤖 Controlled Auto-Probe Engine
When no successful request exists for an endpoint, click **"Auto Test Endpoint"** to automatically discover a working configuration:
- Runs up to **6 probes** in strict sequence: `GET` (no headers) → `GET` (with headers) → `HEAD` → `OPTIONS` → `POST` (no body) → `POST` (body `{}`)
- **400ms delay** between each probe — rate-limit safe
- **Stops immediately** on first `2xx` (success) or `401/403` (auth wall)
- Parses `OPTIONS` `Allow` header to infer supported methods
- Shows a live ✓/✗ probe summary panel with a **"Apply Working Configuration"** button

### 📊 Honest Confidence System
PostSense never fakes certainty:
- **High** — Diagnosis based on an observed successful baseline
- **Medium** — Heuristic inference from known HTTP patterns (e.g., POST + 405)
- **Low** — No history; pure speculation flagged as such
- **`NO_BASELINE` mode** replaces "Expected: Success" with "Observed Failure" when no baseline exists

### 🌐 Browser Simulation Mode
Toggle **Browser Mode** to simulate real-browser networking constraints:
- Enforces CORS header checking
- Blocks forbidden headers (`Cookie`, `Host`, `Origin`, etc.)
- Warns about missing `Access-Control-Allow-Origin` before you hit the network

### 🏷️ Issues Panel with Smart Badges
- Badge count always exactly matches visible error cards
- **Retry with Baseline** button on every issue card (restores full request config: method, URL, headers, body, and mode)
- Cross-panel sync: clicking an issue scrolls to the corresponding timeline step

---

## Real Debugging Examples

### 1. The Method Mismatch Trap
You're testing an endpoint that you *know* exists, but you're getting a `405 Method Not Allowed`.

- **Traditional Client:** You waste time guessing which method to try.
- **PostSense:** Detects that a `GET` request to the same URL succeeded earlier. Breakpoint Card shows `Expected: GET / Actual: POST` with **High Confidence** and a "Compare Details" shortcut.

### 2. The CORS Mirage
Your API works in your desktop client but crashes when called from a browser.

- **Traditional Client:** Everything looks green (because it bypasses CORS).
- **PostSense:** Flip to **Browser Mode**. Warns about missing `Access-Control-Allow-Origin` headers *before* you deploy.

### 3. Exploring an Unknown Endpoint
You have a URL but no docs and don't know what method it accepts.

- **Traditional Client:** Manual trial and error, one request at a time.
- **PostSense:** Click **"Auto Test Endpoint"**. PostSense runs a safe, ordered probe sequence, stops the moment it finds a working config, and offers a one-click "Apply Working Configuration" button — all in under 3 seconds.

---

## Issue Taxonomy

Every issue maps to one of five core signals:

| Signal | Trigger |
| :--- | :--- |
| `Method Mismatch Detected` | `405` response / method divergence from baseline |
| `Endpoint Not Found` | `404` response |
| `CORS Restriction` | Missing/mismatched `Access-Control-Allow-Origin` in Browser Mode |
| `Malformed Request` | `400`, `401`, or `403` response |
| `Network Failure` | Connection error (status `0`) |

---

*Build better, faster, and with fewer "Why is this 404ing?" moments.*
