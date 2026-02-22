import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2, Wrench } from 'lucide-react';

/**
 * FixTestError
 * Lets the user paste a test failure error and have Claude/GPT fix the Java files.
 */
const FixTestError = () => {
  const [testClasses, setTestClasses]     = useState([]);
  const [testClassName, setTestClassName] = useState('');
  const [errorMessage, setErrorMessage]   = useState('');
  const [llm, setLlm]                     = useState('Claude Sonnet 4.6');
  const [status, setStatus]               = useState('idle');   // idle | fixing | fixed | error
  const [result, setResult]               = useState(null);

  // Load test class names for the dropdown on mount
  useEffect(() => {
    fetch('http://localhost:8080/api/list-test-classes')
      .then(r => r.ok ? r.json() : { classes: [] })
      .then(data => setTestClasses(data.classes || []))
      .catch(() => setTestClasses([]));
  }, []);

  const handleFix = async () => {
    if (!testClassName.trim()) {
      alert('Please enter or select a test class name.');
      return;
    }
    if (!errorMessage.trim()) {
      alert('Please paste the error / stack trace from the failed test.');
      return;
    }

    setStatus('fixing');
    setResult(null);

    try {
      const resp = await fetch('http://localhost:8080/api/fix-test-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testClassName: testClassName.trim(),
          errorMessage: errorMessage.trim(),
          llm
        })
      });
      const data = await resp.json();

      if (data.success) {
        setStatus('fixed');
        setResult(data);
      } else {
        setStatus('error');
        setResult(data);
      }
    } catch (e) {
      setStatus('error');
      setResult({ error: e.message });
    }
  };

  const handleReset = () => {
    setStatus('idle');
    setResult(null);
    setErrorMessage('');
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Wrench className="text-yellow-500" size={20} />
        <h3 className="text-gray-900 font-semibold text-base">Fix Test Error with AI</h3>
        <span className="ml-auto text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
          Claude Sonnet 4.6
        </span>
      </div>

      {/* Step 1 — Test class name */}
      <div className="space-y-1">
        <label className="text-xs text-gray-600 font-medium">1. Test Class Name</label>
        <div className="flex gap-2">
          {testClasses.length > 0 && (
            <select
              value={testClassName}
              onChange={e => setTestClassName(e.target.value)}
              className="flex-1 bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-yellow-500"
            >
              <option value="">— pick from list —</option>
              {testClasses.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          )}
          <input
            type="text"
            placeholder={testClasses.length > 0 ? 'or type class name…' : 'e.g. GeneratedTest_1771779003075'}
            value={testClassName}
            onChange={e => setTestClassName(e.target.value)}
            className="flex-1 bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-yellow-500"
          />
        </div>
      </div>

      {/* Step 2 — Error message */}
      <div className="space-y-1">
        <label className="text-xs text-gray-600 font-medium">2. Paste the Error / Stack Trace</label>
        <textarea
          rows={8}
          value={errorMessage}
          onChange={e => setErrorMessage(e.target.value)}
          placeholder={`Paste the full error here. For example:\n\njava.lang.AssertionError: First Name entered successfully\n\tat tests.GeneratedTest_1771779003075.testRequestASpeakerForm(GeneratedTest_1771779003075.java:55)\n...\nor just the relevant part of the test log.`}
          className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-800 placeholder-gray-400 font-mono focus:outline-none focus:border-yellow-500 resize-y"
        />
      </div>

      {/* Step 3 — LLM selector */}
      <div className="flex items-center gap-3">
        <label className="text-xs text-gray-600 font-medium">3. Fix with:</label>
        {['Claude Sonnet 4.6', 'GPT-4o'].map(opt => (
          <label key={opt} className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="radio"
              name="fixLlm"
              value={opt}
              checked={llm === opt}
              onChange={() => setLlm(opt)}
              className="accent-yellow-500"
            />
            <span className="text-sm text-gray-700">{opt}</span>
          </label>
        ))}
      </div>

      {/* Action button */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleFix}
          disabled={status === 'fixing'}
          className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 disabled:bg-gray-200 disabled:text-gray-400 text-black font-semibold px-5 py-2 rounded-lg text-sm transition-colors"
        >
          {status === 'fixing'
            ? <><Loader2 size={15} className="animate-spin" /> Fixing with {llm}…</>
            : <><Wrench size={15} /> Fix with {llm}</>}
        </button>

        {(status === 'fixed' || status === 'error') && (
          <button
            onClick={handleReset}
            className="text-xs text-gray-500 hover:text-gray-900 underline"
          >
            Reset
          </button>
        )}
      </div>

      {/* Result banner */}
      {status === 'fixed' && result && (
        <div className="bg-green-50 border border-green-300 rounded-lg p-3 flex gap-3 items-start">
          <CheckCircle2 className="text-green-600 shrink-0 mt-0.5" size={18} />
          <div>
            <p className="text-green-700 font-semibold text-sm">Files fixed and saved!</p>
            <p className="text-green-600 text-xs mt-0.5">{result.message}</p>
            <p className="text-gray-600 text-xs mt-1">
              Run <code className="bg-gray-100 px-1 rounded">mvn test -Dtest={testClassName}</code> to verify.
            </p>
          </div>
        </div>
      )}

      {status === 'error' && result && (
        <div className="bg-red-50 border border-red-300 rounded-lg p-3 flex gap-3 items-start">
          <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
          <div>
            <p className="text-red-700 font-semibold text-sm">Fix failed</p>
            <p className="text-red-600 text-xs mt-0.5">{result.error}</p>
            {result.rawResponse && (
              <details className="mt-2">
                <summary className="text-xs text-gray-500 cursor-pointer">Show LLM raw response</summary>
                <pre className="text-xs text-gray-700 mt-1 whitespace-pre-wrap bg-gray-100 p-2 rounded max-h-40 overflow-y-auto">
                  {result.rawResponse}
                </pre>
              </details>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FixTestError;
