const fs = require('fs').promises;
const path = require('path');
const TestRun = require('../models/testRun');

class TestHistoryService {
  constructor() {
    this.dataDir = path.join(__dirname, '../../data/test-runs');
    this.indexFile = path.join(this.dataDir, 'index.json');
    this.ensureDataDirectory();
  }

  /**
   * Rebuild index from run JSON files to recover from stale/missing index entries.
   */
  async rebuildIndexFromFiles() {
    try {
      await this.ensureDataDirectory();

      const files = await fs.readdir(this.dataDir);
      const runFiles = files.filter(
        (fileName) => fileName.endsWith('.json') && fileName !== 'index.json'
      );

      const indexEntries = [];
      for (const fileName of runFiles) {
        try {
          const filePath = path.join(this.dataDir, fileName);
          const fileData = await fs.readFile(filePath, 'utf8');
          const run = JSON.parse(fileData);

          if (!run || !run.runId) {
            continue;
          }

          indexEntries.push({
            runId: run.runId,
            testType: run.testType,
            status: run.status,
            timestamp: run.timestamp,
            duration: run.duration
          });
        } catch (fileError) {
          console.error(`Error reading test run file ${fileName}:`, fileError);
        }
      }

      indexEntries.sort(
        (a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime()
      );

      const boundedIndex = indexEntries.slice(0, 1000);
      await fs.writeFile(this.indexFile, JSON.stringify(boundedIndex, null, 2));

      return boundedIndex;
    } catch (error) {
      console.error('Error rebuilding index from files:', error);
      return [];
    }
  }

  /**
   * Ensure index exists and is in sync with data files.
   */
  async getValidIndex() {
    try {
      await this.ensureDataDirectory();

      let index = [];
      try {
        const indexData = await fs.readFile(this.indexFile, 'utf8');
        index = JSON.parse(indexData);
      } catch (err) {
        index = [];
      }

      const files = await fs.readdir(this.dataDir);
      const runFileIds = new Set(
        files
          .filter((fileName) => fileName.endsWith('.json') && fileName !== 'index.json')
          .map((fileName) => fileName.replace(/\.json$/, ''))
      );

      const indexIds = new Set((index || []).map((entry) => entry.runId));
      const outOfSync = runFileIds.size !== indexIds.size || [...runFileIds].some((id) => !indexIds.has(id));

      if (outOfSync || index.length === 0) {
        return await this.rebuildIndexFromFiles();
      }

      index.sort(
        (a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime()
      );
      return index;
    } catch (error) {
      console.error('Error validating index:', error);
      return await this.rebuildIndexFromFiles();
    }
  }

  /**
   * Ensure data directory exists
   */
  async ensureDataDirectory() {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
    } catch (error) {
      console.error('Error creating data directory:', error);
    }
  }

  /**
   * Save a test run
   */
  async saveTestRun(testRunData) {
    try {
      const testRun = new TestRun(testRunData);
      const filePath = path.join(this.dataDir, `${testRun.runId}.json`);
      
      await fs.writeFile(filePath, JSON.stringify(testRun.toJSON(), null, 2));
      
      // Update index
      await this.updateIndex(testRun);
      
      return testRun;
    } catch (error) {
      console.error('Error saving test run:', error);
      throw error;
    }
  }

  /**
   * Update index file with new test run
   */
  async updateIndex(testRun) {
    try {
      let index = await this.getValidIndex();

      // Add new run to index
      index.unshift({
        runId: testRun.runId,
        testType: testRun.testType,
        status: testRun.status,
        timestamp: testRun.timestamp,
        duration: testRun.duration
      });

      // Keep only last 1000 entries
      index = index.slice(0, 1000);

      // Enforce timestamp ordering to guarantee latest-first reads
      index.sort(
        (a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime()
      );

      await fs.writeFile(this.indexFile, JSON.stringify(index, null, 2));
    } catch (error) {
      console.error('Error updating index:', error);
    }
  }

  /**
   * Get all test runs
   */
  async getAllTestRuns(limit = 100) {
    try {
      const index = await this.getValidIndex();
      
      const runs = await Promise.all(
        index.slice(0, limit).map(entry => this.getTestRun(entry.runId))
      );

      const validRuns = runs.filter(run => run !== null);
      validRuns.sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime());

      return validRuns;
    } catch (error) {
      console.error('Error getting all test runs:', error);
      return [];
    }
  }

  /**
   * Get a single test run by ID
   */
  async getTestRun(runId) {
    try {
      const filePath = path.join(this.dataDir, `${runId}.json`);
      const data = await fs.readFile(filePath, 'utf8');
      return TestRun.fromJSON(JSON.parse(data));
    } catch (error) {
      console.error(`Error getting test run ${runId}:`, error);
      return null;
    }
  }

  /**
   * Get test runs by filter
   */
  async getTestRunsByFilter(filter = {}) {
    try {
      const allRuns = await this.getAllTestRuns(500);
      
      return allRuns.filter(run => {
        if (filter.testType) {
          const stored  = (run.testType || '').toLowerCase();
          const wanted  = filter.testType.toLowerCase();
          // Azure Boards aliases: 'performance', 'azure-boards', 'azure boards', 'work item'
          const isAzureBoards = (t) =>
            t === 'performance' || t === 'azure-boards' ||
            t.includes('azure boards') || t.includes('work item');
          // JMeter aliases
          const isJmeter = (t) => t === 'jmeter' || t.includes('jmeter');

          if (isAzureBoards(wanted)) {
            if (!isAzureBoards(stored)) return false;
          } else if (isJmeter(wanted)) {
            if (!isJmeter(stored)) return false;
          } else {
            if (stored !== wanted) return false;
          }
        }
        if (filter.status && (run.status || '').toLowerCase() !== filter.status.toLowerCase()) return false;
        if (filter.startDate && new Date(run.timestamp) < new Date(filter.startDate)) return false;
        if (filter.endDate && new Date(run.timestamp) > new Date(filter.endDate)) return false;
        return true;
      });
    } catch (error) {
      console.error('Error filtering test runs:', error);
      return [];
    }
  }

  /**
   * Get test run statistics
   */
  async getStatistics() {
    try {
      const allRuns = await this.getAllTestRuns(500);
      
      const stats = {
        total: allRuns.length,
        passed: 0,
        failed: 0,
        functional: 0,
        performance: 0,    // legacy alias for azureBoards
        azureBoards: 0,    // testType === 'performance' (Azure Boards work item runs)
        jmeter: 0,         // testType === 'jmeter' (JMeter performance runs)
        avgDuration: 0,
        recentFailures: []
      };

      let totalDuration = 0;

      allRuns.forEach(run => {
        const status = (run.status || '').toLowerCase();
        const testType = (run.testType || '').toLowerCase();
        
        if (status === 'passed') stats.passed++;
        if (status === 'failed') {
          stats.failed++;
          if (stats.recentFailures.length < 5) {
            stats.recentFailures.push({
              runId: run.runId,
              testType: run.testType,
              timestamp: run.timestamp,
              errorLogs: run.errorLogs
            });
          }
        }
        if (testType === 'functional') stats.functional++;
        if (testType === 'performance' ||
            testType === 'azure-boards' ||
            testType.includes('work item')) {
          stats.azureBoards++;
          stats.performance++; // keep backward compat
        }
        if (testType === 'jmeter' || testType.includes('jmeter')) stats.jmeter++;
        totalDuration += run.duration || 0;
      });

      stats.avgDuration = allRuns.length > 0 ? Math.round(totalDuration / allRuns.length) : 0;
      stats.passRate = allRuns.length > 0 ? ((stats.passed / allRuns.length) * 100).toFixed(2) : 0;

      return stats;
    } catch (error) {
      console.error('Error calculating statistics:', error);
      return null;
    }
  }
}

module.exports = new TestHistoryService();
