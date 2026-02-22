const testHistoryService = require('./testHistoryService');

/**
 * Simple Query Service (No OpenAI Required)
 * Provides keyword-based search and filtering
 */
class SimpleQueryService {
  /**
   * Query test history using keywords
   */
  async query(question) {
    try {
      const allRuns = await testHistoryService.getAllTestRuns(100);
      
      console.log('[SIMPLE-QUERY] Question:', question);
      console.log('[SIMPLE-QUERY] Total test runs loaded:', allRuns.length);
      
      // Parse question for keywords
      const keywords = this.extractKeywords(question.toLowerCase());
      
      // Filter test runs based on question intent
      let filteredRuns = this.filterRunsByQuestion(question, allRuns);
      
      console.log('[SIMPLE-QUERY] Filtered runs count:', filteredRuns.length);
      
      // If no runs found after filtering, return message with total count
      if (filteredRuns.length === 0 && allRuns.length > 0) {
        return {
          success: true,
          question,
          answer: `No test runs found matching your specific query. However, there are ${allRuns.length} test run(s) in the database. Try asking: "Show all test runs" or "What was the last test run?"`,
          relevantRuns: []
        };
      }
      
      if (filteredRuns.length === 0 && allRuns.length === 0) {
        return {
          success: true,
          question,
          answer: "No test runs found in the database yet. Run a test first to see it here!",
          relevantRuns: []
        };
      }
      
      // If no specific filter, rank by relevance
      if (filteredRuns.length === allRuns.length) {
        const rankedRuns = allRuns
          .map(run => ({
            run,
            score: this.calculateRelevanceScore(run, keywords)
          }))
          .filter(item => item.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, 5);
        filteredRuns = rankedRuns.map(r => r.run);
      }

      // Generate simple answer
      const answer = this.generateSimpleAnswer(question, filteredRuns, allRuns);

      return {
        success: true,
        question,
        answer,
        relevantRuns: filteredRuns.slice(0, 10).map(run => {
          const runData = run.toJSON ? run.toJSON() : run;
          return {
            runId: runData.runId,
            testType: runData.testType,
            status: runData.status,
            timestamp: runData.timestamp,
            duration: runData.duration,
            prompt: runData.prompt
          };
        })
      };
    } catch (error) {
      console.error('Error in simple query:', error);
      return {
        success: false,
        error: error.message,
        relevantRuns: []
      };
    }
  }

  /**
   * Filter test runs based on question intent
   */
  filterRunsByQuestion(question, allRuns) {
    const q = question.toLowerCase();
    
    // Show only failed tests
    if (q.match(/show.*failed|all.*failed|failed.*test/)) {
      return allRuns.filter(r => r.status.toLowerCase() === 'failed');
    }
    
    // Show only passed tests
    if (q.match(/show.*passed|all.*passed|passed.*test/)) {
      return allRuns.filter(r => r.status.toLowerCase() === 'passed');
    }
    
    // Show functional tests
    if (q.match(/show.*functional|functional.*test/)) {
      return allRuns.filter(r => r.testType.toLowerCase().includes('functional'));
    }
    
    // Show performance tests
    if (q.match(/show.*performance|performance.*test/)) {
      return allRuns.filter(r => r.testType.toLowerCase().includes('performance'));
    }
    
    // Show last/recent test
    if (q.match(/last.*test|recent.*test|what.*last/)) {
      return allRuns.slice(0, 1);
    }
    
    // Show tests from today
    if (q.match(/today|ran.*today/)) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return allRuns.filter(r => new Date(r.timestamp) >= today);
    }
    
