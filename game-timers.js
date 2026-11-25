/* Big Bug v19.1.0-ios.2 — pausable timers for the game only.
   The browser/native bridge keeps its own unmodified window timers. */
(() => {
  'use strict';
  const nativeSetTimeout = window.setTimeout.bind(window);
  const nativeClearTimeout = window.clearTimeout.bind(window);
  const now = () => window.performance.now();
  const timers = new Map();
  const MAX_DELAY = 2147483647;
  let paused = false;
  let nextID = 1;

  function allocateID() {
    while (timers.has(nextID)) nextID = nextID >= Number.MAX_SAFE_INTEGER ? 1 : nextID + 1;
    const id = nextID;
    nextID = nextID >= Number.MAX_SAFE_INTEGER ? 1 : nextID + 1;
    return id;
  }
  function normalizeDelay(value, repeating) {
    const delay = Number(value);
    const finite = Number.isFinite(delay) ? Math.max(0, Math.min(MAX_DELAY, delay)) : 0;
    // A zero interval must still yield to the event loop instead of spinning.
    return repeating ? Math.max(1, finite) : finite;
  }
  function arm(timer) {
    if (paused || timer.executing || timers.get(timer.id) !== timer) return;
    const generation = ++timer.generation;
    timer.dueAt = now() + timer.remaining;
    timer.handle = nativeSetTimeout(() => fire(timer, generation), timer.remaining);
  }
  function fire(timer, generation) {
    // A callback already queued before cancellation/pause must not fire later.
    if (timers.get(timer.id) !== timer || generation !== timer.generation) return;
    timer.handle = null;
    if (paused) {
      timer.remaining = Math.max(0, timer.dueAt - now());
      return;
    }
    if (!timer.repeating) timers.delete(timer.id);
    timer.executing = true;
    try {
      timer.callback.apply(window, timer.args);
    } finally {
      timer.executing = false;
      if (timer.repeating && timers.get(timer.id) === timer) {
        // Schedule from completion, never replay elapsed or hidden intervals.
        timer.remaining = timer.delay;
        arm(timer);
      }
    }
  }
  function create(callback, delay, repeating, args) {
    if (typeof callback !== 'function') throw new TypeError('Game timers require a function callback.');
    const duration = normalizeDelay(delay, repeating);
    const timer = { id: allocateID(), callback, args, repeating, delay: duration,
      remaining: duration, dueAt: 0, handle: null, generation: 0, executing: false };
    timers.set(timer.id, timer);
    arm(timer);
    return timer.id;
  }
  function cancel(id) {
    const timer = timers.get(id);
    if (!timer) return;
    timers.delete(id);
    timer.generation++;
    if (timer.handle !== null) nativeClearTimeout(timer.handle);
    timer.handle = null;
  }
  function pause() {
    if (paused) return;
    paused = true;
    const pausedAt = now();
    for (const timer of timers.values()) {
      if (timer.handle === null) continue;
      timer.remaining = Math.max(0, timer.dueAt - pausedAt);
      timer.generation++;
      nativeClearTimeout(timer.handle);
      timer.handle = null;
    }
  }
  function resume() {
    if (!paused) return;
    paused = false;
    for (const timer of timers.values()) arm(timer);
  }
  window.BBGameTimers = Object.freeze({
    setTimeout(callback, delay = 0, ...args) { return create(callback, delay, false, args); },
    clearTimeout: cancel,
    setInterval(callback, delay = 0, ...args) { return create(callback, delay, true, args); },
    clearInterval: cancel,
    pause,
    resume,
    isPaused() { return paused; }
  });
})();
