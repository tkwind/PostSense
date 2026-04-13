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

  // Toggle Mode
  modeToggle.addEventListener('change', (e) => {
    isBrowserMode = e.target.checked;
    modeLabel.textContent = isBrowserMode ? 'Browser Mode' : 'Postman Mode';
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
    
    let html = `<div class="issue-title">${issue.problem}</div>`;
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
    // Collect issues found during response phase
    const responseIssues = [];
    const currentMethod = methodSelect.value;

    // 1. Advanced HTTP Status Mapping
    if (response.status === 404) {
      const suggestions = [{ id: 'check-path', label: 'Verify URL path', confidence: 'High' }];
      if (currentMethod !== 'GET') {
          suggestions.push({ id: 'retry-get', label: 'Retry as GET', confidence: 'Medium', btnLabel: 'Switch' });
      }
      responseIssues.push({
        problem: 'Endpoint Not Found (404)',
        why: `The server responded with 404. Path: ${urlInput.value}`,
        fix: 'Check for typos or method mismatch.',
        severity: 'error',
        suggestions
      });
    } else if (response.status === 401 || response.status === 403) {
      responseIssues.push({
        problem: 'Authentication Issue',
        why: `Request was rejected with ${response.status}.`,
        severity: 'error',
        suggestions: [
          { id: 'verify-auth', label: 'Check Auth Headers', confidence: 'High' },
          { id: 'check-path', label: 'Verify URL path', confidence: 'Medium' }
        ]
      });
    } else if (response.status === 405) {
      responseIssues.push({
        problem: 'Method Not Allowed (405)',
        why: `${currentMethod} is not supported here.`,
        severity: 'error',
        suggestions: [
          { id: 'retry-get', label: 'Switch to GET', confidence: 'High' },
          { id: 'check-path', label: 'Check API Docs', confidence: 'Medium' }
        ]
      });
    } else if (response.status >= 400 && response.status < 500) {
      responseIssues.push({
        problem: `Client Error (${response.status})`,
        why: `The server responded with an error: ${response.statusText}`,
        severity: 'error'
      });
    } else if (response.status >= 500) {
      responseIssues.push({
        problem: `Server Error (${response.status})`,
        why: 'The server encountered an unexpected condition which prevented it from fulfilling the request.',
        severity: 'error'
      });
    }

    // 2. CORS Checks (Only if status is OK, to avoid noise on errors)
    if (isBrowserMode && response.status < 300) {
      const acao = headersObj['access-control-allow-origin'] || headersObj['Access-Control-Allow-Origin'];
      
      if (!acao) {
        responseIssues.push({
          problem: 'CORS Missing',
          why: 'This API will fail in browser due to missing CORS headers',
          fix: 'Access-Control-Allow-Origin: *',
          severity: 'warning'
        });
      } else if (acao !== '*' && acao !== requestOrigin) {
        responseIssues.push({
          problem: 'CORS Mismatch',
          why: `The 'Access-Control-Allow-Origin' header (${acao}) does not match the request Origin (${requestOrigin}).`,
          fix: `Access-Control-Allow-Origin: ${requestOrigin}`,
          severity: 'warning'
        });
      }
    }

    // Process all issues (pre-fetch + response-time)
    renderAllIssues(responseIssues);
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
        problem: 'URL cannot be empty',
        why: 'The fetch request requires an active endpoint to target.',
        severity: 'error'
      });
      return;
    }

    // Attempt to normalize URL if scheme is missing
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
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

    } catch (error) {
      resStatus.textContent = 'Network Error';
      resBody.textContent = error.toString();
      logIssue({
        problem: `Fetch failed: ${error.message}`,
        why: 'This might be a server fault, a network drop, or a CORS restriction preventing the request.',
        severity: 'error'
      });
    }
  });

});
