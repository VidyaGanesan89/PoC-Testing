const path = require('path');
const fs = require('fs').promises;

class MetricsService {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '../../');
    this.historyFile = path.join(this.projectRoot, 'backend', 'data', 'test-history.json');
  }

  /**
   * Get test metrics
   * @returns {object} metrics data
   */
  async getMetrics() {
    try {
      const history = await this.getHistory();
      
      const totalTests = history.length;
      const passedTests = history.filter(t => t.status === 'passed').length;
      const failedTests = history.filter(t => t.status === 'failed').length;
      const passRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : 0;

      // Calculate average duration
      const testsWithDuration = history.filter(t => t.duration);
      const avgDuration = testsWithDuration.length > 0
        ? Math.round(testsWithDuration.reduce((sum, t) => sum + t.duration, 0) / testsWithDuration.length)
        : 0;

      // Get recent stats (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentTests = history.filter(t => new Date(t.startTime) > sevenDaysAgo);

      return {
        totalTests,
        passedTests,
        failedTests,
        passRate: parseFloat(passRate),
        avgDuration,
        recentTests: recentTests.length,
        lastRun: history.length > 0 ? history[0].startTime : null
      };
    } catch (error) {
      console.error('Error getting metrics:', error);
      // Return default metrics if file doesn't exist
      return {
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        passRate: 0,
        avgDuration: 0,
        recentTests: 0,
        lastRun: null
      };
    }
  }

  /**
   * Get test history
   * @returns {Array} test history
   */
  async getHistory() {
    try {
      const data = await fs.readFile(this.historyFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      // Return empty array if file doesn't exist
      return [];
    }
  }

  /**
   * Get test trends for charts
   * @param {number} days - Number of days to get trends for
   * @returns {Array} daily test results
   */
  async getTrends(days = 7) {
    try {
      const history = await this.getHistory();
      const trends = [];
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);
        
        const dayTests = history.filter(t => {
          const testDate = new Date(t.startTime);
          return testDate >= date && testDate < nextDate;
        });
        
        trends.push({
          date: date.toISOString().split('T')[0],
          total: dayTests.length,
          passed: dayTests.filter(t => t.status === 'passed').length,
          failed: dayTests.filter(t => t.status === 'failed').length
        });
      }
      
      return trends;
    } catch (error) {
      console.error('Error getting trends:', error);
      return [];
    }
  }
}

module.exports = new MetricsService();
