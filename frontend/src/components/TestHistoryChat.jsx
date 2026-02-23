import { useState } from 'react';
import { Send, Loader2, Sparkles } from 'lucide-react';
import axios from 'axios';

const TestHistoryChat = ({ apiBaseUrl = 'http://localhost:8080/api' }) => {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const normalizeTestTypeLabel = (value) => {
    const text = (value || '').toString().trim();
    const lowered = text.toLowerCase();
    if (lowered === 'performance' ||
        lowered.includes('azure boards') ||
        lowered.includes('work item')) {
      return '📋 Azure Boards – Work Item Mgmt';
    }
    if (lowered === 'jmeter' || lowered.includes('jmeter')) {
      return '⚡ Performance (JMeter)';
    }
    if (lowered === 'functional') return '🧪 Functional';
    return text;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!question.trim() || isLoading) return;

    const userMessage = question;
    setQuestion('');
    
    // Add user message
    setMessages(prev => [...prev, {
      type: 'user',
      content: userMessage,
      timestamp: new Date()
    }]);

    setIsLoading(true);

    try {
      const response = await axios.post(`${apiBaseUrl}/rag/query`, {
        question: userMessage
      });

      // Add AI response
      setMessages(prev => [...prev, {
        type: 'assistant',
        content: response.data.answer,
        relevantRuns: response.data.relevantRuns,
        timestamp: new Date()
      }]);

    } catch (error) {
      console.error('Error querying test history:', error);
      
      setMessages(prev => [...prev, {
        type: 'error',
        content: `Error: ${error.response?.data?.error || error.message}`,
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestedQuestions = [
    { value: "", label: "Select a query..." },
    { value: "What was the last test run?", label: "What was the last test run?" },
    { value: "Why did the last test fail?", label: "Why did the last test fail?" },
    { value: "Show all passed tests", label: "Show all passed tests" },
    { value: "Show all failed tests", label: "Show all failed tests" },
    { value: "How many tests passed?", label: "How many tests passed?" },
    { value: "Show recent test results", label: "Show recent test results" },
    { value: "What tests ran today?", label: "What tests ran today?" },
    { value: "List all test runs", label: "List all test runs" },
    { value: "Show functional test results", label: "Show functional test results" }
  ];

  const handleSuggestedQuestion = (q) => {
    setQuestion(q);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4">
        <div className="flex items-center gap-2 text-white">
          <Sparkles size={24} />
          <h2 className="text-xl font-bold">AI Test History Assistant</h2>
        </div>
        <p className="text-white text-sm opacity-90 mt-1">
          Ask questions about your test execution history
        </p>
      </div>

      {/* Messages */}
      <div className="overflow-y-auto p-4 space-y-4 bg-gray-50" style={{ height: '480px' }}>
        {messages.length === 0 && (
          <div className="text-center py-8">
            <Sparkles size={48} className="mx-auto text-purple-400 mb-4" />
            <p className="text-gray-600 mb-4">Ask me anything about your test history!</p>
            
            <div className="space-y-2">
              <p className="text-sm text-gray-500 mb-2">Try asking:</p>
              {suggestedQuestions.slice(1).map((q, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestedQuestion(q.value)}
                  className="block w-full max-w-md mx-auto px-4 py-2 text-sm text-left bg-white rounded-lg hover:bg-purple-50 transition-colors border border-gray-200"
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-3xl rounded-lg px-4 py-3 ${
                message.type === 'user'
                  ? 'bg-purple-600 text-white'
                  : message.type === 'error'
                  ? 'bg-red-100 text-red-800 border border-red-300'
                  : 'bg-white border border-gray-200'
              }`}
            >
              {message.type === 'assistant' && (
                <div className="flex items-start gap-2 mb-2">
                  <Sparkles size={16} className="text-purple-600 mt-1" />
                  <span className="font-semibold text-purple-600">AI Assistant</span>
                </div>
              )}
              
              <div className="whitespace-pre-wrap">{message.content}</div>

              {message.relevantRuns && message.relevantRuns.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs font-semibold text-gray-600 mb-2">
                    Related Test Runs:
                  </p>
                  <div className="space-y-2">
                    {message.relevantRuns.map((run, idx) => (
                      <div
                        key={idx}
                        className="text-xs bg-gray-50 p-2 rounded border border-gray-200"
                      >
                        <div className="font-mono text-purple-600">{run.runId}</div>
                        <div className="flex gap-2 mt-1">
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            run.status === 'Passed' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {run.status}
                          </span>
                          <span className="text-gray-600">{normalizeTestTypeLabel(run.testType)}</span>
                          <span className="text-gray-500">
                            {new Date(run.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-xs opacity-70 mt-2">
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-lg px-4 py-3">
              <div className="flex items-center gap-2">
                <Loader2 size={16} className="animate-spin text-purple-600" />
                <span className="text-gray-600">Analyzing test history...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4 bg-white space-y-3">
        {/* Dropdown for suggested queries */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quick Queries
          </label>
          <select
            value=""
            onChange={(e) => {
              if (e.target.value) {
                setQuestion(e.target.value);
              }
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-700"
            disabled={isLoading}
          >
            {suggestedQuestions.map((q, index) => (
              <option key={index} value={q.value}>
                {q.label}
              </option>
            ))}
          </select>
        </div>

        {/* Text input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Or type your own question..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !question.trim()}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <Send size={18} />
            Ask
          </button>
        </div>
      </form>
    </div>
  );
};

export default TestHistoryChat;
