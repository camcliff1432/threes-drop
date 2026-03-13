/**
 * StorageBatcher - Batches localStorage writes to reduce I/O
 *
 * Queues set/remove operations and flushes them on a 500ms debounce,
 * on page hide, and on beforeunload.
 */
class StorageBatcher {
  constructor() {
    this.pending = new Map(); // key -> { action: 'set'|'remove', value? }
    this.flushTimer = null;
    this.DEBOUNCE_MS = 500;

    // Flush on page hide / unload
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') this.flush();
    });
    window.addEventListener('beforeunload', () => this.flush());
  }

  /**
   * Queue a value to be written
   */
  set(key, value) {
    this.pending.set(key, { action: 'set', value: String(value) });
    this._scheduleFlush();
  }

  /**
   * Read a value — checks pending writes first, then localStorage
   */
  get(key) {
    const entry = this.pending.get(key);
    if (entry) {
      return entry.action === 'set' ? entry.value : null;
    }
    return localStorage.getItem(key);
  }

  /**
   * Queue a key for removal
   */
  remove(key) {
    this.pending.set(key, { action: 'remove' });
    this._scheduleFlush();
  }

  /**
   * Write all pending changes to localStorage immediately
   */
  flush() {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
    for (const [key, entry] of this.pending) {
      try {
        if (entry.action === 'set') {
          localStorage.setItem(key, entry.value);
        } else {
          localStorage.removeItem(key);
        }
      } catch (e) {
        console.warn('StorageBatcher flush error:', key, e);
      }
    }
    this.pending.clear();
  }

  _scheduleFlush() {
    if (this.flushTimer) clearTimeout(this.flushTimer);
    this.flushTimer = setTimeout(() => this.flush(), this.DEBOUNCE_MS);
  }
}

// Global instance
const storageBatcher = new StorageBatcher();
