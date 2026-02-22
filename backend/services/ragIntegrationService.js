const fs = require('fs').promises;
const path = require('path');
const http = require('http');

class RAGIntegrationService {
  constructor() {
    this.ragServerUrl = 'http://localhost:8081/api/test-history';
    this.projectRoot = path.resolve(__dirname, '../../');
    this.surefireReportsPath = path.join(this.projectRoot, 'target/surefire-reports');
    this.queueFilePath = path.join(this.projectRoot, 'backend', 'data', 'rag-pending-queue.json');
    this.enabled = true;
    console.log('✅ RAG Integration enabled (using built-in Node.js modules)');
    this.ensureQueueStorage();
  }

  async ensureQueueStorage() {
    try {
      await fs.mkdir(path.dirname(this.queueFilePath), { recursive: true });
      try {
        await fs.access(this.queueFilePath);
      } catch (err) {
        await fs.writeFile(this.queueFilePath, '[]', 'utf8');
      }
    } catch (error) {
      console.error('❌ Error ensuring RAG queue storage:', error.message);
    }
  }

  async readPendingQueue() {
    try {
      await this.ensureQueueStorage();
      const content = await fs.readFile(this.queueFilePath, 'utf8');
      const queue = JSON.parse(content);
      return Array.isArray(queue) ? queue : [];
    } catch (error) {
      console.error('❌ Error reading RAG queue:', error.message);
      return [];
    }
  }

  async writePendingQueue(queue) {
    try {
      await this.ensureQueueStorage();
      await fs.writeFile(this.queueFilePath, JSON.stringify(queue, null, 2), 'utf8');
    } catch (error) {
      console.error('❌ Error writing RAG queue:', error.message);
    }
  }

  async enqueueForRetry(testData, reason = 'Unknown error') {
    try {
      const queue = await this.readPendingQueue();
      queue.push({
        enqueuedAt: new Date().toISOString(),
        reason,
        payload: testData
      });
      await this.writePendingQueue(queue);
      console.warn(`⚠️  Queued RAG payload for retry. Pending queue size: ${queue.length}`);
    } catch (error) {
      console.error('❌ Failed to enqueue RAG payload:', error.message);
    }
  }

  async flushPendingQueue() {
    try {
      const queue = await this.readPendingQueue();
      if (queue.length === 0) {
        return;
      }

      const remaining = [];
      let flushedCount = 0;

      for (const item of queue) {
        const payload = item && item.payload ? item.payload : null;
        if (!payload) {
          continue;
        }

        const response = await this.postToRAG(payload);
        if (response && response.success) {
          flushedCount += 1;
        } else {
          remaining.push(item);
        }
      }

      await this.writePendingQueue(remaining);

      if (flushedCount > 0) {
        console.log(`✅ Flushed ${flushedCount} pending RAG payload(s). Remaining: ${remaining.length}`);
      }
    } catch (error) {
      console.error('❌ Error flushing RAG queue:', error.message);
    }
  }

