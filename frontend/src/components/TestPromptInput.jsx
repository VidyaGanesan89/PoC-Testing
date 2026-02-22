import { useState, useEffect, useRef } from 'react';
import { testApi } from '../services/api';

const TestPromptInput = ({ onSubmit, isRunning, onTestTypeChange }) => {
    const [prompt, setPrompt] = useState('');
    const [testType, setTestType] = useState('functional');
    const [llmModel, setLlmModel] = useState('GPT-4o');
    const [autoRegenerateOnReuseFail, setAutoRegenerateOnReuseFail] = useState(true);
    const [relatedWorkItemIds, setRelatedWorkItemIds] = useState('');
    const [workItemType, setWorkItemType] = useState('Task');
    const [fetchedWorkItem, setFetchedWorkItem] = useState(null);
    const [isFetching, setIsFetching] = useState(false);
    const [fetchError, setFetchError] = useState('');
    const previousTestTypeRef = useRef(testType);

    // JMeter / Performance Test state
    const [jmeterConfig, setJmeterConfig] = useState({
        targetUrl:    '',
        httpMethod:   'GET',
        threads:      10,
        rampUp:       30,
        duration:     60,
        requestBody:  '',
        contentType:  'application/json',
        scenarioType: 'http-request',
        assertions:   [],
        endpoints:    []
    });
    const updateJmeter = (key, value) => setJmeterConfig(prev => ({ ...prev, [key]: value }));

    // Reset form when test type changes (but not on initial mount)
    useEffect(() => {
        // Only clear if test type actually changed (not on first render)
        if (previousTestTypeRef.current !== testType) {
            // Clear the prompt
            setPrompt('');
            // Reset Azure DevOps fields
            setRelatedWorkItemIds('');
            setWorkItemType('Task');
            setFetchedWorkItem(null);
            setFetchError('');
            // Notify parent component to clear its state
            if (onTestTypeChange) {
                onTestTypeChange(testType);
            }
            // Update the ref to current test type
            previousTestTypeRef.current = testType;
        }
    }, [testType]);

    const fetchWorkItem = async (id) => {
        const trimmed = String(id || '').trim();
        if (!trimmed) return;
        const firstId = trimmed.split(',')[0].trim();
        if (!firstId || isNaN(Number(firstId))) {
            setFetchError('Enter a valid numeric Work Item ID to fetch from ADO.');
            setFetchedWorkItem(null);
            return;
        }
        setIsFetching(true);
        setFetchError('');
        setFetchedWorkItem(null);
        try {
            const res = await testApi.getWorkItemById(firstId);
            const wi = res.data.workItem;
            setFetchedWorkItem(wi);
            // Auto-sync Work Item Type dropdown
            const validTypes = ['Task', 'Bug', 'User Story'];
            if (wi.type && validTypes.includes(wi.type)) {
                setWorkItemType(wi.type);
            }
        } catch (err) {
            const msg = err?.response?.data?.error || err.message || 'Failed to fetch work item';
            setFetchError(msg);
        } finally {
            setIsFetching(false);
        }
    };

    const llmModels = [
        { value: 'GPT-4o',           label: 'GPT-4o (Azure OpenAI)',          emoji: '🔵' },
        { value: 'Claude Sonnet 4.6', label: 'Claude Sonnet 4.6 (Agent Mode)', emoji: '🤖' },
        { value: 'Pattern Matching',  label: 'Pattern Matching (Fallback)',     emoji: '⚙️' }
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!prompt.trim() && testType !== 'jmeter') return;
        // For JMeter, prompt is optional (test name)
        if (testType === 'jmeter' && !jmeterConfig.targetUrl.trim()) return;

        const request = {
            prompt,
            testType,
            llm: llmModel,
            autoRegenerateOnReuseFail
        };

        if (testType === 'performance') {
            const parsedRelatedWorkItemIds = relatedWorkItemIds
                .split(',')
                .map((id) => id.trim())
                .filter(Boolean);

            request.azureDevOps = {
                relatedWorkItemIds: parsedRelatedWorkItemIds,
                workItemType
            };
        }

        if (testType === 'jmeter') {
            request.jmeterConfig = {
                ...jmeterConfig,
                testName: prompt.trim() || `Performance Test – ${jmeterConfig.targetUrl}`
            };
        }

        onSubmit({ ...request });
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">AI-Driven Test Generation</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Test Description / Prompt
                    </label>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder={
                            testType === 'jmeter'
                                ? 'Optional: Describe the performance test scenario (used as the test name)...'
                                : "Describe the test you want to create... (e.g., 'Test the contact form with invalid email addresses')"
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-y"
                        rows="10"
                        disabled={isRunning}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            AI Model
                        </label>
                        <select
                            value={llmModel}
                            onChange={(e) => setLlmModel(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            disabled={isRunning}
                        >
                            {llmModels.map((model) => (
                                <option key={model.value} value={model.value}>
                                    {model.emoji} {model.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Test Type
                        </label>
                        <select
                            value={testType}
                            onChange={(e) => {
                                const newTestType = e.target.value;
                                setTestType(newTestType);
                            }}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            disabled={isRunning}
                        >
                            <option value="functional">🧪 Functional Test (Selenium)</option>
                            <option value="performance">📋 Azure Boards – Work Item Management</option>
                            <option value="jmeter">⚡ Performance Tests (JMeter)</option>
                        </select>
                    </div>
                </div>

                {testType === 'performance' && (
                    <div className="space-y-4">
                        {/* Row 1: Work Item ID + Fetch button */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Related Work Item ID
                                    <span className="ml-1 text-xs text-gray-400">(fetches details from ADO)</span>
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={relatedWorkItemIds}
                                        onChange={(e) => {
                                            setRelatedWorkItemIds(e.target.value);
                                            setFetchedWorkItem(null);
                                            setFetchError('');
                                        }}
                                        onBlur={() => fetchWorkItem(relatedWorkItemIds)}
                                        placeholder="e.g., 12345"
                                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        disabled={isRunning || isFetching}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => fetchWorkItem(relatedWorkItemIds)}
                                        disabled={isRunning || isFetching || !relatedWorkItemIds.trim()}
                                        className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 whitespace-nowrap"
                                    >
                                        {isFetching ? (
                                            <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Fetching…</>
                                        ) : (
                                            <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg> Fetch from ADO</>
                                        )}
                                    </button>
                                </div>
                                {fetchError && (
                                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                                        {fetchError}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Work Item Type
                                </label>
                                <select
                                    value={workItemType}
                                    onChange={(e) => setWorkItemType(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    disabled={isRunning}
                                >
                                    <option value="Task">Task</option>
                                    <option value="Bug">Bug</option>
                                    <option value="User Story">User Story</option>
                                </select>
                            </div>
                        </div>

                        {/* ADO Work Item Preview Card */}
                        {fetchedWorkItem && (
                            <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4 space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-600 text-white">
                                            #{fetchedWorkItem.id}
                                        </span>
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-200 text-gray-700">
                                            {fetchedWorkItem.type}
                                        </span>
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                            fetchedWorkItem.state === 'Active' ? 'bg-green-100 text-green-800' :
                                            fetchedWorkItem.state === 'Closed' ? 'bg-gray-200 text-gray-600' :
                                            'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {fetchedWorkItem.state}
                                        </span>
                                    </div>
                                    {fetchedWorkItem.url && (
                                        <a href={fetchedWorkItem.url} target="_blank" rel="noreferrer"
                                           className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                                            Open in ADO
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                        </a>
                                    )}
                                </div>
                                <p className="text-sm font-semibold text-gray-800">{fetchedWorkItem.title}</p>
                                {fetchedWorkItem.assignedTo && (
                                    <p className="text-xs text-gray-500">Assigned to: <span className="font-medium text-gray-700">{fetchedWorkItem.assignedTo}</span></p>
                                )}
                                {(fetchedWorkItem.acceptanceCriteria || fetchedWorkItem.description) && (
                                    <details className="mt-1">
                                        <summary className="text-xs text-blue-700 cursor-pointer hover:text-blue-900 font-medium select-none">
                                            View Acceptance Criteria / Description
                                        </summary>
                                        <div
                                            className="mt-2 text-xs text-gray-700 bg-white rounded p-2 border border-blue-100 max-h-40 overflow-y-auto"
                                            dangerouslySetInnerHTML={{
                                                __html: fetchedWorkItem.acceptanceCriteria || fetchedWorkItem.description
                                            }}
                                        />
                                    </details>
                                )}
                                <p className="text-xs text-green-700 font-medium flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                                    Connected to Azure DevOps — details will be included in test generation
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* ── JMeter Config Panel ─────────────────────────────── */}
                {testType === 'jmeter' && (
                    <div className="rounded-xl border-2 border-orange-200 bg-orange-50 p-5 space-y-4">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xl">⚡</span>
                            <h3 className="text-sm font-bold text-orange-800 uppercase tracking-wide">JMeter Performance Test Configuration</h3>
                        </div>

                        {/* Row 1: Target URL + HTTP Method */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Target URL <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={jmeterConfig.targetUrl}
                                    onChange={(e) => updateJmeter('targetUrl', e.target.value)}
                                    placeholder="https://example.com/api/health"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                                    disabled={isRunning}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">HTTP Method</label>
                                <select
                                    value={jmeterConfig.httpMethod}
                                    onChange={(e) => updateJmeter('httpMethod', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                                    disabled={isRunning}
                                >
                                    {['GET','POST','PUT','DELETE','PATCH'].map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Row 2: Threads / Ramp-up / Duration / Scenario */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Virtual Users
                                    <span className="ml-1 text-gray-400 font-normal">(threads)</span>
                                </label>
                                <input
                                    type="number" min="1" max="500"
                                    value={jmeterConfig.threads}
                                    onChange={(e) => updateJmeter('threads', parseInt(e.target.value) || 10)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-400"
                                    disabled={isRunning}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Ramp-up
                                    <span className="ml-1 text-gray-400 font-normal">(seconds)</span>
                                </label>
                                <input
                                    type="number" min="0" max="3600"
                                    value={jmeterConfig.rampUp}
                                    onChange={(e) => updateJmeter('rampUp', parseInt(e.target.value) || 30)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-400"
                                    disabled={isRunning}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Duration
                                    <span className="ml-1 text-gray-400 font-normal">(seconds)</span>
                                </label>
                                <input
                                    type="number" min="5" max="86400"
                                    value={jmeterConfig.duration}
                                    onChange={(e) => updateJmeter('duration', parseInt(e.target.value) || 60)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-400"
                                    disabled={isRunning}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Scenario Type</label>
                                <select
                                    value={jmeterConfig.scenarioType}
                                    onChange={(e) => updateJmeter('scenarioType', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-400"
                                    disabled={isRunning}
                                >
                                    <option value="http-request">HTTP Request</option>
                                    <option value="rest-api">REST API Test</option>
                                    <option value="web-app">Web App Load Test</option>
                                    <option value="spike">Spike Test</option>
                                    <option value="soak">Soak Test</option>
                                </select>
                            </div>
                        </div>

                        {/* Row 3: Content-Type + Request Body (for POST/PUT) */}
                        {['POST','PUT','PATCH'].includes(jmeterConfig.httpMethod) && (
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Content-Type</label>
                                    <select
                                        value={jmeterConfig.contentType}
                                        onChange={(e) => updateJmeter('contentType', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-400"
                                        disabled={isRunning}
                                    >
                                        <option value="application/json">application/json</option>
                                        <option value="application/x-www-form-urlencoded">form-urlencoded</option>
                                        <option value="text/xml">text/xml</option>
                                        <option value="text/plain">text/plain</option>
                                    </select>
                                </div>
                                <div className="md:col-span-3">
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Request Body</label>
                                    <textarea
                                        value={jmeterConfig.requestBody}
                                        onChange={(e) => updateJmeter('requestBody', e.target.value)}
                                        placeholder='{"key": "value"}'
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-orange-400 resize-none"
                                        rows="3"
                                        disabled={isRunning}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Summary badge */}
                        <div className="flex flex-wrap gap-2 text-xs">
                            <span className="inline-flex items-center px-2 py-1 rounded-full bg-orange-200 text-orange-800 font-medium">
                                👥 {jmeterConfig.threads} users
                            </span>
                            <span className="inline-flex items-center px-2 py-1 rounded-full bg-orange-200 text-orange-800 font-medium">
                                ⏱ {jmeterConfig.rampUp}s ramp-up → {jmeterConfig.duration}s run
                            </span>
                            <span className="inline-flex items-center px-2 py-1 rounded-full bg-orange-200 text-orange-800 font-medium">
                                🎯 ~{Math.round(jmeterConfig.threads * jmeterConfig.duration / jmeterConfig.rampUp)} req/s peak
                            </span>
                            {!jmeterConfig.targetUrl && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full bg-red-100 text-red-700 font-medium">
                                    ⚠️ Target URL required
                                </span>
                            )}
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3 bg-gray-50">
                    <div>
                        <p className="text-sm font-medium text-gray-800">Auto-regenerate on reuse failure</p>
                        <p className="text-xs text-gray-600">If a reused test fails, automatically generate a new script and rerun once.</p>
                    </div>
                    <label className="inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={autoRegenerateOnReuseFail}
                            onChange={(e) => setAutoRegenerateOnReuseFail(e.target.checked)}
                            disabled={isRunning}
                        />
                        <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-purple-600 relative transition-colors">
                            <span className={`absolute top-0.5 left-0.5 h-5 w-5 bg-white rounded-full transition-transform ${autoRegenerateOnReuseFail ? 'translate-x-5' : ''}`}></span>
                        </div>
                    </label>
                </div>

                <button
                    type="submit"
                    disabled={
                        isRunning ||
                        (testType === 'jmeter' ? !jmeterConfig.targetUrl.trim() : !prompt.trim())
                    }
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                    {isRunning ? (
                        <>
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            <span>{testType === 'jmeter' ? 'Running Performance Test...' : 'Running Test...'}</span>
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{testType === 'jmeter' ? '⚡ Run Performance Test' : 'Run New Test'}</span>
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default TestPromptInput;
