$css = @"
/* Probe Summary Panel */
.probe-summary-panel { background: #f6f8fa; border: 1px solid #d0d7de; border-radius: 8px; padding: 16px; margin: 12px 0; }
.probe-summary-title { font-weight: 700; font-size: 0.9rem; color: #24292f; display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.probe-rows { list-style: none; margin: 0 0 12px 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
.probe-row { display: flex; align-items: center; gap: 10px; padding: 7px 10px; border-radius: 6px; font-size: 0.82rem; border: 1px solid transparent; }
.probe-row.success { background: #dafbe1; border-color: #2da44e; color: #1a7f37; }
.probe-row.fail { background: #ffebe9; border-color: #d73a49; color: #82071e; }
.probe-row.pending { background: #fff8c5; border-color: #bf8700; color: #7d4e00; }
.probe-icon { font-size: 1rem; flex-shrink: 0; }
.probe-label { flex: 1; font-weight: 600; }
.probe-status { font-family: monospace; font-size: 0.78rem; opacity: 0.85; }
.probe-conclusion { margin-top: 12px; padding: 10px 12px; background: #fff; border: 1px solid #d0d7de; border-radius: 6px; font-size: 0.85rem; color: #24292f; line-height: 1.5; }
"@
Add-Content -Path 'd:\Projects\Better-man\styles.css' -Value $css