  async postToRAG(testData) {
    const postData = JSON.stringify(testData);

    return new Promise((resolve) => {
      const options = {
        hostname: 'localhost',
        port: 8081,
        path: '/api/test-history',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        },
        timeout: 5000
      };

      const req = http.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            if (response && response.success) {
              resolve(response);
            } else {
              resolve(null);
            }
          } catch (error) {
            console.error('❌ Error parsing RAG response:', error.message);
            resolve(null);
          }
        });
      });

      req.on('error', (error) => {
        if (error.code === 'ECONNREFUSED') {
          console.warn('⚠️  RAG server not available at localhost:8081');
        } else {
          console.error('❌ Error sending to RAG:', error.message);
        }
        resolve(null);
      });

      req.on('timeout', () => {
        req.destroy();
        console.error('❌ RAG request timeout');
        resolve(null);
      });

      req.write(postData);
      req.end();
    });
  }

  /**
   * Send test execution data to RAG server using Node's built-in http module
   * @param {object} testData - Test execution data
   */
  async sendToRAG(testData) {
    if (!this.enabled) {
      console.log('ℹ️  RAG integration disabled - skipping');
      return null;
    }
    
    try {
      console.log('📤 Sending test data to RAG server...');
      await this.flushPendingQueue();

      const response = await this.postToRAG(testData);
      if (response && response.success) {
        console.log('✅ Test data successfully sent to RAG server');
        return response;
      }

      await this.enqueueForRetry(testData, 'Primary send failed');
      return null;
    } catch (error) {
      console.error('❌ Error in sendToRAG:', error.message);
      await this.enqueueForRetry(testData, error.message);
      return null;
    }
  }

  /**
   * Parse TestNG results from XML using regex (no external dependencies)
   */
  async parseTestNGResults() {
    if (!this.enabled) {
      console.log('ℹ️  RAG integration disabled - skipping XML parsing');
      return null;
    }
    
    try {
      const testNgPath = path.join(this.surefireReportsPath, 'testng-results.xml');
      const xmlContent = await fs.readFile(testNgPath, 'utf8');
      
      // Parse using regex
      const testngResults = xmlContent.match(/<testng-results[^>]*>/);
      if (!testngResults) return null;
      
      const total = (testngResults[0].match(/total="(\d+)"/) || [])[1] || '0';
      const passed = (testngResults[0].match(/passed="(\d+)"/) || [])[1] || '0';
      const failed = (testngResults[0].match(/failed="(\d+)"/) || [])[1] || '0';
      const skipped = (testngResults[0].match(/skipped="(\d+)"/) || [])[1] || '0';
      
      const suiteMatch = xmlContent.match(/<suite[^>]*name="([^"]*)"[^>]*duration-ms="(\d+)"/);
      const testMatch = xmlContent.match(/<test[^>]*name="([^"]*)"/);
      
      return {
        totalTests: parseInt(total) || 0,
        passed: parseInt(passed) || 0,
        failed: parseInt(failed) || 0,
        skipped: parseInt(skipped) || 0,
        duration: suiteMatch ? parseInt(suiteMatch[2]) || 0 : 0,
        suiteName: suiteMatch ? suiteMatch[1] : '',
        testName: testMatch ? testMatch[1] : ''
      };
    } catch (error) {
      console.error('Error parsing TestNG results:', error.message);
      return null;
    }
  }

  /**
   * Extract test steps from surefire XML reports
   */
  async extractTestSteps() {
    try {
      const files = await fs.readdir(this.surefireReportsPath);
      const xmlFiles = files.filter(f => f.startsWith('TEST-') && f.endsWith('.xml'));
      
      if (xmlFiles.length === 0) {
        return [];
      }

      // Get the most recent test file
      const testFile = xmlFiles[xmlFiles.length - 1];
      const filePath = path.join(this.surefireReportsPath, testFile);
      const content = await fs.readFile(filePath, 'utf8');

      // Extract STEP information from CDATA
      const steps = [];
      const stepMatches = content.matchAll(/\[STEP (\d+)\]\s*([^\n]+)/g);
      
      for (const match of stepMatches) {
        const stepNum = match[1];
        const description = match[2].trim();
        
        // Skip completion lines
        if (!description.includes('Completed')) {
          steps.push({
            stepNumber: parseInt(stepNum),
            description: description,
            status: 'completed'
          });
        }
      }

      return steps;
    } catch (error) {
      console.error('Error extracting test steps:', error.message);
      return [];
    }
  }

  /**
   * Extract screenshots information
   */
  async extractScreenshots() {
    try {
      const files = await fs.readdir(this.surefireReportsPath);
      const xmlFiles = files.filter(f => f.startsWith('TEST-') && f.endsWith('.xml'));
      
      if (xmlFiles.length === 0) {
        return [];
      }

      const testFile = xmlFiles[xmlFiles.length - 1];
      const filePath = path.join(this.surefireReportsPath, testFile);
      const content = await fs.readFile(filePath, 'utf8');

      const screenshots = [];
      const screenshotMatches = content.matchAll(/\[SCREENSHOT\]\s*Saved:\s*(.+)/g);
      
      for (const match of screenshotMatches) {
        const screenshotPath = match[1].trim();
        const filename = path.basename(screenshotPath);
        
        screenshots.push({
          filename: filename,
          path: screenshotPath,
          timestamp: new Date().toISOString()
        });
      }

      return screenshots;
    } catch (error) {
      console.error('Error extracting screenshots:', error.message);
      return [];
    }
  }

  /**
   * Build complete test execution data and send to RAG
   * @param {string} testClass - Test class name
   * @param {number} exitCode - Test exit code
   * @param {number} duration - Test duration in ms
   * @param {string} prompt - User prompt that generated the test (optional)
   */
  async reportTestExecution(testClass, exitCode, duration, prompt = '', sourceRunId = '') {
    if (!this.enabled) {
      console.log('ℹ️  RAG integration disabled - skipping test reporting');
      return null;
    }
    
    try {
      console.log('📊 Building test execution report for RAG...');

      // Parse TestNG results
      const testNgResults = await this.parseTestNGResults();
      
      // Extract steps and screenshots
      const steps = await this.extractTestSteps();
      const screenshots = await this.extractScreenshots();

      // Build test run data
      const testRunData = {
        runId: sourceRunId || `test_${Date.now()}`,
        testClass: testClass,
        testType: 'functional',
        prompt: prompt || `Test case for ${testClass}`, // Include prompt
        status: exitCode === 0 ? 'passed' : 'failed',
        timestamp: new Date().toISOString(),
        duration: duration,
        results: testNgResults || {
          totalTests: 0,
          passed: exitCode === 0 ? 1 : 0,
          failed: exitCode === 0 ? 0 : 1,
          skipped: 0
        },
        steps: steps,
        screenshots: screenshots,
        metadata: {
          browser: 'chrome',
          framework: 'TestNG + Selenium',
          mcpServer: 'ups-selenium',
          reportGenerated: true
        }
      };

      // Send to RAG server
      const result = await this.sendToRAG(testRunData);
      
      if (result) {
        console.log('✅ Test execution data saved to RAG');
        console.log(`   - Tests: ${testRunData.results.totalTests}`);
        console.log(`   - Passed: ${testRunData.results.passed}`);
        console.log(`   - Failed: ${testRunData.results.failed}`);
        console.log(`   - Steps: ${steps.length}`);
        console.log(`   - Screenshots: ${screenshots.length}`);
      }

      return result;
    } catch (error) {
      console.error('Error reporting test execution to RAG:', error);
      return null;
    }
  }

  /**
   * Get statistics from RAG server
   */
  async getStatistics() {
    if (!this.enabled) {
      console.log('ℹ️  RAG integration disabled');
      return null;
    }
    
    try {
      await this.flushPendingQueue();
      return new Promise((resolve, reject) => {
        const options = {
          hostname: 'localhost',
          port: 8081,
          path: '/api/test-history/stats',
          method: 'GET',
          timeout: 5000
        };

        const req = http.request(options, (res) => {
          let data = '';

          res.on('data', (chunk) => {
            data += chunk;
          });

          res.on('end', () => {
            try {
              const response = JSON.parse(data);
              if (response.success) {
                resolve(response.stats);
              } else {
                resolve(null);
              }
            } catch (error) {
              console.error('Error parsing RAG statistics:', error.message);
              resolve(null);
            }
          });
        });

        req.on('error', (error) => {
          console.error('Error getting RAG statistics:', error.message);
          resolve(null);
        });

        req.on('timeout', () => {
          req.destroy();
          resolve(null);
        });

        req.end();
      });
    } catch (error) {
      console.error('Error getting RAG statistics:', error.message);
      return null;
    }
  }

  /**
   * Query test history from RAG
   */
  async queryHistory(question) {
    if (!this.enabled) {
      console.log('ℹ️  RAG integration disabled');
      return null;
    }
    
    try {
      await this.flushPendingQueue();
      const postData = JSON.stringify({ question });
      
      return new Promise((resolve, reject) => {
        const options = {
          hostname: 'localhost',
          port: 8081,
          path: '/api/test-history/query',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
          },
          timeout: 10000
        };

        const req = http.request(options, (res) => {
          let data = '';

          res.on('data', (chunk) => {
            data += chunk;
          });

          res.on('end', () => {
            try {
              const response = JSON.parse(data);
              if (response.success) {
                resolve(response);
              } else {
                resolve(null);
              }
            } catch (error) {
              console.error('Error parsing query response:', error.message);
              resolve(null);
            }
          });
        });

        req.on('error', (error) => {
          console.error('Error querying RAG:', error.message);
          resolve(null);
        });

        req.on('timeout', () => {
          req.destroy();
          resolve(null);
        });

        req.write(postData);
        req.end();
      });
    } catch (error) {
      console.error('Error querying RAG:', error.message);
      return null;
    }
  }

  /**
   * Get test history from RAG server
   * @param {object} queryParams - Query parameters (limit, testType, status, etc.)
   */
  async getTestHistory(queryParams = {}) {
    if (!this.enabled) {
      console.log('ℹ️  RAG integration disabled');
      return null;
    }
    
    try {
      await this.flushPendingQueue();
      // Build query string from params
      const queryString = new URLSearchParams(queryParams).toString();
      const path = queryString ? `/api/test-history?${queryString}` : '/api/test-history';
      
      return new Promise((resolve, reject) => {
        const options = {
          hostname: 'localhost',
          port: 8081,
          path: path,
          method: 'GET',
          timeout: 10000
        };

        const req = http.request(options, (res) => {
          let data = '';

          res.on('data', (chunk) => {
            data += chunk;
          });

          res.on('end', () => {
            try {
              const response = JSON.parse(data);
              resolve(response);
            } catch (err) {
              console.error('Failed to parse RAG response:', err.message);
              resolve(null);
            }
          });
        });

        req.on('error', (error) => {
          console.error('Error getting test history from RAG:', error.message);
          resolve(null);
        });

        req.on('timeout', () => {
          req.destroy();
          resolve(null);
        });

        req.end();
      });
    } catch (error) {
      console.error('Error getting test history:', error.message);
      return null;
    }
  }
}

module.exports = new RAGIntegrationService();
