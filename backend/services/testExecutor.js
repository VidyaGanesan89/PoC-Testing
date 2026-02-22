const { spawn } = require('child_process');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;
const ragIntegrationService = require('./ragIntegrationService');
const azureWorkItemAutomationService = require('./azureDevOps/azureWorkItemAutomationService');

// Store running tests
const runningTests = new Map();

class TestExecutor {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '../../');
  }

  /**
   * Run Maven test
   * @param {string} testClass - Test class name (e.g., 'tests.ParcelProLanguageSelectTest')
   * @param {string} testMethod - Test method name (optional)
   * @param {object} io - Socket.io instance for real-time updates
   * @param {string} prompt - User prompt that generated the test (optional)
   * @param {object} options - Additional options (azureDevOpsContext, testType)
   * @returns {string} testId - Unique test execution ID
   */
  async runTest(testClass, testMethod, io, prompt = '', options = {}) {
    // Allow caller to supply a pre-generated testId so the frontend can
    // subscribe BEFORE execution starts (avoids WebSocket race condition).
    const testId = options.testId || uuidv4();
    const testCommand = testMethod 
      ? `${testClass}#${testMethod}`
      : testClass;

    console.log(`Starting test execution: ${testCommand} (ID: ${testId})`);

    const testExecution = {
      id: testId,
      testClass,
      testMethod,
      prompt: prompt, // Store the prompt
      testType: options.testType || 'functional', // Store the test type
      azureDevOpsContext: options.azureDevOpsContext || null,
      status: 'running',
      startTime: new Date(),
      output: [],
      exitCode: null
    };

    runningTests.set(testId, testExecution);

    // Emit test started
    io.emit('test-progress', {
      testId,
      status: 'started',
      message: `Starting test: ${testCommand}`,
      timestamp: new Date()
    });

    // Run Maven test
    const mvnCommand = process.platform === 'win32' ? 'mvn.cmd' : 'mvn';
    const args = [
      'clean',
      'test',
      `-Dtest=${testCommand}`
    ];

    const mvnProcess = spawn(mvnCommand, args, {
      cwd: this.projectRoot,
      shell: true
    });

    mvnProcess.stdout.on('data', (data) => {
      const output = data.toString();
      testExecution.output.push(output);
      console.log(output);

      // Emit progress updates
      io.emit('test-progress', {
        testId,
        status: 'running',
        message: output.trim(),
        timestamp: new Date()
      });
    });

    mvnProcess.stderr.on('data', (data) => {
      const error = data.toString();
      testExecution.output.push(error);
      console.error(error);

      io.emit('test-progress', {
        testId,
        status: 'running',
        message: error.trim(),
        type: 'error',
        timestamp: new Date()
      });
    });

    mvnProcess.on('close', async (code) => {
      testExecution.exitCode = code;
      testExecution.endTime = new Date();
      testExecution.status = code === 0 ? 'passed' : 'failed';
      testExecution.duration = testExecution.endTime - testExecution.startTime;

      console.log(`Test ${testCommand} finished with exit code ${code}`);

      // Emit test completed
      io.emit('test-progress', {
        testId,
        status: testExecution.status,
        message: `Test ${testExecution.status} (exit code: ${code})`,
        exitCode: code,
        duration: testExecution.duration,
        timestamp: new Date()
      });

      // Save to history
      await this.saveTestHistory(testExecution);

      // Generate HTML report (non-blocking for main flow)
      this.generateHtmlReport(testExecution)
        .then((reportPath) => {
          if (reportPath) {
            console.log(`HTML report generated: ${reportPath}`);
          }
        })
        .catch((err) => console.error('Failed to generate HTML report:', err.message));

      // Send to RAG server (non-blocking) with prompt
      ragIntegrationService.reportTestExecution(
        testClass,
        code,
        testExecution.duration,
        testExecution.prompt || '',
        testExecution.id
      ).catch(err => console.error('Failed to send to RAG:', err));

      // Sync test execution result to Azure DevOps work items (non-blocking)
      azureWorkItemAutomationService.postExecutionResult({
        context: testExecution.azureDevOpsContext,
        testRunId: testExecution.id,
        testClassName: testExecution.testClass,
        status: testExecution.status,
        duration: testExecution.duration,
        errorMessage: code === 0 ? '' : 'Test execution failed. See build logs for details.'
      }).catch(err => console.error('Failed to post execution result to Azure DevOps:', err.message));
    });

    return testId;
  }

  /**
   * Get test status by ID
   * @param {string} testId
   * @returns {object} test execution details
   */
  async getTestStatus(testId) {
    const test = runningTests.get(testId);
    if (!test) {
      return null;
    }

    return {
      id: test.id,
      testClass: test.testClass,
      testMethod: test.testMethod,
      status: test.status,
      startTime: test.startTime,
      endTime: test.endTime,
      duration: test.duration,
      exitCode: test.exitCode
    };
  }

  /**
   * Save test execution to history file
   * @param {object} testExecution
   */
  async saveTestHistory(testExecution) {
    try {
      const historyFile = path.join(this.projectRoot, 'backend', 'data', 'test-history.json');
      
      // Ensure data directory exists
      await fs.mkdir(path.dirname(historyFile), { recursive: true });

      let history = [];
      try {
        const data = await fs.readFile(historyFile, 'utf8');
        history = JSON.parse(data);
      } catch (err) {
        // File doesn't exist yet
      }

      // Determine display name - use class name if testMethod not available
      const testName = testExecution.testMethod || this._extractReadableName(testExecution.testClass);
      
      // Add new test result
      history.unshift({
        id: testExecution.id,
        testClass: testExecution.testClass,
        testMethod: testExecution.testMethod,
        testName: testName, // Add readable test name
        testType: testExecution.testType || 'functional', // Save test type
        azureDevOps: testExecution.azureDevOpsContext ? true : false, // Flag if Azure Boards
        status: testExecution.status,
        startTime: testExecution.startTime,
        endTime: testExecution.endTime,
        duration: testExecution.duration,
        exitCode: testExecution.exitCode
      });

      // Keep only last 500 results
      history = history.slice(0, 500);

      await fs.writeFile(historyFile, JSON.stringify(history, null, 2));
    } catch (error) {
      console.error('Error saving test history:', error);
    }
  }

  /**
   * Extract readable name from test class name
   * e.g., 'ContactUsFormTest' -> 'Contact Us Form Test'
   * @param {string} className
   * @returns {string}
   */
  _extractReadableName(className) {
    if (!className) return 'Test';
    
    // Remove package prefix if present (e.g., tests.ContactUsFormTest -> ContactUsFormTest)
    const simpleName = className.includes('.') ? className.split('.').pop() : className;
    
    // Remove 'Test' suffix if present
    const nameWithoutTest = simpleName.endsWith('Test') 
      ? simpleName.slice(0, -4) 
      : simpleName;
    
    // Convert camelCase to Title Case with spaces
    // e.g., 'ContactUsForm' -> 'Contact Us Form'
    return nameWithoutTest
      .replace(/([A-Z])/g, ' $1')  // Add space before capitals
      .trim()                        // Remove leading space
      .replace(/\s+/g, ' ');        // Normalize multiple spaces
  }

  /**
   * Generate custom HTML report after test execution.
   * Uses scripts/Generate-CustomReport.ps1 with ParcelPro-style naming.
   */
  async generateHtmlReport(testExecution) {
    try {
      const scriptPath = path.join(this.projectRoot, 'scripts', 'Generate-CustomReport.ps1');
      const reportsPath = path.join(this.projectRoot, 'functional test report');

      // Ensure required paths exist
      await fs.mkdir(reportsPath, { recursive: true });
      await fs.access(scriptPath);

      const now = new Date();
      const yyyy = now.getFullYear();
      const MM = String(now.getMonth() + 1).padStart(2, '0');
      const dd = String(now.getDate()).padStart(2, '0');
      const HH = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      const ss = String(now.getSeconds()).padStart(2, '0');

      const dateOnly = `${yyyy}-${MM}-${dd}`;
      const dateTime = `${yyyy}-${MM}-${dd}_${HH}-${mm}-${ss}`;

      const className = testExecution.testClass || 'Functional_Tests';
      const normalizedClass = className
        .replace(/Test$/i, '')
        .replace(/[^A-Za-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '') || 'Functional_Tests';

      // Standardized report naming for all classes
      const reportName = `ParcelPro_${normalizedClass}_Test_Report_${dateTime}`;

      await new Promise((resolve, reject) => {
        const ps = spawn(
          'powershell.exe',
          ['-ExecutionPolicy', 'Bypass', '-File', scriptPath, '-ReportName', reportName],
          { cwd: this.projectRoot, shell: false }
        );

        let stderr = '';

        ps.stdout.on('data', (data) => {
          console.log(data.toString().trim());
        });

        ps.stderr.on('data', (data) => {
          const errText = data.toString();
          stderr += errText;
          console.error(errText.trim());
        });

        ps.on('close', (exitCode) => {
          if (exitCode === 0) {
            resolve();
          } else {
            reject(new Error(stderr || `Report generation script failed with code ${exitCode}`));
          }
        });
      });

      // Backward compatibility: also create the legacy language report filename
      if (/language/i.test(className)) {
        const currentReportPath = path.join(reportsPath, `${reportName}.html`);
        const legacyLanguageName = `ParcelPro_Language_Test_Report_${dateOnly}.html`;
        const legacyLanguagePath = path.join(reportsPath, legacyLanguageName);
        await fs.copyFile(currentReportPath, legacyLanguagePath);
      }

      return path.join(reportsPath, `${reportName}.html`);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new TestExecutor();
