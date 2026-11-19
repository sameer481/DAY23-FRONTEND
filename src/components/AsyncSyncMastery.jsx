import React, { useState, useEffect, useRef } from 'react';
import styles from './AsyncSyncMastery.module.css';

export default function AsyncSyncMastery() {
  const [activeTab, setActiveTab] = useState('eventloop');

  // TAB 1: Event Loop Simulator State
  const [callStack, setCallStack] = useState([]);
  const [webApis, setWebApis] = useState([]);
  const [microtasks, setMicrotasks] = useState([]);
  const [macrotasks, setMacrotasks] = useState([]);
  const [logs, setLogs] = useState([]);
  const [isSimulating, setIsSimulating] = useState(false);

  // TAB 2: Thread Blocking State
  const [smoothCounter, setSmoothCounter] = useState(0);
  const [blockStatus, setBlockStatus] = useState('Idle');

  useEffect(() => {
    const timer = setInterval(() => {
      setSmoothCounter((prev) => (prev + 1) % 1000);
    }, 50);
    return () => clearInterval(timer);
  }, []);

  // TAB 3: Concurrency State
  const [concurrencyLogs, setConcurrencyLogs] = useState([]);
  const [benchmarkStatus, setBenchmarkStatus] = useState('idle');
  const [seqDuration, setSeqDuration] = useState(null);
  const [parDuration, setParDuration] = useState(null);

  // Helper sleep
  const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

  // --- TAB 1: SIMULATION HANDLER ---
  const runEventLoopSimulation = async () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setCallStack([]);
    setWebApis([]);
    setMicrotasks([]);
    setMacrotasks([]);
    setLogs([]);

    const addLog = (msg) => setLogs((prev) => [...prev, msg]);

    // 1. Script starts -> Call Stack pushes main()
    setCallStack(['main()']);
    await sleep(600);

    // 2. Synchronous log
    setCallStack(['console.log("1: Sync Start")', 'main()']);
    addLog('1: Sync Start (Synchronous)');
    await sleep(700);

    // 3. setTimeout encountered
    setCallStack(['setTimeout(callback, 0)', 'main()']);
    await sleep(500);
    setWebApis(['Timer (0ms)']);
    setCallStack(['main()']);
    await sleep(600);

    // Timer expires -> moved to Macrotask queue
    setWebApis([]);
    setMacrotasks(['setTimeout Callback']);
    await sleep(500);

    // 4. Promise encountered
    setCallStack(['Promise.resolve().then(...)', 'main()']);
    await sleep(500);
    setMicrotasks(['Promise Microtask Callback']);
    setCallStack(['main()']);
    await sleep(600);

    // 5. Synchronous end
    setCallStack(['console.log("2: Sync End")', 'main()']);
    addLog('2: Sync End (Synchronous)');
    await sleep(700);

    // 6. main() pops -> Call stack is empty!
    setCallStack([]);
    addLog('--- Call Stack Empty: Event Loop checks Microtask Queue ---');
    await sleep(800);

    // 7. Drain Microtask Queue
    setCallStack(['Promise Microtask Callback']);
    setMicrotasks([]);
    addLog('3: Promise Resolved (Microtask Queue)');
    await sleep(800);
    setCallStack([]);
    await sleep(600);

    // 8. Event Loop checks Macrotask Queue
    addLog('--- Microtasks Drained: Event Loop picks ONE Macrotask ---');
    setCallStack(['setTimeout Callback']);
    setMacrotasks([]);
    addLog('4: setTimeout Callback Executed (Macrotask Queue)');
    await sleep(800);
    setCallStack([]);

    addLog('✅ Simulation Complete!');
    setIsSimulating(false);
  };

  // --- TAB 2: THREAD BLOCKING HANDLERS ---
  const handleSynchronousBlock = () => {
    setBlockStatus('BLOCKING THREAD (1.5 seconds)... Notice UI counter freeze!');
    // Allow UI state to render status first
    setTimeout(() => {
      const start = Date.now();
      while (Date.now() - start < 1500) {
        // Pure synchronous lock-up
      }
      setBlockStatus('Thread Unblocked!');
    }, 50);
  };

  const handleAsynchronousYield = async () => {
    setBlockStatus('Running Non-Blocking Async chunks... Counter remains smooth!');
    for (let i = 1; i <= 6; i++) {
      await sleep(250);
      setBlockStatus(`Completed async chunk ${i}/6 without freezing!`);
    }
    setBlockStatus('Async Non-Blocking process finished.');
  };

  // --- TAB 3: CONCURRENCY BENCHMARK HANDLERS ---
  const fakeApiCall = (name, delay) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`${name} completed (${delay}ms)`);
      }, delay);
    });
  };

  const runSequential = async () => {
    setBenchmarkStatus('running-seq');
    setConcurrencyLogs(['Starting Sequential Execution...']);
    const start = Date.now();

    const r1 = await fakeApiCall('User Profile', 400);
    setConcurrencyLogs((p) => [...p, `[1/3] ${r1}`]);

    const r2 = await fakeApiCall('User Orders', 400);
    setConcurrencyLogs((p) => [...p, `[2/3] ${r2}`]);

    const r3 = await fakeApiCall('User Notifications', 400);
    setConcurrencyLogs((p) => [...p, `[3/3] ${r3}`]);

    const duration = Date.now() - start;
    setSeqDuration(duration);
    setConcurrencyLogs((p) => [...p, `⚡ Sequential Total Time: ${duration}ms`]);
    setBenchmarkStatus('idle');
  };

  const runParallel = async () => {
    setBenchmarkStatus('running-par');
    setConcurrencyLogs(['Starting Parallel Execution (Promise.all)...']);
    const start = Date.now();

    const results = await Promise.all([
      fakeApiCall('User Profile', 400),
      fakeApiCall('User Orders', 400),
      fakeApiCall('User Notifications', 400)
    ]);

    results.forEach((r, idx) => {
      setConcurrencyLogs((p) => [...p, `[Parallel ${idx + 1}/3] ${r}`]);
    });

    const duration = Date.now() - start;
    setParDuration(duration);
    setConcurrencyLogs((p) => [...p, `🚀 Parallel Total Time: ${duration}ms (All concurrent!)`]);
    setBenchmarkStatus('idle');
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Day 23: Asynchronous vs Synchronous Mastery</h1>
        <p className={styles.subtitle}>
          Interactive Visualizer for the JavaScript Event Loop, Call Stack, Microtasks & Concurrency Models
        </p>
      </header>

      <nav className={styles.tabs}>
        <button
          className={`${styles.tabBtn} ${activeTab === 'eventloop' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('eventloop')}
        >
          Event Loop Visualizer
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'blocking' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('blocking')}
        >
          Blocking vs Non-Blocking UI
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'concurrency' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('concurrency')}
        >
          Sequential vs Parallel Concurrency
        </button>
      </nav>

      {/* TAB 1: EVENT LOOP VISUALIZER */}
      {activeTab === 'eventloop' && (
        <section className={styles.panel}>
          <div className={styles.controls}>
            <button
              onClick={runEventLoopSimulation}
              disabled={isSimulating}
              className={`${styles.button} ${styles.accentBtn}`}
            >
              {isSimulating ? 'Simulating Event Loop...' : '▶ Run Event Loop Simulation'}
            </button>
          </div>

          <div className={styles.grid}>
            {/* Call Stack */}
            <div className={styles.queueCard}>
              <div className={styles.queueTitle} style={{ color: '#60a5fa' }}>
                <span>Call Stack</span>
                <span>{callStack.length}</span>
              </div>
              <div className={styles.queueItems}>
                {callStack.length === 0 ? (
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>(Empty)</span>
                ) : (
                  callStack.map((item, i) => (
                    <div key={i} className={`${styles.itemBadge} ${styles.badgeCallStack}`}>
                      {item}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Web APIs */}
            <div className={styles.queueCard}>
              <div className={styles.queueTitle} style={{ color: '#fbbf24' }}>
                <span>Web APIs</span>
                <span>{webApis.length}</span>
              </div>
              <div className={styles.queueItems}>
                {webApis.length === 0 ? (
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>(Idle)</span>
                ) : (
                  webApis.map((item, i) => (
                    <div key={i} className={`${styles.itemBadge} ${styles.badgeWebApi}`}>
                      {item}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Microtasks */}
            <div className={styles.queueCard}>
              <div className={styles.queueTitle} style={{ color: '#c084fc' }}>
                <span>Microtask Queue</span>
                <span>{microtasks.length}</span>
              </div>
              <div className={styles.queueItems}>
                {microtasks.length === 0 ? (
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>(Empty)</span>
                ) : (
                  microtasks.map((item, i) => (
                    <div key={i} className={`${styles.itemBadge} ${styles.badgeMicrotask}`}>
                      {item}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Macrotasks */}
            <div className={styles.queueCard}>
              <div className={styles.queueTitle} style={{ color: '#f472b6' }}>
                <span>Macrotask Queue</span>
                <span>{macrotasks.length}</span>
              </div>
              <div className={styles.queueItems}>
                {macrotasks.length === 0 ? (
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>(Empty)</span>
                ) : (
                  macrotasks.map((item, i) => (
                    <div key={i} className={`${styles.itemBadge} ${styles.badgeMacrotask}`}>
                      {item}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <h4 style={{ margin: '16px 0 8px 0', color: 'var(--text-muted)' }}>Console Output</h4>
          <div className={styles.consoleLog}>
            {logs.length === 0 ? (
              <span style={{ color: 'var(--text-muted)' }}>Click "Run Event Loop Simulation" above...</span>
            ) : (
              logs.map((l, i) => <div key={i}>{l}</div>)
            )}
          </div>
        </section>
      )}

      {/* TAB 2: BLOCKING VS NON-BLOCKING UI */}
      {activeTab === 'blocking' && (
        <section className={styles.panel}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #3b82f6, #ec4899)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '1.2rem',
                boxShadow: '0 0 15px rgba(59,130,246,0.5)'
              }}
            >
              {smoothCounter}
            </div>
            <div>
              <h3 style={{ margin: 0 }}>High-Frequency UI Heartbeat Counter</h3>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Ticks every 50ms. If synchronous code blocks the thread, this counter immediately freezes!
              </p>
            </div>
          </div>

          <div className={styles.controls}>
            <button onClick={handleSynchronousBlock} className={`${styles.button} ${styles.dangerBtn}`}>
              ⚠️ Run Synchronous Block (1.5s freeze)
            </button>
            <button onClick={handleAsynchronousYield} className={`${styles.button} ${styles.accentBtn}`}>
              ✨ Run Asynchronous Yield (Smooth)
            </button>
          </div>

          <div className={styles.benchmarkMeter}>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Thread Status:</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#38bdf8', marginTop: '4px' }}>
              {blockStatus}
            </div>
          </div>
        </section>
      )}

      {/* TAB 3: CONCURRENCY BENCHMARK */}
      {activeTab === 'concurrency' && (
        <section className={styles.panel}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
            Compare fetching 3 simulated remote endpoints (400ms each) sequentially vs concurrently with <code>Promise.all</code>.
          </p>

          <div className={styles.controls}>
            <button
              onClick={runSequential}
              disabled={benchmarkStatus !== 'idle'}
              className={`${styles.button} ${styles.warningBtn}`}
            >
              Run Sequential (for...of await)
            </button>
            <button
              onClick={runParallel}
              disabled={benchmarkStatus !== 'idle'}
              className={`${styles.button} ${styles.accentBtn}`}
            >
              Run Parallel (Promise.all)
            </button>
          </div>

          <div className={styles.grid}>
            <div className={styles.benchmarkMeter}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Sequential Time</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f59e0b' }}>
                {seqDuration ? `${seqDuration}ms` : 'Not run'}
              </div>
              <div className={styles.meterBar}>
                <div
                  className={styles.meterFill}
                  style={{
                    width: seqDuration ? '100%' : '0%',
                    background: '#f59e0b'
                  }}
                />
                <div className={styles.meterText}>~1200ms (3 x 400ms)</div>
              </div>
            </div>

            <div className={styles.benchmarkMeter}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Parallel Time</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#10b981' }}>
                {parDuration ? `${parDuration}ms` : 'Not run'}
              </div>
              <div className={styles.meterBar}>
                <div
                  className={styles.meterFill}
                  style={{
                    width: parDuration ? '35%' : '0%',
                    background: '#10b981'
                  }}
                />
                <div className={styles.meterText}>~400ms (Concurrent)</div>
              </div>
            </div>
          </div>

          <h4 style={{ margin: '16px 0 8px 0', color: 'var(--text-muted)' }}>Execution Telemetry</h4>
          <div className={styles.consoleLog}>
            {concurrencyLogs.length === 0 ? (
              <span style={{ color: 'var(--text-muted)' }}>Select an execution pattern above...</span>
            ) : (
              concurrencyLogs.map((l, i) => <div key={i}>{l}</div>)
            )}
          </div>
        </section>
      )}
    </div>
  );
}
