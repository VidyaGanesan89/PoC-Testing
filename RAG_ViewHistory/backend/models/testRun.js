/**
 * TestRun Data Model
 * Schema for storing test execution metadata
 */

class TestRun {
  constructor(data) {
    this.runId = data.runId || this.generateRunId();
    this.testType = data.testType; // 'Functional' | 'Performance'
    this.prompt = data.prompt || ''; // Prompt used to generate the test
    this.testClass = data.testClass || '';
    this.testMethod = data.testMethod || '';
    this.status = data.status; // 'Passed' | 'Failed' | 'Running'
    this.duration = data.duration || 0; // milliseconds
    this.timestamp = data.timestamp || new Date().toISOString();
    this.errorLogs = data.errorLogs || [];
    this.reportPath = data.reportPath || '';
    this.screenshots = data.screenshots || [];
    this.exitCode = data.exitCode;
    this.metrics = data.metrics || {};
  }

  generateRunId() {
    return `run_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Convert test run to searchable text for embedding
   */
  toEmbeddingText() {
    const parts = [
      `Test Run ID: ${this.runId}`,
      `Test Type: ${this.testType}`,
      `Status: ${this.status}`,
      `Timestamp: ${this.timestamp}`,
      `Duration: ${this.duration}ms`
    ];

    if (this.prompt) {
      parts.push(`Original Prompt: ${this.prompt}`);
    }

    if (this.testClass) {
      parts.push(`Test Class: ${this.testClass}`);
    }

    if (this.testMethod) {
      parts.push(`Test Method: ${this.testMethod}`);
    }

    if (this.errorLogs && this.errorLogs.length > 0) {
      parts.push(`Errors: ${this.errorLogs.join('; ')}`);
    }

    return parts.join(' | ');
  }

  /**
   * Convert to JSON for storage
   */
  toJSON() {
    return {
      runId: this.runId,
      testType: this.testType,
      prompt: this.prompt,
      testClass: this.testClass,
      testMethod: this.testMethod,
      status: this.status,
      duration: this.duration,
      timestamp: this.timestamp,
      errorLogs: this.errorLogs,
      reportPath: this.reportPath,
      screenshots: this.screenshots,
      exitCode: this.exitCode,
      metrics: this.metrics
    };
  }

  /**
   * Create TestRun from JSON
   */
  static fromJSON(json) {
    return new TestRun(json);
  }
}

module.exports = TestRun;
