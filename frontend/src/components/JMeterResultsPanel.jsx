import React, { useState } from 'react';

// ── Helper ────────────────────────────────────────────────────────────────────
const ms = (v) => (v == null ? '–' : `${v.toLocaleString()} ms`);
const pct = (v) => (v == null ? '–' : `${v}%`);

function MetricTile({ label, value, sub, color = 'gray' }) {
  const colors = {
    green:  'bg-green-50  border-green-200  text-green-700',
    red:    'bg-red-50    border-red-200    text-red-700',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    blue:   'bg-blue-50   border-blue-200   text-blue-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
    gray:   'bg-gray-50   border-gray-200   text-gray-700',
  };
  return (
    <div className={`rounded-lg border p-3 ${colors[color]}`}>
      <p className="text-xs font-medium uppercase tracking-wide opacity-70">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
      {sub && <p className="text-xs mt-0.5 opacity-60">{sub}</p>}
    </div>
  );
}

function StatusBadge({ status }) {
  const cfg = {
    passed:  { bg: 'bg-green-600',  label: '✅ PASSED'  },
    warning: { bg: 'bg-yellow-500', label: '⚠️ WARNING' },
    failed:  { bg: 'bg-red-600',    label: '❌ FAILED'  },
    running: { bg: 'bg-blue-600',   label: '⏳ RUNNING' },
  };
  const c = cfg[status] || cfg.running;
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold text-white ${c.bg}`}>
      {c.label}
    </span>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
const JMeterResultsPanel = ({ progress, testConfig, simulation = false }) => {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [showConfig,    setShowConfig]    = useState(false);

  if (!progress) return null;

  const { status, message, percentage, jmeterResult, reportUrl } = progress;
  const result = jmeterResult;
  const s = result?.summary;

  if (status === 'running') {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-blue-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <svg className="animate-spin w-5 h-5 text-blue-600" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">⚡ Performance Test Running</h3>
            <p className="text-sm text-gray-500">{message || 'Executing JMeter test plan...'}</p>
          </div>
        </div>
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-blue-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${percentage || 10}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1 text-right">{percentage || 10}%</p>
        {testConfig && (
          <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-gray-500">
            <div><span className="font-medium">Target:</span> {testConfig.targetUrl || '–'}</div>
            <div><span className="font-medium">Users:</span> {testConfig.threads}</div>
            <div><span className="font-medium">Duration:</span> {testConfig.duration}s</div>
          </div>
        )}
      </div>
    );
  }

  if (!result || !s) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-red-100 p-6">
        <p className="text-red-600 font-medium">⚠️ {message || 'Performance test ended without results.'}</p>
      </div>
    );
  }

  const avgColor  = s.avgMs < 500  ? 'green'  : s.avgMs  < 1500 ? 'yellow' : 'red';
  const errColor  = s.errorPct === 0 ? 'green' : s.errorPct < 5  ? 'yellow' : 'red';
  const tputColor = s.throughput > 5 ? 'green' : 'gray';

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className={`px-6 py-4 flex items-center justify-between ${
        status === 'passed'  ? 'bg-green-600'  :
        status === 'warning' ? 'bg-yellow-500' : 'bg-red-600'
      } text-white`}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">⚡</span>
          <div>
            <h3 className="font-bold text-lg">Performance Test Results</h3>
            <p className="text-sm opacity-80">{testConfig?.testName || 'JMeter Test'}</p>
          </div>
        </div>
        <div className="text-right">
          <StatusBadge status={status} />
          {simulation && (
            <p className="text-xs mt-1 opacity-75">⚠️ Simulation mode (JMeter not installed)</p>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Simulation alert */}
        {simulation && (
          <div className="flex items-start gap-3 rounded-lg bg-amber-50 border border-amber-200 p-3">
            <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
            </svg>
            <div className="text-sm text-amber-800">
              <p className="font-semibold">JMeter not installed – showing simulated results</p>
              <p className="mt-0.5">Install Apache JMeter from{' '}
                <a href="https://jmeter.apache.org/download_jmeter.cgi" target="_blank" rel="noreferrer"
                   className="underline font-medium">jmeter.apache.org</a>{' '}
                and set <code className="bg-amber-100 px-1 rounded">JMETER_HOME</code> env var to use real execution.
              </p>
            </div>
          </div>
        )}

        {/* Key metrics grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <MetricTile label="Samples"    value={s.samples.toLocaleString()} color="blue"   />
          <MetricTile label="Passed"     value={s.passed.toLocaleString()}  color="green"  />
          <MetricTile label="Failed"     value={s.failed.toLocaleString()}  color={s.failed > 0 ? 'red' : 'green'} />
          <MetricTile label="Error Rate" value={pct(s.errorPct)}            color={errColor}  />
          <MetricTile label="Throughput" value={`${s.throughput}/s`}        color={tputColor} />
          <MetricTile label="Avg Resp"   value={ms(s.avgMs)}                color={avgColor}  />
        </div>

        {/* Response time breakdown */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Response Time Distribution</h4>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {[
              { label: 'Min',    val: s.minMs    },
              { label: 'Median', val: s.medianMs },
              { label: 'Avg',    val: s.avgMs    },
              { label: 'P90',    val: s.p90Ms    },
              { label: 'P95',    val: s.p95Ms    },
              { label: 'Max',    val: s.maxMs    },
            ].map(({ label, val }) => (
              <div key={label} className="text-center rounded-lg bg-gray-50 border border-gray-200 py-2 px-1">
                <p className="text-xs text-gray-500 mb-1">{label}</p>
                <p className={`text-sm font-bold ${val > 1500 ? 'text-red-600' : val > 500 ? 'text-yellow-600' : 'text-green-700'}`}>
                  {ms(val)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Visual response time bar */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Performance Gauge</h4>
          <div className="relative">
            {/* Background scale */}
            <div className="flex h-4 rounded-full overflow-hidden">
              <div className="bg-green-400  flex-1" title="< 500ms (Good)" />
              <div className="bg-yellow-400 flex-1" title="500–1500ms (Acceptable)" />
              <div className="bg-red-400    flex-1" title="> 1500ms (Poor)" />
            </div>
            {/* Avg marker */}
            {s.maxMs > 0 && (
              <div
                className="absolute top-0 w-1 h-4 bg-gray-900 rounded"
                style={{ left: `${Math.min((s.avgMs / Math.max(s.maxMs, 3000)) * 100, 99)}%` }}
                title={`Avg: ${s.avgMs}ms`}
              />
            )}
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>0ms</span><span className="text-green-600">500ms (Good)</span>
              <span className="text-yellow-600">1500ms</span><span className="text-red-600">Slow →</span>
            </div>
          </div>
        </div>

        {/* Per-label breakdown (collapsible) */}
        {result.labelBreakdown && result.labelBreakdown.length > 0 && (
          <div>
            <button
              onClick={() => setShowBreakdown(v => !v)}
              className="flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-900"
            >
              <svg className={`w-4 h-4 transition-transform ${showBreakdown ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              Endpoint Breakdown ({result.labelBreakdown.length} request{result.labelBreakdown.length !== 1 ? 's' : ''})
            </button>
            {showBreakdown && (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-100 text-gray-600">
                      <th className="px-3 py-2 text-left rounded-tl">Label</th>
                      <th className="px-3 py-2 text-right"># Samples</th>
                      <th className="px-3 py-2 text-right">Errors</th>
                      <th className="px-3 py-2 text-right">Error%</th>
                      <th className="px-3 py-2 text-right">Avg</th>
                      <th className="px-3 py-2 text-right">Min</th>
                      <th className="px-3 py-2 text-right rounded-tr">Max</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.labelBreakdown.map((row, i) => (
                      <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-3 py-2 font-medium text-gray-800 max-w-xs truncate">{row.label}</td>
                        <td className="px-3 py-2 text-right">{row.samples.toLocaleString()}</td>
                        <td className={`px-3 py-2 text-right font-semibold ${row.errors > 0 ? 'text-red-600' : 'text-green-600'}`}>{row.errors}</td>
                        <td className={`px-3 py-2 text-right ${parseFloat(row.errorPct) > 0 ? 'text-red-600' : 'text-green-600'}`}>{pct(row.errorPct)}</td>
                        <td className="px-3 py-2 text-right">{ms(row.avgMs)}</td>
                        <td className="px-3 py-2 text-right">{ms(row.minMs)}</td>
                        <td className="px-3 py-2 text-right">{ms(row.maxMs)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Test config (collapsible) */}
        {testConfig && (
          <div>
            <button
              onClick={() => setShowConfig(v => !v)}
              className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-800"
            >
              <svg className={`w-4 h-4 transition-transform ${showConfig ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              Test Configuration
            </button>
            {showConfig && (
              <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-gray-50 rounded-lg p-3 border border-gray-200">
                {[
                  ['Target URL',     testConfig.targetUrl],
                  ['HTTP Method',    testConfig.httpMethod],
                  ['Virtual Users',  testConfig.threads],
                  ['Ramp-up',        `${testConfig.rampUp}s`],
                  ['Duration',       `${testConfig.duration}s`],
                  ['Scenario Type',  testConfig.scenarioType],
                  ['Content-Type',   testConfig.contentType],
                ].map(([k, v]) => v != null && (
                  <div key={k}>
                    <span className="text-gray-400">{k}: </span>
                    <span className="font-medium text-gray-700">{String(v)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* HTML Report link */}
        {reportUrl && !simulation && (
          <div className="flex items-center gap-3 rounded-lg bg-indigo-50 border border-indigo-200 p-3">
            <svg className="w-5 h-5 text-indigo-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-semibold text-indigo-800">Full JMeter HTML Report Available</p>
              <p className="text-xs text-indigo-600">Detailed graphs, response time distribution, throughput timeline</p>
            </div>
            <a
              href={`http://localhost:8080${reportUrl}`}
              target="_blank" rel="noreferrer"
              className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 whitespace-nowrap"
            >
              Open Report ↗
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default JMeterResultsPanel;
