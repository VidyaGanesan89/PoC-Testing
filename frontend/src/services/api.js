import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const testApi = {
    getMetrics: () => api.get('/metrics'),
    runTest: (testRequest) => api.post('/run', testRequest),
    generateAITest: (testRequest) => api.post('/generate-ai-test', testRequest),
    getTestHistory: (limit = 10) => api.get(`/history`),
    getTestStatus: (testId) => api.get(`/test-status/${testId}`),
    getAvailableLLMs: () => api.get('/llms'),
    findTestMatches: (prompt, testType = 'functional') => api.post('/testcases/matches', { prompt, testType }),
    getTestFile: (testClass) => api.get(`/test-file/${testClass}`),
    health: () => api.get('/health'),
    getWorkItemById: (id) => api.get(`/azure-devops/work-items/${id}`),
    // JMeter / Performance tests
    startPerformanceTest: (config) => api.post('/performance-test', config),
    getPerformanceTestStatus: (testId) => api.get(`/performance-test/${testId}`),
    getPerformanceTestLogs: (testId) => api.get(`/performance-test/${testId}/logs`),
    getJMeterStatus: () => api.get('/jmeter-status'),
};

export default api;
