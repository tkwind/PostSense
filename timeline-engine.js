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

    // Mark First Failure
    let failureFound = false;
    timeline.forEach(s => {
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

      // If the step itself represents a terminal failure in the failed timeline
      if (fStep.status === "failed" && mergedStep.status !== "different") {
          mergedStep.status = "failed";
          mergedStep.detail = fStep.detail;
      }

      merged.push(mergedStep);
    });

    return merged;
  }

  /**
   * Reasoning Engine
   * Generates actionable insights from the divergence.
   */
  function generateReasoning(mergedTimeline, workingReq, failedReq) {
    const firstDiv = mergedTimeline.find(s => s.isFirstDivergence);
    
    if (!firstDiv) {
      return {
        explanation: "No structural divergence detected. The failure might be data-dependent.",
        confidence: "medium"
      };
    }

    // Pattern Matching
    if (firstDiv.step === "Method Check") {
      return {
        firstDivergence: "Method Check",
        explanation: `${failedReq.method} used instead of ${workingReq.method}; endpoint likely read-only or restricted.`,
        confidence: "high"
      };
    }

    if (firstDiv.step === "Simulation Layer") {
      return {
        firstDivergence: "Simulation Layer",
        explanation: "Request works in PostSense Mode but fails in Browser Mode. Likely a CORS or Forbidden Header restriction.",
        confidence: "high"
      };
    }

    if (firstDiv.step === "Receive Response") {
      if (mergedTimeline.failedCode === 404 && mergedTimeline.workingCode === 200) {
        return {
          firstDivergence: "Receive Response",
          explanation: "The endpoint exists but rejected this specific configuration with a 404.",
          confidence: "high"
        };
      }
    }

    // Default Fallback
    return {
      firstDivergence: firstDiv.step,
      explanation: `Divergence found at ${firstDiv.step}. Working state: ${firstDiv.working}, Failed state: ${firstDiv.failed}.`,
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
