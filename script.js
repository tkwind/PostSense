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

  function clearIssues() {
    issuesList.innerHTML = '';
  }

  function analyzeResponse(response, headersObj, requestOrigin) {
    const responseIssues = [];
    const currentMethod = methodSelect.value;
    const currentUrl = urlInput.value.trim();
    const currentHasBody = !!bodyTextarea.value.trim();
    const currentHeaderCount = Object.keys(getHeaders()).length;

    // Current Virtual Request State (for comparison)
    const currentReqState = {
      method: currentMethod,
      url: currentUrl,
      hasBody: currentHasBody,
      headerCount: currentHeaderCount
    };

    // Find evidence in history
    const historyMatches = requestHistory.filter(h => h.url === currentUrl);
    const successfulAlternative = historyMatches.find(h => h.status < 300);

    // 1. Advanced HTTP Status Mapping
    if (response.status === 404) {
      const suggestions = [{ id: 'check-path', label: 'Verify URL path', confidence: 'High' }];
      
      let promotedTitle = 'Endpoint Not Found';
      let reasoning = '';
      let deltas = [];

      if (currentMethod !== 'GET') {
          if (successfulAlternative) {
            deltas = compareRequests(currentReqState, successfulAlternative);
            const theory = inferCause(deltas);
            promotedTitle = theory.title;
            reasoning = `${successfulAlternative.method} succeeded previously. ${theory.reason}`;
          }

          suggestions.push({ 
            id: 'retry-get', 
            label: 'Retry as GET', 
            confidence: (successfulAlternative && successfulAlternative.method === 'GET') ? 'High' : 'Medium', 
            btnLabel: 'Switch',
            reasoning: reasoning,
            deltas: deltas
          });
      }
      
      responseIssues.push({
        problem: promotedTitle,
        supportingStatus: `Status: ${response.status} ${response.statusText}`,
        why: successfulAlternative 
             ? `Observed outcome divergence: ${currentMethod} failed while ${successfulAlternative.method} succeeded previously.`
             : `The server responded that this endpoint does not exist for ${currentMethod}.`,
        fix: 'Verify the endpoint path or follow the observed configuration theory below.',
        severity: 'error',
        suggestions
      });
    } else if (response.status === 401 || response.status === 403 || response.status === 400) {
      responseIssues.push({
        problem: 'Malformed Request',
        supportingStatus: `Status: ${response.status} ${response.statusText}`,
        why: `The request was rejected by the server with code ${response.status}.`,
        severity: 'error',
        suggestions: [
          { id: 'verify-auth', label: 'Check Auth/Payload', confidence: 'High' },
          { id: 'check-path', label: 'Verify URL path', confidence: 'Medium' }
        ]
      });
    } else if (response.status === 405) {
      const isGetWorking = successfulAlternative && successfulAlternative.method === 'GET';
      responseIssues.push({
        problem: 'Method Mismatch Detected',
        supportingStatus: `Status: ${response.status} ${response.statusText}`,
        why: `${currentMethod} is not supported here. ${isGetWorking ? 'GET was observed to work previously.' : ''}`,
        severity: 'error',
        suggestions: [
          { 
            id: 'retry-get', 
            label: 'Switch to GET', 
            confidence: isGetWorking ? 'High' : 'Medium',
            reasoning: isGetWorking ? 'GET returned 200 on this URL earlier.' : ''
          },
          { id: 'check-path', label: 'Check API Docs', confidence: 'Medium' }
        ]
      });
    } else if (response.status >= 400 && response.status < 500) {
      responseIssues.push({
        problem: 'Malformed Request',
        supportingStatus: `Status: ${response.status} ${response.statusText}`,
        why: `The server responded with an error: ${response.statusText}`,
        severity: 'error'
      });
    } else if (response.status >= 500) {
      responseIssues.push({
        problem: 'Network Failure',
        supportingStatus: `Status: ${response.status} ${response.statusText}`,
        why: 'The server encountered an unexpected condition which prevented it from fulfilling the request.',
        severity: 'error'
      });
    }

    // 2. CORS Checks
    if (isBrowserMode && response.status < 300) {
      const acao = headersObj['access-control-allow-origin'] || headersObj['Access-Control-Allow-Origin'];
      
      if (!acao) {
        responseIssues.push({
          problem: 'CORS Restriction',
          why: 'This API will fail in browser due to missing CORS headers',
          fix: 'Access-Control-Allow-Origin: *',
          severity: 'warning'
        });
      } else if (acao !== '*' && acao !== requestOrigin) {
        responseIssues.push({
          problem: 'CORS Restriction',
          why: `The 'Access-Control-Allow-Origin' header (${acao}) does not match the request Origin (${requestOrigin}).`,
          fix: `Access-Control-Allow-Origin: ${requestOrigin}`,
          severity: 'warning'
        });
      }
    }

    // Process all issues
    renderAllIssues(responseIssues);
  }

  function compareRequests(failed, success) {
    const deltas = [];
    if (failed.method !== success.method) {
      deltas.push(`Method: ${failed.method} → ${success.method}`);
    }
    if (failed.hasBody !== success.hasBody) {
      deltas.push(`Body: ${failed.hasBody ? 'Present' : 'None'} → ${success.hasBody ? 'Present' : 'None'}`);
    }
    if (failed.headerCount !== success.headerCount) {
      deltas.push(`Headers: ${failed.headerCount} items → ${success.headerCount} items`);
    }
    return deltas;
  }

  function inferCause(deltas) {
    if (deltas.some(d => d.includes('Body: Present → None')) || deltas.some(d => d.includes('Method:'))) {
      return {
        title: "Method Mismatch Detected",
        reason: "The server appears to require a different request configuration (Method or Payload) than provided."
      };
    }
    return {
      title: "Malformed Request",
      reason: "An observed successful alternative exists with a different request configuration."
    };
  }

  function renderAllIssues(responseIssues) {
    // Current issuesList already has pre-fetch issues (like blocked headers)
    // We want to prioritize them.
    
    // Instead of logging immediately in analyzeResponse, we refactor to a bulk render
    // But since logIssue appends to the DOM, let's just make sure we handle the hierarchy.
    
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
        status: response.status,
        hasBody: !!bodyData,
        headerCount: Object.keys(headers).length,
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
