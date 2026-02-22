'use strict';

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const ragIntegrationService = require('./ragIntegrationService');

// ─── Constants ────────────────────────────────────────────────────────────────
const JMETER_RESULTS_DIR = path.join(__dirname, '../../performance-results');
const JMETER_PLANS_DIR = path.join(__dirname, '../../performance-plans');

// Ensure dirs exist
[JMETER_RESULTS_DIR, JMETER_PLANS_DIR].forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

// ─── JMeter executable detection ─────────────────────────────────────────────
function findJMeter() {
  const candidates = [
    process.env.JMETER_HOME ? path.join(process.env.JMETER_HOME, 'bin', 'jmeter.bat') : null,
    process.env.JMETER_HOME ? path.join(process.env.JMETER_HOME, 'bin', 'jmeter') : null,
    'C:\\apache-jmeter\\bin\\jmeter.bat',
    'C:\\Program Files\\Apache JMeter\\bin\\jmeter.bat',
    'C:\\jmeter\\bin\\jmeter.bat',
    '/usr/local/bin/jmeter',
    '/usr/bin/jmeter',
    'jmeter'   // on PATH
  ].filter(Boolean);

  for (const c of candidates) {
    if (c === 'jmeter') return 'jmeter'; // trust PATH
    if (fs.existsSync(c)) return c;
  }
  return null;
}

