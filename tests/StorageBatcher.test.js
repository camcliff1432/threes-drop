/**
 * StorageBatcher unit tests — minimal Node.js test runner (no dependencies)
 */
const { readFileSync } = require('fs');
const { resolve } = require('path');
const vm = require('vm');

// ---- tiny test harness ----
let passed = 0;
let failed = 0;

function assert(cond, msg) {
  if (!cond) throw new Error('Assertion failed: ' + msg);
}

function assertEqual(actual, expected, msg) {
  if (actual !== expected) {
    throw new Error(`Assertion failed: ${msg} (expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)})`);
  }
}

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  PASS  ${name}`);
  } catch (e) {
    failed++;
    console.log(`  FAIL  ${name}`);
    console.log(`        ${e.message}`);
  }
}

// ---- Mock browser globals ----
function createMockLocalStorage() {
  const store = {};
  return {
    _store: store,
    getItem(key) { return key in store ? store[key] : null; },
    setItem(key, value) { store[key] = String(value); },
    removeItem(key) { delete store[key]; },
    clear() { for (const k of Object.keys(store)) delete store[k]; }
  };
}

// Set up globals before loading StorageBatcher
globalThis.localStorage = createMockLocalStorage();
globalThis.window = {
  addEventListener() {} // no-op for visibilitychange/beforeunload
};
globalThis.document = {
  visibilityState: 'visible'
};

// Load StorageBatcher source
const src = readFileSync(resolve(__dirname, '..', 'js', 'StorageBatcher.js'), 'utf-8');
vm.runInThisContext(src);

// Helper: create a fresh StorageBatcher for each test
function makeBatcher() {
  globalThis.localStorage = createMockLocalStorage();
  return new StorageBatcher();
}

// ==============================
// set() stores pending values
// ==============================
console.log('\n--- set() ---');

test('set() stores a value in pending', () => {
  const b = makeBatcher();
  b.set('foo', 'bar');
  assert(b.pending.has('foo'), 'pending should contain key');
  assertEqual(b.pending.get('foo').action, 'set', 'action should be set');
  assertEqual(b.pending.get('foo').value, 'bar', 'value should be bar');
});

test('set() does not immediately write to localStorage', () => {
  const b = makeBatcher();
  b.set('foo', 'bar');
  assertEqual(localStorage.getItem('foo'), null, 'localStorage should not have value yet');
});

test('set() coerces values to strings', () => {
  const b = makeBatcher();
  b.set('num', 42);
  assertEqual(b.pending.get('num').value, '42', 'number should be coerced to string');
  b.set('bool', true);
  assertEqual(b.pending.get('bool').value, 'true', 'boolean should be coerced to string');
});

test('set() overwrites previous pending value for same key', () => {
  const b = makeBatcher();
  b.set('key', 'first');
  b.set('key', 'second');
  assertEqual(b.pending.get('key').value, 'second', 'should have latest value');
  assertEqual(b.pending.size, 1, 'should only have one entry');
});

// ==============================
// get() read-through cache
// ==============================
console.log('\n--- get() ---');

test('get() returns pending value before flush', () => {
  const b = makeBatcher();
  b.set('key', 'pending_value');
  assertEqual(b.get('key'), 'pending_value', 'should return pending value');
});

test('get() falls back to localStorage when no pending value', () => {
  const b = makeBatcher();
  localStorage.setItem('existing', 'from_storage');
  assertEqual(b.get('existing'), 'from_storage', 'should return localStorage value');
});

test('get() returns null for non-existent key', () => {
  const b = makeBatcher();
  assertEqual(b.get('nonexistent'), null, 'should return null');
});

test('get() returns null for key marked for removal', () => {
  const b = makeBatcher();
  localStorage.setItem('to_remove', 'value');
  b.remove('to_remove');
  assertEqual(b.get('to_remove'), null, 'should return null for removed key');
});

test('get() pending value takes priority over localStorage', () => {
  const b = makeBatcher();
  localStorage.setItem('key', 'old_value');
  b.set('key', 'new_value');
  assertEqual(b.get('key'), 'new_value', 'pending should take priority');
});

// ==============================
// remove() marks key for deletion
// ==============================
console.log('\n--- remove() ---');

test('remove() marks key for deletion in pending', () => {
  const b = makeBatcher();
  b.remove('key');
  assert(b.pending.has('key'), 'pending should contain key');
  assertEqual(b.pending.get('key').action, 'remove', 'action should be remove');
});

test('remove() overrides a previous set() for the same key', () => {
  const b = makeBatcher();
  b.set('key', 'value');
  b.remove('key');
  assertEqual(b.pending.get('key').action, 'remove', 'action should be remove');
});

test('set() after remove() overrides the removal', () => {
  const b = makeBatcher();
  b.remove('key');
  b.set('key', 'new_value');
  assertEqual(b.pending.get('key').action, 'set', 'action should be set');
  assertEqual(b.pending.get('key').value, 'new_value', 'value should be new_value');
});

// ==============================
// flush() writes to localStorage
// ==============================
console.log('\n--- flush() ---');

test('flush() writes all pending set values to localStorage', () => {
  const b = makeBatcher();
  b.set('a', '1');
  b.set('b', '2');
  b.flush();
  assertEqual(localStorage.getItem('a'), '1', 'a should be written');
  assertEqual(localStorage.getItem('b'), '2', 'b should be written');
});

test('flush() clears pending map', () => {
  const b = makeBatcher();
  b.set('key', 'value');
  b.flush();
  assertEqual(b.pending.size, 0, 'pending should be empty after flush');
});

test('flush() removes keys marked for deletion from localStorage', () => {
  const b = makeBatcher();
  localStorage.setItem('to_delete', 'value');
  b.remove('to_delete');
  b.flush();
  assertEqual(localStorage.getItem('to_delete'), null, 'key should be removed from localStorage');
});

test('flush() handles mixed set and remove operations', () => {
  const b = makeBatcher();
  localStorage.setItem('old_key', 'old_value');
  b.set('new_key', 'new_value');
  b.remove('old_key');
  b.flush();
  assertEqual(localStorage.getItem('new_key'), 'new_value', 'new_key should be set');
  assertEqual(localStorage.getItem('old_key'), null, 'old_key should be removed');
});

test('flush() with no pending operations is a no-op', () => {
  const b = makeBatcher();
  localStorage.setItem('existing', 'value');
  b.flush();
  assertEqual(localStorage.getItem('existing'), 'value', 'existing value should be unchanged');
  assertEqual(b.pending.size, 0, 'pending should still be empty');
});

test('flush() clears the debounce timer', () => {
  const b = makeBatcher();
  b.set('key', 'value');
  // _scheduleFlush sets flushTimer
  assert(b.flushTimer !== null, 'timer should be set after set()');
  b.flush();
  assertEqual(b.flushTimer, null, 'timer should be null after flush');
});

// ==============================
// Results
// ==============================
console.log(`\n${'='.repeat(30)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
