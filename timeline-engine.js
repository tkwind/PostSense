/**
 * PostSense Timeline Engine
 * Modular logic for mapping requests to execution timelines and detecting divergence.
 */

const PostSenseEngine = (() => {

  /**
   * Mode 1: Baseline Mapping
   * Converts a single request/response pair into a structured execution timeline.
   */
  function buildBaselineTimeline(request) {
    const { method, url, headers, body, isBrowserMode, response } = request;
    const timeline = [];

    // Phase 1: Initialize
    timeline.push({ 
      step: "Initialize Request", 
      status: "success", 
      icon: "🏗️",
      isPrimary: false
    });

    // Phase 2: Resolve URL
    const urlValid = url && url.startsWith('http');
    timeline.push({ 
      step: "Resolve URL", 
      status: urlValid ? "success" : "failed", 
      detail: urlValid ? `Target: ${new URL(url).hostname}` : "Invalid endpoint",
      icon: "🌐",
      isPrimary: true
    });

    // Phase 3: Method Check
    timeline.push({ 
      step: "Method Check", 
      status: "success", 
      detail: `${method} request`,
      icon: "⚙️",
      isPrimary: true
    });

    // Phase 4: Headers Applied
    const headerCount = Object.keys(headers || {}).length;
    timeline.push({ 
      step: "Headers Applied", 
      status: "success", 
      detail: `${headerCount} headers configured`,
      icon: "📋",
      isPrimary: true
    });

    // Phase 5: Environment Simulation
    if (isBrowserMode) {
      timeline.push({ 
        step: "Simulation Layer", 
        status: "success", 
        detail: "Browser Mode active (Enforcing CORS/Forbidden Headers)",
        icon: "🛡️",
        isPrimary: false
      });
    }

    // Phase 6: Network Execution
    const isNetworkError = !response || response.status === 0;
    timeline.push({ 
      step: "Send Request", 
      status: isNetworkError ? "failed" : "success",
      icon: "📤",
      isPrimary: false
    });

    // Phase 7: Receive Response
    const isSuccess = response && response.status >= 200 && response.status < 300;
    timeline.push({ 
      step: "Receive Response", 
      status: isSuccess ? "success" : "failed", 
      code: response ? response.status : "Error",
      detail: response ? `HTTP ${response.status}` : "Connection failed",
      icon: "📥",
      isPrimary: true
    });

    // Phase 8: Parse Response
    timeline.push({ 
      step: "Parse Response", 
      status: response ? "success" : "failed",
      icon: "🔍",
      isPrimary: false
    });

    // Assign IDs and Mark First Failure
    let failureFound = false;
    timeline.forEach((s, idx) => {
      s.id = `step_${idx}`;
      if (!failureFound && s.status === 'failed') {
        s.isFirstFailure = true;
        failureFound = true;
      }
    });

    return timeline;
  }

  /**
   * Mode 2: Divergence Timeline
   * Compares a working timeline against a failed one.
   */
  function compareTimelines(working, failed) {
    const merged = [];
    let foundDivergence = false;

    // Use failed as the primary structure
    failed.forEach((fStep, index) => {
      const wStep = working[index];
      
      const mergedStep = {
        step: fStep.step,
        icon: fStep.icon
      };

      if (!wStep) {
        mergedStep.status = "different";
        mergedStep.failed = fStep.detail;
      } else if (fStep.status === wStep.status && fStep.detail === wStep.detail) {
        mergedStep.status = "same";
        mergedStep.detail = fStep.detail;
      } else {
        mergedStep.status = "different";
        mergedStep.working = wStep.detail || wStep.step;
        mergedStep.failed = fStep.detail || fStep.step;
        
        if (fStep.code !== wStep.code) {
          mergedStep.workingCode = wStep.code;
          mergedStep.failedCode = fStep.code;
        }

        if (!foundDivergence) {
          mergedStep.isFirstDivergence = true;
          foundDivergence = true;
        }
      }

      merged.push(mergedStep);
    });

    // Re-assign IDs to merged timeline
    merged.forEach((s, idx) => s.id = `step_${idx}`);

    return merged;
  }

  /**
   * Reasoning Engine
   * Generates actionable insights from the divergence.
   */
  function generateReasoning(mergedTimeline, workingReq, failedReq) {
    if (!workingReq) {
      const firstFail = mergedTimeline.find(s => s.status === 'failed' || s.isFirstFailure);
      const status = failedReq.response?.status;
      
      let heuristic = {
        mode: "NO_BASELINE",
        firstDivergence: firstFail ? firstFail.step : "Final Response",
        explanation: "No successful request observed. Showing best-guess diagnosis.",
        confidence: "low",
        confidenceReason: "No successful baseline observed"
      };

      if (status === 404) {
        heuristic.explanation = "Endpoint rejected this path with 404. It may be invalid or require a different structure.";
        heuristic.confidence = "medium";
        heuristic.action = "Try base endpoint or check URL";
      } else if (status === 405) {
        heuristic.explanation = "Method Mismatch suspected. The target endpoint may not support " + failedReq.method + ".";
        heuristic.confidence = "medium";
        heuristic.action = "Try GET or check documentation";
      } else if (status === 401 || status === 403) {
        heuristic.explanation = "Unauthorized. The server rejected the credentials or origin.";
        heuristic.confidence = "medium";
        heuristic.action = "Verify headers and Auth";
      }

      return heuristic;
    }

    const firstDiv = mergedTimeline.find(s => s.isFirstDivergence);
    
    if (!firstDiv) {
      return {
        explanation: "No structural divergence detected. The failure might be data-dependent.",
        confidence: "medium",
        confidenceReason: "Observed identical success"
      };
    }

    // Pattern Matching
    if (firstDiv.step === "Method Check") {
      return {
        firstDivergence: "Method Check",
        explanation: `${failedReq.method} used instead of ${workingReq.method}; endpoint likely read-only or restricted.`,
        expected: workingReq.method,
        actual: failedReq.method,
        impact: "This endpoint appears to be restricted to specific HTTP methods.",        action: "Switch to GET",
        actionId: "retry-get",
        confidence: "high"
      };
    }

    if (firstDiv.step === "Simulation Layer") {
      return {
        firstDivergence: "Simulation Layer",
        explanation: "Request works in PostSense Mode but fails in Browser Mode. Likely a CORS or Forbidden Header restriction.",
        expected: "Unrestricted Network (App)",
        actual: "CORS-Enforced Network (Browser)",
        impact: "This request will fail in a real web browser but work in tools like Postman.",
        action: "Switch to PostSense Mode",
        confidence: "high"
      };
    }

    if (firstDiv.step === "Receive Response") {
      if (mergedTimeline.failedCode === 404 && mergedTimeline.workingCode === 200) {
        return {
          firstDivergence: "Receive Response",
          explanation: "The endpoint exists but rejected this specific configuration with a 404.",
          expected: "HTTP 200 (Success)",
          actual: `HTTP 404 (Not Found)`,
          impact: "The server might require a specific URL structure or headers not present in this request.",
          action: "Check Path/Headers",
          confidence: "high"
        };
      }
    }

    // Default Fallback
    if (firstDiv.status === 'different' && firstDiv.working === firstDiv.failed) {
       return {
          firstDivergence: firstDiv.step,
          explanation: "The request configuration matches the successful baseline perfectly, yet the server rejected it.",
          expected: "Success",
          actual: "Failure",
          impact: "This usually points to dynamic state changes: expired session tokens, CSRF mismatches, or rate limiting.",
          action: "Check Headers / Refresh Session",
          confidence: "high"
       };
    }

    return {
      firstDivergence: firstDiv.step,
      explanation: `Divergence found at ${firstDiv.step}. Working state: ${firstDiv.working}, Failed state: ${firstDiv.failed}.`,
      expected: firstDiv.working,
      actual: firstDiv.failed,
      impact: "The request execution path changed unexpectedly at this phase.",
      confidence: "medium"
    };
  }

  return {
    buildBaselineTimeline,
    compareTimelines,
    generateReasoning
  };

})();

// Node.js Export Compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PostSenseEngine;
}
