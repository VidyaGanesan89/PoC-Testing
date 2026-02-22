import { useState, useEffect } from 'react';
import { TrendingUp, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import axios from 'axios';

const HistoryInsights = ({ apiBaseUrl = 'http://localhost:8080/api' }) => {
  const [stats, setStats] = useState(null);
  const [testRuns, setTestRuns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState({ testType: '', status: '' });

  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, runsRes] = await Promise.all([
        axios.get(`${apiBaseUrl}/test-history/stats`),
        axios.get(`${apiBaseUrl}/test-history`, { params: { limit: 50, ...filter } })
      ]);

      setStats(statsRes.data.stats);
      setTestRuns(runsRes.data.testRuns);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading test history...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 border-2 border-blue-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="text-3xl">📊</div>
              <div>
                <div className="text-sm text-gray-600">Total Tests</div>
                <div className="text-2xl font-bold">{stats.total}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border-2 border-green-200 shadow-sm">
            <div className="flex items-center gap-3">
              <CheckCircle className="text-green-600" size={32} />
              <div>
                <div className="text-sm text-gray-600">Passed</div>
                <div className="text-2xl font-bold text-green-600">{stats.passed}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border-2 border-red-200 shadow-sm">
            <div className="flex items-center gap-3">
              <AlertCircle className="text-red-600" size={32} />
              <div>
                <div className="text-sm text-gray-600">Failed</div>
                <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border-2 border-purple-200 shadow-sm">
            <div className="flex items-center gap-3">
              <TrendingUp className="text-purple-600" size={32} />
              <div>
                <div className="text-sm text-gray-600">Pass Rate</div>
                <div className="text-2xl font-bold text-purple-600">{stats.passRate}%</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Failures */}
      {stats && stats.recentFailures && stats.recentFailures.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
            <AlertCircle size={20} />
            Recent Failures
          </h3>
          <div className="space-y-2">
            {stats.recentFailures.map((failure, index) => (
              <div key={index} className="bg-white rounded p-3 border border-red-200">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-mono text-sm text-purple-600">{failure.runId}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      {failure.testType} • {new Date(failure.timestamp).toLocaleString()}
                    </div>
                    {failure.errorLogs && failure.errorLogs.length > 0 && (
                      <div className="text-xs text-red-600 mt-2 font-mono">
                        {failure.errorLogs[0]}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-4">
        <select
          value={filter.testType}
          onChange={(e) => setFilter({ ...filter, testType: e.target.value })}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="">All Test Types</option>
          <option value="Functional">Functional</option>
          <option value="Performance">Performance</option>
        </select>

        <select
          value={filter.status}
          onChange={(e) => setFilter({ ...filter, status: e.target.value })}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="">All Statuses</option>
          <option value="Passed">Passed</option>
          <option value="Failed">Failed</option>
        </select>
      </div>

      {/* Test Runs Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Run ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Duration
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Timestamp
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {testRuns.map((run) => (
              <tr key={run.runId} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-mono text-purple-600">{run.runId}</div>
                  {run.prompt && (
                    <div className="text-xs text-gray-500 mt-1 max-w-xs truncate">
                      {run.prompt}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">{run.testType}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      run.status === 'Passed'
                        ? 'bg-green-100 text-green-800'
                        : run.status === 'Failed'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {run.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-900">
                    <Clock size={14} className="mr-1" />
                    {(run.duration / 1000).toFixed(2)}s
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(run.timestamp).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {testRuns.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No test runs found
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryInsights;
