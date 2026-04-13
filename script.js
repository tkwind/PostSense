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
    if (issue.fix) html += `
      <div class="issue-fix">
        <span>Suggested fix: <code>${issue.fix}</code></span>
        <button class="copy-fix-btn" data-fix="${issue.fix.replace(/"/g, '&quot;')}">Copy</button>
      </div>`;
    
    li.innerHTML = html;
    issuesList.appendChild(li);
  }

  issuesList.addEventListener('click', (e) => {
    if (e.target.classList.contains('copy-fix-btn')) {
      const fixText = e.target.getAttribute('data-fix');
      navigator.clipboard.writeText(fixText);
      e.target.textContent = 'Copied!';
      setTimeout(() => e.target.textContent = 'Copy', 2000);
    }
  });

  function clearIssues() {
    issuesList.innerHTML = '';
  }

  function analyzeResponse(response, headersObj) {
    // Stub to be implemented in Phase 2
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
        headers['Origin'] = window.location.origin || 'http://localhost';
        logIssue({
          problem: 'Injected Origin header for Browser Mode simulation.',
          severity: 'warning'
        });
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

      analyzeResponse(response, resHeadersObj);

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
