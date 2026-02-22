import { useEffect, useRef, useState } from 'react';
import './App.css';
import GeneratedArtifacts from './components/GeneratedArtifacts';
import MetricsCard from './components/MetricsCard';
import QuickActionCard from './components/QuickActionCard';
import TestHistory from './components/TestHistory';
import TestProgressPanel from './components/TestProgressPanel';
import TestPromptInput from './components/TestPromptInput';
import TestHistoryChat from './components/TestHistoryChat';
import HistoryInsights from './components/HistoryInsights';
import TestCaseMatches from './components/TestCaseMatches';
import ScriptViewerModal from './components/ScriptViewerModal';
import AzureDevOpsStoryCreator from './components/AzureDevOpsStoryCreator';
import JMeterResultsPanel from './components/JMeterResultsPanel';
import { testApi } from './services/api';
import websocketService from './services/websocket';

function App() {
  const [metrics, setMetrics] = useState({ 
    totalRuns: 0, 
    passed: 0, 
    failed: 0, 
    successRate: 0,
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    passRate: 0
  });
  const [testProgress, setTestProgress] = useState(null);
  const [history, setHistory] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');
  const [generatedArtifacts, setGeneratedArtifacts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState('test-generation'); // 'test-generation' or 'azure-devops'
  
  // New state for test case matching
  const [testMatches, setTestMatches] = useState(null);
  const [showMatches, setShowMatches] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [pendingTestRequest, setPendingTestRequest] = useState(null);
  const [autoRegenerateOnReuseFail, setAutoRegenerateOnReuseFail] = useState(true);
  const [scriptViewerData, setScriptViewerData] = useState(null);
  const trackersRef = useRef(new Map());
  const autoRetryTriggeredRef = useRef(new Set());

  // JMeter / Performance test state
  const [jmeterProgress,    setJmeterProgress]    = useState(null);
  const [jmeterTestConfig,  setJmeterTestConfig]  = useState(null);
  const [jmeterSimulation,  setJmeterSimulation]  = useState(false);

  // Handler for when test type changes - clear all state
  const handleTestTypeChange = (newTestType) => {
    console.log('Test type changed to:', newTestType);
    // Clear all test-related state
    setTestProgress(null);
    setGeneratedArtifacts([]);
    setShowMatches(false);
    setTestMatches(null);
    setCurrentPrompt('');
    setPendingTestRequest(null);
    // Clear JMeter state
    setJmeterProgress(null);
    setJmeterTestConfig(null);
    setJmeterSimulation(false);
    // Clear any active trackers
    trackersRef.current.forEach((tracker, testId) => clearTracker(testId));
    trackersRef.current.clear();
    autoRetryTriggeredRef.current.clear();
  };

  const clearTracker = (testId) => {
    const tracker = trackersRef.current.get(testId);
    if (!tracker) return;

    if (typeof tracker.unsubscribe === 'function') {
      tracker.unsubscribe();
    }
    if (tracker.pollInterval) {
      clearInterval(tracker.pollInterval);
    }
    if (tracker.safetyTimeout) {
      clearTimeout(tracker.safetyTimeout);
    }

    trackersRef.current.delete(testId);
  };

  const finalizeRun = (testId, progress) => {
    setTestProgress(progress || null);
    setIsRunning(false);
    loadMetrics();
    loadHistory();
    clearTracker(testId);
    autoRetryTriggeredRef.current.delete(testId);
  };

  const trackTestExecution = (testId, options = {}) => {
    const { onFailed } = options;
    clearTracker(testId);

    const unsubscribe = websocketService.subscribe(testId, (progress) => {
      setTestProgress(progress);
      if (progress.status === 'passed' || progress.status === 'failed') {
        if (progress.status === 'failed' && typeof onFailed === 'function') {
          const handled = onFailed(progress);
          if (handled === true) {
            clearTracker(testId);
            return;
          }
        }
        finalizeRun(testId, progress);
      }
    });

    const pollInterval = setInterval(async () => {
      try {
        const statusResponse = await testApi.getTestStatus(testId);
        const status = statusResponse?.data?.status;
        if (status === 'passed' || status === 'failed') {
          if (status === 'failed' && typeof onFailed === 'function') {
            const handled = onFailed({
              testId,
              status,
              message: `Test ${status}`,
              exitCode: statusResponse?.data?.exitCode,
              duration: statusResponse?.data?.duration,
              timestamp: new Date()
            });
            if (handled === true) {
              clearTracker(testId);
              return;
            }
          }
          finalizeRun(testId, {
            testId,
            status,
            message: `Test ${status}`,
            exitCode: statusResponse?.data?.exitCode,
            duration: statusResponse?.data?.duration,
            timestamp: new Date()
          });
        }
      } catch (error) {
        console.warn('Polling test status failed:', error.message);
      }
    }, 4000);

    const safetyTimeout = setTimeout(() => {
      setIsRunning(false);
      clearTracker(testId);
      alert('Test execution took too long to report completion. Please check history/logs.');
    }, 10 * 60 * 1000);

    trackersRef.current.set(testId, { unsubscribe, pollInterval, safetyTimeout });
  };

  useEffect(() => {
    // Connect to WebSocket
    websocketService.connect();
    setConnectionStatus('Connected');

    // Load initial data
    loadMetrics();
    loadHistory();
    
    // Set loading to false after initial load attempt
    setTimeout(() => setIsLoading(false), 1000);

    // Refresh metrics every 5 seconds
    const interval = setInterval(() => {
      loadMetrics();
      loadHistory();
    }, 5000);

    return () => {
      clearInterval(interval);
      for (const testId of trackersRef.current.keys()) {
        clearTracker(testId);
      }
      websocketService.disconnect();
    };
  }, []);

  const loadMetrics = async () => {
    try {
      const response = await testApi.getMetrics();
      const data = response.data || {};
      setMetrics({
        totalRuns: data.totalTests || 0,
        passed: data.passedTests || 0,
        failed: data.failedTests || 0,
        successRate: data.passRate || 0,
        totalTests: data.totalTests || 0,
        passedTests: data.passedTests || 0,
        failedTests: data.failedTests || 0,
        passRate: data.passRate || 0
      });
    } catch (error) {
      console.error('Error loading metrics:', error);
    }
  };

  const loadHistory = async () => {
    try {
      const response = await testApi.getTestHistory(10);
      setHistory(Array.isArray(response.data) ? response.data : response.data.history || []);
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const handleRunTest = async (testRequest) => {
    console.log('=== handleRunTest called ===');
    console.log('Test request:', testRequest);

    // ── JMeter branch: skip matching, go straight to performance API ──
    if (testRequest.testType === 'jmeter') {
      await createPerformanceTest(testRequest);
      return;
    }

    // Store the prompt for potential test matching
    setCurrentPrompt(testRequest.prompt);
    setPendingTestRequest(testRequest);
    setAutoRegenerateOnReuseFail(testRequest.autoRegenerateOnReuseFail !== false);
    console.log('Stored current prompt:', testRequest.prompt);
    
    // First, check for matching test cases
    try {
      setIsLoading(true);
      console.log('Searching for test matches for prompt:', testRequest.prompt);
      console.log('Test type:', testRequest.testType);
      const matchResponse = await testApi.findTestMatches(testRequest.prompt, testRequest.testType);
      console.log('Match response:', matchResponse.data);
      const { exactMatches = [], similarMatches = [] } = matchResponse.data;
      
      if (exactMatches.length > 0 || similarMatches.length > 0) {
        // Show matches to user for selection
        console.log('✅ Matches found! Showing TestCaseMatches component');
        console.log('Exact matches:', exactMatches.length, 'Similar matches:', similarMatches.length);
        setTestMatches({ exactMatches, similarMatches });
        setShowMatches(true);
        setIsLoading(false);
        return; // Wait for user decision
      }
      
      // No matches found, proceed with creating new test
      console.log('ℹ️ No matches found, proceeding with new test creation');
      setIsLoading(false);
      await createNewTest(testRequest);
      
    } catch (error) {
      console.error('❌ Error checking for test matches:', error);
      // If matching fails, proceed with creating new test anyway
      setIsLoading(false);
      await createNewTest(testRequest);
    }
  };

  const createNewTest = async (testRequest) => {
    console.log('=== createNewTest called ===');
    console.log('Test request:', testRequest);
    
    // Clean up state before starting new test generation
    setIsRunning(true);
    setShowMatches(false);
    setTestMatches(null);
    setGeneratedArtifacts([]); // Clear old artifacts before generating new ones
    // Show the progress panel immediately so the user gets feedback
    setTestProgress({
      status: 'generating',
      message: 'Generating test script with AI...',
      percentage: 5,
      timestamp: new Date()
    });
    
    try {
      console.log('Calling backend API to generate test...');
      const response = await testApi.generateAITest(testRequest);
      console.log('Backend response:', response.data);
      
      // Add real artifacts from backend response
      if (response.data.artifacts && Array.isArray(response.data.artifacts)) {
        console.log('Setting artifacts:', response.data.artifacts);
        setGeneratedArtifacts(response.data.artifacts); // Replace instead of append
      }

      // Check if this is Azure Boards mode (CSV only, no test execution)
      const isAzureBoardsMode = response.data.mode && 
        (response.data.mode.includes('csv-testcase') || response.data.mode === 'Azure Boards');
      
      if (isAzureBoardsMode) {
        console.log('Azure Boards mode detected - CSV generated, no test execution');
        setIsRunning(false);
        // Show success message with CSV details
        if (response.data.csvFileName) {
          setTestProgress({
            status: 'completed',
            message: `CSV test case generated: ${response.data.csvFileName}`,
            testStepCount: response.data.testStepCount,
            csvFilePath: response.data.csvFilePath,
            timestamp: new Date()
          });
        }
      } else {
        // Normal test execution mode - track progress
        const testId = response.data.testId;
        console.log('Tracking progress for test ID:', testId);
        trackTestExecution(testId);
      }
    } catch (error) {
      console.error('Error running test:', error);
      setIsRunning(false);
      alert('Failed to start test: ' + (error.response?.data?.message || error.message));
    }
  };

  // ── JMeter / Performance test flow ───────────────────────────────────────
  const createPerformanceTest = async (testRequest) => {
    const cfg = testRequest.jmeterConfig || {};
    setIsRunning(true);
    setJmeterTestConfig(cfg);
    setJmeterProgress({
      status: 'running',
      message: 'Launching JMeter performance test...',
      percentage: 5,
      timestamp: new Date()
    });
    setTestProgress(null);
    setGeneratedArtifacts([]);

    try {
      const resp = await testApi.startPerformanceTest({
        prompt:       testRequest.prompt,
        testName:     cfg.testName || testRequest.prompt || 'Performance Test',
        targetUrl:    cfg.targetUrl,
        httpMethod:   cfg.httpMethod,
        threads:      cfg.threads,
        rampUp:       cfg.rampUp,
        duration:     cfg.duration,
        requestBody:  cfg.requestBody,
        contentType:  cfg.contentType,
        scenarioType: cfg.scenarioType,
        assertions:   cfg.assertions || [],
        endpoints:    cfg.endpoints || []
      });

      const testId = resp.data.testId;
      setJmeterSimulation(resp.data.simulation || false);
      console.log('[JMeter] Started, testId:', testId, 'simulation:', resp.data.simulation);

      // Subscribe to WebSocket events for this testId
      const unsubscribe = websocketService.subscribe(testId, (prog) => {
        setJmeterProgress(prog);
        if (prog.status === 'passed' || prog.status === 'failed' || prog.status === 'warning') {
          setIsRunning(false);
          unsubscribe();
        }
      });

      // Polling fallback
      const poll = setInterval(async () => {
        try {
          const s = await testApi.getPerformanceTestStatus(testId);
          const run = s.data;
          if (run.result) {
            setJmeterProgress({
              testId,
              status:       run.status,
              message:      `Performance test ${run.status}`,
              percentage:   100,
              jmeterResult: run.result,
              reportUrl:    run.reportUrl,
              timestamp:    new Date()
            });
            setJmeterSimulation(run.simulation || false);
            setIsRunning(false);
            clearInterval(poll);
            unsubscribe();
          }
        } catch (_) { /* ignore poll errors */ }
      }, 3000);

      // Safety timeout (duration + 60s)
      setTimeout(() => {
        clearInterval(poll);
        setIsRunning(false);
      }, ((cfg.duration || 60) + 60) * 1000);

    } catch (err) {
      console.error('Failed to start performance test:', err);
      setIsRunning(false);
      setJmeterProgress({
        status: 'failed',
        message: 'Failed to start performance test: ' + (err.response?.data?.error || err.message),
        percentage: 0,
        timestamp: new Date()
      });
    }
  };

  const handleRunExistingTest = async (match) => {
    setIsRunning(true);
    setShowMatches(false);
    
    try {
      // Run the existing test by class name
      const response = await testApi.runTest({
        testClass: match.className,
        testType: 'functional',
        browser: 'chrome',
        headless: false
      });

      const testId = response.data.testId;

      // Add artifact for reused test
      const artifact = {
        fileName: `${match.className}.java`,
        type: 'Reused Test',
        timestamp: new Date(),
        description: `Reusing existing test (${(match.similarity * 100).toFixed(1)}% match): ${match.prompt || match.className}`
      };

      setGeneratedArtifacts(prev => [artifact, ...prev]);

      // Track progress with websocket + polling fallback
      trackTestExecution(testId, {
        onFailed: () => {
          // Check if auto-regeneration is enabled
          if (!autoRegenerateOnReuseFail) {
            console.log('Auto-regeneration disabled, showing failure');
            return false; // Show normal failure
          }

          // Prevent duplicate retry attempts
          if (autoRetryTriggeredRef.current.has(testId)) {
            console.log('Auto-retry already triggered for this test, skipping');
            return false;
          }

          console.log('🔄 Reused test failed. Auto-generating new script...');
          
          // Determine the prompt to use
          const fallbackPrompt = (currentPrompt && currentPrompt.trim())
            || (match.prompt && match.prompt.trim())
            || `Create a functional test for ${match.className}`;

          // Build retry request
          const retryRequest = {
            prompt: fallbackPrompt,
            testType: pendingTestRequest?.testType || 'functional',
            llm: pendingTestRequest?.llm || 'GPT-4o',
            forceNew: true, // Force new generation
            autoRegenerateOnReuseFail: false // Disable auto-retry for the regenerated test
          };

          // Mark retry as triggered
          autoRetryTriggeredRef.current.add(testId);
          
          // Show notification instead of alert
          setTestProgress({
            status: 'regenerating',
            message: 'Reused test failed. Auto-generating a new test script...',
            percentage: 0
          });

          // Delay to allow user to see the regeneration message
          setTimeout(() => {
            createNewTest(retryRequest).catch((error) => {
              console.error('❌ Auto-regeneration after reuse failure failed:', error);
              setIsRunning(false);
              alert(`Auto-regeneration failed: ${error.message}. Please try creating a new test manually.`);
            });
          }, 1000);
          
          return true; // Indicate we handled the failure
        }
      });

      setTestMatches(null);
    } catch (error) {
      console.error('❌ Error running existing test:', error);
      setIsRunning(false);
      
      // Provide more helpful error message
      const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
      alert(`Failed to run existing test: ${errorMsg}\n\nPlease try creating a new test instead.`);
      
      // Optionally offer to create new test
      if (window.confirm('Would you like to create a new test instead?')) {
        const retryRequest = {
          prompt: currentPrompt || match.prompt || `Create test for ${match.className}`,
          testType: pendingTestRequest?.testType || 'functional',
          llm: pendingTestRequest?.llm || 'GPT-4o',
          forceNew: true
        };
        await createNewTest(retryRequest).catch(err => {
          console.error('Failed to create new test:', err);
        });
      }
    }
  };

  const handleViewScript = async (match) => {
    try {
      const response = await testApi.getTestFile(match.className);
      if (response.data.success) {
        setScriptViewerData({
          testClass: response.data.testClass,
          testContent: response.data.testContent,
          pageObjectContent: response.data.pageObjectContent
        });
      } else {
        alert('Failed to load test script: ' + (response.data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error loading test script:', error);
      alert('Failed to load test script: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleCreateNewAnyway = async () => {
    console.log('Creating new test anyway. Current prompt:', currentPrompt);
    
    if (!currentPrompt || currentPrompt.trim() === '') {
      alert('Error: No prompt found. Please enter a test prompt and try again.');
      setShowMatches(false);
      setTestMatches(null);
      return;
    }
    
    // User chose to create new test despite matches
    const fallbackRequest = {
      prompt: currentPrompt,
      testType: 'functional',
      llm: 'GPT-4o'
    };

    const baseRequest = (pendingTestRequest && pendingTestRequest.prompt)
      ? pendingTestRequest
      : fallbackRequest;

    const testRequest = {
      ...baseRequest,
      prompt: (baseRequest.prompt || currentPrompt).trim(),
      forceNew: true
    };
    
    console.log('Test request:', testRequest);
    await createNewTest(testRequest);
  };

  const handleQuickAction = async (type) => {
    if (type === 'azure-devops') {
      // Switch to Azure DevOps Story Creator view
      setCurrentView('azure-devops');
      return;
    }

    setIsRunning(true);
    try {
      let response;
      if (type === 'functional') {
        // Run multiple existing functional tests
        response = await testApi.runTest({
          testType: 'functional',
          testClass: 'ContactUsFormTest,LanguageSelectTest,OfficesCountrySelectTest,InsureShieldCountrySelectTest,InsureShieldDeliveryDefenseTest,GeneratedTest_1771780168393,GeneratedTest_1771780645231',
          browser: 'chrome',
          headless: false
        });

      } else if (type === 'performance') {
        response = await testApi.runTest({
          testType: 'performance',
          testClass: '',
          browser: 'chrome',
          headless: false
        });
      }

      const testId = response.data.testId;
      trackTestExecution(testId);
    } catch (error) {
      console.error('Error running quick action:', error);
      setIsRunning(false);
      alert('Failed to start test: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleStoryCreated = (workItem) => {
    console.log('Work item created:', workItem);
    // Optionally switch back to test generation view after creation
    // setCurrentView('test-generation');
  };

  const handleViewChange = (view) => {
    setCurrentView(view);
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-4">
            Accelerating Quality with AI-Driven Test Automation
          </h1>
          <h2 className="text-2xl text-white opacity-90 mb-2">Testing Platform</h2>
          <p className="text-white opacity-80 mb-4">Welcome to Your Testing Dashboard.</p>
          <p className="text-white opacity-80">Manage and execute your automated test suites with ease</p>
          <div className="mt-4">
            <span className="inline-block px-3 py-1 bg-white bg-opacity-20 rounded-full text-white text-sm">
              {connectionStatus}
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-2 flex gap-2">
            <button
              onClick={() => handleViewChange('test-generation')}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
                currentView === 'test-generation'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'text-white hover:bg-white hover:bg-opacity-10'
              }`}
            >
              🧪 Test Generation
            </button>
            <button
              onClick={() => handleViewChange('azure-devops')}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
                currentView === 'azure-devops'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'text-white hover:bg-white hover:bg-opacity-10'
              }`}
            >
              📋 Azure DevOps
            </button>
          </div>
        </div>

        {/* Test Generation View */}
        {currentView === 'test-generation' && (
          <>
            {/* Test Input */}
            <div className="mb-8">
              <TestPromptInput 
                onSubmit={handleRunTest} 
                isRunning={isRunning} 
                onTestTypeChange={handleTestTypeChange}
              />
            </div>

            {/* Test Case Matches - shown when similar tests found */}
            {showMatches && testMatches && (
              <TestCaseMatches
                exactMatches={testMatches.exactMatches || []}
                similarMatches={testMatches.similarMatches || []}
                onRunExisting={handleRunExistingTest}
                onViewScript={handleViewScript}
                onCreateNew={handleCreateNewAnyway}
            loading={isRunning}
          />
        )}

        {/* Generated Artifacts */}
        <div className="mb-8">
          <GeneratedArtifacts artifacts={generatedArtifacts} />
        </div>

        {/* Test Progress (functional/azure boards) */}
        {testProgress && (
          <div className="mb-8">
            <TestProgressPanel testProgress={testProgress} />
          </div>
        )}

        {/* JMeter Performance Test Results */}
        {jmeterProgress && (
          <div className="mb-8">
            <JMeterResultsPanel
              progress={jmeterProgress}
              testConfig={jmeterTestConfig}
              simulation={jmeterSimulation}
            />
          </div>
        )}

        {/* Metrics Overview */}
        <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Test Metrics Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricsCard
              icon="▶️"
              title="Total Runs"
              value={metrics.totalRuns}
              color="blue"
            />
            <MetricsCard
              icon="✓"
              title="Passed"
              value={metrics.passed}
              color="green"
            />
            <MetricsCard
              icon="✗"
              title="Failed"
              value={metrics.failed}
              color="red"
            />
            <MetricsCard
              icon="🎯"
              title="Success Rate"
              value={`${(metrics.successRate || 0).toFixed(1)}%`}
              color="purple"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <QuickActionCard
              icon="🧪"
              title="Run Functional Tests"
              description="Execute Selenium test suites"
              onClick={() => handleQuickAction('functional')}
              color="purple"
            />
            <QuickActionCard
              icon="📋"
              title="Azure Boards – Work Item Management"
              description="Create User Stories and Tasks"
              onClick={() => handleQuickAction('azure-devops')}
              color="orange"
            />
            <QuickActionCard
              icon="🕐"
              title="View History"
              description="Review past test results"
              onClick={() => { }}
              color="blue"
            />
          </div>
        </div>

        {/* Test History */}
        <TestHistory history={history} />

        {/* RAG-Powered Test History Analysis */}
        <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">AI-Powered Test History</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TestHistoryChat apiBaseUrl="http://localhost:8080/api" />
            <HistoryInsights apiBaseUrl="http://localhost:8080/api" />
          </div>
        </div>
          </>
        )}

        {/* Azure DevOps View */}
        {currentView === 'azure-devops' && (
          <AzureDevOpsStoryCreator onStoryCreated={handleStoryCreated} />
        )}
      </div>

      {/* Script Viewer Modal */}
      {scriptViewerData && (
        <ScriptViewerModal
          isOpen={!!scriptViewerData}
          onClose={() => setScriptViewerData(null)}
          testClass={scriptViewerData.testClass}
          testContent={scriptViewerData.testContent}
          pageObjectContent={scriptViewerData.pageObjectContent}
        />
      )}
    </div>
  );
}

export default App;