// ─── JMX Plan builder ─────────────────────────────────────────────────────────
function buildJMXPlan(config) {
  const {
    testName    = 'Performance Test',
    targetUrl,
    protocol    = 'https',
    host,
    port        = 443,
    urlPath     = '/',
    httpMethod  = 'GET',
    threads     = 10,
    rampUp      = 30,
    duration    = 60,
    loops       = -1,      // -1 = forever (use duration)
    requestBody = '',
    contentType = 'application/json',
    assertions  = [],
    endpoints   = []       // additional endpoints
  } = config;

  // Parse target URL if provided
  let resolvedHost = host;
  let resolvedPath = urlPath;
  let resolvedPort = port;
  let resolvedProtocol = protocol;

  if (targetUrl) {
    try {
      const u = new URL(targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`);
      resolvedHost = u.hostname;
      resolvedPath = u.pathname + (u.search || '');
      resolvedPort = parseInt(u.port) || (u.protocol === 'https:' ? 443 : 80);
      resolvedProtocol = u.protocol.replace(':', '');
    } catch (_) { /* keep defaults */ }
  }

  const endpointSamplers = (endpoints.length > 0 ? endpoints : [
    { name: testName, method: httpMethod, path: resolvedPath, body: requestBody }
  ]).map((ep, i) => buildHTTPSampler({
    name: ep.name || `Request ${i + 1}`,
    method: ep.method || 'GET',
    path: ep.path || resolvedPath,
    body: ep.body || '',
    contentType
  }, assertions)).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<jmeterTestPlan version="1.2" properties="5.0" jmeter="5.6">
  <hashTree>
    <TestPlan guiclass="TestPlanGui" testclass="TestPlan" testname="${escXml(testName)}" enabled="true">
      <boolProp name="TestPlan.functional_mode">false</boolProp>
      <boolProp name="TestPlan.serialize_threadgroups">false</boolProp>
      <elementProp name="TestPlan.arguments" elementType="Arguments">
        <collectionProp name="Arguments.arguments"/>
      </elementProp>
    </TestPlan>
    <hashTree>
      <!-- CSV Data Set (optional) -->
      <!-- Thread Group -->
      <ThreadGroup guiclass="ThreadGroupGui" testclass="ThreadGroup" testname="Users" enabled="true">
        <stringProp name="ThreadGroup.on_sample_error">continue</stringProp>
        <elementProp name="ThreadGroup.main_controller" elementType="LoopController">
          <boolProp name="LoopController.continue_forever">${loops === -1 ? 'true' : 'false'}</boolProp>
          <intProp name="LoopController.loops">${loops}</intProp>
        </elementProp>
        <stringProp name="ThreadGroup.num_threads">${threads}</stringProp>
        <stringProp name="ThreadGroup.ramp_time">${rampUp}</stringProp>
        <boolProp name="ThreadGroup.scheduler">${duration > 0 ? 'true' : 'false'}</boolProp>
        <stringProp name="ThreadGroup.duration">${duration}</stringProp>
        <stringProp name="ThreadGroup.delay">0</stringProp>
      </ThreadGroup>
      <hashTree>
        <!-- Config: HTTP Defaults -->
        <ConfigTestElement guiclass="HttpDefaultsGui" testclass="ConfigTestElement" testname="HTTP Defaults" enabled="true">
          <elementProp name="HTTPsampler.Arguments" elementType="Arguments">
            <collectionProp name="Arguments.arguments"/>
          </elementProp>
          <stringProp name="HTTPSampler.domain">${escXml(resolvedHost)}</stringProp>
          <stringProp name="HTTPSampler.port">${resolvedPort}</stringProp>
          <stringProp name="HTTPSampler.protocol">${resolvedProtocol}</stringProp>
          <stringProp name="HTTPSampler.contentEncoding">UTF-8</stringProp>
          <stringProp name="HTTPSampler.implementation">HttpClient4</stringProp>
        </ConfigTestElement>
        <hashTree/>

        <!-- Config: HTTP Cookie Manager -->
        <CookieManager guiclass="CookiePanel" testclass="CookieManager" testname="Cookie Manager" enabled="true">
          <collectionProp name="CookieManager.cookies"/>
          <boolProp name="CookieManager.clearEachIteration">false</boolProp>
        </CookieManager>
        <hashTree/>

        <!-- Config: HTTP Cache Manager -->
        <CacheManager guiclass="CacheManagerGui" testclass="CacheManager" testname="Cache Manager" enabled="true">
          <boolProp name="clearEachIteration">false</boolProp>
        </CacheManager>
        <hashTree/>

        ${endpointSamplers}

        <!-- Listeners -->
        <ResultCollector guiclass="SummaryReport" testclass="ResultCollector" testname="Summary Report" enabled="false">
          <boolProp name="ResultCollector.error_logging">false</boolProp>
          <objProp>
            <name>saveConfig</name>
            <value class="SampleSaveConfiguration">
              <time>true</time>
              <latency>true</latency>
              <timestamp>true</timestamp>
              <success>true</success>
              <label>true</label>
              <code>true</code>
              <message>true</message>
              <threadName>true</threadName>
              <dataType>true</dataType>
              <encoding>false</encoding>
              <assertions>true</assertions>
              <subresults>true</subresults>
              <responseData>false</responseData>
              <samplerData>false</samplerData>
              <xml>false</xml>
              <fieldNames>true</fieldNames>
              <responseHeaders>false</responseHeaders>
              <requestHeaders>false</requestHeaders>
              <responseDataOnError>false</responseDataOnError>
              <saveAssertionResultsFailureMessage>false</saveAssertionResultsFailureMessage>
              <assertionsResultsToSave>0</assertionsResultsToSave>
              <bytes>true</bytes>
              <sentBytes>true</sentBytes>
              <url>true</url>
              <threadCounts>true</threadCounts>
              <idleTime>true</idleTime>
              <connectTime>true</connectTime>
            </value>
          </objProp>
          <stringProp name="filename"></stringProp>
        </ResultCollector>
        <hashTree/>
      </hashTree>
    </hashTree>
  </hashTree>
</jmeterTestPlan>`;
}

function buildHTTPSampler({ name, method, path: urlPath, body, contentType }, assertions = []) {
  const assertionXml = assertions.map(a => `
        <ResponseAssertion guiclass="AssertionGui" testclass="ResponseAssertion" testname="${escXml(a.name || 'Assert')}" enabled="true">
          <collectionProp name="Asserion.test_strings">
            <stringProp name="51">${escXml(String(a.value || ''))}</stringProp>
          </collectionProp>
          <stringProp name="Assertion.test_field">${a.field || 'Assertion.response_code'}</stringProp>
          <boolProp name="Assertion.assume_success">false</boolProp>
          <intProp name="Assertion.test_type">8</intProp>
        </ResponseAssertion>
        <hashTree/>`).join('');

  const bodyXml = body ? `
          <boolProp name="HTTPSampler.postBodyRaw">true</boolProp>
          <elementProp name="HTTPsampler.Arguments" elementType="Arguments">
            <collectionProp name="Arguments.arguments">
              <elementProp name="" elementType="HTTPArgument">
                <boolProp name="HTTPArgument.always_encode">false</boolProp>
                <stringProp name="Argument.value">${escXml(body)}</stringProp>
                <stringProp name="Argument.metadata">=</stringProp>
              </elementProp>
            </collectionProp>
          </elementProp>` : `
          <elementProp name="HTTPsampler.Arguments" elementType="Arguments">
            <collectionProp name="Arguments.arguments"/>
          </elementProp>`;

  return `
        <HTTPSamplerProxy guiclass="HttpTestSampleGui" testclass="HTTPSamplerProxy" testname="${escXml(name)}" enabled="true">
          <stringProp name="HTTPSampler.path">${escXml(urlPath)}</stringProp>
          <stringProp name="HTTPSampler.method">${method.toUpperCase()}</stringProp>
          <boolProp name="HTTPSampler.follow_redirects">true</boolProp>
          <boolProp name="HTTPSampler.auto_redirects">false</boolProp>
          <boolProp name="HTTPSampler.use_keepalive">true</boolProp>
          <boolProp name="HTTPSampler.DO_MULTIPART_POST">false</boolProp>
          ${bodyXml}
        </HTTPSamplerProxy>
        <hashTree>
          <HeaderManager guiclass="HeaderPanel" testclass="HeaderManager" testname="Headers" enabled="true">
            <collectionProp name="HeaderManager.headers">
              <elementProp name="" elementType="Header">
                <stringProp name="Header.name">Content-Type</stringProp>
                <stringProp name="Header.value">${contentType}</stringProp>
              </elementProp>
              <elementProp name="" elementType="Header">
                <stringProp name="Header.name">Accept</stringProp>
                <stringProp name="Header.value">application/json, text/html, */*</stringProp>
              </elementProp>
            </collectionProp>
          </HeaderManager>
          <hashTree/>
          ${assertionXml}
        </hashTree>`;
}

function escXml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// ─── JTL Results Parser ────────────────────────────────────────────────────────
function parseJTL(jtlPath) {
  if (!fs.existsSync(jtlPath)) return null;

  const lines = fs.readFileSync(jtlPath, 'utf8').split('\n').filter(Boolean);
  if (lines.length < 2) return null;

  const headers = lines[0].split(',');
  const idx = (name) => headers.indexOf(name);

  const rows = lines.slice(1).map(line => {
    const cols = line.split(',');
    return {
      timestamp: parseInt(cols[idx('timeStamp')] || '0'),
      elapsed:   parseInt(cols[idx('elapsed')] || '0'),
      label:     cols[idx('label')] || '',
      success:   cols[idx('success')] === 'true',
      bytes:     parseInt(cols[idx('bytes')] || '0'),
      latency:   parseInt(cols[idx('Latency')] || '0'),
      connect:   parseInt(cols[idx('Connect')] || '0'),
      code:      cols[idx('responseCode')] || '',
    };
  });

  if (rows.length === 0) return { samples: 0 };

  const total    = rows.length;
  const passed   = rows.filter(r => r.success).length;
  const failed   = total - passed;
  const errorPct = ((failed / total) * 100).toFixed(2);

  const times = rows.map(r => r.elapsed).sort((a, b) => a - b);
  const avgTime   = Math.round(times.reduce((s, v) => s + v, 0) / total);
  const minTime   = times[0];
  const maxTime   = times[times.length - 1];
  const p90       = times[Math.floor(total * 0.9)];
  const p95       = times[Math.floor(total * 0.95)];
  const p99       = times[Math.floor(total * 0.99)];
  const medianTime = times[Math.floor(total * 0.5)];

  const durationMs = rows[rows.length - 1].timestamp - rows[0].timestamp + rows[rows.length - 1].elapsed;
  const throughput = durationMs > 0 ? ((total / durationMs) * 1000).toFixed(2) : 0;

  // Per-label breakdown
  const byLabel = {};
  for (const r of rows) {
    if (!byLabel[r.label]) byLabel[r.label] = { total: 0, passed: 0, times: [], codes: {} };
    byLabel[r.label].total++;
    if (r.success) byLabel[r.label].passed++;
    byLabel[r.label].times.push(r.elapsed);
    byLabel[r.label].codes[r.code] = (byLabel[r.label].codes[r.code] || 0) + 1;
  }

  const labelBreakdown = Object.entries(byLabel).map(([label, d]) => ({
    label,
    samples: d.total,
    errors: d.total - d.passed,
    errorPct: (((d.total - d.passed) / d.total) * 100).toFixed(2),
    avgMs: Math.round(d.times.reduce((s, v) => s + v, 0) / d.times.length),
    minMs: Math.min(...d.times),
    maxMs: Math.max(...d.times),
    responseCodes: d.codes
  }));

  return {
    summary: {
      samples: total,
      passed,
      failed,
      errorPct: parseFloat(errorPct),
      avgMs: avgTime,
      minMs: minTime,
      maxMs: maxTime,
      medianMs: medianTime,
      p90Ms: p90,
      p95Ms: p95,
      p99Ms: p99,
      throughput: parseFloat(throughput),
      durationMs
    },
    labelBreakdown,
    status: parseFloat(errorPct) === 0 ? 'passed' : (parseFloat(errorPct) > 50 ? 'failed' : 'warning')
  };
}

// ─── In-memory run store ───────────────────────────────────────────────────────
const runs = new Map(); // testId → { status, config, result, logs, pid }

function getRunStatus(testId) {
  return runs.get(testId) || null;
}

// ─── Main execute function ─────────────────────────────────────────────────────
function executePerformanceTest(testId, config, io) {
  const jmeterExe = findJMeter();

  const runDir  = path.join(JMETER_RESULTS_DIR, testId);
  const planDir = path.join(JMETER_PLANS_DIR, testId);
  fs.mkdirSync(runDir,  { recursive: true });
  fs.mkdirSync(planDir, { recursive: true });

  const jmxPath    = path.join(planDir, 'plan.jmx');
  const jtlPath    = path.join(runDir,  'results.jtl');
  const reportDir  = path.join(runDir,  'html-report');
  const logPath    = path.join(runDir,  'jmeter.log');

  const run = {
    testId,
    status:  'running',
    config,
    result:  null,
    logs:    [],
    jmxPath,
    jtlPath,
    reportDir,
    logPath,
    startedAt: new Date().toISOString()
  };
  runs.set(testId, run);

  // Generate JMX
  const jmxContent = buildJMXPlan(config);
  fs.writeFileSync(jmxPath, jmxContent, 'utf8');
  console.log(`[JMeter] Plan written: ${jmxPath}`);

  // Emit start event
  if (io) io.emit('test-progress', {
    testId,
    status:  'running',
    message: 'JMeter performance test started...',
    percentage: 5,
    timestamp: new Date()
  });

  // If JMeter not found, run simulation
  if (!jmeterExe) {
    console.warn('[JMeter] JMeter executable not found – running SIMULATION mode');
    run.logs.push('[SIMULATION] JMeter not found – generating simulated results');
    if (io) io.emit('test-progress', { testId, status: 'running', message: '⚠️ JMeter not installed – running simulation...', percentage: 20, timestamp: new Date() });

    setTimeout(() => {
      const simResult = generateSimulatedResults(config, testId, jtlPath);
      run.status = simResult.status;
      run.result = simResult;
      run.completedAt = new Date().toISOString();

      // Save to RAG history
      ragIntegrationService.sendToRAG({
        runId: testId,
        testType: 'jmeter',
        prompt: config.prompt || config.testName || 'Performance Test',
        testClass: config.testName || 'JMeterTest',
        status: simResult.status,
        timestamp: new Date().toISOString(),
        duration: simResult.summary ? simResult.summary.durationMs : 0,
        results: {
          totalTests: simResult.summary ? simResult.summary.samples : 0,
          passed:     simResult.summary ? simResult.summary.passed : 0,
          failed:     simResult.summary ? simResult.summary.failed : 0,
          skipped: 0
        },
        metadata: {
          targetUrl:  config.targetUrl,
          threads:    config.threads,
          duration:   config.duration,
          throughput: simResult.summary ? simResult.summary.throughput : 0,
          avgMs:      simResult.summary ? simResult.summary.avgMs : 0,
          errorPct:   simResult.summary ? simResult.summary.errorPct : 0,
          simulation: true
        }
      }).catch(() => {});

      if (io) io.emit('test-progress', {
        testId,
        status:     simResult.status,
        message:    `Performance test ${simResult.status} (simulated) — ${simResult.summary.samples} samples, avg ${simResult.summary.avgMs}ms, ${simResult.summary.throughput} req/s`,
        percentage: 100,
        jmeterResult: simResult,
        simulation: true,
        timestamp:  new Date()
      });
    }, 3000);
    return testId;
  }

  // Real JMeter execution
  const args = [
    '-n',
    '-t', jmxPath,
    '-l', jtlPath,
    '-e', '-o', reportDir,
    '-j', logPath,
    '-Xms512m', '-Xmx1024m'
  ];

  console.log(`[JMeter] Executing: ${jmeterExe} ${args.join(' ')}`);
  const proc = spawn(jmeterExe, args, { shell: true });
  run.pid = proc.pid;

  let progressPct = 10;
  const progressInterval = setInterval(() => {
    progressPct = Math.min(progressPct + 5, 90);
    if (io) io.emit('test-progress', {
      testId, status: 'running',
      message: `Running performance test... (${progressPct}%)`,
      percentage: progressPct, timestamp: new Date()
    });
  }, Math.max((config.duration || 60) * 1000 / 18, 3000));

  proc.stdout.on('data', d => {
    const line = d.toString().trim();
    run.logs.push(line);
    console.log('[JMeter]', line);
    if (io) io.emit('test-log', { testId, line, timestamp: new Date() });
  });
  proc.stderr.on('data', d => {
    const line = d.toString().trim();
    run.logs.push('[ERR] ' + line);
    console.error('[JMeter ERR]', line);
  });

  proc.on('close', (code) => {
    clearInterval(progressInterval);
    console.log(`[JMeter] Process exited with code ${code}`);

    const parsed = parseJTL(jtlPath);
    run.completedAt = new Date().toISOString();

    if (code !== 0 || !parsed) {
      run.status = 'failed';
      run.result = { status: 'failed', error: `JMeter exited with code ${code}` };

      ragIntegrationService.sendToRAG({
        runId: testId, testType: 'jmeter',
        prompt: config.prompt || config.testName || 'Performance Test',
        testClass: config.testName || 'JMeterTest',
        status: 'failed',
        timestamp: new Date().toISOString(),
        duration: 0,
        results: { totalTests: 0, passed: 0, failed: 1, skipped: 0 },
        metadata: { targetUrl: config.targetUrl, exitCode: code }
      }).catch(() => {});

      if (io) io.emit('test-progress', {
        testId, status: 'failed',
        message: `Performance test failed (JMeter exit code: ${code})`,
        percentage: 100, timestamp: new Date()
      });
    } else {
      run.status = parsed.status;
      run.result = parsed;
      run.reportUrl = `/performance-results/${testId}/html-report/index.html`;

      ragIntegrationService.sendToRAG({
        runId: testId, testType: 'jmeter',
        prompt: config.prompt || config.testName || 'Performance Test',
        testClass: config.testName || 'JMeterTest',
        status: parsed.status,
        timestamp: new Date().toISOString(),
        duration: parsed.summary ? parsed.summary.durationMs : 0,
        results: {
          totalTests: parsed.summary ? parsed.summary.samples : 0,
          passed:     parsed.summary ? parsed.summary.passed : 0,
          failed:     parsed.summary ? parsed.summary.failed : 0,
          skipped: 0
        },
        metadata: {
          targetUrl:  config.targetUrl,
          threads:    config.threads,
          duration:   config.duration,
          throughput: parsed.summary ? parsed.summary.throughput : 0,
          avgMs:      parsed.summary ? parsed.summary.avgMs : 0,
          errorPct:   parsed.summary ? parsed.summary.errorPct : 0,
          reportUrl:  run.reportUrl
        }
      }).catch(() => {});

      if (io) io.emit('test-progress', {
        testId,
        status:       parsed.status,
        message:      `Performance test ${parsed.status} — ${parsed.summary.samples} samples, avg ${parsed.summary.avgMs}ms, ${parsed.summary.throughput} req/s`,
        percentage:   100,
        jmeterResult: parsed,
        reportUrl:    run.reportUrl,
        timestamp:    new Date()
      });
    }
  });

  return testId;
}

// ─── Simulated results (when JMeter is not installed) ─────────────────────────
function generateSimulatedResults(config, testId, jtlPath) {
  const { threads = 10, duration = 60 } = config;
  const totalRequests = threads * Math.floor(duration / 2);
  const baseLatency   = 180 + Math.random() * 120;
  const errorRate     = Math.random() * 3;

  const times = Array.from({ length: totalRequests }, () =>
    Math.round(baseLatency * (0.5 + Math.random()))
  ).sort((a, b) => a - b);

  const passed  = Math.floor(totalRequests * (1 - errorRate / 100));
  const failed  = totalRequests - passed;
  const avgMs   = Math.round(times.reduce((s, v) => s + v, 0) / times.length);

  // Write simulated JTL
  const header = 'timeStamp,elapsed,label,responseCode,responseMessage,threadName,dataType,success,failureMessage,bytes,sentBytes,grpThreads,allThreads,URL,Latency,IdleTime,Connect\n';
  const now    = Date.now();
  const jtlRows = times.map((t, i) => {
    const ok = i < passed;
    return `${now + i * 100},${t},Performance Test,${ok ? '200' : '500'},${ok ? 'OK' : 'Error'},Thread-${(i % threads) + 1},text,${ok},, 1024,512,${threads},${threads},${config.targetUrl || 'http://target'},${Math.round(t * 0.8)},0,${Math.round(t * 0.1)}`;
  }).join('\n');
  fs.writeFileSync(jtlPath, header + jtlRows, 'utf8');

  return {
    status:   failed === 0 ? 'passed' : (failed / totalRequests > 0.5 ? 'failed' : 'warning'),
    summary: {
      samples:    totalRequests,
      passed,
      failed,
      errorPct:   parseFloat(errorRate.toFixed(2)),
      avgMs,
      minMs:      times[0],
      maxMs:      times[times.length - 1],
      medianMs:   times[Math.floor(times.length * 0.5)],
      p90Ms:      times[Math.floor(times.length * 0.9)],
      p95Ms:      times[Math.floor(times.length * 0.95)],
      p99Ms:      times[Math.floor(times.length * 0.99)],
      throughput: parseFloat(((totalRequests / duration)).toFixed(2)),
      durationMs: duration * 1000
    },
    labelBreakdown: [
      {
        label:    config.testName || 'Performance Test',
        samples:  totalRequests,
        errors:   failed,
        errorPct: parseFloat(errorRate.toFixed(2)),
        avgMs,
        minMs:    times[0],
        maxMs:    times[times.length - 1],
        responseCodes: { '200': passed, '500': failed }
      }
    ],
    simulated: true,
    jmxPlan: path.join(JMETER_PLANS_DIR, testId, 'plan.jmx')
  };
}

// ─── Exports ───────────────────────────────────────────────────────────────────
module.exports = {
  findJMeter,
  buildJMXPlan,
  executePerformanceTest,
  getRunStatus,
  parseJTL,
  JMETER_RESULTS_DIR
};
