/**
 * DAY 23: ASYNCHRONOUS VS SYNCHRONOUS JAVASCRIPT
 * Executable Node.js Demonstration Script
 * 
 * Topics Tested:
 * 1. Synchronous Blocking vs Asynchronous Non-blocking
 * 2. Event Loop Priority: Call Stack -> Microtask -> Macrotask
 * 3. Promise Concurrency: Sequential vs Parallel (Promise.all)
 * 4. Error Handling with async/await and Promise.allSettled
 */

// Helper to format logs
const log = (tag, msg) => console.log(`[${tag.padEnd(12)}] ${msg}`);

console.log("=================================================");
console.log("DAY 23: ASYNC VS SYNC RUNTIME CONCURRENCY TEST");
console.log("=================================================\n");

// -------------------------------------------------
// 1. SYNCHRONOUS VS ASYNCHRONOUS FLOW
// -------------------------------------------------
console.log("--- 1. Synchronous vs Asynchronous Flow ---");
log("SYNC", "1. Line 1 executes on Call Stack");

setTimeout(() => {
  log("ASYNC TIMER", "4. setTimeout callback executed from Macrotask Queue");
}, 0);

log("SYNC", "2. Line 2 executes on Call Stack");

Promise.resolve().then(() => {
  log("ASYNC PROMISE", "3. Promise.then executed from Microtask Queue");
});

log("SYNC", "End of Phase 1 Synchronous block\n");

// -------------------------------------------------
// 2. THE EVENT LOOP PRIORITY SHOWDOWN
// -------------------------------------------------
setTimeout(() => {
  console.log("\n--- 2. Event Loop Priority Showdown ---");
  log("CALL STACK", "A: Synchronous start");

  setTimeout(() => {
    log("MACROTASK", "E: setTimeout (Timer callback)");
  }, 0);

  setImmediate(() => {
    log("MACROTASK", "F: setImmediate (Check phase)");
  });

  Promise.resolve().then(() => {
    log("MICROTASK", "C: Promise.then (Microtask Queue)");
  });

  queueMicrotask(() => {
    log("MICROTASK", "D: queueMicrotask explicitly queued");
  });

  process.nextTick(() => {
    log("TICK (NODE)", "B: process.nextTick (Runs before other microtasks)");
  });

  log("CALL STACK", "Synchronous end - Now yielding thread!\n");
}, 50);

// -------------------------------------------------
// 3. CONCURRENCY BENCHMARK: SEQUENTIAL VS PARALLEL
// -------------------------------------------------
const delayTask = (id, durationMs, shouldFail = false) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) {
        reject(new Error(`Task ${id} encountered an error`));
      } else {
        resolve(`Task ${id} completed in ${durationMs}ms`);
      }
    }, durationMs);
  });
};

setTimeout(async () => {
  console.log("\n--- 3. Concurrency Benchmark: Sequential vs Parallel ---");

  // A. Sequential Execution (Slow)
  const t0 = Date.now();
  log("BENCHMARK", "Starting Sequential Execution (3 tasks of 100ms each)...");
  for (let i = 1; i <= 3; i++) {
    const res = await delayTask(i, 100);
    log("SEQUENTIAL", res);
  }
  const sequentialTime = Date.now() - t0;
  log("RESULT", `Sequential total time: ${sequentialTime}ms (Expected ~300ms)`);

  // B. Parallel Execution with Promise.all (Fast)
  const t1 = Date.now();
  log("BENCHMARK", "Starting Parallel Execution (3 tasks in parallel)...");
  const parallelResults = await Promise.all([
    delayTask("A", 100),
    delayTask("B", 100),
    delayTask("C", 100)
  ]);
  parallelResults.forEach(r => log("PARALLEL", r));
  const parallelTime = Date.now() - t1;
  log("RESULT", `Parallel total time: ${parallelTime}ms (Expected ~100ms)`);

  // -------------------------------------------------
  // 4. ROBUST ERROR HANDLING WITH PROMISE.ALLSETTLED
  // -------------------------------------------------
  console.log("\n--- 4. Error Tolerance with Promise.allSettled ---");
  const settledTasks = await Promise.allSettled([
    delayTask("Safe-1", 50),
    delayTask("Faulty-2", 50, true), // Intentional rejection
    delayTask("Safe-3", 50)
  ]);

  settledTasks.forEach((outcome, idx) => {
    if (outcome.status === 'fulfilled') {
      log("FULFILLED", `Item ${idx}: ${outcome.value}`);
    } else {
      log("REJECTED", `Item ${idx}: ${outcome.reason.message}`);
    }
  });

  console.log("\n=================================================");
  console.log("✅ Day 23 Asynchronous Script Completed Cleanly!");
  console.log("=================================================");
}, 200);
