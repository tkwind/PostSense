# BetterMan: Your API Debugging Assistant

**Stop staring at generic 404s and 405s.**  
Most API clients just send requests; BetterMan actually debugs them by comparing your failures against your history.  
Get evidence-backed fixes, not just status codes.

---

## Why BetterMan?

Generic API clients are reactive. They show you a status code and leave you to guess the "why." BetterMan is proactive. It looks at your session history, identifies successful patterns, and performs **Differential Analysis** to tell you exactly why your current request is failing.

### The Differential Debugging Edge

| Feature | Standard Clients | BetterMan |
| :--- | :--- | :--- |
| **Error Handling** | Raw `404` or `405` | **Method Mismatch Detected** |
| **CORS Testing** | Hidden (Bypasses CORS) | **Browser Simulation Mode** |
| **Actionability** | Manual Trial & Error | **One-Click Evidence Fixes** |
| **Intelligence** | Static Logs | **Causal Inference Engine** |

---

## Real Debugging Examples

### 1. The Method Mismatch Trap
You're testing an endpoint that you *know* exists, but you're getting a `404 Not Found`.

- **Traditional Client:** You waste 10 minutes auditing the URL path for typos.
- **BetterMan:** Detects that a `GET` request to the same URL succeeded earlier. It promotes a **Method Mismatch Detected** warning and offers a "Switch to GET" button with **High Confidence**.

### 2. The CORS Mirage
Your API works perfectly in your desktop client, but crashes the second you call it from your frontend.

- **Traditional Client:** Everything looks green (because it's not a browser).
- **BetterMan:** Flip to **Browser Mode**. BetterMan simulates origin-based security and warns you about missing `Access-Control-Allow-Origin` headers *before* you even hit the network.

---

## Powerful Features

- **Evidence-Based Reasoning**: Suggestions are labeled with confidence levels. "High Confidence" means the tool has observed a successful alternative in your current session.
- **Strict Taxonomy**: No more "creative" labels. Every issue is mapped to 5 core signals:
    - `Method Mismatch Detected`
    - `Endpoint Not Found`
    - `CORS Restriction`
    - `Malformed Request`
    - `Network Failure`
- **Dynamic Quick Fixes**: Copy-pasteable headers and one-click URL verification.
- **Pre-fetch Guardrails**: Catches malformed URLs and protocol errors before you even waste a network cycle.

---

## Getting Started

BetterMan is a single-folder, vanilla JS project. No `npm install`, no heavy dependencies.

1. Clone the repo.
2. Open `index.html` in your browser (or serve it with a lightweight server like `serve` or `live-server`).
3. Start debugging.

---

*Build better, faster, and with fewer "Why is this 404ing?" moments.*