    // Default: return all for general queries like "list all test runs"
    return allRuns;
  }

  /**
   * Extract keywords from question
   */
  extractKeywords(question) {
    const keywords = {
      status: [],
      time: [],
      action: [],
      testType: []
    };

    const q = question.toLowerCase();

    // Status keywords
    if (q.match(/\b(fail|failed|failing|error)\b/)) keywords.status.push('failed');
    if (q.match(/\b(pass|passed|passing|success)\b/)) keywords.status.push('passed');
    
    // Time keywords
    if (q.match(/\b(last|latest|recent|newest)\b/)) keywords.time.push('recent');
    if (q.match(/\b(first|oldest|initial)\b/)) keywords.time.push('oldest');
    if (q.match(/\b(today)\b/)) keywords.time.push('today');
    
    // Action keywords
    if (q.match(/\b(why|reason|cause)\b/)) keywords.action.push('analyze');
    if (q.match(/\b(when|time|date)\b/)) keywords.action.push('time');
    if (q.match(/\b(how many|count|number)\b/)) keywords.action.push('count');
    if (q.match(/\b(list|show|display|all)\b/)) keywords.action.push('list');
    
    // Test type
    if (q.match(/\b(functional|function)\b/)) keywords.testType.push('functional');
    if (q.match(/\b(performance|load|stress)\b/)) keywords.testType.push('performance');
    if (q.match(/\b(selenium)\b/)) keywords.testType.push('selenium');

    return keywords;
  }

  /**
   * Calculate relevance score
   */
  calculateRelevanceScore(testRun, keywords) {
    let score = 0;
    const runData = testRun.toJSON ? testRun.toJSON() : testRun;

    // Status match (case-insensitive)
    if (keywords.status.length > 0) {
      const runStatus = (runData.status || '').toLowerCase();
      if (keywords.status.some(s => s.toLowerCase() === runStatus)) {
        score += 10;
      }
    }

    // Test type match (case-insensitive)
    if (keywords.testType.length > 0) {
      const runType = (runData.testType || '').toLowerCase();
      if (keywords.testType.some(t => runType.includes(t.toLowerCase()))) {
        score += 5;
      }
    }

    // Time relevance (recent = higher score)
    if (keywords.time.includes('recent')) {
      const age = Date.now() - new Date(runData.timestamp).getTime();
      const dayAge = age / (1000 * 60 * 60 * 24);
      score += Math.max(0, 10 - dayAge); // Recent tests get higher scores
    }

    if (keywords.time.includes('oldest')) {
      const age = Date.now() - new Date(runData.timestamp).getTime();
      const dayAge = age / (1000 * 60 * 60 * 24);
      score += dayAge; // Older tests get higher scores
    }

    // Default: always return some score for latest test
    if (score === 0) {
      const age = Date.now() - new Date(runData.timestamp).getTime();
      score = 1000 / (age + 1); // Most recent gets highest base score
    }

    return score;
  }

  /**
   * Generate simple text answer
   */
  generateSimpleAnswer(question, filteredRuns, allTestRuns) {
    if (filteredRuns.length === 0) {
      return "No test runs found matching your query.";
    }

    const topRun = filteredRuns[0];
    const runData = topRun.toJSON ? topRun.toJSON() : topRun;
    const allRuns = allTestRuns || filteredRuns;

    // Build answer based on question type
    const q = question.toLowerCase();

    // Why did the last test fail? (Check this FIRST before "last test run")
    if (q.match(/why.*fail|reason.*fail|cause.*fail/)) {
      const failedRun = allRuns.find(r => r.status.toLowerCase() === 'failed');
      if (failedRun) {
        const fData = failedRun.toJSON ? failedRun.toJSON() : failedRun;
        const errors = fData.errorLogs && fData.errorLogs.length > 0
          ? fData.errorLogs.slice(0, 2).join('. ')
          : 'No specific error details available. Check the test report for more information.';
        return `The test "${fData.testClass}${fData.testMethod ? '.' + fData.testMethod : ''}" failed.\n\nError: ${errors}`;
      } else {
        return `No failed tests found in recent history. All ${allRuns.length} test(s) passed successfully! 🎉`;
      }
    }

    // What was the last test run?
    if (q.match(/what.*last.*test.*run|last.*test.*run/)) {
      const duration = (runData.duration / 1000).toFixed(2);
      const time = new Date(runData.timestamp).toLocaleString();
      return `The last test run was "${runData.testClass || 'Unknown'}${runData.testMethod ? '.' + runData.testMethod : ''}" which ${runData.status.toLowerCase()} at ${time}. It took ${duration} seconds to complete.`;
    }

    // Show all passed tests
    if (q.match(/show.*passed|all.*passed|passed.*test/)) {
      const passedTests = allRuns.filter(r => r.status.toLowerCase() === 'passed');
      if (passedTests.length === 0) {
        return 'No passed tests found in recent history.';
      }
      const summary = passedTests.slice(0, 10).map(r => {
        const rData = r.toJSON ? r.toJSON() : r;
        const duration = (rData.duration / 1000).toFixed(2);
        return `✅ ${rData.testClass}${rData.testMethod ? '.' + rData.testMethod : ''} (${duration}s) - ${new Date(rData.timestamp).toLocaleString()}`;
      }).join('\n');
      return `Found ${passedTests.length} passed test(s):\n\n${summary}${passedTests.length > 10 ? '\n\n...and ' + (passedTests.length - 10) + ' more' : ''}`;
    }

    // Show all failed tests
    if (q.match(/show.*failed|all.*failed|failed.*test/)) {
      const failedTests = allRuns.filter(r => r.status.toLowerCase() === 'failed');
      if (failedTests.length === 0) {
        return 'No failed tests found in recent history. Great job! 🎉';
      }
      const summary = failedTests.slice(0, 10).map(r => {
        const rData = r.toJSON ? r.toJSON() : r;
        const duration = (rData.duration / 1000).toFixed(2);
        return `❌ ${rData.testClass}${rData.testMethod ? '.' + rData.testMethod : ''} (${duration}s) - ${new Date(rData.timestamp).toLocaleString()}`;
      }).join('\n');
      return `Found ${failedTests.length} failed test(s):\n\n${summary}${failedTests.length > 10 ? '\n\n...and ' + (failedTests.length - 10) + ' more' : ''}`;
    }

    // How many tests passed?
    if (q.match(/how many.*pass|count.*pass|number.*pass/)) {
      const passedCount = allRuns.filter(r => r.status.toLowerCase() === 'passed').length;
      const totalCount = allRuns.length;
      const passRate = totalCount > 0 ? ((passedCount / totalCount) * 100).toFixed(1) : 0;
      return `${passedCount} test(s) passed out of ${totalCount} total tests (${passRate}% pass rate).`;
    }

    // Show recent test results
    if (q.match(/recent.*test|show.*recent|latest.*result/)) {
      const recent = allRuns.slice(0, 5);
      const summary = recent.map(r => {
        const rData = r.toJSON ? r.toJSON() : r;
        const duration = (rData.duration / 1000).toFixed(2);
        const icon = rData.status.toLowerCase() === 'passed' ? '✅' : '❌';
        return `${icon} ${rData.testClass}${rData.testMethod ? '.' + rData.testMethod : ''} - ${rData.status} (${duration}s)\n   ${new Date(rData.timestamp).toLocaleString()}`;
      }).join('\n\n');
      return `Recent test results (${recent.length} most recent):\n\n${summary}`;
    }

    // What tests ran today?
    if (q.match(/test.*today|ran today|today.*test/)) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayTests = allRuns.filter(r => {
        const testDate = new Date(r.timestamp);
        testDate.setHours(0, 0, 0, 0);
        return testDate.getTime() === today.getTime();
      });
      
      if (todayTests.length === 0) {
        return 'No tests ran today yet.';
      }
      
      const passed = todayTests.filter(r => r.status.toLowerCase() === 'passed').length;
      const failed = todayTests.length - passed;
      const summary = todayTests.slice(0, 10).map(r => {
        const rData = r.toJSON ? r.toJSON() : r;
        const icon = rData.status.toLowerCase() === 'passed' ? '✅' : '❌';
        return `${icon} ${rData.testClass}${rData.testMethod ? '.' + rData.testMethod : ''} - ${rData.status}`;
      }).join('\n');
      
      return `${todayTests.length} test(s) ran today: ${passed} passed, ${failed} failed\n\n${summary}${todayTests.length > 10 ? '\n\n...and ' + (todayTests.length - 10) + ' more' : ''}`;
    }

    // List all test runs
    if (q.match(/list.*test|all.*test.*run|show.*all/)) {
      const summary = allRuns.slice(0, 15).map((r, idx) => {
        const rData = r.toJSON ? r.toJSON() : r;
        const icon = rData.status.toLowerCase() === 'passed' ? '✅' : '❌';
        const duration = (rData.duration / 1000).toFixed(2);
        return `${idx + 1}. ${icon} ${rData.testClass}${rData.testMethod ? '.' + rData.testMethod : ''} - ${rData.status} (${duration}s)\n    ${new Date(rData.timestamp).toLocaleString()}`;
      }).join('\n\n');
      return `All test runs (${allRuns.length} total):\n\n${summary}${allRuns.length > 15 ? '\n\n...and ' + (allRuns.length - 15) + ' more' : ''}`;
    }

    // Show functional test results
    if (q.match(/functional.*test|show.*functional/)) {
      const functionalTests = allRuns.filter(r => (r.testType || '').toLowerCase().includes('functional'));
      if (functionalTests.length === 0) {
        return 'No functional tests found in recent history.';
      }
      const passed = functionalTests.filter(r => r.status.toLowerCase() === 'passed').length;
      const summary = functionalTests.slice(0, 10).map(r => {
        const rData = r.toJSON ? r.toJSON() : r;
        const icon = rData.status.toLowerCase() === 'passed' ? '✅' : '❌';
        const duration = (rData.duration / 1000).toFixed(2);
        return `${icon} ${rData.testClass}${rData.testMethod ? '.' + rData.testMethod : ''} - ${rData.status} (${duration}s)`;
      }).join('\n');
      return `Found ${functionalTests.length} functional test(s): ${passed} passed, ${functionalTests.length - passed} failed\n\n${summary}${functionalTests.length > 10 ? '\n\n...and ' + (functionalTests.length - 10) + ' more' : ''}`;
    }

    // Generic count query
    if (q.match(/how many|count/)) {
      const stats = rankedRuns.reduce((acc, item) => {
        const status = item.run.status.toLowerCase();
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});
      return `Found ${rankedRuns.length} test runs. Status breakdown: ${Object.entries(stats).map(([k, v]) => `${k}: ${v}`).join(', ')}`;
    }

    // Default answer
    const duration = (runData.duration / 1000).toFixed(2);
    return `Found test: "${runData.testClass}${runData.testMethod ? '.' + runData.testMethod : ''}"\nStatus: ${runData.status}\nDuration: ${duration}s\nRun at: ${new Date(runData.timestamp).toLocaleString()}`;
  }
}

module.exports = new SimpleQueryService();
