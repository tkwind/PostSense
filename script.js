document.addEventListener('DOMContentLoaded', () => {
  const methodSelect = document.getElementById('method');
  const urlInput = document.getElementById('url');
  const headersContainer = document.getElementById('headers-container');
  const addHeaderBtn = document.getElementById('add-header-btn');
  const bodyTextarea = document.getElementById('body');
  const sendBtn = document.getElementById('send-btn');
  const modeToggle = document.getElementById('mode-toggle');
  const modeLabel = document.getElementById('mode-label');
  
  const resStatus = document.getElementById('res-status');
  const resHeaders = document.getElementById('res-headers');
  const resBody = document.getElementById('res-body');
  const issuesList = document.getElementById('issues-list');
  const timelineTab = document.getElementById('tab-timeline');
  const timelineOutput = document.getElementById('timeline-output');
  const timelineReasoning = document.getElementById('timeline-reasoning');

  let isBrowserMode = false;
  let requestHistory = []; // Tracks { method, url, status, timestamp }

  // Toggle Mode
  modeToggle.addEventListener('change', (e) => {
    isBrowserMode = e.target.checked;
    modeLabel.textContent = isBrowserMode ? 'Browser Mode' : 'PostSense Mode';
  });

  // Dynamic Headers
  addHeaderBtn.addEventListener('click', () => {
    const row = document.createElement('div');
    row.className = 'header-row';
    row.innerHTML = `
      <input type="text" class="header-key" placeholder="Key (e.g. Content-Type)">
      <input type="text" class="header-value" placeholder="Value (e.g. application/json)">
      <button class="remove-header-btn">X</button>
    `;
    headersContainer.appendChild(row);
  });

  headersContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-header-btn')) {
      e.target.parentElement.remove();
    }
  });

  function logIssue(issue) {
    if (typeof issue === 'string') {
      issue = { problem: issue, why: '', fix: '', severity: 'warning' };
    }
    const li = document.createElement('li');
    li.className = `issue-card severity-${issue.severity || 'warning'}`;
    
    let html = `<div class="issue-title">
                  ${issue.problem}
                  ${issue.supportingStatus ? `<span class="supporting-status">${issue.supportingStatus}</span>` : ''}
                </div>`;
    if (issue.why) html += `<div class="issue-why">${issue.why}</div>`;
    if (issue.fix) {
      html += `
        <div class="issue-fix">
          <span>Quick Fix: <code>${issue.fix}</code></span>
          <button class="copy-fix-btn" data-fix="${issue.fix.replace(/"/g, '&quot;')}">Copy</button>
        </div>`;
    }
    
    // Multi-Suggestion Support
    if (issue.suggestions && issue.suggestions.length > 0) {
      html += `<div class="suggested-actions-container">
                 <div class="section-header">Suggested Actions</div>`;
      
      issue.suggestions.forEach(sug => {
        const confClass = sug.confidence === 'High' ? 'confidence-high' : 'confidence-medium';
        html += `
          <div class="action-item">
            <div class="action-label">
              ${sug.label}
              <span class="confidence-tag ${confClass}">${sug.confidence}</span>
            </div>
            <button class="action-btn" data-action-id="${sug.id}" ${sug.data ? `data-action-val="${sug.data}"` : ''}>
              ${sug.btnLabel || 'Run'}
            </button>
          </div>
          ${sug.reasoning ? `<div class="suggestion-reasoning">Evidence: ${sug.reasoning}</div>` : ''}
          ${sug.deltas && sug.deltas.length > 0 ? `
            <div class="delta-list">
              ${sug.deltas.map(d => `<div class="delta-item">${d}</div>`).join('')}
            </div>
          ` : ''}
        `;
      });
      html += `</div>`;
    }
    
    li.innerHTML = html;
    issuesList.appendChild(li);
  }

  issuesList.addEventListener('click', (e) => {
    if (e.target.classList.contains('copy-fix-btn')) {
      const fixText = e.target.getAttribute('data-fix');
      navigator.clipboard.writeText(fixText);
      e.target.textContent = 'Copied!';
      setTimeout(() => e.target.textContent = 'Copy', 2000);
    } else if (e.target.classList.contains('action-btn')) {
      const actionId = e.target.getAttribute('data-action-id');
      const actionVal = e.target.getAttribute('data-action-val');
      
      if (actionId === 'retry-get') {
        methodSelect.value = 'GET';
        sendBtn.click();
      } else if (actionId === 'check-path') {
        urlInput.focus();
        urlInput.style.outline = '2px solid #3498db';
        setTimeout(() => urlInput.style.outline = '', 2000);
      } else if (actionId === 'verify-auth') {
        // Scroll to headers
        headersContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Pulse headers
        headersContainer.style.background = '#eafaf1';
        setTimeout(() => headersContainer.style.background = '', 1000);
      }
    }
  });

  // Tab Switching
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      switchTab(btn.getAttribute('data-tab'));
    });
  });

  function switchTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    
    document.querySelector(`.tab-btn[data-tab="${tabId}"]`).classList.add('active');
    document.getElementById(tabId).classList.add('active');
  }

  function clearIssues() {
    issuesList.innerHTML = '';
    timelineOutput.innerHTML = '';
    timelineReasoning.innerHTML = '';
    document.getElementById('issue-count-badge').textContent = '0';
  }

  function analyzeResponse(response, headersObj) {
    const responseIssues = [];
    const currentMethod = methodSelect.value;
    const currentUrl = urlInput.value.trim();
    const currentHasBody = !!bodyTextarea.value.trim();
    const headers = getHeaders();

    const currentRequestData = {
      method: currentMethod,
      url: currentUrl,
      headers: headers,
      body: bodyTextarea.value.trim(),
      isBrowserMode,
      response: {
        status: response.status,
        headers: headersObj,
        body: resBody.textContent
      }
    };

    const failedTimeline = PostSenseEngine.buildBaselineTimeline(currentRequestData);

    // Find evidence in history
    const historyMatches = requestHistory.filter(h => h.url === currentUrl);
    const successfulAlternative = historyMatches.find(h => h.status < 300);

    if (successfulAlternative) {
      const workingRequestData = {
        method: successfulAlternative.method,
        url: successfulAlternative.url,
        headers: successfulAlternative.headers || {},
        body: successfulAlternative.body || "",
        isBrowserMode: successfulAlternative.isBrowserMode,
        response: {
          status: successfulAlternative.status,
          headers: successfulAlternative.resHeaders || {},
          body: successfulAlternative.resBody || ""
        }
      };

      const workingTimeline = PostSenseEngine.buildBaselineTimeline(workingRequestData);
      const mergedTimeline = PostSenseEngine.compareTimelines(workingTimeline, failedTimeline);
      const reasoning = PostSenseEngine.generateReasoning(mergedTimeline, workingRequestData, currentRequestData);

      renderTimeline(mergedTimeline, reasoning);
      switchTab('tab-timeline'); // Auto-switch to timeline on divergence
    } else {
      renderTimeline(failedTimeline);
      if (response.status >= 400) {
        switchTab('tab-issues'); // Auto-switch to issues on failure
      } else {
        switchTab('tab-response'); // Stay on response for success
      }
    }

    // Existing label analysis for specific feedback cards
    if (response.status === 404) {
      responseIssues.push({
        problem: 'Endpoint Not Found',
        supportingStatus: `Status: ${response.status}`,
        why: 'The server responded that this endpoint does not exist.',
        severity: 'error',
        suggestions: [{ id: 'check-path', label: 'Verify URL path', confidence: 'High' }]
      });
    } else if (response.status === 405) {
      responseIssues.push({
        problem: 'Method Mismatch Detected',
        supportingStatus: `Status: ${response.status}`,
        why: `${currentMethod} is not supported here.`,
        severity: 'error'
      });
    }

    // Process all issues
    renderAllIssues(responseIssues);
  }

  function renderTimeline(timeline, reasoning) {
    timelineOutput.innerHTML = '';
    timelineReasoning.innerHTML = '';
    const summaryBar = document.getElementById('debug-timeline-summary');

    // Summary Bar
    const status = timeline[timeline.length - 1].status === 'success' ? 'Success' : 'Failed';
    const code = timeline.find(s => s.code)?.code || '';
    const firstFail = timeline.find(s => s.isFirstFailure || s.isFirstDivergence);
    
    summaryBar.innerHTML = `
      <span>Flow: <strong>${status} ${code ? `(${code})` : ''}</strong> • Steps: ${timeline.length}</span>
      ${firstFail ? `<span class="first-failure-tag">First Conflict: ${firstFail.step}</span>` : ''}
    `;

    if (reasoning) {
      timelineReasoning.innerHTML = `
        <div class="reasoning-panel">
          <div class="reasoning-header">
            <span>Inferred Cause</span>
            <span class="confidence-chip">${reasoning.confidence}</span>
          </div>
          <div class="reasoning-body">
            <strong>${reasoning.firstDivergence || 'Analysis'}:</strong> ${reasoning.explanation}
          </div>
        </div>
      `;
    }

    const container = document.createElement('div');
    container.className = 'timeline-container';

    timeline.forEach(step => {
      const entry = document.createElement('div');
      entry.className = `timeline-entry status-${step.status} ${step.isPrimary ? 'primary-step' : 'secondary-step'}`;
      
      let html = `
        <div class="timeline-marker"></div>
        <div class="timeline-content">
          <div class="timeline-header">
            <span>${step.icon || '•'}</span>
            <span>${step.step}</span>
            ${step.isFirstDivergence ? '<span class="timeline-divergence">FIRST DIVERGENCE</span>' : ''}
          </div>
          ${step.detail ? `<div class="timeline-detail">${step.detail}</div>` : ''}
      `;

      if (step.status === 'different') {
        html += `
          <div class="timeline-comparison">
            <div class="comp-working">Working: ${step.working}${step.workingCode ? ` (HTTP ${step.workingCode})` : ''}</div>
            <div class="comp-failed">Failed: ${step.failed}${step.failedCode ? ` (HTTP ${step.failedCode})` : ''}</div>
          </div>
        `;
      }

      html += `</div>`;
      entry.innerHTML = html;
      container.appendChild(entry);
    });

    timelineOutput.appendChild(container);

    // Show Details Button
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'toggle-details-btn';
    toggleBtn.textContent = 'Show Full Log';
    toggleBtn.onclick = () => {
      const isExpanded = toggleBtn.textContent === 'Hide Full Log';
      container.querySelectorAll('.secondary-step').forEach(s => s.classList.toggle('show'));
      container.querySelectorAll('.timeline-entry').forEach(s => s.classList.toggle('expanded'));
      toggleBtn.textContent = isExpanded ? 'Show Full Log' : 'Hide Full Log';
    };
    timelineOutput.appendChild(toggleBtn);
  }

  function renderAllIssues(responseIssues) {
    
    // For simplicity with existing code, let's just log the responseIssues
    responseIssues.forEach(issue => logIssue(issue));

    const totalIssues = issuesList.children.length;

    if (totalIssues === 0) {
       const li = document.createElement('li');
       li.className = 'issue-card severity-success';
       li.style.borderLeftColor = '#27ae60';
       li.style.background = '#eafaf1';
       li.innerHTML = '<div class="issue-title" style="color: #27ae60;">No issues detected</div><div class="issue-why">The request executed cleanly according to simulation rules.</div>';
       issuesList.appendChild(li);
    } else if (totalIssues > 0) {
      // Formally section the output
      const cards = issuesList.querySelectorAll('.issue-card');
      cards.forEach((card, index) => {
        // Clean up previous headers
        const oldHeaders = card.querySelectorAll('.section-header');
        oldHeaders.forEach(h => {
             // If it's the "Suggested Actions" one we just added in logIssue, keep it.
             // Otherwise remove it to avoid duplicates.
             if (h.textContent !== 'Suggested Actions') h.remove();
        });

        if (index === 0) {
          const sectionLabel = document.createElement('div');
          sectionLabel.className = 'section-header';
          sectionLabel.textContent = 'Primary Issue';
          sectionLabel.style.color = card.classList.contains('severity-error') ? '#c0392b' : '#d68910';
          card.prepend(sectionLabel);
        } else {
          card.style.opacity = '0.75';
          card.style.transform = 'scale(0.98)';
          card.style.marginTop = '15px';
          
          if (!card.querySelector('.section-header')) {
            const label = document.createElement('div');
            label.className = 'section-header';
            label.textContent = 'Additional Note';
            card.prepend(label);
          }
        }
      });
    }
    // Update badge count (only count actual errors/warnings, not the success placeholder)
    const activeIssues = issuesList.querySelectorAll('.issue-card:not(.severity-success)').length;
    document.getElementById('issue-count-badge').textContent = activeIssues;
  }

  function isValidUrl(string) {
    try {
      const url = new URL(string);
      if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;
      // Require at least one dot in hostname unless it is localhost or an IP
      const hostname = url.hostname;
      const isIp = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname) || hostname.includes(':');
      const isLocal = hostname === 'localhost';
      const hasDot = hostname.includes('.');
      return isIp || isLocal || hasDot;
    } catch (_) {
      return false;
    }
  }

  // Build Headers Object
  function getHeaders() {
    const headers = {};
    const rows = headersContainer.querySelectorAll('.header-row');
    rows.forEach(row => {
      const key = row.querySelector('.header-key').value.trim();
      const val = row.querySelector('.header-value').value.trim();
      if (key) {
        // Browser Mode Restrictions
        if (isBrowserMode) {
          const forbiddenHeaders = ['origin', 'accept-charset', 'accept-encoding', 'connection', 'content-length', 'cookie', 'host', 'referer'];
          if (forbiddenHeaders.includes(key.toLowerCase())) {
            logIssue({
              problem: `Blocked unsafe header in Browser Mode: ${key}`,
              why: 'Browsers restrict manual modification of certain required communication headers.',
              severity: 'error'
            });
            return; // Skip adding this header
          }
        }
        headers[key] = val;
      }
    });

    if (isBrowserMode && !headers['Origin'] && !headers['origin']) {
        headers['Origin'] = 'http://localhost:3000';
    }

    return headers;
  }

  // Format Text
  function formatOutput(text) {
    try {
      if (!text) return '(empty response body)';
      const json = JSON.parse(text);
      return JSON.stringify(json, null, 2);
    } catch {
      return text; // Return raw if not JSON
    }
  }

  // Send Request
  sendBtn.addEventListener('click', async () => {
    clearIssues();
    const method = methodSelect.value;
    let url = urlInput.value.trim();

    if (!url) {
      logIssue({
        problem: 'URL Required',
        why: 'The request cannot be sent without a target endpoint.',
        severity: 'error'
      });
      return;
    }

    // Attempt to normalize URL if scheme is missing
    if (!/^[a-z]+:\/\//i.test(url)) {
      url = 'https://' + url;
    }

    if (!isValidUrl(url)) {
      resStatus.textContent = 'Invalid URL';
      logIssue({
        problem: 'Malformed Request',
        why: `"${url}" is not a valid HTTP/HTTPS endpoint.`,
        fix: 'Enter a valid URL (e.g., https://example.com)',
        severity: 'error'
      });
      return;
    }

    let bodyData = bodyTextarea.value.trim();
    if (bodyData && (method === 'GET' || method === 'HEAD')) {
      logIssue({
        problem: 'GET/HEAD requests cannot have a body. Body ignored.',
        severity: 'warning'
      });
      bodyData = null;
    }

    const headers = getHeaders();
    const options = {
      method,
      headers
    };

    if (bodyData) {
      options.body = bodyData;
    }

    resStatus.textContent = 'Fetching...';
    resHeaders.textContent = '';
    resBody.textContent = '';

    try {
      console.log('Raw Request Headers Sent:', options.headers);
      const response = await fetch(url, options);
      
      resStatus.textContent = `${response.status} ${response.statusText}`;

      // Extract Headers
      const resHeadersObj = {};
      response.headers.forEach((val, key) => {
        resHeadersObj[key] = val;
      });
      resHeaders.textContent = Object.keys(resHeadersObj).length 
        ? JSON.stringify(resHeadersObj, null, 2)
        : '(no headers)';

      // Extract Body
      const text = await response.text();
      resBody.textContent = formatOutput(text);

      const requestOrigin = options.headers['Origin'] || options.headers['origin'] || 'null';
      analyzeResponse(response, resHeadersObj, requestOrigin);

      // Store in History
      requestHistory.push({
        method,
        url,
        headers,
        body: bodyData,
        isBrowserMode,
        status: response.status,
        resHeaders: resHeadersObj,
        resBody: resBody.textContent,
        timestamp: Date.now()
      });

    } catch (error) {
      resStatus.textContent = 'Network Error';
      resBody.textContent = error.toString();
      logIssue({
        problem: 'Network Failure',
        why: 'This might be a server fault, a network drop, or a CORS restriction preventing the request.',
        severity: 'error'
      });
    }
  });

});
