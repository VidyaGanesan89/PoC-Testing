import React from 'react';
import { Play, Check, X, Clock, Percent, Eye } from 'lucide-react';

const TestCaseMatches = ({ exactMatches, similarMatches, onRunExisting, onViewScript, onCreateNew, loading }) => {
  const allMatches = [
    ...exactMatches.map(m => ({ ...m, type: 'exact' })),
    ...similarMatches.map(m => ({ ...m, type: 'similar' }))
  ];

  if (allMatches.length === 0) {
    return null;
  }

  const getStatusIcon = (status) => {
    switch (status?.toUpperCase()) {
      case 'PASSED':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'FAILED':
        return <X className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'PASSED':
        return 'bg-green-100 text-green-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">
          Similar Test Cases Found
        </h2>
        <span className="text-sm text-gray-600">
          {allMatches.length} match{allMatches.length !== 1 ? 'es' : ''} found
        </span>
      </div>

      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>💡 Reuse Existing Tests:</strong> Select a test below to run it, or create a new test anyway.
        </p>
      </div>

      <div className="overflow-x-auto mb-4">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Test Class
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Match Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Similarity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {allMatches.map((match, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex flex-col max-w-md">
                    <div className="text-sm font-medium text-gray-900">
                      {match.className}
                    </div>
                    {match.prompt && (
                      <div className="text-xs text-gray-500 mt-1 whitespace-pre-wrap max-h-32 overflow-y-auto">
                        {match.prompt.length > 300 
                          ? match.prompt.substring(0, 300) + '...' 
                          : match.prompt
                        }
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {match.type === 'exact' ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Exact Match
                    </span>
                  ) : (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      Similar
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Percent className="w-4 h-4 mr-1 text-gray-400" />
                    <span className={`text-sm font-semibold ${
                      match.similarity >= 0.9 ? 'text-green-600' :
                      match.similarity >= 0.7 ? 'text-blue-600' :
                      'text-yellow-600'
                    }`}>
                      {(match.similarity * 100).toFixed(1)}%
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {getStatusIcon(match.lastRunStatus)}
                    <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(match.lastRunStatus)}`}>
                      {match.lastRunStatus || 'UNKNOWN'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(match.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => onViewScript(match)}
                      disabled={loading}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </button>
                    <button
                      onClick={() => onRunExisting(match)}
                      disabled={loading}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Play className="w-3 h-3 mr-1" />
                      Run Existing
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end pt-4 border-t border-gray-200">
        <button
          onClick={onCreateNew}
          disabled={loading}
          className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Create New Test Anyway
        </button>
      </div>
    </div>
  );
};

export default TestCaseMatches;
